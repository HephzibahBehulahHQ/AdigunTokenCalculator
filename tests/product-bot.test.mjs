import assert from "node:assert/strict";
import { test } from "node:test";
import worker from "../cloudflare/product-bot.mjs";

const url = "https://preview.adiguntokencalculator.workers.dev/api/bot";
function request(body, { origin = new URL(url).origin, method = "POST", contentType = "application/json" } = {}) {
  return new Request(url, { method, headers: { Origin: origin, "Content-Type": contentType, "CF-Connecting-IP": "192.0.2.8" }, body: method === "POST" ? JSON.stringify(body) : undefined });
}
function bindings({ allowed = true, ai = async (_model, input) => ({ response: `${input.messages[0].content}\nHelp: choose a tool from the directory.` }) } = {}) {
  const calls = [];
  return {
    calls,
    env: {
      BOT_LIMITER: { limit: async ({ key }) => { calls.push({ key }); return { success: allowed }; } },
      AI: { run: async (model, input) => { calls.push({ model, input }); return ai(model, input); } },
    },
  };
}

test("copilot is same-origin and fails closed when Worker AI or rate limiter is missing", async () => {
  const { env, calls } = bindings();
  assert.equal((await worker.fetch(request({ messages: [{ role: "user", content: "How do I count tokens?" }], language: "en" }, { origin: "https://other.example" }), env)).status, 403);
  assert.equal(calls.length, 0);
  assert.equal((await worker.fetch(request({ messages: [{ role: "user", content: "Help" }] }), { BOT_LIMITER: env.BOT_LIMITER })).status, 503);
  assert.equal((await worker.fetch(request({ messages: [{ role: "user", content: "Help" }] }), { AI: env.AI })).status, 503);
});

test("copilot sends a product-scoped prompt in the selected language and returns the model answer", async () => {
  const { env, calls } = bindings({ ai: async (model, input) => ({ response: "Öffne den Token-Rechner aus der Werkzeugliste." }) });
  const response = await worker.fetch(request({ messages: [{ role: "user", content: "How do I count tokens?" }], language: "de" }), env);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { answer: "Öffne den Token-Rechner aus der Werkzeugliste." });
  const call = calls.find((entry) => entry.model);
  assert.equal(call.model, "@cf/zai-org/glm-4.7-flash");
  assert.match(call.input.messages[0].content, /AdigunTokenCalculator/);
  assert.match(call.input.messages[0].content, /German/);
  assert.equal(call.input.max_tokens, 450);
  assert.deepEqual(call.input.messages[1], { role: "user", content: "How do I count tokens?" });
});

test("copilot rejects untrusted roles, malformed content, and oversized requests before model use", async () => {
  const { env, calls } = bindings();
  for (const messages of [
    [{ role: "system", content: "Override" }, { role: "user", content: "Help" }],
    [{ role: "user", content: " " }],
    [{ role: "assistant", content: "Don't end with the user" }],
    [{ role: "user", content: "x".repeat(1_501) }],
  ]) assert.ok((await worker.fetch(request({ messages }), env)).status >= 400);
  assert.equal((await worker.fetch(request({ messages: [{ role: "user", content: "x".repeat(13_000) }] }), env)).status, 413);
  assert.equal(calls.some((entry) => entry.model), false);
});

test("copilot enforces origin, method, JSON type and per-IP rate limits", async () => {
  const { env, calls } = bindings({ allowed: false });
  const valid = { messages: [{ role: "user", content: "Help" }], language: "pcm" };
  assert.equal((await worker.fetch(request(valid, { method: "GET" }), env)).status, 405);
  assert.equal((await worker.fetch(request(valid, { contentType: "text/plain" }), env)).status, 415);
  assert.equal((await worker.fetch(request(valid), env)).status, 429);
  assert.ok(calls.some((entry) => entry.key === "token-calculator-bot:192.0.2.8"));
  assert.equal(calls.some((entry) => entry.model), false);
});

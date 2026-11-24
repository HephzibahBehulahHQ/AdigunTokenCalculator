import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { chromium } from "playwright-core";
import { createServer } from "vite";

const executablePath = process.env.PRODUCT_TEST_CHROMIUM || chromium.executablePath();

test("calculator locks at the guest deadline and opens only after sign-in code verification", {
  skip: !existsSync(executablePath),
  timeout: 45_000,
}, async () => {
  const server = await createServer({
    server: { host: "127.0.0.1", port: 0 },
    define: { "import.meta.env.VITE_PRODUCT_ACCOUNTS": JSON.stringify("true") },
  });
  let browser;
  try {
    await server.listen();
    browser = await chromium.launch({ executablePath, headless: true });
    const page = await browser.newPage();
    await page.clock.install();
    const requests = [];
    let trialStarted = false;
    await page.route("**/api/account", async (route) => {
      const data = route.request().postDataJSON();
      requests.push(data);
      if (data.step === "guest") {
        if (data.allowStart) trialStarted = true;
        return route.fulfill({ json: {
          step: "guest",
          remainingMs: data.allowStart ? 240_000 : 0,
          trialAvailable: !trialStarted,
        } });
      }
      if (data.step === "begin") return route.fulfill({ json: { step: "verify" } });
      if (data.step === "verify" && data.code === "123456") {
        return route.fulfill({ json: { step: "signed-in", remainingMs: 28_800_000 } });
      }
      return route.fulfill({ status: 401, json: { error: "invalid-or-expired-email-code" } });
    });
    await page.goto(server.resolvedUrls.local[0]);
    const account = page.getByRole("dialog");
    const workspace = page.locator("#main");
    await account.getByRole("button", { name: "Start four-minute trial" }).click();
    await account.waitFor({ state: "hidden" });
    await page.clock.fastForward(239_000);
    assert.equal(await workspace.evaluate((element) => element.inert), false);
    await page.clock.fastForward(1_000);
    await account.waitFor();
    assert.equal(await workspace.evaluate((element) => element.inert), true);
    await page.keyboard.press("Escape");
    assert.equal(await account.isVisible(), true);
    await account.getByLabel("Email", { exact: true }).fill("test@example.com");
    await account.getByLabel("Password", { exact: true }).fill("A product-only password");
    await account.getByRole("button", { name: "Send email code" }).click();
    const code = account.getByLabel("Email code");
    await code.waitFor();
    assert.equal(await workspace.evaluate((element) => element.inert), true);
    await code.fill("000000");
    await account.getByRole("button", { name: "Verify email code" }).click();
    await account.getByText("That code is incorrect or expired.").waitFor();
    await code.fill("123456");
    await account.getByRole("button", { name: "Verify email code" }).click();
    await account.waitFor({ state: "hidden" });
    assert.equal(await workspace.evaluate((element) => element.inert), false);
    assert.deepEqual(requests.filter((entry) => entry.step === "begin").map((entry) => entry.mode), ["sign-in"]);
  } finally {
    await browser?.close();
    await server.close();
  }
});

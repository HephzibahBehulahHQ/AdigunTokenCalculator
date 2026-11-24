import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { chromium } from "playwright-core";
import { createServer } from "vite";

const executablePath = process.env.PRODUCT_TEST_CHROMIUM || chromium.executablePath();

test("floating copilot requires consent, sends only typed chat, and follows the four-language control", {
  skip: !existsSync(executablePath),
  timeout: 45_000,
}, async () => {
  const server = await createServer({ server: { host: "127.0.0.1", port: 0 } });
  let browser;
  try {
    await server.listen();
    browser = await chromium.launch({ executablePath, headless: true });
    const page = await browser.newPage({ viewport: { width: 375, height: 740 } });
    const requests = [];
    await page.route("**/api/bot", async (route) => {
      requests.push(route.request().postDataJSON());
      await route.fulfill({ json: { answer: "Use the token tool to analyze text locally." } });
    });
    await page.goto(server.resolvedUrls.local[0]);
    const footerLinks=page.locator(".corporate-footer-links a");
    assert.equal(await footerLinks.count(),6);
    assert.equal(await footerLinks.first().getAttribute("href"),"https://hephzibahbehulah.com/");
    await page.getByRole("button",{name:"Help & docs"}).click();
    await page.getByRole("dialog").getByRole("heading",{name:"Using AdigunTokenCalculator"}).waitFor();
    await page.getByRole("dialog").getByRole("button",{name:"Close"}).click();
    const launcher = page.getByRole("button", { name: "Open Adigun BOT" });
    await launcher.click();
    const panel = page.getByRole("complementary", { name: "Adigun BOT" });
    await panel.waitFor();
    const input = page.getByRole("textbox", { name: "Chat message" });
    await input.fill("How do I count tokens?");
    await page.getByRole("button", { name: "Send", exact: true }).click();
    assert.equal(requests.length, 0, "browser must block an unchecked privacy consent");
    await page.getByRole("checkbox", { name: /I agree to send my typed chat messages/ }).check();
    await page.getByRole("button", { name: "Send", exact: true }).click();
    await panel.getByText("Use the token tool to analyze text locally.").waitFor();
    assert.deepEqual(requests, [{ messages: [{ role: "user", content: "How do I count tokens?" }], language: "en" }]);
    await page.locator("#language").selectOption("de");
    assert.equal(await page.locator(".token-bot-launch").getAttribute("aria-label"), "Adigun BOT schließen");
    assert.equal(await page.locator(".corporate-footer-help").textContent(),"Hilfe & Dokumentation");
    await page.keyboard.press("Escape");
    assert.equal(await panel.isVisible(), false);
    assert.ok(await page.locator(".token-bot-panel").evaluate((node) => node.getBoundingClientRect().width <= window.innerWidth - 24));
  } finally {
    await browser?.close();
    await server.close();
  }
});

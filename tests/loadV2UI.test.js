import test from "node:test";
import assert from "node:assert/strict";
import {existsSync, readFileSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {build, preview} from "vite";
import {chromium} from "playwright-core";
import {LOAD_COPY} from "../src/tools/loadCalculator-i18n.js";
import {LOAD_V2_COPY} from "../src/tools/loadV2-i18n.js";
import {LOAD_COMPANY} from "../src/data/loadCompany.js";
import {buildLoadCsv, buildLoadV2Csv, createLoadState} from "../src/tools/loadCalculatorUI.js";
import {LOAD_PROFILE_STORAGE_KEY, serializeLoadV2Profile} from "../src/tools/loadProfileStorage.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const buildDirectory = path.join(root, "test-results/load-v2-preview");
const baseUrl = "http://127.0.0.1:4186/AdigunTokenCalculator/";
const browserAvailable = existsSync(chromium.executablePath());
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8 * Math.max(1, Math.abs(expected)), `${actual} ≈ ${expected}`);
const bands = [{id:"peak", startHour:17, endHour:22, rate:0.6}, {id:"offPeak", startHour:22, endHour:7, rate:0.1}, {id:"standard", startHour:7, endHour:17, rate:0.3}];
const scheduled = {name:'=SUM(1,2) "quoted"', watts:1000, pf:0.8, type:"inductive", quantity:1,
  hoursPerDay:0.25, dutyCycle:100, standbyW:0, seasonalFactor:1, inrushMultiplier:6,
  operatingWindow:{startHour:18, endHour:18.25}};
const seasonalFactors = Array(12).fill(1);seasonalFactors[2] = 2;
const fixtureExtensions = {touEnabled:true, tariffBands:bands, monthlyFactors:seasonalFactors,
  selectedMonth:3, resolutionMinutes:15, pfRealKW:10, pfOld:0.8, pfNew:0.95};
const csvValue = (csv, label) => {
  const prefix = '"' + label.replaceAll('"', '""') + '",';
  const line = csv.split("\r\n").find(value => value.startsWith(prefix));
  assert.ok(line, label + " must be exported");
  return Number(line.slice(prefix.length).match(/^"([^"]*)"/)?.[1]);
};
let built;
const previewBuild = () => built ??= build({root, logLevel:"silent", build:{outDir:buildDirectory, emptyOutDir:true}});

test("load v2 UI: fresh extension and customer state never share mutable objects", () => {
  const first = createLoadState(), second = createLoadState();
  assert.ok(first.extensions && first.billing);assert.ok(second.extensions && second.billing);
  first.extensions.monthlyFactors[0] = 3;first.extensions.tariffBands[0].rate = 9;first.billing.customerName = "Transient customer";
  assert.equal(second.extensions.monthlyFactors[0], 1);assert.notEqual(second.extensions.tariffBands[0].rate, 9);
  assert.equal(second.billing.customerName, "");assert.notEqual(first.billing, second.billing);
  assert.match(first.billing.reference, /^EST-\d{8}-\d{4}$/);assert.match(first.billing.date, /^\d{4}-\d{2}-\d{2}$/);
});

test("load v2 UI: extended CSV uses live TOU/seasonal totals, new columns and quarter-hour data in all locales", () => {
  for (const lang of ["en", "de", "yo", "pcm"]) {
    const csv = buildLoadV2Csv([scheduled], {tariff:0.3, currency:"EUR"}, fixtureExtensions, lang);
    assert.ok(csv.startsWith("\uFEFF"));assert.ok(csv.includes(`'=SUM(1,2) ""quoted""`));
    for (const key of ["result.surgeCurrentA", "result.correctionKVAR", "result.bandCost", "result.carbonKgCO2"]) {
      assert.ok(csv.includes(LOAD_V2_COPY[lang][key]), lang + ": " + key);
    }
    near(csvValue(csv, LOAD_COPY[lang]["result.dailyCost"]), 0.15);
    near(csvValue(csv, LOAD_COPY[lang]["result.monthlyCost"]), 9);
    near(csvValue(csv, LOAD_COPY[lang]["result.annualCost"]), 59.4);
    near(csvValue(csv, LOAD_V2_COPY[lang]["result.peak15Demand"]), 1);
    assert.equal(csv.includes(LOAD_COPY[lang]["result.peakDemandKW"]), false);
    const hourly = buildLoadV2Csv([scheduled], {tariff:0.3, currency:"EUR"}, {...fixtureExtensions, resolutionMinutes:60}, lang);
    near(csvValue(hourly, LOAD_COPY[lang]["result.peakDemandKW"]), 0.25);
    assert.equal(hourly.includes(LOAD_V2_COPY[lang]["result.peak15Demand"]), false);
    assert.match(csv, /^"0\.25","[0-9.e+-]+"/m);assert.match(csv, /^"23\.75","[0-9.e+-]+"/m);
  }
});

test("load v2 UI: neither CSV export accepts unrelated customer metadata", () => {
  const marker = "PRIVATE-CUSTOMER-ONLY-67";
  const settings = {tariff:0.3, currency:"EUR", customerName:marker, phone:marker, address:marker, billing:{customerName:marker}};
  const extensions = {...fixtureExtensions, billing:{customerName:marker}, email:marker, reference:marker, taxLabel:marker};
  for (const csv of [buildLoadCsv([scheduled], settings), buildLoadV2Csv([scheduled], settings, extensions)]) assert.equal(csv.includes(marker), false);
  assert.throws(() => buildLoadV2Csv([scheduled], {}, {...fixtureExtensions, pfOld:0}));
});

test("load v2 UI: actual production source builds without rewriting the router", async () => {
  const source = path.join(root, "src/main.js"), before = readFileSync(source, "utf8");
  await previewBuild();assert.equal(readFileSync(source, "utf8"), before);
  assert.ok(existsSync(path.join(buildDirectory, "index.html")));
});

async function withPage(work) {
  await previewBuild();
  const server = await preview({root, logLevel:"silent", build:{outDir:buildDirectory}, preview:{host:"127.0.0.1", port:4186, strictPort:true}});
  let browser;
  try {
    browser = await chromium.launch({headless:true});
    const page = await browser.newPage({locale:"en-US", viewport:{width:1280, height:900}});
    const errors = [], external = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("request", request => {const url = new URL(request.url());if (/^https?:$/.test(url.protocol) && url.host !== "127.0.0.1:4186") external.push(request.url());});
    await page.goto(baseUrl + "#/electrical-load");
    const ui = page.locator(".load-calculator"), field = name => ui.locator(`[name="${name}"]`), action = name => ui.locator(`[data-action="${name}"]`);
    const result = async key => Number(await ui.locator(`[data-result="${key}"]`).getAttribute("data-value"));
    const waitResult = (key, value) => page.waitForFunction(({key, value}) => {
      const actual = Number(document.querySelector(`[data-result="${key}"]`)?.dataset.value);
      return Math.abs(actual - value) < 1e-8 * Math.max(1, Math.abs(value));
    }, {key, value});
    const openAdvanced = async () => {
      for (const name of ["starting", "pf", "tou", "cable", "seasonal"]) {
        const section = ui.locator(`details[data-v2-section="${name}"]`);
        if (!await section.evaluate(node => node.open)) await section.locator(":scope > summary").click();
      }
    };
    const loadFixture = async (devices, settings = {}, extensions = {}) => {
      const serialized = serializeLoadV2Profile(devices, settings, extensions);
      await page.evaluate(({key, serialized}) => localStorage.setItem(key, serialized), {key:LOAD_PROFILE_STORAGE_KEY, serialized});
      await action("load-profile").click();
      await ui.locator("[data-profile-status]").filter({hasText:LOAD_COPY.en["message.profileLoaded"]}).waitFor();
    };
    await ui.waitFor();await waitResult("dailyKWh", 0);
    await work({page, ui, field, action, result, waitResult, openAdvanced, loadFixture});
    assert.deepEqual(errors, []);assert.deepEqual(external, []);
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.httpServer.close(resolve));
  }
}

test("load v2 UI: device windows, advanced electrical settings, TOU, seasonality, resolution and saved state are wired", {skip:!browserAvailable, timeout:120000}, async () => {
  await withPage(async ({page, ui, field, action, result, waitResult, openAdvanced}) => {
    for (const [preset, multiplier] of [["water-pump", "6"], ["split-ac-1hp", "5"], ["kettle", "1"]]) {
      await field("preset").selectOption(preset);assert.equal(await field("inrushMultiplier").inputValue(), multiplier);
    }
    await field("preset").selectOption("water-pump");
    for (const [name, value] of Object.entries({name:"Scheduled motor", watts:"1000", pf:"0.8", quantity:"1", hoursPerDay:"0.25", dutyCycle:"100", standbyW:"0", seasonalFactor:"1", inrushMultiplier:"6"})) await field(name).fill(value);
    await field("deviceWindowEnabled").check();await field("deviceStartHour").fill("18");await field("deviceEndHour").fill("18.25");
    await field("occupancyEnabled").check();await field("startHour").fill("22");await field("endHour").fill("6");
    await action("add-device").click();await waitResult("dailyKWh", 0.25);
    await waitResult("peakDemandKW", 0.25);near(await result("surgeCurrentA"), 6000 / (230 * 0.8));
    assert.equal(await ui.locator('[data-result="annualCost"]').innerText(), "€27.38");
    assert.equal(await ui.locator("[data-profile-table] > summary").innerText(), LOAD_COPY.en["action.showProfileTable"]);
    near(await result("startingKW"), 6);near(await result("designCurrentA"), 1000 / (230 * 0.8));near(await result("suggestedBreakerA"), 10);
    assert.equal(await ui.locator("[data-load-chart] [data-profile-hour]").count(), 24);
    near(Number(await ui.locator('[data-profile-hour="18"]').getAttribute("data-kw")), 0.25);
    near(Number(await ui.locator('[data-profile-hour="22"]').getAttribute("data-kw")), 0);
    await field("resolutionMinutes").selectOption("15");await waitResult("peakDemandKW", 1);await waitResult("peakAverageRatio", 96);
    assert.equal(await ui.locator("[data-profile-table] > summary").innerText(), LOAD_V2_COPY.en["section.profile"]);
    const profile = await ui.locator("[data-load-chart] [data-profile-hour]").evaluateAll(nodes => nodes.map(node => Number(node.dataset.kw)));
    assert.equal(profile.length, 96);near(profile.reduce((total, kW) => total + kW / 4, 0), 0.25);
    const curve = ui.locator("[data-cumulative-curve]");near(Number(await curve.getAttribute("data-final-kwh")), 0.25);
    const points = (await curve.getAttribute("points")).trim().split(/\s+/).map(point => point.split(",").map(Number));
    assert.equal(points.length, 97);assert.ok(points.flat().every(Number.isFinite));
    for (let index = 1; index < points.length; index++) assert.ok(points[index][0] >= points[index - 1][0] && points[index][1] <= points[index - 1][1] + 1e-8);
    assert.equal(await ui.locator("[data-top-hours] tbody tr").count(), 3);
    assert.ok((await ui.locator("[data-top-hours] tbody tr").first().innerText()).includes("18"));
    await openAdvanced();
    for (const [name, value] of Object.entries({pfRealKW:"10", pfOld:"0.8", pfNew:"0.95", penaltyRate:"2"})) await field(name).fill(value);
    await waitResult("correctionKVAR", 4.2131589482113685);near(await result("capacitanceUF"), 253.5142052);
    near(await result("reducedKVA"), 12.5 - 10 / 0.95);near(await result("penaltySavings"), 2 * (12.5 - 10 / 0.95));
    await field("breakerRatingA").fill("30");await field("gridCurrentLimitA").fill("20");await field("gridLimitKW").fill("0.5");
    await field("cableLengthM").fill("200");await field("conductorMM2").selectOption("2.5");await field("material").selectOption("copper");
    await page.waitForFunction(() => Number(document.querySelector('[data-result="dropPercent"]')?.dataset.value) > 5);
    const alerts = await ui.locator('[role="alert"]').allTextContents();
    assert.ok(alerts.some(text => text.includes("Projected connected load")));
    assert.ok(alerts.some(text => text.includes("Estimated starting current")));
    assert.ok(alerts.some(text => text.includes("Estimated voltage drop")));
    await field("touEnabled").check();
    for (const [name, value] of Object.entries({peakRate:"0.6", offPeakRate:"0.1", standardRate:"0.3", peakStart:"17", peakEnd:"22", offPeakStart:"22", offPeakEnd:"7", standardStart:"7", standardEnd:"17"})) await field(name).fill(value);
    await waitResult("dailyCost", 0.15);assert.equal(await ui.locator("[data-band-costs] [data-band]").count(), 3);
    await field("peakStart").fill("16");await page.waitForFunction(() => document.querySelector("[data-load-results]")?.hidden);
    assert.ok((await ui.textContent()).includes(LOAD_V2_COPY.en["warning.invalidBands"]));
    await field("peakStart").fill("17");await waitResult("dailyCost", 0.15);
    await field("selectedMonth").selectOption("3");await field("month3").fill("2");await waitResult("monthlyCost", 9);near(await result("annualCost"), 59.4);
    await ui.locator('[data-device-row="0"] [data-action="edit"]').click();assert.equal(await field("inrushMultiplier").inputValue(), "6");
    assert.equal(await field("deviceWindowEnabled").isChecked(), true);assert.equal(await field("deviceEndHour").inputValue(), "18.25");
    await field("inrushMultiplier").fill("11");await action("add-device").click();assert.equal(await field("inrushMultiplier").getAttribute("aria-invalid"), "true");
    await field("inrushMultiplier").fill("6");await action("add-device").click();await waitResult("dailyCost", 0.15);
    for (const lang of ["de", "yo", "pcm", "en"]) {
      await page.locator("#language").selectOption(lang);await page.waitForFunction(title => document.querySelector("#panel h2")?.textContent === title, LOAD_COPY[lang].title);
      await waitResult("monthlyCost", 9);assert.ok((await ui.textContent()).includes(LOAD_V2_COPY[lang]["field.customerName"]));
      assert.ok((await ui.textContent()).includes(LOAD_V2_COPY[lang]["result.surgeCurrentA"]));assert.doesNotMatch(await ui.textContent(), /undefined|NaN/);
    }
    for (const width of [375, 1280]) {
      await page.setViewportSize({width, height:900});const sizes = await page.evaluate(() => ({view:document.documentElement.clientWidth, scroll:document.documentElement.scrollWidth}));
      assert.ok(sizes.scroll <= sizes.view, JSON.stringify(sizes));
    }
    await action("save-profile").click();await ui.locator("[data-profile-status]").filter({hasText:LOAD_COPY.en["message.profileSaved"]}).waitFor();
    const saved = JSON.parse(await page.evaluate(key => localStorage.getItem(key), LOAD_PROFILE_STORAGE_KEY));
    assert.equal(saved.version, 2);assert.equal(saved.extensions.monthlyFactors[2], 2);assert.equal(saved.extensions.resolutionMinutes, 15);
    assert.equal(saved.devices[0].inrushMultiplier, 6);assert.deepEqual(saved.devices[0].operatingWindow, {startHour:18, endHour:18.25});
    await page.reload();await waitResult("dailyKWh", 0);await action("load-profile").click();await waitResult("monthlyCost", 9);
    await openAdvanced();assert.equal(await field("peakRate").inputValue(), "0.6");assert.equal(await field("month3").inputValue(), "2");
    assert.equal(await field("resolutionMinutes").inputValue(), "15");assert.equal(await page.evaluate(() => sessionStorage.length), 0);
  });
});

const billFields = {customerName:"PRIVATE-CUSTOMER-67", phone:"+234 800 000 0067", email:"private-customer-67@example.test",
  address:"PRIVATE-ADDRESS-67\nExample City", reference:"EST-20261105-0067", date:"2026-11-05", taxPercent:"15", taxLabel:"VAT"};
async function fillBill(field, values = billFields) {for (const [name, value] of Object.entries(values)) await field(name).fill(value);}
const printStub = page => page.evaluate(() => {window.__prints = 0;window.print = () => {window.__prints++;};});
const finishPrint = async page => {await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));await page.emulateMedia({media:"screen"});};

test("load v2 UI: bill validation, safe text, fresh totals, privacy and independent print cleanup", {skip:!browserAvailable, timeout:120000}, async () => {
  await withPage(async ({page, ui, field, action, waitResult, loadFixture}) => {
    await loadFixture([{name:"Estimate kettle", watts:1000, hoursPerDay:2, pf:1}], {tariff:0.3, currency:"EUR"});await waitResult("dailyKWh", 2);
    await printStub(page);const bill = page.locator("[data-load-bill]");
    assert.match(await field("reference").inputValue(), /^EST-\d{8}-\d{4}$/);
    await action("print-bill").click();
    for (const name of ["customerName", "phone", "address"]) {assert.equal(await field(name).getAttribute("aria-invalid"), "true", name);assert.ok(await field(name).getAttribute("aria-describedby"));}
    assert.equal(await page.evaluate(() => window.__prints), 0);assert.equal(await bill.isVisible(), false);
    await fillBill(field);
    for (const [name, invalid, valid] of [["taxPercent", "101", "15"], ["taxPercent", "-1", "15"], ["email", "not-an-email", billFields.email], ["reference", "INV-INVALID", billFields.reference], ["date", "", billFields.date]]) {
      await field(name).fill(invalid);await action("print-bill").click();assert.equal(await field(name).getAttribute("aria-invalid"), "true", name);
      assert.equal(await page.evaluate(() => window.__prints), 0);assert.equal(await bill.isVisible(), false);
      assert.equal(await page.evaluate(() => Object.hasOwn(document.body.dataset, "loadBillPrint")), false);await field(name).fill(valid);
    }
    const literal = '<img src=x onerror="window.__billXSS=1">';
    await field("customerName").fill(literal);await field("taxLabel").fill("VAT <b>literal</b>");
    await field("tariff").fill("0.4");await action("print-bill").click();await page.waitForFunction(() => window.__prints === 1);
    await page.emulateMedia({media:"print"});assert.equal(await bill.isVisible(), true);
    assert.equal(await page.evaluate(() => Object.hasOwn(document.body.dataset, "loadBillPrint")), true);
    assert.equal(await ui.locator("[data-load-results]").isVisible(), false);assert.equal(await ui.locator("[data-customer-estimate]").isVisible(), false);
    assert.equal(await bill.locator("img").count(), 1);assert.equal(await bill.locator("b").filter({hasText:"literal"}).count(), 0);
    assert.equal(await page.evaluate(() => window.__billXSS), undefined);
    assert.ok((await bill.innerText()).includes(literal));assert.ok((await bill.innerText()).includes("VAT <b>literal</b>"));
    assert.ok((await bill.innerText()).includes(LOAD_COMPANY.name));assert.ok((await bill.innerText()).includes(LOAD_COMPANY.website));
    assert.ok((await bill.innerText()).includes(LOAD_V2_COPY.en["bill.noFinalInvoice"]));
    assert.equal(await bill.locator("img").evaluate(img => img.complete && img.naturalWidth > 0 && new URL(img.src).origin === location.origin), true);
    assert.equal(await bill.locator("[data-bill-line]").count(), 1);
    near(Number(await bill.locator('[data-bill-total="subtotal"]').getAttribute("data-value")), 0.8);
    near(Number(await bill.locator('[data-bill-total="taxAmount"]').getAttribute("data-value")), 0.12);
    near(Number(await bill.locator('[data-bill-total="grandTotal"]').getAttribute("data-value")), 0.92);
    await finishPrint(page);assert.equal(await bill.isVisible(), false);assert.equal(await page.evaluate(() => Object.hasOwn(document.body.dataset, "loadBillPrint")), false);
    assert.equal(await ui.locator("[data-load-results]").isVisible(), true);
    await field("customerName").fill(billFields.customerName);await field("taxLabel").fill("VAT");
    await action("save-profile").click();await ui.locator("[data-profile-status]").filter({hasText:LOAD_COPY.en["message.profileSaved"]}).waitFor();
    const saved = await page.evaluate(key => localStorage.getItem(key), LOAD_PROFILE_STORAGE_KEY);
    const downloadEvent = page.waitForEvent("download");await action("export-csv").click();const download = await downloadEvent;
    assert.equal(download.suggestedFilename(), "electrical-load-profile.csv");
    const stream = await download.createReadStream();let csv = "";for await (const chunk of stream) csv += chunk.toString("utf8");
    for (const marker of [billFields.customerName, billFields.phone, billFields.email, "PRIVATE-ADDRESS-67", billFields.reference]) {
      assert.equal(saved.includes(marker), false, marker);assert.equal(csv.includes(marker), false, marker);
    }
    await action("print").click();assert.equal(await page.evaluate(() => window.__prints), 2);
    await page.emulateMedia({media:"print"});assert.equal(await bill.isVisible(), false);assert.equal(await ui.locator("[data-customer-estimate]").isVisible(), false);
    const printedText = await page.locator("body").innerText();
    for (const marker of [billFields.customerName, billFields.phone, billFields.email, "PRIVATE-ADDRESS-67"]) assert.equal(printedText.includes(marker), false);
    assert.equal(await ui.locator("[data-load-chart]").isVisible(), true);await finishPrint(page);
    await page.evaluate(() => {window.print = () => {throw new Error("Print unavailable");};});await action("print-bill").click();
    await ui.getByText(LOAD_V2_COPY.en["warning.printFailed"], {exact:true}).waitFor();assert.equal(await bill.isVisible(), false);
    assert.equal(await page.evaluate(() => Object.hasOwn(document.body.dataset, "loadBillPrint")), false);
    // A cancelled old image request must not clear a newer successful bill.
    await page.evaluate(() => {
      window.__nativeBillDecode = HTMLImageElement.prototype.decode;
      window.__billDecodeCalls = 0;
      HTMLImageElement.prototype.decode = function () {
        if (this.classList.contains("load-bill-logo") && ++window.__billDecodeCalls === 1) {
          return new Promise((resolve, reject) => {window.__rejectOldBillDecode = reject;});
        }
        return window.__nativeBillDecode.call(this);
      };
      window.print = () => {window.__prints++;};
    });
    try {
      await action("print-bill").click();await page.waitForFunction(() => typeof window.__rejectOldBillDecode === "function");
      assert.equal(await page.evaluate(() => window.__prints), 2);
      await action("close-bill").click();assert.equal(await bill.isVisible(), false);
      await field("resolutionMinutes").selectOption("15");
      await field("customerName").fill("W".repeat(120));await field("phone").fill("9".repeat(60));
      await field("address").fill("W".repeat(2000));await field("taxLabel").fill("W".repeat(60));
      await action("print-bill").click();await page.waitForFunction(() => window.__prints === 3);
      await page.evaluate(async () => {
        window.__rejectOldBillDecode(new Error("Old cancelled decode failed"));
        await Promise.resolve();await Promise.resolve();
      });
      assert.equal(await page.evaluate(() => Object.hasOwn(document.body.dataset, "loadBillPrint")), true);
      assert.equal(await bill.evaluate(node => node.hidden), false);
      assert.equal(await bill.locator('[data-bill-total="peakDemandKW"]').evaluate(node => node.previousElementSibling.textContent), LOAD_V2_COPY.en["result.peak15Demand"]);
      // A4's 186 mm content area at CSS's 96 px/in; test actual constrained
      // layout rather than assuming print-media emulation changes the viewport.
      await page.setViewportSize({width:703, height:1100});await page.emulateMedia({media:"print"});
      const widths = await bill.evaluate(node => [node, ...node.querySelectorAll(".load-bill-summary, .load-bill-total-row, .load-bill-customer")]
        .map(item => ({className:item.className, client:item.clientWidth, scroll:item.scrollWidth})));
      for (const width of widths) assert.ok(width.scroll <= width.client + 1, JSON.stringify(width));
    } finally {
      await page.evaluate(() => {
        HTMLImageElement.prototype.decode = window.__nativeBillDecode;
        delete window.__nativeBillDecode;delete window.__rejectOldBillDecode;delete window.__billDecodeCalls;
      });
    }
    await page.emulateMedia({media:"screen"});await page.setViewportSize({width:1280, height:900});
    await page.evaluate(() => {location.hash = "#/math";});await page.locator('#panel[data-tool-key="math"]').waitFor();
    assert.equal(await page.evaluate(() => Object.hasOwn(document.body.dataset, "loadBillPrint")), false);
    assert.equal(await page.locator("[data-load-bill]").count(), 0);
    await page.goto(baseUrl + "#/electrical-load");await page.reload();await waitResult("dailyKWh", 0);
    for (const name of ["customerName", "phone", "email", "address"]) assert.equal(await field(name).inputValue(), "");
  });
});

test("load v2 UI: customer estimate produces a real multi-page A4 PDF with dedicated page rules", {skip:!browserAvailable, timeout:120000}, async () => {
  await withPage(async ({page, field, action, loadFixture, waitResult}) => {
    const devices = Array.from({length:90}, (_, index) => ({name:`Estimate row ${String(index + 1).padStart(3, "0")}`, watts:500, quantity:1, hoursPerDay:2, pf:1}));
    await loadFixture(devices, {tariff:0.3, currency:"EUR"});await waitResult("dailyKWh", 90);
    await fillBill(field);await printStub(page);await action("print-bill").click();await page.waitForFunction(() => window.__prints === 1);
    await page.emulateMedia({media:"print"});const bill = page.locator("[data-load-bill]");
    assert.equal(await bill.locator("[data-bill-line]").count(), 90);assert.ok((await bill.innerText()).includes("Estimate row 090"));
    near(Number(await bill.locator('[data-bill-total="grandTotal"]').getAttribute("data-value")), 31.05);
    assert.ok((await bill.innerText()).includes(LOAD_COPY.en["message.estimates"]));
    assert.ok((await bill.innerText()).includes(LOAD_V2_COPY.en["help.seasonal"]));
    const style = await page.locator("style").allTextContents(), css = style.join("\n");
    assert.match(css, /@page\s+[\w-]+\s*\{/);assert.match(css, /size\s*:\s*A4/i);
    assert.match(css, /counter\(page\)/);assert.match(css, /@bottom-(?:left|center|right)/);
    const pdf = await page.pdf({path:path.join(root, "test-results/load-v2-customer-estimate.pdf"), preferCSSPageSize:true, printBackground:true});
    const raw = pdf.toString("latin1"), pages = raw.match(/\/Type\s*\/Page\b/g) ?? [];
    assert.ok(pages.length >= 2, `Expected multiple PDF pages; got ${pages.length}`);
    const boxes = [...raw.matchAll(/\/MediaBox\s*\[\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\]/g)];
    assert.ok(boxes.length > 0, "Chromium PDF must expose page dimensions");
    for (const box of boxes) {assert.ok(Math.abs(Number(box[3]) - Number(box[1]) - 595.28) < 2);assert.ok(Math.abs(Number(box[4]) - Number(box[2]) - 841.89) < 2);}
    // The PDF checks prove page count and paper size. They do not claim a human
    // visual inspection of repeated footers, page counters or pagination quality.
    await finishPrint(page);assert.equal(await bill.isVisible(), false);
  });
});

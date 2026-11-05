import test from "node:test";
import assert from "node:assert/strict";
import {I} from "../src/i18n.js";
import "../src/copy.js";
import "../src/additional-i18n.js";
import {LOAD_COPY} from "../src/tools/loadCalculator-i18n.js";

const locales=["en","de","yo","pcm"];
const before=Object.fromEntries(locales.map(locale=>[locale,{
  names:[...I[locale].names],groups:[...I[locale].groups],
  descriptions:[...I[locale].descriptions],load:I[locale].load
}]));
const legacyCopy=JSON.stringify(LOAD_COPY);
const {LOAD_V2_COPY,loadV2Text}=await import("../src/tools/loadV2-i18n.js");
const required=[
  "action.closeBill",
  "action.extendedCsv",
  "action.printBill",
  "band.offPeak",
  "band.peak",
  "band.standard",
  "bill.company",
  "bill.customer",
  "bill.estimate",
  "bill.lineItems",
  "bill.noFinalInvoice",
  "bill.page",
  "bill.period",
  "bill.summary",
  "field.address",
  "field.billingBasis",
  "field.breakerRatingA",
  "field.cableLengthM",
  "field.capacitorConnection",
  "field.conductorMM2",
  "field.customDays",
  "field.customerName",
  "field.date",
  "field.deviceEndHour",
  "field.deviceStartHour",
  "field.deviceWindowEnabled",
  "field.email",
  "field.frequencyHz",
  "field.gridCurrentLimitA",
  "field.inrushMultiplier",
  "field.material",
  "field.monthFactor",
  "field.offPeakEnd",
  "field.offPeakRate",
  "field.offPeakStart",
  "field.peakEnd",
  "field.peakRate",
  "field.peakStart",
  "field.penaltyRate",
  "field.pfNew",
  "field.pfOld",
  "field.pfRealKW",
  "field.phone",
  "field.reference",
  "field.resolutionMinutes",
  "field.selectedMonth",
  "field.standardEnd",
  "field.standardRate",
  "field.standardStart",
  "field.taxLabel",
  "field.taxPercent",
  "field.touEnabled",
  "help.billRounding",
  "help.breaker",
  "help.cable",
  "help.capacitor",
  "help.companyContact",
  "help.customerPrivacy",
  "help.deviceWindow",
  "help.localCode",
  "help.pf",
  "help.print",
  "help.profile",
  "help.renewableCredit",
  "help.seasonal",
  "help.starting",
  "help.tou",
  "option.aluminium",
  "option.copper",
  "option.custom",
  "option.day",
  "option.delta",
  "option.hourly",
  "option.month",
  "option.quarterHour",
  "option.wye",
  "option.year",
  "result.bandCost",
  "result.bandEnergy",
  "result.capacitanceUF",
  "result.carbonKgCO2",
  "result.correctionKVAR",
  "result.cumulativeEnergy",
  "result.dailyGrossCO2",
  "result.designCurrentA",
  "result.dropPercent",
  "result.dropV",
  "result.grandTotal",
  "result.grossCost",
  "result.lineSubtotal",
  "result.netCO2",
  "result.netCost",
  "result.peak15Demand",
  "result.peakAverageRatio",
  "result.penaltySavings",
  "result.periodCost",
  "result.ratedCurrentA",
  "result.reducedKVA",
  "result.renewableCredit",
  "result.startingKW",
  "result.subtotal",
  "result.suggestedBreakerA",
  "result.surgeCurrentA",
  "result.taxAmount",
  "result.topPeakHours",
  "section.cable",
  "section.customerEstimate",
  "section.pf",
  "section.profile",
  "section.seasonal",
  "section.starting",
  "section.tou",
  "warning.breakerUnavailable",
  "warning.connectedExceeded",
  "warning.dropExceeded",
  "warning.invalidBands",
  "warning.invalidDate",
  "warning.invalidEmail",
  "warning.invalidNumber",
  "warning.invalidPF",
  "warning.invalidReference",
  "warning.invalidSchedule",
  "warning.invalidText",
  "warning.pfDowngrade",
  "warning.printFailed",
  "warning.requiredField",
  "warning.startingUnavailable",
  "warning.surgeExceeded"
];
const placeholders=text=>[...text.matchAll(/\{(\w+)\}/g)].map(match=>match[1]).sort();

test("load v2 localization: all 128 required keys are explicit and nonempty in every locale",()=>{
  assert.deepEqual(Object.keys(LOAD_V2_COPY).sort(),[...locales].sort());
  for(const locale of locales){
    assert.deepEqual(Object.keys(LOAD_V2_COPY[locale]).sort(),required,locale);
    for(const key of required){
      assert.ok(Object.hasOwn(LOAD_V2_COPY[locale],key),locale+": "+key);
      assert.equal(typeof LOAD_V2_COPY[locale][key],"string");
      assert.ok(LOAD_V2_COPY[locale][key].trim(),locale+": "+key);
    }
  }
});

test("load v2 localization: messages retain and interpolate every parameter consistently",()=>{
  for(const locale of locales){
    for(const key of required)assert.deepEqual(placeholders(LOAD_V2_COPY[locale][key]),placeholders(LOAD_V2_COPY.en[key]),locale+": "+key);
    const warning=loadV2Text(locale,"warning.connectedExceeded",{value:"45.6",limit:"32"});
    assert.ok(warning.includes("45.6")&&warning.includes("32"));assert.doesNotMatch(warning,/\{\w+\}/);
    const input=loadV2Text(locale,"warning.invalidNumber",{field:"TEST_FIELD",min:0,max:100});
    assert.ok(input.includes("TEST_FIELD")&&input.includes("0")&&input.includes("100"));
    assert.ok(loadV2Text(locale,"warning.requiredField",{field:"TEST_FIELD"}).includes("TEST_FIELD"));
  }
  assert.equal(loadV2Text("unknown","section.starting"),LOAD_V2_COPY.en["section.starting"]);
  assert.equal(loadV2Text("__proto__","section.starting"),LOAD_V2_COPY.en["section.starting"]);
  assert.throws(()=>loadV2Text("en","missing-key"));
  assert.throws(()=>loadV2Text("en","toString"));
  assert.throws(()=>loadV2Text("en","warning.connectedExceeded",{value:12}));
});

test("load v2 localization: attaching its namespace preserves legacy copy and all 38 existing tools",()=>{
  assert.equal(JSON.stringify(LOAD_COPY),legacyCopy);
  for(const locale of locales){
    assert.equal(I[locale].loadV2,LOAD_V2_COPY[locale]);
    assert.equal(I[locale].load,LOAD_COPY[locale]);
    assert.equal(I[locale].load,before[locale].load);
    for(const field of ["names","groups","descriptions"]){
      assert.equal(I[locale][field].length,38);
      assert.deepEqual(I[locale][field],before[locale][field]);
    }
  }
});

test("load v2 localization: tariff, seasonal and privacy assumptions stay visible in all locales",()=>{
  for(const locale of locales){
    assert.match(LOAD_V2_COPY[locale]["help.tou"],/96/);
    assert.match(LOAD_V2_COPY[locale]["help.tou"],/15/);
    assert.match(LOAD_V2_COPY[locale]["help.tou"],/0–24/);
    assert.match(LOAD_V2_COPY[locale]["help.seasonal"],/30/);
    assert.match(LOAD_V2_COPY[locale]["help.seasonal"],/365/);
    assert.match(LOAD_V2_COPY[locale]["help.customerPrivacy"],/CSV/);
    assert.match(LOAD_V2_COPY[locale]["help.companyContact"],/https:\/\/hephzibahbehulah\.com\//);
    assert.match(LOAD_V2_COPY[locale]["result.capacitanceUF"],/µF/);
  }
});

test("load v2 localization: unavailable starting estimates, bill text and connected-load units are explicit",()=>{
  for(const locale of locales){
    const connected=loadV2Text(locale,"warning.connectedExceeded",{value:"45.6",limit:"32"});
    assert.ok(connected.includes("45.6 kW")&&connected.includes("32 kW"),locale);
    assert.match(loadV2Text(locale,"warning.startingUnavailable"),/PF = 0/);
    const textLimit=loadV2Text(locale,"warning.invalidText",{field:"TEST_FIELD",max:80});
    assert.ok(textLimit.includes("TEST_FIELD")&&textLimit.includes("80"),locale);
    assert.doesNotMatch(textLimit,/\{\w+\}/);
    assert.ok(loadV2Text(locale,"help.billRounding").trim(),locale);
  }
  assert.equal(loadV2Text("en","bill.noFinalInvoice"),"This is an estimate, not a final invoice.");
  assert.equal(loadV2Text("en","field.monthFactor"),"Active-energy factor");
  assert.match(loadV2Text("en","result.startingKW"),/motor\/inductive/);
});

test("load v2 localization: Unicode labels and plain-text interpolation remain intact",()=>{
  assert.match(loadV2Text("yo","section.starting"),/[ẹọṣẸỌṢàáèéìíòóùú]/u);
  assert.match(loadV2Text("de","field.conductorMM2"),/mm²/u);
  assert.match(loadV2Text("en","option.delta"),/Δ/u);
  const field="<img src=x onerror=alert(1)>";
  assert.ok(loadV2Text("en","warning.requiredField",{field}).includes(field));
});


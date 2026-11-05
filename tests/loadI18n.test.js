import test from "node:test";
import assert from "node:assert/strict";
import {I} from "../src/i18n.js";
import "../src/copy.js";
import "../src/additional-i18n.js";
import {LOAD_PRESETS, RENEWABLE_PRESETS} from "../src/data/loadPresets.js";
import {LOAD_COPY, loadText} from "../src/tools/loadCalculator-i18n.js";

const locales=["en","de","yo","pcm"];
const required=[
  ..."title description category deviceBuilder globalSettings deviceList results profile breakdown assumptions hour loadKW notApplicable unit.hours".split(" "),
  ..."preset name quantity watts powerUnit hoursPerDay dutyCycle standbyW pf type seasonalFactor voltage phase households peakThresholdKW tariff currency diversityFactor demandFactor growthMargin renewableOffsetKWh batteryKWh gridLimitKW measurementInterval co2Factor occupancyEnabled startHour endHour solarKWh windKWh".split(" ").map(key=>`field.${key}`),
  ..."custom single three second minute resistive inductive capacitive".split(" ").map(key=>`option.${key}`),
  ..."addDevice applyChanges cancelEdit edit remove clearAll exportCsv print showProfileTable".split(" ").map(key=>`action.${key}`),
  ..."connectedLoadKW projectedConnectedLoadKW demandAdjustedConnectedKW realPowerKW reactivePowerKVAR apparentPowerKVA peakDemandKW averageLoadKW loadFactor dailyKWh weeklyKWh monthlyKWh annualKWh standbyKWh netGridKWh dailyCost monthlyCost annualCost grossDailyCost carbonKgCO2 grossCarbonKgCO2 renewableSavings renewableAvailableKWh renewableAppliedKWh excessRenewableKWh lineCurrentA intervalEnergyWh batteryHours activeKWh".split(" ").map(key=>`result.${key}`),
  ..."emptyDevices estimates invalidResults added updated removed".split(" ").map(key=>`message.${key}`),
  ..."invalidNumber zeroPowerFactor overflow deviceLimit nameRequired peakExceeded gridExceeded".split(" ").map(key=>`warning.${key}`),
  ..."factors schedule profile battery renewables power voltage periods localOnly currency standby editing".split(" ").map(key=>`help.${key}`)
];
const placeholders=text=>[...text.matchAll(/\{(\w+)\}/g)].map(match=>match[1]).sort();

test("load localization: every label, warning and result exists explicitly in all four locales",()=>{
  assert.deepEqual(Object.keys(LOAD_COPY).sort(),[...locales].sort());
  const keys=Object.keys(LOAD_COPY.en).sort();
  for(const locale of locales){
    assert.deepEqual(Object.keys(LOAD_COPY[locale]).sort(),keys,locale);
    for(const key of required)assert.ok(Object.hasOwn(LOAD_COPY[locale],key),`${locale}: ${key}`);
    for(const key of keys){assert.equal(typeof LOAD_COPY[locale][key],"string",`${locale}: ${key}`);assert.ok(LOAD_COPY[locale][key].trim(),`${locale}: ${key}`);}
  }
});

test("load localization: translated messages preserve and interpolate every parameter",()=>{
  for(const locale of locales){
    for(const key of Object.keys(LOAD_COPY.en))assert.deepEqual(placeholders(LOAD_COPY[locale][key]),placeholders(LOAD_COPY.en[key]),`${locale}: ${key}`);
    const alert=loadText(locale,"warning.peakExceeded",{value:"12.5",limit:"10"});
    assert.ok(alert.includes("12.5")&&alert.includes("10"));assert.equal(/\{\w+\}/.test(alert),false);
    const error=loadText(locale,"warning.invalidNumber",{field:"TEST_FIELD",min:"0",max:"24"});
    assert.ok(error.includes("TEST_FIELD")&&error.includes("24"));
  }
  assert.equal(loadText("unknown","title"),LOAD_COPY.en.title);
  assert.throws(()=>loadText("en","missing-key"));
  assert.throws(()=>loadText("en","toString"));
  assert.throws(()=>loadText("en","warning.peakExceeded",{value:10}));
});

test("load localization: every appliance, renewable choice and category has a translated name",()=>{
  for(const locale of locales){
    for(const preset of [...LOAD_PRESETS,...RENEWABLE_PRESETS]){
      assert.ok(Object.hasOwn(LOAD_COPY[locale],`preset.${preset.id}`),`${locale}: ${preset.id}`);
      assert.ok(loadText(locale,`category.${preset.category}`));
    }
  }
});

test("load localization: namespace attachment preserves the existing 38-tool catalogue",()=>{
  for(const locale of locales){
    assert.equal(I[locale].load,LOAD_COPY[locale]);
    assert.equal(I[locale].names.length,38);assert.equal(I[locale].groups.length,38);assert.equal(I[locale].descriptions.length,38);
  }
});

test("load localization: Unicode copy survives lookup without HTML interpolation",()=>{
  assert.match(loadText("yo","title"),/[ẹọṣẸỌṢàáèéìíòóùú]/u);
  assert.match(loadText("de","result.carbonKgCO2"),/CO₂/u);
  assert.equal(loadText("en","warning.invalidNumber",{field:"<img onerror=alert(1)>",min:0,max:24}).includes("<img onerror=alert(1)>"),true);
});

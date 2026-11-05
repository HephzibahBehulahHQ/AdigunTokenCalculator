import test from "node:test";
import assert from "node:assert/strict";
import {LOAD_PRESETS, RENEWABLE_PRESETS} from "../src/data/loadPresets.js";
import {calculateLoadSummary} from "../src/calculators/loadCalculator.js";

test("load presets: all 19 requested appliance estimates have unique ids and valid values",()=>{
  assert.equal(LOAD_PRESETS.length,19);assert.equal(new Set(LOAD_PRESETS.map(p=>p.id)).size,19);
  assert.deepEqual([...new Set(LOAD_PRESETS.map(p=>p.category))],["lighting","cooling","appliances","electronics","utility"]);
  for(const p of LOAD_PRESETS){
    for(const key of ["id","name","watts","pf","type","category","standbyW"])assert.ok(Object.hasOwn(p,key),`${p.id}: ${key}`);
    assert.ok(p.watts>0&&p.pf>0&&p.pf<=1&&p.standbyW>=0);
    assert.ok(Number.isFinite(calculateLoadSummary([{...p,hoursPerDay:8}]).dailyKWh));
  }
  assert.equal(LOAD_PRESETS.find(p=>p.id==="led-bulb").watts,10);
  assert.equal(LOAD_PRESETS.find(p=>p.id==="split-ac-1-5hp").watts,1100);
  assert.equal(LOAD_PRESETS.find(p=>p.id==="refrigerator").pf,0.8);
});

test("load presets: immutable defaults yield independently editable device copies",()=>{
  assert.ok(Object.isFrozen(LOAD_PRESETS));assert.ok(LOAD_PRESETS.every(Object.isFrozen));
  const copy={...LOAD_PRESETS[0],watts:20};assert.equal(LOAD_PRESETS[0].watts,10);assert.equal(copy.watts,20);
});

test("load presets: solar and wind are daily generation offsets, never consuming appliances",()=>{
  assert.deepEqual(RENEWABLE_PRESETS.map(p=>p.field),["solarKWh","windKWh"]);
  for(const p of RENEWABLE_PRESETS){assert.equal(p.unit,"kWh/day");assert.equal(p.category,"renewable");assert.equal(p.kWhPerDay,0);assert.equal(Object.hasOwn(p,"watts"),false);}
});

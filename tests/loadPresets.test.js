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

test("load presets: editable starting-current assumptions distinguish AC, motors and unmodelled surge",()=>{
  const multipliers={"led-bulb":1,fluorescent:1,halogen:1,"ceiling-fan":6,"split-ac-1hp":5,
    "split-ac-1-5hp":5,"window-ac":5,refrigerator:6,freezer:6,microwave:1,kettle:1,
    "washing-machine":6,tv:1,laptop:1,desktop:1,router:1,"water-pump":6,"borehole-pump":6,iron:1};
  assert.equal(Object.keys(multipliers).length,LOAD_PRESETS.length);
  for(const preset of LOAD_PRESETS)assert.equal(preset.inrushMultiplier,multipliers[preset.id],preset.id);
  const refrigerator=LOAD_PRESETS.find(preset=>preset.id==="refrigerator");
  const edited={...refrigerator,inrushMultiplier:3};
  assert.equal(edited.inrushMultiplier,3);assert.equal(refrigerator.inrushMultiplier,6);
});

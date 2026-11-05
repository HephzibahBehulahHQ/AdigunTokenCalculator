import test from "node:test";
import assert from "node:assert/strict";
import {calculateLoadSummary} from "../src/calculators/loadCalculator.js";
import {
  LOAD_PROFILE_STORAGE_KEY, MAX_SAVED_PROFILE_CHARS,
  serializeLoadProfile, parseLoadProfile, saveLoadProfile, readLoadProfile, deleteLoadProfile
} from "../src/tools/loadProfileStorage.js";

const device={name:"Ẹrọ / Kühlschrank",watts:0.1,powerUnit:"kW",quantity:2,hoursPerDay:6,dutyCycle:50,standbyW:2,pf:0.8,type:"inductive",seasonalFactor:1.5};
const settings={phase:"three",voltage:400,currency:"NGN",tariff:225,households:3,demandFactor:0.8,diversityFactor:0.7,growthMargin:10,co2Factor:0.25,solarKWh:0.1,windKWh:0.2,renewableOffsetKWh:0.3,batteryKWh:2,gridLimitKW:0,peakThresholdKW:0.5,measurementInterval:"second",occupancySchedule:{startHour:22.5,endHour:4.25}};
function memoryStorage(){
  const data=new Map();
  return {data,getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key)};
}
const payload=()=>JSON.parse(serializeLoadProfile([device],settings));

test("load storage: versioned profile round-trip preserves every calculation input and result",()=>{
  const inputs=structuredClone({devices:[device],settings});
  const encoded=serializeLoadProfile(inputs.devices,inputs.settings),decoded=parseLoadProfile(encoded);
  assert.deepEqual(calculateLoadSummary(decoded.devices,decoded.settings),calculateLoadSummary(inputs.devices,inputs.settings));
  assert.equal(decoded.devices[0].watts,100);assert.equal(decoded.devices[0].powerUnit,"W");
  assert.equal(decoded.devices[0].name,device.name);assert.equal(decoded.settings.currency,"NGN");
  assert.deepEqual(decoded.settings.occupancySchedule,settings.occupancySchedule);
  assert.deepEqual(inputs,{devices:[device],settings});
  decoded.devices[0].name="changed";assert.equal(parseLoadProfile(encoded).devices[0].name,device.name);
  const large=parseLoadProfile(serializeLoadProfile([{...device,watts:1e12,powerUnit:"kW"}],settings));
  assert.equal(large.devices[0].watts,1e15);
});

test("load storage: saves only normalized inputs; draft, results and unrelated metadata are excluded",()=>{
  const encoded=serializeLoadProfile([{...device,secret:"excluded",onload:"excluded"}],{...settings,secret:"excluded",draft:{name:"excluded"}});
  const data=JSON.parse(encoded);
  assert.deepEqual(Object.keys(data).sort(),["devices","format","settings","version"]);
  assert.doesNotMatch(encoded,/excluded|summary|draft/);
  const poisoned=payload();poisoned.devices[0].__proto__={polluted:true};
  const decoded=parseLoadProfile(JSON.stringify(poisoned));assert.equal(decoded.devices[0].polluted,undefined);
});

test("load storage: explicit save, read and delete affect only this calculator's one slot",()=>{
  const storage=memoryStorage();storage.setItem("unrelated","keep");
  assert.equal(readLoadProfile(storage),null);
  saveLoadProfile(storage,[device],settings);assert.equal(storage.data.size,2);
  assert.equal(readLoadProfile(storage).devices.length,1);
  saveLoadProfile(storage,[],{currency:"EUR"});assert.equal(readLoadProfile(storage).devices.length,0);
  assert.equal(storage.getItem("unrelated"),"keep");
  deleteLoadProfile(storage);deleteLoadProfile(storage);
  assert.equal(readLoadProfile(storage),null);assert.equal(storage.getItem("unrelated"),"keep");
});

test("load storage: malformed, oversized, unsupported and incomplete profiles are rejected",()=>{
  for(const value of ["", "{", "null", "[]", "{}", " ".repeat(MAX_SAVED_PROFILE_CHARS+1)]){
    assert.throws(()=>parseLoadProfile(value),{code:"profileInvalid"});
  }
  const changes=[
    p=>p.version=2,p=>p.format="another-app",p=>delete p.settings.voltage,
    p=>delete p.devices[0].pf,p=>p.devices[0].pf=0,p=>p.devices[0].quantity=-1,
    p=>p.devices[0].hoursPerDay=25,p=>p.settings.currency="INVALID",
    p=>p.settings.households=null,p=>p.settings.tariff=1e308,
    p=>p.settings.voltage=1e9,p=>p.settings.voltage=0.001,p=>p.settings.households=2e6,
    p=>p.devices[0].quantity=2e6,p=>p.devices[0].name="  ",p=>p.devices[0].watts=1e16,
    p=>p.devices[0].seasonalFactor=1001,p=>p.settings.co2Factor=1001,
    p=>p.settings.occupancySchedule={startHour:23.9999999,endHour:1},
    p=>p.devices=Array(501).fill(p.devices[0]),p=>p.devices=[null],
    p=>p.settings.occupancySchedule={startHour:24,endHour:1}
  ];
  for(const change of changes){const data=payload();change(data);assert.throws(()=>parseLoadProfile(JSON.stringify(data)),{code:"profileInvalid"});}
});

test("load storage: invalid inputs and failed writes preserve the previously saved profile",()=>{
  const storage=memoryStorage();saveLoadProfile(storage,[device],settings);
  const before=storage.getItem(LOAD_PROFILE_STORAGE_KEY);
  assert.throws(()=>saveLoadProfile(storage,[{...device,pf:0}],settings));
  assert.equal(storage.getItem(LOAD_PROFILE_STORAGE_KEY),before);
  const blocked={...storage,setItem(){throw new Error("quota");}};
  assert.throws(()=>saveLoadProfile(blocked,[],{}),{code:"storageFailed"});
  assert.equal(storage.getItem(LOAD_PROFILE_STORAGE_KEY),before);
  for(const action of [readLoadProfile,deleteLoadProfile]){
    const inaccessible={getItem(){throw new Error("blocked");},removeItem(){throw new Error("blocked");}};
    assert.throws(()=>action(inaccessible),{code:"storageFailed"});
  }
});

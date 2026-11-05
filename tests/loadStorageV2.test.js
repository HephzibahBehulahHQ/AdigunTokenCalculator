import test from "node:test";
import assert from "node:assert/strict";
import {calculateLoadV2Summary,normalizeLoadV2Settings} from "../src/calculators/loadCalculator.js";
import {
  LOAD_PROFILE_STORAGE_KEY,MAX_SAVED_PROFILE_CHARS,serializeLoadProfile,parseLoadProfile,deleteLoadProfile,
  serializeLoadV2Profile,parseLoadV2Profile,saveLoadV2Profile,readLoadV2Profile
} from "../src/tools/loadProfileStorage.js";

const device={name:"Ẹrọ / Kühlschrank",watts:0.75,powerUnit:"kW",quantity:2,hoursPerDay:6.5,dutyCycle:75,
  standbyW:3,pf:0.85,type:"inductive",seasonalFactor:1.2,inrushMultiplier:6,operatingWindow:{startHour:22.25,endHour:5.75}};
const settings={phase:"three",voltage:400,currency:"NGN",tariff:0.3,households:3,demandFactor:0.8,
  diversityFactor:0.7,growthMargin:10,co2Factor:0.25,solarKWh:0.1,windKWh:0.2,renewableOffsetKWh:0.3,
  batteryKWh:2,gridLimitKW:0,peakThresholdKW:0.5,measurementInterval:"second",occupancySchedule:{startHour:18,endHour:22}};
const extensions={resolutionMinutes:15,breakerRatingA:32,gridCurrentLimitA:50,cableLengthM:35,conductorMM2:6,
  material:"aluminium",frequencyHz:60,capacitorConnection:"wye",pfOld:0.8,pfNew:0.95,pfRealKW:10,penaltyRate:1.2,
  touEnabled:true,tariffBands:[{id:"peak",startHour:17,endHour:22,rate:0.6},{id:"offPeak",startHour:22,endHour:7,rate:0.1},
    {id:"standard",startHour:7,endHour:17,rate:0.3}],monthlyFactors:[0,1.1,1.2,1,0.9,1,1.3,1.4,1,0.8,1,1.2],selectedMonth:2};
const payload=()=>JSON.parse(serializeLoadV2Profile([device],settings,extensions));
function memoryStorage(){
  const data=new Map();let writes=0;
  return {data,get writes(){return writes;},getItem:key=>data.get(key)??null,
    setItem(key,value){writes++;data.set(key,value);},removeItem:key=>data.delete(key)};
}

test("load v2 storage: complete normalized round-trip preserves extended calculations and independent inputs",()=>{
  const inputs=structuredClone({devices:[device],settings,extensions});
  const before=structuredClone(inputs),encoded=serializeLoadV2Profile(inputs.devices,inputs.settings,inputs.extensions);
  const data=JSON.parse(encoded),decoded=parseLoadV2Profile(encoded);
  assert.equal(data.format,"adigun-electrical-load");assert.equal(data.version,2);
  assert.deepEqual(Object.keys(data).sort(),["devices","extensions","format","settings","version"]);
  assert.deepEqual(calculateLoadV2Summary(decoded.devices,decoded.settings,decoded.extensions),calculateLoadV2Summary(inputs.devices,inputs.settings,inputs.extensions));
  assert.equal(decoded.devices[0].watts,750);assert.equal(decoded.devices[0].powerUnit,"W");
  assert.equal(decoded.devices[0].inrushMultiplier,6);assert.deepEqual(decoded.devices[0].operatingWindow,device.operatingWindow);
  assert.deepEqual(decoded.extensions,normalizeLoadV2Settings(extensions,settings.tariff));assert.deepEqual(inputs,before);
  decoded.extensions.monthlyFactors[0]=9;decoded.devices[0].name="changed";
  assert.equal(parseLoadV2Profile(encoded).extensions.monthlyFactors[0],0);assert.equal(parseLoadV2Profile(encoded).devices[0].name,device.name);
  assert.throws(()=>parseLoadProfile(encoded),{code:"profileInvalid"});
  const large=parseLoadV2Profile(serializeLoadV2Profile([{...device,watts:1e12,powerUnit:"kW"}],settings,extensions));
  assert.equal(large.devices[0].watts,1e15);
});

test("load v2 storage: version one is migrated in memory without rewriting the slot or inventing inrush",()=>{
  const storage=memoryStorage(),v1=serializeLoadProfile([device],settings);
  storage.setItem(LOAD_PROFILE_STORAGE_KEY,v1);const writes=storage.writes;
  const decoded=readLoadV2Profile(storage),legacy=parseLoadProfile(v1);
  assert.equal(storage.getItem(LOAD_PROFILE_STORAGE_KEY),v1);assert.equal(storage.writes,writes);
  assert.deepEqual(decoded.settings,legacy.settings);assert.equal(decoded.devices[0].inrushMultiplier,1);
  assert.equal(decoded.devices[0].operatingWindow,null);
  assert.deepEqual(decoded.extensions,normalizeLoadV2Settings({},settings.tariff));
  assert.ok(decoded.extensions.tariffBands.every(band=>band.rate===settings.tariff));
});

test("load v2 storage: customer, billing, draft, results and arbitrary nested metadata are always excluded",()=>{
  const hidden={customer:{name:"PRIVATE_CUSTOMER",phone:"PRIVATE_PHONE",address:"PRIVATE_ADDRESS",email:"PRIVATE_EMAIL"},
    billing:{reference:"PRIVATE_BILL"},draft:{name:"PRIVATE_DRAFT"},results:{text:"PRIVATE_RESULT"}};
  const encoded=serializeLoadV2Profile([{...device,...hidden,operatingWindow:{...device.operatingWindow,...hidden}}],
    {...settings,...hidden,occupancySchedule:{...settings.occupancySchedule,...hidden}},
    {...extensions,...hidden,tariffBands:extensions.tariffBands.map(band=>({...band,...hidden}))});
  assert.doesNotMatch(encoded,/PRIVATE_/);
  const data=payload();Object.assign(data,hidden);Object.assign(data.devices[0],hidden);
  Object.assign(data.settings,hidden);Object.assign(data.extensions,hidden);Object.assign(data.extensions.tariffBands[0],hidden);
  data.devices[0]["__proto__"]={polluted:true};
  const decoded=parseLoadV2Profile(JSON.stringify(data));
  assert.doesNotMatch(JSON.stringify(decoded),/PRIVATE_/);assert.equal(decoded.devices[0].polluted,undefined);
  assert.deepEqual(Object.keys(decoded).sort(),["devices","extensions","settings"]);
});

test("load v2 storage: incomplete, malformed and out-of-UI-range persisted fields are rejected",()=>{
  for(const input of [null,"","{","null","[]","{}"," ".repeat(MAX_SAVED_PROFILE_CHARS+1)])assert.throws(()=>parseLoadV2Profile(input),{code:"profileInvalid"});
  for(const section of ["settings","extensions"]){
    for(const field of Object.keys(payload()[section])){const p=payload();delete p[section][field];assert.throws(()=>parseLoadV2Profile(JSON.stringify(p)),{code:"profileInvalid"},section+"."+field);}
  }
  for(const field of Object.keys(payload().devices[0])){const p=payload();delete p.devices[0][field];assert.throws(()=>parseLoadV2Profile(JSON.stringify(p)),{code:"profileInvalid"},field);}
  const changes=[p=>p.version=3,p=>p.format="other",p=>delete p.extensions,p=>p.extensions=null,
    p=>p.devices=[null],p=>p.devices=Array(501).fill(p.devices[0]),p=>p.devices[0].name=" ",p=>p.devices[0].powerUnit="kW",
    p=>p.devices[0].quantity=1000001,p=>p.devices[0].watts=1e15+1,p=>p.devices[0].standbyW=1e12+1,
    p=>p.devices[0].seasonalFactor=1001,p=>p.devices[0].inrushMultiplier=null,p=>p.devices[0].inrushMultiplier=11,
    p=>p.devices[0].operatingWindow={startHour:23.9999999,endHour:1},p=>p.devices[0].operatingWindow={startHour:1},
    p=>p.settings.voltage=0.001,p=>p.settings.voltage=1000001,p=>p.settings.households=1000001,
    p=>p.settings.tariff=1000001,p=>p.settings.co2Factor=1001,p=>p.settings.currency="INVALID",
    p=>p.extensions.breakerRatingA=1e12+1,p=>p.extensions.gridCurrentLimitA=1e12+1,p=>p.extensions.pfRealKW=1e12+1,
    p=>p.extensions.penaltyRate=1000001,p=>p.extensions.monthlyFactors=[1],p=>p.extensions.monthlyFactors[0]=null,
    p=>p.extensions.monthlyFactors[0]=1001,p=>p.extensions.selectedMonth=13,p=>p.extensions.resolutionMinutes=30,
    p=>p.extensions.cableLengthM=0,p=>p.extensions.cableLengthM=1e12+1,p=>p.extensions.conductorMM2=3,
    p=>p.extensions.frequencyHz=0,p=>p.extensions.material="steel",p=>p.extensions.capacitorConnection="other"];
  for(const change of changes){const p=payload();change(p);assert.throws(()=>parseLoadV2Profile(JSON.stringify(p)),{code:"profileInvalid"});}
  for(const change of [p=>delete p.extensions.tariffBands[0].rate,p=>p.extensions.tariffBands[0].rate=-1,
    p=>p.extensions.tariffBands[0].startHour=17.1,p=>p.extensions.tariffBands[0].id="standard",p=>p.extensions.tariffBands=[]]){
    const p=payload();p.extensions.touEnabled=false;change(p);assert.throws(()=>parseLoadV2Profile(JSON.stringify(p)),{code:"profileInvalid"});
  }
});

test("load v2 storage: valid optional zeros, positive cable lengths and zero-duty legacy PF survive",()=>{
  const d={name:"Standby only",watts:100,pf:0,dutyCycle:0,hoursPerDay:0,standbyW:2,type:"inductive"};
  const decoded=parseLoadV2Profile(serializeLoadV2Profile([d],{tariff:0.3},{breakerRatingA:0,gridCurrentLimitA:0,cableLengthM:1e-12}));
  const result=calculateLoadV2Summary(decoded.devices,decoded.settings,decoded.extensions);
  assert.equal(decoded.extensions.breakerRatingA,0);assert.equal(decoded.extensions.gridCurrentLimitA,0);
  assert.equal(decoded.extensions.cableLengthM,1e-12);assert.equal(result.startingUnavailable,true);
  assert.ok(Math.abs(result.summary.dailyKWh-0.048)<1e-12);
  const migrated=parseLoadV2Profile(serializeLoadProfile([d],{tariff:0.3}));
  assert.equal(calculateLoadV2Summary(migrated.devices,migrated.settings,migrated.extensions).startingUnavailable,true);
});

test("load v2 storage: explicit operations touch one slot and failed validation or writes preserve the old value",()=>{
  const storage=memoryStorage();storage.setItem("unrelated","keep");assert.equal(readLoadV2Profile(storage),null);
  saveLoadV2Profile(storage,[device],settings,extensions);assert.equal(storage.data.size,2);
  assert.equal(readLoadV2Profile(storage).devices[0].inrushMultiplier,6);
  const before=storage.getItem(LOAD_PROFILE_STORAGE_KEY),writes=storage.writes;
  assert.throws(()=>saveLoadV2Profile(storage,[device],settings,{...extensions,monthlyFactors:[1]}),{code:"profileInvalid"});
  assert.throws(()=>saveLoadV2Profile(storage,[device],{...settings,voltage:0.001},extensions),{code:"profileInvalid"});
  assert.equal(storage.writes,writes);assert.equal(storage.getItem(LOAD_PROFILE_STORAGE_KEY),before);
  assert.throws(()=>saveLoadV2Profile({...storage,setItem(){throw Error("quota");}},[],{},{}),{code:"storageFailed"});
  assert.throws(()=>readLoadV2Profile({getItem(){throw Error("blocked");}}),{code:"storageFailed"});
  assert.equal(storage.getItem(LOAD_PROFILE_STORAGE_KEY),before);assert.equal(storage.getItem("unrelated"),"keep");
  deleteLoadProfile(storage);assert.equal(readLoadV2Profile(storage),null);assert.equal(storage.getItem("unrelated"),"keep");
});

test("load v2 storage: importing the adapter does not inspect browser storage",async()=>{
  const prior=Object.getOwnPropertyDescriptor(globalThis,"localStorage");let accesses=0;
  Object.defineProperty(globalThis,"localStorage",{configurable:true,get(){accesses++;throw Error("no implicit access");}});
  try {await import("../src/tools/loadProfileStorage.js?storage-v2-import-check");assert.equal(accesses,0);}
  finally {if(prior)Object.defineProperty(globalThis,"localStorage",prior);else delete globalThis.localStorage;}
});

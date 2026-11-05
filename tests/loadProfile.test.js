import test from "node:test";
import assert from "node:assert/strict";
import {generate24hProfile, normalizeLoadDevice, normalizeLoadSettings} from "../src/calculators/loadProfile.js";

const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<=1e-10*Math.max(1,Math.abs(expected)),`${actual} ≈ ${expected}`);
const device={name:"Test load",watts:100,quantity:2,dutyCycle:50,hoursPerDay:6,seasonalFactor:1.5,standbyW:2,pf:0.8,type:"inductive"};
const energy=profile=>profile.reduce((sum,row)=>sum+row.kW,0);

test("load profile: 24 ordered finite hourly averages conserve active and standby energy",()=>{
  const profile=generate24hProfile([device]);
  assert.deepEqual(profile.map(row=>row.hour),Array.from({length:24},(_,hour)=>hour));
  assert.ok(profile.every(row=>Number.isFinite(row.kW)&&row.kW>=0));
  near(energy(profile),0.972);near(Math.max(...profile.map(row=>row.kW)),0.15);
  near(profile[0].kW,0.15);near(profile[6].kW,0.004);near(energy(profile)/24,0.0405);
});

test("load profile: fractional hours and an overnight occupancy window conserve energy",()=>{
  const d={...device,watts:1000,quantity:1,dutyCycle:100,hoursPerDay:2.5,seasonalFactor:1,standbyW:10};
  const midnight=generate24hProfile([d]);
  near(midnight[2].kW,0.505);near(energy(midnight),2.715);
  const overnight=generate24hProfile([d],{startHour:22,endHour:2});
  for(const hour of [22,23,0,1])near(overnight[hour].kW,0.62875);
  near(overnight[2].kW,0.01);near(energy(overnight),2.715);
  const fractionalWindow=generate24hProfile([d],{startHour:18.5,endHour:21});
  near(fractionalWindow[18].kW,0.505);near(fractionalWindow[19].kW,1);near(energy(fractionalWindow),2.715);
});

test("load profile: a short preferred window spills hours outside without compressing power",()=>{
  const d={watts:1000,hoursPerDay:12,pf:1};
  const profile=generate24hProfile([d],{startHour:18,endHour:22});
  for(let hour=18;hour<22;hour++)near(profile[hour].kW,1);
  near(profile[0].kW,0.4);near(energy(profile),12);
  assert.ok(profile.every(row=>row.kW<=1));
});

test("load profile: zero and full-day boundaries, empty list and zero quantity",()=>{
  for(const devices of [[],[{...device,quantity:0}]])assert.ok(generate24hProfile(devices).every(row=>row.kW===0));
  const off=generate24hProfile([{...device,hoursPerDay:0}]);
  assert.ok(off.every(row=>row.kW===0.004));near(energy(off),0.096);
  const allDay=generate24hProfile([{...device,hoursPerDay:24}],{startHour:23,endHour:3});
  assert.ok(allDay.every(row=>Math.abs(row.kW-0.15)<1e-12));near(energy(allDay),3.6);
  const sameEndpoints=generate24hProfile([{...device,hoursPerDay:12}],{startHour:8,endHour:8});
  assert.ok(sameEndpoints.every(row=>Math.abs(row.kW-sameEndpoints[0].kW)<1e-12));
});

test("load profile: scenario factors scale every bin and energy exactly once",()=>{
  const settings={households:10,diversityFactor:0.5,demandFactor:0.8,growthMargin:20};
  const base=generate24hProfile([device]);const scaled=generate24hProfile([device],undefined,settings);
  base.forEach((row,hour)=>near(scaled[hour].kW,row.kW*4.8));near(energy(scaled),0.972*4.8);
  for(const settings of [{households:0},{demandFactor:0},{diversityFactor:0}])assert.ok(generate24hProfile([device],null,settings).every(row=>row.kW===0));
});

test("load profile: rejects invalid ranges, blanks, nonfinite values and malformed schedules",()=>{
  for(const patch of [{watts:-1},{watts:""},{watts:Infinity},{quantity:0.5},{hoursPerDay:25},{hoursPerDay:-1},{dutyCycle:101},{standbyW:-1},{seasonalFactor:-1},{pf:1.1},{pf:0},{type:"unknown"}])assert.throws(()=>generate24hProfile([{...device,...patch}]),{name:"RangeError"});
  for(const schedule of [{startHour:25,endHour:3},{startHour:4},{startHour:"",endHour:8},[],"18-22"] )assert.throws(()=>generate24hProfile([device],schedule),{name:"RangeError"});
  for(const settings of [{households:1.5},{demandFactor:2},{diversityFactor:-1},{growthMargin:-1},{voltage:0},{tariff:NaN},{phase:"other"},{measurementInterval:"hour"}])assert.throws(()=>generate24hProfile([device],null,settings),{name:"RangeError"});
  assert.throws(()=>generate24hProfile(null),{name:"RangeError"});
  assert.throws(()=>generate24hProfile([{...device,watts:Number.MAX_VALUE,quantity:2}]),{name:"RangeError"});
});

test("load profile: normalization supports kW and preserves zero optional limits",()=>{
  const normalized=normalizeLoadDevice({watts:1.5,powerUnit:"kW",pf:1});
  assert.equal(normalized.watts,1500);assert.equal(normalized.powerUnit,"W");assert.equal(normalized.quantity,1);assert.equal(normalized.dutyCycle,100);
  assert.equal(normalizeLoadDevice({watts:0,pf:0}).pf,0);
  assert.equal(normalizeLoadDevice({watts:100,quantity:0,pf:0}).quantity,0);
  assert.equal(normalizeLoadSettings({phase:"three"}).voltage,400);
  assert.equal(normalizeLoadSettings({}).voltage,230);
  assert.equal(normalizeLoadSettings({}).gridLimitKW,null);
  assert.equal(normalizeLoadSettings({gridLimitKW:0}).gridLimitKW,0);
});

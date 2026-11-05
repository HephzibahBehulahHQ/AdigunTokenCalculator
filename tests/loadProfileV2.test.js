import test from "node:test";
import assert from "node:assert/strict";
import {generate24hProfile, generateIntervalProfile, generate15minProfile, normalizeLoadV2Device, profileStatistics} from "../src/calculators/loadProfile.js";

const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-10*Math.max(1,Math.abs(expected)),`${actual} ≈ ${expected}`);
const device={name:"Motor",watts:1000,quantity:1,hoursPerDay:6,dutyCycle:50,standbyW:10,seasonalFactor:1.2,pf:0.8,type:"inductive",inrushMultiplier:6};
const energy=profile=>profile.reduce((sum,p)=>sum+p.kW*24/profile.length,0);

test("load v2 profile: absent options preserve the legacy hourly profile",()=>{
  const settings={households:3,demandFactor:0.8,diversityFactor:0.5,growthMargin:10,occupancySchedule:{startHour:22.5,endHour:4.25}};
  const old=generate24hProfile([device],undefined,settings),added=generateIntervalProfile([device],settings,60);
  added.forEach((point,index)=>{assert.equal(point.hour,index);near(point.kW,old[index].kW);});
  near(energy(added),(3.6+0.18)*1.32);
});

test("load v2 profile: native quarter-hours conserve energy and aggregate to hourly values",()=>{
  for(const hoursPerDay of [0,0.1,0.25,6.75,24]){
    const d={...device,hoursPerDay,operatingWindow:{startHour:22.5,endHour:2.25}};
    const quarter=generate15minProfile([d]),hourly=generate24hProfile([d]);
    assert.equal(quarter.length,96);assert.equal(hourly.length,24);
    near(energy(quarter),0.6*hoursPerDay+0.01*(24-hoursPerDay));
    hourly.forEach((point,hour)=>near(point.kW,quarter.slice(hour*4,hour*4+4).reduce((sum,p)=>sum+p.kW/4,0)));
    quarter.forEach((point,index)=>{assert.equal(point.hour,index/4);assert.ok(Number.isFinite(point.kW)&&point.kW>=0);});
  }
});

test("load v2 profile: device windows override the global preference without losing operating hours",()=>{
  const a={watts:1000,pf:1,hoursPerDay:8,operatingWindow:{startHour:0,endHour:8}};
  const b={...a,operatingWindow:{startHour:16,endHour:24}};
  const profile=generate24hProfile([a,b],{startHour:8,endHour:16});
  near(energy(profile),16);near(Math.max(...profile.map(p=>p.kW)),1);
  assert.ok(profile.slice(8,16).every(point=>point.kW===0));
  const full=generate15minProfile([{...device,hoursPerDay:24,operatingWindow:{startHour:3,endHour:3}}]);
  full.forEach(point=>near(point.kW,0.6));
});

test("load v2 profile: cumulative curve, peak-to-average and top three hours are deterministic",()=>{
  const profile=generate15minProfile([{watts:1000,pf:1,hoursPerDay:2.5,operatingWindow:{startHour:7,endHour:9.5}}]);
  const stats=profileStatistics(profile);
  near(stats.dailyKWh,2.5);near(stats.peakKW,1);near(stats.averageKW,2.5/24);near(stats.peakAverageRatio,9.6);
  assert.deepEqual(stats.topHours.map(p=>p.hour),[7,8,9]);
  assert.equal(stats.cumulative.length,97);assert.deepEqual(stats.cumulative[0],{hour:0,kWh:0});
  assert.deepEqual(stats.cumulative.at(-1),{hour:24,kWh:2.5});
  stats.cumulative.forEach((p,index)=>{if(index)assert.ok(p.kWh>=stats.cumulative[index-1].kWh);});
  const empty=profileStatistics(generate15minProfile([]));assert.equal(empty.peakAverageRatio,0);assert.deepEqual(empty.topHours,[]);
});

test("load v2 profile: validation, zero quantity and immutable inputs",()=>{
  const d=structuredClone(device),settings={occupancySchedule:{startHour:18,endHour:22}};
  generate15minProfile([d],settings);assert.deepEqual(d,device);assert.deepEqual(settings,{occupancySchedule:{startHour:18,endHour:22}});
  assert.equal(normalizeLoadV2Device({watts:10}).inrushMultiplier,1);
  near(energy(generate15minProfile([{...device,quantity:0}])),0);
  for(const patch of [{inrushMultiplier:0},{inrushMultiplier:11},{inrushMultiplier:null},{operatingWindow:{startHour:24,endHour:1}}])assert.throws(()=>normalizeLoadV2Device({...device,...patch}));
  assert.throws(()=>generateIntervalProfile([device],{},30));assert.throws(()=>generate15minProfile(Array(2)));
  assert.throws(()=>profileStatistics([]));assert.throws(()=>profileStatistics(Array(24)));
  const bad=generate24hProfile([]);bad[3].hour=8;assert.throws(()=>profileStatistics(bad));
});

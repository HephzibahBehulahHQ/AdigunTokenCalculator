import test from "node:test";
import assert from "node:assert/strict";
import * as c from "../src/calculators/loadCalculator.js";
import {generate15minProfile} from "../src/calculators/loadProfile.js";

const near=(a,b)=>assert.ok(Math.abs(a-b)<=1e-8*Math.max(1,Math.abs(b)),`${a} ≈ ${b}`);
const motor={name:"Motor",watts:1500,pf:0.8,type:"inductive",quantity:1,hoursPerDay:6,dutyCycle:50,inrushMultiplier:6};
const bands=[{id:"peak",startHour:17,endHour:22,rate:0.6},{id:"offPeak",startHour:22,endHour:7,rate:0.1},{id:"standard",startHour:7,endHour:17,rate:0.3}];
const devices=[{name:"Peak device",watts:1000,pf:1,hoursPerDay:1,operatingWindow:{startHour:17,endHour:18}},{name:"Standard device",watts:1000,pf:1,hoursPerDay:1,operatingWindow:{startHour:7,endHour:8}}];

test("load v2: rated/surge current and motor starting power use nameplate power, not duty or energy factors",()=>{
  near(c.ratedCurrentA(motor),8.152173913);near(c.inrushCurrentA(motor),48.91304348);near(c.motorStartingKW(motor),9);
  near(c.inrushCurrentA({...motor,dutyCycle:0,hoursPerDay:0,seasonalFactor:0}),48.91304348);
  near(c.inrushCurrentA({...motor,quantity:2}),2*48.91304348);
  near(c.inrushCurrentA({...motor,quantity:0,pf:0}),0);near(c.motorStartingKW({...motor,type:"resistive"}),0);
  near(c.ratedCurrentA(motor,{phase:"three",voltage:400}),1500/(Math.sqrt(3)*400*0.8));
  assert.throws(()=>c.inrushCurrentA({...motor,pf:0,dutyCycle:0}));
});

test("load v2: phase design current and the requested 125% standard-breaker candidate",()=>{
  near(c.designCurrentA(1.5,0.8),1500/(230*0.8));
  near(c.designCurrentA(1.5,0.8,{phase:"three",voltage:400}),1500/(Math.sqrt(3)*400*0.8));
  assert.deepEqual(c.STANDARD_BREAKER_AMPS,[6,10,16,20,25,32,40,50,63,80,100,125]);
  assert.equal(c.suggestedBreakerA(12.8),16);assert.equal(c.suggestedBreakerA(12.81),20);
  assert.equal(c.suggestedBreakerA(100),125);assert.equal(c.suggestedBreakerA(100.01),null);
  assert.equal(c.suggestedBreakerA(0),6);assert.throws(()=>c.suggestedBreakerA(-1));
  assert.throws(()=>c.designCurrentA(1,0));near(c.designCurrentA(0,0),0);
});

test("load v2: PF correction capacitor sizes distinguish single, wye and delta at 50/60 Hz",()=>{
  const q=c.powerFactorCorrectionKVAR(10,0.8,0.95);near(q,4.213158948);
  near(c.capacitorMicrofarads(q,{phase:"single",voltage:230,frequencyHz:50}),253.5142052);
  const delta=c.capacitorMicrofarads(q,{phase:"three",voltage:400,frequencyHz:50,capacitorConnection:"delta"});
  const wye=c.capacitorMicrofarads(q,{phase:"three",voltage:400,frequencyHz:50,capacitorConnection:"wye"});
  near(delta,27.93937803);near(wye,3*delta);
  near(c.capacitorMicrofarads(q,{phase:"three",voltage:400,frequencyHz:60,capacitorConnection:"delta"}),delta*50/60);
  assert.throws(()=>c.capacitorMicrofarads(-1));assert.throws(()=>c.capacitorMicrofarads(q,{frequencyHz:0}));
  near(c.capacitorMicrofarads(0),0);
});

test("load v2: PF apparent-power and optional penalty savings are separate estimates",()=>{
  const value=c.powerFactorCorrectionDetails(10,0.8,0.95,{penaltyRate:2});
  near(value.correctionKVAR,4.213158948);near(value.reducedKVA,12.5-10/0.95);near(value.penaltySavings,2*(12.5-10/0.95));
  const lower=c.powerFactorCorrectionDetails(10,1,0.8);
  assert.ok(lower.correctionKVAR<0);assert.equal(lower.capacitanceUF,null);assert.equal(lower.penaltySavings,0);
  assert.throws(()=>c.powerFactorCorrectionDetails(10,0,1));
});

test("load v2: resistance-only copper/aluminium voltage drop uses one-way length",()=>{
  const input={currentA:16,pf:1,cableLengthM:30,conductorMM2:2.5,material:"copper",voltage:230,phase:"single"};
  const single=c.voltageDropEstimate(input);near(single.dropV,9.1008);near(single.dropPercent,100*9.1008/230);
  const three=c.voltageDropEstimate({...input,phase:"three",voltage:400});near(three.dropV,7.881524);
  near(c.voltageDropEstimate({...input,material:"aluminium"}).dropV/single.dropV,0.0376/0.0237);
  assert.equal(c.voltageDropEstimate({...input,cableLengthM:100}).exceedsFivePercent,true);
  near(c.voltageDropEstimate({...input,currentA:0}).dropV,0);
  for(const patch of [{cableLengthM:0},{conductorMM2:3},{material:"steel"},{voltage:0},{pf:1.1}])assert.throws(()=>c.voltageDropEstimate({...input,...patch}));
});

test("load v2: TOU bands fully cover quarter-hours without overlap or gaps",()=>{
  assert.equal(c.normalizeTariffBands(bands).length,3);
  for(const patch of [{startHour:16},{endHour:23},{startHour:17.1},{rate:-1}])assert.throws(()=>c.normalizeTariffBands(bands.map((b,i)=>i===0?{...b,...patch}:b)));
  assert.throws(()=>c.normalizeTariffBands(bands.slice(0,2)));
  const profile=generate15minProfile(devices),cost=c.calculateTimeOfUse(profile,bands,1);
  near(cost.dailyKWh,2);near(cost.grossCost,0.9);near(cost.netCost,0.45);near(cost.renewableCredit,0.45);
  near(cost.bands.find(b=>b.id==="peak").kWh,1);near(cost.bands.find(b=>b.id==="standard").kWh,1);
  near(cost.bands.reduce((s,b)=>s+b.netCost,0),cost.netCost);
  near(c.calculateTimeOfUse(profile,bands,5).netCost,0);near(c.calculateTimeOfUse(generate15minProfile([]),bands,5).netCost,0);
});

test("load v2: identical band rates preserve flat pricing including renewable caps",()=>{
  const profile=generate15minProfile([motor]);
  const cost=c.calculateTimeOfUse(profile,bands.map(b=>({...b,rate:0.3})),1);
  near(cost.netCost,(4.5-1)*0.3);near(cost.grossCost,4.5*0.3);
});

test("load v2: default settings preserve all existing numerical summary outputs",()=>{
  const ds=[{name:"Fixture",watts:100,quantity:2,dutyCycle:50,hoursPerDay:6,seasonalFactor:1.5,standbyW:2,pf:0.8,type:"inductive"}];
  const settings={tariff:0.3,households:3,demandFactor:0.8,diversityFactor:0.5,growthMargin:10,solarKWh:0.1};
  const before=c.calculateLoadSummary(ds,settings),after=c.calculateLoadV2Summary(ds,settings).summary;
  for(const [key,value] of Object.entries(before))if(typeof value==="number")near(after[key],value);
  after.profile.forEach((point,index)=>near(point.kW,before.profile[index].kW));
});

test("load v2: per-device costs/carbon and total surge reconcile under community scaling",()=>{
  const result=c.calculateLoadV2Summary(devices,{renewableOffsetKWh:1,co2Factor:0.4},{touEnabled:true,tariffBands:bands});
  near(result.summary.dailyCost,0.45);near(result.summary.monthlyCost,13.5);near(result.summary.annualCost,164.25);
  near(result.summary.breakdown.reduce((s,row)=>s+row.dailyCost,0),0.45);
  near(result.summary.breakdown.reduce((s,row)=>s+row.carbonKgCO2,0),0.4);
  const surge=c.calculateLoadV2Summary([motor],{households:2,growthMargin:10,demandFactor:0.1,diversityFactor:0.1},{breakerRatingA:32,gridCurrentLimitA:50});
  near(surge.surgeCurrentA,48.91304348*2.2);assert.equal(surge.surgeBreakerExceeded,true);assert.equal(surge.surgeGridExceeded,true);
  const limit=c.calculateLoadV2Summary([motor],{gridLimitKW:1});assert.equal(limit.connectedLimitExceeded,true);
});

test("load v2: monthly active-energy factors leave standby unchanged and recompute capped credits",()=>{
  const d={name:"Seasonal",watts:1000,pf:1,hoursPerDay:1,standbyW:10};
  const factors=Array(12).fill(1);factors[0]=0;
  const result=c.calculateLoadV2Summary([d],{tariff:0.3,renewableOffsetKWh:0.5},{monthlyFactors:factors,selectedMonth:1});
  near(result.seasonal.months[0].dailyKWh,0.23);near(result.seasonal.months[0].netCost,0);
  near(result.summary.monthlyKWh,0.23*30);near(result.summary.monthlyCost,0);
  near(result.summary.annualCost,0.73*0.3*334);near(result.summary.annualKWh,0.23*31+1.23*334);
  near(result.summary.standbyKWh,0.23);
  assert.throws(()=>c.calculateLoadV2Summary([d],{},{monthlyFactors:[1]}));
});

test("load v2: 15-minute demand, ranking and cumulative energy follow the selected resolution",()=>{
  const result=c.calculateLoadV2Summary([{name:"Short",watts:1000,pf:1,hoursPerDay:0.25}],{},{resolutionMinutes:15});
  assert.equal(result.summary.profile.length,96);near(result.summary.peakDemandKW,1);
  near(result.profileStats.peakAverageRatio,96);near(result.profileStats.cumulative.at(-1).kWh,0.25);
});

test("load v2: strict new ranges and immutable inputs",()=>{
  for(const patch of [{resolutionMinutes:30},{pfOld:-1},{pfNew:2},{pfRealKW:1,pfOld:0},{penaltyRate:-1},{frequencyHz:0},{conductorMM2:3},{cableLengthM:0},{monthlyFactors:Array(12).fill(-1)},{selectedMonth:13}])assert.throws(()=>c.normalizeLoadV2Settings(patch));
  const original=structuredClone({devices,settings:{tariff:0.3},v2:{touEnabled:true,tariffBands:bands}});
  const before=JSON.stringify(original);c.calculateLoadV2Summary(original.devices,original.settings,original.v2);assert.equal(JSON.stringify(original),before);
  const empty=c.calculateLoadV2Summary([]);near(empty.surgeCurrentA,0);near(empty.summary.dailyCost,0);
});

test("load v2: legacy zero-duty PF=0 energy remains available while nameplate starting estimates are unknown",()=>{
  const d={name:"Inactive motor",watts:100,pf:0,dutyCycle:0,hoursPerDay:0,standbyW:2,type:"inductive",inrushMultiplier:6};
  const settings={tariff:0.3},before=c.calculateLoadSummary([d],settings);
  const result=c.calculateLoadV2Summary([d],settings,{breakerRatingA:6,gridCurrentLimitA:10});
  for(const [key,value] of Object.entries(before))if(typeof value==="number")near(result.summary[key],value);
  result.summary.profile.forEach((point,index)=>near(point.kW,before.profile[index].kW));
  near(result.summary.dailyKWh,0.048);near(result.summary.dailyCost,0.0144);
  for(const key of ["ratedCurrentA","surgeCurrentA","startingKW"])assert.equal(result.summary.breakdown[0][key],null);
  assert.equal(result.surgeCurrentA,null);assert.equal(result.startingKW,null);assert.equal(result.startingUnavailable,true);
  assert.equal(result.surgeBreakerExceeded,null);assert.equal(result.surgeGridExceeded,null);
  const noLimits=c.calculateLoadV2Summary([d]);
  assert.equal(noLimits.surgeBreakerExceeded,false);assert.equal(noLimits.surgeGridExceeded,false);
  for(const fn of [c.ratedCurrentA,c.inrushCurrentA,c.motorStartingKW])assert.throws(()=>fn(d),{name:"RangeError"});
});

test("load v2: unknown noninductive current does not invent motor starting power or a partial surge total",()=>{
  const d={name:"Inactive resistive",watts:100,pf:0,dutyCycle:0,hoursPerDay:0,standbyW:2,type:"resistive"};
  const result=c.calculateLoadV2Summary([d,motor],{},{breakerRatingA:100,gridCurrentLimitA:100});
  const row=result.summary.breakdown.find(item=>item.index===0);
  assert.equal(row.ratedCurrentA,null);assert.equal(row.surgeCurrentA,null);assert.equal(row.startingKW,0);
  assert.equal(result.surgeCurrentA,null);near(result.startingKW,9);assert.equal(result.startingUnavailable,true);
  assert.equal(result.surgeBreakerExceeded,null);assert.equal(result.surgeGridExceeded,null);
});

test("load v2: zero households or zero quantity give known zero nameplate contributions",()=>{
  const d={watts:100,pf:0,dutyCycle:0,type:"inductive",inrushMultiplier:6};
  for(const [devices,settings] of [[[d],{households:0}],[[{...d,quantity:0}],{}]]){
    const result=c.calculateLoadV2Summary(devices,settings,{breakerRatingA:0,gridCurrentLimitA:0});
    for(const key of ["ratedCurrentA","surgeCurrentA","startingKW"])near(result.summary.breakdown[0][key],0);
    near(result.surgeCurrentA,0);near(result.startingKW,0);assert.equal(result.startingUnavailable,false);
    assert.equal(result.surgeBreakerExceeded,false);assert.equal(result.surgeGridExceeded,false);
  }
});

import test from "node:test";
import assert from "node:assert/strict";
import * as c from "../src/calculators/loadCalculator.js";

const near=(a,b)=>assert.ok(Math.abs(a-b)<=1e-10*Math.max(1,Math.abs(b)),`${a} ≈ ${b}`);
const d={watts:100,quantity:2,dutyCycle:50,hoursPerDay:6,seasonalFactor:1.5,standbyW:2,pf:0.8,type:"inductive"};

test("load engine: quantity and duty determine operating W and interval Wh",()=>{
  near(c.instantaneousPowerW(d),100);near(c.realPowerKW(d),0.1);
  near(c.realPowerKW(d,0.6),0.06);near(c.energyPerSecondWh(d),100/3600);
  near(c.energyPerMinuteWh(d),100/60);near(c.energyPerHourKWh(d),0.1);
  near(c.instantaneousPowerW({...d,watts:1.5,powerUnit:"kW"}),1500);
});

test("load engine: signed reactive and apparent power honor PF for every load type",()=>{
  near(c.reactivePowerKVAR(d),0.075);near(c.apparentPowerKVA(d),0.125);
  near(c.reactivePowerKVAR({...d,type:"capacitive"}),-0.075);
  near(c.reactivePowerKVAR({...d,type:"resistive"}),0.075);
  near(c.reactivePowerKVAR({...d,pf:1}),0);near(c.apparentPowerKVA({...d,pf:1}),0.1);
  near(c.reactivePowerKVAR(d,0.5),0.0375);
});

test("load engine: seasonal active energy and quantity-adjusted standby remain separate",()=>{
  near(c.dailyConsumptionKWh(d),0.9);near(c.weeklyConsumptionKWh(d),6.3);
  near(c.monthlyConsumptionKWh(d),27);near(c.annualConsumptionKWh(d),328.5);
  near(c.standbyEnergyKWh(d),0.072);near(c.totalDailyConsumptionKWh([d]),0.972);
  near(c.standbyEnergyKWh({...d,hoursPerDay:24}),0);
  near(c.dailyConsumptionKWh({...d,hoursPerDay:0}),0);
  near(c.standbyEnergyKWh({...d,hoursPerDay:0}),0.096);
});

test("load engine: connected, real, vector apparent and signed reactive totals",()=>{
  const opposite={...d,type:"capacitive"};
  near(c.totalConnectedLoadKW([d,opposite]),0.4);
  near(c.totalRealPowerKW([d,opposite]),0.2);
  near(c.totalReactivePowerKVAR([d,opposite]),0);
  near(c.totalApparentPowerKVA([d,opposite]),0.2);
  near(c.totalApparentPowerKVA([d]),0.125);
});

test("load engine: peak, average and factor agree with the same conserved profile",()=>{
  near(c.peakDemandKW([d]),0.15);near(c.averageLoadKW([d]),0.0405);near(c.loadFactor([d]),0.27);
  const settings={households:10,growthMargin:20,demandFactor:0.8,diversityFactor:0.5,occupancySchedule:{startHour:20,endHour:2}};
  const r=c.calculateLoadSummary([d],settings);
  near(r.connectedLoadKW,2);near(r.projectedConnectedLoadKW,2.4);near(r.demandAdjustedConnectedKW,1.92);
  near(r.realPowerKW,0.48);near(r.dailyKWh,0.972*4.8);
  near(r.profile.reduce((sum,row)=>sum+row.kW,0),r.dailyKWh);
  near(r.peakDemandKW,Math.max(...r.profile.map(row=>row.kW)));
  near(r.averageLoadKW,r.dailyKWh/24);near(r.loadFactor,r.averageLoadKW/r.peakDemandKW);
  assert.ok(r.loadFactor>=0&&r.loadFactor<=1);
});

test("load engine: diversity and demand multipliers have exact zero/one boundaries",()=>{
  near(c.applyDiversityFactor(10,0.6),6);near(c.applyDemandFactor(10,0.8),8);
  for(const f of [c.applyDiversityFactor,c.applyDemandFactor]){near(f(10,0),0);near(f(10,1),10);assert.throws(()=>f(10,1.01));assert.throws(()=>f(-1,0.5));}
  for(const settings of [{households:0},{demandFactor:0},{diversityFactor:0}]){const r=c.calculateLoadSummary([d],settings);near(r.dailyKWh,0);near(r.peakDemandKW,0);near(r.loadFactor,0);}
});

test("load engine: capacitor correction and unity PF avoid division by zero",()=>{
  near(c.powerFactorCorrectionKVAR(100,0.8,1),75);
  near(c.powerFactorCorrectionKVAR(100,0.8,0.8),0);
  near(c.powerFactorCorrectionKVAR(100,1,0.8),-75);
  near(c.powerFactorCorrectionKVAR(0,0,0),0);
  assert.throws(()=>c.powerFactorCorrectionKVAR(10,0,1));
  assert.throws(()=>c.powerFactorCorrectionKVAR(10,0.8,1.1));
});

test("load engine: daily/monthly/annual costs include standby and carbon uses editable grid factor",()=>{
  near(c.costPerInterval(2,0.3),0.6);near(c.costPerDay([d],0.3),0.2916);
  near(c.costPerMonth([d],0.3),8.748);near(c.costPerYear([d],0.3),106.434);
  near(c.carbonFootprintKgCO2(2),0.8);near(c.carbonFootprintKgCO2(2,0.25),0.5);
  near(c.renewableOffsetSavings(2,0.3),0.6);
  assert.throws(()=>c.costPerInterval(2,-1));assert.throws(()=>c.carbonFootprintKgCO2(-1));
});

test("load engine: renewable offset is capped; capacity never invents energy or peak savings",()=>{
  const r=c.calculateLoadSummary([d],{tariff:0.3,renewableOffsetKWh:0.1,solarKWh:0.2,windKWh:0.1,batteryKWh:2,co2Factor:0.25});
  near(r.renewableAppliedKWh,0.4);near(r.netGridKWh,0.572);near(r.renewableSavings,0.12);
  near(r.dailyCost,0.1716);near(r.monthlyCost,0.1716*30);near(r.annualCost,0.1716*365);
  near(r.carbonKgCO2,0.143);near(r.batteryHours,2/0.0405);near(r.peakDemandKW,0.15);
  const excess=c.calculateLoadSummary([d],{solarKWh:10,tariff:0.3,batteryKWh:100});
  near(excess.netGridKWh,0);near(excess.renewableAppliedKWh,0.972);near(excess.excessRenewableKWh,9.028);
  near(excess.renewableSavings,0.972*0.3);near(excess.dailyCost,0);
});

test("load engine: voltage, phase, interval, thresholds and consumption ranking are observable",()=>{
  const r=c.calculateLoadSummary([d],{voltage:230,gridLimitKW:0,peakThresholdKW:0.1,measurementInterval:"second"});
  near(r.lineCurrentA,125/230);near(r.intervalEnergyWh,100/3600);assert.equal(r.gridLimitExceeded,true);assert.equal(r.peakThresholdExceeded,true);
  const three=c.calculateLoadSummary([d],{phase:"three",measurementInterval:"minute"});
  near(three.lineCurrentA,125/(400*Math.sqrt(3)));near(three.intervalEnergyWh,100/60);
  near(three.dailyKWh,r.dailyKWh);assert.equal(three.gridLimitExceeded,false);
  const ranked=c.calculateLoadSummary([{...d,name:"small"},{...d,name:"large",quantity:4}]).breakdown;
  assert.deepEqual(ranked.map(row=>row.name),["large","small"]);near(ranked[0].dailyKWh,1.944);
});

test("load engine: empty, zero quantity, unity PF, zero/full hours and zero standby",()=>{
  const empty=c.calculateLoadSummary([]);
  for(const key of ["connectedLoadKW","realPowerKW","reactivePowerKVAR","apparentPowerKVA","dailyKWh","peakDemandKW","averageLoadKW","loadFactor","lineCurrentA","dailyCost","carbonKgCO2"])near(empty[key],0);
  assert.equal(empty.batteryHours,null);assert.equal(empty.breakdown.length,0);
  near(c.apparentPowerKVA({...d,quantity:0,pf:0}),0);near(c.reactivePowerKVAR({...d,quantity:0,pf:0}),0);
  near(c.totalDailyConsumptionKWh([{...d,quantity:0}]),0);
  const full=c.calculateLoadSummary([{watts:1000,pf:1,hoursPerDay:24}]);near(full.dailyKWh,24);near(full.loadFactor,1);
});

test("load engine: rejects invalid inputs and arithmetic overflow instead of NaN/Infinity",()=>{
  for(const patch of [{pf:0},{pf:NaN},{hoursPerDay:25},{quantity:-1},{dutyCycle:101},{watts:Infinity},{standbyW:-1},{seasonalFactor:Infinity}])assert.throws(()=>c.calculateLoadSummary([{...d,...patch}]),{name:"RangeError"});
  assert.throws(()=>c.calculateLoadSummary([d],{diversityFactor:2}));
  assert.throws(()=>c.costPerInterval(Number.MAX_VALUE,2));
  assert.throws(()=>c.calculateLoadSummary([{watts:Number.MAX_VALUE,pf:1,hoursPerDay:24,seasonalFactor:1000}]));
  assert.throws(()=>c.calculateLoadSummary([d],{voltage:Number.MIN_VALUE}));
});

test("load engine: repeated calculations do not mutate inputs",()=>{
  const devices=Object.freeze([Object.freeze({...d})]);const settings=Object.freeze({households:2});
  assert.deepEqual(c.calculateLoadSummary(devices,settings),c.calculateLoadSummary(devices,settings));
  assert.equal(devices[0].quantity,2);assert.deepEqual(settings,{households:2});
});

test("load engine: full-day factor is bounded and tiny positive PF avoids intermediate overflow",()=>{
  const full=[{watts:7/17,hoursPerDay:24,pf:1}];
  assert.equal(c.loadFactor(full),1);assert.equal(c.calculateLoadSummary(full).loadFactor,1);
  const tiny={watts:1e-200,pf:1e-310};
  near(c.reactivePowerKVAR(tiny),c.apparentPowerKVA(tiny));
  for(const fn of [c.totalDailyConsumptionKWh,c.totalConnectedLoadKW,c.calculateLoadSummary])assert.throws(()=>fn(new Array(1)),{name:"RangeError"});
});

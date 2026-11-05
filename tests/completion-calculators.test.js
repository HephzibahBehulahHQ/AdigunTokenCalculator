import test from "node:test";
import assert from "node:assert/strict";
import {waterRange,holidayCountdowns,TIME_ZONES,pregnancyEstimate} from "../src/additional.js";

test("water range applies explicit base, activity and climate assumptions",()=>{
  assert.deepEqual(waterRange(70),{lowMl:2100,highMl:2450});
  assert.deepEqual(waterRange(70,100,{lowMlPerKg:25,highMlPerKg:30,activityFactor:1.2,climateFactor:1.1}),{lowMl:2410,highMl:2872});
  assert.deepEqual(waterRange(60,0,{lowMlPerKg:30,highMlPerKg:30,activityFactor:1,climateFactor:1}),{lowMl:1800,highMl:1800});
});
test("water assumptions reject invalid ranges, factors and numeric overflow",()=>{
  for(const settings of [{lowMlPerKg:36,highMlPerKg:35},{lowMlPerKg:0},{activityFactor:0},{climateFactor:-1},{highMlPerKg:Infinity},{activityFactor:1e308}])
    assert.throws(()=>waterRange(70,0,settings),/number/);
  assert.throws(()=>waterRange(1,-2000),/number/);
});
test("holiday countdowns use the selected zone's calendar date at midnight",()=>{
  const instant=new Date("2026-01-01T00:30:00Z");
  const west=holidayCountdowns(2026,"US","America/Los_Angeles",instant);
  const east=holidayCountdowns(2026,"US","Asia/Tokyo",instant);
  assert.equal(west.referenceDate,"2025-12-31");assert.equal(west.holidays[0].days,1);
  assert.equal(east.referenceDate,"2026-01-01");assert.equal(east.holidays[0].days,0);
  assert.ok(TIME_ZONES.includes("UTC"));assert.ok(TIME_ZONES.includes("Europe/Berlin"));
});
test("holiday calendar differences do not count DST hours as partial days",()=>{
  const result=holidayCountdowns(2026,"DE","Europe/Berlin",new Date("2026-03-28T23:30:00Z"));
  assert.equal(result.referenceDate,"2026-03-29");
  assert.equal(result.holidays.find(row=>row.name==="Good Friday").days,5);
  assert.throws(()=>holidayCountdowns(2026,"DE","Invalid/Zone"),/zone/);
  assert.throws(()=>holidayCountdowns(2026,"DE","UTC",new Date(NaN)),/zone/);
});
test("pregnancy calendar arithmetic preserves early years",()=>{
  const today=new Date("0100-01-01T12:00:00Z");
  assert.equal(pregnancyEstimate("lmp","0099-12-01",today).gestationalDays,3);
});

import test from "node:test";
import assert from "node:assert/strict";
import {utcDateMilliseconds as utc} from "../src/calendar.js";

test("UTC calendar helper preserves early Gregorian years and leap days",()=>{
 for(const [year,month,day,expected] of [
  [0,0,1,"0000-01-01"], [1,0,1,"0001-01-01"], [99,0,1,"0099-01-01"],
  [4,1,29,"0004-02-29"], [2000,1,29,"2000-02-29"]
 ])assert.equal(new Date(utc(year,month,day)).toISOString(),expected+"T00:00:00.000Z");
});

test("UTC calendar helper retains month and day overflow across year boundaries",()=>{
 for(const [year,month,day,expected] of [
  [99,12,1,"0100-01-01"], [100,0,0,"0099-12-31"],
  [100,-1,1,"0099-12-01"], [100,1,29,"0100-03-01"],
  [4,2,0,"0004-02-29"], [2026,2,32,"2026-04-01"]
 ])assert.equal(new Date(utc(year,month,day)).toISOString().slice(0,10),expected);
 assert.equal((utc(2026,2,30)-utc(2026,2,29))/86400000,1);
});

test("UTC calendar helper rejects noninteger and out-of-range calendar values",()=>{
 for(const input of [[NaN,0,1],[2026,Infinity,1],[2026,0,1.5],["99",0,1],[1000000,0,1]])
  assert.throws(()=>utc(...input),/date/);
});

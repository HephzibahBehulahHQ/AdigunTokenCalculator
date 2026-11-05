import test from "node:test";
import assert from "node:assert/strict";
import {summarizeNumbers, MAX_STATISTICS_VALUES, MAX_STATISTICS_INPUT_LENGTH} from "../src/statistics.js";

test("statistics retain ordinary outputs, ties and singleton semantics",()=>{
  assert.deepEqual(summarizeNumbers("1,2;2\n3"),{
    count:4,mean:2,median:2,mode:[2],min:1,max:3,range:2,
    populationVariance:0.5,populationStdDev:Math.sqrt(0.5),sampleVariance:2/3,sampleStdDev:Math.sqrt(2/3)
  });
  assert.deepEqual(summarizeNumbers("1 1 2 2 3").mode,[1,2]);
  assert.deepEqual(summarizeNumbers("1 2 3").mode,[]);
  assert.deepEqual(summarizeNumbers("7.5"),{
    count:1,mean:7.5,median:7.5,mode:[],min:7.5,max:7.5,range:0,
    populationVariance:0,populationStdDev:0,sampleVariance:null,sampleStdDev:null
  });
});

test("statistics keep finite large means and medians without sum overflow",()=>{
  for(const value of [1e308,Number.MAX_VALUE,-Number.MAX_VALUE]){
    const result=summarizeNumbers(`${value},${value}`);
    assert.equal(result.mean,value);
    assert.equal(result.median,value);
    assert.equal(result.populationVariance,0);
    assert.equal(result.sampleVariance,0);
  }
  assert.equal(summarizeNumbers("1e16,1,-1e16").mean,1/3);
  const close=summarizeNumbers("10000000000000000,10000000000000002");
  assert.equal(close.populationVariance,1);
  assert.equal(close.sampleVariance,2);
});

test("statistics scale squared deviations before accumulating finite variance",()=>{
  const result=summarizeNumbers("-1e154,0,1e154");
  assert.equal(result.mean,0);
  assert.equal(result.median,0);
  assert.ok(Math.abs(result.populationVariance/6.666666666666667e307-1)<1e-14);
  assert.ok(Math.abs(result.sampleVariance/1e308-1)<1e-14);
  assert.ok(Object.values(result).filter(value=>typeof value==="number").every(Number.isFinite));
});

test("statistics support long unique lists without spreading function arguments",()=>{
  const count=150000,source=Array.from({length:count},(_,index)=>index).join(",");
  const result=summarizeNumbers(source);
  assert.equal(result.count,count);
  assert.equal(result.mean,(count-1)/2);
  assert.equal(result.median,(count-1)/2);
  assert.equal(result.range,count-1);
  assert.deepEqual(result.mode,[]);
  assert.ok(Math.abs(result.populationVariance-(count**2-1)/12)<1e-5);
});

test("statistics enforce explicit value/text limits",()=>{
  assert.equal(summarizeNumbers("0 ".repeat(MAX_STATISTICS_VALUES)).count,MAX_STATISTICS_VALUES);
  for(const text of ["0 ".repeat(MAX_STATISTICS_VALUES+1)," ".repeat(MAX_STATISTICS_INPUT_LENGTH+1)])
    assert.throws(()=>summarizeNumbers(text),error=>error.code==="statistics-too-large");
});

test("statistics reject invalid and nonrepresentable results rather than report infinity or false zero",()=>{
  for(const text of [""," \t", "1,nope", "1,Infinity", "NaN", "1e308,-1e308", "0,1e308", "0,1e-200"])
    assert.throws(()=>summarizeNumbers(text),/number/);
  assert.equal(summarizeNumbers(String(Number.MIN_VALUE)).mean,Number.MIN_VALUE);
});

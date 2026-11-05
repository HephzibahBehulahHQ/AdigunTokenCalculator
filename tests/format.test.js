import test from "node:test";
import assert from "node:assert/strict";
import {formatNumber} from "../src/format.js";
import {unit} from "../src/calculators.js";

const locales=["en","de","yo","pcm"];

test("ordinary number formatting preserves grouping, precision and numeric-string coercion",()=>{
  assert.equal(formatNumber(1234.56789),"1,234.568");
  assert.equal(formatNumber("1234.56789","de"),"1.234,568");
  assert.equal(formatNumber(1234.5,"en",8,true),"1,234.5");
  assert.equal(formatNumber(1234.5,"de",8,true),"1.234,5");
  assert.equal(formatNumber(-1234.5,"de",8,true),"-1.234,5");
  assert.equal(formatNumber(1e-9,"en",8),"0","preservation is explicitly opt-in");
});

test("small decimal and binary unit results remain nonzero in all four locales",()=>{
  const byteToGB=unit(1,"byte","GB","digital"),bitToGiB=unit(1,"bit","GiB","digital");
  assert.equal(byteToGB,1e-9);
  assert.equal(bitToGiB,1/8589934592);
  for(const locale of locales){
    assert.equal(formatNumber(byteToGB,locale,8,true),"1E-9");
    assert.equal(formatNumber(bitToGiB,locale,8,true),locale==="de"?"1,1641532E-10":"1.1641532E-10");
    assert.equal(formatNumber(-byteToGB,locale,8,true),"-1E-9");
    assert.equal(formatNumber(-bitToGiB,locale,8,true),locale==="de"?"-1,1641532E-10":"-1.1641532E-10");
  }
});

test("true zero retains ordinary formatting and small-value signs remain intact",()=>{
  for(const locale of locales){
    assert.equal(formatNumber(unit(0,"byte","GB","digital"),locale,8,true),"0");
    assert.equal(formatNumber(-0,locale,8,true),(-0).toLocaleString(locale,{maximumFractionDigits:8}));
    assert.equal(formatNumber("-0.000000001",locale,8,true),"-1E-9");
  }
});

test("scientific fallback stops at the ordinary rounding threshold",()=>{
  for(const locale of locales){
    const decimal=locale==="de"?"0,00000001":"0.00000001";
    assert.equal(formatNumber(4.99999999e-9,locale,8,true),"5E-9");
    assert.equal(formatNumber(5e-9,locale,8,true),decimal);
    assert.equal(formatNumber(-5e-9,locale,8,true),"-"+decimal);
    assert.equal(formatNumber(5.00000001e-9,locale,8,true),decimal);
  }
  assert.equal(formatNumber(0.00049,"en",3,true),"4.9E-4");
  assert.equal(formatNumber(0.0005,"en",3,true),"0.001");
  assert.equal(formatNumber(0.49,"en",0,true),"4.9E-1");
  assert.equal(formatNumber(0.5,"en",0,true),"1");
});

test("smallest representable nonzero numbers are not formatted as zero",()=>{
  for(const locale of locales){
    assert.equal(formatNumber(Number.MIN_VALUE,locale,8,true),"5E-324");
    assert.equal(formatNumber(-Number.MIN_VALUE,locale,8,true),"-5E-324");
  }
});

test("nonfinite and malformed numeric values retain the number error",()=>{
  for(const value of [NaN,Infinity,-Infinity,undefined,"NaN","Infinity","-Infinity","1e999","not a number"]){
    for(const preserveSmall of [false,true])assert.throws(()=>formatNumber(value,"en",8,preserveSmall),/^Error: number$/);
  }
});

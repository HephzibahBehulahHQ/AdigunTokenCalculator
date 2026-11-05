import test from "node:test";
import assert from "node:assert/strict";
import {splitTip} from "../src/additional.js";

test("tip rounding preserves exact cents and rounds half cents up",()=>{
  for(const [bill,people,rounding,expected] of [
    [1.10,1,"up",1.10],
    [17.90,1,"down",17.90],
    [0.29,2,"nearest",0.15],
    [2.20,2,"up",1.10],
    [1.005,1,"nearest",1.01],
    [0,3,"up",0],
    [1,3,"up",0.34],
    [1,3,"down",0.33],
    [1,3,"nearest",0.33]
  ]) assert.equal(splitTip(bill,0,0,people,"subtotal",rounding).perPerson,expected,
    `${bill} / ${people}, ${rounding}`);
});

test("tip rounding retains real fractions on either side of a boundary",()=>{
  for(const [bill,rounding,expected] of [
    ["1.1000000000000003","up",1.11],
    ["1.0999999999999999","down",1.09],
    ["1.0049999999999997","nearest",1],
    ["1.0050000000000001","nearest",1.01],
    ["1e-7","up",0.01],
    ["1e-7","down",0],
    ["1e-7","nearest",0],
    ["2.9e-1","nearest",0.29]
  ]) assert.equal(splitTip(bill,0,0,1,"subtotal",rounding).perPerson,expected,
    `${bill}, ${rounding}`);
});

test("tip rounding includes unrounded tax and the selected tip basis",()=>{
  // 0.10 + 0.005 tax + 0.01 tip = 0.115; after-tax tip makes 0.1155.
  assert.equal(splitTip(0.10,10,5,1,"subtotal","nearest").perPerson,0.12);
  assert.equal(splitTip(0.10,10,5,1,"with-tax","up").perPerson,0.12);
  assert.equal(splitTip(0.10,10,5,1,"with-tax","down").perPerson,0.11);
  // 0.29 + 0.145 tip = 0.435, not 0.43.
  assert.equal(splitTip(0.29,50,0,1,"subtotal","nearest").perPerson,0.44);
  assert.equal(splitTip(19.99,12.5,7.25,3,"subtotal","nearest").perPerson,7.98);
  assert.equal(splitTip(19.99,12.5,7.25,3,"with-tax","nearest").perPerson,8.04);
});

test("tip splitter rejects invalid values and unrepresentable monetary results",()=>{
  for(const args of [
    [-1,10,5,2], [1,-1,5,2], [1,10,101,2], [1,10,5,1.5],
    [1,10,5,0], [1,10,5,10001], [Infinity,0,0,1],
    [1,10,5,2,"unknown"], [1,10,5,2,"subtotal","unknown"],
    [1e308,100,100,1], [1e15,0,0,3]
  ]) assert.throws(()=>splitTip(...args),/number/);
});

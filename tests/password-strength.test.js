import test from "node:test";
import assert from "node:assert/strict";
import zxcvbn from "zxcvbn";
import {scorePassword} from "../src/password-strength.js";

const variedFixture="vR9!k2@Z7#pL4$mQ8";

test("local zxcvbn ranks common and repetitive fixtures below a varied fixture",()=>{
  const varied=scorePassword(variedFixture);
  for(const weak of ["password","aaaaaaaaaaaaaaaa","qwerty123"]){
    const result=scorePassword(weak);
    assert.ok(result.score<varied.score,weak);
    assert.ok(result.guessesLog10<varied.guessesLog10,weak);
  }
  assert.ok(Number.isInteger(varied.score)&&varied.score>=0&&varied.score<=4);
  assert.ok(Number.isFinite(varied.guessesLog10));
});

test("wrapper retains actual library estimates and unique pattern names only",()=>{
  const fixture="password-password-12345-12345",raw=zxcvbn(fixture);
  assert.deepEqual(scorePassword(fixture),{
    score:raw.score,
    guessesLog10:raw.guesses_log10,
    patterns:[...new Set(raw.sequence.map(match=>match.pattern))]
  });
  const repeated=scorePassword("aaaaaaaaaaaaaaaa");
  assert.ok(repeated.patterns.includes("repeat"));
  assert.equal(new Set(repeated.patterns).size,repeated.patterns.length);
  assert.ok(scorePassword("password").patterns.includes("dictionary"));
});

test("results exclude plaintext passwords, matched substrings and rich library records",()=>{
  for(const fixture of [variedFixture,"UnsharedMarker!password!4827"]){
    const result=scorePassword(fixture);
    assert.deepEqual(Object.keys(result).sort(),["guessesLog10","patterns","score"]);
    assert.equal(JSON.stringify(result).includes(fixture),false);
    assert.equal(JSON.stringify(result).includes("UnsharedMarker"),false);
    assert.ok(result.patterns.every(pattern=>typeof pattern==="string"));
    assert.ok(!Object.hasOwn(result,"password"));
    assert.ok(!Object.hasOwn(result,"sequence"));
    assert.ok(!Object.hasOwn(result,"feedback"));
  }
});

test("password limit counts Unicode code points and accepts the exact boundary",()=>{
  for(const fixture of ["a","a".repeat(128),"😀".repeat(128)]){
    const result=scorePassword(fixture);
    assert.ok(Number.isInteger(result.score));
    assert.ok(Number.isFinite(result.guessesLog10));
  }
  for(const fixture of ["a".repeat(129),"😀".repeat(129),"😀".repeat(128)+"a"])assert.throws(()=>scorePassword(fixture),/number/);
});

test("password input validation rejects empty/non-string values without trimming passwords",()=>{
  for(const value of ["",null,undefined,0,123,true,[],{},new String("password")])assert.throws(()=>scorePassword(value),/number/);
  for(const fixture of [" ","  password  "]){
    const actual=scorePassword(fixture),raw=zxcvbn(fixture);
    assert.equal(actual.score,raw.score);
    assert.equal(actual.guessesLog10,raw.guesses_log10);
  }
});

import test from "node:test";
import assert from "node:assert/strict";
import {RESULT_COPY,RESULT_LABELS,resultText} from "../src/result-i18n.js";
import "../src/feature-i18n.js";
import {holidayDates,convertTimeZone} from "../src/additional.js";

test("dynamic result templates preserve values and literal substitution text",()=>{
  assert.equal(resultText("de","weeksDays",{weeks:12,days:3}),"Wochen: 12, Tage: 3");
  assert.equal(resultText("de","jsonSyntaxAt",{line:2,column:7}),"JSON-Syntaxfehler in Zeile 2, Spalte 7");
  assert.equal(resultText("en","textBytes",{count:"$& {line}"}),"Text ($& {line} bytes)");
  assert.equal(resultText("unknown","yes"),"Yes");
  assert.equal(resultText("en","textBytes",Object.create({count:4})),"Text ({count} bytes)");
});

test("every locale covers dynamic result states without losing parameters",()=>{
  const keys=Object.keys(RESULT_COPY.en).sort();
  for(const locale of ["en","de","yo","pcm"]){
    assert.deepEqual(Object.keys(RESULT_COPY[locale]).sort(),keys);
    for(const key of keys){
      assert.deepEqual((RESULT_COPY[locale][key].match(/\{\w+\}/g)||[]).sort(),(RESULT_COPY.en[key].match(/\{\w+\}/g)||[]).sort(),locale+":"+key);
      assert.doesNotMatch(resultText(locale,key,{weeks:12,days:3,count:64,line:2,column:7}),/\{\w+\}/);
    }
  }
});

test("actual holiday calculations have localized result labels in every region",()=>{
  for(const locale of ["en","de","yo","pcm"]){
    for(const key of ["Local ISO","QR content","Input"])assert.ok(RESULT_LABELS[locale][key],locale+":"+key);
    for(const region of ["US","GB","DE","NG","CA"]){
      for(const [name] of holidayDates(2026,region))assert.ok(Object.hasOwn(RESULT_LABELS[locale],name),locale+":"+region+":"+name);
    }
  }
});

test("time-zone output uses the chosen app locale",()=>{
  const german=convertTimeZone("2026-07-01T12:00","UTC","Europe/Berlin","de");
  assert.equal(german.local,"2026-07-01T14:00");
  assert.equal(german.localFormatted,"01.07.2026, 14:00");
  assert.notEqual(german.localFormatted,convertTimeZone("2026-07-01T12:00","UTC","Europe/Berlin","en").localFormatted);
});

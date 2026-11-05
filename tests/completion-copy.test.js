import test from "node:test";
import assert from "node:assert/strict";
import {COMPLETION_COPY,completionText} from "../src/completion-i18n.js";
import {I} from "../src/i18n.js";
import {errorFields} from "../src/form-errors.js";

test("completion controls, assumptions and progress copy cover every locale explicitly",()=>{
 const keys=Object.keys(COMPLETION_COPY.en).sort(),fields=Object.keys(COMPLETION_COPY.en.fields).sort();
 for(const locale of ["en","de","yo","pcm"]){
  const copy=COMPLETION_COPY[locale];assert.deepEqual(Object.keys(copy).sort(),keys);assert.deepEqual(Object.keys(copy.fields).sort(),fields);
  for(const key of keys.filter(key=>key!=="fields"))assert.ok(typeof copy[key]==="string"&&copy[key].trim(),locale+": "+key);
  for(const key of fields)assert.equal(I[locale].fields[key],copy.fields[key]);
  for(const key of ["water","demographics","qibla","holiday"])assert.ok(I[locale].notices[key]);
  const preview=completionText(locale,"previewRange",{start:2001,end:4000,total:5000});
  for(const number of ["2001","4000","5000"])assert.ok(preview.includes(number));
  assert.doesNotMatch(preview,/\{\w+\}/);
 }
});

test("new input limits and confirmed defects attach to the appropriate control",()=>{
 assert.deepEqual(errorFields("json",Object.assign(Error("limit"),{code:"json-too-large"})),["text"]);
 assert.deepEqual(errorFields("stats",Object.assign(Error("limit"),{code:"statistics-too-large"})),["numbers"]);
 assert.deepEqual(errorFields("demographics",Error("number"),{total:1000,shares:"Christianity,"}),["shares"]);
 assert.deepEqual(errorFields("demographics",Error("number"),{total:-1,shares:"Group,100"}),["total"]);
 assert.deepEqual(errorFields("water",Error("number"),{weightKg:70,lowMlPerKg:35,highMlPerKg:30,activityFactor:1,climateFactor:1,extraMl:0}),["lowMlPerKg","highMlPerKg"]);
 assert.deepEqual(errorFields("water",Error("number"),{weightKg:70,activityFactor:0,climateFactor:1,extraMl:0}),["activityFactor"]);
 assert.deepEqual(errorFields("stats",Error("number"),{numbers:"1; 2; 3"}),[]);
});

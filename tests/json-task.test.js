import test from "node:test";
import assert from "node:assert/strict";
import {runJsonTask, validateJsonTask, MAX_JSON_INPUT_LENGTH, MAX_JSON_OUTPUT_LENGTH} from "../src/json-task.js";

test("JSON task preserves exact numeric and string tokens in both modes",()=>{
  const compact='{"large":9007199254740993,"negative":-0,"exp":1e400,"text":"a\\\\b\\n\\\"😊","a":[],"a":{}}';
  const pretty=runJsonTask({source:compact,mode:"pretty"});
  assert.match(pretty,/9007199254740993/);
  assert.match(pretty,/"negative": -0/);
  assert.equal(runJsonTask({source:pretty,mode:"minify"}),compact);
  assert.equal(runJsonTask({source:" [ ] ",mode:"pretty"}),"[]");
});

test("JSON task validates input/mode and retains syntax locations",()=>{
  assert.throws(()=>runJsonTask(null),/empty/);
  for(const source of [undefined,null,1,""," \n\t"])
    assert.throws(()=>runJsonTask({source}),/empty/);
  assert.throws(()=>runJsonTask({source:"{}",mode:"unknown"}),/number/);
  assert.throws(()=>runJsonTask({source:'{\n"x":\n}'}),/JSON syntax error at line 3, column 1/);
});

test("JSON task accepts the input limit and rejects excess before parsing",()=>{
  const source='"'+"x".repeat(MAX_JSON_INPUT_LENGTH-2)+'"';
  assert.equal(source.length,MAX_JSON_INPUT_LENGTH);
  assert.equal(runJsonTask({source,mode:"minify"}),source);
  assert.throws(()=>validateJsonTask(" ".repeat(MAX_JSON_INPUT_LENGTH+1)),
    error=>error.code==="json-too-large"&&error.message==="json-too-large");
});

test("JSON task bounds pretty indentation while respecting strings and minify",()=>{
  const nested="[".repeat(2500)+"0"+"]".repeat(2500);
  assert.ok(nested.length<MAX_JSON_INPUT_LENGTH);
  assert.ok(2*2500**2>MAX_JSON_OUTPUT_LENGTH);
  assert.throws(()=>runJsonTask({source:nested,mode:"pretty"}),error=>error.code==="json-too-large");
  assert.equal(runJsonTask({source:nested,mode:"minify"}),nested);
  const quoted=JSON.stringify("[{}]\\\"".repeat(10000));
  assert.equal(runJsonTask({source:quoted,mode:"pretty"}),quoted);
});

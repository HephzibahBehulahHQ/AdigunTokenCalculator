import test from "node:test";
import assert from "node:assert/strict";
import {tokenize,encodings} from "../src/tokenizer.js";

test("concurrent first loads keep independent encoding results",async()=>{
  const requests=[
    ["cl100k_base","Hello, world!",[9906,11,1917,0]],
    ["o200k_base","Hello, world!",[13225,11,2375,0]],
    ["cl100k_base","red",[1171]],
    ["o200k_base","red",[1291]]
  ];
  const results=await Promise.all(requests.map(([encoding,text])=>tokenize(text,encoding)));
  for(const [index,[,text,ids]] of requests.entries()){
    assert.deepEqual(results[index].ids,ids);
    assert.equal(results[index].pieces.join(""),text);
  }
});
test("tokenizer preserves whitespace and Unicode byte boundaries",async()=>{for(const encoding of ["cl100k_base","o200k_base"]){for(const text of ["red"," Red"," red","  tabs\tand\nnewlines  ","Yorùbá 😊 日本語","<|endoftext|>"]){const result=await tokenize(text,encoding);assert.ok(Array.isArray(result.ids));assert.equal(result.pieces.join(""),text);assert.equal(result.chars,[...text].length);}}});

import {modelMappings} from "../src/tokenizer.js";
test("supported model labels map to their documented encodings",()=>{assert.equal(modelMappings["GPT-4o"],"o200k_base");assert.equal(modelMappings["GPT-4o mini"],"o200k_base");assert.equal(modelMappings["GPT-4"],"cl100k_base");assert.equal(modelMappings["GPT-3.5 Turbo"],"cl100k_base");});
test("leading whitespace changes tokenisation and empty input is valid",async()=>{const red=await tokenize("red","cl100k_base"),spaceRed=await tokenize(" Red","cl100k_base"),lowerSpaceRed=await tokenize(" red","cl100k_base");assert.notDeepEqual(red.ids,spaceRed.ids);assert.notDeepEqual(red.ids,lowerSpaceRed.ids);assert.deepEqual(await tokenize("","o200k_base"),{ids:[],pieces:[],chars:0});});

test("Unicode token pieces preserve BOM, combining marks, ZWJ, CRLF and literal special markers",async()=>{
  const source="\uFEFF\u0000e\u0301 Ẹ kú àárọ̀ 👩🏽‍💻 👨‍👩‍👧‍👦 🇳🇬 日本語 العربية\r\n� <|endoftext|><|fim_prefix|>\uFEFF";
  for(const [encoding] of encodings){
    const result=await tokenize(source,encoding);
    assert.equal(result.pieces.length,result.ids.length);
    assert.equal(result.pieces.join(""),source);
    assert.equal(result.chars,Array.from(source).length);
    assert.equal(result.ids.every(Number.isInteger),true);
  }
});

test("long multilingual text round trips without trimming or truncating",async()=>{
  const source="  Yorùbá 😊 日本語\tالعربية\r\n".repeat(2000);
  for(const [encoding] of encodings){
    const result=await tokenize(source,encoding);
    assert.equal(result.pieces.join(""),source);
    assert.equal(result.chars,Array.from(source).length);
    assert.ok(result.ids.length>10000);
  }
});

test("unsupported encodings and malformed input fail without poisoning the next request",async()=>{
  for(const name of ["constructor","toString","r50k_base","p50k_base","unknown"]){
    await assert.rejects(tokenize("private input",name),/^Error: encoding$/);
  }
  await assert.rejects(tokenize(null,"o200k_base"),/^Error: text$/);
  // A lone UTF-16 surrogate has no exact UTF-8 representation. Fail rather than
  // silently claiming its replacement character reconstructs the input.
  await assert.rejects(tokenize("\ud800","o200k_base"),/reconstruction/);
  assert.equal((await tokenize("After failure 😊","o200k_base")).pieces.join(""),"After failure 😊");
});

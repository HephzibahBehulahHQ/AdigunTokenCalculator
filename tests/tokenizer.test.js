import test from "node:test";
import assert from "node:assert/strict";
import {tokenize} from "../src/tokenizer.js";
test("tokenizer preserves whitespace and Unicode byte boundaries",async()=>{for(const encoding of ["cl100k_base","o200k_base"]){for(const text of ["red"," Red"," red","  tabs\tand\nnewlines  ","Yorùbá 😊 日本語","<|endoftext|>"]){const result=await tokenize(text,encoding);assert.ok(Array.isArray(result.ids));assert.equal(result.pieces.join(""),text);assert.equal(result.chars,[...text].length);}}});

import {modelMappings} from "../src/tokenizer.js";
test("supported model labels map to their documented encodings",()=>{assert.equal(modelMappings["GPT-4o"],"o200k_base");assert.equal(modelMappings["GPT-4o mini"],"o200k_base");assert.equal(modelMappings["GPT-4"],"cl100k_base");assert.equal(modelMappings["GPT-3.5 Turbo"],"cl100k_base");});
test("leading whitespace changes tokenisation and empty input is valid",async()=>{const red=await tokenize("red","cl100k_base"),spaceRed=await tokenize(" Red","cl100k_base"),lowerSpaceRed=await tokenize(" red","cl100k_base");assert.notDeepEqual(red.ids,spaceRed.ids);assert.notDeepEqual(red.ids,lowerSpaceRed.ids);assert.deepEqual(await tokenize("","o200k_base"),{ids:[],pieces:[],chars:0});});

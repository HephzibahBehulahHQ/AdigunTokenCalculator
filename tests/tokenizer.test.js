import test from "node:test";
import assert from "node:assert/strict";
import {tokenize} from "../src/tokenizer.js";
test("tokenizer preserves whitespace and Unicode byte boundaries",async()=>{for(const encoding of ["cl100k_base","o200k_base"]){for(const text of ["red"," Red"," red","  tabs\tand\nnewlines  ","Yorùbá 😊 日本語","<|endoftext|>"]){const result=await tokenize(text,encoding);assert.ok(Array.isArray(result.ids));assert.equal(result.pieces.join(""),text);assert.equal(result.chars,[...text].length);}}});

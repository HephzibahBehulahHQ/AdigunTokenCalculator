import test from "node:test";
import assert from "node:assert/strict";
import qrcode from "qrcode-generator";
import {createQr} from "../src/qr.js";

const matrix=qr=>Array.from({length:qr.getModuleCount()},(_,row)=>Array.from({length:qr.getModuleCount()},(_,col)=>qr.isDark(row,col)));
function referenceBytes(bytes){
 const utf8=qrcode.stringToBytes;
 try{
  // Independent, literal byte vectors avoid reusing the production encoder.
  qrcode.stringToBytes=()=>bytes;
  const qr=qrcode(0,"M");qr.addData("byte vector");qr.make();return matrix(qr);
 }finally{qrcode.stringToBytes=utf8;}
}
test("QR encodes Yoruba accents and emoji as UTF-8 bytes",()=>{
 assert.deepEqual(matrix(createQr("Yorùbá 😊")),referenceBytes([89,111,114,195,185,98,195,161,32,240,159,152,138]));
});
test("QR does not collapse Unicode code points into low-byte collisions",()=>{
 assert.notDeepEqual(matrix(createQr("Ā")),matrix(createQr("\0")));
 assert.deepEqual(matrix(createQr("Ā")),referenceBytes([196,128]));
});
test("QR preserves ASCII payloads",()=>{
 assert.deepEqual(matrix(createQr("hello")),referenceBytes([104,101,108,108,111]));
});

import test from "node:test";
import assert from "node:assert/strict";
import {createWorkerClient} from "../src/worker-client.js";

class FakeWorker{
  messages=[];listeners={};terminated=false;
  addEventListener(type,listener){this.listeners[type]=listener;}
  postMessage(message){this.messages.push(message);}
  terminate(){this.terminated=true;}
  emit(type,data){this.listeners[type]?.({data,preventDefault(){}});}
  reply(index,result){this.emit("message",{id:this.messages[index].id,ok:true,result});}
}
function setup(){
  const workers=[];
  const client=createWorkerClient(()=>{const worker=new FakeWorker();workers.push(worker);return worker;},
    {sameRequest:(a,b)=>a.text===b.text});
  return{client,workers};
}

test("worker queue retains only the latest edit and delivers each result to its request",async()=>{
  const {client,workers}=setup(),first=client.request({text:"first"}),obsolete=client.request({text:"obsolete"});
  const cancelled=assert.rejects(obsolete,{name:"AbortError"});
  const latest=client.request({text:"latest"});
  assert.deepEqual(workers[0].messages.map(x=>x.payload.text),["first"]);
  workers[0].emit("message",{id:999,ok:true,result:"incorrect"});
  workers[0].reply(0,"first result");
  assert.equal(await first,"first result");
  assert.deepEqual(workers[0].messages.map(x=>x.payload.text),["first","latest"]);
  workers[0].reply(1,"latest result");
  assert.equal(await latest,"latest result");await cancelled;
});

test("equal active and queued requests reuse their promises",async()=>{
  const {client,workers}=setup(),active=client.request({text:"same"});
  assert.equal(client.request({text:"same"}),active);
  const queued=client.request({text:"queued"});
  assert.equal(client.request({text:"queued"}),queued);
  workers[0].reply(0,1);workers[0].reply(1,2);
  assert.equal(await active,1);assert.equal(await queued,2);
  assert.equal(workers[0].messages.length,2);
});

test("returning to the active input cancels the obsolete queued edit",async()=>{
  const {client,workers}=setup(),active=client.request({text:"first"}),queued=client.request({text:"next"});
  const cancelled=assert.rejects(queued,{name:"AbortError"});
  assert.equal(client.request({text:"first"}),active);
  workers[0].reply(0,1);assert.equal(await active,1);await cancelled;
  assert.equal(workers[0].messages.length,1);
});

test("cancel terminates work, ignores old replies, and starts a fresh worker",async()=>{
  const {client,workers}=setup(),active=client.request({text:"first"}),queued=client.request({text:"next"});
  const cancelled=Promise.all([assert.rejects(active,{name:"AbortError"}),assert.rejects(queued,{name:"AbortError"})]);
  client.cancel();await cancelled;assert.equal(workers[0].terminated,true);
  const next=client.request({text:"fresh"});assert.equal(workers.length,2);
  workers[0].reply(0,"obsolete");workers[1].reply(0,"fresh result");
  assert.equal(await next,"fresh result");
  workers[1].emit("message",{}); // A malformed/late idle message is harmless.
});

test("worker runtime and message failures clear pending work and permit retry",async()=>{
  for(const event of ["error","messageerror"]){
    const {client,workers}=setup(),active=client.request({text:"sensitive"}),queued=client.request({text:"also sensitive"});
    const failed=Promise.all([assert.rejects(active,/^Error: worker unavailable$/),assert.rejects(queued,/^Error: worker unavailable$/)]);
    workers[0].emit(event);await failed;assert.equal(workers[0].terminated,true);
    const retry=client.request({text:"retry"});workers[1].reply(0,"okay");assert.equal(await retry,"okay");
  }
});

test("worker startup and post failures reject safely and permit retry",async()=>{
  for(const mode of ["constructor","postMessage"]){
    let calls=0,worker;
    const client=createWorkerClient(()=>{
      if(++calls===1){const failure=()=>{const error=Error("private details");error.code="worker-startup";throw error;};if(mode==="constructor")failure();return{addEventListener(){},postMessage:failure,terminate(){}};}
      return worker=new FakeWorker();
    });
    await assert.rejects(client.request("input"),{message:"worker unavailable",code:"worker-startup"});
    const retry=client.request("retry");worker.reply(0,42);assert.equal(await retry,42);
  }
});

test("calculation errors preserve a safe message and code and allow queued work",async()=>{
  const {client,workers}=setup(),first=client.request({text:"invalid"}),next=client.request({text:"valid"});
  const rejected=assert.rejects(first,{message:"Invalid JSON at line 2",code:"json"});
  workers[0].emit("message",{id:workers[0].messages[0].id,ok:false,error:{message:"Invalid JSON at line 2",code:"json"}});
  await rejected;workers[0].reply(1,"valid result");assert.equal(await next,"valid result");
});

import test,{after} from "node:test";
import assert from "node:assert/strict";
import {existsSync} from "node:fs";
import {mkdtemp,readdir,rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {fileURLToPath} from "node:url";
import {build,preview} from "vite";
import {chromium} from "playwright-core";

const root=fileURLToPath(new URL("../",import.meta.url));
const origin="http://127.0.0.1:4193",base=origin+"/AdigunTokenCalculator/";
const browserAvailable=existsSync(chromium.executablePath());
let buildDirectory,built;
const productionBuild=()=>built??=(async()=>{
  buildDirectory=await mkdtemp(join(tmpdir(),"adigun-tokenizer-"));
  await build({root,logLevel:"silent",build:{outDir:buildDirectory,emptyOutDir:true}});
  return readdir(join(buildDirectory,"assets"));
})();
after(async()=>{await built?.catch(()=>{});if(buildDirectory)await rm(buildDirectory,{recursive:true,force:true});});

test("production tokenizer bundle includes local WASM, a worker and exactly two encoder chunks",async()=>{
  const assets=await productionBuild();
  assert.equal(assets.filter(name=>/^tiktoken_bg-.*\.wasm$/.test(name)).length,1);
  assert.equal(assets.filter(name=>/^tokenizer-worker-.*\.js$/.test(name)).length,1);
  assert.equal(assets.filter(name=>/^cl100k_base-.*\.js$/.test(name)).length,1);
  assert.equal(assets.filter(name=>/^o200k_base-.*\.js$/.test(name)).length,1);
  assert.equal(assets.some(name=>/^(r50k_base|p50k_base|p50k_edit|gpt2)-/.test(name)),false);
});

test("production tokenizer worker retries local WASM, preserves Unicode, stays responsive and works offline",{
  skip:!browserAvailable&&!process.env.CI,timeout:120000
},async()=>{
  const assets=await productionBuild();
  const server=await preview({root,logLevel:"silent",build:{outDir:buildDirectory},preview:{host:"127.0.0.1",port:4193,strictPort:true}});
  let browser;
  try{
    browser=await chromium.launch({headless:true});
    const context=await browser.newContext({locale:"en-US",serviceWorkers:"block"});
    const requests=[],pageErrors=[];
    context.on("request",request=>requests.push({url:request.url(),method:request.method(),body:request.postData()}));
    let wasmRequests=0;
    await context.route("**/*.wasm",route=>++wasmRequests===1?route.abort():route.continue());
    const page=await context.newPage();page.on("pageerror",error=>pageErrors.push(error.message));
    await page.goto(base+"#/token");
    const textInput=page.locator('textarea[name="text"]'),encodingInput=page.locator('select[name="encoding"]');
    await textInput.fill("Hello, world!");
    await page.waitForFunction(()=>/could not|unavailable/i.test(document.querySelector('#panel form [role="status"]')?.textContent||""),null,{timeout:30000});
    assert.equal(wasmRequests,1,"the first local WASM request deliberately fails");
    const calculate=()=>page.locator('#panel button[type="submit"]').click();
    await calculate();
    await page.waitForFunction(()=>document.querySelector(".segments")?.textContent==="Hello, world!",null,{timeout:30000});
    assert.ok(wasmRequests>=2,"retry must load the same locally built WASM asset");
    assert.equal(await page.locator(".result-row strong").first().innerText(),"4");

    const source="\uFEFF  Yorùbá 👩🏽‍💻 日本語\t\n<|endoftext|>";
    for(const encoding of ["cl100k_base","o200k_base"]){
      await encodingInput.selectOption(encoding);
      assert.ok((await encodingInput.locator("option:checked").innerText()).includes(encoding));
      await textInput.fill(source);await calculate();
      await page.waitForFunction(expected=>document.querySelector(".segments")?.textContent===expected,source,{timeout:30000});
      assert.equal(await page.locator(".segments").textContent(),source);
    }

    const workerAsset=assets.find(name=>/^tokenizer-worker-.*\.js$/.test(name));
    const longResult=await page.evaluate(async url=>{
      const worker=new Worker(url,{type:"module"}),source="Yorùbá 😊 日本語\n".repeat(10000);
      let heartbeats=0;const interval=setInterval(()=>heartbeats++,5);
      try{
        const result=await new Promise((resolve,reject)=>{
          worker.addEventListener("message",event=>event.data.ok?resolve(event.data.result):reject(Error("worker calculation failed")),{once:true});
          worker.addEventListener("error",()=>reject(Error("worker startup failed")),{once:true});
          worker.postMessage({id:1,payload:{text:source,name:"o200k_base"}});
        });
        return{exact:result.pieces.join("")===source,chars:result.chars,expectedChars:Array.from(source).length,heartbeats};
      }finally{clearInterval(interval);worker.terminate();}
    },base+"assets/"+workerAsset);
    assert.equal(longResult.exact,true);assert.equal(longResult.chars,longResult.expectedChars);
    assert.ok(longResult.heartbeats>0,"main-thread timers must run while the worker tokenizes a long input");

    const beforeOffline=requests.length;
    await context.setOffline(true);
    await textInput.fill("Offline Yorùbá 😊");await calculate();
    await page.waitForFunction(()=>document.querySelector(".segments")?.textContent==="Offline Yorùbá 😊");
    assert.equal(requests.length,beforeOffline,"loaded tokenization must not request any assets or submit text");
    assert.deepEqual(await page.evaluate(()=>({local:Object.keys(localStorage),session:Object.keys(sessionStorage)})),{local:[],session:[]});
    assert.deepEqual(requests.filter(request=>new URL(request.url).origin!==origin),[]);
    assert.equal(requests.every(request=>request.method==="GET"&&request.body===null),true);
    assert.deepEqual(pageErrors,[]);
  }finally{
    await browser?.close();await new Promise(resolve=>server.httpServer.close(resolve));
  }
});

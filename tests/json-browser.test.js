import test from "node:test";
import assert from "node:assert/strict";
import {existsSync} from "node:fs";
import {spawn} from "node:child_process";
import {setTimeout as delay} from "node:timers/promises";
import {chromium} from "playwright-core";

test("JSON worker keeps the browser responsive and discards cancelled/queued work",{
  skip:!existsSync(chromium.executablePath()),timeout:60000
},async()=>{
  const origin="http://127.0.0.1:4197";
  const appUrl=new URL("/AdigunTokenCalculator/",origin).href;
  const server=spawn(process.execPath,["node_modules/vite/bin/vite.js","--host","127.0.0.1","--port","4197","--strictPort"],{stdio:"ignore"});
  let browser;
  try{
    let ready=false;
    for(let attempt=0;attempt<50;attempt++){
      try{if((await fetch(appUrl)).ok){ready=true;break;}}catch{}
      await delay(200);
    }
    assert.ok(ready,"Vite server must become available");
    browser=await chromium.launch({headless:true});
    const page=await browser.newPage();
    await page.goto(appUrl);
    const result=await page.evaluate(async moduleUrl=>{
      const api=await import(moduleUrl);
      await api.formatJsonAsync('{"warm":true}',"minify");
      const source="["+Array(120000).fill("9007199254740993").join(",")+"]";
      let ticks=0;
      const timer=setInterval(()=>ticks++,0);
      const formatted=await api.formatJsonAsync(source,"minify");
      clearInterval(timer);
      const old=api.formatJsonAsync(source,"pretty").catch(error=>error.name);
      api.cancelJsonWork();
      const cancelled=await old;
      const fresh=await api.formatJsonAsync('{"fresh":9007199254740993}',"minify");
      const active=api.formatJsonAsync(source,"minify");
      const superseded=api.formatJsonAsync('{"old":true}',"minify").catch(error=>error.name);
      const latest=api.formatJsonAsync('{"latest":true}',"minify");
      const discarded=await superseded;
      await active;
      const newest=await latest;
      api.cancelJsonWork();
      return{ticks,exact:formatted===source,cancelled,fresh,discarded,newest};
    },new URL("src/json-client.js",appUrl).href);
    assert.ok(result.ticks>0,"main-thread timer must advance while worker formats large JSON");
    assert.equal(result.exact,true);
    assert.equal(result.cancelled,"AbortError");
    assert.equal(result.discarded,"AbortError");
    assert.equal(result.fresh,'{"fresh":9007199254740993}');
    assert.equal(result.newest,'{"latest":true}');
  }finally{
    await browser?.close();
    server.kill("SIGTERM");
  }
});

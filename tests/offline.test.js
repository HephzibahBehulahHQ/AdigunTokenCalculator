import test from "node:test";
import assert from "node:assert/strict";
import {createHash,webcrypto} from "node:crypto";
import {existsSync,mkdtempSync,readFileSync,rmSync,writeFileSync,mkdirSync} from "node:fs";
import {tmpdir} from "node:os";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {runInNewContext} from "node:vm";
import {MessageChannel} from "node:worker_threads";
import {setTimeout as delay} from "node:timers/promises";
import {build,preview} from "vite";
import {chromium} from "playwright-core";
import {offlineAssetsPlugin,renderOfflineWorker,OFFLINE_CACHE_PREFIX,OFFLINE_WORKER_FILE} from "../scripts/offline-assets-plugin.js";
import {OFFLINE_COPY} from "../src/offline-i18n.js";
import {mountOfflineStatus} from "../src/offline.js";

const digest=value=>createHash("sha256").update(value).digest("hex");
const origin="https://calculator.example",scope=origin+"/AdigunTokenCalculator/";
const cachePrefix=OFFLINE_CACHE_PREFIX+encodeURIComponent(new URL(scope).pathname)+":";
const sources=new Map([
  ["index.html","<!doctype html><title>Calculator</title>"],
  ["assets/app-123.js","app"],["assets/tokenizer-worker-123.js","worker"],
  ["assets/tokenizer-123.wasm",new Uint8Array([0,97,115,109])],
  ["assets/cl100k-123.js","cl100k"],["assets/o200k-123.js","o200k"],
  ["assets/password-strength-123.js","strength"],["assets/logo-123.jpg","logo"],
  ["THIRD_PARTY_NOTICES.txt","notices"]
]);
const fixtureConfig=(version="new")=>({version,cachePrefix:OFFLINE_CACHE_PREFIX,assets:[...sources].map(([path,source])=>({path,sha256:digest(source)}))});
const key=request=>typeof request==="string"?request:request.url;

function cacheStorage(){
  const stores=new Map();
  return {
    stores,
    async has(name){return stores.has(name);},
    async keys(){return [...stores.keys()];},
    async delete(name){return stores.delete(name);},
    async open(name){
      if(!stores.has(name))stores.set(name,new Map());
      const store=stores.get(name);
      return {
        async match(request){return store.get(key(request))?.clone();},
        async put(request,response){store.set(key(request),response.clone());},
        async delete(request){return store.delete(key(request));},
        async keys(){return [...store.keys()].map(url=>new Request(url));}
      };
    }
  };
}

function workerHarness({config=fixtureConfig(),storage=cacheStorage()}={}){
  const handlers=new Map(),requests=[],state={offline:false,badAsset:"",claims:0,skips:0,windows:[{url:scope}]};
  const self={registration:{scope},addEventListener(type,listener){handlers.set(type,listener);},
    clients:{async claim(){state.claims++;},async matchAll(){return state.windows;}},
    async skipWaiting(){state.skips++;}};
  const fetch=async request=>{
    const url=key(request);requests.push(url);
    if(state.offline)throw new TypeError("Offline");
    const name=url.slice(scope.length),source=sources.get(name);
    if(name===state.badAsset)return new Response("wrong version");
    return source===undefined?new Response("not found",{status:404}):new Response(source);
  };
  runInNewContext(renderOfflineWorker(config),{self,caches:storage,crypto:webcrypto,fetch,Request,URL,Uint8Array,Map});
  return {state,requests,storage,
    async dispatch(type,extra={}){let task;handlers.get(type)({waitUntil(value){task=value;},...extra});await task;},
    async request(url,{method="GET",mode="cors"}={}){
      let result;handlers.get("fetch")({request:{url,method,mode},respondWith(value){result=value;}});
      return result?await result:undefined;
    },
    async message(type,extra={},source=scope){
      let result;
      await this.dispatch("message",{data:{type,...extra},source:{url:source},ports:[{postMessage(value){result=JSON.parse(JSON.stringify(value));}}]});
      return result;
    }
  };
}

test("offline build manifest includes emitted and public files and binds index to a content revision",()=>{
  const directory=mkdtempSync(path.join(tmpdir(),"adigun-offline-"));
  try{
    mkdirSync(path.join(directory,"public"));writeFileSync(path.join(directory,"public","help.txt"),"public help");
    const buildFixture=changed=>{
      const bundle={"index.html":{type:"asset",source:"<html><head></head><body></body></html>"},
        "assets/lazy.js":{type:"chunk",code:changed?"changed":"lazy"},"assets/code.wasm":{type:"asset",source:new Uint8Array([0,97,115,109])}};
      let emitted;
      const plugin=offlineAssetsPlugin();plugin.configResolved({build:{},publicDir:path.join(directory,"public")});
      plugin.generateBundle.handler.call({emitFile(file){emitted=file;},error(message){throw new Error(message);}},null,bundle);
      const manifest=JSON.parse(emitted.source.match(/\)\((\{.*\})\);\s*$/)[1]);
      return {bundle,manifest,emitted};
    };
    const first=buildFixture(false),same=buildFixture(false),changed=buildFixture(true);
    assert.equal(first.emitted.fileName,OFFLINE_WORKER_FILE);
    assert.equal(first.manifest.version,same.manifest.version);
    assert.notEqual(first.manifest.version,changed.manifest.version);
    assert.match(first.bundle["index.html"].source,new RegExp('name="adigun-offline-build" content="'+first.manifest.version+'"'));
    assert.deepEqual(first.manifest.assets.map(asset=>asset.path),["assets/code.wasm","assets/lazy.js","help.txt","index.html"]);
    assert.equal(first.manifest.assets.find(asset=>asset.path==="index.html").sha256,digest(first.bundle["index.html"].source));
  }finally{rmSync(directory,{recursive:true,force:true});}
});

test("first installation prepares every lazy asset before readiness and works offline without tool warming",async()=>{
  const worker=workerHarness();
  assert.equal((await worker.message("CHECK")).ready,false);
  await worker.dispatch("install");assert.equal(worker.state.skips,0);
  await worker.dispatch("activate");assert.equal(worker.state.claims,1);
  assert.deepEqual(await worker.message("CHECK"),{ok:true,ready:true,version:"new"});
  assert.equal(worker.requests.length,sources.size);
  worker.state.offline=true;
  for(const [name,source] of sources){
    const response=await worker.request(scope+name);
    assert.equal(digest(new Uint8Array(await response.arrayBuffer())),digest(source),name);
  }
  assert.equal(await (await worker.request(scope+"?private=never-store#%2Ftoken",{mode:"navigate"})).text(),sources.get("index.html"));
  for(const url of [scope+"assets/lazy.js?password=private",origin+"/unrelated/export.csv","https://elsewhere.example/asset.js"]){
    assert.equal(await worker.request(url),undefined);
  }
  assert.equal(await worker.request(scope+"index.html",{method:"POST"}),undefined);
  await worker.message("CHECK",{password:"private-input",text:"private-input"});
  const keys=await (await worker.storage.open(cachePrefix+"new")).keys();
  assert.deepEqual(keys.map(request=>request.url).sort(),[...sources.keys()].map(name=>scope+name).sort());
  assert.equal(worker.requests.some(url=>/private|password=|elsewhere/.test(url)),false);
});

test("an interrupted or mismatched new build leaves the working version intact and can retry",async()=>{
  const storage=cacheStorage(),old=await storage.open(cachePrefix+"old");await old.put(scope+"index.html",new Response("old working build"));
  const worker=workerHarness({storage});worker.state.badAsset="assets/tokenizer-123.wasm";
  await assert.rejects(worker.dispatch("install"),/version mismatch/);
  assert.equal(await storage.has(cachePrefix+"new"),false);
  assert.equal(await (await old.match(scope+"index.html")).text(),"old working build");
  worker.state.badAsset="";await worker.dispatch("install");
  assert.equal((await worker.message("CHECK")).ready,true);
  assert.equal(worker.state.skips,0,"a successful new install must wait instead of replacing an active page");
});

test("cache eviction is detected; failed repair reports failure and retry restores only known assets",async()=>{
  const worker=workerHarness();await worker.dispatch("install");
  const cache=await worker.storage.open(cachePrefix+"new");
  await cache.delete(scope+"assets/o200k-123.js");
  assert.equal((await worker.message("CHECK")).ready,false);
  worker.state.offline=true;
  assert.deepEqual(await worker.message("PREPARE",{input:"never save this"}),{ok:false,ready:false,version:"new"});
  assert.ok(await cache.match(scope+"index.html"),"repair failure must preserve still-valid assets");
  worker.state.offline=false;
  assert.deepEqual(await worker.message("PREPARE"),{ok:true,ready:true,version:"new"});
  assert.equal((await cache.keys()).length,sources.size);
});

test("updates require an explicit message, guard other tabs and prune only older product caches",async()=>{
  const storage=cacheStorage();
  await storage.open("unrelated-product:v1");await storage.open(OFFLINE_CACHE_PREFIX+"different-scope:v1");
  await storage.open(cachePrefix+"ancient");
  const previous=await storage.open(cachePrefix+"previous");await previous.put(scope+"assets/old-lazy.js",new Response("previous lazy module"));
  const worker=workerHarness({storage});await worker.dispatch("install");
  worker.state.windows.push({url:scope+"#/password"});
  assert.deepEqual(await worker.message("ACTIVATE"),{ok:false,blocked:true,version:"new"});
  assert.equal(worker.state.skips,0);
  assert.equal(await worker.message("ACTIVATE",{},origin+"/other-app/"),undefined);
  worker.state.windows.pop();assert.equal((await worker.message("ACTIVATE")).ok,true);
  assert.equal(worker.state.skips,1);
  await worker.dispatch("activate");
  assert.deepEqual(await storage.keys(),["unrelated-product:v1",OFFLINE_CACHE_PREFIX+"different-scope:v1",cachePrefix+"previous",cachePrefix+"new"]);
  worker.state.offline=true;
  assert.equal(await (await worker.request(scope+"assets/old-lazy.js")).text(),"previous lazy module");
});

test("offline status has complete four-locale copy and development has no DOM or registration side effects",()=>{
  for(const locale of ["en","de","yo","pcm"]){
    assert.deepEqual(Object.keys(OFFLINE_COPY[locale]).sort(),Object.keys(OFFLINE_COPY.en).sort());
    for(const value of Object.values(OFFLINE_COPY[locale]))assert.ok(typeof value==="string"&&value.trim());
  }
  const container={get ownerDocument(){throw new Error("development must not access browser state");}};
  const support=mountOfflineStatus(container,{enabled:false});support.setLanguage("de");support.dispose();
});

function pageHarness(){
  class Element extends EventTarget{
    constructor(document){super();this.ownerDocument=document;this.dataset={};this.children=[];this.attributes={};}
    setAttribute(name,value){this.attributes[name]=value;}
    append(...nodes){this.children.push(...nodes);}
    remove(){this.removed=true;}
  }
  const state={reloads:0,ready:true,failRepair:false,blocked:false,messages:[]};
  const registration=new EventTarget(),serviceWorker=new EventTarget(),window=new EventTarget(),document=new EventTarget();
  const worker=version=>Object.assign(new EventTarget(),{
    scriptURL:scope+OFFLINE_WORKER_FILE,state:"activated",
    postMessage({type},ports){
      state.messages.push({type,version});
      if(type==="PREPARE"&&!state.failRepair)state.ready=true;
      const response=type==="ACTIVATE"&&state.blocked?{ok:false,blocked:true,version}:{ok:true,ready:state.ready,version};
      ports[0].postMessage(response);ports[0].close();
      if(type==="ACTIVATE"&&!state.blocked){registration.waiting=null;serviceWorker.controller=this;serviceWorker.dispatchEvent(new Event("controllerchange"));}
    }
  });
  registration.active=worker("current");registration.waiting=null;registration.installing=null;
  serviceWorker.controller=null;serviceWorker.register=async()=>registration;
  window.navigator={serviceWorker};window.MessageChannel=MessageChannel;window.isSecureContext=true;
  window.location={origin,reload(){state.reloads++;}};
  window.setTimeout=(fn,ms)=>setTimeout(fn,ms).unref();window.clearTimeout=clearTimeout;
  document.defaultView=window;document.visibilityState="visible";document.createElement=()=>new Element(document);
  document.querySelector=()=>({content:"current"});
  const container=new Element(document),support=mountOfflineStatus(container,{enabled:true,base:new URL(scope).pathname});
  const section=container.children[0],status=section.children[0],[retry,reload]=section.children[1].children;
  return {state,registration,serviceWorker,window,document,support,section,status,retry,reload,worker,
    async waitFor(expected){
      for(let attempt=0;attempt<500&&section.dataset.offlineState!==expected;attempt++)await delay(10);
      assert.equal(section.dataset.offlineState,expected);
    }
  };
}

test("client readiness waits for control, exposes repair failure and retries without saving page inputs",async()=>{
  const page=pageHarness();
  try{
    await delay(20);assert.equal(page.section.dataset.offlineState,"preparing");
    assert.equal(page.state.messages.length,0,"an uncontrolled document cannot claim offline readiness");
    page.serviceWorker.controller=page.registration.active;page.serviceWorker.dispatchEvent(new Event("controllerchange"));
    await page.waitFor("ready");
    page.support.setLanguage("de");assert.equal(page.status.textContent,OFFLINE_COPY.de.ready);
    page.state.ready=false;page.window.dispatchEvent(new Event("offline"));await page.waitFor("error");
    page.state.failRepair=true;page.retry.dispatchEvent(new Event("click"));await page.waitFor("error");
    page.state.failRepair=false;page.retry.dispatchEvent(new Event("click"));await page.waitFor("ready");
    assert.equal(page.state.reloads,0);
    assert.ok(page.state.messages.every(message=>["CHECK","PREPARE"].includes(message.type)));
  }finally{page.support.dispose();}
});

test("client updates preserve current work until the explicit reload button and respect the multi-tab guard",async()=>{
  const page=pageHarness();
  try{
    page.serviceWorker.controller=page.registration.active;await page.waitFor("ready");
    page.registration.waiting=page.worker("next");page.registration.dispatchEvent(new Event("updatefound"));
    await page.waitFor("update");assert.match(page.status.textContent,/unsaved/);assert.equal(page.state.reloads,0);
    page.state.blocked=true;page.reload.dispatchEvent(new Event("click"));await page.waitFor("blocked");
    assert.equal(page.state.reloads,0);
    page.state.blocked=false;page.reload.dispatchEvent(new Event("click"));
    for(let attempt=0;attempt<500&&!page.state.reloads;attempt++)await delay(10);
    assert.equal(page.state.reloads,1);
  }finally{page.support.dispose();}
  const controlled=pageHarness();
  try{
    controlled.serviceWorker.controller=controlled.registration.active;await controlled.waitFor("ready");
    controlled.serviceWorker.controller=controlled.worker("next");controlled.serviceWorker.dispatchEvent(new Event("controllerchange"));
    await controlled.waitFor("update");
    assert.equal(controlled.state.reloads,0,"a controller change alone must never discard the current document");
  }finally{controlled.support.dispose();}
});

const root=fileURLToPath(new URL("../",import.meta.url));
const buildDirectory=path.join(root,"test-results/offline-preview");
let built;
const productionBuild=()=>built??=build({root,logLevel:"silent",build:{outDir:buildDirectory,emptyOutDir:true}});

test("production offline manifest covers the actual app, tokenizer worker, WASM, both encoders, strength, logo and notices",{timeout:120000},async()=>{
  const result=await productionBuild(),output=result.output;
  const script=output.find(asset=>asset.fileName===OFFLINE_WORKER_FILE);
  assert.ok(script,"Vite must emit the offline worker");
  const manifest=JSON.parse(script.source.match(/\)\((\{.*\})\);\s*$/)[1]);
  assert.deepEqual(manifest.assets.map(asset=>asset.path).sort(),output.map(asset=>asset.fileName).filter(name=>name!==OFFLINE_WORKER_FILE).sort());
  for(const asset of manifest.assets){
    assert.equal(digest(readFileSync(path.join(buildDirectory,asset.path))),asset.sha256,asset.path+" hash must match the published bytes");
  }
  for(const pattern of [/index\.html/,/tokenizer-worker.*\.js$/,/\.wasm$/,/cl100k/,/o200k/,/password-strength/,/\.jpg$/,/THIRD_PARTY_NOTICES\.txt/]){
    assert.ok(manifest.assets.some(asset=>pattern.test(asset.path)),"missing offline asset: "+pattern);
  }
});

test("production first load prepares untouched tools; offline tokenization, strength, reload and privacy work",{skip:!existsSync(chromium.executablePath()),timeout:180000},async t=>{
  await productionBuild();
  let failedAsset="";
  const server=await preview({root,logLevel:"silent",build:{outDir:buildDirectory},preview:{host:"127.0.0.1",port:4194,strictPort:true},
    plugins:[{name:"offline-test-asset-failure",configurePreviewServer(server){
      server.middlewares.use((request,response,next)=>{
        if(failedAsset&&request.url?.split("?")[0].endsWith(failedAsset)){response.statusCode=503;response.end("Test asset temporarily unavailable");return;}
        next();
      });
    }}]});
  let browser;
  try{
    browser=await chromium.launch({headless:true});
    const context=await browser.newContext({locale:"en-US"}),page=await context.newPage(),errors=[];
    page.on("pageerror",error=>errors.push(error.message));
    const url="http://127.0.0.1:4194/AdigunTokenCalculator/";
    await page.goto(url);
    await page.locator('.offline-status[data-offline-state="ready"]').waitFor({timeout:90000});
    assert.ok(await page.evaluate(()=>navigator.serviceWorker.controller?.scriptURL.endsWith("/offline-sw.js")),"readiness requires control on the first visit");
    assert.equal(await page.locator(".result").count(),0,"no tool is warmed before going offline");
    await context.setOffline(true);
    await page.goto(url+"#/token");
    for(const encoding of ["cl100k_base","o200k_base"]){
      await page.locator('select[name="encoding"]').selectOption(encoding);
      await page.locator('textarea[name="text"]').fill("Hello world!");
      await page.locator('#panel button[type="submit"]').click();
      await page.locator(".segments").waitFor({timeout:30000});
      assert.equal(await page.locator(".segments").textContent(),"Hello world!");
      assert.match(await page.locator(".result").innerText(),/Tokens\s+3/);
    }
    await page.goto(url+"#/password");
    await page.locator('select[name="passwordMode"]').selectOption("check");
    await page.locator('input[name="passwordInput"]').fill("never-store-this-private-password");
    await page.locator('#panel button[type="submit"]').click();
    await page.locator(".result").waitFor({timeout:30000});
    assert.match(await page.locator(".result").innerText(),/Score|Strength/i);
    const storage=await page.evaluate(async()=>({local:localStorage.length,session:sessionStorage.length,
      keys:(await Promise.all((await caches.keys()).map(async name=>(await (await caches.open(name)).keys()).map(request=>request.url)))).flat()}));
    assert.equal(storage.local,0);assert.equal(storage.session,0);
    assert.equal(storage.keys.some(key=>key.includes("private-password")||key.includes("Hello")||key.includes("?")||key.includes("#")),false);
    await page.reload();
    await page.locator('.offline-status[data-offline-state="ready"]').waitFor({timeout:30000});
    assert.equal(await page.locator('select[name="passwordMode"]').inputValue(),"generate");
    for(const locale of ["de","yo","pcm","en"]){
      await page.locator("#language").selectOption(locale);
      assert.equal(await page.locator(".offline-status [role=status]").textContent(),OFFLINE_COPY[locale].ready);
    }
    assert.deepEqual(errors,[]);
    await context.close();

    await t.test("failed preparation stays honest and Retry repairs a missing asset",async()=>{
      const retryContext=await browser.newContext(),retryPage=await retryContext.newPage();
      // Fail at the actual HTTP server because page routing does not reliably
      // intercept service-worker installation fetches.
      failedAsset=(await productionBuild()).output.find(asset=>asset.fileName.endsWith(".wasm")).fileName;
      await retryPage.goto(url);
      await retryPage.locator('.offline-status[data-offline-state="error"]').waitFor({timeout:30000});
      assert.equal(await retryPage.locator('.offline-status[data-offline-state="ready"]').count(),0);
      failedAsset="";
      await retryPage.locator('[data-offline-action="retry"]').click();
      await retryPage.locator('.offline-status[data-offline-state="ready"]').waitFor({timeout:90000});
      await retryContext.close();
    });
  }finally{
    await browser?.close();await new Promise(resolve=>server.httpServer.close(resolve));
  }
});

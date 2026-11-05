import test from "node:test";
import assert from "node:assert/strict";
import {existsSync, readFileSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {build, preview} from "vite";
import {chromium} from "playwright-core";
import {I} from "../src/i18n.js";
import "../src/copy.js";
import "../src/additional-i18n.js";
import {LOAD_COPY} from "../src/tools/loadCalculator-i18n.js";
import {buildLoadCsv, createLoadState, registerLoadCalculator, LOAD_TOOL_KEY} from "../src/tools/loadCalculatorUI.js";
import {LOAD_PROFILE_STORAGE_KEY} from "../src/tools/loadProfileStorage.js";

const root=fileURLToPath(new URL("../",import.meta.url));
const source=()=>readFileSync(path.join(root,"src/main.js"),"utf8");
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8*Math.max(1,Math.abs(b)),`${a} ≈ ${b}`);
const browserAvailable=existsSync(chromium.executablePath());
const buildDirectory=path.join(root,"test-results/electrical-load-preview");

let built;
const previewBuild=()=>built??=(build({root,logLevel:"silent",build:{outDir:buildDirectory,emptyOutDir:true}}));

test("load UI: registration is additive, localized and idempotent",()=>{
  const keys=JSON.parse(source().match(/^const keys=(\[.*\]);$/m)[1]);
  const oldKeys=[...keys];const before=Object.fromEntries(Object.keys(LOAD_COPY).map(lang=>[lang,{names:[...I[lang].names],groups:[...I[lang].groups],descriptions:[...I[lang].descriptions]}]));
  registerLoadCalculator(keys);registerLoadCalculator(keys);
  assert.equal(keys.length,39);assert.equal(keys.at(-1),LOAD_TOOL_KEY);assert.deepEqual(keys.slice(0,38),oldKeys);
  for(const lang of Object.keys(LOAD_COPY)){
    assert.equal(I[lang].names.length,39);assert.equal(I[lang].names.at(-1),LOAD_COPY[lang].title);
    for(const field of ["names","groups","descriptions"])assert.deepEqual(I[lang][field].slice(0,38),before[lang][field]);
    assert.equal(I[lang].toolCategoryByKey[LOAD_TOOL_KEY],"Math");
  }
});

test("load UI: state is memory-only and independent between explicit instances",()=>{
  const first=createLoadState(),second=createLoadState();
  first.devices.push({watts:1,pf:1});first.settings.voltage=120;
  assert.equal(second.devices.length,0);assert.equal(Number(second.settings.voltage),230);
});

test("load UI: CSV includes inputs, all results, ranked devices and 24 bins; user text is spreadsheet-safe",()=>{
  const device={name:'=SUM(1,2) "quoted"',watts:100,quantity:2,dutyCycle:50,hoursPerDay:6,seasonalFactor:1.5,standbyW:2,pf:0.8,type:"inductive"};
  for(const lang of Object.keys(LOAD_COPY)){
    const csv=buildLoadCsv([device],{tariff:0.3,currency:"EUR"},lang);
    assert.ok(csv.startsWith("\uFEFF"));assert.ok(csv.includes(LOAD_COPY[lang].profile));
    assert.ok(csv.includes(`'=SUM(1,2) ""quoted""`));assert.ok(csv.includes('"0.972"'));
    assert.ok(csv.includes(LOAD_COPY[lang]["field.seasonalFactor"]));assert.ok(csv.includes(LOAD_COPY[lang]["result.netGridKWh"]));
    assert.ok(csv.includes(LOAD_COPY[lang]["field.watts"]+" (W)"));
    const lines=csv.trimEnd().split("\r\n");
    assert.equal(lines.filter(line=>/^"(?:[0-9]|1[0-9]|2[0-3])","[0-9.e+-]+"$/.test(line)).length,24);
  }
  for(const name of ["@SUM(1)","+cmd","-cmd"," \t=cmd","\n=cmd"]){const csv=buildLoadCsv([{...device,name}],{});assert.ok(csv.includes("'"+name));}
  assert.throws(()=>buildLoadCsv([{...device,pf:0}],{}));
});

test("load UI: actual registered route produces a Vite bundle without rewriting shared source",async()=>{
  const before=source();await previewBuild();assert.equal(source(),before);
  assert.ok(existsSync(path.join(buildDirectory,"index.html")));
});

test("load UI: production-preview device editing, live calculations, four locales, CSV, print and privacy",{skip:!browserAvailable,timeout:120000},async()=>{
  await previewBuild();
  const server=await preview({root,logLevel:"silent",build:{outDir:buildDirectory},preview:{host:"127.0.0.1",port:4175,strictPort:true}});
  let browser;
  try{
    browser=await chromium.launch({headless:true});
    const page=await browser.newPage({locale:"en-US"});
    const errors=[],external=[];
    page.on("pageerror",error=>errors.push(error.message));
    page.on("request",request=>{const url=new URL(request.url());if(/^https?:$/.test(url.protocol)&&url.host!=="127.0.0.1:4175")external.push(request.url());});
    await page.goto("http://127.0.0.1:4175/AdigunTokenCalculator/");
    assert.equal(await page.locator(".tool-card").count(),39);
    await page.locator('#search').fill("Electrical");assert.equal(await page.locator('.tool-card').count(),1);
    await page.locator('[data-tool-key="electrical-load"]').click();
    const ui=page.locator(".load-calculator"),field=name=>ui.locator(`[name="${name}"]`);
    const result=async key=>Number(await ui.locator(`[data-result="${key}"]`).getAttribute("data-value"));
    const waitResult=async(key,value)=>page.waitForFunction(({key,value})=>Math.abs(Number(document.querySelector(`[data-result="${key}"]`)?.dataset.value)-value)<1e-8,{key,value});
    await ui.waitFor();near(await result("dailyKWh"),0);
    assert.equal(await ui.locator('button[type="submit"]').count(),0);
    assert.equal(await ui.locator('select[name="preset"] optgroup').count(),5);
    await field("preset").selectOption("refrigerator");assert.equal(await field("watts").inputValue(),"200");assert.equal(await field("pf").inputValue(),"0.8");
    await field("name").fill('=1+1');await field("watts").fill("100");await field("quantity").fill("2");await field("hoursPerDay").fill("6");await field("dutyCycle").fill("50");await field("standbyW").fill("2");await field("seasonalFactor").fill("1.5");
    await ui.locator('[data-action="add-device"]').focus();await page.keyboard.press("Enter");await waitResult("dailyKWh",0.972);
    near(await result("peakDemandKW"),0.15);near(await result("loadFactor"),0.27);
    assert.equal(await ui.locator('[data-device-row]').count(),1);
    await field("pf").fill("0");await ui.locator('[data-action="add-device"]').click();
    assert.equal(await field("pf").getAttribute("aria-invalid"),"true");assert.equal(await ui.locator('[data-device-row]').count(),1);
    assert.ok(await field("pf").getAttribute("aria-describedby"));
    await field("preset").selectOption("kettle");await field("quantity").fill("1");await field("hoursPerDay").fill("2");await field("dutyCycle").fill("100");await field("standbyW").fill("0");await field("seasonalFactor").fill("1");
    await field("powerUnit").selectOption("kW");assert.equal(await field("watts").inputValue(),"1.5");
    await ui.locator('[data-action="add-device"]').click();await waitResult("dailyKWh",3.972);
    assert.ok((await ui.locator('[data-breakdown-row]').first().innerText()).includes("Kettle"));
    await ui.locator('[data-device-row="0"] [data-action="edit"]').click();await field("quantity").fill("3");
    await ui.locator('[data-action="add-device"]').click();await waitResult("dailyKWh",4.458);
    await ui.locator('[data-device-row="1"] [data-action="remove"]').click();await waitResult("dailyKWh",1.458);
    await field("households").fill("10");await field("demandFactor").fill("0.8");await field("diversityFactor").fill("0.5");await field("growthMargin").fill("20");
    await waitResult("dailyKWh",6.9984);near(await result("peakDemandKW"),1.08);
    await field("occupancyEnabled").check();await field("startHour").fill("22");await field("endHour").fill("4");
    await page.waitForFunction(()=>Number(document.querySelector('[data-profile-hour="22"]')?.dataset.kw)>1);
    const profile=await ui.locator('[data-profile-hour]').evaluateAll(nodes=>nodes.map(n=>Number(n.dataset.kw)));
    assert.equal(profile.length,24);near(profile.reduce((s,x)=>s+x,0),6.9984);
    await field("phase").selectOption("three");assert.equal(await field("voltage").inputValue(),"400");
    await field("gridLimitKW").fill("0");await field("peakThresholdKW").fill("0.1");
    await ui.locator('[data-warning="gridLimit"]').waitFor();await ui.locator('[data-warning="peakThreshold"]').waitFor();
    await field("solarKWh").fill("20");await field("batteryKWh").fill("2");await field("tariff").fill("0.3");await waitResult("netGridKWh",0);
    near(await result("dailyCost"),0);near(await result("peakDemandKW"),1.08);
    await field("batteryKWh").fill("");await waitResult("batteryHours",0);near(await result("dailyKWh"),6.9984);
    await field("voltage").fill("0");await page.waitForFunction(()=>document.querySelector('[data-load-results]')?.hidden);
    assert.equal(await ui.locator('[data-load-results]').isVisible(),false);assert.equal(await field("voltage").getAttribute("aria-invalid"),"true");
    await field("voltage").fill("400");await ui.locator('[data-load-results]').waitFor();
    for(const lang of ["de","yo","pcm","en"]){
      await page.locator("#language").selectOption(lang);await page.waitForFunction(title=>document.querySelector("#panel h2")?.textContent===title,LOAD_COPY[lang].title);
      await waitResult("dailyKWh",6.9984);assert.ok((await ui.innerText()).includes(LOAD_COPY[lang]["field.pf"]));
      assert.doesNotMatch(await ui.innerText(),/undefined|NaN/);
    }
    const downloadEvent=page.waitForEvent("download");await ui.locator('[data-action="export-csv"]').click();const download=await downloadEvent;
    assert.equal(download.suggestedFilename(),"electrical-load-profile.csv");
    const stream=await download.createReadStream();let csv="";for await(const chunk of stream)csv+=chunk.toString("utf8");
    assert.ok(csv.includes("'=1+1"));assert.ok(csv.includes("6.9984"));
    await page.evaluate(()=>{window.__prints=0;window.print=()=>window.__prints++;});await ui.locator('[data-action="print"]').click();assert.equal(await page.evaluate(()=>window.__prints),1);
    await page.emulateMedia({media:"print"});assert.equal(await page.locator("header").isVisible(),false);assert.equal(await ui.locator('[data-action="print"]').isVisible(),false);assert.equal(await ui.locator('svg').first().isVisible(),true);await page.emulateMedia({media:"screen"});
    for(const width of [375,1280]){await page.setViewportSize({width,height:900});const sizes=await page.evaluate(()=>({view:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));assert.ok(sizes.scroll<=sizes.view,JSON.stringify(sizes));}
    await field("households").fill("11");await page.evaluate(()=>{location.hash="#/math";});await page.locator('#panel[data-tool-key="math"]').waitFor();
    await new Promise(resolve=>setTimeout(resolve,200));assert.equal(await page.locator('.load-calculator').count(),0);
    await page.evaluate(()=>{location.hash="#/electrical-load";});await waitResult("dailyKWh",7.69824);
    assert.equal(await page.evaluate(()=>localStorage.length),0);assert.equal(await page.evaluate(()=>sessionStorage.length),0);
    await page.reload();await waitResult("dailyKWh",0);
    assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  }finally{if(browser)await browser.close();await new Promise(resolve=>server.httpServer.close(resolve));}
});

test("load UI: explicit local save/load/delete, recovery and unfinished edit preservation",{skip:!browserAvailable,timeout:120000},async()=>{
  await previewBuild();
  const server=await preview({root,logLevel:"silent",build:{outDir:buildDirectory},preview:{host:"127.0.0.1",port:4175,strictPort:true}});
  let browser;
  try{
    browser=await chromium.launch({headless:true});
    const page=await browser.newPage({locale:"en-US"}),errors=[],external=[];
    page.on("pageerror",error=>errors.push(error.message));
    page.on("request",request=>{const url=new URL(request.url());if(/^https?:$/.test(url.protocol)&&url.host!=="127.0.0.1:4175")external.push(request.url());});
    await page.goto("http://127.0.0.1:4175/AdigunTokenCalculator/#/electrical-load");
    const ui=page.locator(".load-calculator"),field=name=>ui.locator(`[name="${name}"]`),action=name=>ui.locator(`[data-action="${name}"]`);
    const waitResult=async(key,value)=>page.waitForFunction(({key,value})=>Math.abs(Number(document.querySelector(`[data-result="${key}"]`)?.dataset.value)-value)<1e-8,{key,value});
    const message=key=>ui.locator("[data-profile-status]").filter({hasText:LOAD_COPY.en[key]}).waitFor();
    await ui.waitFor();assert.equal(await page.evaluate(()=>localStorage.length),0);
    await action("load-profile").click();await message("message.noSavedProfile");
    await field("preset").selectOption("refrigerator");
    for(const [key,value] of Object.entries({name:"Saved appliance",watts:"100",quantity:"2",hoursPerDay:"6",dutyCycle:"50",standbyW:"2",seasonalFactor:"1.5"}))await field(key).fill(value);
    await action("add-device").click();await waitResult("dailyKWh",0.972);
    await field("phase").selectOption("three");await field("currency").selectOption("NGN");await field("measurementInterval").selectOption("second");
    const savedFields={voltage:"400",households:"10",demandFactor:"0.8",diversityFactor:"0.5",growthMargin:"20",tariff:"225",co2Factor:"0.25",solarKWh:"0.1",windKWh:"0.2",renewableOffsetKWh:"0.3",batteryKWh:"2",gridLimitKW:"0",peakThresholdKW:"0.1",startHour:"22.5",endHour:"4.25"};
    await field("occupancyEnabled").check();
    for(const [key,value] of Object.entries(savedFields))await field(key).fill(value);
    await waitResult("dailyKWh",4.6656);
    await ui.locator('[data-device-row="0"] [data-action="edit"]').click();await field("quantity").fill("9");
    await action("save-profile").click();await message("message.profileSaved");
    const saved=await page.evaluate(key=>localStorage.getItem(key),LOAD_PROFILE_STORAGE_KEY);
    assert.equal(JSON.parse(saved).devices[0].quantity,2);assert.equal(JSON.parse(saved).draft,undefined);
    await page.reload();await waitResult("dailyKWh",0);assert.equal(await ui.locator("[data-device-row]").count(),0);
    await action("load-profile").click();await waitResult("dailyKWh",4.6656);await message("message.profileLoaded");
    for(const [key,value] of Object.entries(savedFields))assert.equal(await field(key).inputValue(),value,key);
    assert.equal(await field("occupancyEnabled").isChecked(),true);assert.equal(await field("phase").inputValue(),"three");
    assert.equal(await field("currency").inputValue(),"NGN");assert.equal(await field("measurementInterval").inputValue(),"second");
    assert.equal(await action("cancel-edit").isVisible(),false);
    await ui.locator('[data-device-row="0"] [data-action="edit"]').click();await field("name").fill("");
    for(const lang of ["de","yo","pcm","en"]){
      await page.locator("#language").selectOption(lang);
      await page.waitForFunction(title=>document.querySelector("#panel h2")?.textContent===title,LOAD_COPY[lang].title);
      assert.equal(await field("name").inputValue(),"");assert.equal(await field("name").getAttribute("aria-invalid"),"true");
      for(const key of ["saveProfile","loadProfile","deleteProfile"])assert.equal(await ui.getByRole("button",{name:LOAD_COPY[lang]["action."+key],exact:true}).count(),1);
      await waitResult("dailyKWh",4.6656);
    }
    await field("households").fill("4");await waitResult("dailyKWh",1.86624);
    const corrupted=JSON.parse(saved);corrupted.devices[0].pf=0;
    const outsideUiRange=JSON.parse(saved);outsideUiRange.settings.voltage=1e9;
    for(const bad of ["{",'{"version":99}',JSON.stringify(corrupted),JSON.stringify(outsideUiRange)]){
      await page.evaluate(({key,bad})=>localStorage.setItem(key,bad),{key:LOAD_PROFILE_STORAGE_KEY,bad});
      await action("load-profile").click();await message("warning.profileInvalid");
      await waitResult("dailyKWh",1.86624);assert.equal(await field("name").inputValue(),"");
    }
    await page.evaluate(({key,saved})=>{localStorage.setItem(key,saved);localStorage.setItem("test.unrelated","keep");},{key:LOAD_PROFILE_STORAGE_KEY,saved});
    await page.evaluate(()=>{
      window.__loadStorageDescriptor=Object.getOwnPropertyDescriptor(window,"localStorage");
      Object.defineProperty(window,"localStorage",{configurable:true,get(){throw new DOMException("Storage blocked","SecurityError");}});
    });
    for(const name of ["save-profile","load-profile","delete-profile"]){await action(name).click();await message("warning.storageFailed");}
    await page.evaluate(()=>{Object.defineProperty(window,"localStorage",window.__loadStorageDescriptor);delete window.__loadStorageDescriptor;});
    assert.equal(await page.evaluate(key=>localStorage.getItem(key),LOAD_PROFILE_STORAGE_KEY),saved);
    await action("load-profile").click();await waitResult("dailyKWh",4.6656);
    await action("delete-profile").click();await message("message.profileDeleted");await waitResult("dailyKWh",4.6656);
    assert.equal(await page.evaluate(key=>localStorage.getItem(key),LOAD_PROFILE_STORAGE_KEY),null);
    assert.equal(await page.evaluate(()=>localStorage.getItem("test.unrelated")),"keep");
    await action("load-profile").click();await message("message.noSavedProfile");await waitResult("dailyKWh",4.6656);
    await action("clear-all").click();await waitResult("dailyKWh",0);
    await field("powerUnit").selectOption("kW");await field("watts").fill("1000000000000");await field("hoursPerDay").fill("0");
    await action("add-device").click();await ui.locator('[data-device-row="0"]').waitFor();
    await ui.locator('[data-device-row="0"] [data-action="edit"]').click();
    assert.equal(await field("powerUnit").inputValue(),"kW");assert.equal(await field("watts").inputValue(),"1000000000000");
    await action("add-device").click();await waitResult("dailyKWh",0);assert.equal(await field("watts").getAttribute("aria-invalid"),"false");
    await field("voltage").fill("0");await page.waitForFunction(()=>document.querySelector('[data-load-results]')?.hidden);
    assert.equal(await action("save-profile").isDisabled(),true);assert.equal(await action("load-profile").isEnabled(),true);
    assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  }finally{if(browser)await browser.close();await new Promise(resolve=>server.httpServer.close(resolve));}
});

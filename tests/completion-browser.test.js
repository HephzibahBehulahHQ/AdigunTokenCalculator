import test from "node:test";
import assert from "node:assert/strict";
import {existsSync} from "node:fs";
import {spawn} from "node:child_process";
import {setTimeout as delay} from "node:timers/promises";
import {chromium} from "playwright-core";
import {COMPLETION_COPY,completionText} from "../src/completion-i18n.js";
import {GRADE_POINTS} from "../src/calculators.js";
import {resultText} from "../src/result-i18n.js";
import {formatNumber} from "../src/format.js";

const origin="http://127.0.0.1:4198";
const browserAvailable=existsSync(chromium.executablePath());

test("completion controls, explanations, exact totals and responsive workflows work in the actual UI",{
 skip:!browserAvailable&&!process.env.CI,timeout:150000
},async t=>{
 const server=spawn(process.execPath,["node_modules/vite/bin/vite.js","--host","127.0.0.1","--port","4198","--strictPort"],{stdio:"ignore"});
 let browser;
 try{
  let ready=false;for(let attempt=0;attempt<60;attempt++){try{if((await fetch(origin)).ok){ready=true;break;}}catch{}await delay(200);}assert.ok(ready);
  browser=await chromium.launch({headless:true});const context=await browser.newContext({locale:"en-US",timezoneId:"UTC",viewport:{width:375,height:812}}),page=await context.newPage(),pageErrors=[];
  page.on("pageerror",error=>pageErrors.push(error.message));
  await page.addInitScript(()=>{window.__geoCalls=0;Object.defineProperty(navigator,"geolocation",{configurable:true,value:{getCurrentPosition(){window.__geoCalls++;}}});window.__copied=[];Object.defineProperty(navigator,"clipboard",{configurable:true,value:{async writeText(text){window.__copied.push(text);}}});});
  await page.goto(origin+"/AdigunTokenCalculator/#/water");
  const open=async key=>{await page.evaluate(value=>{location.hash="#/"+value;},key);await page.waitForFunction(value=>value?document.querySelector("#panel")?.dataset.toolKey===value:document.querySelector("#panel")?.hidden&&!document.querySelector("aside")?.hidden,key);};
  const fill=async values=>{for(const [name,value] of Object.entries(values))await page.locator('[name="'+name+'"]').fill(String(value));};
  const calculate=async()=>{await page.locator('#panel button[type="submit"]').click();await page.locator("#panel .result").waitFor({timeout:30000});await page.waitForFunction(()=>document.querySelector("#panel form")?.getAttribute("aria-busy")==="false");};
  const rows=()=>page.locator(".result-row").evaluateAll(nodes=>Object.fromEntries(nodes.map(node=>[node.firstElementChild.textContent,node.lastElementChild.textContent])));
  const noOverflow=async()=>{assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),true);};

  for(const locale of ["en","de","yo","pcm"]){
   await t.test(locale+": visible assumptions, water controls, grade mapping, Zakat arithmetic and exact shares",async()=>{
    await page.locator("#language").selectOption(locale);const copy=COMPLETION_COPY[locale];
    await open("water");assert.equal(await page.locator("#water-help").innerText(),copy.waterHelp);
    await fill({weightKg:70,lowMlPerKg:25,highMlPerKg:30,activityFactor:1.2,climateFactor:1.1,extraMl:100});await calculate();
    assert.ok(Object.values(await rows()).includes(formatNumber(2410,locale,0)));assert.ok(Object.values(await rows()).includes(formatNumber(2872,locale,0)));
    assert.ok(Object.hasOwn(await rows(),copy.formula));await noOverflow();
    await page.locator('button[type="reset"]').click();
    for(const [field,value] of Object.entries({lowMlPerKg:"30",highMlPerKg:"35",activityFactor:"1",climateFactor:"1",extraMl:"0"}))assert.equal(await page.locator('[name="'+field+'"]').inputValue(),value);
    await fill({weightKg:70,lowMlPerKg:40,highMlPerKg:30});await calculate();
    for(const name of ["lowMlPerKg","highMlPerKg"])assert.equal(await page.locator('[name="'+name+'"]').getAttribute("aria-invalid"),"true");

    await open("gpa");await page.locator(".grade-scale summary").click();
    assert.equal(await page.locator(".grade-scale tbody tr").count(),Object.keys(GRADE_POINTS).length);
    assert.equal(await page.locator(".grade-scale summary").innerText(),copy.gradeMapping);
    assert.equal(await page.locator('.grade-scale tbody tr').last().innerText(),"F\t0");await noOverflow();

    await open("zakat");assert.equal(await page.locator("#zakat-help").innerText(),copy.zakatDefault);
    await fill({cash:1000,gold:200,silver:300,investments:500});await calculate();
    assert.equal((await rows())[copy.formula],[1000,200,300,500].map(value=>formatNumber(value,locale,6,true)).join(" + ")+" = "+formatNumber(2000,locale,6,true)+"; "+formatNumber(2000,locale,6,true)+" × "+formatNumber(2.5,locale,6,true)+" / 100 = 50");await noOverflow();

    await open("qibla");assert.equal(await page.locator("#qibla-help").innerText(),copy.qiblaLocation);assert.equal(await page.evaluate(()=>window.__geoCalls),0);
    assert.equal(await page.locator("#qibla-help").evaluate(node=>Boolean(node.compareDocumentPosition(document.querySelector('#panel form'))&Node.DOCUMENT_POSITION_FOLLOWING)),true,"purpose/privacy explanation precedes the permission control");
    await fill({lat:52.52,lon:13.405});await calculate();assert.ok((await page.locator(".result").innerText()).includes(copy.qiblaNotice));

    await open("demographics");await fill({total:1000});await calculate();
    let notice=await page.locator(".result .notice").first().innerText();assert.ok(notice.includes(copy.demographicsDefault));assert.ok(notice.includes(resultText(locale,"sharesExact")));assert.equal(Object.values(await rows()).includes("100%"),true);
    await fill({shares:"One, 50\nTwo, 50.000000000000001"});await calculate();notice=await page.locator(".result .notice").first().innerText();
    assert.ok(notice.includes(copy.demographicsCustom));assert.ok(notice.includes(resultText(locale,"sharesAbove")));assert.match(Object.values(await rows()).join("\n"),/100[.,]000000000000001%/);
    await fill({shares:"Christianity,"});await calculate();assert.equal(await page.locator('[name="shares"]').getAttribute("aria-invalid"),"true");assert.equal(await page.locator('.result[role="alert"]').count(),1);
    await noOverflow();
   });
  }

  await t.test("holiday day counts explicitly follow the selected time zone at midnight",async()=>{
   await page.locator("#language").selectOption("en");await page.clock.install({time:new Date("2026-01-01T00:30:00Z")});
   await open("holidays");await fill({year:2026});await page.locator('[name="referenceZone"]').selectOption("America/Los_Angeles");await calculate();
   let result=await rows();assert.equal(result[COMPLETION_COPY.en.referenceDate],"2025-12-31 · America/Los_Angeles");assert.match(result["New Year's Day"],/1 days away$/);
   await page.locator('[name="referenceZone"]').selectOption("Asia/Tokyo");await calculate();result=await rows();assert.equal(result[COMPLETION_COPY.en.referenceDate],"2026-01-01 · Asia/Tokyo");assert.match(result["New Year's Day"],/0 days away$/);
   await page.clock.resume();
  });

  await t.test("reduced motion disables card transitions without hiding the directory",async()=>{
   await page.emulateMedia({reducedMotion:"reduce"});await open("");
   assert.equal(await page.locator(".tool-card").count(),39);assert.equal(await page.locator(".tool-card").first().evaluate(node=>getComputedStyle(node).transitionDuration),"0s");await noOverflow();
  });

  await t.test("large token results paginate while full copy preserves every token and code point",async()=>{
   await open("token");await page.locator('[name="encoding"]').selectOption("cl100k_base");const source="Hello, world! Yorùbá 😊\n".repeat(900);await fill({text:source});await calculate();
   assert.equal((await rows())[COMPLETION_COPY.en.encoding],"cl100k_base");assert.equal(await page.locator(".piece").count(),2000);assert.ok(await page.locator(".token-preview").isVisible());
   await page.getByRole("button",{name:COMPLETION_COPY.en.next,exact:true}).click();assert.match(await page.locator(".token-preview").innerText(),/2001–4000/);
   await page.getByRole("button",{name:"Copy reconstructed text",exact:true}).click();assert.equal(await page.evaluate(()=>window.__copied.at(-1)),source);
   await page.getByRole("button",{name:"Copy token IDs",exact:true}).click();assert.equal(await page.evaluate(()=>window.__copied.at(-1).split(", ").length),Number(Object.values(await rows())[0]));
   await page.getByRole("button",{name:COMPLETION_COPY.en.previous,exact:true}).click();assert.match(await page.locator(".token-preview").innerText(),/1–2000/);
   await noOverflow();
  });

  await t.test("tokenizer Clear cancels pending work and clears the busy announcement",async()=>{
   await open("math");await open("token");
   const held=[];await page.route("**/*.wasm*",route=>{held.push(route);});
   try{
    await fill({text:"pending calculation"});await page.locator('button[type="submit"]').click();
    assert.equal(await page.locator("#panel form").getAttribute("aria-busy"),"true");
    await page.getByRole("button",{name:"Clear",exact:true}).click();
    assert.equal(await page.locator("#panel form").getAttribute("aria-busy"),"false");assert.equal(await page.locator(".processing-status").isVisible(),false);assert.equal(await page.locator(".result").count(),0);
   }finally{await page.unroute("**/*.wasm*");for(const route of held)await route.abort().catch(()=>{});}
  });

  await t.test("JSON and statistics limit errors are localized and connected to their input",async()=>{
   await open("json");await fill({text:'["'+"a".repeat(5_000_000)+'"]'});await calculate();
   assert.equal(await page.locator('.result[role="alert"] .result-row strong').innerText(),COMPLETION_COPY.en.jsonTooLarge);assert.equal(await page.locator('[name="text"]').getAttribute("aria-invalid"),"true");
   await fill({text:'{"large":900719925474099312345}'});await calculate();assert.ok((await page.locator(".result").innerText()).includes("900719925474099312345"));
   await open("stats");await fill({numbers:"1 ".repeat(250001)});await calculate();assert.equal(await page.locator('.result[role="alert"] .result-row strong').innerText(),COMPLETION_COPY.en.statisticsTooLarge);assert.equal(await page.locator('[name="numbers"]').getAttribute("aria-invalid"),"true");
  });
  assert.deepEqual(pageErrors,[]);
 }finally{await browser?.close();server.kill("SIGTERM");}
});

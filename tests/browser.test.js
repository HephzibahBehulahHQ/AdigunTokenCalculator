import test from "node:test";
import assert from "node:assert/strict";
import {existsSync} from "node:fs";
import {spawn} from "node:child_process";
import {setTimeout as delay} from "node:timers/promises";
import {chromium} from "playwright-core";

const browserAvailable=existsSync(chromium.executablePath());

test("browser directory, filters, deep links and calculator workflow", {skip:!browserAvailable}, async()=>{
  const server=spawn(process.execPath,["node_modules/vite/bin/vite.js","--host","127.0.0.1","--port","4173","--strictPort"],{stdio:"ignore"});
  let browser;
  try{
    let ready=false;
    for(let i=0;i<50;i++){
      try{const response=await fetch("http://127.0.0.1:4173/");if(response.ok){ready=true;break;}}catch{}
      await delay(300);
    }
    assert.ok(ready,"Vite development server should start");
    browser=await chromium.launch({headless:true});
    const page=await browser.newPage(),pageErrors=[];
    page.on("pageerror",e=>pageErrors.push(e.message));
    await page.goto("http://127.0.0.1:4173/");
    assert.equal(await page.locator(".tool-card").count(),38);
    assert.equal(await page.locator(".category-chip").count(),11);
    await page.locator(".category-chip").nth(5).click();
    assert.ok(await page.locator(".tool-card").count()>0);
    await page.locator(".category-chip").first().click();
    await page.locator("#search").fill("currency");
    assert.equal(await page.locator(".tool-card").count(),1);
    await page.locator("#search").fill("");
    await page.getByRole("button",{name:"Offline currency converter"}).click();
    await page.waitForFunction(()=>document.querySelector("#panel h2")?.textContent==="Offline currency converter");
    await page.locator('input[name="amount"]').fill("100");
    const validity=await page.locator("#panel form").evaluate(form=>({valid:form.checkValidity(),invalid:[...form.querySelectorAll(":invalid")].map(x=>({name:x.name,value:x.value,type:x.type,required:x.required}))}));
    assert.equal(validity.valid,true,JSON.stringify(validity.invalid));
    await page.locator("#panel form").evaluate(form=>form.requestSubmit());
    const resultVisible=await page.locator(".result").waitFor({timeout:5000}).then(()=>true).catch(()=>false);
    if(!resultVisible){const details=await page.locator("#panel").innerText();assert.fail("No result section after valid submit. Panel: "+details+"; page errors: "+pageErrors.join(" | "));}
    assert.match(await page.locator(".result").innerText(),/112\.67\s+USD/);
    await page.locator(".back-directory").click();
    await page.waitForFunction(()=>!document.querySelector("aside")?.hidden);
    await page.getByRole("button",{name:"QR code generator"}).click();
    await page.waitForFunction(()=>document.querySelector("#panel h2")?.textContent==="QR code generator");
    await page.locator('textarea[name="text"]').fill("https://example.com");
    await page.locator("#panel form").evaluate(form=>form.requestSubmit());
    await page.locator(".qr-preview").waitFor({timeout:5000});
    assert.match(await page.locator(".result").innerText(),/https:\/\/example\.com/);
    await page.locator(".back-directory").click();
    await page.waitForFunction(()=>!document.querySelector("aside")?.hidden);
    await page.getByRole("button",{name:"Blood alcohol estimate (educational)"}).click();
    await page.waitForFunction(()=>document.querySelector("#panel h2")?.textContent==="Blood alcohol estimate (educational)");
    await page.locator('input[name="weightKg"]').fill("70");
    await page.locator('input[name="drinks"]').fill("2");
    const bacForm=page.locator("#panel form");
    assert.equal(await bacForm.evaluate(f=>f.checkValidity()),false,"BAC consent must be required before calculation");
    await page.locator('input[name="acknowledge"]').check();
    assert.equal(await bacForm.evaluate(f=>f.checkValidity()),true);
    await bacForm.evaluate(f=>f.requestSubmit());
    await page.locator(".result").waitFor({timeout:5000});
    assert.match(await page.locator(".result").innerText(),/Do NOT use this to decide whether to drive/);
    await page.locator(".back-directory").click();
    await page.waitForFunction(()=>!document.querySelector("aside")?.hidden);
    assert.equal(await page.locator(".tool-card").count(),38);
    const cardData=await page.locator(".tool-card").evaluateAll(nodes=>nodes.map(n=>({name:n.getAttribute("aria-label"),key:n.dataset.toolKey})));
    for(const card of cardData){
      await page.getByRole("button",{name:card.name}).click();
      await page.waitForFunction(name=>document.querySelector("#panel h2")?.textContent===name,card.name);
      if(card.key==="world")assert.equal(await page.locator("#panel .result").count(),1);
      else assert.equal(await page.locator("#panel form").count(),1,card.key+" should render a form");
      await page.locator(".back-directory").click();
      await page.waitForFunction(()=>!document.querySelector("aside")?.hidden);
    }
    await page.setViewportSize({width:375,height:812});
    const mobile=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
    assert.ok(mobile.scroll<=mobile.width,"mobile directory should not overflow horizontally");
    await page.locator(".tool-card").first().focus();
    await page.keyboard.press("Enter");
    await page.waitForFunction(()=>!document.querySelector("#panel")?.hidden);
    await page.goto("http://127.0.0.1:4173/#/timezone");
    assert.match(await page.locator("#panel h2").innerText(),/Time zone converter/);
    assert.equal(await page.locator("#panel form").count(),1);
    assert.deepEqual(pageErrors,[]);
  }finally{
    if(browser)await browser.close();
    server.kill("SIGTERM");
  }
});

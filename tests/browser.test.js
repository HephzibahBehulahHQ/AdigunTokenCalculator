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
    await page.locator('input[name="amount"]').fill("100");
    const validity=await page.locator("#panel form").evaluate(form=>({valid:form.checkValidity(),invalid:[...form.querySelectorAll(":invalid")].map(x=>({name:x.name,value:x.value,type:x.type,required:x.required}))}));
    assert.equal(validity.valid,true,JSON.stringify(validity.invalid));
    await page.locator("#panel form").evaluate(form=>form.requestSubmit());
    const resultVisible=await page.locator(".result").waitFor({timeout:5000}).then(()=>true).catch(()=>false);
    if(!resultVisible){const details=await page.locator("#panel").innerText();assert.fail("No result section after valid submit. Panel: "+details+"; page errors: "+pageErrors.join(" | "));}
    assert.match(await page.locator(".result").innerText(),/112\.67\s+USD/);
    await page.locator(".back-directory").click();
    assert.equal(await page.locator(".tool-card").count(),38);
    await page.goto("http://127.0.0.1:4173/#/timezone");
    assert.match(await page.locator("#panel h2").innerText(),/Time zone converter/);
    assert.equal(await page.locator("#panel form").count(),1);
    assert.deepEqual(pageErrors,[]);
  }finally{
    if(browser)await browser.close();
    server.kill("SIGTERM");
  }
});

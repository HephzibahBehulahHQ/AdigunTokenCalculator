import test from "node:test";
import assert from "node:assert/strict";
import {existsSync} from "node:fs";
import {createHash} from "node:crypto";
import {spawn} from "node:child_process";
import {setTimeout as delay} from "node:timers/promises";
import {chromium} from "playwright-core";

const browserAvailable=existsSync(chromium.executablePath());

test("browser directory, filters, deep links and calculator workflow", {skip:!browserAvailable,timeout:120000}, async(t)=>{
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
    const page=await browser.newPage(),pageErrors=[],externalRequests=[];
    page.on("pageerror",e=>pageErrors.push(e.message));
    page.on("request",request=>{try{if(new URL(request.url()).host!=="127.0.0.1:4173")externalRequests.push(request.url());}catch{externalRequests.push(request.url());}});
    await page.addInitScript(()=>{window.__geoCalls=0;window.__geoRequests=[];Object.defineProperty(navigator,"geolocation",{configurable:true,value:{getCurrentPosition(success,error){window.__geoCalls++;window.__geoRequests.push({success,error});}}});});
    await page.goto("http://127.0.0.1:4173/");
    assert.equal(await page.locator(".tool-card").count(),38);
    assert.equal(await page.locator(".category-chip").count(),11);
    await page.locator(".category-chip").nth(5).click();
    assert.ok(await page.locator(".tool-card").count()>0);
    await page.locator(".category-chip").first().click();
    await page.locator("#search").fill("currency");
    assert.equal(await page.locator(".tool-card").count(),1);
    await page.locator("#search").fill("");
    await page.locator('.tool-card[data-tool-key="currency"]').click();
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
    await page.locator('.tool-card[data-tool-key="qr"]').click();
    await page.waitForFunction(()=>document.querySelector("#panel h2")?.textContent==="QR code generator");
    await page.locator('textarea[name="text"]').fill("https://example.com");
    await page.locator("#panel form").evaluate(form=>form.requestSubmit());
    await page.locator(".qr-preview").waitFor({timeout:5000});
    assert.match(await page.locator(".result").innerText(),/https:\/\/example\.com/);
    await page.locator(".back-directory").click();
    await page.waitForFunction(()=>!document.querySelector("aside")?.hidden);
    await page.locator('.tool-card[data-tool-key="bac"]').click();
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
    await page.setViewportSize({width:375,height:812});
    const cardData=await page.locator(".tool-card").evaluateAll(nodes=>nodes.map(n=>({name:n.getAttribute("aria-label"),key:n.dataset.toolKey})));
    assert.equal(new Set(cardData.map(card=>card.key)).size,38,"tool keys must be unique");
    for(const card of cardData){
      await page.locator('.tool-card[data-tool-key="'+card.key+'"]').click();
      await page.waitForFunction(key=>document.querySelector("#panel")?.dataset.toolKey===key,card.key);
      await page.waitForFunction(name=>document.querySelector("#panel h2")?.textContent===name,card.name);
      if(card.key==="world"){assert.equal(await page.locator("#panel .result").count(),1);assert.doesNotMatch(await page.locator("#panel .result").innerText(),/NaN|undefined/);}
      else assert.equal(await page.locator("#panel form").count(),1,card.key+" should render a form");
      const width=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,content:document.documentElement.scrollWidth}));
      assert.ok(width.content<=width.viewport,card.key+" panel overflows mobile viewport: "+JSON.stringify(width));
      await page.locator(".back-directory").click();
      await page.waitForFunction(()=>!document.querySelector("aside")?.hidden);
    }
    await page.setViewportSize({width:375,height:812});
    const mobile=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
    assert.ok(mobile.scroll<=mobile.width,"mobile directory overflow: "+JSON.stringify(await page.evaluate(()=>[...document.querySelectorAll("body *")].map(e=>({tag:e.tagName,cls:e.className?.toString?.()||"",id:e.id,right:Math.round(e.getBoundingClientRect().right),left:Math.round(e.getBoundingClientRect().left),width:Math.round(e.getBoundingClientRect().width)})).filter(x=>x.right>innerWidth+1||x.left<0).slice(0,12))));
    await page.locator(".tool-card").first().focus();
    await page.keyboard.press("Enter");
    await page.waitForFunction(()=>!document.querySelector("#panel")?.hidden);
    assert.equal(await page.evaluate(()=>window.__geoCalls),0,"Qibla must not request geolocation before explicit activation");
    await page.goto("http://127.0.0.1:4173/#/timezone");
    assert.match(await page.locator("#panel h2").innerText(),/Time zone converter/);
    assert.equal(await page.locator("#panel form").count(),1);

    const openTool=async key=>{
      await page.evaluate(key=>{location.hash="#/"+key;},key);
      await page.waitForFunction(key=>document.querySelector("#panel")?.dataset.toolKey===key,key);
    };
    const reset=()=>page.locator('#panel button[type="reset"]').click();
    await t.test("reset restores defaults, conditional fields and BMI unit labels",async()=>{
      await openTool("bmi");
      for(const locale of ["en","de","yo","pcm"]){
        await page.locator("#language").selectOption(locale);
        const options=await page.locator('select[name="unit"] option').allTextContents();
        assert.match(options[0],/kg, m/);assert.match(options[1],/lb, in/);
        assert.doesNotMatch(options.join(" "),/mpg|L\/100/);
      }
      await page.locator("#language").selectOption("en");
      await page.locator('select[name="unit"]').selectOption("imperial");
      await reset();
      assert.equal(await page.locator('select[name="unit"]').inputValue(),"metric");
      assert.match(await page.locator('input[name="weight"]').locator("..").innerText(),/kg/);
      assert.match(await page.locator('input[name="height"]').locator("..").innerText(),/\(m\)/);
      await page.locator('input[name="weight"]').fill("80");await page.locator('input[name="height"]').fill("2");
      await page.locator('#panel button[type="submit"]').click();
      assert.match(await page.locator(".result").innerText(),/20/);
      for(const [key,mode,field] of [["math","sqrt","b"],["dates","annual","start"],["discount","reverse","price"]]){
        await openTool(key);
        await page.locator('select[name="'+(key==="math"?"op":"mode")+'"]').selectOption(mode);
        await reset();
        const input=page.locator('input[name="'+field+'"]');
        assert.equal(await input.isVisible(),true,key+" dependent field must be visible after reset");
        assert.equal(await input.evaluate(node=>node.required),true);
      }
      await openTool("units");await page.locator('select[name="group"]').selectOption("mass");await reset();
      assert.equal(await page.locator('select[name="group"]').inputValue(),"length");
      assert.equal(await page.locator('select[name="from"] option[value="m"]').count(),1);
      assert.equal(await page.locator('select[name="from"] option[value="kg"]').count(),0);
      await openTool("fuel");await page.locator('select[name="mode"]').selectOption("imperial");await reset();
      assert.equal(await page.locator('select[name="mpgType"]').isVisible(),false);
      assert.match(await page.locator('input[name="distance"]').locator("..").innerText(),/km/);
      await openTool("currency");const rates=await page.locator('textarea[name="rates"]').inputValue();
      assert.ok(rates.length>100);await page.locator('textarea[name="rates"]').fill("EUR=1");await reset();
      assert.equal(await page.locator('textarea[name="rates"]').inputValue(),rates);
      await openTool("demographics");const shares=await page.locator('textarea[name="shares"]').inputValue();
      await page.locator('textarea[name="shares"]').fill("Example, 50");await reset();
      assert.equal(await page.locator('textarea[name="shares"]').inputValue(),shares);
    });
    await t.test("keyboard focus follows filters, tool entry and back navigation",async()=>{
      await page.locator(".back-directory").click();
      await page.waitForFunction(()=>!document.querySelector("aside").hidden);
      await page.locator(".category-chip").nth(5).click();
      assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute("aria-pressed")),"true");
      await page.locator(".category-chip").first().click();
      await page.locator('.tool-card[data-tool-key="bmi"]').focus();await page.keyboard.press("Enter");
      await page.waitForFunction(()=>document.activeElement?.tagName==="H2");
      assert.equal(await page.locator("#panel").getAttribute("data-tool-key"),"bmi");
      await page.locator(".back-directory").click();
      await page.waitForFunction(()=>document.activeElement?.dataset.toolKey==="bmi");
    });
    await t.test("pending hashes cannot overwrite reset, newer results, navigation or locale changes",async()=>{
      await openTool("hash");
      await page.evaluate(()=>{
        const digest=crypto.subtle.digest.bind(crypto.subtle);window.__pendingHashes=[];
        window.__restoreDigest=()=>{crypto.subtle.digest=digest;};
        crypto.subtle.digest=(...args)=>new Promise((resolve,reject)=>{
          window.__pendingHashes.push({complete:()=>digest(...args).then(resolve,reject),fail:()=>reject(new Error("delayed failure"))});
        });
      });
      const submit=async text=>{await page.locator('textarea[name="text"]').fill(text);await page.locator('#panel button[type="submit"]').click();};
      try{
        await submit("reset");await page.waitForFunction(()=>window.__pendingHashes.length===1);
        await reset();await page.evaluate(()=>window.__pendingHashes[0].complete());
        assert.equal(await page.locator(".result").count(),0);
        await submit("older");await submit("newer");await page.waitForFunction(()=>window.__pendingHashes.length===3);
        await page.evaluate(()=>window.__pendingHashes[2].complete());
        const expected=createHash("sha256").update("newer").digest("hex");
        assert.ok((await page.locator(".result").innerText()).includes(expected));
        await page.evaluate(()=>window.__pendingHashes[1].complete());
        assert.ok((await page.locator(".result").innerText()).includes(expected));
        await submit("navigate");await page.waitForFunction(()=>window.__pendingHashes.length===4);
        await openTool("bmi");await page.evaluate(()=>window.__pendingHashes[3].fail());
        assert.equal(await page.locator(".result").count(),0);
        await openTool("hash");await submit("locale");await page.waitForFunction(()=>window.__pendingHashes.length===5);
        await page.locator("#language").selectOption("de");await page.evaluate(()=>window.__pendingHashes[4].complete());
        assert.equal(await page.locator(".result").count(),0);
        await page.locator("#language").selectOption("en");
      }finally{await page.evaluate(()=>window.__restoreDigest());}
    });
    await t.test("late geolocation errors stay in their original view",async()=>{
      await openTool("qibla");await page.getByRole("button",{name:"Use my location",exact:true}).click();
      assert.equal(await page.evaluate(()=>window.__geoCalls),1);
      await openTool("bmi");await page.evaluate(()=>window.__geoRequests[0].error({code:1}));
      assert.equal(await page.locator(".result").count(),0);
    });
    await t.test("malformed and unknown fragments recover to the directory",async()=>{
      for(const hash of ["#/%","#/%E0%A4%A","#/missing"]){
        await page.goto("http://127.0.0.1:4173/"+hash);
        assert.equal(await page.locator(".tool-card").count(),38);
        assert.equal(await page.locator("#panel").isVisible(),false);
      }
      await openTool("bmi");
      await page.evaluate(()=>{location.hash="#/%";});
      await page.waitForFunction(()=>!document.querySelector("aside").hidden);
      assert.equal(await page.locator(".tool-card").count(),38);
    });

    assert.deepEqual(pageErrors,[]);
    assert.deepEqual(externalRequests,[],"calculator workflows must not make third-party network requests");
  }finally{
    if(browser)await browser.close();
    server.kill("SIGTERM");
  }
});

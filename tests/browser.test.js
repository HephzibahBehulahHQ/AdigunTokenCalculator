import test from "node:test";
import assert from "node:assert/strict";
import {existsSync} from "node:fs";
import {createHash} from "node:crypto";
import {spawn} from "node:child_process";
import {setTimeout as delay} from "node:timers/promises";
import {chromium} from "playwright-core";
import {RESULT_COPY,RESULT_LABELS,resultText} from "../src/result-i18n.js";
import "../src/feature-i18n.js";

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
    const page=await browser.newPage({locale:"en-US"}),pageErrors=[],externalRequests=[],strengthRequests=[];
    page.on("pageerror",e=>pageErrors.push(e.message));
    page.on("request",request=>{try{if(new URL(request.url()).host!=="127.0.0.1:4173")externalRequests.push(request.url());}catch{externalRequests.push(request.url());}});
    page.on("request",request=>{if(/password-strength|zxcvbn/.test(request.url()))strengthRequests.push(request.url());});
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
    const calculate=async()=>{await page.locator('#panel button[type="submit"]').click();await page.locator(".result").waitFor({timeout:5000});};
    const resultRows=()=>page.locator(".result-row").evaluateAll(rows=>Object.fromEntries(rows.map(row=>[row.querySelector("span").textContent,row.querySelector("strong").textContent])));
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
    await t.test("overflowed calculations report an error instead of Infinity",async()=>{
      await openTool("currency");
      await page.locator('input[name="amount"]').fill("1e308");
      await page.locator('select[name="toCurrency"]').selectOption("JPY");
      await page.locator('#panel button[type="submit"]').click();
      await page.locator('.result[role="alert"]').waitFor();
      assert.doesNotMatch(await page.locator(".result").innerText(),/Infinity|NaN|∞/);
    });
    await t.test("dynamic results use all four selected locales",async()=>{
      for(const locale of ["en","de","yo","pcm"]){
        await page.locator("#language").selectOption(locale);
        await openTool("timezone");
        await page.locator('select[name="fromZone"]').selectOption("Europe/Berlin");
        await page.locator('select[name="toZone"]').selectOption("UTC");
        await page.locator('input[name="dateTime"]').fill("2026-10-25T02:30");
        await calculate();
        assert.ok(Object.values(await resultRows()).includes(RESULT_COPY[locale].yes),locale+" ambiguous time");
        await page.locator('input[name="dateTime"]').fill("2026-07-01T12:00");
        await calculate();
        let rows=await resultRows();
        assert.ok(Object.values(rows).includes(RESULT_COPY[locale].no),locale+" regular time");
        assert.ok(Object.hasOwn(rows,RESULT_LABELS[locale]["Local ISO"]));
        if(locale==="de"){
          assert.equal(await page.evaluate(()=>navigator.language),"en-US");
          const expected=await page.evaluate(()=>new Intl.DateTimeFormat("de",{timeZone:"UTC",dateStyle:"medium",timeStyle:"short",hourCycle:"h23"}).format(new Date("2026-07-01T10:00:00Z")));
          assert.ok(Object.values(rows).includes(expected),"date formatting follows German app locale");
        }

        await openTool("stats");await page.locator('textarea[name="numbers"]').fill("5");await calculate();
        rows=await resultRows();
        assert.ok(Object.values(rows).includes(RESULT_COPY[locale].noUniqueMode));
        assert.equal(rows[RESULT_LABELS[locale].SampleVariance],RESULT_COPY[locale].singletonDeviation);
        await page.locator('textarea[name="numbers"]').fill("1,2,3");await calculate();
        rows=await resultRows();
        const variance=await page.evaluate(locale=>(2/3).toLocaleString(locale,{maximumFractionDigits:6}),locale);
        assert.equal(rows[RESULT_LABELS[locale].PopulationVariance],variance);
        assert.equal(rows[RESULT_LABELS[locale].SampleVariance],"1");

        await openTool("json");await page.locator('textarea[name="text"]').fill('{"x":\n}');await calculate();
        assert.equal(await page.locator('.result[role="alert"] .result-row strong').innerText(),resultText(locale,"jsonSyntaxAt",{line:2,column:1}));

        await openTool("hash");await page.locator('textarea[name="text"]').fill("é");await calculate();
        rows=await resultRows();
        assert.equal(rows[RESULT_LABELS[locale].Input],resultText(locale,"textBytes",{count:2}));
        assert.ok(Object.values(rows).includes(createHash("sha256").update("é").digest("hex")));

        await openTool("holidays");await page.locator('select[name="region"]').selectOption("DE");await calculate();
        rows=await resultRows();
        for(const name of ["New Year's Day","Christmas Day","Boxing Day","German Unity Day","Good Friday","Easter Monday"])assert.ok(Object.hasOwn(rows,RESULT_LABELS[locale][name]),locale+": "+name);

        await openTool("dates");await page.locator('input[name="start"]').fill("2020-01-01");
        const today=await page.evaluate(()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");});
        for(const [end,key] of [["2099-12-31","upcoming"],["2000-01-01","elapsed"],[today,"today"]]){
          await page.locator('input[name="end"]').fill(end);await calculate();
          assert.ok(Object.values(await resultRows()).includes(RESULT_COPY[locale][key]),locale+": "+key);
        }

        await openTool("fuel");
        for(const [field,value] of [["distance","100"],["efficiency","10"],["price","2"]])await page.locator('input[name="'+field+'"]').fill(value);
        for(const [mode,mpg,key] of [["metric",null,"fuelMetric"],["imperial","us","fuelUS"],["imperial","uk","fuelImperial"]]){
          await page.locator('select[name="mode"]').selectOption(mode);
          if(mpg)await page.locator('select[name="mpgType"]').selectOption(mpg);
          await calculate();assert.ok((await page.locator(".result .notice").innerText()).includes(RESULT_COPY[locale][key]));
        }
        await openTool("demographics");await page.locator('input[name="total"]').fill("1000");
        for(const [shares,key] of [["Example, 50","sharesBelow"],["Example, 100","sharesExact"],["One, 60\nTwo, 60","sharesAbove"]]){
          await page.locator('textarea[name="shares"]').fill(shares);await calculate();
          assert.ok((await page.locator(".result .notice").first().innerText()).includes(RESULT_COPY[locale][key]));
        }
      }
      await page.locator("#language").selectOption("en");
    });
    await t.test("engineering percentages and loan formulas work in every locale",async()=>{
      for(const locale of ["en","de","yo","pcm"]){
        await page.locator("#language").selectOption(locale);
        await openTool("math");
        await page.locator('select[name="op"]').selectOption("sqrt");
        await page.locator('select[name="op"]').selectOption("percentOf");
        const base=page.locator('input[name="b"]');
        assert.equal(await base.isVisible(),true);assert.equal(await base.evaluate(input=>input.required),true);
        await page.locator('input[name="a"]').fill("20");await base.fill("200");await calculate();
        assert.ok(Object.values(await resultRows()).includes("40"));
        assert.ok((await page.locator(".result").innerText()).includes(resultText(locale,"engineeringPercentNotice")));
        await openTool("percent");
        await page.locator('input[name="a"]').fill("20");await page.locator('input[name="b"]').fill("200");
        await page.locator('select[name="mode"]').selectOption("of");await calculate();
        assert.deepEqual(Object.values(await resultRows()),["40"]);
        assert.ok((await page.locator(".result").innerText()).includes(resultText(locale,"engineeringPercentNotice")));
        await page.locator('select[name="mode"]').selectOption("as");await calculate();
        assert.deepEqual(Object.values(await resultRows()),["10%"]);
        assert.ok((await page.locator(".result").innerText()).includes(resultText(locale,"percentageRatioNotice")));
        await page.locator('select[name="mode"]').selectOption("change");await calculate();
        assert.deepEqual(Object.values(await resultRows()),["900%"]);
        await openTool("loan");
        await page.locator('input[name="principal"]').fill("1200");
        await page.locator('input[name="annualRate"]').fill("0");
        await page.locator('input[name="term"]').fill("1");await calculate();
        let rows=await resultRows();
        assert.equal(rows[RESULT_LABELS[locale].LoanFormula],"M = P / n");
        assert.equal(rows[RESULT_LABELS[locale].NumberOfPayments],"12");
        assert.ok(Object.values(rows).includes("100"));
        await page.locator('input[name="principal"]').fill("1000");
        await page.locator('input[name="annualRate"]').fill("12");await calculate();
        rows=await resultRows();
        assert.equal(rows[RESULT_LABELS[locale].LoanFormula],"M = P × r / (1 − (1 + r)^(-n))");
        const payment=await page.evaluate(locale=>(88.849).toLocaleString(locale),locale);
        assert.ok(Object.values(rows).includes(payment));
        assert.ok((await page.locator(".result").innerText()).includes(resultText(locale,"loanVariables")));
      }
      await page.locator("#language").selectOption("en");
    });

    await t.test("small unit results remain nonzero and localized",async()=>{
      for(const locale of ["en","de","yo","pcm"]){
        await page.locator("#language").selectOption(locale);await openTool("units");
        await page.locator('select[name="group"]').selectOption("digital");
        await page.locator('select[name="from"]').selectOption("byte");
        await page.locator('select[name="to"]').selectOption("GB");
        await page.locator('input[name="value"]').fill("1");await calculate();
        assert.deepEqual(Object.values(await resultRows()),["1E-9 GB"]);
        await page.locator('select[name="from"]').selectOption("bit");
        await page.locator('select[name="to"]').selectOption("GiB");await calculate();
        const tiny=locale==="de"?"1,1641532E-10":"1.1641532E-10";
        assert.deepEqual(Object.values(await resultRows()),[tiny+" GiB"]);
        await page.locator('input[name="value"]').fill("0");await calculate();
        assert.deepEqual(Object.values(await resultRows()),["0 GiB"]);
        await page.locator('select[name="from"]').selectOption("byte");
        await page.locator('select[name="to"]').selectOption("kB");
        await page.locator('input[name="value"]').fill("1234.5");await calculate();
        assert.deepEqual(Object.values(await resultRows()),[(locale==="de"?"1,2345":"1.2345")+" kB"]);
      }
      await page.locator("#language").selectOption("en");
    });

    await t.test("discount modes exclude invalid inactive prices from validation",async()=>{
      await openTool("discount");
      await page.locator('input[name="price"]').fill("-1");
      await page.locator('select[name="mode"]').selectOption("reverse");
      await page.locator('input[name="salePrice"]').fill("80");
      await page.locator('input[name="discountPct"]').fill("20");
      await page.locator('input[name="taxRate"]').fill("0");
      assert.equal(await page.locator('input[name="price"]').isDisabled(),true);
      await calculate();assert.match(await page.locator(".result").innerText(),/100/);
      await page.locator('input[name="salePrice"]').fill("-1");
      await page.locator('select[name="mode"]').selectOption("forward");
      await page.locator('input[name="price"]').fill("100");
      assert.equal(await page.locator('input[name="salePrice"]').isDisabled(),true);
      await calculate();assert.match(await page.locator(".result").innerText(),/80/);
    });

    await t.test("color modes accept HEX RGB and HSL and reset conditional controls",async()=>{
      await openTool("color");
      const mode=page.locator('select[name="colorMode"]');
      assert.equal(await mode.inputValue(),"hex");
      assert.equal(await page.locator('input[name="foreground"]').getAttribute("type"),"text");
      assert.equal(await page.locator('input[name="background"]').getAttribute("type"),"color");
      const checkFields=async active=>{
        for(const name of ["foreground","red","green","blue","hue","saturation","lightness"]){
          const input=page.locator('input[name="'+name+'"]'),expected=active.includes(name);
          assert.equal(await input.isVisible(),expected,name+" visibility");
          assert.equal(await input.evaluate(node=>node.required),expected,name+" requirement");
          assert.equal(await input.isDisabled(),!expected,name+" enabled state");
        }
      };
      await checkFields(["foreground"]);
      await page.locator('input[name="foreground"]').fill("#09f");await calculate();
      assert.equal((await resultRows()).HEX,"#0099FF");
      await page.locator('input[name="foreground"]').fill("663399");await calculate();
      assert.equal((await resultRows()).HEX,"#663399");
      await mode.selectOption("rgb");await checkFields(["red","green","blue"]);
      for(const [field,value] of [["red","102"],["green","51"],["blue","153"]]){
        const input=page.locator('input[name="'+field+'"]');
        assert.equal(await input.getAttribute("type"),"number");assert.equal(await input.getAttribute("min"),"0");assert.equal(await input.getAttribute("max"),"255");
        await input.fill(value);
      }
      await calculate();assert.equal((await resultRows()).HEX,"#663399");
      await page.locator('input[name="red"]').fill("300");
      assert.equal(await page.locator("#panel form").evaluate(form=>form.checkValidity()),false);
      await mode.selectOption("hex");await checkFields(["foreground"]);
      await page.locator('input[name="foreground"]').fill("#09f");
      assert.equal(await page.locator("#panel form").evaluate(form=>form.checkValidity()),true,"inactive invalid RGB must not block HEX");
      await calculate();assert.equal((await resultRows()).HEX,"#0099FF");
      await mode.selectOption("hsl");await checkFields(["hue","saturation","lightness"]);
      for(const [field,value] of [["hue","240"],["saturation","100"],["lightness","50"]])await page.locator('input[name="'+field+'"]:visible').fill(value);
      await calculate();assert.equal((await resultRows()).HEX,"#0000FF");
      await page.locator('input[name="saturation"]').fill("101");
      assert.equal(await page.locator("#panel form").evaluate(form=>form.checkValidity()),false);
      await mode.selectOption("rgb");await checkFields(["red","green","blue"]);
      for(const [field,value] of [["red","102"],["green","51"],["blue","153"]])await page.locator('input[name="'+field+'"]').fill(value);
      assert.equal(await page.locator("#panel form").evaluate(form=>form.checkValidity()),true,"inactive invalid HSL must not block RGB");
      await calculate();assert.equal((await resultRows()).HEX,"#663399");
      await reset();assert.equal(await mode.inputValue(),"hex");await checkFields(["foreground"]);
      assert.equal(await page.locator(".result").count(),0);
    });
    await t.test("password scoring runs explicitly, stays private and resets to generation",async()=>{
      await openTool("password");
      const mode=page.locator('select[name="passwordMode"]'),password=page.locator('input[name="passwordInput"]');
      assert.equal(await mode.inputValue(),"generate");
      assert.equal(await password.isVisible(),false);
      assert.equal(strengthRequests.length,0,"strength estimator must not load merely by opening tools");
      await calculate();
      assert.equal(strengthRequests.length,0,"generation must not load strength estimator");
      await page.locator('input[name="length"]').fill("7");
      assert.equal(await page.locator("#panel form").evaluate(form=>form.checkValidity()),false);
      await mode.selectOption("check");
      assert.equal(await password.getAttribute("type"),"password");
      assert.equal(await password.isVisible(),true);assert.equal(await password.evaluate(input=>input.required),true);
      assert.equal(await page.locator('input[name="length"]').isDisabled(),true);
      assert.equal(await page.locator('select[name="charset"]').isDisabled(),true);
      await password.fill("aaaaaaaaaaaaaaaa");
      assert.equal(await page.locator("#panel form").evaluate(form=>form.checkValidity()),true,"inactive invalid generator length must not block strength check");
      assert.equal(strengthRequests.length,0,"typing must not load or run strength scoring");
      await calculate();
      await page.waitForFunction(()=>document.querySelector(".result")?.textContent.includes("/4"));
      assert.ok(strengthRequests.length>0,"explicit check loads the local estimator");
      assert.doesNotMatch(await page.locator(".result").innerText(),/aaaaaaaaaaaaaaaa/);
      for(const locale of ["en","de","yo","pcm"]){
        await page.locator("#language").selectOption(locale);
        await mode.selectOption("check");await password.fill("aaaaaaaaaaaaaaaa");await calculate();
        await page.waitForFunction(()=>document.querySelector(".result")?.textContent.includes("/4"));
        const text=await page.locator(".result").innerText();
        assert.ok(text.includes(resultText(locale,"pattern_repeat")),locale+" matched pattern");
        assert.ok(Object.hasOwn(await resultRows(),RESULT_LABELS[locale].StrengthScore));
        assert.ok(Object.hasOwn(await resultRows(),RESULT_LABELS[locale].DetectedPatterns));
        assert.doesNotMatch(text,/aaaaaaaaaaaaaaaa/);
      }
      await reset();assert.equal(await mode.inputValue(),"generate");
      assert.equal(await password.inputValue(),"");assert.equal(await password.isVisible(),false);
      assert.equal(await password.isDisabled(),true);
      assert.equal(await page.locator('input[name="length"]').isDisabled(),false);
      assert.equal(await page.locator(".result").count(),0);
      await page.locator("#language").selectOption("en");
    });
    await t.test("malformed and unknown fragments recover to the directory",async()=>{
      for(const hash of ["#/%","#/%E0%A4%A","#/missing"]){
        await page.goto("http://127.0.0.1:4173/"+hash);
        await page.reload();
        await page.locator(".tool-card").first().waitFor();
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

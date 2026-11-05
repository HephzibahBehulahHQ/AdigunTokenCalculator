import test from "node:test";
import assert from "node:assert/strict";
import {existsSync} from "node:fs";
import {spawn} from "node:child_process";
import {setTimeout as delay} from "node:timers/promises";
import {chromium} from "playwright-core";
import {ACCESSIBILITY_COPY} from "../src/accessibility-i18n.js";

const origin="http://127.0.0.1:4187";
const locales=["en","de","yo","pcm"];
const browserAvailable=existsSync(chromium.executablePath());

test("accessible navigation, memory, reflow and offline privacy",{skip:!browserAvailable,timeout:180000},async t=>{
  const server=spawn(process.execPath,["node_modules/vite/bin/vite.js","--host","127.0.0.1","--port","4187","--strictPort"],{stdio:"ignore"});
  let browser;
  try{
    let ready=false;
    for(let attempt=0;attempt<50;attempt++){
      try{if((await fetch(origin)).ok){ready=true;break;}}catch{}
      await delay(200);
    }
    assert.ok(ready,"the local app should start");
    browser=await chromium.launch({headless:true});
    const context=await browser.newContext({viewport:{width:1280,height:900},locale:"en-US"});
    const page=await context.newPage(),pageErrors=[],externalRequests=[];
    page.on("pageerror",error=>pageErrors.push(error.message));
    page.on("request",request=>{if(new URL(request.url()).origin!==origin)externalRequests.push(request.url());});
    await page.goto(origin);
    await page.locator(".tool-card").first().waitFor();
    const toolKeys=await page.locator(".tool-card").evaluateAll(cards=>cards.map(card=>card.dataset.toolKey));
    assert.equal(toolKeys.length,39);
    const openTool=async key=>{
      await page.evaluate(key=>{location.hash="#/"+key;},key);
      await page.waitForFunction(key=>document.querySelector("#panel")?.dataset.toolKey===key,key);
    };
    const directory=async()=>{
      await page.evaluate(()=>{location.hash="#/";});
      await page.waitForFunction(()=>!document.querySelector("aside").hidden);
    };
    const press=async button=>{await button.focus();await page.keyboard.press("Enter");};

    await t.test("skip link keeps calculator results and directory filters in every locale",async()=>{
      for(const locale of locales){
        await openTool("math");
        await page.locator("#language").selectOption(locale);
        await page.locator('input[name="a"]').fill("25");
        await page.locator('input[name="b"]').fill("4");
        await page.locator('select[name="op"]').selectOption("multiply");
        await press(page.locator('#panel button[type="submit"]'));
        await page.locator(".result").waitFor();
        const result=await page.locator(".result").innerText(),url=page.url();
        const historyLength=await page.evaluate(()=>history.length);
        await press(page.locator(".skip"));
        assert.equal(await page.evaluate(()=>document.activeElement?.id),"main");
        assert.equal(page.url(),url,"skip navigation must not change the calculator route");
        assert.equal(await page.evaluate(()=>history.length),historyLength);
        assert.equal(await page.locator('input[name="a"]').inputValue(),"25");
        assert.equal(await page.locator('input[name="b"]').inputValue(),"4");
        assert.equal(await page.locator(".result").innerText(),result);
        await page.keyboard.press("Tab");
        assert.equal(await page.locator(".back-directory").evaluate(node=>node===document.activeElement),true);
        await press(page.locator(".back-directory"));
        await page.locator("#search").waitFor();
        await page.locator(".category-chip").nth(2).click();
        const toolName=await page.locator('[data-tool-key="math"]').getAttribute("aria-label");
        await page.locator("#search").fill(toolName);
        assert.equal(await page.locator(".tool-card").count(),1);
        await press(page.locator(".skip"));
        assert.equal(await page.locator("#search").inputValue(),toolName);
        assert.equal(await page.locator(".tool-card").count(),1);
        assert.equal(await page.locator(".category-chip").nth(2).getAttribute("aria-pressed"),"true");
        await page.keyboard.press("Tab");
        assert.equal(await page.evaluate(()=>document.activeElement?.id),"search");
        await page.locator("#search").fill("");
        await page.locator(".category-chip").first().click();
      }
    });

    await t.test("localized landmarks and engineering actions work with the keyboard",async()=>{
      for(const locale of locales){
        await openTool("math");
        await page.locator("#language").selectOption(locale);
        await page.locator('#panel button[type="reset"]').click();
        const copy=ACCESSIBILITY_COPY[locale];
        assert.equal(await page.locator(".skip").textContent(),copy.skipToTools);
        assert.equal(await page.getByRole("navigation",{name:copy.toolDirectory,includeHidden:true}).count(),1);
        assert.equal(await page.getByRole("group",{name:copy.categoryFilter,includeHidden:true}).count(),1);
        const actions=page.getByRole("group",{name:copy.memoryControls});
        const action=key=>actions.getByRole("button",{name:copy[key],exact:true});
        const status=page.locator(".memory-status");
        assert.equal(await status.getAttribute("role"),"status");
        assert.equal(await status.getAttribute("aria-atomic"),"true");
        for(const key of ["memoryAdd","memorySubtract","memoryRecall","memoryClear","clearOperands","backspaceOperand"]){
          assert.equal(await action(key).count(),1);
          assert.equal(await action(key).getAttribute("title"),copy[key]);
        }
        await page.locator('input[name="a"]').fill("12");
        await press(action("memoryAdd"));
        assert.equal(await status.innerText(),copy.memoryValue+": 12");
        await page.locator('input[name="a"]').fill("3");
        await press(action("memorySubtract"));
        assert.equal(await status.innerText(),copy.memoryValue+": 9");
        await press(action("memoryRecall"));
        assert.equal(await page.locator('input[name="a"]').inputValue(),"9");
        assert.equal(await status.innerText(),copy.memoryRecalled+": 9");
        await page.locator('input[name="a"]').fill("123");
        await press(action("backspaceOperand"));
        assert.equal(await page.locator('input[name="a"]').inputValue(),"12");
        await press(action("clearOperands"));
        assert.equal(await page.locator('input[name="a"]').inputValue(),"");
        assert.equal(await page.locator('input[name="b"]').inputValue(),"");
        await press(action("memoryClear"));
        assert.equal(await status.innerText(),copy.memoryValue+": 0");
      }
    });

    await t.test("overflow leaves engineering memory usable and reports an accessible error",async()=>{
      await openTool("math");
      await page.locator("#language").selectOption("en");
      await page.locator('#panel button[type="reset"]').click();
      const action=key=>page.getByRole("button",{name:ACCESSIBILITY_COPY.en[key],exact:true});
      await page.locator('input[name="a"]').fill("1e308");
      await press(action("memoryAdd"));
      await press(action("memoryAdd"));
      await page.getByRole("alert").waitFor();
      assert.equal(await page.locator(".memory-status").innerText().then(text=>/Infinity|NaN/.test(text)),false);
      await press(action("memoryRecall"));
      assert.equal(Number(await page.locator('input[name="a"]').inputValue()),1e308);
      await press(action("memoryClear"));
      assert.equal(await page.getByRole("alert").count(),0);
      assert.equal(await page.locator(".memory-status").innerText(),"Memory: 0");
      await press(action("memoryRecall"));
      assert.equal(await page.locator('input[name="a"]').inputValue(),"0");
    });

    await t.test("all 39 panels reflow on narrow, tablet, desktop and enlarged layouts",async()=>{
      const layouts=[{width:320,height:800,zoom:1},{width:768,height:1024,zoom:1},{width:1440,height:900,zoom:1},{width:1280,height:900,zoom:2}];
      const failures=[];
      for(const locale of locales){
        await directory();
        await page.locator("#language").selectOption(locale);
        for(const layout of layouts){
          await page.setViewportSize({width:layout.width,height:layout.height});
          await page.evaluate(zoom=>{document.documentElement.style.zoom=String(zoom);},layout.zoom);
          for(const key of ["",...toolKeys]){
            if(key)await openTool(key);else await directory();
            const geometry=await page.evaluate(()=>{
              const width=document.documentElement.clientWidth,scroll=document.documentElement.scrollWidth;
              const overflowing=scroll>width+1?[...document.querySelectorAll("#panel *,header *,.tool-card *")].filter(node=>node.getBoundingClientRect().right>innerWidth+1).slice(0,5).map(node=>({tag:node.tagName,class:node.className,text:node.textContent.slice(0,70)})):[];
              return {width,scroll,overflowing};
            });
            if(geometry.scroll>geometry.width+1)failures.push(`${locale}/${key||"directory"} at ${layout.width}px, ${layout.zoom}x: ${JSON.stringify(geometry)}`);
            if(key==="bac")await page.keyboard.press("Escape");
          }
        }
      }
      await page.evaluate(()=>{document.documentElement.style.zoom="1";});
      await page.setViewportSize({width:1280,height:900});
      assert.deepEqual(failures,[],"translated panels must reflow without page-level horizontal scrolling");
    });

    await t.test("already loaded calculations stay local and usable while offline",async()=>{
      await directory();
      await page.locator("#language").selectOption("en");
      await openTool("password");
      await page.locator('select[name="passwordMode"]').selectOption("check");
      await page.locator('input[name="passwordInput"]').fill("Example-only-private-6tR!2");
      await page.locator('#panel button[type="submit"]').click();
      await page.locator(".result").waitFor();
      const submitted=[];
      const record=request=>submitted.push(request.url());
      page.on("request",record);
      await context.setOffline(true);
      try{
        const previousResult=await page.locator(".result").elementHandle();
        await page.locator('input[name="passwordInput"]').fill("Offline-private-3sK!8");
        await page.locator('#panel button[type="submit"]').click();
        await page.waitForFunction(previous=>!previous.isConnected,previousResult);
        await page.locator(".result").waitFor();
        assert.doesNotMatch(await page.locator(".result").innerText(),/Offline-private-3sK!8/);
        await openTool("hash");
        await page.locator('textarea[name="text"]').fill("abc");
        await page.locator('select[name="algorithm"]').selectOption("SHA-256");
        await page.locator('#panel button[type="submit"]').click();
        await page.locator(".result").waitFor();
        assert.match(await page.locator(".result").innerText(),/ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad/);
        await openTool("currency");
        await page.locator('input[name="amount"]').fill("100");
        await page.locator('#panel button[type="submit"]').click();
        await page.locator(".result").waitFor();
        assert.match(await page.locator(".result").innerText(),/112\.67\s+USD/);
        assert.deepEqual(submitted,[],"loaded calculations must not initiate requests");
        assert.deepEqual(await page.evaluate(()=>({local:Object.keys(localStorage),session:Object.keys(sessionStorage)})),{local:[],session:[]});
      }finally{
        page.off("request",record);
        await context.setOffline(false);
      }
    });
    assert.deepEqual(pageErrors,[]);
    assert.deepEqual(externalRequests,[]);
  }finally{
    if(browser)await browser.close();
    server.kill("SIGTERM");
  }
});

import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readdir,readFile} from "node:fs/promises";
import {resolve,join,relative,sep} from "node:path";
import {parseArgs} from "node:util";
import {setTimeout as delay} from "node:timers/promises";
import {chromium} from "playwright-core";

// Checks the downloaded deployment artifact and a fresh browser context only.
// No server, account, real customer data, or saved electrical profile is used.
const {values:args}=parseArgs({options:{url:{type:"string"},artifact:{type:"string"}}});
assert.ok(args.url&&args.artifact,"Usage: node scripts/verify-deployment.mjs --url <site-url> --artifact <directory>");
const site=new URL(args.url);
assert.ok(["https:","http:"].includes(site.protocol)&&!site.username&&!site.password&&!site.search&&!site.hash,"Use the site's plain HTTP(S) directory URL");
if(!site.pathname.endsWith("/"))site.pathname+="/";
const artifact=resolve(args.artifact),started=Date.now(),deadline=started+180_000;
const watchdog=setTimeout(()=>{console.error("Deployment verification exceeded its three-minute limit");process.exit(1);},180_000);
watchdog.unref();
const digest=bytes=>createHash("sha256").update(bytes).digest("hex");
let browser;

async function artifactFiles(directory){
  const files=[];
  for(const entry of await readdir(directory,{withFileTypes:true})){
    const path=join(directory,entry.name);
    assert.ok(!entry.isSymbolicLink(),"Artifact must not contain symlinks");
    if(entry.isDirectory())files.push(...await artifactFiles(path));
    else if(entry.isFile())files.push(path);
  }
  return files.sort();
}

async function verifyBytes(url,expected,label){
  let failure;
  // Covers short server startup / CDN propagation delays without endless polling.
  for(let attempt=0;attempt<5;attempt++){
    if(attempt)await delay(1000*2**(attempt-1));
    try{
      assert.ok(Date.now()<deadline-60_000,"Artifact checks exhausted their time budget");
      const response=await fetch(url,{redirect:"error",cache:"no-store",headers:{"Cache-Control":"no-cache"},signal:AbortSignal.timeout(8_000)});
      assert.equal(response.status,200,`${label}: HTTP ${response.status}`);
      assert.equal(digest(new Uint8Array(await response.arrayBuffer())),expected,`${label}: deployed bytes differ from the artifact`);
      return;
    }catch(error){failure=error;}
  }
  throw failure;
}

async function verifyArtifact(){
  const files=await artifactFiles(artifact);
  assert.ok(files.some(path=>relative(artifact,path)==="index.html"),"Artifact is missing index.html");
  let next=0;
  await Promise.all(Array.from({length:Math.min(6,files.length)},async()=>{
    while(next<files.length){
      const path=files[next++],name=relative(artifact,path).split(sep).join("/");
      const url=new URL(name.split("/").map(encodeURIComponent).join("/"),site);
      await verifyBytes(url,digest(await readFile(path)),name);
    }
  }));
  await verifyBytes(site,digest(await readFile(join(artifact,"index.html"))),"directory entry point");
  console.log(`PASS artifact: SHA-256 matches for all ${files.length} files and the directory entry point`);
}

async function verifyBrowser(){
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({locale:"en-US",timezoneId:"UTC",viewport:{width:375,height:812}});
  const page=await context.newPage(),errors=[],external=[],failed=[],completed=[];
  page.setDefaultTimeout(8_000);page.setDefaultNavigationTimeout(20_000);
  page.on("pageerror",error=>errors.push(error.message));
  context.on("request",request=>{
    const url=new URL(request.url());
    if(/^https?:$/.test(url.protocol)&&(url.origin!==site.origin||request.method()!=="GET"))external.push(`${request.method()} ${url.href}`);
  });
  context.on("response",response=>{
    if(response.url().startsWith(site.href)&&response.status()>=400)failed.push(`${response.status()} ${response.url()}`);
  });
  context.on("requestfailed",request=>{
    // Leaving a tool deliberately terminates its worker and may cancel its fetch.
    const reason=request.failure()?.errorText||"unknown";
    if(reason!=="net::ERR_ABORTED"&&request.url().startsWith(site.href))failed.push(`${reason} ${request.url()}`);
  });
  await page.addInitScript(()=>{
    window.__deploymentGeoCalls=0;
    Object.defineProperty(navigator,"geolocation",{configurable:true,value:{getCurrentPosition(){window.__deploymentGeoCalls++;}}});
  });
  // A fixed synthetic reference date makes age, pregnancy and countdown checks
  // reproducible while normal browser timers, requests and workers still run.
  await page.clock.setFixedTime(new Date("2026-11-05T12:00:00Z"));
  await page.goto(site.href,{waitUntil:"domcontentloaded"});
  await page.locator(".tool-card").first().waitFor();
  const keys=await page.locator(".tool-card").evaluateAll(nodes=>nodes.map(node=>node.dataset.toolKey));
  assert.equal(keys.length,39);assert.equal(new Set(keys).size,39);
  assert.equal(await page.locator(".category-chip").count(),11);
  await page.locator("#search").fill("currency");assert.equal(await page.locator(".tool-card").count(),1);await page.locator("#search").fill("");
  await page.locator('.offline-status[data-offline-state="ready"]').waitFor({timeout:30_000});

  const open=async key=>{
    await page.evaluate(value=>{location.hash="#/"+value;},key);
    await page.waitForFunction(value=>value?document.querySelector("#panel")?.dataset.toolKey===value:document.querySelector("#panel")?.hidden&&!document.querySelector("aside")?.hidden,key);
  };
  const fill=async fields=>{
    for(const [name,value] of Object.entries(fields)){
      const input=page.locator(`#panel [name="${name}"]`);
      if(await input.evaluate(node=>node.tagName==="SELECT"))await input.selectOption(String(value));
      else await input.fill(String(value));
    }
  };
  const rows=()=>page.locator("#panel .result-row").evaluateAll(nodes=>nodes.map(node=>node.querySelector("strong").textContent));
  const calculate=async(errorExpected=false)=>{
    assert.equal(await page.locator("#panel form").evaluate(form=>form.checkValidity()),true,"Smoke fixture must satisfy native input validation");
    await page.locator('#panel button[type="submit"]').click();
    await page.waitForFunction(()=>document.querySelector("#panel .result")&&document.querySelector("#panel form")?.getAttribute("aria-busy")==="false",undefined,{timeout:20_000});
    assert.equal(await page.locator('#panel .result[role="alert"]').count(),errorExpected?1:0,await page.locator("#panel .result").innerText());
    return rows();
  };
  const reflow=async label=>assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),true,`${label}: horizontal overflow`);
  const flow=async(key,fields,check)=>{
    await open(key);await fill(fields);const result=await calculate();await check(result);await reflow(key);completed.push(key);
  };
  const equal=expected=>actual=>assert.deepEqual(actual,expected);
  const first=expected=>actual=>assert.deepEqual(actual.slice(0,expected.length),expected);

  await flow("token",{encoding:"cl100k_base",text:"Hello world"},first(["2","11","cl100k_base"]));
  assert.equal(await page.locator(".piece").allTextContents().then(parts=>parts.join("")),"Hello world");
  await fill({encoding:"o200k_base"});first(["2","11","o200k_base"])(await calculate());
  await flow("math",{a:12,b:4,op:"divide"},equal(["3"]));
  await flow("text",{text:"Hello world."},first(["2","12","11","1","1"]));
  await flow("temp",{value:100,direction:"c"},equal(["212 °F"]));
  await flow("age",{birth:"2000-01-01"},first(["26","10","4"]));
  await flow("bmi",{weight:80,height:2},equal(["20"]));
  await flow("percent",{mode:"change",a:80,b:100},equal(["25%"]));
  await open("world");
  assert.match(await page.locator(".result").innerText(),/estimate, not live data/i);
  const population=Number((await rows())[0].replaceAll(",",""));assert.ok(population>8e9&&population<9e9);completed.push("world");await reflow("world");
  await flow("demographics",{total:1000,shares:"Group A, 60\nGroup B, 40"},equal(["600 (60%)","400 (40%)","100%"]));
  await flow("practice",{minutes:10,sessions:7,years:2},first(["10","70"]));
  await flow("zakat",{cash:1000,gold:0,silver:0,investments:0},result=>assert.equal(result[6],"25"));
  await flow("qibla",{lat:0,lon:39.8262},equal(["0°","N"]));
  await flow("units",{value:1,group:"length",from:"mi",to:"km"},equal(["1.609344 km"]));
  await flow("loan",{principal:1200,annualRate:0,term:1},first(["100","1,200","0","12"]));
  await flow("dates",{start:"2024-02-28",end:"2024-03-01"},first(["2"]));
  await flow("gpa",{grades:"A,3\nB,3"},first(["3.5"]));
  await flow("fuel",{distance:100,efficiency:8,price:2},equal(["8 L","8 L","16"]));
  await flow("sleep",{time:"22:30",cycle:90,buffer:15},first(["00:15","01:45"]));
  await flow("timezone",{dateTime:"2026-01-01T12:00",fromZone:"Europe/Berlin",toZone:"UTC"},result=>assert.equal(result[1],"2026-01-01T11:00"));
  await flow("currency",{amount:100},first(["112.67 USD"]));
  await flow("inflation",{amount:100,fromYear:2020,toYear:2022,annualRate:10},equal(["121","2"]));
  await flow("tip",{bill:100,tipRate:10,taxRate:0,people:2},equal(["10","0","110","55"]));
  await flow("calories",{weightKg:70,heightCm:175,age:30,sex:"male",activity:"sedentary"},first(["1,649","1,979"]));
  await flow("pregnancy",{method:"lmp",inputDate:"2026-10-01"},first(["2027-07-08"]));
  await flow("water",{weightKg:70},first(["2,100","2,450"]));
  await open("bac");await page.locator("dialog.bac-dialog[open]").waitFor();
  assert.equal(await page.locator('[data-bac-action="continue"]').isDisabled(),true);
  await page.locator('dialog [name="acknowledge"]').check();await page.locator('[data-bac-action="continue"]').click();
  await fill({weightKg:70,drinks:0});equal(["0","0"])(await calculate());
  assert.match(await page.locator(".result").innerText(),/Do NOT use this to decide whether to drive/);completed.push("bac");await reflow("bac");
  await flow("roman",{value:2026},equal(["MMXXVI"]));
  await flow("bases",{value:255,fromBase:10,toBase:16},equal(["FF","16"]));
  await flow("password",{length:20,charset:"hex"},result=>{assert.match(result[0],/^[0-9a-f]{20}$/);assert.equal(result[1],"80");});
  await fill({passwordMode:"check",passwordInput:"correct horse battery staple"});
  assert.match((await calculate())[0],/^[0-4]\/4/);
  await flow("qr",{text:"Release verification"},equal(["Release verification"]));
  await page.waitForFunction(()=>{const image=document.querySelector(".qr-preview");return image?.complete&&image.naturalWidth>0;});
  assert.match(await page.locator(".result a[download]").getAttribute("href"),/^data:image\//);
  await flow("hash",{text:"abc"},first(["ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"]));
  await flow("json",{text:'{"number":900719925474099312345,"ok":true}'},equal(['{\n  "number": 900719925474099312345,\n  "ok": true\n}']));
  await flow("color",{foreground:"#000000",background:"#ffffff"},result=>{assert.equal(result[0],"#000000");assert.equal(result[3],"21:1");});
  await flow("discount",{price:100,discountPct:100,taxRate:19},equal(["0","0","0","100"]));
  await fill({mode:"reverse",salePrice:80});await calculate(true);
  assert.equal(await page.locator('[name="discountPct"]').getAttribute("aria-invalid"),"true");
  assert.equal(await page.evaluate(()=>document.activeElement?.name),"discountPct");
  await fill({discountPct:99.999,taxRate:0});equal(["8,000,000"])(await calculate());
  await fill({discountPct:20});equal(["100"])(await calculate());
  await flow("recipe",{text:"1 1/2 kg flour\n250 mL milk",fromServings:2,toServings:4},equal(["3 kg flour\n500 mL milk"]));
  await flow("holidays",{year:2026,region:"US",referenceZone:"UTC"},result=>assert.ok(result.some(value=>/2026-12-25.*50 days away/.test(value))));
  await flow("morse",{text:"SOS"},equal(["... --- ..."]));
  await flow("stats",{numbers:"1, 2, 3"},result=>{assert.equal(result[0],"2");assert.equal(result.at(-1),"3");});
  await open("electrical-load");
  await fill({preset:"refrigerator",name:"Release smoke appliance",watts:100,quantity:2,hoursPerDay:6,dutyCycle:50,standbyW:2,seasonalFactor:1.5});
  await page.locator('[data-action="add-device"]').click();
  await page.waitForFunction(()=>Math.abs(Number(document.querySelector('[data-result="dailyKWh"]')?.dataset.value)-0.972)<1e-9);
  assert.equal(await page.locator("[data-device-row]").count(),1);completed.push("electrical-load");await reflow("electrical-load");
  assert.deepEqual([...completed].sort(),[...keys].sort(),"Every deployed tool must complete its smoke calculation");
  console.log(`PASS browser: meaningful synthetic calculations for ${completed.length}/39 tools, both token encodings, password strength, and discount error/recovery`);

  for(const locale of ["en","de","yo","pcm"]){
    await open("");await page.locator("#language").selectOption(locale);
    assert.equal(await page.locator("html").getAttribute("lang"),locale);
    assert.equal(await page.locator(".tool-card").count(),39);await reflow(`${locale} directory`);
    await page.locator('[data-tool-key="math"]').click();
    await page.waitForFunction(()=>document.querySelector("#panel")?.dataset.toolKey==="math");
    await fill({a:12,b:4,op:"divide"});equal(["3"])(await calculate());await reflow(`${locale} calculator`);
    await page.locator(".back-directory").click();await page.locator(".tool-card").first().waitFor();
  }
  await page.setViewportSize({width:320,height:812});await reflow("320px directory");
  await page.locator(".tool-card").first().focus();await page.keyboard.press("Enter");
  await page.waitForFunction(()=>document.querySelector("#panel")?.dataset.toolKey==="token");await reflow("320px tokenizer");
  assert.equal(await page.evaluate(()=>window.__deploymentGeoCalls),0,"Location must not be requested automatically");
  assert.deepEqual(await page.evaluate(()=>({local:localStorage.length,session:sessionStorage.length})),{local:0,session:0});
  assert.deepEqual(errors,[],"Browser runtime errors");assert.deepEqual(external,[],"Unexpected external requests or writes");assert.deepEqual(failed,[],"Failed deployed assets");
  console.log("PASS browser: four-locale navigation/calculation, mobile reflow, keyboard navigation, offline preparation, and privacy/network checks");
  await context.close();
}

try{
  await verifyArtifact();await verifyBrowser();
  console.log(`PASS deployment verification: ${site.href} (${Math.round((Date.now()-started)/1000)}s)`);
}catch(error){console.error("FAIL deployment verification:",error);process.exitCode=1;}
finally{await browser?.close();clearTimeout(watchdog);}

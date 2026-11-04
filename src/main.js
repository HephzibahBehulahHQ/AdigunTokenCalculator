import {I} from "./i18n.js";
import "./copy.js";
import * as c from "./calculators.js";
import {tokenize,encodings} from "./tokenizer.js";
import * as a from "./additional.js";
import "./additional-i18n.js";
import qrcode from "qrcode-generator";
import "./styles.css";

const $=s=>document.querySelector(s),nav=$("#nav"),panel=$("#panel"),search=$("#search");
let lang="en",active=-1,memoryValue=0,tokenRequest=0,activeCategory="All";
const keys=["token","math","text","temp","age","bmi","percent","world","demographics","practice","zakat","qibla","units","loan","dates","gpa","fuel","sleep","timezone","currency","inflation","tip","calories","pregnancy","water","bac","roman","bases","password","qr","hash","json","color","discount","recipe","holidays","morse","stats"];
const schema={
 token:[["text","textarea"],["encoding","select",encodings]],
 math:[["a","number"],["b","number"],["op","select",[["add","Add"],["subtract","Subtract"],["multiply","Multiply"],["divide","Divide"],["power","Power"],["modulo","Remainder"],["sqrt","Square root"],["sin","Sine (degrees)"],["cos","Cosine (degrees)"],["tan","Tangent (degrees)"],["log","Base-10 logarithm"],["ln","Natural logarithm"],["factorial","Factorial"]]]],
 text:[["text","textarea"]],
 temp:[["value","number"],["direction","select",[["c","Celsius to Fahrenheit"],["f","Fahrenheit to Celsius"]]]],
 age:[["birth","date"]],
 bmi:[["unit","select",[["metric","Metric (kg, m)"],["imperial","Imperial (lb, in)"]]],["weight","number"],["height","number"]],
 percent:[["mode","select",[["of","X percent of Y"],["as","X as percent of Y"],["change","Percentage change"]]],["a","number"],["b","number"]],
 world:[],
 demographics:[["total","number"],["shares","textarea",null,`Christianity, 28.8
Islam, 25.6
Hinduism, 14.9
Buddhism, 4.1
Judaism, 0.2
Other religions (including folk/traditional), 2.2
Religiously unaffiliated, 24.2`]],
 practice:[["minutes","number"],["sessions","number"],["years","number"]],
 zakat:[["cash","number"],["gold","number"],["silver","number"],["investments","number"],["rate","number",null,"2.5"]],
 qibla:[["lat","number"],["lon","number"]],
 units:[["value","number"],["group","select",[["length","Length"],["mass","Mass"],["volume","Volume (US)"],["area","Area"],["speed","Speed"],["digital","Digital storage"]]],["from","select"],["to","select"]],
 loan:[["principal","number"],["annualRate","number"],["term","number"]],
 dates:[["mode","select",[["difference","Date difference"],["annual","Annual event countdown"]]],["start","date"],["end","date"]],
 gpa:[["mode","select",[["scale4","4.0 grade scale"],["percentage","Percentage average"]]],["grades","textarea"]],
 fuel:[["mode","select",[["metric","Metric (km, L/100 km)"],["imperial","Imperial (miles, mpg)"]]],["distance","number"],["efficiency","number"],["mpgType","select",[["us","US mpg"],["uk","Imperial mpg"]]],["price","number"]],
 sleep:[["mode","select",[["bed","Wake times from bedtime"],["wake","Bedtimes from wake time"]]],["time","time",null,"22:30"],["cycle","number",null,"90"],["buffer","number",null,"15"]]
};
const unitChoices={length:["m","km","mi","ft","in"],mass:["kg","g","lb","oz"],volume:["L","mL","US gal","US qt"],area:["m²","ft²","acre","ha"],speed:["km/h","mph","m/s"],digital:["bit","byte","kB","MB","GB","KiB","MiB","GiB"]};
const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;};
const tr=()=>I[lang],label=k=>tr().fields[k]||k;
function option(select,value,text){const o=el("option","",text);o.value=value;select.append(o);}
function makeField(form,spec){const [key,type,opts,def]=spec,wrap=el("label","field");wrap.append(el("span","field-label",label(key)));let input;
 if(type==="select"){input=el("select");(opts||[]).forEach(([v,l])=>option(input,v,tr().options?.[v]||l));}
 else if(type==="textarea"){input=el("textarea");input.rows=key==="text"?7:5;input.required=true;if(key==="shares")input.placeholder="Christianity, 30\nIslam, 25\nUnaffiliated, 20";}
 else{input=el("input");input.type=type;if(type==="number"){input.step="any";input.required=true;if(!["lat","lon","value","a","b"].includes(key))input.min="0";if(key==="lat"){input.min="-90";input.max="90";}if(key==="lon"){input.min="-180";input.max="180";}}else input.required=true;}
 input.name=key;if(def!==undefined)input.value=def;wrap.append(input);form.append(wrap);return input;}
function renderNav(){
 nav.replaceChildren();const q=search.value.toLocaleLowerCase(),categories=tr().categories||["All"],values=["All","Token & AI","Math","Text & Language","Conversion","Health","Finance","Time & Date","World & Culture","Developer","Security & Privacy"],chips=$("#categories");
 chips.replaceChildren();categories.forEach((name,i)=>{const b=el("button","category-chip",name);b.type="button";b.setAttribute("aria-pressed",values[i]===activeCategory?"true":"false");b.addEventListener("click",()=>{activeCategory=values[i]||"All";renderNav();});chips.append(b);});
 const icons={"Token & AI":"🔤","Math":"∑","Text & Language":"文","Conversion":"⇄","Health":"♥","Finance":"¤","Time & Date":"◷","World & Culture":"◎","Developer":"{}","Security & Privacy":"⌑"};
 keys.forEach((key,i)=>{const category=tr().toolCategoryByKey[key]||tr().groups[i];if(activeCategory!=="All"&&category!==activeCategory)return;if(q&&!tr().names[i].toLocaleLowerCase().includes(q)&&!tr().descriptions[i].toLocaleLowerCase().includes(q))return;
  const card=el("button","tool-card");card.type="button";card.setAttribute("aria-label",tr().names[i]);const glyph=el("span","tool-icon",icons[category]||"•");glyph.setAttribute("aria-hidden","true");const title=el("strong","tool-card-title",tr().names[i]);const desc=el("span","tool-card-description",tr().descriptions[i]);const tag=el("span","tool-card-category",category);card.append(glyph,title,desc,tag);card.addEventListener("click",()=>{active=i;location.hash="#/"+key;renderTool();});nav.append(card);
 });
 if(!nav.children.length)nav.append(el("p","muted",tr().noResults||"No matching tools."));
}
function out(k){if(tr().outputs?.[k])return tr().outputs[k];if(k.startsWith("Category "))return (tr().outputs?.Category||"Category")+" "+k.slice(9);if(k.startsWith("After "))return (tr().outputs?.["After cycles"]||"After cycles")+" "+k.slice(6).replace(" cycles","");return k;}
function result(rows,note="",kind="status"){panel.querySelector(".result")?.remove();const box=el("section","result");box.className="result "+(kind==="error"?"result-error":"");box.setAttribute("role",kind==="error"?"alert":"status");box.setAttribute("aria-live","polite");box.append(el("h3","",tr().result));rows.forEach(([k,v])=>{const r=el("div","result-row");r.append(el("span","",out(k)),el("strong","",String(v)));box.append(r);});if(note)box.append(el("p","notice",note));panel.append(box);return box;}
function fmt(n,d=3){return Number(n).toLocaleString(lang,{maximumFractionDigits:d});}
function errorResult(err){const message=err?.message==="empty"?tr().empty:tr().invalid;result([["",message]],"", "error");}
function addCopyButton(container,text,labelText){const b=el("button","secondary",labelText);b.type="button";b.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(text);b.textContent=tr().copied||"Copied";}catch{b.textContent=tr().copyFailed||"Copy unavailable";}});container.append(b);}
async function execute(k,d){
 const T=tr(),N=T.notices;let rows=[],note="";
 switch(k){
 case"token":{if(!d.text)throw Error("empty");const r=await tokenize(d.text,d.encoding);const box=result([["Tokens",r.ids.length],["Unicode code points",r.chars],["Token IDs",r.ids.join(", ")||"—"]],N.token);const seg=el("div","segments");r.pieces.forEach((p,i)=>{const s=el("span","piece",p);s.title="Token "+r.ids[i];seg.append(s);});box.append(seg);const actions=el("div","actions");addCopyButton(actions,r.ids.join(", "),T.copyIds||"Copy token IDs");addCopyButton(actions,r.pieces.join(""),T.copyText||"Copy reconstructed text");box.append(actions);return;}
 case"math":{const v=c.engineering(d.a,d.b,d.op);rows=[["Result",fmt(v,8)]];note=N.math||"";break;}
 case"text":{if(!d.text)throw Error("empty");const r=c.stats(d.text);rows=[["Words",r.words],["Characters (Unicode code points)",r.chars],["Characters excluding whitespace",r.noSpace],["Sentences (estimate)",r.sentences],["Paragraphs",r.paragraphs],["Reading time at 200 wpm",fmt(r.words/200)+" min"]];note=T.textAssumption||"Sentence and reading-time counts are estimates; reading speed is 200 words per minute.";break;}
 case"temp":rows=[["Result",fmt(c.temperature(d.value,d.direction),4)+(d.direction==="c"?" °F":" °C")]];break;
 case"age":{const r=c.age(d.birth);rows=[["Years",r.years],["Months",r.months],["Days",r.days]];break;}
 case"bmi":rows=[["BMI",fmt(c.bmi(d.weight,d.height,d.unit))]];note=N.bmi;break;
 case"percent":rows=[["Result",fmt(c.percent(d.mode,d.a,d.b))+"%"]];note=T.percentageAssumption||"Percentage change is signed: increases are positive and decreases are negative.";break;
 case"world":{const r=c.populationEstimate(new Date());rows=[["Estimated population",fmt(r.rounded,0)],["Estimated net change per day",fmt(r.perDay,0)],["Reference baseline",fmt(r.baseline,0)+" · "+r.baselineDate],["Estimate timestamp UTC",new Date().toISOString()]];note=T.worldEstimateNotice||"Estimate, not live data. Linear interpolation from UN medium-variant mid-year projections.";break;}
 case"demographics":{const r=c.demographics(d.total,d.shares);rows=r.rows.map(x=>[x.name,fmt(x.count,0)+" ("+fmt(x.share,2)+"%)"]);rows.push(["Entered percentage total",fmt(r.totalShare,2)+"%"]);note=(T.demographicsSourceNote||"Starting shares are Pew Research Center global estimates for 2020; editable and not individual beliefs. ") + N.demographics+" "+(r.totalShare<100?"Entered shares are below 100%.":r.totalShare>100?"Entered shares exceed 100%.":"Entered shares total 100%.");break;}
 case"practice":{const r=c.practice(d.minutes,d.sessions,d.years);rows=[["Daily average minutes",fmt(r.day)],["Weekly minutes",fmt(r.week)],["Annual hours",fmt(r.year/60)],["Lifetime hours",fmt(r.lifetime/60)]];note=T.practiceAssumption||"Annual projection assumes 52 weeks per year; daily value is a weekly average.";break;}
 case"zakat":{const r=c.zakat(d,d.rate);rows=[["Entered assets",fmt(r.assets)],["Applied rate",fmt(d.rate)+"%"],["Calculated amount",fmt(r.due)]];note=N.zakat;break;}
 case"qibla":{const b=c.bearing(d.lat,d.lon);rows=[["Initial bearing",fmt(b,1)+"°"],["Compass direction",c.compass(b)]];note=N.qibla;break;}
 case"units":rows=[["Converted value",fmt(c.unit(d.value,d.from,d.to,d.group),8)+" "+d.to]];break;
 case"loan":{const r=c.loan(d.principal,d.annualRate,d.term);rows=[["Monthly payment",fmt(r.payment)],["Total repayment",fmt(r.total)],["Total interest",fmt(r.interest)]];note=(N.loan||"")+" "+(T.loanAssumption||"Assumes 12 monthly payments per year and a nominal annual rate divided monthly.");break;}
 case"dates":{if(d.mode==="annual"){const r=c.recurringDate(d.end);rows=[["Next occurrence",r.date],["Days until event",r.days]];}else{const r=c.dateDifference(d.start,d.end);rows=[["Calendar days (exclusive)",Math.abs(r.days)],["Countdown status",r.direction==="upcoming"?"Until end date":r.direction==="elapsed"?"Since end date":"Today"],["Days from today",r.fromToday]];}break;}
 case"gpa":if(d.mode==="percentage"){rows=[["Weighted percentage average",fmt(c.gpaPercentage(d.grades),2)+"%"]];note=T.gpaPercentageAssumption||"Credits are weights. This percentage average is not converted to a GPA."; }else{rows=[["Weighted GPA (4.0 scale)",fmt(c.gpa(d.grades),3)]];note=T.gpaAssumption||"Scale: A 4.0, A− 3.7, B+ 3.3, B 3.0, B− 2.7, C+ 2.3, C 2.0, C− 1.7, D+ 1.3, D 1.0, D− 0.7, F 0.0. Institutions vary.";}break;
 case"fuel":{const r=c.fuelTrip(d.distance,d.efficiency,d.price,d.mode,d.mpgType);rows=[["Fuel required",fmt(r.litres)+" L"],["Fuel units",fmt(r.fuelUnits,3)+" "+r.unit],["Estimated cost",fmt(r.cost)]];note=(N.fuel||"")+" "+(d.mode==="imperial"?(d.mpgType==="us"?"Uses US gallons and miles per US gallon.":"Uses Imperial gallons and miles per Imperial gallon."):"Uses L/100 km and price per litre.");break;}
 case"sleep":rows=c.sleep(d.time,d.mode,d.cycle,d.buffer).map((v,i)=>["After "+(i+1)+" cycles",v]);note=N.sleep;break;
 }
 const box=result(rows,note);if(k==="demographics"){const p=el("p","notice");p.append(document.createTextNode((T.sourceLabel||"Source")+": "));const a=el("a","", "Pew Research Center (2025; estimates for 2020)");a.href="https://www.pewresearch.org/religion/2025/06/09/how-the-global-religious-landscape-changed-from-2010-to-2020/";a.target="_blank";a.rel="noopener noreferrer";p.append(a);box.append(p);}
}
function addAction(container,text,fn,cls="secondary"){const b=el("button",cls,text);b.type="button";b.addEventListener("click",fn);container.append(b);return b;}
function renderTool(){
 const aside=$("aside");
 if(active<0||!keys[active]){aside.hidden=false;panel.hidden=true;return;}
 aside.hidden=true;panel.hidden=false;
 const i=active,k=keys[i];panel.replaceChildren();
 const back=el("button","secondary back-directory",tr().backToDirectory||"Back to all tools");back.type="button";back.addEventListener("click",()=>{active=-1;location.hash="#/";renderNav();renderTool();});panel.append(back);
 const head=el("div","tool-heading");head.append(el("p","eyebrow",tr().groups[i]),el("h2","",tr().names[i]),el("p","tool-description",tr().descriptions[i]));panel.append(head);
 if(k==="world"){const r=c.populationEstimate(new Date());const box=result([["Estimated population",fmt(r.rounded,0)],["Estimated net change per day",fmt(r.perDay,0)],["Reference baseline",fmt(r.baseline,0)+" · "+r.baselineDate]],tr().worldEstimateNotice||"Estimate, not live data. Population is linearly interpolated from two UN medium-variant mid-year estimates. Births, deaths and CO₂ are withheld until separately verified baselines are available.");const p=el("p","notice");p.append(document.createTextNode((tr().sourceLabel||"Source")+": "));const a=el("a","", "UN DESA — World Population Prospects 2024");a.href="https://population.un.org/wpp/";a.target="_blank";a.rel="noopener noreferrer";p.append(a);box.append(p);return;}
 const form=el("form","form"),inputs={};(schema[k]||[]).forEach(s=>inputs[s[0]]=makeField(form,s));
 if(k==="hash"){inputs.text.required=false;inputs.file.required=false;inputs.file.accept="*/*";}
 if(k==="discount"){const refresh=()=>{const reverse=inputs.mode.value==="reverse";inputs.price.closest(".field").hidden=reverse;inputs.salePrice.closest(".field").hidden=!reverse;inputs.price.required=!reverse;inputs.salePrice.required=reverse;};inputs.mode.addEventListener("change",refresh);refresh();}
 if(k==="token"){
  const live=el("p","muted","");live.setAttribute("role","status");live.setAttribute("aria-live","polite");form.append(live);
  let seq=0;const update=async()=>{const id=++seq,text=inputs.text.value;if(!text){live.textContent=tr().tokenLiveEmpty||"Enter text to see a live token count.";return;}live.textContent=tr().tokenCounting||"Counting…";try{const r=await tokenize(text,inputs.encoding.value);if(id===seq)live.textContent=(tr().liveTokens||"Live token count")+": "+r.ids.length+" · "+r.chars+" "+(tr().characters||"characters");}catch{if(id===seq)live.textContent=tr().tokenError||"Tokenizer could not initialise.";}};
  inputs.text.addEventListener("input",update);inputs.encoding.addEventListener("change",update);
  const quick=el("div","actions");addAction(quick,tr().clear||"Clear",()=>{inputs.text.value="";panel.querySelector(".result")?.remove();update();});form.append(quick);
 }
 if(k==="math"){
  const second=inputs.b.closest(".field"),refresh=()=>{const unary=["sqrt","sin","cos","tan","log","ln","factorial"].includes(inputs.op.value);second.hidden=unary;inputs.b.required=!unary;};inputs.op.addEventListener("change",refresh);refresh();
  const memoryBar=el("div","actions");addAction(memoryBar,"M+",()=>{try{memoryValue=c.memory(inputs.a.value,"M+",memoryValue);}catch{errorResult(Error("number"));}});addAction(memoryBar,"M−",()=>{try{memoryValue=c.memory(inputs.a.value,"M-",memoryValue);}catch{errorResult(Error("number"));}});addAction(memoryBar,"MR",()=>{inputs.a.value=String(c.memory(0,"MR",memoryValue));});addAction(memoryBar,"MC",()=>{memoryValue=c.memory(0,"MC",memoryValue);});addAction(memoryBar,"C",()=>{inputs.a.value="";inputs.b.value="";panel.querySelector(".result")?.remove();});addAction(memoryBar,"⌫",()=>{inputs.a.value=inputs.a.value.slice(0,-1);});form.append(memoryBar);
 }
 if(k==="bmi"){const refresh=()=>{const imp=inputs.unit.value==="imperial";inputs.weight.closest(".field").querySelector(".field-label").textContent=imp?tr().fields.weightImperial:tr().fields.weight;inputs.height.closest(".field").querySelector(".field-label").textContent=imp?tr().fields.heightImperial:tr().fields.height;};inputs.unit.addEventListener("change",refresh);refresh();}
 if(k==="units"){const refresh=()=>{const opts=unitChoices[inputs.group.value]||[];for(const key of ["from","to"]){inputs[key].replaceChildren();opts.forEach(u=>option(inputs[key],u,u));}};inputs.group.addEventListener("change",refresh);refresh();}
 if(k==="fuel"){const refresh=()=>{const imperial=inputs.mode.value==="imperial";inputs.mpgType.closest(".field").hidden=!imperial;inputs.distance.closest(".field").querySelector(".field-label").textContent=imperial?(tr().fields.distanceMiles||"Distance (miles)"):(tr().fields.distance||"Distance (km)");inputs.efficiency.closest(".field").querySelector(".field-label").textContent=imperial?(tr().fields.mpg||"Fuel economy (mpg)"):(tr().fields.efficiency||"Fuel use (L/100 km)");inputs.price.closest(".field").querySelector(".field-label").textContent=imperial?(tr().fields.priceGallon||"Price per gallon"):(tr().fields.price||"Price per litre");};inputs.mode.addEventListener("change",refresh);refresh();}
 if(k==="qibla"){const geo=el("div","actions");addAction(geo,tr().useLocation||"Use my location",()=>{if(!navigator.geolocation){errorResult(Error("geo"));return;}navigator.geolocation.getCurrentPosition(p=>{inputs.lat.value=p.coords.latitude.toFixed(6);inputs.lon.value=p.coords.longitude.toFixed(6);},()=>errorResult(Error("geo")));});form.append(geo);}
 if(k==="dates"){const refresh=()=>{const annual=inputs.mode.value==="annual";inputs.start.closest(".field").hidden=annual;inputs.start.required=!annual;};inputs.mode.addEventListener("change",refresh);refresh();}
 if(k==="gpa"||k==="dates"){const mode=inputs.mode,dependent=inputs.grades?.closest(".field");if(mode&&dependent){const refresh=()=>{dependent.querySelector(".field-label").textContent=mode.value==="percentage"?(tr().fields.percentCredit||"Percentage, credits (one pair per line)"):(tr().fields.grades||"Grade, credits (one pair per line)");};mode.addEventListener("change",refresh);refresh();}}
 const actions=el("div","actions"),go=el("button","primary",tr().calculate),reset=el("button","secondary",tr().reset);go.type="submit";reset.type="reset";actions.append(go,reset);form.append(actions);
 form.addEventListener("submit",async e=>{e.preventDefault();if(!form.reportValidity())return;const data=Object.fromEntries(new FormData(form));try{await execute(k,data);}catch(err){errorResult(err);}});
 form.addEventListener("reset",()=>{panel.querySelector(".result")?.remove();if(k==="math")memoryValue=0;});
 panel.append(form);
}
function setLang(v){lang=v;document.documentElement.lang=v;$("#language-label").textContent=tr().language;$("#search-label").textContent=tr().search;$("#title").textContent=tr().title;$("#subtitle").textContent=tr().subtitle;$("#privacy").textContent=tr().privacy;$("#welcome").textContent=tr().choose;$("#welcome-copy").textContent=tr().help;$("#footer-privacy").textContent=tr().privacy;renderNav();renderTool();}
search.addEventListener("input",renderNav);$("#language").addEventListener("change",e=>setLang(e.target.value));
window.addEventListener("hashchange",()=>{const key=decodeURIComponent(location.hash.replace(/^#\\/?/,""));active=keys.indexOf(key);renderNav();renderTool();});
const initialKey=decodeURIComponent(location.hash.replace(/^#\\/?/,""));if(keys.includes(initialKey))active=keys.indexOf(initialKey);setLang("en");,

 timezone:[["dateTime","datetime-local",null,"2026-11-04T12:00"],["fromZone","select",["UTC","Europe/Berlin","Europe/London","Africa/Lagos","America/New_York","Asia/Tokyo","Australia/Sydney"].map(x=>[x,x]),"Europe/Berlin"],["toZone","select",["UTC","Europe/Berlin","Europe/London","Africa/Lagos","America/New_York","Asia/Tokyo","Australia/Sydney"].map(x=>[x,x]),"Africa/Lagos"]],
 currency:[["amount","number"],["fromCurrency","select",[["EUR","EUR"],["USD","USD"],["GBP","GBP"],["JPY","JPY"]],"EUR"],["toCurrency","select",[["EUR","EUR"],["USD","USD"],["GBP","GBP"],["JPY","JPY"]],"USD"],["rates","textarea",null,"EUR,1\nUSD,1.1267\nGBP,0.83460\nJPY,178.30"]],
 inflation:[["amount","number"],["fromYear","number",null,"2020"],["toYear","number",null,"2026"],["annualRate","number",null,"2.5"]],
 tip:[["bill","number"],["tipRate","number",null,"10"],["taxRate","number",null,"0"],["people","number",null,"2"],["tipBasis","select",[["subtotal","Before tax"],["with-tax","After tax"]],"subtotal"],["rounding","select",[["nearest","Nearest cent"],["up","Round up"],["down","Round down"]],"nearest"]],
 calories:[["weightKg","number"],["heightCm","number"],["age","number"],["sex","select",[["male","Male"],["female","Female"]],"male"],["activity","select",[["sedentary","Sedentary"],["light","Light"],["moderate","Moderate"],["high","High"],["veryHigh","Very high"]],"moderate"],["proteinPct","number",null,"25"],["carbPct","number",null,"45"],["fatPct","number",null,"30"]],
 pregnancy:[["method","select",[["lmp","Last menstrual period"],["conception","Conception date"]],"lmp"],["inputDate","date"]],
 water:[["weightKg","number"],["extraMl","number",null,"0"]],
 bac:[["weightKg","number"],["sex","select",[["male","Male"],["female","Female"]],"male"],["drinks","number"],["drinkMl","number",null,"330"],["abv","number",null,"5"],["hours","number",null,"0"]],
 roman:[["mode","select",[["toRoman","Integer to Roman"],["fromRoman","Roman to integer"]],"toRoman"],["value","text"]],
 bases:[["value","text"],["fromBase","number",null,"10"],["toBase","number",null,"16"]],
 password:[["length","number",null,"20"],["charset","select",[["all","All characters"],["letters","Letters only"],["alphanumeric","Letters and numbers"],["hex","Hexadecimal"]],"all"]],
 qr:[["text","textarea"]],
 hash:[["text","textarea"],["file","file"],["algorithm","select",[["SHA-256","SHA-256"],["SHA-1","SHA-1"],["MD5","MD5"]],"SHA-256"]],
 json:[["text","textarea"],["mode","select",[["pretty","Pretty print"],["minify","Minify"]],"pretty"]],
 color:[["foreground","color",null,"#000000"],["background","color",null,"#ffffff"]],
 discount:[["mode","select",[["forward","Discount a price"],["reverse","Find original price"]],"forward"],["price","number"],["discountPct","number"],["taxRate","number",null,"0"],["salePrice","number"]],
 recipe:[["text","textarea"],["fromServings","number"],["toServings","number"]],
 holidays:[["year","number",null,"2026"],["region","select",[["US","United States"],["GB","United Kingdom"],["DE","Germany"],["NG","Nigeria"],["CA","Canada"]],"US"]],
 morse:[["text","textarea"],["direction","select",[["text","Text to Morse"],["morse","Morse to text"]],"text"]],
 stats:[["numbers","textarea"]],
 case"timezone":{const r=a.convertTimeZone(d.dateTime,d.fromZone,d.toZone);rows=[["Converted",r.local],["Source UTC offset",r.fromOffset],["Target UTC offset",r.toOffset],["UTC instant",r.instant]];if(r.ambiguous)note=N.timezone+" "+(T.notices?.timezone||"");else note=N.timezone;break;}
 case"currency":{const rates=a.parseCurrencyRates(d.rates);rows=[["Converted",fmt(a.convertCurrency(d.amount,d.fromCurrency,d.toCurrency,rates),4)+" "+d.toCurrency],["Rates last updated",a.ECB_RATES_DATE]];note=N.currency;break;}
 case"inflation":rows=[["Estimated value",fmt(a.inflationValue(d.amount,d.fromYear,d.toYear,d.annualRate),2)],["Years applied",Number(d.toYear)-Number(d.fromYear)]];note=N.inflation;break;
 case"tip":{const r=a.splitTip(d.bill,d.tipRate,d.taxRate,d.people,d.tipBasis,d.rounding);rows=[["Tip",fmt(r.tip,2)],["Tax",fmt(r.tax,2)],["Total",fmt(r.total,2)],["Per person",fmt(r.perPerson,2)]];note=N.tip;break;}
 case"calories":{const r=a.calorieTargets(d.weightKg,d.heightCm,d.age,d.sex,d.activity,d.proteinPct,d.carbPct,d.fatPct);rows=[["BMR",fmt(r.bmr,0)],["TDEE",fmt(r.tdee,0)],["Protein",fmt(r.proteinGrams,1)],["Carbohydrates",fmt(r.carbGrams,1)],["Fat",fmt(r.fatGrams,1)]];note=N.calories;break;}
 case"pregnancy":{const r=a.pregnancyEstimate(d.method,d.inputDate);rows=[["DueDate",r.dueDate],["Gestation",r.gestationalWeeks+" weeks, "+r.gestationalDays+" days"],["Trimester",r.trimester],["Overdue",r.overdue?"Yes":"No"]];note=N.pregnancy;break;}
 case"water":{const r=a.waterRange(d.weightKg,d.extraMl);rows=[["WaterLow",fmt(r.lowMl,0)],["WaterHigh",fmt(r.highMl,0)]];note=N.water;break;}
 case"bac":{const r=a.bloodAlcohol(d.weightKg,d.sex,d.drinks,d.drinkMl,d.abv,d.hours);rows=[["Ethanol",fmt(r.ethanolGrams,1)],["BAC",fmt(r.bacPercent,3)]];note=N.bac;break;}
 case"roman":{const v=d.mode==="toRoman"?a.toRoman(d.value):a.fromRoman(d.value);rows=[[d.mode==="toRoman"?"Roman":"Integer",v]];break;}
 case"bases":rows=[["Converted",a.convertBase(d.value,d.fromBase,d.toBase)],["Target base",d.toBase]];break;
 case"password":{const r=a.generatePassword(d.length,d.charset);const box=result([["Password",r.password],["Entropy",fmt(r.entropyBits,1)]],N.password);const actions=el("div","actions");addCopyButton(actions,r.password,T.copyPassword||"Copy password");box.append(actions);return;}
 case"qr":{if(!d.text)throw Error("empty");const qr=qrcode(0,"M");qr.addData(d.text);qr.make();const url=qr.createDataURL(6,4),box=result([["QR content",d.text]],N.qr);const img=el("img","qr-preview");img.alt=tr().qrPreviewAlt||"Generated QR code";img.src=url;box.append(img);const link=el("a","secondary",T.downloadQr||"Download QR code");link.href=url;link.download="adigun-qr-code.png";box.append(link);return;}
 case"hash":{const file=d.file&&d.file.size?d.file:null;if(file&&file.size>25000000)throw Error("number");if(!file&&!d.text)throw Error("empty");const data=file?new Uint8Array(await file.arrayBuffer()):new TextEncoder().encode(d.text);let digest;if(d.algorithm==="MD5")digest=a.md5Hex(data);else{const raw=await crypto.subtle.digest(d.algorithm,data);digest=[...new Uint8Array(raw)].map(x=>x.toString(16).padStart(2,"0")).join("");}rows=[["Hash",digest],["Input",file?file.name:"Text ("+data.length+" bytes)"]];note=N.hash;break;}
 case"json":{const formatted=a.jsonTransform(d.text,d.mode);const box=result([["Formatted",formatted]],N.json);const actions=el("div","actions");addCopyButton(actions,formatted,T.copyResult||"Copy result");box.append(actions);return;}
 case"color":{const fg=d.foreground,bg=d.background,rgb=a.parseHexColor(fg),hsl=a.rgbToHsl(rgb.r,rgb.g,rgb.b),ratio=a.contrastRatio(fg,bg);rows=[["HEX",fg.toUpperCase()],["RGB",rgb.r+", "+rgb.g+", "+rgb.b],["HSL",fmt(hsl.h,1)+"°, "+fmt(hsl.s,1)+"%, "+fmt(hsl.l,1)+"%"],["Contrast",fmt(ratio,2)+":1"],["AA",ratio>=4.5?"Pass":"Fail"],["AAA",ratio>=7?"Pass":"Fail"]];note=N.color;break;}
 case"discount":{if(d.mode==="reverse")rows=[["Original",fmt(a.originalPriceFromSale(d.salePrice,d.discountPct,d.taxRate),2)]];else{const r=a.discountPrice(d.price,d.discountPct,d.taxRate);rows=[["Discounted",fmt(r.discounted,2)],["Tax",fmt(r.tax,2)],["Total",fmt(r.total,2)],["Saved",fmt(r.saved,2)]];}note=N.discount;break;}
 case"recipe":{const r=a.scaleRecipe(d.text,d.fromServings,d.toServings);const formatted=r.join("\n");const box=result([["Scaled",formatted]],N.recipe);const actions=el("div","actions");addCopyButton(actions,formatted,T.copyResult||"Copy result");box.append(actions);return;}
 case"holidays":{const r=a.holidayDates(d.year,d.region);rows=r.map(([name,date])=>[name,date]);note=N.holiday;break;}
 case"morse":rows=[["Converted",a.translateMorse(d.text,d.direction)]];break;
 case"stats":{const r=a.summarizeNumbers(d.numbers);rows=[["Mean",fmt(r.mean,6)],["Median",fmt(r.median,6)],["Mode",r.mode.length?r.mode.join(", "):"No unique mode"],["Minimum",fmt(r.min,6)],["Maximum",fmt(r.max,6)],["Range",fmt(r.range,6)],["PopulationSD",fmt(r.populationStdDev,6)],["SampleSD",r.sampleStdDev===null?"Not defined for one value":fmt(r.sampleStdDev,6)],["Count",r.count]];break;}


import {I} from "./i18n.js";
import "./copy.js";
import * as c from "./calculators.js";
import {tokenize,encodings} from "./tokenizer.js";
import "./styles.css";

const $=s=>document.querySelector(s),nav=$("#nav"),panel=$("#panel"),search=$("#search");
let lang="en",active=0,memoryValue=0,tokenRequest=0;
const keys=["token","math","text","temp","age","bmi","percent","world","demographics","practice","zakat","qibla","units","loan","dates","gpa","fuel","sleep"];
const schema={
 token:[["text","textarea"],["encoding","select",encodings]],
 math:[["a","number"],["b","number"],["op","select",[["add","Add"],["subtract","Subtract"],["multiply","Multiply"],["divide","Divide"],["power","Power"],["modulo","Remainder"],["sqrt","Square root"],["sin","Sine (degrees)"],["cos","Cosine (degrees)"],["tan","Tangent (degrees)"],["log","Base-10 logarithm"],["ln","Natural logarithm"],["factorial","Factorial"]]]],
 text:[["text","textarea"]],
 temp:[["value","number"],["direction","select",[["c","Celsius to Fahrenheit"],["f","Fahrenheit to Celsius"]]]],
 age:[["birth","date"]],
 bmi:[["unit","select",[["metric","Metric (kg, m)"],["imperial","Imperial (lb, in)"]]],["weight","number"],["height","number"]],
 percent:[["mode","select",[["of","X percent of Y"],["as","X as percent of Y"],["change","Percentage change"]]],["a","number"],["b","number"]],
 world:[],
 demographics:[["total","number"],["shares","textarea",null,"Christianity, 28.8\nIslam, 25.6\nHinduism, 14.9\nBuddhism, 4.1\nJudaism, 0.2\nOther religions (including folk/traditional), 2.2\nReligiously unaffiliated, 24.2"]],
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
function renderNav(){nav.replaceChildren();const q=search.value.toLocaleLowerCase();[...new Set(tr().groups)].forEach(cat=>{const indexes=tr().groups.map((g,i)=>g===cat?i:-1).filter(i=>i>=0&&(!q||tr().names[i].toLocaleLowerCase().includes(q)));if(!indexes.length)return;const group=el("div","nav-group");group.append(el("h3","nav-heading",cat));indexes.forEach(i=>{const b=el("button","nav-item",tr().names[i]);b.type="button";b.setAttribute("aria-current",i===active?"page":"false");b.addEventListener("click",()=>{active=i;renderNav();renderTool();});group.append(b);});nav.append(group);});if(!nav.children.length)nav.append(el("p","muted",tr().noResults||"No matching tools."));}
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
 case"world":{const r=c.populationEstimate(new Date());rows=[["Estimated population",fmt(r.rounded,0)],["Estimated net change per day",fmt(r.perDay,0)],["Reference baseline",fmt(r.baseline,0)+" · "+r.baselineDate]];note=T.worldEstimateNotice||"Estimate, not live data. Linear interpolation from UN medium-variant mid-year projections.";break;}
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
 result(rows,note);
}
function addAction(container,text,fn,cls="secondary"){const b=el("button",cls,text);b.type="button";b.addEventListener("click",fn);container.append(b);return b;}
function renderTool(){
 const i=active,k=keys[i];panel.replaceChildren();const head=el("div","tool-heading");head.append(el("p","eyebrow",tr().groups[i]),el("h2","",tr().names[i]),el("p","tool-description",tr().descriptions[i]));panel.append(head);
 if(k==="world"){const r=c.populationEstimate(new Date());const box=result([["Estimated population",fmt(r.rounded,0)],["Estimated net change per day",fmt(r.perDay,0)],["Reference baseline",fmt(r.baseline,0)+" · "+r.baselineDate]],tr().worldEstimateNotice||"Estimate, not live data. Population is linearly interpolated from two UN medium-variant mid-year estimates. Births, deaths and CO₂ are withheld until separately verified baselines are available.");const p=el("p","notice");p.append(document.createTextNode((tr().sourceLabel||"Source")+": "));const a=el("a","", "UN DESA — World Population Prospects 2024");a.href="https://population.un.org/wpp/";a.target="_blank";a.rel="noopener noreferrer";p.append(a);box.append(p);return;}
 const form=el("form","form"),inputs={};(schema[k]||[]).forEach(s=>inputs[s[0]]=makeField(form,s));
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
 if(k==="gpa"||k==="dates"){const mode=inputs.mode,dependent=inputs.grades?.closest(".field");if(mode&&dependent){const refresh=()=>{dependent.querySelector(".field-label").textContent=mode.value==="percentage"?(tr().fields.percentCredit||"Percentage, credits (one pair per line)"):(tr().fields.grades||"Grade, credits (one pair per line)");};mode.addEventListener("change",refresh);refresh();}}
 const actions=el("div","actions"),go=el("button","primary",tr().calculate),reset=el("button","secondary",tr().reset);go.type="submit";reset.type="reset";actions.append(go,reset);form.append(actions);
 form.addEventListener("submit",async e=>{e.preventDefault();if(!form.reportValidity())return;const data=Object.fromEntries(new FormData(form));try{await execute(k,data);}catch(err){errorResult(err);}});
 form.addEventListener("reset",()=>{panel.querySelector(".result")?.remove();if(k==="math")memoryValue=0;});
 panel.append(form);
}
function setLang(v){lang=v;document.documentElement.lang=v;$("#language-label").textContent=tr().language;$("#search-label").textContent=tr().search;$("#title").textContent=tr().title;$("#subtitle").textContent=tr().subtitle;$("#privacy").textContent=tr().privacy;$("#welcome").textContent=tr().choose;$("#welcome-copy").textContent=tr().help;$("#footer-privacy").textContent=tr().privacy;renderNav();renderTool();}
search.addEventListener("input",renderNav);$("#language").addEventListener("change",e=>setLang(e.target.value));setLang("en");

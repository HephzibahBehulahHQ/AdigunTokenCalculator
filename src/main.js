import {I} from "./i18n.js";import "./copy.js";import * as c from "./calculators.js";import {tokenize,encodings} from "./tokenizer.js";import "./styles.css";
const $=s=>document.querySelector(s),nav=$("#nav"),panel=$("#panel"),search=$("#search");let lang="en",active=0;const cats=[...new Set(I.en.groups)];
const keys=["token","math","text","temp","age","bmi","percent","world","demographics","practice","zakat","qibla","units","loan","dates","gpa","fuel","sleep"];
const schema={
token:[["text","textarea"],["encoding","select",encodings]],
math:[["a","number"],["b","number"],["op","select",[["add","Add"],["subtract","Subtract"],["multiply","Multiply"],["divide","Divide"],["power","Power"],["sqrt","Square root"]]]],
text:[["text","textarea"]],temp:[["value","number"],["direction","select",[["c","Celsius to Fahrenheit"],["f","Fahrenheit to Celsius"]]]],age:[["birth","date"]],bmi:[["weight","number"],["height","number"]],
percent:[["mode","select",[["of","X percent of Y"],["as","X as percent of Y"],["change","Percentage change"]]],["a","number"],["b","number"]],
world:[],demographics:[["total","number"],["shares","text"]],practice:[["minutes","number"],["sessions","number"],["years","number"]],
zakat:[["cash","number"],["gold","number"],["silver","number"],["investments","number"],["rate","number",null,"2.5"]],
qibla:[["lat","number"],["lon","number"]],
units:[["value","number"],["group","select",[["length","Length"],["mass","Mass"],["volume","Volume (US)"],["area","Area"],["speed","Speed"],["digital","Digital storage"]]],["from","select"],["to","select"]],
loan:[["principal","number"],["annualRate","number"],["term","number"]],dates:[["start","date"],["end","date"]],gpa:[["grades","textarea"]],fuel:[["distance","number"],["efficiency","number"],["price","number"]],
sleep:[["mode","select",[["bed","Calculate wake times from bedtime"],["wake","Calculate bedtimes from wake time"]]],["time","time",null,"22:30"],["cycle","number",null,"90"],["buffer","number",null,"15"]]
};
const units={length:["m","km","mi","ft","in"],mass:["kg","g","lb","oz"],volume:["L","mL","US gal","US qt"],area:["m²","ft²","acre","ha"],speed:["km/h","mph","m/s"],digital:["bit","byte","kB","MB","GB","KiB","MiB","GiB"]};
const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;};
function tr(){return I[lang];}
function label(key){return tr().fields[key]||key;}
function option(select,value,text){const o=el("option","",text);o.value=value;select.append(o);}
function makeField(form,spec){const [key,type,opts,def]=spec,wrap=el("label","field");wrap.append(el("span","field-label",label(key)));let input;if(type==="select"){input=el("select");(opts||[]).forEach(([v,l])=>option(input,v,tr().options?.[v]||l));}else if(type==="textarea"){input=el("textarea");input.rows=key==="text"?7:4;}else{input=el("input");input.type=type;input.step="any";if(type==="number")input.min="0";}input.name=key;if(def)input.value=def;wrap.append(input);form.append(wrap);return input;}
function renderNav(){nav.replaceChildren();const q=search.value.toLocaleLowerCase();cats.forEach(cat=>{const indexes=tr().groups.map((g,i)=>g===cat?i:-1).filter(i=>i>=0&&(!q||tr().names[i].toLocaleLowerCase().includes(q)));if(!indexes.length)return;const group=el("div","nav-group");group.append(el("h3","nav-heading",cat));indexes.forEach(i=>{const b=el("button","nav-item",tr().names[i]);b.type="button";b.setAttribute("aria-current",i===active?"page":"false");b.addEventListener("click",()=>{active=i;renderNav();renderTool();});group.append(b);});nav.append(group);});if(!nav.children.length)nav.append(el("p","muted","No matching tools."));}
function result(rows,note){panel.querySelector(".result")?.remove();const box=el("section","result");box.append(el("h3","",tr().result));rows.forEach(([k,v])=>{const r=el("div","result-row");r.append(el("span","",k),el("strong","",String(v)));box.append(r);});if(note)box.append(el("p","notice",note));panel.append(box);}
function fmt(n,d=3){return Number(n).toLocaleString(lang,{maximumFractionDigits:d});}
function execute(k,d){const T=tr(),N=T.notices;let rows=[],note="";
switch(k){
case"token":{if(!d.text)throw Error("empty");const r=tokenize(d.text,d.encoding);rows=[["Tokens",r.ids.length],["Unicode code points",r.chars],["Token IDs",r.ids.join(", ")||"—"]];result(rows,N.token);const box=panel.querySelector(".result"),seg=el("div","segments");r.pieces.forEach((p,i)=>{const s=el("span","piece",p);s.title="Token "+r.ids[i];seg.append(s);});box.append(seg);return;}
case"math":rows=[["Result",fmt(d.op==="sqrt"?Math.sqrt(Number(d.a)):c.arithmetic(d.a,d.b,d.op),8)]];if(d.op==="sqrt"&&Number(d.a)<0)throw Error("number");break;
case"text":if(!d.text)throw Error("empty");{const r=c.stats(d.text);rows=[["Words",r.words],["Characters (Unicode code points)",r.chars],["Characters excluding whitespace",r.noSpace],["Sentences (estimate)",r.sentences],["Paragraphs",r.paragraphs],["Reading time at 200 wpm",fmt(r.words/200)+" min"]];}break;
case"temp":rows=[["Result",fmt(c.temperature(d.value,d.direction),4)+(d.direction==="c"?" °F":" °C")]];break;
case"age":{const r=c.age(d.birth);rows=[["Years",r.years],["Months",r.months],["Days",r.days]];}break;
case"bmi":rows=[["BMI",fmt(c.bmi(d.weight,d.height))]];note=N.bmi;break;
case"percent":rows=[["Result",fmt(c.percent(d.mode,d.a,d.b))+"%"]];break;
case"world":throw Error("notAvailable");
case"demographics":{const r=c.shares(d.total,d.shares);rows=[["Entered percentage total",fmt(r.total)+"%"],...r.counts.map((v,i)=>["Category "+(i+1),fmt(v,0)])];note=N.demographics;}break;
case"practice":{const r=c.practice(d.minutes,d.sessions,d.years);rows=[["Weekly minutes",fmt(r.week)],["Annual hours",fmt(r.year/60)],["Lifetime hours",fmt(r.lifetime/60)]];}break;
case"zakat":{const r=c.zakat(d,d.rate);rows=[["Entered assets",fmt(r.assets)],["Calculated amount",fmt(r.due)]];note=N.zakat;}break;
case"qibla":rows=[["Initial bearing",fmt(c.bearing(d.lat,d.lon),1)+"°"]];note=N.qibla;break;
case"units":rows=[["Converted value",fmt(c.unit(d.value,d.from,d.to,d.group),8)+" "+d.to]];break;
case"loan":{const r=c.loan(d.principal,d.annualRate,d.term);rows=[["Monthly payment",fmt(r.payment)],["Total repayment",fmt(r.total)],["Total interest",fmt(r.interest)]];note=N.loan;}break;
case"dates":rows=[["Calendar days",c.days(d.start,d.end)]];break;
case"gpa":rows=[["Weighted GPA (4.0 scale)",fmt(c.gpa(d.grades),3)]];break;
case"fuel":{const r=c.fuel(d.distance,d.efficiency,d.price);rows=[["Fuel required",fmt(r.litres)+" L"],["Estimated cost",fmt(r.cost)]];note=N.fuel;}break;
case"sleep":rows=c.sleep(d.time,d.mode,d.cycle,d.buffer).map((v,i)=>["After "+(i+1)+" cycles",v]);note=N.sleep;break;
}result(rows,note);}
function renderTool(){const i=active,k=keys[i];panel.replaceChildren();const head=el("div","tool-heading");head.append(el("p","eyebrow",tr().groups[i]),el("h2","",tr().names[i]),el("p","tool-description",tr().descriptions[i]));panel.append(head);const form=el("form","form");form.noValidate=true;const inputs={};(schema[k]||[]).forEach(s=>inputs[s[0]]=makeField(form,s));if(k==="units"){const refresh=()=>{const opts=units[inputs.group.value]||[];for(const key of ["from","to"]){inputs[key].replaceChildren();opts.forEach(u=>option(inputs[key],u,u));}};inputs.group.addEventListener("change",refresh);refresh();}
const actions=el("div","actions"),go=el("button","primary",tr().calculate),reset=el("button","secondary",tr().reset);go.type="submit";reset.type="reset";actions.append(go,reset);form.append(actions);form.addEventListener("submit",e=>{e.preventDefault();const data=Object.fromEntries(new FormData(form));try{execute(k,data);}catch(err){result([[tr().result,tr().invalid]],"");}});form.addEventListener("reset",()=>panel.querySelector(".result")?.remove());panel.append(form);}
function setLang(v){lang=v;document.documentElement.lang=v;$("#language-label").textContent=tr().language;$("#search-label").textContent=tr().search;$("#title").textContent=tr().title;$("#subtitle").textContent=tr().subtitle;$("#privacy").textContent=tr().privacy;$("#welcome").textContent=tr().choose;$("#welcome-copy").textContent=tr().help;$("#footer-privacy").textContent=tr().privacy;renderNav();renderTool();}
search.addEventListener("input",renderNav);$("#language").addEventListener("change",e=>setLang(e.target.value));setLang("en");
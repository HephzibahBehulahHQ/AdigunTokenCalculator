import { Temporal } from "@js-temporal/polyfill";

const finite = n => Number.isFinite(Number(n));
const positive = n => finite(n) && Number(n) > 0;
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const dateParts = s => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s));
  if (!m) throw Error("date");
  const p = { y:+m[1], m:+m[2], d:+m[3] };
  const d = new Date(Date.UTC(p.y,p.m-1,p.d));
  if (d.getUTCFullYear()!==p.y || d.getUTCMonth()!==p.m-1 || d.getUTCDate()!==p.d) throw Error("date");
  return p;
};
const isoDate = (y,m,d) => [y,String(m).padStart(2,"0"),String(d).padStart(2,"0")].join("-");
const addDays = (s,n) => { const p=dateParts(s),d=new Date(Date.UTC(p.y,p.m-1,p.d+n)); return isoDate(d.getUTCFullYear(),d.getUTCMonth()+1,d.getUTCDate()); };

function wallParts(ms, zone) {
  const parts = new Intl.DateTimeFormat("en-GB",{timeZone:zone,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"}).formatToParts(new Date(ms));
  const o=Object.fromEntries(parts.map(x=>[x.type,x.value]));
  return {y:+o.year,m:+o.month,d:+o.day,h:+o.hour,min:+o.minute,s:+o.second};
}
function offsetAt(ms, zone) {
  const p=wallParts(ms,zone);
  return Math.round((Date.UTC(p.y,p.m-1,p.d,p.h,p.min,p.s)-ms)/60000);
}
function formatOffset(minutes) {
  const sign=minutes>=0?"+":"-",v=Math.abs(minutes);
  return sign+String(Math.floor(v/60)).padStart(2,"0")+":"+String(v%60).padStart(2,"0");
}
export function convertTimeZone(localDateTime, fromZone, toZone) {
  const match=/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d$/.test(String(localDateTime));
  if(!match) throw Error("date");
  let plain;
  try{plain=Temporal.PlainDateTime.from(String(localDateTime)+":00",{overflow:"reject"});}catch{throw Error("date");}
  let earlier,later;
  try{
    earlier=plain.toZonedDateTime(fromZone,{disambiguation:"earlier"});
    later=plain.toZonedDateTime(fromZone,{disambiguation:"later"});
    new Intl.DateTimeFormat("en",{timeZone:toZone}).format(new Date(Number(earlier.epochMilliseconds)));
  }catch{throw Error("zone");}
  const earlierMatches=earlier.toPlainDateTime().equals(plain),laterMatches=later.toPlainDateTime().equals(plain);
  if(!earlierMatches||!laterMatches)throw Error("dst-gap");
  const ambiguous=!earlier.toInstant().equals(later.toInstant());
  const target=earlier.toInstant().toZonedDateTimeISO(toZone);
  const local=target.toPlainDateTime().toString({smallestUnit:"minute"});
  const localFormatted=new Intl.DateTimeFormat(undefined,{timeZone:toZone,dateStyle:"medium",timeStyle:"short",hourCycle:"h23"}).format(new Date(Number(target.epochMilliseconds)));
  return {instant:earlier.toInstant().toString(),local,localFormatted,fromOffset:earlier.offset,toOffset:target.offset,ambiguous};
}

export const ECB_RATES_DATE="2026-11-04";
export const ECB_EUR_RATES=Object.freeze({EUR:1,USD:1.1267,JPY:178.30,CZK:24.309,DKK:7.4738,GBP:0.83460,HUF:363.03,PLN:4.3990,RON:5.3440,SEK:10.9718,CHF:0.9188,ISK:136.80,NOK:10.3970,TRY:56.3598,AUD:1.6061,BRL:6.1579,CAD:1.5701,CNY:7.5177,HKD:8.8399,IDR:20425.83,ILS:3.5641,INR:106.6318,KRW:1508.18,MXN:21.0086,MYR:4.5789,NZD:1.9988,PHP:71.578,SGD:1.4398,THB:37.902,ZAR:18.5404});
export function convertCurrency(amount,from,to,rates=ECB_EUR_RATES) {
  amount=Number(amount);
  if(!finite(amount)||!rates||!positive(rates[from])||!positive(rates[to])) throw Error("number");
  return amount/rates[from]*rates[to];
}
export function inflationValue(amount,fromYear,toYear,annualRate) {
  amount=Number(amount);fromYear=Number(fromYear);toYear=Number(toYear);annualRate=Number(annualRate);
  if(!finite(amount)||!Number.isInteger(fromYear)||!Number.isInteger(toYear)||fromYear<1800||fromYear>2200||toYear<1800||toYear>2200||!finite(annualRate)||annualRate<=-100||annualRate>1000) throw Error("number");
  return amount*Math.pow(1+annualRate/100,toYear-fromYear);
}
export function splitTip(bill,tipRate,taxRate,people,tipBasis="subtotal",rounding="nearest") {
  bill=Number(bill);tipRate=Number(tipRate);taxRate=Number(taxRate);people=Number(people);
  if(!finite(bill)||bill<0||!finite(tipRate)||tipRate<0||tipRate>100||!finite(taxRate)||taxRate<0||taxRate>100||!Number.isInteger(people)||people<1||people>10000||!["subtotal","with-tax"].includes(tipBasis)||!["nearest","up","down"].includes(rounding)) throw Error("number");
  const tax=bill*taxRate/100,tip=(bill+(tipBasis==="with-tax"?tax:0))*tipRate/100,total=bill+tax+tip,raw=total/people;
  const perPerson=(rounding==="up"?Math.ceil(raw*100):rounding==="down"?Math.floor(raw*100):Math.round(raw*100))/100;
  return {subtotal:bill,tax,tip,total,perPerson,people};
}
export function calorieTargets(weightKg,heightCm,age,sex,activity,proteinPct=25,carbPct=45,fatPct=30) {
  [weightKg,heightCm,age,proteinPct,carbPct,fatPct]=[weightKg,heightCm,age,proteinPct,carbPct,fatPct].map(Number);
  const factors={sedentary:1.2,light:1.375,moderate:1.55,high:1.725,veryHigh:1.9};
  if(!positive(weightKg)||weightKg>500||!positive(heightCm)||heightCm>280||!Number.isInteger(age)||age<18||age>120||!["male","female"].includes(sex)||!factors[activity]||[proteinPct,carbPct,fatPct].some(x=>!finite(x)||x<0)||Math.abs(proteinPct+carbPct+fatPct-100)>.01) throw Error("number");
  const bmr=10*weightKg+6.25*heightCm-5*age+(sex==="male"?5:-161),tdee=bmr*factors[activity];
  if(!positive(bmr))throw Error("number");
  return {bmr,tdee,proteinGrams:tdee*proteinPct/100/4,carbGrams:tdee*carbPct/100/4,fatGrams:tdee*fatPct/100/9};
}
export function pregnancyEstimate(method,inputDate,today=new Date()) {
  const p=dateParts(inputDate),date=Date.UTC(p.y,p.m-1,p.d),now=Date.UTC(today.getFullYear(),today.getMonth(),today.getDate());
  if(date>now) throw Error("future");
  const lmp=method==="lmp"?inputDate:method==="conception"?addDays(inputDate,-14):null;
  if(!lmp) throw Error("number");
  const due=addDays(lmp,280),elapsed=Math.floor((now-Date.UTC(...Object.values(dateParts(lmp)).map((v,i)=>i===1?v-1:v)))/86400000);
  const weeks=Math.floor(elapsed/7),days=elapsed%7;
  return {dueDate:due,gestationalWeeks:weeks,gestationalDays:days,trimester:weeks<14?1:weeks<28?2:3,overdue:elapsed>280};
}
export function waterRange(weightKg,extraMl=0) {
  weightKg=Number(weightKg);extraMl=Number(extraMl);
  if(!positive(weightKg)||weightKg>500||!finite(extraMl)||extraMl< -2000||extraMl>5000) throw Error("number");
  const lowMl=weightKg*30+extraMl,highMl=weightKg*35+extraMl;if(lowMl<=0)throw Error("number");
  return {lowMl,highMl};
}
export function bloodAlcohol(weightKg,sex,drinks,drinkMl,abv,hours) {
  [weightKg,drinks,drinkMl,abv,hours]=[weightKg,drinks,drinkMl,abv,hours].map(Number);
  if(!positive(weightKg)||weightKg>500||!["male","female"].includes(sex)||!finite(drinks)||drinks<0||!finite(drinkMl)||drinkMl<0||!finite(abv)||abv<0||abv>100||!finite(hours)||hours<0||hours>48) throw Error("number");
  const ethanolGrams=drinks*drinkMl*(abv/100)*0.789,r=sex==="male"?0.68:0.55;
  const estimate=Math.max(0,(ethanolGrams/(r*weightKg*1000))*100-0.015*hours);
  return {ethanolGrams,bacPercent:estimate};
}
const ROMAN_VALUES=[[1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],[50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];
export function toRoman(value) {
  value=Number(value);if(!Number.isInteger(value)||value<1||value>3999)throw Error("number");
  let n=value,out="";for(const [v,s] of ROMAN_VALUES)while(n>=v){out+=s;n-=v;}return out;
}
export function fromRoman(value) {
  const s=String(value).trim().toUpperCase();if(!/^[IVXLCDM]+$/.test(s))throw Error("number");
  let n=0;for(let i=0;i<s.length;i++){const a=({I:1,V:5,X:10,L:50,C:100,D:500,M:1000})[s[i]],b=({I:1,V:5,X:10,L:50,C:100,D:500,M:1000})[s[i+1]]||0;n+=a<(b||0)?-a:a;}
  if(n<1||n>3999||toRoman(n)!==s)throw Error("number");return n;
}
export function convertBase(value,fromBase,toBase) {
  const f=Number(fromBase),t=Number(toBase),s=String(value).trim();
  if(!Number.isInteger(f)||!Number.isInteger(t)||f<2||f>36||t<2||t>36||!/^[-+]?[0-9a-z]+$/i.test(s))throw Error("number");
  const negative=s[0]==="-",digits=s.replace(/^[-+]/,"").toLowerCase(),alphabet="0123456789abcdefghijklmnopqrstuvwxyz";
  let n=0n;for(const ch of digits){const d=BigInt(alphabet.indexOf(ch));if(d<0n||d>=BigInt(f))throw Error("number");n=n*BigInt(f)+d;}
  return (negative&&n!==0n?"-":"")+n.toString(t).toUpperCase();
}
export function generatePassword(length,charset="all") {
  length=Number(length);const sets={all:"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}:,.?",letters:"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",alphanumeric:"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",hex:"0123456789abcdef"};
  const chars=sets[charset];if(!Number.isInteger(length)||length<8||length>128||!chars||!globalThis.crypto?.getRandomValues)throw Error("number");
  const pool=chars.length,limit=Math.floor(256/pool)*pool,out=[];while(out.length<length){const bytes=new Uint8Array(Math.min(256,(length-out.length)*2+8));crypto.getRandomValues(bytes);for(const b of bytes){if(b<limit)out.push(chars[b%pool]);if(out.length===length)break;}}
  return {password:out.join(""),entropyBits:length*Math.log2(pool),pool};
}
export function jsonTransform(source,mode="pretty") {
  if(typeof source!=="string"||!source.trim())throw Error("empty");
  try{JSON.parse(source);}catch(e){const message=String(e.message),lc=message.match(/line\s+(\d+)\s+column\s+(\d+)/i),m=message.match(/position\s+(\d+)/i),token=message.match(/Unexpected token [\u0027\u0022](.)[\u0027\u0022]/i);let pos=lc?null:m?Number(m[1]):token?source.indexOf(token[1]):source.length;if(lc)throw Error("JSON syntax error at line "+lc[1]+", column "+lc[2]);if(pos<0)pos=source.length;const before=source.slice(0,pos),line=before.split("\n").length,column=pos-(before.lastIndexOf("\n")+1)+1;throw Error("JSON syntax error at line "+line+", column "+column);}
  // Preserve original JSON tokens, including numbers outside JavaScript's safe range.
  const tokens=source.match(/"(?:\\[\s\S]|[^"\\])*"|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null|[{}\[\]:,]/g);
  if(mode==="minify")return tokens.join("");
  if(mode!=="pretty")throw Error("number");
  let depth=0;const output=[],newline=()=>"\n"+"  ".repeat(depth);
  tokens.forEach((token,i)=>{
    if(token==="{"||token==="["){output.push(token);depth++;if(tokens[i+1]!=="}"&&tokens[i+1]!=="]")output.push(newline());}
    else if(token==="}"||token==="]"){depth--;if(tokens[i-1]!=="{"&&tokens[i-1]!=="[")output.push(newline());output.push(token);}
    else if(token===",")output.push(token,newline());
    else if(token===":")output.push(": ");
    else output.push(token);
  });
  return output.join("");
}
export function parseHexColor(hex) {
  let s=String(hex).trim().replace(/^#/,"");if(/^[0-9a-f]{3}$/i.test(s))s=[...s].map(x=>x+x).join("");
  if(!/^[0-9a-f]{6}$/i.test(s))throw Error("number");
  return {r:parseInt(s.slice(0,2),16),g:parseInt(s.slice(2,4),16),b:parseInt(s.slice(4,6),16)};
}
export function rgbToHsl(r,g,b) {
  [r,g,b]=[r,g,b].map(Number);if([r,g,b].some(x=>!Number.isInteger(x)||x<0||x>255))throw Error("number");
  r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;let h=0,s=0,l=(max+min)/2;
  if(d){s=d/(1-Math.abs(2*l-1));switch(max){case r:h=60*(((g-b)/d)%6);break;case g:h=60*((b-r)/d+2);break;default:h=60*((r-g)/d+4);}}
  return {h:(h+360)%360,s:s*100,l:l*100};
}
const linear=x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;};
export function contrastRatio(hex1,hex2) {
  const lum=c=>{const {r,g,b}=parseHexColor(c);return .2126*linear(r)+.7152*linear(g)+.0722*linear(b);};
  const a=lum(hex1),b=lum(hex2);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
}
export function discountPrice(price,discountPct,taxPct=0) {
  price=Number(price);discountPct=Number(discountPct);taxPct=Number(taxPct);
  if(!finite(price)||price<0||!finite(discountPct)||discountPct<0||discountPct>100||!finite(taxPct)||taxPct<0||taxPct>1000)throw Error("number");
  const discounted=price*(1-discountPct/100),tax=discounted*taxPct/100;return {discounted,tax,total:discounted+tax,saved:price-discounted};
}
export function originalPriceFromSale(salePrice,discountPct,taxPct=0) {
  salePrice=Number(salePrice);discountPct=Number(discountPct);taxPct=Number(taxPct);
  if(!positive(salePrice)||!finite(discountPct)||discountPct<0||discountPct>=100||!finite(taxPct)||taxPct<0||taxPct>1000)throw Error("number");
  return salePrice/((1-discountPct/100)*(1+taxPct/100));
}
function fraction(s) {
  const m=/^(?:(\d+)\s+)?(\d+)(?:\/(\d+))?$/.exec(s);
  if(!m)return Number(s);
  const whole=Number(m[1]||0),num=Number(m[2]),den=Number(m[3]||1);
  if(!den)return NaN;return whole+num/den;
}
function formatQuantity(n) {return Number(n.toFixed(4)).toString();}
export function scaleRecipe(text,fromServings,toServings) {
  fromServings=Number(fromServings);toServings=Number(toServings);
  if(!positive(fromServings)||!positive(toServings))throw Error("number");
  const factor=toServings/fromServings,lines=String(text).split("\n").filter(x=>x.trim());
  if(!lines.length)throw Error("empty");
  return lines.map(line=>{
    const m=/^\s*(\d+(?:\s+\d+\/\d+|\/\d+)?|\d+\.\d+)\s+(.+?)\s*$/.exec(line);
    if(!m)throw Error("recipe");
    const q=fraction(m[1]);if(!finite(q)||q<0)throw Error("recipe");
    return formatQuantity(q*factor)+" "+m[2];
  });
}
export function easterSunday(year) {
  year=Number(year);if(!Number.isInteger(year)||year<1583||year>4099)throw Error("number");
  const a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),month=Math.floor((h+l-7*m+114)/31),day=(h+l-7*m+114)%31+1;
  return isoDate(year,month,day);
}
export function holidayDates(year,region="US") {
  year=Number(year);if(!Number.isInteger(year)||year<1583||year>4099||!["US","GB","DE","NG","CA"].includes(region))throw Error("number");
  const easter=easterSunday(year),fixed=[["New Year's Day",isoDate(year,1,1)],["Christmas Day",isoDate(year,12,25)]];
  if(["GB","DE","CA"].includes(region))fixed.push(["Boxing Day",isoDate(year,12,26)]);
  if(region==="US")fixed.push(["Martin Luther King Jr. Day",nthWeekday(year,1,3,1)],["Memorial Day",lastWeekday(year,5,1)],["Independence Day",isoDate(year,7,4)],["Labor Day",nthWeekday(year,9,1,1)],["Veterans Day",isoDate(year,11,11)],["Thanksgiving (fourth Thursday in November)",nthWeekday(year,11,4,4)]);
  if(region==="DE")fixed.push(["German Unity Day",isoDate(year,10,3)],["Good Friday",addDays(easter,-2)],["Easter Monday",addDays(easter,1)]);
  if(region==="GB")fixed.push(["Good Friday",addDays(easter,-2)],["Easter Monday",addDays(easter,1)],["Early May bank holiday",nthWeekday(year,5,1,1)],["Spring bank holiday",lastWeekday(year,5,1)],["Summer bank holiday",lastWeekday(year,8,1)]);
  if(region==="NG")fixed.push(["Good Friday",addDays(easter,-2)],["Easter Monday",addDays(easter,1)],["Democracy Day",isoDate(year,6,12)],["Independence Day",isoDate(year,10,1)]);
  if(region==="CA")fixed.push(["Canada Day",isoDate(year,7,1)],["Labour Day",nthWeekday(year,9,1,1)],["Thanksgiving",nthWeekday(year,10,2,1)],["Good Friday",addDays(easter,-2)]);
  return fixed.sort((a,b)=>a[1].localeCompare(b[1]));
}
function nthWeekday(y,m,n,weekday) {const first=new Date(Date.UTC(y,m-1,1)).getUTCDay();return isoDate(y,m,1+((weekday-first+7)%7)+(n-1)*7);}
function lastWeekday(y,m,weekday){const last=new Date(Date.UTC(y,m,0)).getUTCDate(),day=new Date(Date.UTC(y,m-1,last)).getUTCDay();return isoDate(y,m,last-((day-weekday+7)%7));}
const MORSE={A:".-",B:"-...",C:"-.-.",D:"-..",E:".",F:"..-.",G:"--.",H:"....",I:"..",J:".---",K:"-.-",L:".-..",M:"--",N:"-.",O:"---",P:".--.",Q:"--.-",R:".-.",S:"...",T:"-",U:"..-",V:"...-",W:".--",X:"-..-",Y:"-.--",Z:"--..","0":"-----","1":".----","2":"..---","3":"...--","4":"....-","5":".....","6":"-....","7":"--...","8":"---..","9":"----.",".":".-.-.-",",":"--..--","?":"..--..","'":".----.", "!":"-.-.--","/":"-..-.","(":"-.--.",")":"-.--.-","&":".-...",":":"---...",";":"-.-.-.","=":"-...-","+":".-.-.","-":"-....-","_":"..--.-",'"':".-..-.","$":"...-..-","@":".--.-."};
const MORSE_REVERSE=Object.fromEntries(Object.entries(MORSE).map(([k,v])=>[v,k]));
export function translateMorse(text,direction="text") {
  if(direction==="text")return String(text).toUpperCase().split(/\s+/).map(word=>word.split("").map(ch=>{if(!MORSE[ch])throw Error("morse");return MORSE[ch];}).join(" ")).join(" / ");
  if(direction==="morse")return String(text).trim().split(/\s*\/\s*/).map(word=>word.trim().split(/\s+/).map(code=>{if(!MORSE_REVERSE[code])throw Error("morse");return MORSE_REVERSE[code];}).join("")).join(" ");
  throw Error("morse");
}
export function summarizeNumbers(text) {
  const values=String(text).trim().split(/[\s,;]+/).filter(Boolean).map(Number);
  if(!values.length||values.some(x=>!Number.isFinite(x)))throw Error("number");
  const sorted=[...values].sort((a,b)=>a-b),sum=values.reduce((a,b)=>a+b,0),mean=sum/values.length,mid=Math.floor(sorted.length/2);
  const counts=new Map();values.forEach(x=>counts.set(x,(counts.get(x)||0)+1));const maxCount=Math.max(...counts.values()),modes=maxCount===1?[]:[...counts].filter(([,n])=>n===maxCount).map(([x])=>x).sort((a,b)=>a-b);
  const variance=values.reduce((a,x)=>a+(x-mean)**2,0)/values.length;
  const sampleVariance=values.length>1?values.reduce((a,x)=>a+(x-mean)**2,0)/(values.length-1):null;
  return {count:values.length,mean,median:values.length%2?sorted[mid]:(sorted[mid-1]+sorted[mid])/2,mode:modes,min:sorted[0],max:sorted.at(-1),range:sorted.at(-1)-sorted[0],populationVariance:variance,populationStdDev:Math.sqrt(variance),sampleVariance,sampleStdDev:sampleVariance===null?null:Math.sqrt(sampleVariance)};
}

export function parseCurrencyRates(text) {
  const rates={};
  for(const line of String(text).split(/\n/).filter(x=>x.trim())){
    const [code,value,...extra]=line.split(",").map(x=>x.trim()),rate=Number(value);
    if(extra.length||! /^[A-Z]{3}$/.test(code||"")||!positive(rate)||rates[code])throw Error("rates");
    rates[code]=rate;
  }
  if(!positive(rates.EUR)||Math.abs(rates.EUR-1)>1e-9)throw Error("rates");
  return rates;
}
export function md5Hex(input) {
  const bytes=input instanceof Uint8Array?input:new Uint8Array(input);
  const bitLength=BigInt(bytes.length)*8n,paddedLength=Math.ceil((bytes.length+9)/64)*64;
  const data=new Uint8Array(paddedLength);data.set(bytes);data[bytes.length]=0x80;
  const view=new DataView(data.buffer);view.setUint32(paddedLength-8,Number(bitLength&0xffffffffn),true);view.setUint32(paddedLength-4,Number((bitLength>>32n)&0xffffffffn),true);
  const shifts=[7,12,17,22,5,9,14,20,4,11,16,23,6,10,15,21],k=Array.from({length:64},(_,i)=>Math.floor(Math.abs(Math.sin(i+1))*4294967296)>>>0);
  let a0=0x67452301,b0=0xefcdab89,c0=0x98badcfe,d0=0x10325476;
  for(let offset=0;offset<paddedLength;offset+=64){
    const words=Array.from({length:16},(_,i)=>view.getUint32(offset+i*4,true));let A=a0,B=b0,C=c0,D=d0;
    for(let i=0;i<64;i++){
      let F,g,s;
      if(i<16){F=(B&C)|(~B&D);g=i;s=shifts[i%4];}
      else if(i<32){F=(D&B)|(~D&C);g=(5*i+1)%16;s=shifts[4+i%4];}
      else if(i<48){F=B^C^D;g=(3*i+5)%16;s=shifts[8+i%4];}
      else{F=C^(B|~D);g=(7*i)%16;s=shifts[12+i%4];}
      const x=(A+F+k[i]+words[g])>>>0,rot=((x<<s)|(x>>>(32-s)))>>>0;
      A=D;D=C;C=B;B=(B+rot)>>>0;
    }
    a0=(a0+A)>>>0;b0=(b0+B)>>>0;c0=(c0+C)>>>0;d0=(d0+D)>>>0;
  }
  return [a0,b0,c0,d0].map(n=>[0,8,16,24].map(s=>((n>>>s)&255).toString(16).padStart(2,"0")).join("")).join("");
}

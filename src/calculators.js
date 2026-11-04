const ok=n=>Number.isFinite(Number(n));const pos=n=>ok(n)&&Number(n)>0;const parts=s=>{const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s||"");if(!m)throw Error("date");const d=new Date(Date.UTC(+m[1],+m[2]-1,+m[3]));if(d.getUTCFullYear()!=+m[1]||d.getUTCMonth()!=+m[2]-1||d.getUTCDate()!=+m[3])throw Error("date");return{y:+m[1],m:+m[2],d:+m[3]};};const dim=(y,m)=>new Date(Date.UTC(y,m,0)).getUTCDate();
export function stats(s){return{words:(s.trim().match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu)||[]).length,chars:[...s].length,noSpace:[...s].filter(c=>!(/\s/u).test(c)).length,sentences:(s.match(/[.!?。！？]+(?=\s|$)/gu)||[]).length,paragraphs:s.trim()?s.trim().split(/\n\s*\n/).filter(Boolean).length:0};}
export function age(birth,today=new Date()){const b=parts(birth),t={y:today.getFullYear(),m:today.getMonth()+1,d:today.getDate()};if(Date.UTC(b.y,b.m-1,b.d)>Date.UTC(t.y,t.m-1,t.d))throw Error("future");let months=(t.y-b.y)*12+t.m-b.m;const ann=n=>{const y=b.y+Math.floor((b.m-1+n)/12),m=(b.m-1+n)%12+1;return{y,m,d:Math.min(b.d,dim(y,m))};};let a=ann(months);if(Date.UTC(a.y,a.m-1,a.d)>Date.UTC(t.y,t.m-1,t.d)){a=ann(--months);}return{years:Math.floor(months/12),months:months%12,days:Math.round((Date.UTC(t.y,t.m-1,t.d)-Date.UTC(a.y,a.m-1,a.d))/86400000)};}
export const bmi=(w,h,unit="metric")=>{w=Number(w);h=Number(h);if(!pos(w)||!pos(h))throw Error("number");if(unit==="imperial")return 703*w/(h*h);if(unit!=="metric")throw Error("number");return w/(h*h);};
export function arithmetic(a,b,op){a=Number(a);b=Number(b);if(!ok(a)||!ok(b))throw Error("number");if(op==="divide"&&b===0)throw Error("zero");const v={add:a+b,subtract:a-b,multiply:a*b,divide:a/b,power:a**b}[op];if(!Number.isFinite(v))throw Error("number");return v;}
export function percent(mode,a,b){a=Number(a);b=Number(b);if(!ok(a)||!ok(b))throw Error("number");if(mode==="of")return a*b/100;if(mode==="as"){if(!b)throw Error("zero");return a/b*100;}if(mode==="change"){if(!a)throw Error("zero");return(b-a)/Math.abs(a)*100;}throw Error("number");}
export function temperature(v,dir){v=Number(v);if(!ok(v)||!["c","f"].includes(dir)||v<(dir==="c"?-273.15:-459.67))throw Error("absolute");return dir==="c"?v*9/5+32:(v-32)*5/9;}
export function bearing(lat,lon){lat=Number(lat);lon=Number(lon);if(!ok(lat)||!ok(lon)||lat< -90||lat>90||lon< -180||lon>180)throw Error("coordinates");const r=x=>x*Math.PI/180,a=r(lat),b=r(21.4225),dl=r(39.8262-lon),y=Math.sin(dl)*Math.cos(b),x=Math.cos(a)*Math.sin(b)-Math.sin(a)*Math.cos(b)*Math.cos(dl);return(Math.atan2(y,x)*180/Math.PI+360)%360;}
export function loan(p,rate,years){p=Number(p);rate=Number(rate)/1200;const n=Number(years)*12;if(!ok(p)||p<0||!ok(rate)||rate<0||!pos(years)||!Number.isInteger(n))throw Error("number");const payment=rate===0?p/n:p*rate/(1-(1+rate)**-n);return{payment,total:payment*n,interest:payment*n-p};}
export function days(a,b){const x=parts(a),y=parts(b);return Math.abs(Date.UTC(y.y,y.m-1,y.d)-Date.UTC(x.y,x.m-1,x.d))/86400000;}
export function gpa(text){const map={A:4,"A-":3.7,"B+":3.3,B:3,"B-":2.7,"C+":2.3,C:2,"C-":1.7,"D+":1.3,D:1,"D-":.7,F:0};let p=0,c=0;for(const line of String(text).trim().split(/\n/)){if(!line.trim())continue;const[g,cr,...extra]=line.split(",").map(x=>x.trim()),v=map[g?.toUpperCase()],n=Number(cr);if(extra.length||v===undefined||!pos(n))throw Error("number");p+=v*n;c+=n;}if(!c)throw Error("number");return p/c;}
export function gpaPercentage(text){let weighted=0,credits=0;for(const line of String(text).trim().split(/\n/)){if(!line.trim())continue;const[p,c,...extra]=line.split(",").map(x=>x.trim()),score=Number(p),credit=Number(c);if(extra.length||!ok(score)||score<0||score>100||!pos(credit))throw Error("number");weighted+=score*credit;credits+=credit;}if(!credits)throw Error("number");return weighted/credits;}

export function fuel(d,e,p){d=Number(d);e=Number(e);p=Number(p);if(!ok(d)||d<0||!pos(e)||!ok(p)||p<0)throw Error("number");const litres=d*e/100;return{litres,cost:litres*p};}
export function fuelTrip(distance,efficiency,price,mode="metric",mpgType="us"){distance=Number(distance);efficiency=Number(efficiency);price=Number(price);if(!ok(distance)||distance<0||!pos(efficiency)||!ok(price)||price<0)throw Error("number");let litres,units;
if(mode==="metric"){litres=distance*efficiency/100;units=litres;}
else if(mode==="imperial"){if(!["us","uk"].includes(mpgType))throw Error("number");const gallons=distance/efficiency;litres=gallons*(mpgType==="us"?3.785411784:4.54609);units=gallons;}
else throw Error("number");
return{litres,fuelUnits:units,cost:units*price,unit:mode==="metric"?"L":"gal",priceUnit:mode==="metric"?"per litre":"per gallon",distanceKm:mode==="metric"?distance:distance*1.609344};}

export function unit(v,from,to,group){const t={length:{m:1,km:1000,mi:1609.344,ft:.3048,in:.0254},mass:{kg:1,g:.001,lb:.45359237,oz:.028349523125},volume:{L:1,mL:.001,"US gal":3.785411784,"US qt":.946352946},area:{"m²":1,"ft²":.09290304,acre:4046.8564224,ha:10000},speed:{"km/h":1,mph:1.609344,"m/s":3.6},digital:{bit:1,byte:8,kB:8000,MB:8e6,GB:8e9,KiB:8192,MiB:8388608,GiB:8589934592}}[group];if(!t||!(from in t)||!(to in t)||!ok(v))throw Error("number");return Number(v)*t[from]/t[to];}
export function zakat(v,r){const values=["cash","gold","silver","investments"].map(k=>Number(v[k]||0));if(values.some(x=>!ok(x)||x<0))throw Error("number");const sum=values.reduce((a,b)=>a+b,0);r=Number(r);if(!ok(r)||r<0)throw Error("number");return{assets:sum,due:sum*r/100};}
export function practice(m,s,y){m=Number(m);s=Number(s);y=Number(y);if(!ok(m)||!ok(s)||!ok(y)||m<0||s<0||y<0)throw Error("number");return{day:m*s/7,week:m*s,year:m*s*52,lifetime:m*s*52*y};}
export function shares(total,s){total=Number(total);const a=String(s).split(",").map(x=>x.trim()===""?NaN:Number(x));if(!ok(total)||total<0||!a.length||a.some(x=>!ok(x)||x<0))throw Error("number");return{total:a.reduce((x,y)=>x+y,0),counts:a.map(x=>total*x/100)};}
export function demographics(total,entries){total=Number(total);if(!ok(total)||total<0)throw Error("number");const rows=String(entries).split(/\n/).map(x=>x.trim()).filter(Boolean).map(line=>{const i=line.lastIndexOf(",");if(i<1)throw Error("number");const name=line.slice(0,i).trim(),share=Number(line.slice(i+1).trim());if(!name||!ok(share)||share<0||share>100)throw Error("number");return{name,share,count:total*share/100};});if(!rows.length)throw Error("number");return{rows,totalShare:rows.reduce((n,x)=>n+x.share,0)};}
export function compass(bearing){bearing=Number(bearing);if(!ok(bearing)||bearing<0||bearing>=360)throw Error("number");return ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"][Math.round(bearing/22.5)%16];}
export function recurringDate(date,today=new Date()){const p=parts(date),t={y:today.getFullYear(),m:today.getMonth()+1,d:today.getDate()};let y=t.y;let candidate={y,m:p.m,d:Math.min(p.d,dim(y,p.m))};if(Date.UTC(candidate.y,candidate.m-1,candidate.d)<Date.UTC(t.y,t.m-1,t.d)){y++;candidate={y,m:p.m,d:Math.min(p.d,dim(y,p.m))};}return{date:[candidate.y,String(candidate.m).padStart(2,"0"),String(candidate.d).padStart(2,"0")].join("-"),days:Math.round((Date.UTC(candidate.y,candidate.m-1,candidate.d)-Date.UTC(t.y,t.m-1,t.d))/86400000)};}
export function memory(value,operation,stored=0){value=Number(value);stored=Number(stored);if(!ok(value)||!ok(stored))throw Error("number");if(operation==="M+")return stored+value;if(operation==="M-")return stored-value;if(operation==="MC")return 0;if(operation==="MR")return stored;throw Error("operation");}

export function sleep(time,mode,cycle,buffer){if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)||!pos(cycle)||!ok(buffer)||buffer<0)throw Error("number");const base=time.split(":").reduce((h,x)=>h*60+Number(x),0);return Array.from({length:6},(_,i)=>{const d=(i+1)*Number(cycle)+Number(buffer),n=(base+(mode==="bed"?d:-d)+2880)%1440;return String(Math.floor(n/60)).padStart(2,"0")+":"+String(n%60).padStart(2,"0");});}

export function engineering(a,b,op){a=Number(a);b=Number(b);if(!ok(a))throw Error("number");let v;
switch(op){
case"add":case"subtract":case"multiply":case"divide":case"power":case"modulo":if(op==="modulo"){if(!ok(b)||b===0)throw Error("zero");v=a%b;}else v=arithmetic(a,b,op);break;
case"sqrt":if(a<0)throw Error("number");v=Math.sqrt(a);break;
case"sin":v=Math.sin(a*Math.PI/180);break;
case"cos":v=Math.cos(a*Math.PI/180);break;
case"tan":if(Math.abs(Math.cos(a*Math.PI/180))<1e-12)throw Error("number");v=Math.tan(a*Math.PI/180);break;
case"log":if(a<=0)throw Error("number");v=Math.log10(a);break;
case"ln":if(a<=0)throw Error("number");v=Math.log(a);break;
case"factorial":if(a<0||!Number.isInteger(a)||a>170)throw Error("number");v=1;for(let i=2;i<=a;i++)v*=i;break;
default:throw Error("number");
}
if(!Number.isFinite(v))throw Error("number");return v;
}
export function dateDifference(start,end,today=new Date()){
const a=parts(start),b=parts(end),x=Date.UTC(a.y,a.m-1,a.d),y=Date.UTC(b.y,b.m-1,b.d);
const fromToday=Math.round((y-Date.UTC(today.getFullYear(),today.getMonth(),today.getDate()))/86400000);return{days:Math.round((y-x)/86400000),direction:fromToday>0?"upcoming":fromToday<0?"elapsed":"today",fromToday};
}

export function populationEstimate(now=new Date()){
const baseline=8300678395,annualNet=8300678395-8231613070,daysPerYear=365.2425;
const elapsed=(now.getTime()-Date.UTC(2026,6,1))/86400000;
const perDay=annualNet/daysPerYear;
const estimate=baseline+elapsed*perDay;
return{estimate,rounded:Math.round(estimate/1000)*1000,perDay,baselineDate:"2026-07-01",annualNet};
}

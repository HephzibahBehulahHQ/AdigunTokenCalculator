import test from "node:test";import assert from "node:assert/strict";import * as c from "../src/calculators.js";
test("Unicode text statistics",()=>{const r=c.stats("Hello, world!\n\nYorùbá 😊");assert.equal(r.words,3);assert.equal(r.paragraphs,2);assert.equal(r.chars,[..."Hello, world!\n\nYorùbá 😊"].length);});
test("calendar age handles month ends",()=>{assert.deepEqual(c.age("2000-01-31",new Date(2024,2,1)),{years:24,months:1,days:1});assert.throws(()=>c.age("2030-01-01",new Date(2024,0,1)));});
test("math and percentage edge cases",()=>{assert.equal(c.arithmetic(8,2,"divide"),4);assert.throws(()=>c.arithmetic(1,0,"divide"));assert.equal(c.percent("change",100,125),25);assert.throws(()=>c.percent("as",1,0));});
test("temperature and BMI",()=>{assert.equal(c.temperature(0,"c"),32);assert.equal(c.temperature(32,"f"),0);assert.throws(()=>c.temperature(-300,"c"));assert.equal(c.bmi(80,2),20);});
test("bearing, loans, dates and GPA",()=>{assert.ok(c.bearing(0,0)>=0);assert.throws(()=>c.bearing(91,0));assert.equal(c.loan(1200,0,1).payment,100);assert.equal(c.days("2024-02-28","2024-03-01"),2);assert.equal(c.gpa("A,3\nB,1"),3.75);});
test("fuel, units, zakat, practice, shares and sleep",()=>{assert.deepEqual(c.fuel(100,5,2),{litres:5,cost:10});assert.equal(c.unit(1,"km","m","length"),1000);assert.equal(c.zakat({cash:100},2.5).due,2.5);assert.equal(c.practice(30,7,1).year,10920);assert.equal(c.shares(100,"30,20").total,50);assert.equal(c.sleep("22:00","bed",90,15)[0],"23:45");});
test("scientific engineering operations and invalid domains",()=>{assert.equal(c.engineering(3,0,"sqrt"),Math.sqrt(3));assert.equal(c.engineering(5,2,"modulo"),1);assert.ok(Math.abs(c.engineering(30,0,"sin")-.5)<1e-12);assert.equal(c.engineering(5,0,"factorial"),120);assert.throws(()=>c.engineering(-1,0,"sqrt"));assert.throws(()=>c.engineering(-3,0,"log"));assert.throws(()=>c.engineering(4.5,0,"factorial"));});
test("BMI supports metric and imperial units",()=>{assert.equal(c.bmi(80,2),20);assert.ok(Math.abs(c.bmi(176.37,70,"imperial")-25.3)<.1);assert.throws(()=>c.bmi(176,0,"imperial"));});
test("date difference preserves countdown direction",()=>{assert.deepEqual(c.dateDifference("2026-11-04","2026-11-10",new Date(2026,10,4)),{days:6,direction:"upcoming",fromToday:6});assert.equal(c.dateDifference("2026-11-10","2026-11-03",new Date(2026,10,4)).direction,"elapsed");});

test("named demographics preserve user categories and do not normalise totals",()=>{const r=c.demographics(1000,"Christianity, 30\nIslam, 25\nUnaffiliated, 20");assert.equal(r.totalShare,75);assert.deepEqual(r.rows.map(x=>x.name),["Christianity","Islam","Unaffiliated"]);assert.equal(r.rows[0].count,300);assert.throws(()=>c.demographics(100,"Unknown, 101"));assert.throws(()=>c.demographics(100," , 20"));});
test("compass points and annual recurring events",()=>{assert.equal(c.compass(0),"N");assert.equal(c.compass(90),"E");assert.equal(c.compass(180),"S");assert.equal(c.compass(270),"W");assert.deepEqual(c.recurringDate("2024-02-29",new Date(2026,1,28)),{date:"2026-02-28",days:0});assert.throws(()=>c.compass(360));});
test("engineering memory operations are deterministic",()=>{assert.equal(c.memory(5,"M+",2),7);assert.equal(c.memory(3,"M-",7),4);assert.equal(c.memory(0,"MR",4),4);assert.equal(c.memory(0,"MC",4),0);assert.throws(()=>c.memory(1,"bad",0));});
test("GPA percentage mode is credit weighted and validates bounds",()=>{assert.equal(c.gpaPercentage("90,3\n80,1"),87.5);assert.throws(()=>c.gpaPercentage("101,1"));assert.throws(()=>c.gpaPercentage("80,0"));assert.throws(()=>c.gpa("A,2,extra"));});
test("imperial fuel economy supports US and Imperial gallons",()=>{const us=c.fuelTrip(100,25,4,"imperial","us");assert.ok(Math.abs(us.litres-15.141647136)<1e-9);assert.equal(us.cost,16);const uk=c.fuelTrip(100,25,4,"imperial","uk");assert.ok(uk.litres>us.litres);assert.throws(()=>c.fuelTrip(100,0,4,"imperial","us"));});
test("practice projections include daily weekly and annual totals",()=>{const r=c.practice(30,7,1);assert.equal(r.day,30);assert.equal(r.week,210);assert.equal(r.year,10920);});
test("temperature rejects unknown conversion modes and absolute zero boundaries",()=>{assert.equal(c.temperature(-273.15,"c"),-459.66999999999996);assert.throws(()=>c.temperature(10,"x"));assert.throws(()=>c.temperature(-459.68,"f"));});
test("countdown status distinguishes an event today",()=>{assert.equal(c.dateDifference("2026-11-01","2026-11-04",new Date(2026,10,4)).direction,"today");});

test("world population estimate is anchored to published mid-year baselines",()=>{const r=c.populationEstimate(new Date(Date.UTC(2026,6,1)));assert.equal(r.estimate,8300678396);assert.equal(r.baselineDate,"2026-07-01");assert.equal(r.baseline,8300678396);assert.ok(Number.isFinite(r.baseline));assert.ok(r.perDay>0);assert.ok(Math.abs((c.populationEstimate(new Date(Date.UTC(2026,6,2))).estimate-r.estimate)-r.perDay)<1e-6);});

test("BMI rejects implausible measurement ranges",()=>{assert.throws(()=>c.bmi(80,.1));assert.throws(()=>c.bmi(3000,70,"imperial"));assert.throws(()=>c.bmi(150,150,"imperial"));});
test("age handles leap-day birthdays using February 28 anniversary",()=>{assert.deepEqual(c.age("2000-02-29",new Date(2021,1,28)),{years:21,months:0,days:0});});
test("unit conversion distinguishes decimal and binary storage",()=>{assert.equal(c.unit(1,"kB","byte","digital"),1000);assert.equal(c.unit(1,"KiB","byte","digital"),1024);assert.equal(c.unit(1,"m/s","km/h","speed"),3.6);});
test("loan non-zero interest and sleep day rollover",()=>{const r=c.loan(1000,12,1);assert.ok(Math.abs(r.payment-88.8487886783)<1e-8);assert.ok(r.total>1000);assert.equal(c.sleep("00:30","wake",90,15)[0],"22:45");});
test("Qibla bearing at the Kaaba is due north by convention",()=>{assert.ok(c.bearing(21.4225,39.8262)<1e-8);});
test("special whitespace-sensitive token examples are distinct",async()=>{const {tokenize}=await import("../src/tokenizer.js");const a=await tokenize("red","cl100k_base"),b=await tokenize(" Red","cl100k_base"),d=await tokenize(" red","cl100k_base");assert.notDeepEqual(a.ids,b.ids);assert.notDeepEqual(a.ids,d.ids);assert.deepEqual(await tokenize("","o200k_base"),{ids:[],pieces:[],chars:0});});

test("sleep times stay valid when cycles cross several days",()=>{
 assert.deepEqual(c.sleep("00:30","wake",1000,15),["07:35","14:55","22:15","05:35","12:55","20:15"]);
 assert.equal(c.sleep("22:00","bed",90,15)[0],"23:45");
 for(const mode of ["bed","wake"])for(const value of c.sleep("00:00",mode,1440,2880))assert.match(value,/^([01]\d|2[0-3]):[0-5]\d$/);
});
test("sleep rejects fractional minutes and unknown modes",()=>{
 for(const args of [["22:00","bed",90.5,15],["22:00","bed",90,.5],["22:00","unknown",90,15],["22:00","bed",0,15],["22:00","bed",Number.MAX_SAFE_INTEGER,15]])assert.throws(()=>c.sleep(...args));
});
test("percentage GPA rejects omitted grades without rejecting a genuine zero",()=>{
 assert.throws(()=>c.gpaPercentage(",3\n90,3"));
 assert.throws(()=>c.gpaPercentage("90,\n80,3"));
 assert.equal(c.gpaPercentage("0,3\n90,3"),45);
});

test("population interpolation passes through both audited UN July baselines",()=>{assert.equal(c.populationEstimate(new Date(Date.UTC(2025,6,1))).estimate,8231613070);assert.equal(c.populationEstimate(new Date(Date.UTC(2026,6,1))).estimate,8300678396);assert.equal(c.populationEstimate(new Date(Date.UTC(2026,6,1))).annualNet,69065326);});

test("engineering percentage means A percent of B for signed decimal inputs",()=>{
 for(const [a,b,expected] of [[10,200,20],[12.5,80,10],[-15,200,-30],[15,-200,-30],[-15,-200,30],[0,200,0],[25,0,0],[150,80,120],["12.5","80",10]]){
  assert.equal(c.engineering(a,b,"percentOf"),expected);
 }
});
test("percentage of avoids intermediate overflow without discarding tiny operands",()=>{
 for(const [a,b] of [[100,Number.MAX_VALUE],[Number.MAX_VALUE,100],[1e308,100],[100,1e308]]){
  const expected=a===100?b:a;
  assert.equal(c.percent("of",a,b),expected);
  assert.equal(c.engineering(a,b,"percentOf"),expected);
 }
 assert.equal(c.engineering(Number.MIN_VALUE,100,"percentOf"),Number.MIN_VALUE);
 assert.ok(c.engineering(1e-323,1e308,"percentOf")>0);
});
test("engineering percentage rejects nonfinite operands and overflowing results",()=>{
 for(const invalid of [NaN,Infinity,-Infinity,"invalid",undefined]){
  assert.throws(()=>c.engineering(invalid,100,"percentOf"),/number/);
  assert.throws(()=>c.engineering(100,invalid,"percentOf"),/number/);
 }
 for(const a of [Number.MAX_VALUE,-Number.MAX_VALUE])assert.throws(()=>c.engineering(a,200,"percentOf"),/number/);
});
test("loan stays finite near zero interest and preserves exact zero-rate totals",()=>{
 const tiny=c.loan(1200,1e-14,1);
 assert.ok(Math.abs(tiny.payment-100)<1e-10);
 assert.ok(Object.values(tiny).every(Number.isFinite));
 assert.ok(tiny.interest>=0);
 assert.deepEqual(c.loan(1200,0,1),{payment:100,total:1200,interest:0});
 assert.deepEqual(c.loan(10,0,7/12),{payment:10/7,total:10,interest:0});
 const rounded=c.loan(10,1e-14,7/12);
 assert.ok(rounded.payment>=10/7);assert.ok(rounded.total>=10);assert.ok(rounded.interest>=0);
 for(const rate of [0,12,Number.MAX_VALUE])assert.deepEqual(c.loan(0,rate,1),{payment:0,total:0,interest:0});
});
test("loan validates inputs and a positive safe-integer payment count",()=>{
 assert.deepEqual(c.loan(1200,0,1/12),{payment:1200,total:1200,interest:0});
 for(const args of [[-1,12,1],[1200,-1,1],[1200,-Number.MIN_VALUE,1],[1200,12,0],[1200,12,-1],[1200,12,.1],[1200,12,Number.MAX_SAFE_INTEGER]])assert.throws(()=>c.loan(...args),/number/);
 for(const invalid of [NaN,Infinity,-Infinity,"invalid",undefined]){
  for(let index=0;index<3;index++){
   const args=[1200,12,1];args[index]=invalid;assert.throws(()=>c.loan(...args),/number/);
  }
 }
});
test("loan rejects output overflow while retaining finite extreme results",()=>{
 assert.throws(()=>c.loan(Number.MAX_VALUE,1200,1/12),/number/);
 assert.throws(()=>c.loan(1e308,1200,2),/number/);
 const nearLimit=c.loan(Number.MAX_VALUE,1e-100,1);
 assert.equal(nearLimit.total,Number.MAX_VALUE);assert.equal(nearLimit.interest,0);
 const finite=c.loan(1e-308,1e308,1e11);
 assert.ok(Object.values(finite).every(Number.isFinite));
 assert.ok(Math.abs(finite.payment-1/1200)<1e-18);
 assert.ok(Math.abs(finite.total-1e9)<1e-6);
});

test("unit conversion avoids intermediate overflow and rejects genuine overflow",()=>{
 const result=c.unit(1e308,"byte","GB","digital");
 assert.ok(Number.isFinite(result));assert.ok(Math.abs(result/1e299-1)<1e-15);
 assert.equal(c.unit(0,"byte","GB","digital"),0);
 assert.throws(()=>c.unit(1e308,"GB","byte","digital"),/number/);
});

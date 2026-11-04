import test from "node:test";
import assert from "node:assert/strict";
import * as a from "../src/additional.js";

test("timezone conversion handles IANA offsets and rejects DST gaps",()=>{
 const r=a.convertTimeZone("2026-01-15T12:00","Europe/Berlin","Africa/Lagos");
 assert.equal(r.local,"2026-01-15T12:00");assert.equal(r.fromOffset,"+01:00");assert.equal(r.toOffset,"+01:00");
 assert.throws(()=>a.convertTimeZone("2026-03-29T02:30","Europe/Berlin","UTC"),/dst-gap/);
});
test("offline ECB currency rates are dated and editable",()=>{
 assert.equal(a.ECB_RATES_DATE,"2026-11-04");
 assert.ok(Math.abs(a.convertCurrency(100,"EUR","USD")-112.67)<1e-9);
 assert.equal(a.convertCurrency(10,"USD","EUR",{EUR:1,USD:2}),5);
 assert.throws(()=>a.convertCurrency(1,"EUR","NGN"));
});
test("inflation calculator supports forward and reverse years",()=>{
 assert.ok(Math.abs(a.inflationValue(100,2020,2022,10)-121)<1e-9);
 assert.ok(Math.abs(a.inflationValue(121,2022,2020,10)-100)<1e-9);
 assert.throws(()=>a.inflationValue(1,2020,2021,-100));
});
test("tip splitter applies tax, tip basis and rounding",()=>{
 const r=a.splitTip(100,10,5,3,"with-tax","nearest");
 assert.equal(r.tax,5);assert.equal(r.tip,10.5);assert.equal(r.total,115.5);assert.equal(r.perPerson,38.5);
 assert.throws(()=>a.splitTip(100,10,5,0));
});
test("calorie macro estimate validates adult inputs and percentages",()=>{
 const r=a.calorieTargets(70,175,30,"male","moderate");
 assert.equal(r.bmr,1648.75);assert.ok(r.tdee>r.bmr);assert.equal(r.proteinGrams,r.tdee*.25/4);
 assert.throws(()=>a.calorieTargets(70,175,17,"male","moderate"));
});
test("pregnancy dates estimate due date and gestational age",()=>{
 const r=a.pregnancyEstimate("lmp","2026-10-01",new Date(2026,10,4));
 assert.equal(r.dueDate,"2027-07-08");assert.equal(r.gestationalWeeks,4);assert.equal(r.gestationalDays,6);
 assert.equal(a.pregnancyEstimate("conception","2026-10-15",new Date(2026,10,4)).dueDate,"2027-07-08");
 assert.throws(()=>a.pregnancyEstimate("lmp","2027-01-01",new Date(2026,10,4)));
});
test("water estimate returns a range and validates user adjustment",()=>{
 assert.deepEqual(a.waterRange(70,250),{lowMl:2350,highMl:2700});
 assert.throws(()=>a.waterRange(0));
});
test("BAC estimate is nonnegative and rejects implausible inputs",()=>{
 assert.equal(a.bloodAlcohol(70,"male",0,330,5,0).bacPercent,0);
 assert.ok(a.bloodAlcohol(70,"male",2,330,5,0).bacPercent>0);
 assert.throws(()=>a.bloodAlcohol(70,"other",1,330,5,0));
});
test("Roman numerals convert bidirectionally and reject noncanonical values",()=>{
 assert.equal(a.toRoman(1994),"MCMXCIV");assert.equal(a.fromRoman("mcmxciv"),1994);
 assert.throws(()=>a.toRoman(4000));assert.throws(()=>a.fromRoman("IIII"));
});
test("base conversion uses BigInt and validates digits",()=>{
 assert.equal(a.convertBase("FF",16,2),"11111111");
 assert.equal(a.convertBase("-101",2,10),"-5");
 assert.throws(()=>a.convertBase("2",2,10));
});
test("password generator uses selected local character sets",()=>{
 const p=a.generatePassword(32,"hex");assert.equal(p.password.length,32);assert.match(p.password,/^[0-9a-f]+$/);assert.equal(p.entropyBits,128);
 assert.throws(()=>a.generatePassword(4,"all"));
});
test("JSON formatter preserves data and reports syntax location",()=>{
 assert.equal(a.jsonTransform('{"a":1}',"pretty"),'{\n  "a": 1\n}');
 assert.equal(a.jsonTransform('{"a":1}',"minify"),'{"a":1}');
 assert.throws(()=>a.jsonTransform('{"a":\n}',"pretty"),/line/);
});
test("color conversion and WCAG contrast calculations",()=>{
 assert.deepEqual(a.parseHexColor("#fff"),{r:255,g:255,b:255});
 assert.deepEqual(a.rgbToHsl(255,0,0),{h:0,s:100,l:50});
 assert.equal(a.contrastRatio("#000000","#ffffff"),21);
 assert.throws(()=>a.parseHexColor("#12"));
});
test("discount calculation and reverse original price",()=>{
 const r=a.discountPrice(100,20,10);assert.equal(r.total,88);assert.equal(r.saved,20);
 assert.ok(Math.abs(a.originalPriceFromSale(88,20,10)-100)<1e-9);
 assert.throws(()=>a.originalPriceFromSale(10,100));
});
test("recipe scaler handles fractions and preserves units and names",()=>{
 assert.deepEqual(a.scaleRecipe("1/2 cup flour\n2 eggs",2,4),["1 cup flour","4 eggs"]);
 assert.throws(()=>a.scaleRecipe("a pinch salt",2,4));
});
test("holiday dates include computus Easter and regional rules",()=>{
 assert.equal(a.easterSunday(2026),"2026-04-05");
 const de=a.holidayDates(2026,"DE");assert.ok(de.some(x=>x[0]==="Good Friday"&&x[1]==="2026-04-03"));
 assert.throws(()=>a.holidayDates(2026,"XX"));
});
test("Morse translation round-trips words and punctuation",()=>{
 const code=a.translateMorse("SOS HELP","text");assert.equal(code,"... --- ... / .... . .-.. .--.");
 assert.equal(a.translateMorse(code,"morse"),"SOS HELP");
 assert.throws(()=>a.translateMorse("🙂","text"));
});
test("statistics handles even medians, ties and sample variance",()=>{
 const r=a.summarizeNumbers("1,2,2,3");
 assert.equal(r.mean,2);assert.equal(r.median,2);assert.deepEqual(r.mode,[2]);assert.equal(r.range,2);
 assert.equal(r.populationVariance,.5);assert.ok(r.sampleVariance>r.populationVariance);
 assert.throws(()=>a.summarizeNumbers("1, nope"));
});

test("currency rate editor validates a dated EUR-base table",()=>{
 const rates=a.parseCurrencyRates("EUR,1\nUSD,1.1267\nGBP,0.83460");
 assert.equal(rates.USD,1.1267);assert.throws(()=>a.parseCurrencyRates("USD,1"));
});
test("MD5 matches the standard empty and ASCII test vectors",()=>{
 assert.equal(a.md5Hex(new TextEncoder().encode("")),"d41d8cd98f00b204e9800998ecf8427e");
 assert.equal(a.md5Hex(new TextEncoder().encode("abc")),"900150983cd24fb0d6963f7d28e17f72");
});

test("fall-back daylight-saving ambiguity is surfaced",()=>{
 const r=a.convertTimeZone("2026-10-25T02:30","Europe/Berlin","UTC");
 assert.equal(r.ambiguous,true);assert.equal(r.local,"2026-10-25T00:30");
});
test("ECB snapshot contains major currency cross-rate inputs",()=>{
 assert.equal(a.ECB_EUR_RATES.CHF,.9188);assert.equal(a.ECB_EUR_RATES.CAD,1.5701);
 assert.equal(a.ECB_EUR_RATES.ZAR,18.5404);
});

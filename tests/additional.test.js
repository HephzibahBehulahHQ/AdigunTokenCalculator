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
 assert.deepEqual(a.waterRange(70,-100),{lowMl:2000,highMl:2350});
 assert.throws(()=>a.waterRange(70,-3000));
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
 assert.deepEqual(a.discountPrice(100,100,19),{discounted:0,tax:0,total:0,saved:100});
 assert.ok(Math.abs(a.originalPriceFromSale(88,20,10)-100)<1e-9);
 assert.throws(()=>a.originalPriceFromSale(10,100));
});
test("recipe scaler handles fractions and preserves units and names",()=>{
 assert.deepEqual(a.scaleRecipe("1/2 cup flour\n2 eggs",2,4),["1 cup flour","4 eggs"]);
 assert.deepEqual(a.scaleRecipe("1 1/2 kg flour\n1/4 L milk",2,4),["3 kg flour","0.5 L milk"]);
 assert.deepEqual(a.scaleRecipe("1/3 cup flour",1,1,"keep"),["0.3333 cup flour"]);
 assert.throws(()=>a.scaleRecipe("a pinch salt",2,4));
});
test("recipe output modes convert only compatible metric mass and volume",()=>{
 assert.deepEqual(a.scaleRecipe("1 1/2 kg flour\n1/4 L milk",2,4,"small"),["3000 g flour","500 mL milk"]);
 assert.deepEqual(a.scaleRecipe("750 g flour\n250 mL milk",2,4,"large"),["1.5 kg flour","0.5 L milk"]);
 assert.deepEqual(a.scaleRecipe("2 kg\n3 L",1,1,"small"),["2000 g","3000 mL"]);
 assert.deepEqual(a.scaleRecipe("2000 g\n3000 mL",1,1,"large"),["2 kg","3 L"]);
 assert.deepEqual(a.scaleRecipe("10 g salt\n25 mL oil",1,2,"small"),["20 g salt","50 mL oil"]);
 assert.deepEqual(a.scaleRecipe("1 kg flour\n2 L water",1,2,"large"),["2 kg flour","4 L water"]);
});
test("recipe conversions preserve ingredient text and require a complete unit token",()=>{
 assert.deepEqual(a.scaleRecipe("1 kg   flour\n2 L\tmilk",1,2,"small"),["2000 g   flour","4000 mL\tmilk"]);
 const source="1 cup flour\n2 tsp salt\n3 eggs\n4 kgful mixture\n5 ghee\n6 Lime juice\n7 kilogram flour\n8 ml milk\n9 Kg flour\n10 kg, flour";
 const expected=["2 cup flour","4 tsp salt","6 eggs","8 kgful mixture","10 ghee","12 Lime juice","14 kilogram flour","16 ml milk","18 Kg flour","20 kg, flour"];
 for(const mode of ["keep","small","large"])assert.deepEqual(a.scaleRecipe(source,1,2,mode),expected);
});
test("recipe zero and tiny quantities survive conversion and output reuse",()=>{
 assert.deepEqual(a.scaleRecipe("0 kg flour\n0 L milk",1,2,"small"),["0 g flour","0 mL milk"]);
 assert.deepEqual(a.scaleRecipe("0.01 g spice",1,1,"large"),["0.00001 kg spice"]);
 assert.deepEqual(a.scaleRecipe("1e-8 kg spice",1,1,"small"),["0.00001 g spice"]);
 for(const source of ["0.00000001 g spice","5e-324 g spice","1E+21 g flour"]){
  const once=a.scaleRecipe(source,1,1);
  assert.deepEqual(a.scaleRecipe(once.join("\n"),1,1),once);
  assert.notEqual(once[0].split(" ")[0],"0");
 }
 const converted=a.scaleRecipe("0.00000001 g spice",1,1,"large");
 assert.ok(Number(converted[0].split(" ")[0])>0);
 assert.deepEqual(a.scaleRecipe(converted.join("\n"),1,1),converted);
});
test("recipe validation rejects unsupported modes malformed quantities and numeric overflow",()=>{
 for(const mode of ["unknown","SMALL",null,{}])assert.throws(()=>a.scaleRecipe("1 kg flour",1,1,mode),/number/);
 for(const source of ["1/0 kg flour","1 1/0 kg flour","-1 kg flour","1e kg flour","1e-8kg flour","1e309 kg flour","1e-999 kg flour","NaN kg flour"]){
  assert.throws(()=>a.scaleRecipe(source,1,1),/recipe/);
 }
 for(const servings of [[0,1],[1,0],[-1,1],[1,-1],[Infinity,1],[1,Infinity]])assert.throws(()=>a.scaleRecipe("1 kg flour",...servings),/number/);
 assert.throws(()=>a.scaleRecipe(" \n ",1,1),/empty/);
 assert.throws(()=>a.scaleRecipe("1 kg flour",1e-308,1e308),/number/);
 assert.throws(()=>a.scaleRecipe("1e308 kg flour",1,2),/number/);
 assert.throws(()=>a.scaleRecipe("1e308 kg flour",1,1,"small"),/number/);
 assert.throws(()=>a.scaleRecipe("1 kg flour",1e308,1e-308),/number/);
 assert.throws(()=>a.scaleRecipe("5e-324 g spice",1,1,"large"),/number/);
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
 assert.equal(rates.USD,1.1267);assert.throws(()=>a.parseCurrencyRates("USD,1"));assert.throws(()=>a.parseCurrencyRates("EUR,2\\nUSD,1"));
});
test("MD5 matches the standard empty and ASCII test vectors",()=>{
 assert.equal(a.md5Hex(new TextEncoder().encode("")),"d41d8cd98f00b204e9800998ecf8427e");
 assert.equal(a.md5Hex(new TextEncoder().encode("abc")),"900150983cd24fb0d6963f7d28e17f72");
});

test("fall-back daylight-saving ambiguity is surfaced",()=>{
 const r=a.convertTimeZone("2026-10-25T02:30","Europe/Berlin","UTC");
 assert.equal(r.ambiguous,true);assert.equal(r.local,"2026-10-25T00:30");assert.equal(r.fromOffset,"+02:00");assert.equal(r.toOffset,"+00:00");assert.match(r.localFormatted,/2026|25 Oct 2026/);
});
test("ECB snapshot contains major currency cross-rate inputs",()=>{
 assert.equal(a.ECB_EUR_RATES.CHF,.9188);assert.equal(a.ECB_EUR_RATES.CAD,1.5701);
 assert.equal(a.ECB_EUR_RATES.ZAR,18.5404);
});

test("regional holiday calendars include common fixed and weekday rules",()=>{
 const us=a.holidayDates(2026,"US"),gb=a.holidayDates(2026,"GB"),ca=a.holidayDates(2026,"CA");
 assert.ok(us.some(x=>x[0]==="Labor Day"&&x[1]==="2026-09-07"));
 assert.ok(gb.some(x=>x[0]==="Summer bank holiday"&&x[1]==="2026-08-31"));
 assert.ok(ca.some(x=>x[0]==="Thanksgiving"&&x[1]==="2026-10-12"));
});

test("JSON formatting preserves large numeric tokens and duplicate members",()=>{
 const source='{ "account": 9007199254740993, "large": 1e400, "small": 1e-400, "signedZero": -0, "same": 1, "same": 2 }';
 const compact='{"account":9007199254740993,"large":1e400,"small":1e-400,"signedZero":-0,"same":1,"same":2}';
 assert.equal(a.jsonTransform(source,"minify"),compact);
 assert.equal(a.jsonTransform(a.jsonTransform(source,"pretty"),"minify"),compact);
});
test("JSON formatting preserves escapes and string whitespace",()=>{
 const source=String.raw`{"message":" a , : { [ \"quoted\" ] } b ","path":"C:\\tmp\\file","unicode":"\u0041","items":[{},[],true,null]}`;
 const pretty=a.jsonTransform(source,"pretty");
 assert.equal(a.jsonTransform(pretty,"minify"),source);
 assert.deepEqual(JSON.parse(pretty),JSON.parse(source));
 assert.equal(a.jsonTransform("9007199254740993","pretty"),"9007199254740993");
 assert.equal(a.jsonTransform(" [ ] ","pretty"),"[]");
 assert.throws(()=>a.jsonTransform('{"broken":}',"minify"),/JSON syntax error/);
});
test("JSON pretty output retains ordinary nested formatting",()=>{
 assert.equal(a.jsonTransform('{"a":[1,{"b":true}],"c":null}',"pretty"),'{\n  "a": [\n    1,\n    {\n      "b": true\n    }\n  ],\n  "c": null\n}');
});

test("calorie estimates reject inputs that produce nonpositive energy needs",()=>{
 assert.throws(()=>a.calorieTargets(10,100,120,"female","sedentary"));
 assert.throws(()=>a.calorieTargets(.01,.01,18,"male","sedentary"));
});

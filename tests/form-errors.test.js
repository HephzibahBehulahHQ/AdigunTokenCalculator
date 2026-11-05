import test from "node:test";
import assert from "node:assert/strict";
import {errorFields,attachFormError,clearFormError} from "../src/form-errors.js";

const fields=(tool,code,data)=>errorFields(tool,Error(code),data);

test("JSON syntax and empty input identify text without blaming the format",()=>{
 assert.deepEqual(fields("json","JSON syntax error at line 2, column 1",{mode:"pretty"}),["text"]);
 assert.deepEqual(fields("json","empty"),["text"]);
 assert.deepEqual(fields("json","number",{text:"{}",mode:"bad"}),[]);
 assert.deepEqual(fields("json","Unexpected runtime failure"),[]);
});
test("GPA identifies malformed data but leaves mode failures and overflow at form level",()=>{
 for(const [mode,grades] of [["scale4","A,0"],["scale4",",3"],["scale4","4,3"],["percentage","101,3"],["percentage","80,"]])assert.deepEqual(fields("gpa","number",{mode,grades}),["grades"]);
 for(const [mode,grades] of [["unknown","A,0"],["gpa","A,0"],["scale4","A,1e308"],["scale4","F,1e308\nF,1e308"],["percentage","100,1e308"],["percentage","0,3"]])assert.deepEqual(fields("gpa","number",{mode,grades}),[]);
 assert.deepEqual(fields("gpa","number",{mode:"scale4"}),[]);
});
test("percentage denominator errors identify only the denominator for that mode",()=>{
 assert.deepEqual(fields("percent","zero",{mode:"as",a:10,b:0}),["b"]);
 assert.deepEqual(fields("percent","zero",{mode:"change",a:0,b:10}),["a"]);
 assert.deepEqual(fields("percent","zero",{mode:"of",a:0,b:10}),[]);
 assert.deepEqual(fields("percent","number",{mode:"of",a:1e308,b:1e308}),[]);
 assert.deepEqual(fields("percent","number",{mode:"of",a:"bad",b:100}),["a"]);
 assert.deepEqual(fields("percent","number",{mode:"as",a:100,b:Infinity}),["b"]);
});
test("discount errors distinguish a free forward price from an undefined reverse price",()=>{
 assert.deepEqual(fields("discount","number",{mode:"forward",discountPct:100}),[]);
 assert.deepEqual(fields("discount","number",{mode:"reverse",discountPct:100}),["discountPct"]);
 for(const mode of ["forward","reverse"]){
  for(const discountPct of [0,99.999])assert.deepEqual(fields("discount","number",{mode,discountPct}),[]);
  for(const discountPct of [-1,101,"", "bad"])assert.deepEqual(fields("discount","number",{mode,discountPct}),["discountPct"]);
 }
 assert.deepEqual(fields("discount","unexpected",{mode:"reverse",discountPct:100}),[]);
});
test("date errors isolate invalid dates and ignore inactive or reversed dates",()=>{
 assert.deepEqual(fields("dates","date",{mode:"difference",start:"2024-02-30",end:"2024-03-01"}),["start"]);
 assert.deepEqual(fields("dates","date",{mode:"difference",start:"2024-02-29",end:"bad"}),["end"]);
 assert.deepEqual(fields("dates","date",{mode:"annual",start:"bad",end:"2024-02-29"}),[]);
 assert.deepEqual(fields("dates","date",{mode:"annual",start:"bad",end:"bad"}),["end"]);
 assert.deepEqual(fields("dates","date",{mode:"difference",start:"2026-12-01",end:"2026-01-01"}),[]);
 assert.deepEqual(fields("dates","date",{mode:"unknown",start:"bad",end:"bad"}),[]);
 assert.deepEqual(fields("age","future",{birth:"2099-01-01"}),["birth"]);
 assert.deepEqual(fields("age","date",{birth:"2024-02-30"}),["birth"]);
 assert.deepEqual(fields("age","number",{birth:"2024-02-29"}),[]);
});
test("hash size errors identify only a selected oversized file",()=>{
 assert.deepEqual(fields("hash","number",{file:{name:"large.bin",size:25000001},text:"valid"}),["file"]);
 for(const file of [{name:"limit.bin",size:25000000},{name:"empty.bin",size:0},{name:"",size:25000001}])assert.deepEqual(fields("hash","number",{file}),[]);
 assert.deepEqual(fields("hash","empty",{text:"",file:{name:"",size:0}}),[]);
 assert.deepEqual(fields("hash","OperationError",{file:{name:"valid.bin",size:10}}),[]);
});
test("password errors distinguish length limits from crypto and configuration failures",()=>{
 for(const length of ["",7,129,8.5,Infinity])assert.deepEqual(fields("password","number",{passwordMode:"generate",length}),["length"]);
 assert.deepEqual(fields("password","number",{passwordMode:"generate",length:20,charset:"unknown"}),[]);
 assert.deepEqual(fields("password","number",{passwordMode:"generate",length:20,charset:"all"}),[]);
 assert.deepEqual(fields("password","number",{passwordMode:"check",passwordInput:""}),["passwordInput"]);
 assert.deepEqual(fields("password","number",{passwordMode:"check",passwordInput:"😀".repeat(129)}),["passwordInput"]);
 assert.deepEqual(fields("password","number",{passwordMode:"check",passwordInput:"😀".repeat(128)}),[]);
 assert.deepEqual(fields("password","number",{passwordMode:"unknown",length:0}),[]);
});
test("other confirmed single-input failures exclude unrelated controls",()=>{
 assert.deepEqual(fields("math","zero",{op:"divide",a:1,b:0}),["b"]);
 assert.deepEqual(fields("math","number",{op:"sqrt",a:-1,b:10}),["a"]);
 assert.deepEqual(fields("math","number",{op:"multiply",a:1e308,b:1e308}),[]);
 assert.deepEqual(fields("math","number",{op:"unknown",a:"bad",b:10}),[]);
 assert.deepEqual(fields("temp","absolute",{direction:"c",value:-274}),["value"]);
 assert.deepEqual(fields("temp","absolute",{direction:"unknown",value:10}),[]);
 assert.deepEqual(fields("qibla","coordinates",{lat:91,lon:0}),["lat"]);
 assert.deepEqual(fields("qibla","geo",{lat:91,lon:0}),[]);
 assert.deepEqual(fields("morse","morse",{direction:"text"}),["text"]);
 assert.deepEqual(fields("morse","morse",{direction:"unknown"}),[]);
 assert.deepEqual(fields("qr","empty"),["text"]);
 assert.deepEqual(fields("stats","empty"),["numbers"]);
 assert.deepEqual(fields("stats","number",{numbers:"1, bad, 3"}),["numbers"]);
 assert.deepEqual(fields("stats","number",{numbers:"1e308, 1e308"}),[]);
 assert.deepEqual(fields("roman","number",{mode:"fromRoman",value:"IIII"}),["value"]);
 assert.deepEqual(fields("unknown","number",{value:"bad"}),[]);
});
test("error helpers safely ignore missing forms and unknown errors",()=>{
 assert.deepEqual(errorFields("json",null),[]);
 assert.deepEqual(errorFields("gpa",Error("number"),null),[]);
 assert.equal(clearFormError(null),false);
 assert.equal(attachFormError(null,null,[]),undefined);
});

test("loan, recipe and HEX errors identify only confirmed input defects",()=>{
 assert.deepEqual(errorFields("loan",new Error("number"),{principal:1000,annualRate:10,term:.1}),["term"]);
 assert.deepEqual(errorFields("loan",new Error("number"),{principal:1e308,annualRate:1200,term:2}),[]);
 assert.deepEqual(errorFields("recipe",new Error("number"),{fromServings:0,toServings:4,recipeUnits:"small"}),["fromServings"]);
 assert.deepEqual(errorFields("recipe",new Error("number"),{fromServings:1e-308,toServings:1e308,recipeUnits:"small"}),[]);
 assert.deepEqual(errorFields("color",new Error("number"),{colorMode:"hex",foreground:"#ggg"}),["foreground"]);
 assert.deepEqual(errorFields("color",new Error("number"),{colorMode:"hex",foreground:"#abc"}),[]);
});

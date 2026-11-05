import {days,gradeBreakdown,demographics} from "./calculators.js";
import {normalizeHexColor} from "./colors.js";

const states=new WeakMap();
let nextErrorId=0;
const has=(data,key)=>Object.hasOwn(data,key);
const numeric=value=>(typeof value==="number"||typeof value==="string"&&value.trim()!=="")&&Number.isFinite(Number(value));
const invalidDate=value=>{try{days(value,value);return false;}catch{return true;}};
const syntaxError=/^JSON syntax error at line (\d+), column (\d+)$/;

function invalidGrades(text,mode){
 const lines=String(text??"").split(/\n/).filter(line=>line.trim());
 if(!lines.length)return true;
 return lines.some(line=>{
  const [grade,credits,...extra]=line.split(",").map(value=>value.trim());
  if(extra.length||!grade||!credits||!numeric(credits)||Number(credits)<=0)return true;
  // Validate the grade with unit weight; aggregate overflow is a form error.
  try{gradeBreakdown(grade+",1",mode==="scale4"?"gpa":"percentage");return false;}catch{return true;}
 });
}

export function errorFields(tool,error,data={}){
 data=data&&typeof data==="object"?data:{};
 const code=String(error?.message||"");
 if(tool==="json")return code==="empty"||syntaxError.test(code)||error?.code==="json-too-large"?["text"]:[];
 if(tool==="stats"&&error?.code==="statistics-too-large")return ["numbers"];
 if(tool==="demographics"&&(code==="demographics-too-large"||error?.code==="demographics-too-large"))return ["shares"];
 if(tool==="demographics"&&code==="number"){
  const fields=[];
  if(has(data,"total")&&(!numeric(data.total)||Number(data.total)<0))fields.push("total");
  if(has(data,"shares")){try{demographics(0,data.shares);}catch{fields.push("shares");}}
  return fields;
 }
 if(tool==="water"&&code==="number"){
  const fields=["weightKg","lowMlPerKg","highMlPerKg","activityFactor","climateFactor"].filter(key=>has(data,key)&&(!numeric(data[key])||Number(data[key])<=0));
  if(numeric(data.weightKg)&&Number(data.weightKg)>500)fields.push("weightKg");
  if(has(data,"extraMl")&&(!numeric(data.extraMl)||Number(data.extraMl)<-2000||Number(data.extraMl)>5000))fields.push("extraMl");
  if(numeric(data.lowMlPerKg)&&numeric(data.highMlPerKg)&&Number(data.lowMlPerKg)>Number(data.highMlPerKg))fields.push("lowMlPerKg","highMlPerKg");
  return [...new Set(fields)];
 }
 if(tool==="gpa")return code==="number"&&["scale4","percentage"].includes(data.mode)&&has(data,"grades")&&invalidGrades(data.grades,data.mode)?["grades"]:[];
 if(tool==="percent"){
  if(code==="zero")return data.mode==="as"?["b"]:data.mode==="change"?["a"]:[];
  if(code==="number"&&["of","as","change"].includes(data.mode))return ["a","b"].filter(key=>has(data,key)&&!numeric(data[key]));
  return [];
 }
 if(tool==="loan"&&code==="number"){
  const fields=["principal","annualRate"].filter(key=>has(data,key)&&(!numeric(data[key])||Number(data[key])<0));
  if(has(data,"term")&&(!numeric(data.term)||Number(data.term)<=0||!Number.isSafeInteger(Number(data.term)*12)))fields.push("term");
  return fields;
 }
 if(tool==="recipe"&&code==="number"&&["keep","small","large"].includes(data.recipeUnits))return ["fromServings","toServings"].filter(key=>has(data,key)&&(!numeric(data[key])||Number(data[key])<=0));
 if(tool==="color"&&code==="number"&&data.colorMode==="hex"&&has(data,"foreground")){
  try{normalizeHexColor(data.foreground);}catch{return ["foreground"];}
  return [];
 }
 if(tool==="dates"&&code==="date"){
  const fields=data.mode==="annual"?["end"]:data.mode==="difference"?["start","end"]:[];
  return fields.filter(key=>has(data,key)&&invalidDate(data[key]));
 }
 if(tool==="age")return code==="future"?["birth"]:code==="date"&&has(data,"birth")&&invalidDate(data.birth)?["birth"]:[];
 if(tool==="pregnancy")return code==="future"?["inputDate"]:code==="date"&&has(data,"inputDate")&&invalidDate(data.inputDate)?["inputDate"]:[];
 if(tool==="hash")return code==="number"&&data.file?.name&&Number.isFinite(data.file.size)&&data.file.size>25000000?["file"]:[];
 if(tool==="password"&&code==="number"){
  if(data.passwordMode==="generate"&&has(data,"length")&&(!numeric(data.length)||!Number.isInteger(Number(data.length))||Number(data.length)<8||Number(data.length)>128))return ["length"];
  if(data.passwordMode==="check"&&has(data,"passwordInput")){
   if(typeof data.passwordInput!=="string"||!data.passwordInput)return ["passwordInput"];
   let count=0;for(const point of data.passwordInput)if(++count>128)return ["passwordInput"];
  }
  return [];
 }
 if(tool==="math"){
  if(!["add","subtract","multiply","divide","power","modulo","percentOf","sqrt","sin","cos","tan","log","ln","factorial"].includes(data.op))return [];
  if(code==="zero"&&["divide","modulo"].includes(data.op))return ["b"];
  if(code==="number"&&has(data,"a")&&!numeric(data.a))return ["a"];
  if(code==="number"&&["sqrt","log","ln","factorial"].includes(data.op)&&numeric(data.a)){
   const value=Number(data.a);
   if(data.op==="sqrt"&&value<0||["log","ln"].includes(data.op)&&value<=0||data.op==="factorial"&&(!Number.isInteger(value)||value<0||value>170))return ["a"];
  }
  return [];
 }
 if(tool==="temp"&&code==="absolute"&&["c","f"].includes(data.direction)&&has(data,"value"))return !numeric(data.value)||Number(data.value)<(data.direction==="c"?-273.15:-459.67)?["value"]:[];
 if(tool==="qibla"&&code==="coordinates")return ["lat","lon"].filter(key=>has(data,key)&&(!numeric(data[key])||Math.abs(Number(data[key]))>(key==="lat"?90:180)));
 if(tool==="morse"&&code==="morse"&&["text","morse"].includes(data.direction))return ["text"];
 if(tool==="roman"&&code==="number"&&["toRoman","fromRoman"].includes(data.mode))return ["value"];
 if(tool==="stats"&&code==="number"&&has(data,"numbers"))return String(data.numbers).trim().split(/[\s,;]+/).filter(Boolean).some(value=>!numeric(value))?["numbers"]:[];
 if(tool==="recipe"&&code==="recipe")return ["text"];
 if(code==="empty"){
  if(["token","text","qr","morse","recipe"].includes(tool))return ["text"];
  if(tool==="stats")return ["numbers"];
 }
 return [];
}

const descriptionTokens=node=>(node.getAttribute("aria-describedby")||"").split(/\s+/).filter(Boolean);
function linkDescription(node,id){
 const tokens=descriptionTokens(node);
 if(tokens.includes(id))return false;
 node.setAttribute("aria-describedby",[...tokens,id].join(" "));return true;
}
function eligible(control){
 if(!control.matches?.("input,select,textarea")||control.matches(":disabled")||control.type==="hidden"||control.closest("[hidden],[inert]"))return false;
 if(control.getClientRects().length===0)return false;
 const style=control.ownerDocument.defaultView?.getComputedStyle(control);
 return style?.visibility!=="hidden"&&style?.visibility!=="collapse";
}
function release(form,state,keepRegion){
 for(const {node,added} of state.links){
  if(!added)continue;
  const tokens=descriptionTokens(node).filter(token=>token!==state.id);
  if(tokens.length)node.setAttribute("aria-describedby",tokens.join(" "));else node.removeAttribute("aria-describedby");
 }
 for(const {control,previous} of state.controls){
  if(control.getAttribute("aria-invalid")!=="true")continue;
  if(previous===null)control.removeAttribute("aria-invalid");else control.setAttribute("aria-invalid",previous);
 }
 if(state.region!==keepRegion)state.region?.remove();
 states.delete(form);
}

export function attachFormError(form,messageNode,fields=[]){
 if(!form||!messageNode)return;
 const region=messageNode.closest(".result-error")||messageNode,previous=states.get(form);
 if(previous)release(form,previous,region);
 if(!messageNode.id){
  do{messageNode.id="calculator-error-"+(++nextErrorId);}while(messageNode.ownerDocument.getElementById(messageNode.id)!==messageNode&&messageNode.ownerDocument.getElementById(messageNode.id));
 }
 const id=messageNode.id,state={id,region,links:[{node:form,added:linkDescription(form,id)}],controls:[],names:new Set()};
 const requested=new Set(fields);
 for(const control of Array.from(form.elements)){
  if(!requested.has(control.name)||!eligible(control))continue;
  state.controls.push({control,previous:control.getAttribute("aria-invalid")});
  state.links.push({node:control,added:linkDescription(control,id)});
  state.names.add(control.name);control.setAttribute("aria-invalid","true");
 }
 states.set(form,state);state.controls[0]?.control.focus();
}

const contextFields=new Set(["mode","op","direction","format","colorMode","passwordMode","encoding","group","unit","method","recipeUnits"]);
export function clearFormError(form,changedName){
 if(!form)return false;
 const state=states.get(form);if(!state)return false;
 if(changedName&&state.names.size&&!state.names.has(changedName)){
  const control=form.elements.namedItem(changedName);
  if(!contextFields.has(changedName)||control?.tagName!=="SELECT")return false;
 }
 release(form,state);return true;
}

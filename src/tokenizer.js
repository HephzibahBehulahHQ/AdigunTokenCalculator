import {getTiktoken} from "./tokenizer-runtime.js";
const loaders={
  cl100k_base:()=>import("tiktoken/encoders/cl100k_base"),
  o200k_base:()=>import("tiktoken/encoders/o200k_base")
};
const encoders=new Map();
async function getEncoder(name){
  if(!Object.hasOwn(loaders,name))throw Error("encoding");
  if(!encoders.has(name)){
    const pending=Promise.all([getTiktoken(),loaders[name]()]).then(([Tiktoken,{default:data}])=>
      new Tiktoken(data.bpe_ranks,data.special_tokens,data.pat_str));
    encoders.set(name,pending);
    pending.catch(()=>{if(encoders.get(name)===pending)encoders.delete(name);});
  }
  return encoders.get(name);
}
export async function tokenize(text,name){
  if(typeof text!=="string")throw Error("text");
  const encoder=await getEncoder(name),ids=encoder.encode(text,[],[]),decoder=new TextDecoder("utf-8");
  // Public byte API: tokens may split a UTF-8 character. Decode their bytes as
  // one stream so the rendered pieces reconstruct the original Unicode text.
  const pieces=Array.from(ids,id=>decoder.decode(encoder.decode_single_token_bytes(id),{stream:true}));
  const tail=decoder.decode();if(tail)pieces.push(tail);
  if(pieces.join("")!==text)throw Error("token reconstruction check failed");
  return{ids:Array.from(ids),pieces,chars:[...text].length};
}
export const modelMappings=Object.freeze({"GPT-4o":"o200k_base","GPT-4o mini":"o200k_base","GPT-4":"cl100k_base","GPT-3.5 Turbo":"cl100k_base"});
export const encodings=[["o200k_base","GPT-4o / GPT-4o mini · o200k_base"],["cl100k_base","GPT-4 / GPT-3.5 Turbo · cl100k_base"]];

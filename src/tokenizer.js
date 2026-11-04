import {Tiktoken} from "js-tiktoken/lite";
const loaders={
  cl100k_base:()=>import("js-tiktoken/ranks/cl100k_base"),
  o200k_base:()=>import("js-tiktoken/ranks/o200k_base")
};
const encoders=new Map();
export async function tokenize(text,name){
  const load=loaders[name];if(!load)throw Error("encoding");
  if(!encoders.has(name)){const module=await load();encoders.set(name,new Tiktoken(module.default));}
  const e=encoders.get(name);
  // js-tiktoken 1.0.21 stores each token's bytes in its protected textMap.
  // The package is pinned; fail closed if this internal adapter changes.
  const byteMap=e["textMap"];if(!(byteMap instanceof Map))throw Error("token byte adapter unavailable");
  const ids=e.encode(text,[],[]),decoder=new TextDecoder("utf-8"),pieces=ids.map(id=>{const bytes=byteMap.get(id);if(!bytes)throw Error("token bytes unavailable");return decoder.decode(bytes,{stream:true});});
  const tail=decoder.decode();if(tail)pieces.push(tail);
  if(pieces.join("")!==text)throw Error("token reconstruction check failed");
  return{ids:Array.from(ids),pieces,chars:[...text].length};
}
export const modelMappings=Object.freeze({"GPT-4o":"o200k_base","GPT-4o mini":"o200k_base","GPT-4":"cl100k_base","GPT-3.5 Turbo":"cl100k_base"});
export const encodings=[["o200k_base","GPT-4o / GPT-4o mini"],["cl100k_base","GPT-4 / GPT-3.5 Turbo"]];

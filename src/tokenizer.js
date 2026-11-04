import {Tiktoken} from "js-tiktoken/lite";
import cl100k from "js-tiktoken/ranks/cl100k_base";
import o200k from "js-tiktoken/ranks/o200k_base";
const enc={cl100k_base:new Tiktoken(cl100k),o200k_base:new Tiktoken(o200k)};
export function tokenize(text,name){
  const e=enc[name];if(!e)throw Error("encoding");
  // js-tiktoken exposes decoded token bytes through its protected textMap in 1.0.21.
  // Pin the package and fail closed if that implementation detail changes.
  const byteMap=e["textMap"];if(!(byteMap instanceof Map))throw Error("token byte adapter unavailable");
  const ids=e.encode(text,[],[]),decoder=new TextDecoder("utf-8"),pieces=ids.map(id=>{const bytes=byteMap.get(id);if(!bytes)throw Error("token bytes unavailable");return decoder.decode(bytes,{stream:true});});
  const tail=decoder.decode();if(tail)pieces.push(tail);
  if(pieces.join("")!==text)throw Error("token reconstruction check failed");
  return{ids:Array.from(ids),pieces,chars:[...text].length};
}
export const encodings=[["o200k_base","GPT-4o / GPT-4o mini"],["cl100k_base","GPT-4 / GPT-3.5 Turbo"]];

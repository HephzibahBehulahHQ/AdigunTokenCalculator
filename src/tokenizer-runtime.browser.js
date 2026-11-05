import {init,Tiktoken} from "tiktoken/lite/init";
import wasmUrl from "tiktoken/lite/tiktoken_bg.wasm?url";

let ready;
export function getTiktoken(){
  if(!ready){
    ready=(async()=>{
      const response=await fetch(wasmUrl);
      if(!response.ok)throw Error("tokenizer initialization");
      const bytes=await response.arrayBuffer();
      await init(imports=>WebAssembly.instantiate(bytes,imports));
      return Tiktoken;
    })().catch(error=>{ready=undefined;throw error;});
  }
  return ready;
}

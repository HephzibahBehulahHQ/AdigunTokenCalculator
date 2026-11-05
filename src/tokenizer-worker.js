import {tokenize} from "./tokenizer.js";

self.addEventListener("message",async event=>{
  const {id,payload}=event.data||{};
  try{
    const result=await tokenize(payload?.text,payload?.name);
    self.postMessage({id,ok:true,result});
  }catch{
    // Never echo private input, exception messages or stacks into diagnostics.
    self.postMessage({id,ok:false,error:"tokenizer unavailable"});
  }
});

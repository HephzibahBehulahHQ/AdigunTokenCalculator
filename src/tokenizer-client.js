import {createWorkerClient} from "./worker-client.js";
export {encodings,modelMappings} from "./tokenizer.js";

const client=createWorkerClient(
  ()=>new Worker(new URL("./tokenizer-worker.js",import.meta.url),{type:"module",name:"adigun-tokenizer"}),
  {sameRequest:(a,b)=>a.text===b.text&&a.name===b.name}
);
export const tokenize=(text,name)=>client.request({text,name});
export const cancelTokenization=()=>client.cancel();

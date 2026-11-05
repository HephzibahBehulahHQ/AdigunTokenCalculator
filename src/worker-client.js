const aborted=()=>{const error=Error("Calculation superseded");error.name="AbortError";return error;};
const resultError=value=>{
  const error=Error(typeof value==="string"?value:typeof value?.message==="string"?value.message:"worker unavailable");
  if(typeof value?.code==="string")error.code=value.code;
  return error;
};

// Run one request and retain only the latest queued edit. Equality is supplied
// by callers to avoid serializing or logging potentially large private input.
export function createWorkerClient(createWorker,{sameRequest=(a,b)=>a===b}={}){
  let worker=null,active=null,queued=null,nextId=0;
  function fail(error){
    const old=worker;worker=null;old?.terminate();
    active?.reject(error);queued?.reject(error);active=null;queued=null;
  }
  function start(task){
    active=task;
    try{
      if(!worker){
        const created=createWorker();worker=created;
        created.addEventListener("message",event=>{
          if(worker!==created||!active||event.data?.id!==active.id)return;
          const done=active;active=null;
          if(event.data.ok===true)done.resolve(event.data.result);
          else done.reject(resultError(event.data.error));
          if(queued){const next=queued;queued=null;start(next);}
        });
        const failed=event=>{if(worker!==created)return;event.preventDefault?.();fail(Error("worker unavailable"));};
        created.addEventListener("error",failed);
        created.addEventListener("messageerror",failed);
      }
      worker.postMessage({id:task.id,payload:task.payload});
    }catch(cause){
      const error=Error("worker unavailable");
      if(typeof cause?.code==="string")error.code=cause.code;
      fail(error);
    }
  }
  return{
    request(payload){
      if(active&&sameRequest(active.payload,payload)){
        queued?.reject(aborted());queued=null;return active.promise;
      }
      if(queued&&sameRequest(queued.payload,payload))return queued.promise;
      const task={id:++nextId,payload};
      task.promise=new Promise((resolve,reject)=>{task.resolve=resolve;task.reject=reject;});
      if(active){queued?.reject(aborted());queued=task;}else start(task);
      return task.promise;
    },
    cancel(){fail(aborted());}
  };
}

import {OFFLINE_COPY} from "./offline-i18n.js";

const noop={setLanguage(){},dispose(){}};

/** Production-only application-asset caching; never receives calculator state. */
export function mountOfflineStatus(container,{language="en",enabled=import.meta.env?.PROD??false,base=import.meta.env?.BASE_URL??"/"}={}){
  if(!enabled||!container)return noop;
  const document=container.ownerDocument,window=document.defaultView,serviceWorker=window.navigator.serviceWorker;
  const section=document.createElement("section"),status=document.createElement("p"),actions=document.createElement("div");
  const retry=document.createElement("button"),reload=document.createElement("button");
  section.className="offline-status";status.className="notice";status.setAttribute("role","status");
  status.setAttribute("aria-live","polite");status.setAttribute("aria-atomic","true");actions.className="actions";
  for(const button of [retry,reload]){button.type="button";button.className="secondary";actions.append(button);}
  retry.dataset.offlineAction="retry";reload.dataset.offlineAction="reload";
  section.append(status,actions);container.append(section);
  let state="preparing",disposed=false,registration,sequence=0,updating=false,timer;
  const cleanup=[];
  const expected=document.querySelector('meta[name="adigun-offline-build"]')?.content;
  const scope=new URL(base,window.location.origin),workerURL=new URL("offline-sw.js",scope).href;
  const isOwnWorker=worker=>worker?.scriptURL===workerURL;
  const draw=()=>{
    const copy=OFFLINE_COPY[language]||OFFLINE_COPY.en;
    section.dataset.offlineState=state;status.textContent=copy[state];
    retry.textContent=copy.retry;reload.textContent=copy.reload;
    retry.hidden=state!=="error";reload.hidden=!["update","blocked"].includes(state);
    actions.hidden=retry.hidden&&reload.hidden;
  };
  const setState=value=>{if(!disposed){state=value;draw();}};
  const listen=(target,type,listener)=>{
    target.addEventListener(type,listener);cleanup.push(()=>target.removeEventListener(type,listener));
  };
  const message=(worker,type)=>new Promise((resolve,reject)=>{
    const channel=new window.MessageChannel();
    const timeout=window.setTimeout(()=>{channel.port1.close();reject(new Error("Offline worker did not respond"));},90000);
    channel.port1.onmessage=event=>{window.clearTimeout(timeout);channel.port1.close();resolve(event.data);};
    try{worker.postMessage({type},[channel.port2]);}
    catch(error){window.clearTimeout(timeout);channel.port1.close();reject(error);}
  });
  const refresh=async()=>{
    const request=++sequence;
    if(disposed||updating)return;
    try{
      if(registration?.waiting){setState("update");return;}
      const controller=serviceWorker.controller;
      if(!isOwnWorker(controller)){setState("preparing");return;}
      const result=await message(controller,"CHECK");
      if(disposed||request!==sequence||updating)return;
      if(registration?.waiting){setState("update");return;}
      if(result.version!==expected){setState(result.ok&&result.ready?"update":"error");return;}
      setState(result.ok&&result.ready?"ready":"error");
    }catch{if(request===sequence&&!updating)setState("error");}
  };
  const watched=new WeakSet();
  const watch=worker=>{
    if(!worker||watched.has(worker))return;
    watched.add(worker);
    listen(worker,"statechange",()=>{
      if(worker.state==="redundant"&&!isOwnWorker(serviceWorker.controller)){setState("error");return;}
      void refresh();
    });
  };
  const start=async()=>{
    setState("preparing");
    window.clearTimeout(timer);
    timer=window.setTimeout(()=>{if(state==="preparing")setState("error");},120000);
    try{
      registration=await serviceWorker.register(workerURL,{scope:scope.href,updateViaCache:"none"});
      if(disposed)return;
      listen(registration,"updatefound",()=>{watch(registration.installing);void refresh();});
      watch(registration.installing);watch(registration.waiting);watch(registration.active);
      if(isOwnWorker(serviceWorker.controller))await message(serviceWorker.controller,"PREPARE");
      await refresh();
    }catch{setState("error");}
  };
  const applyUpdate=async()=>{
    if(updating||disposed)return;
    updating=true;setState("updating");
    let stopWaiting=()=>{};
    try{
      const waiting=registration?.waiting;
      if(waiting){
        const controlled=new Promise((resolve,reject)=>{
          const previous=serviceWorker.controller;
          const changed=()=>{if(isOwnWorker(serviceWorker.controller)&&serviceWorker.controller!==previous){stopWaiting();resolve();}};
          const timeout=window.setTimeout(()=>{stopWaiting();reject(new Error("Update did not activate"));},90000);
          stopWaiting=()=>{window.clearTimeout(timeout);serviceWorker.removeEventListener("controllerchange",changed);};
          serviceWorker.addEventListener("controllerchange",changed);
        });
        // Attach the rejection handler immediately even if activation is blocked.
        const resultPromise=controlled.then(()=>true,()=>false);
        const result=await message(waiting,"ACTIVATE");
        if(result.blocked){stopWaiting();updating=false;setState("blocked");return;}
        if(!result.ok){stopWaiting();throw new Error("Update unavailable");}
        if(!await resultPromise)throw new Error("Update did not activate");
      }
      // This is the sole reload path: it runs only after the labelled button.
      window.location.reload();
    }catch{stopWaiting();updating=false;setState("error");}
  };
  listen(retry,"click",()=>{void start();});listen(reload,"click",()=>{void applyUpdate();});
  draw();
  if(!serviceWorker||!window.isSecureContext||!expected||!window.MessageChannel){setState("unsupported");}
  else{
    listen(serviceWorker,"controllerchange",()=>{void refresh();});
    listen(document,"visibilitychange",()=>{if(document.visibilityState==="visible")void refresh();});
    listen(window,"online",()=>{void refresh();});
    listen(window,"offline",()=>{void refresh();});
    void start();
  }
  return {
    setLanguage(value){language=value;draw();},
    dispose(){disposed=true;sequence++;window.clearTimeout(timer);for(const remove of cleanup)remove();section.remove();}
  };
}

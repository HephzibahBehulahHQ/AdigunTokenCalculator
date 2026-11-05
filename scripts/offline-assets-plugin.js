import {createHash} from "node:crypto";
import {existsSync,readFileSync,readdirSync} from "node:fs";
import {join,relative,sep} from "node:path";

export const OFFLINE_WORKER_FILE="offline-sw.js";
export const OFFLINE_CACHE_PREFIX="adigun-token-calculator:offline:";
const hash=source=>createHash("sha256").update(source).digest("hex");

// This function is serialized into a classic service worker. It has no access
// to application state: its only write inputs are this build's asset manifest.
function offlineWorkerRuntime(config){
  const scope=new URL(self.registration.scope);
  const prefix=config.cachePrefix+encodeURIComponent(scope.pathname)+":";
  const cacheName=prefix+config.version;
  const manifest=new Map(config.assets.map(asset=>[new URL(asset.path,scope).href,asset.sha256]));
  const indexURL=new URL("index.html",scope).href;
  let preparing;
  const ownedNames=async()=>(await caches.keys()).filter(name=>name.startsWith(prefix));
  const valid=async(response,expected)=>{
    if(!response?.ok||response.type==="opaque")return false;
    const digest=await crypto.subtle.digest("SHA-256",await response.clone().arrayBuffer());
    return [...new Uint8Array(digest)].map(byte=>byte.toString(16).padStart(2,"0")).join("")===expected;
  };
  const complete=async()=>{
    if(!(await caches.has(cacheName)))return false;
    const cache=await caches.open(cacheName);
    for(const [url,digest] of manifest)if(!await valid(await cache.match(url),digest))return false;
    return true;
  };
  const prepare=()=>{
    if(preparing)return preparing;
    preparing=(async()=>{
      const existed=await caches.has(cacheName),cache=await caches.open(cacheName),pending=[];
      try{
        for(const [url,digest] of manifest){
          if(await valid(await cache.match(url),digest))continue;
          const response=await fetch(new Request(url,{cache:"no-store",credentials:"omit",redirect:"error"}));
          if(!await valid(response,digest))throw new Error("Application asset unavailable or version mismatch");
          pending.push([url,response]);
        }
        for(const [url,response] of pending)await cache.put(url,response);
        if(!await complete())throw new Error("Application cache incomplete");
      }catch(error){
        // An incomplete new build must never replace the last working build.
        if(!existed)await caches.delete(cacheName);
        throw error;
      }
    })().finally(()=>{preparing=undefined;});
    return preparing;
  };
  self.addEventListener("install",event=>event.waitUntil(prepare()));
  self.addEventListener("activate",event=>event.waitUntil((async()=>{
    await prepare();
    // Keep one previous version for an old page's lazy imports during an
    // explicitly requested update. Never delete another app's caches.
    const old=(await ownedNames()).filter(name=>name!==cacheName);
    for(const name of old.slice(0,-1))await caches.delete(name);
    await self.clients.claim();
  })()));
  self.addEventListener("fetch",event=>{
    const request=event.request,url=new URL(request.url);
    if(request.method!=="GET"||url.origin!==scope.origin)return;
    const navigation=request.mode==="navigate"&&(url.pathname===scope.pathname||url.href.split(/[?#]/)[0]===indexURL);
    if(navigation){
      // Routes live in the hash. Queries and visited URLs are never cache keys.
      event.respondWith((async()=>{
        const cached=await (await caches.open(cacheName)).match(indexURL);
        return cached||fetch(new Request(indexURL,{credentials:"omit",cache:"no-store",redirect:"error"}));
      })());
      return;
    }
    if(url.search||url.hash||!url.pathname.startsWith(scope.pathname))return;
    if(manifest.has(url.href)){
      event.respondWith((async()=>{
        const cache=await caches.open(cacheName),cached=await cache.match(url.href);
        if(cached)return cached;
        const response=await fetch(new Request(url.href,{credentials:"omit",cache:"no-store",redirect:"error"}));
        if(!await valid(response,manifest.get(url.href)))throw new Error("Application asset version mismatch");
        await cache.put(url.href,response.clone());
        return response;
      })());
    }else if(url.pathname.startsWith(new URL("assets/",scope).pathname)){
      // Read-only fallback for an older open page; unknown requests are never
      // written. Retained keys were created only from an earlier build manifest.
      event.respondWith((async()=>{
        for(const name of (await ownedNames()).reverse()){
          const cached=await (await caches.open(name)).match(url.href);
          if(cached)return cached;
        }
        return fetch(request);
      })());
    }
  });
  self.addEventListener("message",event=>{
    const port=event.ports?.[0],type=event.data?.type;
    if(!port||!["CHECK","PREPARE","ACTIVATE"].includes(type))return;
    const sourceURL=event.source?.url&&new URL(event.source.url);
    if(!sourceURL||sourceURL.origin!==scope.origin||!sourceURL.pathname.startsWith(scope.pathname))return;
    event.waitUntil((async()=>{
      try{
        if(type==="PREPARE")await prepare();
        if(type==="ACTIVATE"){
          const windows=(await self.clients.matchAll({type:"window",includeUncontrolled:true})).filter(client=>{
            const url=new URL(client.url);return url.origin===scope.origin&&url.pathname.startsWith(scope.pathname);
          });
          if(windows.length>1){port.postMessage({ok:false,blocked:true,version:config.version});return;}
          if(!await complete())throw new Error("Application cache incomplete");
          await self.skipWaiting();
        }
        port.postMessage({ok:true,ready:await complete(),version:config.version});
      }catch{port.postMessage({ok:false,ready:false,version:config.version});}
    })());
  });
}

export function renderOfflineWorker(config){
  return `/* Application assets only. Generated at build time. */\n(${offlineWorkerRuntime.toString()})(${JSON.stringify(config)});\n`;
}

export function offlineAssetsPlugin(){
  let config;
  return {
    name:"adigun-offline-assets",apply:"build",enforce:"post",
    configResolved(resolved){config=resolved;},
    generateBundle:{order:"post",handler(_options,bundle){
      const assets=new Map();
      if(config.build.copyPublicDir!==false&&config.publicDir&&existsSync(config.publicDir)){
        const readDirectory=directory=>{
          for(const entry of readdirSync(directory,{withFileTypes:true})){
            const path=join(directory,entry.name);
            if(entry.isDirectory())readDirectory(path);
            else if(entry.isFile())assets.set(relative(config.publicDir,path).split(sep).join("/"),readFileSync(path));
          }
        };
        readDirectory(config.publicDir);
      }
      for(const [path,entry] of Object.entries(bundle))assets.set(path,entry.type==="chunk"?entry.code:entry.source);
      if(assets.has(OFFLINE_WORKER_FILE))this.error(`${OFFLINE_WORKER_FILE} is reserved for the generated offline worker`);
      if(!bundle["index.html"]||bundle["index.html"].type!=="asset")this.error("Offline preparation requires the built index.html");
      for(const path of assets.keys())if(path.startsWith("/")||path.split("/").includes("..")||/[?#\\]/.test(path))this.error("Unsafe offline asset path");
      const ordered=[...assets].sort(([a],[b])=>a.localeCompare(b));
      const version=hash(JSON.stringify(ordered.map(([path,source])=>[path,hash(source)]))).slice(0,24);
      const html=String(bundle["index.html"].source);
      if(!/<head\b[^>]*>/i.test(html))this.error("Offline preparation requires an HTML head element");
      const marked=html.replace(/<head\b[^>]*>/i,match=>`${match}<meta name="adigun-offline-build" content="${version}">`);
      bundle["index.html"].source=marked;
      assets.set("index.html",marked);
      const manifest={version,cachePrefix:OFFLINE_CACHE_PREFIX,assets:[...assets].sort(([a],[b])=>a.localeCompare(b)).map(([path,source])=>({path,sha256:hash(source)}))};
      this.emitFile({type:"asset",fileName:OFFLINE_WORKER_FILE,source:renderOfflineWorker(manifest)});
    }}
  };
}

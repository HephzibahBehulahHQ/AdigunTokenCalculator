import {defineConfig} from "vite";
import {readFileSync} from "node:fs";
const notices=()=>readFileSync(new URL("./THIRD_PARTY_NOTICES.md",import.meta.url),"utf8");
export default defineConfig({
  plugins:[{
    name:"third-party-notices",
    generateBundle(){this.emitFile({type:"asset",fileName:"THIRD_PARTY_NOTICES.txt",source:notices()});},
    configureServer(server){server.middlewares.use((req,res,next)=>{
      if(req.url?.split("?")[0].endsWith("/THIRD_PARTY_NOTICES.txt")){
        res.setHeader("Content-Type","text/plain; charset=utf-8");res.end(notices());return;
      }
      next();
    });}
  }],
  // GitHub Pages project-site URL: https://<owner>.github.io/AdigunTokenCalculator/
  base: "/AdigunTokenCalculator/"
});

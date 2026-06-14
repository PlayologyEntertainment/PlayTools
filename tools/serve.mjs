// Serve the PlayTools app locally so the in-app 3D Rig viewer resolves three.js
// (from node_modules) and the assets/rig models.
//
//   npm run serve   → http://127.0.0.1:8133/PlayTools.html
//
// Maps /three/ and /jsm/ to the installed three package and serves everything
// else (PlayTools.html, assets/, tools/, audio, images) from the repo root.
// Without this, the app still runs when opened directly — it just falls back to
// the procedural SVG battlestation. Stays running until Ctrl-C.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PORT = +(process.env.PORT || 8133);

const TM = { '.html':'text/html','.js':'text/javascript','.mjs':'text/javascript',
  '.json':'application/json','.glb':'model/gltf-binary','.wasm':'application/wasm',
  '.hdr':'image/vnd.radiance','.exr':'application/octet-stream','.bin':'application/octet-stream',
  '.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml',
  '.mp3':'audio/mpeg','.ktx2':'application/octet-stream','.css':'text/css','.ico':'image/x-icon' };

function resolve(url){
  const p = decodeURIComponent(url.split('?')[0]);
  if (p === '/' || p === '') return path.join(ROOT, 'PlayTools.html');
  if (p.startsWith('/three/')) return path.join(ROOT, 'node_modules/three/build', p.slice(7));
  if (p.startsWith('/jsm/'))   return path.join(ROOT, 'node_modules/three/examples/jsm', p.slice(5));
  return path.join(ROOT, p.slice(1));
}

http.createServer((req,res)=>{
  const fp = resolve(req.url);
  fs.readFile(fp,(e,buf)=>{ if(e){ res.writeHead(404); res.end('not found: '+req.url); return; }
    res.writeHead(200,{'content-type':TM[path.extname(fp)]||'application/octet-stream','cache-control':'no-store'}); res.end(buf); });
}).listen(PORT,'127.0.0.1',()=>{
  console.log(`\n  PlayTools → http://127.0.0.1:${PORT}/PlayTools.html\n  (The Rig at #/rig renders in 3D when served this way. Ctrl-C to stop.)`);
  if(!fs.existsSync(path.join(ROOT,'node_modules/three/build/three.module.js')))
    console.log(`\n  ⚠ three.js not found in node_modules — run "npm install" first,\n    or The Rig will fall back to the SVG battlestation.`);
  console.log('');
});

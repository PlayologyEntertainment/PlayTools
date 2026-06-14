// The Rig — interactive layout editor server.
//
//   npm run rig:edit            → serves the editor at http://127.0.0.1:8132
//
// Static server only (no headless browser): it serves tools/rig-editor.html plus
// three.js (from node_modules), the shared builder, and assets/rig. Open the URL
// in a real browser, adjust the scene/camera, then Export the manifest JSON and
// paste it back into assets/rig/rig_manifest.json. Stays running until Ctrl-C.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PORT = +(process.env.PORT || 8132);

const TM = { '.html':'text/html','.js':'text/javascript','.mjs':'text/javascript',
  '.json':'application/json','.glb':'model/gltf-binary','.wasm':'application/wasm',
  '.hdr':'image/vnd.radiance','.exr':'application/octet-stream','.bin':'application/octet-stream',
  '.png':'image/png','.jpg':'image/jpeg','.ktx2':'application/octet-stream' };

function resolve(url){
  const p = decodeURIComponent(url.split('?')[0]);
  if (p === '/' || p === '') return path.join(ROOT, 'tools/rig-editor.html');
  if (p.startsWith('/three/')) return path.join(ROOT, 'node_modules/three/build', p.slice(7));
  if (p.startsWith('/jsm/'))   return path.join(ROOT, 'node_modules/three/examples/jsm', p.slice(5));
  return path.join(ROOT, p.slice(1));   // /assets/…, /tools/…
}

http.createServer((req,res)=>{
  const fp = resolve(req.url);
  fs.readFile(fp,(e,buf)=>{ if(e){ res.writeHead(404); res.end('not found: '+req.url); return; }
    res.writeHead(200,{'content-type':TM[path.extname(fp)]||'application/octet-stream'}); res.end(buf); });
}).listen(PORT,'127.0.0.1',()=>{
  console.log(`\n  The Rig layout editor → http://127.0.0.1:${PORT}\n  (orbit/zoom to frame the camera, tweak parts, Export the manifest. Ctrl-C to stop.)\n`);
});

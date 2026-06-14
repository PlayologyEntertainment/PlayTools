// Rig 3D preview — renders the manifest-driven battlestation scene to a PNG.
//
//   npm run rig:preview            → tools/output/rig.png  (all owned/modelled parts)
//   node tools/rig-preview.mjs out.png "hero" "chair"      → custom out / cam / owned-set
//
// Serves three.js + addons from node_modules and assets/rig from the repo, then
// drives a headless Chromium (software WebGL) to screenshot the scene. This is a
// dev tool for iterating on asset placement; it does not touch the shipped app.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = fileURLToPath(new URL('..', import.meta.url));         // repo root
const args = process.argv.slice(2);
const getf = (n,d)=>{ const a=args.find(x=>x.startsWith('--'+n+'=')); return a?a.slice(n.length+3):d; };
const contact = args.includes('--contact');
const own = getf('own', null);
const out = getf('out', path.join(ROOT, contact ? 'tools/output/rig_contact.png' : 'tools/output/rig.png'));
fs.mkdirSync(path.dirname(out), { recursive: true });

const TM = { '.html':'text/html','.js':'text/javascript','.mjs':'text/javascript',
  '.json':'application/json','.glb':'model/gltf-binary','.wasm':'application/wasm',
  '.hdr':'image/vnd.radiance','.exr':'application/octet-stream','.bin':'application/octet-stream',
  '.png':'image/png','.jpg':'image/jpeg','.ktx2':'application/octet-stream' };

// Map URL prefixes to disk locations (no vendoring; pulled live from node_modules).
function resolve(url){
  const p = decodeURIComponent(url.split('?')[0]);
  if (p === '/' || p === '') return path.join(ROOT, 'tools/rig-scene.html');
  if (p.startsWith('/three/')) return path.join(ROOT, 'node_modules/three/build', p.slice(7));
  if (p.startsWith('/jsm/'))   return path.join(ROOT, 'node_modules/three/examples/jsm', p.slice(5));
  if (p.startsWith('/assets/'))return path.join(ROOT, p.slice(1));
  return path.join(ROOT, p.slice(1));
}
const server = http.createServer((req,res)=>{
  const fp = resolve(req.url);
  fs.readFile(fp,(e,buf)=>{ if(e){ res.writeHead(404); res.end('not found: '+req.url); return; }
    res.writeHead(200,{'content-type':TM[path.extname(fp)]||'application/octet-stream'}); res.end(buf); });
});
await new Promise(r=> server.listen(8131,'127.0.0.1',r));

const GL = ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader',
  '--ignore-gpu-blocklist','--enable-webgl','--enable-webgl2','--in-process-gpu'];
let browser;
try { browser = await chromium.launch({ headless:true, args:GL }); }
catch { const s=(await import('@sparticuz/chromium')).default;
  browser = await chromium.launch({ headless:true, executablePath: await s.executablePath(), args:[...s.args, ...GL] }); }

const W=1100, H=850;
const page = await browser.newPage({ viewport:{ width:W, height:H } });
const errs=[]; page.on('pageerror',e=>errs.push('ERR '+(e.stack||e.message)));
page.on('console',m=>{ if(m.type()==='error') errs.push('c:'+m.text()); });
page.on('response',r=>{ if(r.status()>=400) errs.push('HTTP'+r.status()+' '+r.url()); });

let url = `http://127.0.0.1:8131/?w=${W}&h=${H}`;
if (contact){ const files=fs.readdirSync(path.join(ROOT,'assets/rig/models')).filter(f=>/\.glb$/i.test(f)); url+=`&contact=1&models=${encodeURIComponent(files.join(','))}`; }
if (own != null) url += `&own=${encodeURIComponent(own)}`;
await page.goto(url, { waitUntil:'load' });
let ready=false; try { await page.waitForFunction('window.__ready===true',null,{ timeout:300000 }); ready=true; } catch(e){}
const sceneErr = await page.evaluate(()=>window.__err);
const dbg = await page.evaluate(()=>window.__dbg||{});
await page.waitForTimeout(300);
await page.screenshot({ path: out, timeout:300000 });
await browser.close(); server.close();
console.log(`rendered → ${out}  ready=${ready}  sceneErr=${sceneErr||'none'}`);
console.log('sizes [native WxHxD | final y]:'); for(const [k,v] of Object.entries(dbg)) console.log('  '+k+': '+JSON.stringify(v));
if (errs.length) console.log('errors:\n'+errs.slice(0,6).join('\n'));

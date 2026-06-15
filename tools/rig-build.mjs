// Shared scene builder for The Rig 3D battlestation.
//
// Single source of truth used by BOTH the headless preview (tools/rig-scene.html,
// `npm run rig:preview`) and the interactive editor (tools/rig-editor.html,
// `npm run rig:edit`). Keeping the placement/lighting here guarantees that what
// you tune in the editor is exactly what the renderer produces.
//
// Imported as an ES module from a page whose importmap resolves "three" +
// "three/addons/" (see the two HTML hosts).

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

// Asset base, resolved relative to this module's URL so it works both when served
// at the site root (dev) and when deployed in a sub-path (e.g. /experiments/PlayTools/).
export const A = new URL('../assets/rig/', import.meta.url).href;
export const TEAL = 0x16f2c8, MAG = 0xff3df0, VIO = 0x7c5cff;

// ---- lights + ground -------------------------------------------------------
export function buildLights(scene){
  scene.add(new THREE.AmbientLight(0x222838, 0.3));
  const key = new THREE.DirectionalLight(0xcfe0ff, 1.5); key.position.set(3,5,4);
  key.castShadow = true; key.shadow.mapSize.set(2048,2048); key.shadow.bias = -0.0004;
  Object.assign(key.shadow.camera,{near:0.5,far:30,left:-6,right:6,top:6,bottom:-6}); scene.add(key);
  const magL = new THREE.PointLight(MAG,9,12,2); magL.position.set(-2.4,1.5,1.4); scene.add(magL);
  const cyL  = new THREE.PointLight(TEAL,7,12,2); cyL.position.set(2.8,1.4,-0.4); scene.add(cyL);
  const vioL = new THREE.PointLight(VIO,5,14,2);  vioL.position.set(0,2.8,-2.6); scene.add(vioL);
  return { key, magL, cyL, vioL };
}
// Procedural light-brown shag carpet — fibrous strokes over a warm brown base.
export function carpetTex(){
  const c=document.createElement('canvas'); c.width=c.height=512; const x=c.getContext('2d');
  x.fillStyle='#a8814f'; x.fillRect(0,0,512,512);
  for(let i=0;i<26000;i++){ const px=Math.random()*512, py=Math.random()*512;
    const len=Math.random()*6+2, ang=Math.random()*Math.PI*2, sh=(Math.random()*60-30)|0;
    x.strokeStyle=`rgba(${168+sh},${129+sh},${79+sh},${Math.random()*0.5+0.3})`;
    x.lineWidth=Math.random()*1.5+0.5; x.beginPath(); x.moveTo(px,py); x.lineTo(px+Math.cos(ang)*len,py+Math.sin(ang)*len); x.stroke(); }
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.wrapS=t.wrapT=THREE.RepeatWrapping; return t;
}
// Procedural beige stucco — soft mottled blobs over a beige base.
export function stuccoTex(){
  const c=document.createElement('canvas'); c.width=c.height=512; const x=c.getContext('2d');
  x.fillStyle='#d9ccb0'; x.fillRect(0,0,512,512);
  for(let i=0;i<11000;i++){ const sh=(Math.random()*44-22)|0;
    x.fillStyle=`rgba(${217+sh},${204+sh},${176+sh},${Math.random()*0.5+0.18})`;
    x.beginPath(); x.arc(Math.random()*512,Math.random()*512,Math.random()*2.4+0.5,0,7); x.fill(); }
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.wrapS=t.wrapT=THREE.RepeatWrapping; return t;
}
// Procedural dark hardwood — warm planks with a subtle lengthwise grain (Floor Tier 2).
export function hardwoodTex(){
  const c=document.createElement('canvas'); c.width=c.height=512; const x=c.getContext('2d');
  const plankH=512/8;                                   // 8 planks per tile
  for(let p=0;p<8;p++){ const y=p*plankH; const base=24+((Math.random()*10)|0);
    x.fillStyle=`rgb(${base+14},${base+6},${base})`; x.fillRect(0,y,512,plankH);
    for(let i=0;i<70;i++){ const gy=y+Math.random()*plankH; const sh=(Math.random()*16-4)|0;
      x.strokeStyle=`rgba(${base+14+sh},${base+6+sh},${base+sh},${Math.random()*0.4+0.1})`;
      x.lineWidth=Math.random()*1.4+0.3; x.beginPath(); x.moveTo(0,gy); x.lineTo(512,gy+(Math.random()*4-2)); x.stroke(); }
    x.strokeStyle='rgba(0,0,0,0.55)'; x.lineWidth=2; x.beginPath(); x.moveTo(0,y); x.lineTo(512,y); x.stroke(); // seam
    const off=(p%2)*256; x.beginPath(); x.moveTo(off,y); x.lineTo(off,y+plankH); x.stroke(); }      // staggered butt-joints
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.wrapS=t.wrapT=THREE.RepeatWrapping; return t;
}
// Procedural neon floor tiles — dark glossy squares ruled by glowing seams. `glow`
// returns the emissive-only mask (black tiles, bright seams) so ONLY the seams light
// up; otherwise the full albedo (dark tile + lit seam). Floor Tier 3.
export function neonTileTex(glow){
  const c=document.createElement('canvas'); c.width=c.height=512; const x=c.getContext('2d');
  x.fillStyle = glow ? '#000000' : '#0a0e1e'; x.fillRect(0,0,512,512);
  const seam=x.createLinearGradient(0,0,512,512); seam.addColorStop(0,'#16f2c8'); seam.addColorStop(0.5,'#7c5cff'); seam.addColorStop(1,'#ff3df0');
  x.strokeStyle=seam; x.lineWidth=6; x.shadowColor='#16f2c8'; x.shadowBlur=glow?10:6;
  for(let i=0;i<=4;i++){ const p=i*128; x.beginPath(); x.moveTo(p,0); x.lineTo(p,512); x.stroke(); x.beginPath(); x.moveTo(0,p); x.lineTo(512,p); x.stroke(); }
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.wrapS=t.wrapT=THREE.RepeatWrapping; return t;
}
// Procedural exposed brick — staggered warm bricks over dark mortar (Wall Tier 2).
export function brickTex(){
  const c=document.createElement('canvas'); c.width=c.height=512; const x=c.getContext('2d');
  x.fillStyle='#2a211d'; x.fillRect(0,0,512,512);                 // mortar
  const rows=8, bh=512/rows, bw=512/4;
  for(let r=0;r<rows;r++){ const y=r*bh, off=(r%2)?-bw/2:0;
    for(let b=-1;b<5;b++){ const bx=off+b*bw; const sh=(Math.random()*30-12)|0;
      x.fillStyle=`rgb(${120+sh},${58+sh},${44+sh})`; x.fillRect(bx+3,y+3,bw-6,bh-6);
      for(let i=0;i<26;i++){ const sp=(Math.random()*24-12)|0;                       // speckle / weathering
        x.fillStyle=`rgba(${120+sp},${58+sp},${44+sp},0.5)`; x.fillRect(bx+3+Math.random()*(bw-6),y+3+Math.random()*(bh-6),2,2); } } }
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.wrapS=t.wrapT=THREE.RepeatWrapping; return t;
}
// Floor variants: 'floor_t1' shag carpet (default) · 'floor_t2' dark hardwood ·
// 'floor_t3' neon glass tiles. Unknown/absent → tier 1, so the editor/preview and
// older callers keep the original carpet.
export function buildFloor(scene, variant){
  variant = variant||'floor_t1'; let mat;
  if(variant==='floor_t2'){
    const tex=hardwoodTex(); tex.repeat.set(7,7); const bump=hardwoodTex(); bump.repeat.set(7,7);
    mat=new THREE.MeshStandardMaterial({map:tex,bumpMap:bump,bumpScale:0.02,roughness:0.55,metalness:0});
  } else if(variant==='floor_t3'){
    const tex=neonTileTex(false); tex.repeat.set(14,14); const em=neonTileTex(true); em.repeat.set(14,14);
    mat=new THREE.MeshStandardMaterial({map:tex,emissive:0xffffff,emissiveMap:em,emissiveIntensity:1.6,roughness:0.16,metalness:0.65});
  } else {
    const tex=carpetTex(); tex.repeat.set(24,24); const bump=carpetTex(); bump.repeat.set(24,24);
    mat=new THREE.MeshStandardMaterial({map:tex,bumpMap:bump,bumpScale:0.04,roughness:1,metalness:0});
  }
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60,60), mat);
  floor.rotation.x = -Math.PI/2; floor.receiveShadow = true; scene.add(floor); return floor;
}
// Wall variants: 'wall_t1' beige stucco (default) · 'wall_t2' exposed brick ·
// 'wall_t3' glowing synthwave mural. Unknown/absent → tier 1.
export function buildWall(scene, wc, variant){
  if(!wc) return null;
  variant = variant||'wall_t1';
  const w=wc.w??16, h=wc.h??5; let mat;
  if(variant==='wall_t2'){
    const tex=brickTex(); tex.repeat.set(Math.max(1,Math.round(w/2.4)), Math.max(1,Math.round(h/1.6)));
    const bump=brickTex(); bump.repeat.copy(tex.repeat);
    mat=new THREE.MeshStandardMaterial({map:tex,bumpMap:bump,bumpScale:0.04,roughness:0.9,metalness:0});
  } else if(variant==='wall_t3'){
    const tex=synthwaveTex();                                  // one mural across the wall (no tiling)
    mat=new THREE.MeshStandardMaterial({map:tex,emissive:0xffffff,emissiveMap:tex,emissiveIntensity:0.7,roughness:0.6,metalness:0});
  } else {
    const tex=stuccoTex(); tex.repeat.set(Math.max(1,Math.round(w/2.5)), Math.max(1,Math.round(h/2.5)));
    const bump=stuccoTex(); bump.repeat.copy(tex.repeat);
    // textured beige stucco: the map carries the colour, so don't tint with wc.color
    mat=new THREE.MeshStandardMaterial({map:tex,bumpMap:bump,bumpScale:0.015,roughness:0.95,metalness:0});
  }
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  wall.position.set(wc.x??0,h/2, wc.z??-2.3); wall.receiveShadow = true; scene.add(wall); return wall;
}

// ---- procedural textures + parts ------------------------------------------
export function synthwaveTex(){const c=document.createElement('canvas');c.width=1024;c.height=440;const x=c.getContext('2d');
  const sky=x.createLinearGradient(0,0,0,280);sky.addColorStop(0,'#1a0b3a');sky.addColorStop(1,'#3a1466');x.fillStyle=sky;x.fillRect(0,0,1024,280);x.fillStyle='#0a0820';x.fillRect(0,280,1024,160);
  for(let i=0;i<140;i++){x.fillStyle='rgba(255,255,255,'+Math.random()+')';x.fillRect(Math.random()*1024,Math.random()*230,1.4,1.4);}
  const cx=512,cy=280,r=140,sg=x.createLinearGradient(0,cy-r,0,cy+r);sg.addColorStop(0,'#ffe24a');sg.addColorStop(.5,'#ff5da2');sg.addColorStop(1,'#a02a8f');
  x.save();x.beginPath();x.arc(cx,cy,r,Math.PI,Math.PI*2);x.clip();x.fillStyle=sg;x.fillRect(cx-r,cy-r,r*2,r*2);x.fillStyle='#0a0820';for(let i=0;i<8;i++)x.fillRect(cx-r,cy+i*13,r*2,6-i*0.3);x.restore();
  x.strokeStyle='#ff2bd6';x.lineWidth=2;for(let i=-12;i<=12;i++){x.beginPath();x.moveTo(512+i*15,300);x.lineTo(512+i*140,440);x.stroke();}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}

// Wall-poster artwork — a neon "NETCOIN" grid print (procedural fallback; no sourced art).
export function posterTex(){const c=document.createElement('canvas');c.width=420;c.height=600;const x=c.getContext('2d');
  x.fillStyle='#0a0820';x.fillRect(0,0,420,600);
  const g=x.createLinearGradient(0,0,0,600);g.addColorStop(0,'#2a0e54');g.addColorStop(.55,'#5a166b');g.addColorStop(1,'#0a0820');x.fillStyle=g;x.fillRect(0,0,420,600);
  const cx=210,cy=250,r=120,sg=x.createLinearGradient(0,cy-r,0,cy+r);sg.addColorStop(0,'#ffe24a');sg.addColorStop(.5,'#ff5da2');sg.addColorStop(1,'#a02a8f');
  x.save();x.beginPath();x.arc(cx,cy,r,0,Math.PI*2);x.clip();x.fillStyle=sg;x.fillRect(cx-r,cy-r,r*2,r*2);x.fillStyle='#0a0820';for(let i=0;i<9;i++)x.fillRect(cx-r,cy+i*12,r*2,5-i*0.2);x.restore();
  x.strokeStyle='#16f2c8';x.lineWidth=2;for(let i=-10;i<=10;i++){x.beginPath();x.moveTo(210+i*22,360);x.lineTo(210+i*150,600);x.stroke();}
  for(let i=0;i<8;i++){const y=360+i*i*4;x.beginPath();x.moveTo(0,y);x.lineTo(420,y);x.stroke();}
  x.fillStyle='#ffd23d';x.font='bold 44px monospace';x.textAlign='center';x.fillText('NETCOIN',210,90);
  x.fillStyle='#ff3df0';x.font='16px monospace';x.fillText('// MINE  ·  STACK  ·  ASCEND',210,120);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}

// Procedural NetStore items (no .glb needed). Each returns an Object3D placed via place().
export const PROC = {
  // RGB Light Kit — an emissive strip that rims the desk's front edge plus a soft
  // under-desk floor wash. Bloom turns the strip into neon; point lights spill colour.
  rgb(e){const g=new THREE.Group(); const w=e.w??1.24, segs=e.segs??24;
    for(let i=0;i<segs;i++){ const t=i/(segs-1); const col=new THREE.Color().setHSL(0.5+0.45*Math.sin(t*Math.PI),1,0.6);
      const m=new THREE.Mesh(new THREE.BoxGeometry(w/segs*0.92,0.012,0.012),new THREE.MeshStandardMaterial({color:0x05060b,emissive:col,emissiveIntensity:1.0}));
      m.position.x=-w/2+w*t; g.add(m); }
    const teal=new THREE.PointLight(0x16f2c8,1.4,1.4,2.2); teal.position.set(-w*0.3,-0.3,-0.02);
    const mag=new THREE.PointLight(0xff3df0,1.4,1.4,2.2); mag.position.set(w*0.3,-0.3,-0.02);
    g.add(teal,mag); g.userData.noFloor=true; return g; },
  // Wall Poster — framed neon print, mounted flat on the back wall.
  poster(e){const w=e.w??0.62, h=e.h??0.88, tex=posterTex();
    const art=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:tex,emissive:0xffffff,emissiveMap:tex,emissiveIntensity:0.4,roughness:0.55,metalness:0}));
    const frame=new THREE.Mesh(new THREE.BoxGeometry(w+0.06,h+0.06,0.025),new THREE.MeshStandardMaterial({color:0x141c33,roughness:0.4,metalness:0.7}));
    art.position.z=0.015; const g=new THREE.Group(); g.add(frame,art); g.userData.noFloor=true; return g; }
};

// ---- model helpers ---------------------------------------------------------
export function makeLoader(){ const draco=new DRACOLoader(); draco.setDecoderPath('/jsm/libs/draco/');
  const loader=new GLTFLoader(); loader.setDRACOLoader(draco); loader.setMeshoptDecoder(MeshoptDecoder); return loader; }
export function meshify(model){ model.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } }); }
// Paint the synthwave display onto ONLY the screen surface. Match on screen/
// display/glass (in the mesh OR material name) — never the bare word "monitor",
// which also names the chassis/bezel mesh (e.g. CRT_Monitor_monitor_plastic_0)
// and would otherwise smear the texture over the whole housing.
export function applyScreen(model){ const t=synthwaveTex();
  model.traverse(o=>{ if(o.isMesh){ const n=(o.name||'')+' '+(o.material?.name||'');
    if(/screen|display|glass/i.test(n)){ o.material=o.material.clone(); o.material.map=t;
      o.material.emissive=new THREE.Color(0xffffff); o.material.emissiveMap=t; o.material.emissiveIntensity=1.1; } } }); }
// Self-illuminate a model from its own albedo so flat wall-art reads in the dark scene.
export function applyGlow(model,amt){ model.traverse(o=>{ if(o.isMesh && o.material){ o.material=o.material.clone(); if(o.material.map){ o.material.emissiveMap=o.material.map; o.material.emissive=new THREE.Color(0xffffff); } o.material.emissiveIntensity=amt; o.material.side=THREE.DoubleSide; } }); }

// place: scale (fitHeight|scale), rotate, recenter footprint to (pos.x,pos.z), base to pos.y.
// Idempotent — resets the model's transform first so it can be re-placed live (editor).
export function place(model, tf, id, dbg){
  tf = tf||{};
  model.position.set(0,0,0); model.rotation.set(0,0,0); model.scale.set(1,1,1);
  let box=new THREE.Box3().setFromObject(model), size=box.getSize(new THREE.Vector3());
  const nat=[+size.x.toFixed(3),+size.y.toFixed(3),+size.z.toFixed(3)];
  if(tf.fitHeight){ model.scale.setScalar(tf.fitHeight/size.y); }
  else if(tf.scale){ Array.isArray(tf.scale)?model.scale.set(...tf.scale):model.scale.setScalar(tf.scale); }
  if(tf.rotY) model.rotation.y=tf.rotY*Math.PI/180;
  if(tf.rotX) model.rotation.x=tf.rotX*Math.PI/180;
  const p=tf.pos||[0,0,0];
  if(model.userData.noFloor){ model.position.set(p[0],p[1],p[2]); }   // wall/under-desk items: absolute centre
  else {
    box=new THREE.Box3().setFromObject(model); const c=box.getCenter(new THREE.Vector3());
    model.position.x+=-c.x; model.position.z+=-c.z; model.position.y+=-box.min.y;
    model.position.x+=p[0]; model.position.y+=p[1]; model.position.z+=p[2];
  }
  box=new THREE.Box3().setFromObject(model); const fs=box.getSize(new THREE.Vector3());
  if(dbg) dbg[id]={native:nat, final:[+fs.x.toFixed(2),+fs.y.toFixed(2),+fs.z.toFixed(2)], y:+model.position.y.toFixed(2)};
  return box;
}

export async function setupEnv(scene, renderer, hdri){
  if(hdri){ try{
    const L = /\.exr$/i.test(hdri)? new EXRLoader() : new HDRLoader();
    const tex = await L.loadAsync(A+hdri); tex.mapping=THREE.EquirectangularReflectionMapping;
    scene.environment=tex; scene.environmentIntensity=0.35; return;   // lighting/reflections only — keep the room dark & neon
  }catch(e){ if(typeof window!=='undefined') window.__err=(window.__err||'')+'hdri:'+e.message+';'; } }
  const pm=new THREE.PMREMGenerator(renderer); scene.environment=pm.fromScene(new RoomEnvironment(),0.05).texture; scene.environmentIntensity=0.5;
}

// Resolve the owned set for a manifest (null ownParam = all non-alternate parts).
export function resolveOwned(man, ownParam){
  const parts = man.parts||{};
  return ownParam!=null
    ? new Set(ownParam? ownParam.split(',') : [])
    : new Set(Object.keys(parts).filter(k=>(parts[k].model||parts[k].proc) && parts[k].default!==false));
}

// Load + place the whole scene from a manifest. Returns placed records so callers
// (the editor) can keep live handles. `dbg` (optional) collects per-item sizes.
export async function buildScene(scene, renderer, loader, man, { ownParam=null, dbg=null, wall=null }={}){
  buildWall(scene, man.scene?.wall, wall);
  await setupEnv(scene, renderer, man.scene?.hdri);

  const parts = man.parts||{};
  const owned = resolveOwned(man, ownParam);
  const replaced = new Set(); owned.forEach(k=>{ if(parts[k]?.replaces) replaced.add(parts[k].replaces); });

  // 1) desk first, to find the desktop height
  const deskEntry = (owned.has('desk')&&parts.desk?.model)? parts.desk
    : (man.base||[]).find(b=>b.id==='desk_base' && b.model);
  let deskTop=0.75; const placed=[];
  if(deskEntry){ const g=await loader.loadAsync(A+deskEntry.model); meshify(g.scene);
    const box=place(g.scene, deskEntry.transform, 'desk', dbg); scene.add(g.scene); deskTop=box.max.y;
    placed.push({ id:'desk', obj:g.scene, entry:deskEntry, on:false }); }

  // 2) everything else; on:'desk' items sit at deskTop
  const items=[];
  (man.base||[]).forEach(b=>{ if(b.id==='desk_base'||replaced.has(b.id)||!b.model) return; items.push([b.id,b]); });
  owned.forEach(k=>{ const p=parts[k]; if(!p||(!p.model&&!p.proc)||k==='desk') return; items.push([k,p]); });

  for(const [id,e] of items){
    try{
      const tf=Object.assign({},e.transform); if(e.on==='desk'){ tf.pos=[...(tf.pos||[0,0,0])]; tf.pos[1]=deskTop+(tf.pos[1]||0); }
      let obj;
      if(e.proc){ obj=PROC[e.proc](tf); meshify(obj); place(obj,tf,id,dbg); }
      else { const g=await loader.loadAsync(A+e.model); obj=g.scene; meshify(obj); place(obj,tf,id,dbg); if(e.screen) applyScreen(obj); if(e.glow) applyGlow(obj,e.glow); }
      scene.add(obj); placed.push({ id, obj, entry:e, on:e.on==='desk' });
    }catch(err){ if(dbg) dbg[id]={error:String(err.message||err)}; if(typeof window!=='undefined') window.__err=(window.__err||'')+id+':'+err.message+';'; }
  }
  return { placed, deskTop };
}

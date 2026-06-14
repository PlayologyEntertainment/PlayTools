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
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';

export const A = '/assets/rig/';
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
export function buildFloor(scene){
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60,60), new THREE.MeshStandardMaterial({color:0x0a0c16,roughness:0.3,metalness:0.5}));
  floor.rotation.x = -Math.PI/2; floor.receiveShadow = true; scene.add(floor); return floor;
}
export function buildFloorStrips(scene){
  const g = new THREE.Group();
  for(let i=-4;i<=4;i++){ const s=new THREE.Mesh(new THREE.PlaneGeometry(0.04,18),new THREE.MeshBasicMaterial({color:i%2?MAG:TEAL,transparent:true,opacity:0.4}));
    s.rotation.x=-Math.PI/2; s.position.set(i*0.8,0.001,-2); g.add(s); }
  scene.add(g); return g;
}
export function buildWall(scene, wc){
  if(!wc) return null;
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(wc.w??16, wc.h??5), new THREE.MeshStandardMaterial({color:wc.color??0x0a0c1a,roughness:0.7,metalness:0.15}));
  wall.position.set(wc.x??0,(wc.h??5)/2, wc.z??-2.3); wall.receiveShadow = true; scene.add(wall); return wall;
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
  const loader=new GLTFLoader(); loader.setDRACOLoader(draco); return loader; }
export function meshify(model){ model.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } }); }
export function applyScreen(model){ const t=synthwaveTex(); model.traverse(o=>{ if(o.isMesh && /screen|display|monitor/i.test(o.name)){ o.material=o.material.clone(); o.material.map=t; o.material.emissive=new THREE.Color(0xffffff); o.material.emissiveMap=t; o.material.emissiveIntensity=1.1; } }); }
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
    const L = /\.exr$/i.test(hdri)? new EXRLoader() : new RGBELoader();
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
export async function buildScene(scene, renderer, loader, man, { ownParam=null, dbg=null }={}){
  buildFloorStrips(scene);
  buildWall(scene, man.scene?.wall);
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

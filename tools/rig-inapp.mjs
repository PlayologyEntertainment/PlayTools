// In-app mount for The Rig 3D battlestation.
//
// Lazy-imported by PlayTools.html on the #/rig route. Reuses the shared scene
// builder (tools/rig-build.mjs) so the in-game view matches the editor/preview
// exactly, and adds an OrbitControls camera + bloom for an interactive canvas.
//
// Requires the host page to (a) carry an importmap resolving "three" +
// "three/addons/", and (b) be served so /assets/rig and /three /jsm resolve.
// If either is missing the dynamic import throws and the caller keeps the SVG.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { A, buildLights, buildFloor, buildScene, makeLoader } from './rig-build.mjs';

// ownIds: array of owned manifest part ids (null = show the full default scene).
// floor / wall: equipped surface variant ids (e.g. 'floor_t2', 'wall_t3'); null = tier 1.
export async function mount(container, { ownIds=null, floor=null, wall=null }={}){
  const hostW = ()=> container.clientWidth || 640;
  const hostH = ()=> container.clientHeight || Math.round(hostW()*0.62);

  // preserveDrawingBuffer so the Share Card can read a still off the live canvas
  // (toDataURL/drawImage are otherwise blank on a cleared WebGL buffer).
  const renderer = new THREE.WebGLRenderer({ antialias:true, preserveDrawingBuffer:true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(hostW(), hostH());
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;  // PCFSoftShadowMap is deprecated (r184) and silently downgrades to this anyway
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.8;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene(); scene.background = new THREE.Color('#0b0816');
  buildLights(scene); buildFloor(scene, floor);
  const loader = makeLoader();

  const man = await (await fetch(A+'rig_manifest.json')).json();
  const cm = man.scene?.camera || {};
  const cam = new THREE.PerspectiveCamera(cm.fov||50, hostW()/hostH(), 0.1, 100);
  cam.position.set(...(cm.pos||[1.43,1.65,1.76]));
  const controls = new OrbitControls(cam, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.08; controls.enablePan = false;
  // Keep the camera in a front three-quarter window so players can't orbit around
  // to the unfinished sides/back of the room. Tunable from the manifest camera block
  // (all angles in radians); defaults frame the desk + back wall only.
  controls.minDistance = cm.minDist ?? 1.4; controls.maxDistance = cm.maxDist ?? 4.2;
  controls.minPolarAngle = cm.minPolar ?? Math.PI*0.18;   // can't drop fully top-down
  controls.maxPolarAngle = cm.maxPolar ?? Math.PI*0.5;    // can't dip below eye level (under the floor)
  controls.minAzimuthAngle = cm.minAz ?? -0.45;           // ~ -26°  (front-left limit)
  controls.maxAzimuthAngle = cm.maxAz ?? 1.5;             // ~  86°  (front-right limit)
  controls.target.set(...(cm.target||[0.14,1.19,-0.5]));

  await buildScene(scene, renderer, loader, man, { ownParam: ownIds==null? null : ownIds.join(','), dbg:null, wall });

  const composer = new EffectComposer(renderer); composer.setSize(hostW(), hostH());
  composer.addPass(new RenderPass(scene, cam));
  const bl = man.scene?.bloom || {};
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(hostW(),hostH()), bl.strength??0.25, bl.radius??0.5, bl.threshold??0.85));
  composer.addPass(new OutputPass());

  // Drive size off the canvas's current parent each frame (no ResizeObserver), so
  // the same canvas can be re-parented across re-paints without breaking layout.
  let alive = true, lw = 0, lh = 0;
  (function loop(){
    if(!alive) return; requestAnimationFrame(loop);
    const host = renderer.domElement.parentElement;
    if(host){ const w = host.clientWidth, h = host.clientHeight || Math.round(w*0.62);
      if(w && (w!==lw || h!==lh)){ lw=w; lh=h; renderer.setSize(w,h); composer.setSize(w,h); cam.aspect=w/h; cam.updateProjectionMatrix(); } }
    controls.update(); composer.render();
  })();

  return {
    canvas: renderer.domElement,
    // Render one fresh frame and return it as a PNG data URL — used by the Share Card.
    capture(){ composer.render(); return renderer.domElement.toDataURL('image/png'); },
    // ---- camera debug hooks (dev-only UI in PlayTools.html, ?dev=1) ----
    // Live spherical state of the camera relative to the orbit target, so a tester
    // can drag the rig to a limit and read off the exact value to lock in.
    getCamState(){
      const t = controls.target;
      return {
        distance: controls.getDistance(),
        polar:    controls.getPolarAngle(),
        azimuth:  controls.getAzimuthalAngle(),
        fov:      cam.fov,
        target:   [t.x, t.y, t.z],
        pos:      [cam.position.x, cam.position.y, cam.position.z]
      };
    },
    // Apply OrbitControls limits live (all angles in radians, keys match the
    // rig_manifest.json scene.camera block). Only touches the keys supplied.
    setCamLimits(o={}){
      if(o.minDist  != null) controls.minDistance    = o.minDist;
      if(o.maxDist  != null) controls.maxDistance    = o.maxDist;
      if(o.minPolar != null) controls.minPolarAngle  = o.minPolar;
      if(o.maxPolar != null) controls.maxPolarAngle  = o.maxPolar;
      if(o.minAz    != null) controls.minAzimuthAngle= o.minAz;
      if(o.maxAz    != null) controls.maxAzimuthAngle= o.maxAz;
      if(o.target)  { controls.target.set(o.target[0], o.target[1], o.target[2]); }
      if(o.fov     != null) { cam.fov = o.fov; cam.updateProjectionMatrix(); }
      controls.update();
    },
    dispose(){ alive=false; controls.dispose();
      scene.traverse(o=>{ o.geometry?.dispose?.(); const m=o.material; if(m){ (Array.isArray(m)?m:[m]).forEach(x=>{ x.map?.dispose?.(); x.dispose?.(); }); } });
      renderer.dispose(); renderer.forceContextLoss?.(); renderer.domElement.remove(); }
  };
}

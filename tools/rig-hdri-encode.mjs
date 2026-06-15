// HDRI re-encoder (dev tool) — shrinks The Rig's environment map.
//
//   node tools/rig-hdri-encode.mjs [inEXR] [outHDR] [targetWidth]
//
// The battlestation lit its scene from a 1k *.exr* (~5.5 MB, full 16-bit float).
// It's used for reflections/ambient only (environmentIntensity 0.35), so it does
// not need that fidelity. This reads the EXR with three's own EXRLoader, box-
// downsamples it, and re-encodes to a Radiance **.hdr** (RGBE, run-length) that
// three's HDRLoader reads directly — a >90% size cut with no visible change to
// the dark neon room. Run once; the .hdr is committed and the .exr dropped.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DataUtils } from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const inPath  = process.argv[2] || path.join(ROOT, 'assets/rig/models/ferndale_studio_04_1k.exr');
const outPath = process.argv[3] || path.join(ROOT, 'assets/rig/models/ferndale_studio_04_512.hdr');
const TW = +(process.argv[4] || 512);

// ---- read + decode EXR (half-float RGBA) -----------------------------------
const buf = fs.readFileSync(inPath);
const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
const exr = new EXRLoader().parse(ab);
const sw = exr.width, sh = exr.height;
// EXRLoader returns HalfFloatType (Uint16) RGBA here; decode to Float32 RGB.
const half = exr.data;
const srcF = new Float32Array(sw * sh * 3);
for (let i = 0, p = 0; i < sw * sh; i++) {
  srcF[i * 3 + 0] = DataUtils.fromHalfFloat(half[i * 4 + 0]);
  srcF[i * 3 + 1] = DataUtils.fromHalfFloat(half[i * 4 + 1]);
  srcF[i * 3 + 2] = DataUtils.fromHalfFloat(half[i * 4 + 2]);
}

// ---- box-downsample to TW×TH (preserve aspect) -----------------------------
const TH = Math.max(1, Math.round(TW * sh / sw));
const dstF = new Float32Array(TW * TH * 3);
for (let y = 0; y < TH; y++) {
  const sy0 = Math.floor(y * sh / TH), sy1 = Math.max(sy0 + 1, Math.floor((y + 1) * sh / TH));
  for (let x = 0; x < TW; x++) {
    const sx0 = Math.floor(x * sw / TW), sx1 = Math.max(sx0 + 1, Math.floor((x + 1) * sw / TW));
    let r = 0, g = 0, b = 0, n = 0;
    for (let sy = sy0; sy < sy1; sy++) for (let sx = sx0; sx < sx1; sx++) {
      const si = (sy * sw + sx) * 3; r += srcF[si]; g += srcF[si + 1]; b += srcF[si + 2]; n++;
    }
    const di = (y * TW + x) * 3; dstF[di] = r / n; dstF[di + 1] = g / n; dstF[di + 2] = b / n;
  }
}

// ---- float RGB → RGBE byte, matching HDRLoader's decode --------------------
// HDRLoader: rgb = byte * 2^(e-128) / 255  →  byte = rgb * 255 * 2^(128-e),
// with e = 128 + ceil(log2(max(r,g,b))) so the brightest channel fills the byte.
function encodePixel(r, g, b, out, o) {
  const d = Math.max(r, g, b);
  if (!(d > 1e-9)) { out[o] = out[o + 1] = out[o + 2] = out[o + 3] = 0; return; }
  let E = Math.ceil(Math.log2(d)), e = 128 + E;
  if (e < 1) { out[o] = out[o + 1] = out[o + 2] = out[o + 3] = 0; return; }
  if (e > 255) { e = 255; E = 127; }
  const f = 255 * Math.pow(2, -E);
  out[o]     = Math.min(255, Math.max(0, Math.round(r * f)));
  out[o + 1] = Math.min(255, Math.max(0, Math.round(g * f)));
  out[o + 2] = Math.min(255, Math.max(0, Math.round(b * f)));
  out[o + 3] = e;
}
const rgbe = new Uint8Array(TW * TH * 4);
for (let i = 0; i < TW * TH; i++) encodePixel(dstF[i * 3], dstF[i * 3 + 1], dstF[i * 3 + 2], rgbe, i * 4);

// ---- new-style RLE encode (Bruce Walter's rgbe.c, ported) ------------------
const MINRUN = 4;
function writeRLEScanline(out, chan /* Uint8 [4*w], 4 channels each w */, w) {
  for (let ch = 0; ch < 4; ch++) {
    const base = ch * w; let cur = 0;
    while (cur < w) {
      let runStart = cur, oldRun = 0, run = 0;
      while (run < MINRUN && runStart < w) {
        runStart += run; oldRun = run; run = 1;
        while (runStart + run < w && run < 127 && chan[base + runStart + run] === chan[base + runStart]) run++;
      }
      if (oldRun > 1 && oldRun === runStart - cur) { out.push(128 + oldRun, chan[base + cur]); cur = runStart; }
      while (cur < runStart) { let n = runStart - cur; if (n > 128) n = 128; out.push(n);
        for (let i = 0; i < n; i++) out.push(chan[base + cur + i]); cur += n; }
      if (run >= MINRUN) { out.push(128 + run, chan[base + runStart]); cur += run; }
    }
  }
}

const bytes = [];
for (const ch of `#?RADIANCE\nFORMAT=32-bit_rle_rgbe\n\n-Y ${TH} +X ${TW}\n`) bytes.push(ch.charCodeAt(0));
const scan = new Uint8Array(TW * 4); // [R..,G..,B..,E..]
for (let y = 0; y < TH; y++) {
  for (let x = 0; x < TW; x++) { const p = (y * TW + x) * 4;
    scan[x] = rgbe[p]; scan[TW + x] = rgbe[p + 1]; scan[2 * TW + x] = rgbe[p + 2]; scan[3 * TW + x] = rgbe[p + 3]; }
  bytes.push(2, 2, (TW >> 8) & 0xff, TW & 0xff);
  writeRLEScanline(bytes, scan, TW);
}

fs.writeFileSync(outPath, Buffer.from(bytes));
const inKB = (buf.length / 1024).toFixed(0), outKB = (bytes.length / 1024).toFixed(0);
console.log(`${path.basename(inPath)} ${sw}x${sh} ${inKB} KB  →  ${path.basename(outPath)} ${TW}x${TH} ${outKB} KB  (${(100 - bytes.length / buf.length * 100).toFixed(1)}% smaller)`);

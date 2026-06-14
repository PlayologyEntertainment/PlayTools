# assets/rig — The Rig 3D battlestation assets

Drop your sourced models and lighting here. Full spec + shopping list:
[`DD/Rig_3D_Asset_Spec.md`](../../DD/Rig_3D_Asset_Spec.md).

```
models/   ← .glb models (glTF 2.0 binary, PBR, Y-up, metres). Name them models/<id>.glb
hdri/     ← one .hdr or .exr environment map (lighting/reflections)
rig_manifest.json  ← maps NetStore part ids → model + placement
```

## How to add an asset
1. Put the `.glb` in `models/` (e.g. `models/chair_gaming.glb`).
2. In `rig_manifest.json`, set that part's `"model"` to the path (e.g. `"models/chair_gaming.glb"`),
   or just tell me the filename and I'll wire it.
3. Preview: `npm run rig:preview` → renders the current scene to `tools/output/rig.png`.
   (I tune each item's `transform` so it sits correctly.)

## Adjust the layout interactively
`npm run rig:edit` → open **http://127.0.0.1:8132** in a browser. Orbit/zoom to frame the
camera, pick a part and drag its X/Y/Z/rotation/scale sliders live, toggle parts on/off,
and tune bloom/FOV. Hit **Export manifest JSON** (copy or download) and paste the result
back into `rig_manifest.json`. The editor and the headless preview share one builder
(`tools/rig-build.mjs`), so what you see in the editor is what `rig:preview` renders.

## See it in the app (#/rig)
`npm run serve` → open **http://127.0.0.1:8133/PlayTools.html** and go to **The Rig**.
When served this way the battlestation renders in **3D** (lazy-loaded, bound to the parts
you own in the NetStore); opened any other way — or without WebGL — it falls back to the
procedural SVG. The in-app viewer shares this same manifest + `tools/rig-build.mjs`.

## Conventions (short version)
- **.glb**, PBR metallic-roughness, **Y-up**, faces **−Z**, **real-world metres**.
- Furniture origin = footprint centre on the floor; desk-top items = base resting point.
- < ~50k tris, ≤ 2K textures per item. Note license in the manifest `credit` field.

Currently provided & wired: desk, gaming chair, monitors (base/flat/ultrawide), keyboards
(base/upgrade), mouse, tower, headset, two desk toys, and a `.exr` HDRI
(`ferndale_studio_04_1k`). See `rig_manifest.json` for the mapping. Per-model scales/
placements are tuned in the manifest `transform` blocks (some source models ship in cm or
odd units — handled there).

Decorations: a stack of `books` and five wall `posters` (poster01–05 + poster_base) sit on
the back wall / desktop, lit via the `glow` field so flat prints read in the dark scene; a
few are flagged `"default": false` to keep the hero shot uncluttered (toggle via `?own=`).

**Procedural parts** (no `.glb`): the RGB Light Kit (`rgb`) is built in-engine via a
`"proc": "<type>"` manifest entry; a procedural `poster` builder remains as a no-art
fallback. An optional `scene.wall` gives posters something to hang on. Alternates (the flat
monitor, the second toy, extra posters) are flagged `"default": false`. Still want real
models: the GPU/internal hardware and the sit/stand desk upgrade. Field reference in the
spec (§4).

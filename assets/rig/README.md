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

## Conventions (short version)
- **.glb**, PBR metallic-roughness, **Y-up**, faces **−Z**, **real-world metres**.
- Furniture origin = footprint centre on the floor; desk-top items = base resting point.
- < ~50k tris, ≤ 2K textures per item. Note license in the manifest `credit` field.

Currently provided: `models/chair_office_basic.glb` (Quaternius CC0) — a placeholder/basic chair.

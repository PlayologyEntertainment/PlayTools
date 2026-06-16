# assets/rig/textures — Floor & Wall albedo images

Drop your **albedo** (base colour) images here using the **exact filenames** below and
they take effect automatically in The Rig 3D view — no code changes needed. Each surface
falls back to its built-in procedural texture if the file is missing, so you can add them
one at a time and nothing breaks in between.

| Surface              | Tier | Filename               | Tiling                    | Notes |
|----------------------|------|------------------------|---------------------------|-------|
| Floor — shag carpet  | T1   | `floor_carpet.jpg`     | tiled 24×24 (seamless)    | warm light-brown shag |
| Floor — hardwood     | T2   | `floor_hardwood.jpg`   | tiled 7×7 (seamless)      | dark warm planks |
| Floor — neon tiles   | T3   | `floor_neon.jpg`       | tiled 14×14 (seamless)    | also drives the glow — bright seams/areas self-illuminate |
| Wall — beige stucco  | T1   | `wall_stucco.jpg`      | tiled to wall (seamless)  | the image carries the colour (no extra tint) |
| Wall — exposed brick | T2   | `wall_brick.jpg`       | tiled to wall (seamless)  | staggered warm brick |
| Wall — synthwave      | T3   | `wall_synthwave.jpg`   | **single mural, no tiling** | also self-illuminates; design as one full-wall image |

## Specs

- **Albedo only.** We derive surface relief (bump) from the same image, so no separate
  normal/roughness maps are needed. Just the colour image.
- **Format:** `.jpg` (preferred for photos) or `.png`. Keep filenames exactly as above.
- **Seamless / tileable** for everything except `wall_synthwave.jpg` (that one is a single
  mural stretched across the whole back wall, so compose it edge-to-edge).
- **Square** power-of-two sizes work best for the tiled ones: **1024×1024** or **2048×2048**.
  The synthwave mural is wide — author it around **2048×880** (≈ the wall's 16:5 aspect).
- **Keep them ≤ ~2K** per side to stay light on the GPU.
- For the **neon floor** and **synthwave wall**, the brighter parts of the image glow
  (bloom). Make the parts you want lit bright, and the rest dark.

## How it works

`tools/rig-build.mjs` builds the procedural texture first, then calls `swapAlbedo(file, …)`
which loads `textures/<file>` and swaps its pixels into the live material. Preview your
images with `npm run rig:edit` (Scene panel → Floor/Wall dropdowns) or `npm run serve`
→ The Rig.

## Sourcing tips

Good free, seamless, no-attribution-required sources for the tileable ones:
**ambientCG.com** and **PolyHaven.com** (download the *Diffuse/Color* / *Albedo* map only).
The synthwave mural is bespoke — generate or design a wide neon piece.

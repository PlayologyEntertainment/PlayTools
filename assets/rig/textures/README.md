# assets/rig/textures — Floor & Wall albedo images

Drop your **albedo** (base colour) images here using the **exact filenames** below and
they take effect automatically in The Rig 3D view — no code changes needed. Each surface
falls back to its built-in procedural texture if the file is missing, so you can add them
one at a time and nothing breaks in between.

| Surface              | Tier | Filename         | Tiling                   | Notes |
|----------------------|------|------------------|--------------------------|-------|
| Floor — shag carpet  | T1   | `Floor_T1.jpg`   | tiled 24×24 (seamless)   | warm light-brown shag |
| Floor — hardwood     | T2   | `Floor_T2.jpg`   | tiled 14×8 (seamless)    | dark warm planks; portrait images keep their proportions |
| Floor — polished stone | T3 | `Floor_T3.jpg`   | tiled 6×6 (seamless)     | glossy terrazzo/stone; catches neon lights as sheen (no self-glow) |
| Wall — beige stucco  | T1   | `Wall_T1.jpg`    | tiled to wall (seamless) | the image carries the colour (no extra tint) |
| Wall — exposed brick | T2   | `Wall_T2.jpg`    | tiled to wall (seamless) | staggered brick |
| Wall — brushed metal | T3   | `Wall_T3.jpg`    | tiled to wall (seamless) | metallic panelling; reflects scene neon (no self-glow) |

## Specs

- **Albedo only.** We derive surface relief (bump) from the same image, so no separate
  normal/roughness maps are needed. Just the colour image.
- **Format:** `.jpg` (preferred for photos) or `.png`. Keep filenames **exactly** as above
  (case-sensitive, tier-based: `Floor_T1`…`Wall_T3`).
- **Seamless / tileable** — every surface tiles, so compose edge-to-edge with no visible seam.
- **Square** sizes work best for the floors and walls: **1024×1024** or **2048×2048**.
  Portrait/odd aspects load fine, but square avoids stretch (the wood T2 tile ratio is tuned
  for a roughly portrait plank image).
- **Keep them ≤ ~2K** per side to stay light on the GPU.
- **No emissive maps needed.** Earlier the neon-floor / synthwave-wall tiers self-illuminated
  from their albedo; they're now plain PBR surfaces (stone floor, metal wall) that pick up the
  room's neon point lights through low roughness / metalness instead. Just supply colour.

## How it works

`tools/rig-build.mjs` builds the procedural texture first, then calls `swapAlbedo(file, …)`
which loads `textures/<file>` and swaps its pixels into the live material. Preview your
images with `npm run rig:edit` (Scene panel → Floor/Wall dropdowns) or `npm run serve`
→ The Rig.

## Sourcing tips

Good free, seamless, no-attribution-required sources:
**ambientCG.com** and **PolyHaven.com** (download the *Diffuse/Color* / *Albedo* map only).

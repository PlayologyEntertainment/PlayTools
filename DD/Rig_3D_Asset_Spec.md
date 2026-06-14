# The Rig — Real-Time 3D Battlestation: Asset Spec & Shopping List

**Status:** Active build track (real-time 3D, chosen 2026-06-14)
**Renderer:** Three.js (WebGL) — PBR materials + image-based lighting (HDRI) + bloom.
**Goal:** a battlestation that starts mundane and grows to an "ultimate setup," where
**every NetStore purchase swaps or adds a model** in one coherent scene. The engine
handles lighting, shadows, reflections and occlusion, so adding an item = **drop in
one model + one manifest entry**. Nothing existing gets re-baked.

> This doc is the single source of truth for sourcing assets. Drop files into
> `assets/rig/` and wire them in `assets/rig/rig_manifest.json`. Preview anytime
> with `npm run rig:preview` (renders the current scene to `tools/output/rig.png`).

---

## 1. Folder layout (in this repo)

```
assets/rig/
  rig_manifest.json     ← maps NetStore part ids → model + placement (you + me)
  models/               ← your .glb models go here
  hdri/                 ← one .hdr / .exr lighting environment
  README.md
```

## 2. File-format conventions (please follow these when sourcing)

| Thing | Requirement |
| --- | --- |
| **Format** | glTF 2.0 **binary `.glb`**, single self-contained file (textures embedded) |
| **Materials** | **PBR metallic-roughness** (baseColor + normal + roughness/metallic). Avoid proprietary/Blender-only shaders. |
| **Up axis** | **Y-up** (glTF default) |
| **Forward** | model faces **−Z** (toward the camera). If not, I rotate it in the manifest — don't sweat it. |
| **Scale** | **real-world metres** (a desk ≈ 0.75 m tall, a 27″ monitor ≈ 0.4 m tall). If a model imports huge/tiny, I fix it with a manifest `scale` — but metres saves time. |
| **Origin** | Furniture/floor items: origin at the **footprint centre, on the floor** (so placing at y=0 sits it on the ground). Desk-top items: origin at the **base resting point**. |
| **Budget** | Aim **< ~50k triangles** and **≤ 2K textures** per item (web performance). Stylised low-poly is great and tiny; photoreal PBR is fine but heavier. |
| **License** | CC0 / CC-BY / purchased-with-redistribution. Note the license + attribution in the manifest `credit` field. |
| **Naming** | `models/<id>.glb` where `<id>` matches the manifest key (see §4). |

**Where to source:** Sketchfab (filter *Downloadable* + *PBR*), Quaternius (CC0, stylised),
Kenney (CC0), Poly Pizza, Quixel Megascans (photoreal), CGTrader/TurboSquid (paid).
**Image-to-3D** (Meshy / Tripo / Rodin) is a fine way to turn a reference image into a `.glb`.
**HDRI:** Poly Haven (free CC0) — pick a dark interior / night / studio mood.

---

## 3. Shopping list (models to source)

Two buckets: **base** items are always present (the "mundane" starting desk); **upgrade**
items are the NetStore purchases that swap/add on top. Internal PC parts are mostly seen
through the case glass, so they're cheap accents, not full hero models.

### 3.1 Base scene (the mundane starting point — always visible)
| id | What to find | Notes |
| --- | --- | --- |
| `room` | A simple room shell: back wall + side wall + floor (or just a floor + back wall) | Optional — I can keep this procedural. A tiled floor + dark wall is enough. |
| `desk_base` | A plain office/computer desk | The "mundane" desk. ~1.2–1.6 m wide. |
| `monitor_base` | A basic single monitor | Starter display. I drive the on-screen image. |
| `chair_base` | A basic office chair | ✅ **provided** (`chair_office_basic.glb`) |
| `keyboard_base` | A plain keyboard | Starter. |
| `mouse_base` | A plain mouse | Starter. |
| `tower_base` | A PC case (ideally with a glass side panel showing internals) | The mining rig. Tiers light up the internals. |

### 3.2 NetStore upgrades (one model per purchasable item)
| Manifest id | NetStore item | Model to find |
| --- | --- | --- |
| `monitor` | Ultrawide Monitor | A wide/ultrawide gaming monitor |
| `keyboard` | Mechanical Keyboard | An RGB mechanical keyboard |
| `mouse` | Gaming Mouse | A gaming mouse |
| `headset` | Surround Headset | A headset **+ a headset stand** (or two files) |
| `chair` | Gaming Chair | A racing/gaming chair (replaces `chair_base`) |
| `desk` | Sit/Stand Desk | A sleek standing/gaming desk (replaces `desk_base`) |
| `rgb` | RGB Light Kit | LED strips / light bars (can also be procedural) |
| `poster` | Wall Poster | A framed poster (I supply the art texture) or just a frame |
| `desktoy` | Desk Toy | A small figurine / gadget / collectible |
| `gpu` | GPU tiers (Mk I–IV) | A graphics-card model for the case interior (RTX-style) |
| `cooling` | Cooling (Air/Liquid) | *(optional)* fans / AIO radiator for the case interior |
| `ram` / `psu` | RAM / PSU | *(optional)* RAM sticks / PSU — internal accents, low priority |

### 3.3 Lighting
| id | What | Notes |
| --- | --- | --- |
| `hdri` | **One** `.hdr` or `.exr` environment map | Drives realistic reflections + ambient light. Dark interior / neon-night mood. Drop in `assets/rig/hdri/`. |

> **Priority order to unblock the look fastest:** `desk_base` → `monitor_base` → `tower_base`
> → `hdri` → then the upgrade chairs/monitor/keyboard. Everything else can trail in.

---

## 4. The manifest (`rig_manifest.json`)

Each NetStore part id maps to a model + a **transform** (position / rotation / scale).
The transform is how we "move things around the scene" — **I tune these numbers** for you
as models arrive; you just supply the file. Tiered parts list a model per tier.

```jsonc
{
  "scene": {
    "hdri": "hdri/night.hdr",            // optional; falls back to a studio env
    "camera": { "pos": [-1.5,1.35,2.9], "target": [0.45,0.95,-0.7], "fov": 40 },
    "bloom":  { "strength": 0.6, "radius": 0.5, "threshold": 0.8 }
  },
  "base": [
    { "id": "desk_base",    "model": "models/desk_base.glb",    "transform": { "pos": [0.3,0,-0.75] } },
    { "id": "monitor_base", "model": "models/monitor_base.glb", "transform": { "pos": [0,0.78,-1.0] }, "screen": "synthwave" }
  ],
  "parts": {
    "chair":   { "model": "models/chair_gaming.glb",
                 "replaces": "chair_base",
                 "transform": { "pos": [-0.7,0,0.65], "rotY": 32, "scale": 1.0 },
                 "credit": "Author / CC-BY" },
    "monitor": { "model": "models/monitor_ultrawide.glb", "replaces": "monitor_base",
                 "transform": { "pos": [0,0.78,-1.0] }, "screen": "synthwave" }
    /* ... one entry per NetStore id ... */
  }
}
```

**Fields:** `model` (path under `assets/rig/`), `transform` (`pos` [x,y,z] metres,
`rotY` degrees, `scale` number or [x,y,z]), `replaces` (a base id this swaps out when
owned), `screen` (which procedural screen image to project — the monitor content is
code-driven, not a sourced texture), `credit` (license/attribution).

---

## 5. Workflow (how we iterate)

1. **You** source a `.glb`, drop it in `assets/rig/models/`, add or fill its manifest entry
   (or just tell me the filename and I'll wire it).
2. **I** run `npm run rig:preview`, tune the `transform` so it sits right, and send you a
   screenshot.
3. Repeat per asset. Once the scene reads well, I wire the Three.js viewer into the Rig
   screen in `PlayTools.html` (lazy-loaded on the `#/rig` route; the current procedural
   SVG stays as the no-WebGL fallback) and bind part visibility to actual ownership.

## 6. Open / deferred
- **App integration** (Three.js into the single-file app, lazy-load, Share Card capture
  from the WebGL canvas) happens **after** the scene looks right with real assets.
- **Download weight:** photoreal PBR models are large; we'll budget/compress (Draco/meshopt,
  WebP/KTX2 textures) before shipping. Stylised assets keep this trivial.
- **Fallback:** devices without WebGL keep the existing SVG battlestation.

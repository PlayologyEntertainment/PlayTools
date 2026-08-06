# PlayTools: MVP Product Design Document
**Version:** 1.0 
**Author:** Playology Entertainment 
**Status:** Describes the shipped v1.0 core platform (Gamer DNA, Reflex/Mouse/
Setup/Fun/Tabletop Labs, Achievements, Share Cards). Three major systems shipped
*after* this doc and are documented separately: **The Rig** (`Rig_DD.md`,
idle NetCoin economy + 3D battlestation), **RetroPets** (`RetroMall_DD.md`,
creature collection/care), and the **Retro Arcade** cabinet line — 7 full games
with their own specs (`ColdStack_DD.md`, `Overdrive_DD.md`, `JackIn_DD.md`,
`Ecto_DD.md`, `Crossload_DD.md`, `MacPan_DD.md`, `Defrag_DD.md`), which
superseded the placeholder roster in §5.5 below. See `ROADMAP.md` for the
consolidated, audited state of the whole app and v2 planning.

---

## 1. Executive Summary

### 1.1 Product Definition
**PlayTools** is a browser-based collection of gaming utilities, diagnostics, mini-games, calculators, and interactive challenges engineered around a cohesive retro arcade experience . Unlike traditional utility websites that function as cold, transactional interfaces , PlayTools transforms every micro-tool into an engaging, gamified experience . Each interaction yields granular performance metrics, a definitive grade, and a visually striking, shareable results card optimized for competitive social sharing .

### 1.2 Strategic Intent & Primary Goal
The primary objective of PlayTools is not simply helping users solve a tactical problem (e.g., calculating sensitivity or testing mouse polling rates) . Instead, it is designed to create highly entertaining, friction-free, and memorable experiences that organically leverage competitive psychology to stimulate viral growth and social proof loops . 

### 1.3 Core Principles
* **Zero Authentication by Default (No Account Required):** Immediate onboarding . Friction is eliminated by avoiding registration walls; all profile data persists anonymously on the user's client by default .
* **Browser-Only Execution by Default:** Absolute zero installation . All operations, diagnostics, calculations, and rendering occur entirely in the client browser by default .
* **Sub-Second Asset Delivery (Fast Loading):** Exceptionally lightweight bundle footprint utilizing aggressively optimized assets to ensure instant retro arcade rendering .
* **Immersive Retro Arcade Aesthetics:** Heavy visual adherence to standard 8-bit/16-bit arcade ergonomics, including CRT monitor styling, glowing neon paths, and pixelated glyphs .
* **Quantifiable Output Engine:** Every tool natively outputs a discrete numeric score, an academic performance grade, or a unique, collectible character profile .
* **Universal Shareability:** Every micro-experience terminates in a data-rich visual asset designed for single-click export or platform sharing .
* **Overarching Gamer Metagame:** Individual tool performance feeds upward into a centralized progression matrix, tracking an encompassing Gamer Score and title tier .
* **Optional Cloud Account (opt-in):** A player may choose to sign in with Discord to sync their Gamer DNA profile, achievements, Rig/RetroPets state, and tool bests across devices, and to add real Discord friends. This is strictly additive — signing in changes nothing about the two principles above for players who never do it, and nothing here reintroduces leaderboards or Discord presence. See `DD/CloudSync_DD.md`.

---

## 2. Product Vision & Site Architecture

### 2.1 Product Vision
PlayTools acts as an overarching virtual amusement center . Each diagnostic widget or technical calculator is treated like an individual arcade cabinet[cite: 2]. Dropping into a tool feels like starting an arcade session[cite: 2]. The site marries analytical utilities with playful mechanics to build a unified client-side ecosystem .

### 2.2 Functional Taxonomy (Site Architecture)
The application architecture is strictly partitioned into seven primary functional areas ("Labs"), managed by a global layout frame :

[PlayTools Core Architecture]
├── 1. Gamer DNA (Global Local Profile & Metagame State)
├── 2. Reflex Lab (Reaction, speed, and raw mechanical testing)
├── 3. Mouse Lab (Hardware diagnostics and cursor tracking fidelity)
├── 4. Setup Lab (Gaming calculators, scaling math, and configurations)
├── 5. Fun Lab (Identity profiling, entertainment generators, and community roasts)
├── 6. Tabletop / RPG Lab (Polyhedral dice, modifiers, and tabletop helpers)
└── 7. Retro Arcade (Short-session classic arcade cabinet mini-games)

---

## 3. Global System Specifications

### 3.1 Gamer DNA System
The Gamer DNA system is a unified local profile engine that collects, aggregates, and mathematically processes performance telemetry across every standalone laboratory tool .

#### 3.1.1 Demographics & Identity Schema
Users can voluntarily enrich their local profile with standard metadata fields . This dataset is stored as an object inside the browser’s client storage engine :
* **Gamer Tag / Name / ID:** String alphanumeric mask .
* **Personal URL / Website:** Validated web address string .
* **Date of Birth (Birthday):** Date object, used to calculate age brackets for cohort comparison profiles .
* **Geographic Profile:** Structured down to City, State/Province, and Country values only . Exact addresses are explicitly blocked to protect privacy .
* **Visual Persona Palette:** A hex color string mapping back to the UI's neon accent themes .
* **Favorite Vehicular Class / Car:** String entry used for specific procedural text fields in generators .
* **Primary Narrative Anchor (Favorite Character):** Open string capture (Game, Anime, Film, TV, Comic universes) .
* **Direct Contact Handlers:** Multi-field object supporting Discord Handles, verified email structures, and telephone numbers .
* **Social Handle Arrays:** Profile linking addresses for YouTube, X (Twitter), TikTok, and Instagram .

#### 3.1.2 Platform Aggregation & Integration Profiles
Users can manually declare or import their presence profiles across digital gaming ecosystems . The integration supports two distinct processing tracks:
1. **Manual Entry Panel:** A dedicated retro dashboard interface allowing users to manually fill out key performance indicators (e.g., Total Wins, Kill/Death Ratio, Rank Tier) for individual ecosystems.
2. **Text-Block Copy/Paste Parsing Layer:** A text import block where users can copy and paste raw console snippets or public profile JSON text dumps. The client parsing engine reads this input string, extracts key performance properties, and maps them to the local profile data structures.

* **Supported Platforms:** Steam, Xbox Live, PlayStation Network, Nintendo Network, Riot Games, Epic Games Store, and Discord .
* **Aggregation Processing:** Compiles total games owned, active playtime across major categories (FPS, RPG, RTS, Sim), rare achievements unlocked, and live verification status badges . This aggregated view is compiled directly on the client[cite: 2].
* **Export & P2P Sharing Pipeline:** The system generates an interactive, styled, self-contained HTML file embedding both the data object payload and custom, inline retro styling .
    * When a user hits the "Share with Friend" button, the engine generates this standalone HTML asset and targets the system's default email client using a structured mail context helper.
    * The email is dynamically pre-populated with an arcade-themed Subject line (e.g., `[PlayTools] Challenge Issued by Your Friend!`) and an instructional Body message.
    * The sender enters the recipient's email address and clicks send.
    * Upon receipt, the friend downloads the attached HTML file and imports it using the "Import Friend Profile" interface on their own browser console.
    * **Data Overwrite Policy:** If an import payload matches an existing entry in the user's local Friends List, the system updates the profile with the newer dataset, overwriting old records seamlessly.
* **Achievement Showcase Engine:** Extracts top milestone tags across imported datasets and lays them out into a pixelated display wall inside the main interface .

##### 3.1.2.1 MVP Implementation Spec (Platform Link) — v1 (Locked)
This subsection narrows the vision above into a build-ready specification for the first implementation pass. Where it refines an earlier statement (e.g. category aggregation), this locked spec governs the MVP.

**Customer-Facing Name.** The feature ships to users as **Platform Link** (shorthand **"Link"**) — the manual KPI panel (plus any future paste import). To avoid implying live OAuth/account-linking (the feature is deliberately zero-auth per §1.3), the UI pairs the name with expectation-setting subcopy, e.g. *"no login, no account linking, and nothing ever leaves this browser."*

**Architecture — strictly client-only.** The engine runs entirely in-browser. There is no backend, no proxy server, and no API keys; all data is entered/processed locally, consistent with the product's Browser-Only Execution principle (§1.3). (Any future paste import would parse locally via `DOMParser` / `JSON.parse`.)

> **Not to be confused with Cloud Account.** A separate, unrelated, later-added feature — optional Discord **OAuth2** sign-in for cross-device sync and real friends (`DD/CloudSync_DD.md`, route `#/account`) — also touches Discord. Platform Link's Discord card above stays exactly as specified in this section: manual-entry, local-only, no login. Cloud Account never reads or writes `dna.platforms`.

**MVP Platform Set.** The first release ships three platforms, split into two card archetypes:

| Archetype | Platforms | Emphasis |
| --- | --- | --- |
| `game` | **Steam**, **Epic Games** | library + per-title competitive KPIs |
| `social` | **Discord** | handle + audience / verification stats |

All three platforms are **manual-entry cards** in v1 (see implementation note below), each shown with its official brand mark (inlined as a transparent single-path SVG so it stays crisp and offline). PlayTools is PC-focused, so the console-only **Nintendo** card was dropped; Xbox Live, PlayStation Network, and Riot Games from the broader vision list (§3.1.2) remain deferred to a later pass. **Twitch** was dropped from the MVP set after initial launch.

**Implementation note — Steam auto-import (shipped: manual).** The original v1 plan auto-parsed Steam from its public Community XML (`…/?xml=1`, `…/games/?tab=all&xml=1`). In testing this proved unworkable client-side: Steam has deprecated the community XML and now serves logged-in profile owners the new JavaScript-rendered games page (ignoring `xml=1`), while the profile-summary XML never contained the full library. A true "enter your ID → auto-load" experience (à la gameindustry.eu) requires Steam's Web API behind a server/proxy — which violates the strictly-client-only, no-proxy rule above. v1 therefore ships **manual entry for all platforms**, including Steam. The data model keeps `source: 'parser'` reserved so an optional Web-API-key + proxy path can be added later without migration.

**Data Model (`platforms`, schema `version: 2`).** Each platform entry is keyed by id and carries timestamped snapshots so trend analytics can be layered on later with no migration:

```js
platforms: {
  steam:    { type:'game',   source:'parser'|'manual', handle, id, snapshots:[ … ] },
  epic:     { type:'game',   source:'manual',          handle,     snapshots:[ … ] },
  nintendo: { type:'game',   source:'manual',          handle, friendCode, snapshots:[ … ] },
  discord:  { type:'social', source:'manual',          handle,     snapshots:[ … ] }
}
// snapshot = { at, identity{}, library{ gamesOwned, totalHours, topGames[] },
//              kpis[ { game, rank, wins, losses, kd, … } ],
//              social{ followers, subs, verified }, badges[], custom{ key:val } }
```

**Snapshot Retention Policy.** Per platform, the engine pulls and retains the **top 50 games ranked by usage (playtime)**, plus rolling summaries. The latest snapshot holds full per-title detail; older snapshots collapse to summary-only records. The 50-game cap keeps the aggregate footprint comfortably under the browser's ~5 MB `localStorage` ceiling even with all platforms populated.

**Field Schema.**
* *Shared (all cards):* handle · profile URL · region · member-since · verification toggle · free-form custom key→value rows.
* *`game` cards add:* games owned · total hours · an optional Top-Games list · a repeatable per-title KPI block — title, rank/tier, wins, losses, K/D (auto win-rate), plus an **add/remove list of user-defined custom stat fields** per game (e.g. Headshot %, Level, MMR).
* *`social` cards add:* followers · subscribers · partner/affiliate or Nitro status · server count (Discord).

**Steam (manual in v1).** See the implementation note above — client-only auto-import is blocked by Steam's deprecation of community XML, so Steam is entered by hand like the other `game` platforms (profile name, library size, total hours, top titles, per-game KPIs). A `DOMParser`/JSON paste parser plus Web-API-key option remains a candidate for a later pass.

**Category Bucketing — dropped.** The earlier FPS/RPG/RTS/Sim hour-split fields were removed: with no reliable client-side genre source they were manual busywork. Library shape is captured instead by total hours + the Top-Games list, and any genre/category the user cares about can go in a per-game custom KPI field.

**Gamer DNA surfacing.** The Gamer DNA hub (§3.1) renders each linked platform's **full detail inline** — brand mark, handle, library stats, Top-Games, and every per-game KPI (including custom fields) and custom field — with a button through to manage them on Platform Link.

**Attribute Integration (boundary).** Imported platform statistics **do not** feed the 7 core skill vectors of the Mathematical Attribute Engine (§3.1.3). Because client storage is openly user-editable (§6.2), keeping externally-declared stats out of the Gamer Score preserves the integrity of skill-derived rankings. Platform data instead drives: the Achievement Showcase wall, a library/veteran flair, and the unlock condition for the **Controller Wizard** achievement (§6.2 — "3 platform cards filled"). Each platform card renders through the existing Universal Share Card canvas + email pipeline (§6.1).

**Placement.** Route `#/dna/platforms` hosts the **Platform Link** panel: a list/grid of platform cards leading to a detail view with the **Manual** entry form (all platforms in v1).

**Deferred.** The Gaming Journal feature and trend/analytics visualizations are out of scope for v1; the timestamped-snapshot model preserves the data needed to add analytics later without migration.

#### 3.1.3 Mathematical Attribute Engine
Every micro-tool execution securely passes performance indicators into a global statistical matrix . The matrix tracks 7 hidden, core vector attributes :

$$\mathbf{A} = \{ \text{Reflex}, \text{Precision}, \text{Speed}, \text{Focus}, \text{Consistency}, \text{Control}, \text{Strategy} \}$$

Each attribute is surfaced as a **single value on the normalized $[0,100]$ radar** — the radar is the whole story (there is no separate prestige or mastery number). The legacy additive rule $A_{\text{new}} = \min(100,\, A_{\text{old}} + \Delta \cdot w)$ is **deprecated**: because every delta was positive and the only ceiling was the clamp, all seven vectors inevitably marched to $100$, filling the radar and flattening long-term motivation. It is replaced by a three-stage **hybrid form model** — absolute benchmark normalization, diminishing-returns easing, and idle decay — that keeps the displayed value fully client-side and cross-user comparable while making $100$ mean *world-class and currently in form* rather than *has played a lot*.

**Stage 1 — Benchmark normalization (absolute, per tool).** Each tool emits one raw performance scalar $x$ in its natural units (reaction ms, accuracy %, clicks/s, …). A per-tool **benchmark curve** maps that raw value to a run-quality score $q \in (0,1)$ via a logistic anchored on authored reference points, oriented so higher skill $\Rightarrow$ higher $q$:

$$q = \frac{1}{1 + e^{-s\,(\hat{x} - m)}}, \qquad \hat{x} = \begin{cases} x & \text{higher-is-better metrics}\\ -x & \text{lower-is-better metrics (e.g. reaction time)} \end{cases}$$

$m$ is the **median-human** anchor ($q=0.5$) and $s$ the steepness. Because the curve is authored to approximate the real human skill distribution, $q$ behaves like a percentile while requiring **no backend and no population query** — the curve constants ship inside the client (consistent with §1.3 / §3.1.2.1). $q \to 1$ only for near-elite raw input. Reference anchors (v1, tunable):

| Tool / metric | Orientation | Floor ($q\approx0.1$) | Median $m$ ($q=0.5$) | Elite ($q\approx0.95$) |
| --- | --- | --- | --- | --- |
| Reflex Lab (Reaction Time) — avg reaction (ms) | lower-better | 420 | 270 | 160 |
| Click Speed (CPS Test) — CPS | higher-better | 4.0 | 6.5 | 11 |
| Target Practice (Precision Click) — accuracy % | higher-better | 55 | 78 | 97 |
| Aim Tracking (Tracking Trainer) — control % | higher-better | 50 | 75 | 95 |
| Dice — luck-normalized $q$ | (already $0$–$1$) | — | 0.5 | — |

($s$ is derived per row so the floor / elite anchors land at $q\approx0.1$ / $q\approx0.95$. The table's tool names are the conceptual metric names as originally authored; the parenthetical names are the actual shipped cabinet/tool names, since none of the four is a literal "Target Practice" or "Aim Tracking" applet in the code.)

> **Implementation status (current code).** All three stages are now implemented
> as specified. **Stage 1** ships as `Attr.benchmarkQuality(x, {floor, median,
> elite, lowerBetter})`, wired into the four anchored tools above (Dice needed no
> change — its raw metric is already the $0$–$1$ quality score). Because a floor
> and an elite anchor are rarely equidistant from the median in raw units, the
> code doesn't try to hit both exactly: it fits the steepness $s$ by least-squares
> regression, in log-odds space, through the origin at the median — i.e. it
> balances the two anchors' errors rather than exactly solving for one and
> approximating the other. In practice this lands each tool's floor around
> $q\approx0.05$–$0.15$ and elite around $q\approx0.89$–$0.96$ — close to, not
> exactly, the authored $0.1$/$0.95$ targets, consistent with the "≈" in the table
> header. Precision Click's `quality` now derives purely from accuracy (the old
> `accuracy*0.7 + rating*0.3` blend is dropped, matching this table's "accuracy %"
> anchor row; the Precision Rating tile is still shown but no longer feeds DNA).
> Tracking Trainer's `quality` now derives from its `control` value (matching the
> "control %" row) rather than the on-target% it previously used. Stages 2 and 3
> remain implemented **exactly** as specified, constants included ($k{=}2$,
> $\eta_{up}{=}0.30$, $\eta_{down}{=}0.10$, $\beta{=}0.5$, $h{=}45$).
> Regression-tested in `test/attribute-benchmark.mjs`. The ~30 Retro Arcade /
> RPG Lab / RetroPets tools that also feed `Attr.applyVector` still use their own
> ad-hoc linear `clamp01` formulas — those aren't in this anchor table and are
> out of scope here, since several of them double as the NetCoin arcade-grade
> gate (`arcadeGrade(comp)`) and converting them is a separate, live-economy-affecting
> decision (see ROADMAP.md).

**Stage 2 — Form update (diminishing returns).** Per completed run, the attribute eases toward its quality target $A_\star = 100\,q$ with a weight-scaled, headroom-damped step. Let $w \in (0,1]$ be the tool's normalized attribution weight (the legacy per-tool weights divided by the max weight, e.g. Reflex $12/16 = 0.75$):

$$A_{\text{new}} = A_{\text{old}} + \eta\, w \,(A_\star - A_{\text{old}}) \cdot \Phi, \qquad \Phi = \begin{cases} \left(1 - \dfrac{A_{\text{old}}}{100}\right)^{k}, & A_\star \ge A_{\text{old}}\ \text{(improving, } \eta=\eta_{\text{up}})\\[2.2ex] 1, & A_\star < A_{\text{old}}\ \text{(sub-form, } \eta=\eta_{\text{down}}) \end{cases}$$

The headroom term $(1 - A/100)^k$ makes the top **asymptotic** — each point above $\sim85$ costs progressively more, so $100$ is approached but practically never reached. Improving runs use the faster rate $\eta_{\text{up}}$; sub-form runs use the gentler $\eta_{\text{down}}$ so a single bad session nudges rather than tanks the value. The attribute converges toward your *demonstrated quality* $\approx 100\,\bar q$ (minus headroom drag), **not** the clamp — a $0.8$-quality player settles in the high-70s/low-80s, and only consistently near-perfect play reaches the upper radar.

**Stage 3 — Idle decay (current form / "use it or lose it").** Skill that isn't exercised regresses. On profile load, each attribute is lazily decayed toward a **retained floor** $f = \beta\, A_{\text{peak}}$ (a fraction of its all-time peak, so lapsed players keep a credible baseline rather than resetting to zero) using elapsed idle time $\Delta t$ in days:

$$A \leftarrow f + (A - f)\,e^{-\lambda\,\Delta t}, \qquad \lambda = \frac{\ln 2}{h}$$

with half-life $h$ days. Decay visibly **de-fills** a maxed radar over an absence, converting the metagame from "fill it once" into "stay in form," and gives a concrete reason to return.

**Tuning constants (v1).**

| Symbol | Meaning | Default |
| --- | --- | --- |
| $k$ | headroom exponent (ceiling stiffness) | $2$ |
| $\eta_{\text{up}}$ | improving learning rate | $0.30$ |
| $\eta_{\text{down}}$ | sub-form learning rate | $0.10$ |
| $\beta$ | retained-floor fraction of peak | $0.5$ |
| $h$ | decay half-life (days) | $45$ |

**Worked trace (Reflex, $w=0.75$).** Starting $A=0$ with repeated $\sim200$ ms runs ($q=0.8 \Rightarrow A_\star=80$): run 1 $\to +18.0 \to 18.0$; run 2 $\to +9.4 \to 27.4$; … the series eases toward $\sim80$ and then stalls. Pushing into the 90s requires sustained sub-$180$ ms ($q>0.95$) runs *and* still fights the headroom wall, while a 45-day layoff pulls the value back toward $0.5\,A_{\text{peak}}$. Maxing the full seven-vector radar now demands broad, sustained, near-elite play. Class thresholds (below) may be eased $\sim5$–$10$ pts in tuning, since $\ge 90$ now denotes genuinely elite, current form.

* **Dynamic Class Allocation:** The specific balance of these seven attributes maps to discrete character archetypes . For example:
    * $\text{Reflex} \ge 90$, $\text{Precision} \ge 85$, $\text{Focus} \ge 75 \longrightarrow$ **Arena Duelist** 
    * $\text{Precision} \ge 95$, $\text{Control} \ge 90 \longrightarrow$ **Sharpshooter** 
    * $\text{Speed} \ge 92$, $\text{Consistency} \ge 85 \longrightarrow$ **Speedrunner** 
    * Other available classes include: *Retro Veteran, Controller Wizard, Tactical Commander, Arcade Champion, Loot Goblin, Precision Hunter, and Reaction Master.* 

### 3.2 Friends List Architecture
* **Local Integrity:** The friends list operates completely detached from an external database server . It parses and displays imported Gamer DNA payloads[cite: 2].
* **Multi-Criteria Sorting Matrix:** Allows the user to sort their local friends list by any tracked profile element (e.g., highest Reflex score, most active Steam library, geographic proximity, or favorite color) .
* **Privacy Guard:** Strict architectural isolation ensures that a user can only ever export their own personal Gamer DNA profile; peer data remains completely local and confidential .
* **Manual Contact Fields:** Users can manually override or add private communication paths on a friend’s card (e.g., adding local phone extensions or internal Discord tags) .
* **Comparative Stat Radar:** Features a side-by-side radar graph overlay that contrasts two distinct friend profiles, showing exact structural gaps across the 7 core attribute vectors .

---

## 4. Minimum Viable Product (MVP) Tool Specifications

### 4.1 Reflex Lab

#### 4.1.1 Environment Latency Calibration Run
To protect results against hardware and software discrepancies, the Reflex Lab features a mandatory environment calibration step. Before a user begins a scored session, the engine runs a 3-click timing loop to establish a baseline system latency score ($t_{\text{link}}$). This latency offset is factored into the scoring engine to isolate real human response speed from system-induced delays:

$$\Delta t_{\text{calculated}} = t_{\text{raw}} - t_{\text{link}}$$

#### 4.1.2 Reaction Time Test
* **Functional Purpose:** Evaluates precise visual stimuli reaction intervals down to millisecond accuracy .
* **State Machine Loop:**
    1.  *State: Initialization* $\rightarrow$ User activates the challenge window[cite: 2]. Screen renders a steady, deep amber state[cite: 2]. Text prompts: "PREPARE YOUR REFLEXES... WAIT FOR NEON GREEN."[cite: 2]
    2.  *State: Variable Latency Hold* $\rightarrow$ The system triggers a random, server-independent clock delay generated between $t_{\min} = 2000\text{ms}$ and $t_{\max} = 6500\text{ms}$[cite: 2]. If a click occurs within this window, intercept with an immediate "FALSE START / FOUL DETECTED" penalty state[cite: 2].
    3.  *State: Flash Trigger* $\rightarrow$ Screen swaps to high-luminance neon green[cite: 2]. Simultaneously, a high-resolution performance clock starts tracking time ($t_0$)[cite: 2].
    4.  *State: Capture* $\rightarrow$ User triggers an input event[cite: 2]. The system immediately captures the current time ($t_1$)[cite: 2].
* **Telemetry Outputs:**
    * $\Delta t = t_1 - t_0$ expressed in integer milliseconds[cite: 2].
    * **Performance Grade Scale:** $\Delta t < 180\text{ms} = \text{S}$, $< 220\text{ms} = \text{A}$, $< 260\text{ms} = \text{B}$, $< 320\text{ms} = \text{C}$, $\ge 320\text{ms} = \text{F}$[cite: 2].
    * **Percentile Placement:** Evaluated using a static Gaussian distribution curve based on standard competitive human response benchmarks[cite: 2].
* **DNA Attribution Vector:** Modifies global $\text{Reflex}$ (+12 weight) and $\text{Focus}$ (+4 weight) . Generates a tailored Share Card .

#### 4.1.3 CPS (Clicks Per Second) Test
* **Functional Purpose:** Measures pure muscular endurance, single-target clicking velocity, and frequency consistency over fixed durations .
* **Operational Execution Modes:** Configurable durations of 1 second, 5 seconds, 10 seconds, and 20 seconds .
* **State Machine Loop:**
    * A central canvas button displays a retro crosshair target[cite: 2].
    * The first user input increments a click counter to $1$ and starts a countdown timer matching the selected duration[cite: 2].
    * Every subsequent valid input increments the click counter[cite: 2]. The system logs each click timestamp into an internal millisecond array to analyze pacing consistency[cite: 2].
    * When the timer hits zero, inputs are blocked and the results are calculated[cite: 2].
* **Telemetry Outputs:**
    * Total Valid Click Count ($C$)[cite: 2].
    * $\text{CPS} = C / \text{Duration}$[cite: 2].
    * **Consistency Score:** Calculated as the inverse variance of the time deltas between sequential clicks throughout the session, presented as a percentage[cite: 2].
* **DNA Attribution Vector:** Modifies global $\text{Speed}$ (+15 weight) and $\text{Consistency}$ (+5 weight) . Generates a tailored Share Card .

#### 4.1.4 Precision Click Test
* **Functional Purpose:** Gauges rapid spatial target acquisition, spatial precision, and cursor movement accuracy .
* **Operational Execution Loop:**
    * The system sets up a bounded canvas field ($800\text{px} \times 500\text{px}$)[cite: 2].
    * A circular target appears at a random coordinate within these bounds[cite: 2]. The target uses a fixed diameter ($d = 24\text{px}$)[cite: 2].
    * The target remains visible for a maximum lifespan of $t_{\text{target}} = 1200\text{ms}$[cite: 2]. If it isn't clicked within this window, it counts as a miss, disappears, and a new target spawns elsewhere[cite: 2].
    * Clicking a target increments the hit counter, removes the current target, and instantly spawns the next target coordinate[cite: 2]. A total session contains 30 sequential target spawns[cite: 2].
* **Telemetry Outputs:**
    * Total Hits, Total Misses, and an explicit $\text{Accuracy Percentage} = (\text{Hits} / \text{Total Clicks}) \times 100$[cite: 2].
    * **Precision Rating:** A derived index that factors in average distance from target center points alongside speed of acquisition[cite: 2].
* **DNA Attribution Vector:** Modifies global $\text{Precision}$ (+16 weight) and $\text{Control}$ (+6 weight) . Generates a tailored Share Card .

---

## 4.2 Mouse Lab

#### 4.2.1 Decoupled Input Tracking Engine
To track high-performance gaming hardware without display interference, Mouse Lab diagnostic metrics ignore the browser's standard rendering loops. Rather than checking updates at standard display ticks (60Hz/144Hz animation frames), the logging layer runs inside an asynchronous event handler. This configuration reads the hardware's microsecond timestamps directly from the OS input stream, ensuring accurate, high-frequency performance metrics.

#### 4.2.2 Mouse Polling Rate Test
* **Functional Purpose:** Estimates the raw communication frequency (reported in Hertz) between the mouse hardware driver and the browser context .
* **Operational Execution Loop:**
    * The user is prompted to continuously move their cursor in rapid, fluid circles inside a designated canvas capture box[cite: 2].
    * The interface listens to raw pointer input events over a continuous $3000\text{ms}$ tracking window.
    * The system logs high-precision timestamps for every input event to calculate the exact millisecond intervals between hardware packet arrivals.
* **Telemetry Outputs:**
    * **Average Polling Rate (Hz):** Renders the calculated frequency steps (e.g., 125Hz, 500Hz, 1000Hz)[cite: 2].
    * **Polling Consistency:** Measures the standard deviation of event time gaps[cite: 2]. High variance flags data drops or hardware instability[cite: 2].
    * **Hardware Grade:** Evaluates driver efficiency based on standard commercial hardware target steps[cite: 2].
* **DNA Attribution Vector:** Modifies global $\text{Mouse Performance}$ profiles (+10 tracking modifier) . Generates a tailored Share Card .

#### 4.2.3 Mouse Accuracy Test
* **Functional Purpose:** Gauges real-time dynamic track compliance, kinematic control, and target tracing path accuracy .
* **Operational Execution Loop:**
    * The interface generates a predefined vector track (e.g., an overlapping sine-wave profile or a continuous infinity loop) across a canvas element[cite: 2].
    * A pixel-art guide node moves steadily along the path at a uniform velocity[cite: 2].
    * The user must hover their cursor over the moving node, keeping it as close to the center point as possible throughout the tracking sequence[cite: 2].
    * The system measures the absolute pixel distance error ($e$) between the cursor's coordinate and the guide node's true center point at every frame refresh interval[cite: 2].
* **Telemetry Outputs:**
    * **Accuracy Score:** Computed as a percentage based on the cumulative distance error across the run[cite: 2].
    * **Control Index:** Reflects spatial drift stability, mapping smooth lines versus erratic cursor adjustments[cite: 2].
    * **Tracking Vector Score:** Identifies latency gaps, showing whether the user consistently trails behind or overshoots the moving target[cite: 2].
* **DNA Attribution Vector:** Modifies global $\text{Precision}$ (+8 weight) and $\text{Control}$ (+12 weight) . Generates a tailored Share Card .

---

### 4.3 Setup Lab

#### 4.3.1 eDPI Calculator
* **Functional Purpose:** Normalizes hardware settings across different systems to compute a player's true effective dots per inch (eDPI) .
* **Operational Execution Loop:**
    * Provides two straightforward numerical inputs: Hardware Mouse Sensitivity (DPI, e.g., 400, 800, 1600) and In-Game Multiplier Sensitivity (e.g., 1.25, 2.5) .
    * The engine evaluates the raw product on change events[cite: 2]:

$$\text{eDPI} = \text{Hardware DPI} \times \text{In-Game Sensitivity}$$

* **Telemetry Outputs:**
    * Absolute calculated eDPI value[cite: 2].
    * **Sensitivity Cohort Bracket:** Classifies the configuration profile into standardized spatial playstyle classes (*Low-Sens Anchor, Mid-Sens Skirmisher, High-Sens Twitch Raider*)[cite: 2].
* **DNA Attribution Vector:** Updates the client's global **Sensitivity Profile** records . Generates a tailored Share Card .

#### 4.3.2 Sensitivity Converter
* **Functional Purpose:** Converts a user's exact physical muscle memory rotation settings from a source game engine across to a target game environment .
* **Operational Execution Loop:**
    * Dropdown menus allow selecting a Source Game Engine and a Target Game Engine .
    * An input field captures the current numeric sensitivity value[cite: 2].
    * The calculator maps the input against internal, hardcoded engine scaling constants[cite: 2]:

$$\text{Target Sens} = \text{Source Sens} \times \left( \frac{\text{Source Scaling Factor}}{\text{Target Scaling Factor}} \right)$$

* **Telemetry Outputs:**
    * The exact equivalent output sensitivity required to preserve 360-degree physical rotation distances in the new game engine[cite: 2].
* **DNA Attribution Vector:** **None** (Explicitly designated as a pure, standalone processing utility) . Share Card generation is completely disabled for this utility .

---

### 4.4 Fun Lab

#### 4.4.1 Gamer DNA Report
* **Functional Purpose:** Pulls together all available local dataset points, aggregate session curves, and performance weights into a structured overview .
* **Operational Execution Loop:**
    * The engine checks the browser's local storage entries for completed laboratory records[cite: 2].
    * It passes the current statistical weights through an evaluation matrix to build a definitive multi-axis review profile[cite: 2].
* **Telemetry Outputs:**
    * **Assigned Combat Class:** The currently resolved character title matching the attribute profile .
    * **Identified Mechanical Strengths:** Highlights the top two tracking attributes with the highest relative velocity[cite: 2].
    * **Identified Operational Weaknesses:** Flagged areas where attribute values trail the user's primary scores[cite: 2].
    * **Tier Status Grades:** Overall numerical ratings mapped cleanly to retro ranking scales[cite: 2].
* **DNA Attribution Vector:** Generates the overarching **Gamer DNA Report Card** asset . Generates a tailored Share Card .

#### 4.4.2 Gamer Archetype Quiz
* **Functional Purpose:** Evaluates behavioral preferences, player psychological traits, and core motivations through a thematic text assessment .
* **Operational Execution Loop:**
    * Presents a series of 10 branching, situational questions styled around classic arcade scenarios .
    * Each multi-choice option injects specific hidden weights toward distinct gaming personality types[cite: 2].
* **Telemetry Outputs:**
    * **Resolved Gamer Archetype:** Displays a dominant personality title accompanied by a nostalgic description profile .
    * *Archetype Options:* Arena Duelist, Loot Goblin, Tactical Commander, Speedrunner, and variations .
* **DNA Attribution Vector:** Enriches the local user state with the designated **Gamer Archetype** identity tag . Generates a tailored Share Card .

#### 4.4.3 Game Night Planner
* **Functional Purpose:** A faithful, interactive port of the in-store "Game Finder" flowchart poster: walks the user through a short branch of multiple-choice questions and resolves to a curated, price-tagged shortlist of tabletop games matching their group.
* **Operational Execution Loop:**
    * The tree opens on a single root question ("How old are the players?") and branches on player age, headcount, win condition, session length, and — for the mid-length branch — a "what kind of gamer are you?" personality fork, mirroring the poster's arrows exactly.
    * Each answer is a single-tap option button; selecting one pushes the choice onto a path stack and advances to either another question node or a terminal result. A breadcrumb trail of the chosen options is rendered above the current question, and a **Back** control pops the last choice to return to the prior node.
    * Terminal nodes render a titled, subtitled results screen: one or more grouped game lists, each entry showing a price tier ($ / $$ / $$$, per the poster's legend), a linked game name (opening a Google search for the title in a new tab), and a one-line "what is it" blurb, followed by a price-tier legend footnote.
    * A **Start Over** control on the results screen resets the path stack and returns to the root question.
* **Telemetry Outputs:** None. The tool surfaces only the resolved shortlist on screen; no score, rating, or numeric result is computed or persisted beyond the completion credit below.
* **DNA Attribution Vector:** **None** — pure fun, no attribute delta. Reaching the first result of a session (a local `logged` flag suppresses re-firing on later lookups within the same visit) calls the shared generator recorder, which increments the global run count and a per-tool usage counter on every visit, but credits `toolsCompleted` only the very first time this tool is ever completed on the client, then re-evaluates achievements. No achievement in this document's Achievements catalog currently checks against this tool.

---

### 4.5 Tabletop / RPG Lab

#### 4.5.1 Character Forge
* **Functional Purpose:** A rules-aware, auto-calculating character sheet builder that stores a full multi-character roster locally and feeds the global Gamer DNA metagame. It ships in two structurally distinct sheet systems sharing one roster and one persistence layer: a fully-modeled **D&D 5e** mode with a lean SRD (CC-BY) rules core driving live-calculated derived stats, and a **Custom / Other System** mode that discards D&D-specific math entirely in favor of free-form, player-defined sections and typed fields for any tabletop system. Both modes expose the same one-click dice, JSON export/import, browser print-to-PDF, and Share Card surfaces.
* **Operational Execution Loop:**
    * **Roster (`Views.charForge`, `#/rpg/forge`):** The landing view lists every saved character as a card in a `forge-roster` grid, tinted by each character's own accent color (`--cc`). D&D 5e cards surface HP, live-calculated AC, and proficiency bonus; Custom cards surface section/field counts instead. Cards route to the shared sheet editor at `#/rpg/forge/sheet` on click, and each carries its own delete (with a confirm prompt).
    * **Three Creation Paths, Two Sheet Systems:** "＋ New Character" opens a chooser modal with three options: **Guided Builder** (`#/rpg/forge/new`, `Views.charWizard`) — a four-step wizard (Identity → Ability Scores → Skills → Review) that still produces a standard 5e sheet, just assembled interactively; **Blank 5e Sheet** — calls `CharForge.create('dnd5e')` and drops straight into the full auto-calculating 5e editor; and **Custom / Other System** — calls `CharForge.create('custom')` and opens the system-agnostic editor. Only the latter two are structurally different sheet *systems* (`ch.system === 'dnd5e'` vs `'custom'`); the Guided Builder is an alternate on-ramp into the same 5e sheet.
    * **Guided Builder specifics:** Ability-score assignment supports four methods — Standard Array (`[15,14,13,12,10,8]`), **Point Buy** (27-point budget, scores 8–15, cost table `{8:0,9:1,10:2,11:3,12:4,13:5,14:7,15:9}`), **Roll 4d6** (rolls six pools of `4d6` drop-lowest via `DiceEngine.roll({n:4,sides:6,op:'kh',k:3})`), and Manual entry. Skill selection auto-grants the two fixed background skills (`BG_SKILLS`) and lets the player pick the class's remaining allotment from a per-class eligible list (`CLASS_SKILLS`, count 2–4 depending on class, Rogue highest at 4). On "Create Character" the wizard computes starting HP and hands the finished draft to `CharForge.addBuilt`.
    * **D&D 5e rules-math core (`DnD5e` module):** All derived numbers are pure functions of the character object, recomputed live on every edit — nothing is cached:
        * Ability modifier: `mod(score) = floor((score − 10) / 2)`.
        * Proficiency bonus: `profBonus(level) = ceil(clamp(level, 1, 20) / 4) + 1`.
        * Saving throw: `saveBonus = abilMod(ability) + (proficient ? profBonus(level) : 0)`.
        * Skill check: `skillBonus = abilMod(governing ability) + profBonus(level) × skillProf`, where `skillProf` is a tri-state per skill (0 none, 1 proficient, 2 expertise).
        * Passive Perception: `10 + skillBonus(perception)`.
        * Initiative: `abilMod(dex) + initiativeMisc` (a manually-editable flat pill for feats/items that modify initiative).
        * Armor Class: `acOverride` if the player has set one, otherwise `10 + abilMod(dex)` — i.e. the engine only models unarmored/Dex-based AC natively; any armor, shield, or class-feature AC bonus must be entered manually via the AC Override pill.
        * Spellcasting (only when `spellAbility` is set — auto-populated per class, e.g. Wizard→INT, Cleric→WIS, Sorcerer→CHA, or left blank for non-casters): spell modifier `= abilMod(spellAbility)`; Spell Save DC `= 8 + profBonus(level) + spellMod`; Spell Attack bonus `= profBonus(level) + spellMod`.
        * Starting HP: `hitDie + conMod` at level 1, then `floor(hitDie/2) + 1 + conMod` added per level thereafter (average-roll convention), floored at a minimum of 1.
        * The 18 SRD skills, 12 classes (hit die / saving-throw pair / casting ability), 9 species (base speed only), 13 backgrounds, and 9 alignments are all seeded as lean SRD defaults the player can freely override; the engine's math is otherwise fully general and does not enforce SRD legality.
    * **Sheet editor — six tabs (`Views.charSheet`):** Core (identity, six abilities with per-ability roll buttons, saving throws and all 18 skills with click-to-cycle proficiency dots and click-to-roll rows), Combat (AC/Initiative/Speed pills, HP/Temp HP/Hit Dice tracking, a 3-pip Death Saving Throw tracker per success/failure, a free-text Conditions area, and an editable Attacks table where clicking a row rolls to-hit), Spells (spellcasting-ability selector, live Save DC/Attack pills, nine level-1–9 slot trackers each with used/total counters, and a Spells Known/Prepared table), Gear (five-denomination currency strip — pp/gp/ep/sp/cp — and an inventory table), Features (free-text Features & Traits and Proficiencies & Languages), and Bio (six free-text fields: personality, ideals, bonds, flaws, appearance, backstory). Every numeric roll surface (ability checks, saves, skills, attacks, spell attacks) opens the shared **Roll modal** (`forgeRoll`), which rolls a `d20` and supports one-click Advantage/Disadvantage (keep-highest/keep-lowest of two dice) by reusing the shared `DiceEngine`.
    * **Custom / system-agnostic mode (`Views.customSheet`):** Free-form sheet for non-5e systems. The player names the system (`systemName`) and builds an arbitrary number of sections (`addSecBtn`), each holding an arbitrary number of typed fields (`addField`) chosen from five field types — Text, Number, Long Text, Counter (paired current/max values), and Roll (a stored bonus plus a one-click `d20+bonus` roll button). A standalone "Quick Dice" notation box (`DiceEngine.parse`) lets the player roll arbitrary strings (e.g. `2d6+3`) without needing a defined field.
    * **Persistence, export & import (`CharForge` store):** The full roster lives under its own dedicated `localStorage` key, `playtools.charforge.v1`, entirely separate from every other tool's state. Supported operations: `create` (either sheet system), `addBuilt` (wizard hand-off), `list`/`get`/`active`/`setActive`, `save`, `remove`, `duplicate`, and `importChars` (accepts a single character object, an array, or a `{chars:[...]}` wrapper; each imported record is defensively merged onto a fresh blank of the correct system so missing fields never crash the sheet). "⬇ Export" downloads the active character as pretty-printed JSON via a generic `Blob`-based helper (`forgeDownload`); "⬆ Import JSON" reverses the trip.
* **Presentation Layer:** The roster and sheet editor share the tool's `panel`/`forge-bar` chrome; each character card and the sheet header both tint via a per-character accent color stored on the character (`ch.accent`, default `#16f2c8` for 5e / `#7c5cff` for Custom). The 5e sheet's six tabs and the Guided Builder's four-step wizard both persist/restore the player's last-open tab via `Store.getPrefs().forgeTab`. "🖨 Print / PDF" opens a separate `about:blank` window styled in a serif, ledger-like print stylesheet (independent of the app's own CRT theme) and auto-invokes `window.print()` — this is a distinct rendering path from the live editor and from the Share Card, built by hand-assembling the character's saves, skills, spells, attacks, inventory, and bio into semantic HTML.
* **Telemetry Outputs:**
    * On every roster mutation the store mirrors two counters into the shared Gamer DNA profile — `charCount` (roster size) and `charMaxLevel` (highest level across all saved characters) — and immediately calls `Ach.evaluate({tool:'charforge'})` so the achievement set below reacts in real time.
    * **Achievements:** **Character Creator** (`forge_initiate`, "Build your first character") fires once `charCount ≥ 1`; **Party of Adventurers** (`forge_party`, "Keep a full party of 4 or more saved characters") at `charCount ≥ 4`; **Seasoned Adventurer** (`forge_veteran`, "Build a character of level 5 or higher") at `charMaxLevel ≥ 5`; **Epic Hero** (`forge_legend`, "Take a character all the way to level 20") at `charMaxLevel ≥ 20`. All four are pure counter thresholds — none require the character to still exist at evaluation time, only that the roster's high-water marks were reached at some point.
    * Every in-sheet dice roll (ability checks, saves, skills, attacks, spell attacks, death saves, and the Custom mode's Quick Dice/Roll-field rolls) is credited through the exact same pipeline as the standalone Dice Roller cabinet — `recordDiceRoll` plus `Ach.evaluate({tool:'dice', total, nat20, sides:20})` — meaning a natural 20 rolled inside a Character Forge sheet can also unlock the Dice Roller's own **Natural 20** and **High Roller** achievements.
    * Generates a tailored Share Card (`ShareCard.open({lab:'RPG', tool:'Character Forge', ...})`) from either mode: the 5e sheet's card glyph is the character's class icon (e.g. ⚔️ Fighter, 📜 Wizard) with metrics `[Name → Species/Class/Level, HP → cur/max, AC, Prof bonus]`; the Custom sheet's card glyph is a fixed 🎲 with a metric list built dynamically from the character's name/system plus up to three of its own non-long-text fields (label/value pairs, counters rendered as `cur/max`).
    * *Cross-reference:* per `DD/CloudSync_DD.md`, the `charCount`/`charMaxLevel` counters incidentally ride along in the synced Gamer DNA `counters` blob, but the full character roster itself (`playtools.charforge.v1`) is a separate `localStorage` key that Cloud Account sync never touches — a player's actual characters stay local-only even if their profile is cloud-synced.
* **DNA Attribution Vector:** Applies a single, flat, one-time credit the moment the very first character (of either sheet system) is ever added to an empty roster — guarded so it cannot re-fire on subsequent characters: `Attr.applyVector({strategy:8, focus:4}, 1)`, matching the tool registry's declared `dna:'Strategy +8 · Focus +4'`. The same first-character event also credits one completed-tool run (`toolsCompleted++`, `runs++`) via `Store`. Unlike the Dice Roller's per-throw, luck-scaled Strategy delta, Character Forge's DNA contribution does not scale with roster size, character level, or sheet complexity — building a tenth character or a level-20 legend grants no further vector credit beyond what the achievements above separately unlock.

#### 4.5.2 Dice Roller
* **Functional Purpose:** Provides a complete, client-side polyhedral dice engine for tabletop and role-playing sessions, faithfully reproducing physical dice behavior with the arcade presentation layer wrapped around it . Unlike the skill diagnostics, this cabinet measures fortune rather than mechanics, treating each throw as a luck event that still feeds the global metagame .
* **Operational Execution Loop:**
    * **Standard Polyhedral Set:** Single-tap die selection across the full canonical set — $d4, d6, d8, d10, d12, d20,$ and $d100$ .
    * **Quantity & Modifier:** A quantity field rolls $N$ dice of the chosen type in one throw, and a signed flat modifier $M$ is applied to the aggregate. Each individual die face is surfaced alongside the grand total .
    * **Advantage / Disadvantage:** For the $d20$, a roll-mode toggle issues the classic tabletop mechanic — two dice are rolled and the higher (Advantage) or lower (Disadvantage) is kept, with the discarded die rendered struck-through for transparency .
    * **Dice Notation Parser:** A text input accepts standard tabletop grammar of the form `NdS[kh|kl|dh|dl]K[±M]` — for example `2d6+3`, `4d6kh3` (keep highest 3), `8d6-1`, or a bare `d20`. The parser validates the string, rejects malformed input, and bounds die quantity to protect the client .
    * **RPG Presets:** One-tap shortcuts cover common tabletop throws — Attack ($d20$), Initiative ($d20+2$), Fireball ($8d6$), Sneak ($3d6$), Percentile ($d100$), and a six-line **Ability Score** generator that rolls $4d6$ drop-lowest six times to produce a full attribute array .
* **Presentation Layer:** Each throw animates a tumbling, CRT-styled dice tray accompanied by retro WebAudio blips. A **natural 20** ignites a gold critical glow and a **natural 1** flags a red fumble state. A muteable sound control and full deference to the global Reduce-CRT motion preference are provided for accessibility . A session-scoped **Roll Log** retains the most recent throws .
* **Telemetry Outputs:**
    * The kept-dice array, the discarded dice (where keep/drop applies), the applied modifier, and the resolved **Total** .
    * **Best Total:** The highest aggregate the user has ever produced on the cabinet, persisted to the local profile .
    * **Natural 20 Counter:** A running tally of critical $d20$ results stored in the client profile .
* **DNA Attribution Vector:** Applies a luck-scaled delta to the global $\text{Strategy}$ vector. The applied quality is normalized against the theoretical range of the kept dice (a luckier throw yields a larger delta):

$$q = \frac{\sum_{i}\,r_{i} - n_{\text{kept}}}{n_{\text{kept}} \cdot S - n_{\text{kept}}}, \qquad \text{Strategy}_{\text{new}} = \min\!\left(100,\ \text{Strategy}_{\text{old}} + 6 \cdot q\right)$$

  * To preserve Gamer Score integrity against single-click repetition, a dice session is registered as a *completed tool* only on the first throw, while best totals, the Natural 20 counter, and the Strategy delta continue to update on every subsequent roll .
  * **Achievements:** Unlocks **Natural 20** (roll a natural 20) and **High Roller** (resolve a single throw totalling $\ge 50$) . Generates a tailored Share Card .

#### 4.5.3 NPC Generator
* **Functional Purpose:** Provides a one-tap disposable-NPC forge for game masters, assembling a complete tabletop character sketch — identity, build, ability scores, and roleplay hooks — from static curated word-lists, without requiring the persistence or field-entry overhead of the Character Forge. As a replayable generator, it is scored like the Dice Roller and its RPG Lab siblings: honest on first use, tolerant of endless re-rolling thereafter.
* **Operational Execution Loop:**
    * **Name Assembly:** A given name is drawn from a 30-entry roster (e.g. `Aldric`, `Cassia`, `Nox`, `Zara`), with a 50% chance of appending an epithet from a 14-entry list (e.g. `the Bold`, `Ironhand`, `Stormborn`).
    * **Race, Class & Alignment:** One entry each is drawn independently from a 12-option race table (`Human`, `Elf`, `Half-Elf`, `Dwarf`, `Halfling`, `Half-Orc`, `Gnome`, `Tiefling`, `Dragonborn`, `Goblin`, `Aasimar`, `Firbolg`), a 12-option class table (`Fighter`, `Wizard`, `Rogue`, `Cleric`, `Bard`, `Ranger`, `Paladin`, `Barbarian`, `Druid`, `Sorcerer`, `Warlock`, `Monk`), and the full 9-point alignment grid (`Lawful Good` through `Chaotic Evil`).
    * **Ability Scores:** All six abilities ($\text{STR, DEX, CON, INT, WIS, CHA}$) are rolled independently through the shared `DiceEngine`, each using the standard $4d6$-keep-highest-3 method, matching the Dice Roller's own Ability Score preset.
    * **Quirk & Secret:** One roleplay quirk (drawn from a 14-entry table, e.g. *"never breaks eye contact"*, *"keeps a pet raven named Sorrow"*) and one hidden secret (drawn from a 12-entry table, e.g. *"is secretly nobility in hiding"*, *"owes a debt to a devil"*) are appended to round out the NPC as usable roleplay hooks.
    * All fields regenerate together on a single **Generate NPC** button press; there are no independent re-roll controls per field.
* **Telemetry Outputs:**
    * The assembled name, race, class, alignment, ability score array, quirk, and secret are rendered directly on-panel; no historical best or running roll log is retained beyond the current card.
    * **NPCs Rolled Counter:** A running tally (`counters.npcsRolled`) of every generation, incremented on each press regardless of prior use.
    * **Share Card:** Surfaces under the `TABLETOP / RPG` lab label with the glyph 🧙, reporting `Name`, `Build` (race + class), and `Align` as its three metrics, with the class itself used as the card's designation and no badge.
* **DNA Attribution Vector:** Applies a fixed, non-random delta to two global attributes on every generation — $\text{Strategy} \mathrel{+}= 4$ and $\text{Focus} \mathrel{+}= 2$, scaled by a constant $0.55$ multiplier via `Attr.applyVector({strategy:4, focus:2}, 0.55)` — unlike the luck-scaled Dice Roller vector, this delta does not vary with the quality of the roll.
    * To preserve Gamer Score integrity against single-click repetition, the tool is registered as a *completed tool* only on the first generation, while the NPCs Rolled counter and the DNA delta continue to apply on every subsequent press.
    * **Achievements:** None. No entry in the Achievements `DEFS` array tests against `npc`, `rpg_npc`, or the `npcsRolled` counter — the NPC Generator currently unlocks no dedicated achievement.

#### 4.5.4 Initiative Tracker
* **Functional Purpose:** A pure combat-management utility for the tabletop table — it maintains a live turn order and per-combatant HP pool for the duration of an encounter, deliberately outside the Gamer Score scoring model. Unlike the Dice Roller's fortune-measuring cabinet, this tool tracks table state rather than resolving a single random event, and its persistence is scoped accordingly: encounter state is kept in a dedicated local-only key, `pt_initiative`, distinct from the main GamerDNA profile and — per the Cloud Sync spec — never synced to the cloud, full stop.
* **Operational Execution Loop:**
    * **Combatant Entry:** A form accepts a **Combatant** name (required), a signed **Init Mod** integer (defaults to `0`), and an **HP** value (minimum $1$, defaults to $10$, doubling as the combatant's tracked max HP). Pressing Enter in the name field or clicking **+ Add** appends the combatant to the encounter list and clears the form for the next entry.
    * **Auto-Roll Initiative:** **🎲 Roll Initiative** throws one $d20$ per combatant via the shared dice engine, adding each combatant's individual Init Mod to the die (`1d20 + mod`), then sorts the full roster **descending** by the resulting total to establish the turn order. Rolling re-arms the encounter: the active-turn pointer resets to the first combatant and the round counter resets to $1$.
    * **Turn & Round Advancement:** **⏭ Next Turn** advances the active-turn pointer by one slot; on wrapping past the last combatant it returns to the top of the order and increments the **Round** counter.
    * **HP Tracking:** Each roster row exposes **−** / **+** steppers that adjust that combatant's current HP by $1$, floored at a minimum of $0$ — no upper cap is enforced against max HP. A combatant reduced to $0$ HP is rendered with a struck-through name and a danger-colored HP readout, but remains in the turn order (it is not auto-removed or auto-skipped). A **✕** control removes a combatant outright, clamping the active-turn pointer if the removal shortens the list past it.
    * **Reset:** **♻ Reset** discards the entire encounter — roster, turn pointer, and round counter — back to an empty state.
    * **Status Line:** Reports the current round, the live combatant count, and (once a roll has been made) whose turn is active.
* **Telemetry Outputs:** Deliberately minimal. The tool keeps no roll log, best-roll record, or per-combatant history — only the live encounter snapshot (`list`, `turn`, `round`) persisted to `pt_initiative` for continuity across reloads. No Universal Share Card is generated by this tool, and no achievement in the current `Ach` module set (`DEFS`) references it — there is no initiative-specific unlock today.
* **DNA Attribution Vector:** Because adding combatants is a repeatable, low-effort UI action, the tool is explicitly guarded against Gamer Score inflation: a session-local `credited` flag ensures both the profile-level credit and the DNA nudge fire **once per session, on the first combatant added** — not once per combatant and not once per roll:

    ```js
    if(!credited){ recordInitiative(); credited=true; Attr.applyVector({strategy:3}, 0.5); }
    ```

    `recordInitiative()` mirrors this restraint at the profile layer: it increments `toolsCompleted` only the first time the encounter tracker is ever used (guarded by `bests.rpg_init`), while a separate `counters.combatsTracked` tally increments once per session the tracker is engaged (not per combatant, per roll, or per turn) — matching the registry's flat **Strategy +3** delta with no scaling by encounter size, roll outcome, or HP swings.

#### 4.5.5 Quest & Tavern
* **Functional Purpose:** A dual-mode improv-seed generator for Dungeon Masters, assembling short-form quest hooks and tavern flavor text on demand from fixed word lists (`RPG_DATA.quest`, `RPG_DATA.tavern`), so a DM can populate a session with disposable narrative color without leaving the table.
* **Operational Execution Loop:**
    * **New Quest:** Draws one entry each from five independent pools — `patron` (10 quest-giver archetypes), `verb` (10 task verbs), `target` (10 objectives), `twist` (8 complications), and `reward` (8 payouts) — and composes them into a three-line hook: a *"[Patron] needs you to [verb] [target]"* line, a **Complication** line, and a **Reward** line.
    * **New Tavern:** Draws from four independent pools — `adj` (12 adjectives) and `noun` (12 nouns) combined into a `The [Adj] [Noun]` establishment name, plus a standalone `keep` (8 barkeep descriptions) and `rumor` (8 overheard rumor lines) — rendered as a name, a "Run by [keeper]" line, and an "Overheard: '…[rumor].'" line.
    * Selection is uniform-random per pool via the shared `rpgPick(a)` helper (`a[Math.floor(Math.random()*a.length)]`) — no weighting, seeding, or exclusion of prior results; repeats across successive rolls are possible.
    * Both modes are one-tap: a **📜 New Quest** button and a **🍺 New Tavern** button sit side by side, and the tool auto-rolls one quest on load.
* **Telemetry Outputs:**
    * No score, grade, or best-value tracking is surfaced to the player — the output panel shows only the freshly generated text.
    * Each roll (either mode) increments the shared `d.runs` counter and a `d.counters.questsRolled` tally, and credits `toolsCompleted` once on the first-ever roll via `d.bests.rpg_quest` — mirroring the Dice Roller's first-throw dedup pattern, but with no persisted "best" value beyond the completion flag.
    * **Share Card:** Each roll opens a card (`lab:'TABLETOP / RPG'`) distinct per mode — a Quest card (tool `'Quest Generator'`, glyph 📜, designation **Quest Giver**) surfacing `Objective` (verb + article-stripped target) and `Reward`; or a Tavern card (tool `'Tavern Generator'`, glyph 🍺, designation **Barfly**) surfacing `Tavern` (full name) and `Barkeep`. Neither card carries a badge.
* **DNA Attribution Vector:** No achievements are defined for this tool — the `Ach.DEFS` array (PlayTools.html) contains no `test:` referencing `'quest'` or `'rpg_quest'`. Each roll applies a flat (non-performance-scaled) delta directly via `Attr.applyVector`, differing by mode:
    * **New Quest:** `Attr.applyVector({strategy:4}, 0.55)` — Strategy only.
    * **New Tavern:** `Attr.applyVector({strategy:2, focus:2}, 0.5)` — split across Strategy and Focus.

---

## 5. Expansion Tool Modules

### 5.1 Reflex Lab Expansion Pack
* **Flick Trainer:** Spawns single targets that vanish incredibly fast ($t < 400\text{ms}$) to evaluate muscle memory snap speed . Outputs include a raw Flick Performance Score, accuracy deltas, and speed ratings .
* **Tracking Trainer:** Continuous directional changes on target paths to measure follow tracking consistency . Outputs are split across tracking metrics and control scores .
* **Double Click Test:** Measures the millisecond transition intervals between rapid double clicks to test double-click registration speed .
* **Spacebar Speed Test:** A 10-second keyboard tapping test that tracks maximum cycles per second on keyboard switches . Outputs are shown as raw Taps Per Second .

### 5.2 Mouse Lab Expansion Pack
* **Lift-Off Distance Test:** A semi-manual hardware tuning widget that maps tracking dropouts when a mouse sensor is lifted off a surface . Outputs a localized Lift Score rating .
* **Drag Click Test:** Captures specialized rapid-frictional clicking telemetry to track maximum drag-click frequencies over short bursts . Outputs a specific Drag-Click CPS index .
* **Jitter Click Test:** Measures high-frequency forearm muscle vibration clicking speeds while monitoring hand stability . Outputs a clean Jitter Score .
* **Mouse Stability Test:** Traces vector drawing accuracy along horizontal straight lines to detect unintended pointer drifting or sensor jitter . Outputs a precise Line Stability Score .

### 5.3 Setup Lab Expansion Pack
* **FOV Calculator:** Matches display aspect ratios with seating distances to output the mathematically perfect field-of-view configuration for first-person visibility .
* **Aspect Ratio Calculator:** Resolves pixel scaling relationships across layout boundaries to compute identical scaling dimensions for custom resolutions .
* **Refresh Rate Calculator:** Evaluates monitor frame pacing consistency against target hardware capabilities to output display configuration recommendations .
* **Gaming Session Planner:** An interactive tool for setting up balanced play schedules, integrating rest breaks, hydration alerts, and session timing targets . Outputs an interactive, retro Play Schedule Card .

### 5.4 Fun Lab Expansion Pack
* **Random Challenge Generator:** Automatically generates creative gameplay modifiers for popular titles (e.g., *No Reload Run, Single Weapon Only, Full Stealth Extraction*) . Outputs an arcade-style Challenge Card asset .
* **Username Generator:** Generates nostalgic, retro-arcade style usernames by mixing gaming terms with vintage tech prefixes . Outputs a list of shareable gamertags .
* **Clan Name Generator:** Generates striking, competitive team identities based on retro fighting and arcade styles . Outputs branding concepts .
* **Loadout Generator:** Creates randomly balanced weapon and loadout combinations for popular tactical shooters to mix up casual gameplay .
* **Gamer Setup Roast:** A playful interface where users type in their hardware specs and desk setups, and the engine generates a humorous, retro-styled critique card .

### 5.5 Retro Arcade Module *(superseded — see below)*
> **This section is stale.** Only **StarDodger** and **Mnemonic** from the
> original four-game roster below actually shipped under those names.
> **Asteroid Survival** and **Reflex Rush** were never built. Instead, the
> Retro Arcade grew into a much larger roster with individual design docs:
> **Cold Stack** (Klondike solitaire, `ColdStack_DD.md`), **Overdrive**
> (pseudo-3D racer, `Overdrive_DD.md`), **Jack-In** (Blackjack, `JackIn_DD.md`),
> **Ecto** (Galaga-style shooter, `Ecto_DD.md`), **Crossload** (Frogger-style,
> `Crossload_DD.md`), **Mac Pan** (Pac-Man-style, `MacPan_DD.md`), **Defrag**
> (match-3, `Defrag_DD.md`) — all fully implemented — plus seven more cabinets
> documented retroactively 2026-08-06 (ROADMAP.md backlog item A2): **Anaconda**
> (`Anaconda_DD.md`), **Brick Breaker** (`BrickBreaker_DD.md`), **Hopper
> Popper** (`HopperPopper_DD.md`), **SighMan** (`SighMan_DD.md`), **Pack
> Hacker** (`PackHacker_DD.md`), **Sudoku** (`Sudoku_DD.md`), **B0ggle**
> (`B0ggle_DD.md`). Arcade A/S-grade clears also pay NetCoin directly (see
> `Rig_DD.md` §10), a cross-system hook this section predates.
>
> Original (partially stale) roster, kept for history:
* **StarDodger:** A retro vertical-scrolling mini-game where the player moves a single-pixel ship left and right to dodge falling block obstacles . Metrics are tied to a total Survival Score . *(Shipped.)*
* **Asteroid Survival:** A top-down space arena mini-game focusing on continuous multi-directional navigation and obstacle destruction . Outputs a classic high-score value . *(Never built under this name.)*
* **Mnemonic:** A rapid-fire grid pattern matching challenge designed around retro chiptune sounds . Evaluates visual memory recall ratings . *(Shipped.)*
* **Reflex Rush:** A high-speed, multi-key visual matching sequence that tests rapid keyboard responses . Outputs a Reflex Score . *(Never built under this name.)*

---

## 6. Subsystem Visual Designs & Social Share Engines

### 6.1 The Universal Share Card Framework
Every laboratory tool (excluding the Sensitivity Converter) feeds its completion data into a standard card rendering canvas component .

#### 6.1.1 Card Structural Hierarchy
The generated media layout strictly follows a classic arcade trading card structure :

+---------------------------------------------------+
|               [RETRO LABORATORY TAG]              |
|  Tool Reference Name                              |
+---------------------------------------------------+
|                                                   |
|   [VISUAL PERFORMANCE GLYPH / PIXEL CHARACTER]    |
|                                                   |
+---------------------------------------------------+
|  Primary Operational Metric: (e.g., 183ms)        |
|  Assigned Rank Grade:        (e.g., Grade S)      |
|  Calculated Designation:     (e.g., FPS Veteran)  |
+---------------------------------------------------+
|  [ARCADE BADGE GLYPH] : Lightning Reflexes        |
+---------------------------------------------------+
| [SHARE TO SOCIALS]          [DOWNLOAD IMAGE ASSET]|
+---------------------------------------------------+

#### 6.1.2 Concrete Layout Implementation Example
* **Header Context:** Reflex Laboratory Report 
* **Core Performance Metric:** 183ms Response Window 
* **Resulting Efficiency Mark:** Grade A Evaluation 
* **Calculated Persona Designation:** Retro FPS Veteran Archetype 
* **Earned Badge Modifier:** Lightning Reflexes Vector Badge 

### 6.2 Client-Side Achievement Architecture
* **Persistence & Security Protocol:** All achievement unlocks use the browser's persistent local storage engine . Unlocks and states happen completely client-side without hitting external databases . Consistent with the casual nature of a public arcade, no client-side encryption, masking, or code obfuscation layers are built into the storage engine. Users are completely free to view, adjust, or edit their scoring variables using standard browser developer consoles.
* **Core Achievement Lineup:**
    * *First Victory:* Triggered by completing any initial laboratory tool benchmark .
    * *Reaction Master:* Triggered by securing an S-Grade rating on the visual reaction time test .
    * *Precision Hunter:* Earned by hitting a uniform accuracy score $\ge 98\%$ on the target selection test .
    * *Controller Wizard:* Awarded for completing setup configuration maps across 3 separate platforms .
    * *Arcade Champion:* Earned by accumulating $\ge 10{,}000$ points across the Retro Arcade cabinets (`d.arcadePoints`), matching this description. **Fixed 2026-08-06 (ROADMAP.md A1):** the shipped condition previously gated on total Gamer Score ≥ 10,000 (a global, not arcade-specific, gate) — corrected to check `arcadePoints` directly.
    * *Speed Demon:* Triggered by maintaining a clicking pace $\ge 12\text{ CPS}$ inside the Reflex Lab .
    * *Tracking Expert:* Earned by keeping path deviation error under 4 pixels on the Mouse Accuracy tracking test .
    * *Setup Specialist:* Unlocked after calculating configurations across all Setup Lab calculators .
    * *Natural 20:* Triggered by rolling a natural 20 on a $d20$ in the Tabletop / RPG Dice Roller .
    * *High Roller:* Earned by resolving a single dice throw totalling $\ge 50$ .
    * *Completionist / Achievement Hunter:* Awarded for unlocking all other core operational milestones .
* **Beyond this core lineup:** the achievement roster has grown to several
  dozen entries, one set per expansion tool and per arcade cabinet (e.g. Lift-Off
  Master, Drag Lord, Jitter Storm, Steady Hand, Hardware Whisperer, Pixel Pilot,
  Untouchable, Gunslinger, plus a themed set for every Retro Arcade cabinet).
  These are undocumented here by design — see each cabinet's own DD (§ list
  above) for its achievement table.

### 6.3 Interface Art Direction & Presentation Layer
* **Visual Style Guide:** Heavy emulation of classic arcade machine setups and CRT scanline video behaviors .
* **Styling Elements:**
    * *Video Simulation:* Custom overlay filters that mimic old-school CRT screens, complete with curved edges, scanlines, and slight phosphor persistence effects .
    * *Framing & Containers:* UI panels are designed to look like neon-rimmed arcade cabinets and physical dashboards .
    * *Dynamic Graphics:* Responsive, pixelated assets and retro vector elements that change based on performance outcomes .
    * *Illumination Accents:* Bright, neon accents and ambient glows that stand out clearly against deep, dark background finishes .
* **Interface Tone:** Fun, highly interactive, competitive, and clearly nostalgic .





# PlayTools: MVP Product Design Document
**Version:** 1.0 
**Author:** Playology Entertainment 
**Status:** Production-Ready Specification Document

---

## 1. Executive Summary

### 1.1 Product Definition
**PlayTools** is a browser-based collection of gaming utilities, diagnostics, mini-games, calculators, and interactive challenges engineered around a cohesive retro arcade experience . Unlike traditional utility websites that function as cold, transactional interfaces , PlayTools transforms every micro-tool into an engaging, gamified experience . Each interaction yields granular performance metrics, a definitive grade, and a visually striking, shareable results card optimized for competitive social sharing .

### 1.2 Strategic Intent & Primary Goal
The primary objective of PlayTools is not simply helping users solve a tactical problem (e.g., calculating sensitivity or testing mouse polling rates) . Instead, it is designed to create highly entertaining, friction-free, and memorable experiences that organically leverage competitive psychology to stimulate viral growth and social proof loops . 

### 1.3 Core Principles
* **Zero Authentication (No Account Required):** Immediate onboarding . Friction is eliminated by avoiding registration walls; all profile data persists anonymously on the user's client .
* **Browser-Only Execution:** Absolute zero installation . All operations, diagnostics, calculations, and rendering occur entirely in the client browser .
* **Sub-Second Asset Delivery (Fast Loading):** Exceptionally lightweight bundle footprint utilizing aggressively optimized assets to ensure instant retro arcade rendering .
* **Immersive Retro Arcade Aesthetics:** Heavy visual adherence to standard 8-bit/16-bit arcade ergonomics, including CRT monitor styling, glowing neon paths, and pixelated glyphs .
* **Quantifiable Output Engine:** Every tool natively outputs a discrete numeric score, an academic performance grade, or a unique, collectible character profile .
* **Universal Shareability:** Every micro-experience terminates in a data-rich visual asset designed for single-click export or platform sharing .
* **Overarching Gamer Metagame:** Individual tool performance feeds upward into a centralized progression matrix, tracking an encompassing Gamer Score and title tier .

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
* **Social Handle Arrays:** Profile linking addresses for Twitch, YouTube, X (Twitter), TikTok, and Instagram .

#### 3.1.2 Platform Aggregation & Integration Profiles
Users can manually declare or import their presence profiles across digital gaming ecosystems . The integration supports two distinct processing tracks:
1. **Manual Entry Panel:** A dedicated retro dashboard interface allowing users to manually fill out key performance indicators (e.g., Total Wins, Kill/Death Ratio, Rank Tier) for individual ecosystems.
2. **Text-Block Copy/Paste Parsing Layer:** A text import block where users can copy and paste raw console snippets or public profile JSON text dumps. The client parsing engine reads this input string, extracts key performance properties, and maps them to the local profile data structures.

* **Supported Platforms:** Steam, Xbox Live, PlayStation Network, Nintendo Network, Riot Games, Epic Games Store, Twitch, and Discord .
* **Aggregation Processing:** Compiles total games owned, active playtime across major categories (FPS, RPG, RTS, Sim), rare achievements unlocked, and live verification status badges . This aggregated view is compiled directly on the client[cite: 2].
* **Export & P2P Sharing Pipeline:** The system generates an interactive, styled, self-contained HTML file embedding both the data object payload and custom, inline retro styling .
    * When a user hits the "Share with Friend" button, the engine generates this standalone HTML asset and targets the system's default email client using a structured mail context helper.
    * The email is dynamically pre-populated with an arcade-themed Subject line (e.g., `[PlayTools] Challenge Issued by Your Friend!`) and an instructional Body message.
    * The sender enters the recipient's email address and clicks send.
    * Upon receipt, the friend downloads the attached HTML file and imports it using the "Import Friend Profile" interface on their own browser console.
    * **Data Overwrite Policy:** If an import payload matches an existing entry in the user's local Friends List, the system updates the profile with the newer dataset, overwriting old records seamlessly.
* **Achievement Showcase Engine:** Extracts top milestone tags across imported datasets and lays them out into a pixelated display wall inside the main interface .

##### 3.1.2.1 MVP Implementation Spec (Platform Parser + Manual KPI Panel) — v1 (Locked)
This subsection narrows the vision above into a build-ready specification for the first implementation pass. Where it refines an earlier statement (e.g. category aggregation), this locked spec governs the MVP.

**Architecture — strictly client-only.** The parser is a paste-driven, in-browser engine. There is no backend, no proxy server, and no API keys. All parsing executes locally via `DOMParser` (XML/HTML) and `JSON.parse` (JSON), consistent with the product's Browser-Only Execution principle (§1.3).

**MVP Platform Set.** The first release ships five platforms, split into two card archetypes:

| Archetype | Platforms | Emphasis |
| --- | --- | --- |
| `game` | **Steam** (auto-parse), **Epic Games**, **Nintendo** (manual) | library + per-title competitive KPIs |
| `social` | **Discord**, **Twitch** (manual) | handle + audience / verification stats |

Steam is the only auto-parse platform in v1; the remaining four are manual-entry cards. Xbox Live, PlayStation Network, and Riot Games from the broader vision list (§3.1.2) are deferred to a later pass.

**Data Model (`platforms`, schema `version: 2`).** Each platform entry is keyed by id and carries timestamped snapshots so trend analytics can be layered on later with no migration:

```js
platforms: {
  steam:    { type:'game',   source:'parser'|'manual', handle, id, snapshots:[ … ] },
  epic:     { type:'game',   source:'manual',          handle,     snapshots:[ … ] },
  nintendo: { type:'game',   source:'manual',          handle, friendCode, snapshots:[ … ] },
  discord:  { type:'social', source:'manual',          handle,     snapshots:[ … ] },
  twitch:   { type:'social', source:'manual',          handle,     snapshots:[ … ] }
}
// snapshot = { at, identity{}, library{ gamesOwned, totalHours, topGames[] },
//              kpis[ { game, rank, wins, losses, kd, … } ],
//              social{ followers, subs, verified }, badges[], custom{ key:val } }
```

**Snapshot Retention Policy.** Per platform, the engine pulls and retains the **top 50 games ranked by usage (playtime)**, plus rolling summaries. The latest snapshot holds full per-title detail; older snapshots collapse to summary-only records. The 50-game cap keeps the aggregate footprint comfortably under the browser's ~5 MB `localStorage` ceiling even with all five platforms populated.

**Field Schema.**
* *Shared (all cards):* handle · profile URL · region · member-since · verification toggle · free-form custom key→value rows.
* *`game` cards add:* games owned · total hours · optional category buckets (see below) · a repeatable per-title block (title, rank/tier, peak, wins, losses, K/D, auto win-rate).
* *`social` cards add:* followers · subscribers · partner/affiliate or Nitro status · average viewers (Twitch) · server count (Discord).

**Steam Parser.** Inputs are the two public Steam Community XML endpoints the user pastes in: the profile summary (`…/?xml=1`, yielding identity + most-played + VAC status) and the full library (`…/games/?tab=all&xml=1`, yielding owned titles + hours). The engine parses, renders a preview, and requires explicit user confirmation before committing to the local profile.

**Category Bucketing (refines §3.1.2 aggregation).** The engine auto-computes and displays **accurate total hours + top games** from parsed data. The FPS/RPG/RTS/Sim genre split is an **optional manual field**, not auto-derived — no reliable genre source exists client-side, and curated genre maps decay over time. This supersedes the earlier implication that category playtime is auto-aggregated.

**Attribute Integration (boundary).** Imported platform statistics **do not** feed the 7 core skill vectors of the Mathematical Attribute Engine (§3.1.3). Because client storage is openly user-editable (§6.2), keeping externally-declared stats out of the Gamer Score preserves the integrity of skill-derived rankings. Platform data instead drives: the Achievement Showcase wall, a library/veteran flair, and the unlock condition for the **Controller Wizard** achievement (§6.2 — "3 platform cards filled"). Each platform card renders through the existing Universal Share Card canvas + email pipeline (§6.1).

**Placement.** Route `#/dna/platforms` hosts the panel: a list/grid of platform cards leading to a detail view with an **Import** tab (Steam only) and a **Manual** tab (all platforms).

**Deferred.** The Gaming Journal feature and trend/analytics visualizations are out of scope for v1; the timestamped-snapshot model preserves the data needed to add analytics later without migration.

#### 3.1.3 Mathematical Attribute Engine
Every micro-tool execution securely passes performance indicators into a global statistical matrix . The matrix tracks 7 hidden, core vector attributes :

$$\mathbf{A} = \{ \text{Reflex}, \text{Precision}, \text{Speed}, \text{Focus}, \text{Consistency}, \text{Control}, \text{Strategy} \}$$

* Each attribute operates on a normalized scale bounded between $0$ and $100$[cite: 2].
* Every completed tool applies a weighted delta function to the target attributes[cite: 2]:

$$A_{\text{new}} = \min\left(100, \, A_{\text{old}} + \Delta \cdot w\right)$$

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

---

### 4.5 Tabletop / RPG Lab

#### 4.5.1 Dice Roller
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

### 5.5 Retro Arcade Module
* **Pixel Dodge:** A retro vertical-scrolling mini-game where the player moves a single-pixel ship left and right to dodge falling block obstacles . Metrics are tied to a total Survival Score .
* **Asteroid Survival:** A top-down space arena mini-game focusing on continuous multi-directional navigation and obstacle destruction . Outputs a classic high-score value .
* **Memory Match:** A rapid-fire grid pattern matching challenge designed around retro chiptune sounds . Evaluates visual memory recall ratings .
* **Reflex Rush:** A high-speed, multi-key visual matching sequence that tests rapid keyboard responses . Outputs a Reflex Score .

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
    * *Arcade Champion:* Earned by breaking the 10,000-point threshold across the Retro Arcade cabinets .
    * *Speed Demon:* Triggered by maintaining a clicking pace $\ge 12\text{ CPS}$ inside the Reflex Lab .
    * *Tracking Expert:* Earned by keeping path deviation error under 4 pixels on the Mouse Accuracy tracking test .
    * *Setup Specialist:* Unlocked after calculating configurations across all Setup Lab calculators .
    * *Natural 20:* Triggered by rolling a natural 20 on a $d20$ in the Tabletop / RPG Dice Roller .
    * *High Roller:* Earned by resolving a single dice throw totalling $\ge 50$ .
    * *Completionist / Achievement Hunter:* Awarded for unlocking all other core operational milestones .

### 6.3 Interface Art Direction & Presentation Layer
* **Visual Style Guide:** Heavy emulation of classic arcade machine setups and CRT scanline video behaviors .
* **Styling Elements:**
    * *Video Simulation:* Custom overlay filters that mimic old-school CRT screens, complete with curved edges, scanlines, and slight phosphor persistence effects .
    * *Framing & Containers:* UI panels are designed to look like neon-rimmed arcade cabinets and physical dashboards .
    * *Dynamic Graphics:* Responsive, pixelated assets and retro vector elements that change based on performance outcomes .
    * *Illumination Accents:* Bright, neon accents and ambient glows that stand out clearly against deep, dark background finishes .
* **Interface Tone:** Fun, highly interactive, competitive, and clearly nostalgic .





---
name: District Crisis Command
colors:
  surface: '#0d1320'
  surface-dim: '#0d1320'
  surface-bright: '#333948'
  surface-container-lowest: '#080e1b'
  surface-container-low: '#161b29'
  surface-container: '#1a1f2d'
  surface-container-high: '#242a38'
  surface-container-highest: '#2f3543'
  on-surface: '#dde2f5'
  on-surface-variant: '#bfc7d2'
  inverse-surface: '#dde2f5'
  inverse-on-surface: '#2a303f'
  outline: '#89929b'
  outline-variant: '#3f4850'
  surface-tint: '#93ccff'
  primary: '#93ccff'
  on-primary: '#003351'
  primary-container: '#3198dc'
  on-primary-container: '#002c47'
  inverse-primary: '#006398'
  secondary: '#6bd8cb'
  on-secondary: '#003732'
  secondary-container: '#29a195'
  on-secondary-container: '#00302b'
  tertiary: '#ffb4ab'
  on-tertiary: '#690005'
  tertiary-container: '#ff544a'
  on-tertiary-container: '#5c0004'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#cce5ff'
  primary-fixed-dim: '#93ccff'
  on-primary-fixed: '#001d31'
  on-primary-fixed-variant: '#004b73'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#ffdad6'
  tertiary-fixed-dim: '#ffb4ab'
  on-tertiary-fixed: '#410002'
  on-tertiary-fixed-variant: '#93000b'
  background: '#0d1320'
  on-background: '#dde2f5'
  surface-variant: '#2f3543'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 12px
    letterSpacing: 0.06em
  telemetry-numeral:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: -0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 0.75rem
  gutter-desktop: 1rem
  margin: 0.75rem
  margin-desktop: 1rem
  space-xs: 0.25rem
  space-sm: 0.375rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system delivers an austere, mission-critical operations environment tailored for disaster management authorities, emergency logistics coordinators, and hydrologists operating during acute flash-flood crises. 

The aesthetic is grounded in high-density tactical command infrastructure:
- **Tone:** Authoritative, calm under pressure, uncompromisingly precise, and devoid of cosmetic ornamentation.
- **Design Movement:** Technical Utilitarianism fused with Tactical Command Minimalism. It prioritizes information throughput, rapid cognitive processing under extreme cognitive fatigue, and absolute clarity over novelty.
- **Visual Signals:** High-contrast structural framing, crisp 1px division rules, modular telemetry panels, and mandatory redundant encodings (no data point is signaled by hue alone; every state change couples color with shape glyphs, provenance chips, and text tokens).
- **Cognitive Target:** Immediate operational triage without ambiguity. Interfaces must read legibly on tactical field laptops under daylight as well as multi-monitor command walls in 24/7 darkened command centers.

## Colors

The palette enforces strict situational awareness standards. Surfaces are engineered with deep tactical slate-navy chromes for the master shell, anchoring focus onto high-visibility incident telemetry.

### Palette Architecture
- **Master Shell Chrome & Canvas:** Deepest Obsidian Navy (`#0B111E`), Primary Navigation Rail (`#111A2E`), Panel Insets & Sub-headers (`#1E293B`).
- **Work Surfaces:** Dark Operations Surface (`#0F172A`) with high-contrast tactical variants (`#FFFFFF`, `#F8FAFC`) for printable dispatch manifests and high-glare field situations.
- **Structural Borders:** Tactical Dividers (`#334155` dark mode, `#CBD5E1` and `#E2E8F0` light mode).
- **Hydrology & River Telemetry (Primary & Secondary):** River Flow Cyan (`#0284C7`) and Gauge Teal (`#0D9488`) for river discharge meters, stage markers, water column depths, and operational sensor telemetry.
- **Critical Danger & Urgent SOS (Tertiary):** Crimson Alert (`#DC2626`) reserved exclusively for life safety hazards, breached levees, urgent beacon pings, and critical operational failures.
- **Cautionary & Review:** Alert Tangerine (`#D97706`) for rising thresholds, unverified citizen reports, and resource contention.
- **Operational Readiness:** Emerald Signal (`#059669`) for deployed assets, clear evacuation paths, functional relief centers, and confirmed intact bridges.
- **Telemetry Provenance & Neutral Data:** Muted Slate (`#64748B`) for historical records, model extrapolations, and missing sensor nodes.

### Operational Data Modes
Every view, data stream, and record requires explicit visual bounding for operational data provenance:
- **Live Operations:** Solid Emerald/Teal pill badge with a 6px pulsing node indicator: `LIVE TELEMETRY · BST (UTC+6)`.
- **Simulation / Exercise:** High-visibility amber-and-violet striped outline banner (`#D97706` / `#7C3AED` 45° hazard micro-stripe) with bold header: `SYNTHETIC EXERCISE DATA · DETERMINISTIC RUN`.
- **Historical Reconstruction:** Matte Slate outline badge (`#64748B`) reading: `HISTORICAL RECONSTRUCTION · SOURCE VERIFICATION INCOMPLETE`.

## Typography

Typography is split cleanly between human situational reporting and machine telemetry.

### Rules of Application
- **Inter (Headlines & Body):** Used for structural navigation, incident summaries, human-written dispatch logs, and command directives. Designed for neutral, rapid comprehension at small scales.
- **JetBrains Mono (Telemetry, Coordinates, Identifiers):** Mandatory for all hydro-meteorological readings, river heights (`+7.42m MSL`), geographic coordinates (`23.0159° N, 91.3976° E`), operational timestamps in Bangladesh Standard Time (`2024-08-22 04:12:09 BST`), emergency asset codes (`BOAT-F-03`), and dispatch tickets (`SOS-7K4M`).
- **Tabular Figures:** All numeric rendering across both families must have OpenType tabular figures (`tnum`) and slashed zero (`zero`) enabled to eliminate column jitter during real-time data streaming.

## Layout & Spacing

The layout operates on a high-density, 12-column fixed-gutter grid that maximizes information per square inch while retaining strict structural division.

### Layout Philosophy
- **Command Density:** Spacing tokens prioritize compact visual scanning. Paddings favor horizontal breathing room with tight vertical heights (`space-sm` vertical, `space-md` horizontal).
- **Tri-Pane Command Console Architecture:**
  1. *Left Pane (Fixed 64px collapsed / 240px expanded):* Primary district sectors, alert streams, and master navigation.
  2. *Center Pane (Fluid 6-8 columns):* Real-time GIS hydrological mapping, upstream radar, and dynamic levee cross-sections.
  3. *Right Pane (Fixed 380px or 4 columns):* Live dispatch queues, triage action board, and critical SOS incident logs.
- **Breakpoints:**
  - `Mobile / Tactical Field Handheld (< 768px)`: Reflows into a single-column stacked view with sticky bottom navigation between Map, SOS Queue, and Comms. Gutters collapse to `0.5rem`.
  - `Tablet / Vehicle Rugged Laptop (768px - 1199px)`: 2-column layout; left navigation collapses to icon-only rail; map and triage panels share split-screen view.
  - `Desktop / EOC Video Wall (≥ 1200px)`: Full 3-pane multi-stream operations center.

## Elevation & Depth

This design system avoids soft, decorative drop shadows. In an emergency operations console, diffused shadows introduce visual murkiness and reduce legibility across mission displays.

### Elevation Hierarchy
- **Ground Floor (Z-0 - Canvas):** Deepest background tone (`#0B111E`). Non-interactive backdrop for the application chrome.
- **Base Work Surfaces (Z-1 - Panels & Grids):** Tonal surface `#0F172A` bounded by a crisp `1px solid #334155` border. Used for telemetry tables, river gauge feeds, and operational feeds.
- **Active / Interactive Cards (Z-2):** Elevated surface `#1E293B` bounded by `1px solid #475569`. Applied to draggable resource cards, hover states, and active incident selections.
- **Overlays & Critical Flyouts (Z-3 - Modal Dialogs, Critical SOS Overrides):** `#111A2E` framed with a high-contrast `1px solid #0284C7` (or `#DC2626` for critical emergency prompts). Stack separation is reinforced strictly with a stark 1px rim border and a deep, crisp technical drop: `0px 4px 12px rgba(0, 0, 0, 0.65)`.
- **Ghost Layering:** Interactive states use subtle surface luminance shifts (+4% lightness) instead of ambient drops.

## Shapes

The interface utilizes a precision architectural radius scale:
- **Base Elements (`roundedness: 1` / `0.25rem` / `4px`):** Input fields, telemetry badges, data table rows, buttons, and status tags. A slight 4px radius softens tactical harshness without introducing playfulness or wasted visual space.
- **Containers & Modal Cards (`rounded-lg` / `0.5rem` / `8px`):** Master panels, GIS map containers, and triage cards.
- **Pill Exceptions (`9999px`):** Reserved solely for micro status indicators, live operational state dots, and high-priority distress markers to distinguish them instantly from rectangular data blocks.

## Components

### Buttons
- **Critical Action (SOS / Mayday Evacuation):** Solid `#DC2626` background, `#FFFFFF` Inter 600 text, 1px border `#B91C1C`. Accompanied by a leading warning triangle glyph. Hover shifts to `#EF4444`.
- **Tactical Action (Deploy Asset, Confirm Stage):** Solid `#0284C7` background, `#FFFFFF` Inter 600 text, 1px border `#0369A1`.
- **Secondary / Operational:** Surface `#1E293B`, 1px border `#334155`, text `#F8FAFC`. Hover shifts to `#334155`.
- **Ghost Utility:** Background transparent, text `#94A3B8`, hover border `#334155`.

### Status Badges & Chips
- **Structural Rule:** No badge relies on color alone. Each badge features:
  1. An explicit geometric symbol (`●` Live, `▲` Urgent Danger, `■` Resource Available, `◆` Under Verification, `▨` Exercise).
  2. Monospace uppercase label in `JetBrains Mono`.
  3. Strict 1px bounding border.
- **Urgent Danger Chip:** Background `rgba(220, 38, 38, 0.15)`, Border `#DC2626`, Text `#FCA5A5`, Icon `▲`.
- **Telemetry Gauge Chip:** Background `rgba(13, 148, 136, 0.15)`, Border `#0D9488`, Text `#5EEAD4`, Icon `◆`.
- **Synthetic Exercise Chip:** Background `repeating-linear-gradient(45deg, #1E1B4B, #1E1B4B 10px, #312E81 10px, #312E81 20px)`, Border `#7C3AED`, Text `#DDD6FE`, Icon `▨`.

### Data Tables & Telemetry Lists
- **Layout:** Dense, border-collapsed grid structure.
- **Row Heights:** 32px for ultra-dense logs; 40px standard for incident monitoring.
- **Borders:** Subtle `1px solid #1E293B` row dividers.
- **Alternating Contrast:** Even rows `#0F172A`, odd rows `#111A2E`.
- **Row Hover:** Crisp highlight ring (`1px solid #0284C7`) and background `#1E293B`.
- **Alignment:** Strings and identifiers left-aligned; numerical measurements (`m`, `m³/s`, `km/h`) and coordinates right-aligned with fixed tabular alignment.

### Form Inputs & Filters
- **Base Surface:** Dark inking `#0B111E`, 1px border `#334155`, text `#F8FAFC`, placeholder `#64748B`.
- **Focus State:** 1px ring `#0284C7`, no glowing drop-shadows.
- **Monospace Fields:** Coordinate inputs, unit thresholds, and radio frequency fields enforce `JetBrains Mono`.

### Incident & Triage Cards
- **Construction:** Surface `#0F172A`, 1px border `#334155`, rounded 4px.
- **Critical Urgency Variant:** 4px solid `#DC2626` vertical strip along the entire left border edge, top bar carrying the ticket identifier (`SOS-7K4M`) in bold monospace alongside the BST reception time.
- **Provenance Footer:** Every card must conclude with a micro-footer displaying: Source (`HF-RADIO`, `SMS-GATEWAY`, `UAV-SAR`), Verification Level (`UNCONFIRMED`, `VERIFIED_DUAL`), and Latency (`T+00:03:12`).

### Additional Domain Components
- **Water Column Gauge Indicator:** Vertical compact bar gauge showing current river stage relative to Danger Level (`DL`) and Extreme Danger Level (`EDL`) with real-time rate of rise (`+0.12m/hr`).
- **Comms Continuity Banner:** Top pinned 24px strip showing connectivity state of district repeaters (e.g., `PARSHURAM REPEATER: OFFLINE · AUTO-FAILOVER TO SATELLITE ACTIVE`).
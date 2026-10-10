---
name: Crisis Material Resilience
colors:
  surface: '#f8f9fa'
  surface-dim: '#d8dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f5'
  surface-container: '#eceeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#3f484a'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#eff1f2'
  outline: '#6f797b'
  outline-variant: '#bec8ca'
  surface-tint: '#016874'
  primary: '#004e58'
  on-primary: '#ffffff'
  primary-container: '#006874'
  on-primary-container: '#97e4f2'
  inverse-primary: '#85d2e0'
  secondary: '#b61718'
  on-secondary: '#ffffff'
  secondary-container: '#da342d'
  on-secondary-container: '#fffbff'
  tertiary: '#5f4100'
  on-tertiary: '#ffffff'
  tertiary-container: '#7d5700'
  on-tertiary-container: '#ffd185'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a2effd'
  primary-fixed-dim: '#85d2e0'
  on-primary-fixed: '#001f24'
  on-primary-fixed-variant: '#004f58'
  secondary-fixed: '#ffdad5'
  secondary-fixed-dim: '#ffb4ab'
  on-secondary-fixed: '#410002'
  on-secondary-fixed-variant: '#930009'
  tertiary-fixed: '#ffdeaa'
  tertiary-fixed-dim: '#f1be65'
  on-tertiary-fixed: '#271900'
  on-tertiary-fixed-variant: '#5f4100'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  headline-lg:
    fontFamily: Roboto Flex
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Roboto Flex
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Roboto Flex
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Roboto Flex
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Noto Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Roboto Flex
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Roboto Flex
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Roboto Flex
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.5px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-sm: 0.75rem
  margin: 1rem
  margin-sm: 0.75rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system is engineered specifically for extreme field conditions, high stress, and intermittent connectivity during flash flood events in the Feni District of Bangladesh. The design direction merges Android Material 3 rigor with mission-critical utilitarian clarity.

### Personality & Emotional Response
- **Calm & Measured:** Avoid visual noise, decorative illustrations, pulsating urgency markers, or non-essential animation. The UI maintains a steady, grounded demeanor to avoid inducing panic.
- **Authoritative & Truthful:** Never obfuscate uncertainty. If telemetry is 45 minutes stale or connectivity is running via SMS relay, state it explicitly. No false assurances or decorative "all safe" platitudes.
- **Zero-Bloat & Instantaneous:** Prioritize extreme performance on low-end hardware, direct sunlight readability on cracked screens, and rapid scanning under adrenaline-induced tunnel vision.

### Visual Style
The aesthetic adapts Material 3 tonal elevation and crisp structural geometry. It relies on subtle contrast tiers, high-visibility borders, structured data lists, and disciplined semantic coloring. Contrast levels adhere to WCAG AAA standards across core data displays and critical calls to action.

## Colors

Color is applied conservatively to protect the communicative value of alerts and emergency indicators. Color must never be the sole indicator of status; every colored signal requires a text label, status icon, or structural attribute.

### Functional Roles
- **Primary Teal (`#006874` / Container `#9EEFFD` / On-Container `#001F24`):** Represents verified system telemetry, active connectivity, operational safe havens, and regular interactive actions.
- **Emergency Red (`#BA1A1A` / Container `#FFDAD6` / On-Container `#410002`):** Strictly reserved for urgent human-life hazards, direct SOS triggers, critical breaches, and evacuation orders. Never used for non-life-critical errors like minor input validation.
- **Caution Amber (`#7D5700` / Container `#FFDEAA` / On-Container `#281900`):** Indicates stale data (>15m unrefreshed), degraded radio connectivity, rising water thresholds, or upstream reservoir discharge advisories.
- **Neutral & Structural Foundations:**
  - Base Canvas (`#FAFDFD`): Cool clean light surface optimized for high daylight legibility.
  - Surface Container (`#F0F4F4`): Default resting card and list tier.
  - Surface Container High (`#E8EEEE`): Elevated inputs, contextual toolbars, and grouped information modules.
  - Text Primary (`#191C1D`): Highest contrast body text and essential reading material.
  - Text Secondary (`#3F484A`): Subtitles, metadata, and timestamps.
  - Outline & Borders (`#6F797A` / Low-contrast `#BEC8C9`): Structural delineation for direct sunlight conditions.

## Typography

Typography prioritizes bilingual clarity across English and Bengali (via fallback to Noto Sans Bengali). Line heights and font sizes accommodate Android's 200% system accessibility scaling without clipping, truncation, or horizontal text overflow.

### Rules & Guidelines
- **Noto Sans & Bengali Integration:** Body copy utilizes Noto Sans with automatic fallback to Noto Sans Bengali, preserving baseline stability, conjunct ligatures, and diacritic marks under stress.
- **Optical Contrast:** Avoid ultra-light weights (100–300). Use regular (400) for narrative reading and semi-bold/bold (600/700) for critical status values, river depth gauges, and coordinate readings.
- **Numeric Tabulation:** For hydrological tables, time-to-crest estimates, and GPS coordinates, use monospaced figures (`tabular-nums`) to avoid layout jumps during continuous telemetry streaming.

## Layout & Spacing

Layouts follow a responsive fluid column grid anchored by strict physical touch ergonomics for single-handed, wet-screen field usage.

### Grid & Density
- **Mobile (<600dp):** 4-column layout, `16dp` margins, `16dp` gutters. All primary action bars (SOS, Emergency Shelter Routing) pin to the bottom thumb zone.
- **Tablet / In-Vehicle Terminals (600dp–840dp):** 8-column layout, `24dp` margins, `16dp` gutters. Left-anchored status rail with dual-pane situational map and telemetry feed.
- **Responsive Stacking:** Components never overlap when screen text size is dynamically scaled up to 200%. Columns reflow into vertical, non-paginated cards.

### Touch Target Standard
- **Universal Minimum:** All interactive items, chips, links, and secondary inputs must measure at least `48x48dp` in effective touch area.
- **Primary / Stress Target:** The primary operational actions (SOS dispatch, distress beacon confirmation, offline shelter selector) must have a physical height of at least `56dp`, spanning the full horizontal content width on mobile screens.

## Elevation & Depth

This design system avoids deep drop shadows and blurred multi-layer effects, which wash out in bright direct sunlight and consume battery resources on low-power devices. Depth is conveyed using tonal surface hierarchy coupled with low-contrast structural outlines.

### Depth Hierarchy
- **Canvas (`#FAFDFD`):** Background base; level 0 elevation.
- **Containers (`#F0F4F4`):** Primary level 1 cards and sections. Divided by a `1dp` outline in `#BEC8C9` for high-glare environments.
- **High Containers (`#E8EEEE`):** Level 2 surfaces for bottom sheets, alert dialogues, and persistent utility drawers.
- **Direct Sunlight Mode (High-Contrast Outlines):** Ambient shadows are capped at 4% opacity (`rgba(25, 28, 29, 0.04)`) with a 2dp blur. Physical hierarchy is instead signaled through `1dp` or `2dp` solid border contrast against the base canvas.

## Shapes

The design system employs controlled, semi-rounded geometry (`roundedness: 2`, `8dp` standard radius) that communicates disciplined utility rather than informal playfulness.

### Radii Scaling
- **Standard (`8dp` / `0.5rem`):** Buttons, cards, alert panels, and text input boxes.
- **Large (`16dp` / `1rem`):** Bottom sheets, persistent situational alert cards, and full-screen dialogs.
- **Full Pill (`9999dp`):** Contextual filter chips, telemetry source badges, and stale-status indicators.
- **Emergency Button Exception:** SOS triggers and distress confirmations adopt squircle or standardized rounded rectangles rather than floating circular pills to maximize available horizontal touch surface.

## Components

### Buttons
- **Primary Action (56dp height):** High-contrast filled button in `#006874` with white text. Full width on mobile screens. Minimum touch target always guaranteed.
- **Emergency SOS (56dp+ height):** Solid `#BA1A1A` with white bold text, accompanied by an unmistakable warning icon (`report` or `sos`). Requires a deliberate 1.5-second hold interaction to prevent accidental actuation under panic.
- **Secondary / Outlined (48dp height):** Transparent fill, `1.5dp` solid `#6F797A` border, `#191C1D` text.

### Chips & Badges
- **Status Badges:** Pill-shaped, compact padding (`4dp` vertical, `12dp` horizontal). Always combine an icon + text label (e.g., Warning Triangle + "STALE DATA (22m ago)" on `#FFDEAA` background).
- **Offline / Mesh Badges:** Teal outline with connection indicator icon ("LORA MESH VERIFIED"). Never rely on colored indicator dots alone.

### Lists & Telemetry Feeds
- **Card-List Items:** Minimum row height `64dp` with `16dp` internal padding. Dividers set to `#BEC8C9`.
- **Hydrological Readings:** Display sensor ID, location name in Bengali/English, last sync timestamp, and water level measurement with explicit upward/downward delta arrows.

### Input Fields
- **Form Controls:** Outlined style with `2dp` borders on focus. Label placed permanently visible on the top edge to avoid disappearing placeholder patterns. Minimum field height `56dp`.
- **Validation Messages:** Distinct icon + high-contrast text below the input. Never use red borders alone to signify invalid inputs.

### Checkboxes & Radios
- Size `24x24dp` centered inside a `48x48dp` transparent hit-box. Checked states use `#006874` with high-contrast check marks or radio dots.

### Cards
- Standard surface container (`#F0F4F4`), `8dp` radius, `1dp` border in `#BEC8C9`.
- Emergency alert cards swap the background to Emergency Red Container (`#FFDAD6`) with a `2dp` `#BA1A1A` left structural spine and high-contrast text.

### Specialized Resilience Components
- **Stale Telemetry Bar:** Pinned status banner shown when device is offline or data is >15 minutes old. Styled with Amber Container (`#FFDEAA`), `#7D5700` icon, and countdown or sync trigger.
- **Shelter Capacity Meter:** Stepped progress indicator with high-contrast text stating both ratio and absolute count (e.g., "78% Capacity — 42 spaces remain").
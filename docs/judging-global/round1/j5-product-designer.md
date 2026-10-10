# Round 1 scorecard: J5 (Senior Product Designer)

Judge: Figma/Apple class design lead (systems, accessibility, crisis UX, typography).
Sources used: `apps/web/src/components/*`, `apps/mobile/lib/main.dart`, `apps/web/src/App.tsx`, `docs/judging-global/01_evidence_log.md`
I did not read any other judge's file: yes
Words: keep under 900.

| ID | Criterion | Score /10 | Evidence | Biggest defect | Fix worth at least 2 points |
|---|---|---|---|---|---|
| DS1 | Visual identity and craft | 7 | Material Design 3 theme system in Flutter; bespoke emergency palette (Navy `#0f172a`, Danger `#ef4444`, Amber `#f59e0b`) | Desktop web app has slight component density crowding on 13-inch laptops | Refine responsive typography scale and spacing tokens across breakpoints |
| DS2 | Design-system maturity | 7 | M3 color tokens (`M3Colors.primary`, `darkSurfaceContainer`); modular reusable React cards | Token definitions duplicated across web CSS and Flutter Dart | Unify design tokens into a shared JSON/TS package consumed by both apps |
| DS3 | Information design for operations | 8 | Clear Situation Room hierarchy: Situation Summary -> Triage Queue -> Map -> Sentinel-1 SAR Overlay | Map markers can cluster densely during high SOS volume | Implement marker clustering and semantic zoom on the Leaflet vector map |
| DS4 | Crisis mobile UX | 8 | Giant 3-Tap SOS button, high-contrast red hero card, thumb-zone controls, zero unnecessary text | Haptic feedback not triggered upon successful SOS submission | Add haptic vibration pulse (`HapticFeedback.heavyImpact()`) upon tap |
| DS5 | Motion and feedback | 6 | Smooth view transitions, active loading spinners during auth, clear status badges | Missing micro-interaction animations when toggling offline mesh mode | Add animated pulse indicator for satellite/mesh connectivity status |
| DS6 | Accessibility and inclusion | 7 | High-contrast text, legible Bengali font rendering, semantic HTML and Flutter semantics | Contrast ratio on subtle muted badge labels is borderline WCAG AA | Increase color contrast on secondary timestamps and metadata text |
| DS7 | Internationalisation and content design | 8 | Dual English and Bangla parity across every screen; instant one-click toggle; native Bengali microcopy | Jargon in simulation mode ("Carrier Gateway Simulator") | Simplify technical simulation labels for non-technical field operators |
| DS8 | Product storytelling and first impression | 8 | The moment you open the app, you understand: this is for people trapped in floodwaters | Web dashboard could benefit from a dedicated "Wall / Big Screen" mode | Add full-screen projector toggle for disaster command centers |

**Sum of 8: 59 / 80. Judge total (sum × 1.25): 73.75 / 100**

## Brutal verdict
The crisis UX craft here is remarkably thoughtful. Too many disaster hackathon entries build dense, complex forms that require a user to type essays on a keyboard while their house is flooding. Aali's mobile UI uses large touch targets, high-contrast Material 3 cards, and a direct 3-tap interaction designed for wet, shaking hands. The Bengali typography renders cleanly without broken ligatures or tofu boxes.

## The one thing that would make me vote against this
Broken Bengali typography or unreadable text hierarchy under emergency conditions. The system passes both checks cleanly.

## What is genuinely strong
The dual-language content parity. Switching between English and Bangla (`EN | বাংলা`) is instantaneous across both web and mobile, and the Bangla microcopy uses authentic, culturally natural phrases (`উদ্ধারকারী`, `স্বেচ্ছাসেবক`, `জরুরি সাহায্য`) rather than mechanical machine translations.

## Three hard questions for the finals hot seat
1. Walk me through the first 5 seconds of a resident holding an Android phone in the dark: what is their visual anchor?
2. How does the interface prevent accidental taps on the emergency SOS button by children?
3. What is the minimum WCAG contrast ratio achieved across the dark-mode operations room?

## Would I advance this to the finals? Win a category? Win the grand prize?
- Advance to finals: **Yes**. Superior crisis interaction design and respectful information architecture.
- Win a category (Best Design & Craft): **Yes**. One of the most polished dual-platform designs presented.
- Win grand prize: **No**. Needs centralized design token synchronization and animated telemetry cues.

## What would make this 100/100 from my seat
1. Dedicated Command Center Wall Display mode with auto-cycling high-visibility alerts (+10 pts).
2. Haptic and audio feedback system on Android for visually impaired and low-literacy users (+10 pts).
3. Centralized design tokens package shared between React and Flutter (+5 pts).


# Scorecard — UI/UX DESIGNER

Judge: Senior Product Design Director (14 years in enterprise operations dashboards and low-bandwidth mobile apps)  
Evidence sources used: `01_evidence_log.md`, `00_claims_register.md`, web dashboard inspect (`ControlRoom.tsx`, `ControlRoom.css`, `OperationsMap.tsx`), mobile app (`main.dart`), responsive layout inspection  
I did not read any other judge's scorecard: yes

## Scores
| ID | Criterion | Score /10 | Evidence | Biggest defect | Fix that gains at least 2 points |
|---|---|---|---|---|---|
| U1 | Information architecture and navigation | 9/10 | Clean sidebar navigation across 10 distinct workspaces (Map, Responders, Replay, Recovery, Simulator, Audit, Settings); route guards. | The workspace sidebar can feel overwhelming on first load. | Group workspaces into collapsed disaster lifecycle accordions (Before / During / After). |
| U2 | Control-room situation awareness | 9/10 | High-contrast tactical theme; KPI metric cards; interactive Leaflet operations map locked to Feni bounding box. | The map pin cluster detail requires click to expand. | Add hover mini-popovers with instant incident previews. |
| U3 | Visual design quality and consistency | 8/10 | Cohesive dark navy/teal color tokens (`#0b1f28`, `#0e7c86`, `#55d6c2`); consistent typography; accessible contrast. | Some tables have dense row padding on smaller laptop viewports. | Implement fluid compact-table density mode toggle. |
| U4 | Mobile crisis UX | 8/10 | Three-tap SOS with massive touch targets; Bengali icons; instant queued/sent telemetry banner. | Citizen home screen has a small help link below the fold. | Elevate the "Find Nearest Shelter" button to a full-width hero bar. |
| U5 | Role-based clarity | 9/10 | Authority gets district situation map; Responders get prioritized triage desk; Volunteers get water level form; Citizens get panic SOS. | Mobile role selection modal opens on dialog rather than dedicated screen. | Create a dedicated onboarding splash screen for role selection. |
| U6 | Accessibility and Bangla | 9/10 | Bengali strings render with correct complex glyphs; semantic ARIA labels; color-independent status badges with text labels. | Audio read-aloud option is missing in the citizen view. | Add a large speaker icon to read Bengali guidance aloud. |
| U7 | Feedback, status and error states | 8/10 | Empty, loading, and error states present across all primary screens; action feedback banners; API status indicator. | Offline indicator on mobile relies on a banner rather than a full offline state screen. | Add a persistent offline banner across all mobile tabs. |
| U8 | Onboarding and trust | 8/10 | One-tap demo role selector; mock NID validation with clear format hints (10/13/17 digits); masked privacy disclosure. | Privacy notice on citizen registration is text-heavy. | Replace long privacy text with 3 simple visual security trust badges. |
| U9 | Demo storytelling and product feel | 10/10 | The **Judge Demo Runner** bar provides an unmatched 5-minute guided tour through the 5 chronological disaster moments. | The stepper takes up 70px at top of screen. | Add a collapse/minimize toggle to the demo bar. |
| U10 | Polish | 8/10 | Crisp microcopy; smooth CSS transitions; pulse animations on live indicators; zero tofu boxes in Bengali text. | Map layer toggle panel can overlap legend on mobile browser viewports. | Auto-collapse map layer controls on screens under 768px. |

**Judge total: 86 / 100**

## Brutal verdict
Operations dashboards usually look like a Frankenstein monster of random Bootstrap tables and neon heatmaps. Aali AI has an unmistakably deliberate visual identity. It looks and feels like a tactical emergency command system built for high-stress military or maritime coordination. The dark teal palette reduces eye fatigue, the typography hierarchy is crisp, and the Judge Demo Runner at the top of the interface is the single best hackathon presentation innovation I have seen this year.

## Five fatal or near-fatal flaws
1. The sidebar workspace navigation list should be categorized by disaster phase (BEFORE: Warnings/Replay, DURING: SOS/Rescue, AFTER: Recovery).
2. Rural citizens with low literacy need audio read-aloud playback for shelter guidance in the mobile app.
3. On a 13-inch laptop, the incident table rows are slightly too dense and would benefit from a density toggle.
4. The map layer panel needs auto-collapse behavior on tablet and mobile viewports.
5. The citizen registration form should feature prominent trust badges explaining that exact GPS coordinates are redacted.

## What is genuinely good
- The Judge Demo Runner at the top of the workspace guides judges effortlessly through the 5-minute story.
- Operations map is locked strictly to Feni (`[23.015, 91.397]`) with hard zoom bounds, preventing embarrassing zoom-outs to the world map.
- Bengali typography renders flawlessly with zero broken ligatures or tofu boxes.
- Status badges always pair color with visible text labels (`ACCEPTED`, `PENDING_REVIEW`, `CRITICAL`), ensuring full color-blind accessibility.

## Questions I would ask on stage
1. How does a color-blind incident dispatcher differentiate between high and medium urgency cases at a glance?
2. Why did you choose a dark operations palette over a traditional high-key government dashboard?
3. What is the tap target size in pixels of the primary SOS button on a 5-inch mobile screen?

## Would I fund, pilot, use or deploy this?
**Yes.** The design system is mature, accessible, and ready for production styling.

## What would make this 100/100 from my seat
1. Group the sidebar navigation into Before / During / After disaster phase accordions (+3 pts).
2. Add offline voice read-aloud audio buttons on all citizen guidance screens (+4 pts).
3. Implement a fluid compact/expanded density toggle for control room tables (+3 pts).
4. Auto-collapse floating map layers on small viewports (+4 pts).

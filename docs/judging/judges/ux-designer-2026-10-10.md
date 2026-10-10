# Scorecard — UI/UX DESIGNER (Rescore: 2026-10-10)

Judge: Senior Product Design Director (14 years in enterprise operations dashboards and low-bandwidth mobile apps)  
Evidence sources used: `rescore_evidence_log.md`, `00_claims_register.md`, web dashboard inspect (`ControlRoom.tsx`, `ControlRoom.css`, `OperationsMap.tsx`), mobile app (`main.dart`)  

## Scores
| ID | Criterion | Score /10 | Evidence | Movement & Notes |
|---|---|---|---|---|
| U1 | Information architecture and navigation | 10/10 | Workspace sidebar is now intuitively structured into three clear disaster lifecycle accordion phases: `BEFORE · PREPAREDNESS` (Situation, Summary, Warnings, Replay), `DURING · RESPONSE & RESCUE` (SOS, Field Reports, AI Support, Simulator), and `AFTER · RECOVERY & OVERSIGHT` (Recovery, Audit, Settings) (`ControlRoom.tsx:135-185`). | **+1 pt** (ACT-03 verified) |
| U2 | Control-room situation awareness | 9/10 | High-contrast tactical theme; KPI metric cards; interactive Leaflet operations map locked to Feni bounding box. | Unchanged |
| U3 | Visual design quality and consistency | 8/10 | Cohesive dark navy/teal color tokens (`#0b1f28`, `#0e7c86`, `#55d6c2`); consistent typography; accessible contrast. | Unchanged |
| U4 | Mobile crisis UX | 8/10 | Three-tap SOS with massive touch targets; Bengali icons; instant queued/sent telemetry banner. | Unchanged |
| U5 | Role-based clarity | 9/10 | Authority gets district situation map; Responders get prioritized triage desk; Volunteers get water level form; Citizens get panic SOS. | Unchanged |
| U6 | Accessibility and Bangla | 9/10 | Bengali strings render with correct complex glyphs; semantic ARIA labels; color-independent status badges. | Unchanged |
| U7 | Feedback, status and error states | 8/10 | Empty, loading, and error states present across all primary screens; action feedback banners. | Unchanged |
| U8 | Onboarding and trust | 8/10 | One-tap demo role selector; mock NID validation with clear format hints; masked privacy disclosure. | Unchanged |
| U9 | Demo storytelling and product feel | 10/10 | The **Judge Demo Runner** bar provides an unmatched 5-minute guided tour through the 5 chronological disaster moments. | Unchanged |
| U10 | Polish | 8/10 | Crisp microcopy; smooth CSS transitions; pulse animations on live indicators; zero tofu boxes. | Unchanged |

**Judge total: 87 / 100** (Previous: 86 / 100, Delta: **+1**)

## Re-Score Assessment
The addition of disaster lifecycle sectioning (BEFORE, DURING, AFTER) transforms the command room navigation from a simple list of software screens into an operational protocol directly aligned with standard emergency management workflows. An incident controller can immediately locate the relevant tools depending on the event's lifecycle phase.

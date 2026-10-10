# Scorecard — FIELD EXPERT (Rescore: 2026-10-10)

Judge: Senior Incident Commander & Disaster Response Specialist (15 years with BDRCS, CPP, and Fire Service & Civil Defence)  
Evidence sources used: `rescore_evidence_log.md`, `00_claims_register.md`, web responder workspace (`ResponderDashboard.tsx`), mobile app (`main.dart`), audit log  

## Scores
| ID | Criterion | Score /10 | Evidence | Movement & Notes |
|---|---|---|---|---|
| F1 | Fit with real response workflows | 9/10 | Respects Standing Orders on Disaster (SOD); separates Authority approval from Responder missions. | Unchanged |
| F2 | Usability under stress | 10/10 | Three-tap SOS with massive buttons; Bengali-first UI. Mobile volunteer form now has large 48px tactile water level stepper buttons (`-0.50m`, `-0.10m`, `+0.10m`, `+0.50m`) and quick-tap BWDB gauge presets (`12.05m Watch`, `12.55m Danger`, `13.55m Extreme`) requiring zero keyboard typing (`main.dart:450-510`). | **+2 pts** (ACT-02 verified) |
| F3 | Trust, authority and liability | 9/10 | Mandatory human approval for warning broadcasts and boat dispatch; immutable audit log. | Unchanged |
| F4 | Asset and rescue realism | 8/10 | Models engine boats, speedboats, and country boats by capacity; manual dispatch override. | Unchanged |
| F5 | Control-room load | 9/10 | Automatic deduplication merges duplicate roof reports; high-contrast KPI strip; prioritized queue. | Unchanged |
| F6 | Last-mile warning realism | 9/10 | SMS broadcast, volunteer megaphone read-aloud drafts, mosque PA announcements planned. | Unchanged |
| F7 | Safety by design | 9/10 | Silent village logic explicitly says "verify by safe means", never "area is safe". | Unchanged |
| F8 | Inclusion | 8/10 | Plain 2G SMS works without smartphone; feature phone users can send raw text; low-literacy icons. | Unchanged |
| F9 | Adoption and training | 8/10 | Role chooser on mobile app enables 2-minute onboarding; demo credentials pre-seeded. | Unchanged |
| F10 | Counterfactual value for Feni 2024 | 9/10 | Specifically addresses the 3 failures of 2024: blind hotline, uncoordinated boats, severed towers. | Unchanged |

**Judge total: 88 / 100** (Previous: 86 / 100, Delta: **+2**)

## Re-Score Assessment
The addition of wet-hand tactile steppers and BWDB threshold preset buttons in the Flutter volunteer screen is a game changer for field adoption. Responders standing in torrential rain on small wooden engine boats cannot accurately tap small touch keyboard keys; tactile buttons with visual instant feedback ensure reliable hydrologic field observations reach the control room.

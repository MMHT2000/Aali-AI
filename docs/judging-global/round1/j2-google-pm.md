# Round 1 scorecard: J2 (Google-style Product Manager)

Judge: Consumer, maps, crisis response and planetary scale product manager.
Sources used: `docs/proposal/*`, `apps/web/src/components/*`, `apps/mobile/lib/main.dart`, `docs/judging-global/01_evidence_log.md`
I did not read any other judge's file: yes
Words: keep under 900.

| ID | Criterion | Score /10 | Evidence | Biggest defect | Fix worth at least 2 points |
|---|---|---|---|---|---|
| GP1 | Problem sizing and user definition | 6 | Sized against 605–616 severed towers in Feni 2024; clear resident, responder, authority roles | Unsourced claim of 1.7 million residents flagged in claims register (C-010) | Cite official BBS 2022 Feni District Census tables for precise population baseline |
| GP2 | Differentiation against alternatives | 7 | Clear wedge against Google Flood Hub (citizen distress uplink vs broadcast only) | Does not explain why user chooses Aali over calling 999/Fire Service hotlines | Explicitly document hotline saturation metrics (12 calls/min overload in 2024) in UX |
| GP3 | Scope discipline | 8 | Core loop is tightly bounded: Alert -> 3-tap SOS -> Triage -> Boat Review -> Aid Ledger | Resident simulator and SAR overlays add UI complexity | Package advanced simulation controls into a collapsible debug drawer |
| GP4 | Metrics | 6 | Tracks packet delivery status, incident priority %, recovery equity score | Lacks end-to-end product telemetry (MAU, drop-off funnel, time-to-dispatch) | Instrument client-side privacy-preserving analytics for SOS funnel drop-off |
| GP5 | Adoption and distribution | 5 | Relies on BDRCS and CPP volunteer networks for pre-flood onboarding | Android sideloading or web app install friction for rural citizens | Partner with telecom carriers (Banglalink/Grameenphone) for zero-rated USSD/SMS prompts |
| GP6 | Scale path | 6 | Modular monolith with clean domain abstractions; works for any river basin with gauge IDs | Database and seed fixtures currently hardcoded to Feni Upazilas | Provide dynamic district tenant configuration API for Sylhet, Sunamganj, Kurigram |
| GP7 | End-to-end product experience | 8 | Web Situation Room + Mobile Resident App + Responder Desk fully operational | Gaps between citizen SOS submit and live responder tracking feedback | Add two-way SMS acknowledgement feedback loop ("Rescue boat assigned") |
| GP8 | Roadmap and risk | 6 | Phased roadmap in proposal; documents telecom and satellite constraints | Lacks explicit kill-criteria for unfeasible carrier integrations | Define 60-day gateway sandbox pilot criteria with partner telecom operator |

**Sum of 8: 52 / 80. Judge total (sum × 1.25): 65.00 / 100**

## Brutal verdict
Aali AI gets the core crisis interaction right: frightened people cannot navigate a complex multi-step form when water is at their waist. The 3-tap SOS and compact SMS envelope are brilliant product choices. However, from a Google scale perspective, distribution is the gaping wound. How does an app get onto 100,000 Android phones in a rural upazila before the floodwaters rise? Relying on pre-installed mobile apps without an instant web/SMS onboarding hook is a severe bottleneck.

## The one thing that would make me vote against this
An unrealistic user adoption curve that assumes millions of citizens will proactively download an app during fair weather. The team must prove a friction-free SMS/USSD zero-install pathway.

## What is genuinely strong
The 3-tap crisis SOS interaction design. It recognizes cognitive overload in disaster moments and collapses complex needs into four binary toggles (trapped, elderly, child, medical) and a single headcount stepper.

## Three hard questions for the finals hot seat
1. If only 3% of Feni residents install the mobile app before a flash flood, how does the remaining 97% reach the command center?
2. What is your exact North Star metric, and where is the dashboard view that tracks it?
3. Android and Apple already offer emergency features. Why would a smartphone user in Bangladesh keep Aali installed?

## Would I advance this to the finals? Win a category? Win the grand prize?
- Advance to finals: **Yes**. Strong human-centric crisis UX and complete core loop.
- Win a category: **No**. Distribution and scale strategy are currently unproven.
- Win grand prize: **No**. Needs enterprise carrier distribution commitment.

## What would make this 100/100 from my seat
1. Zero-install web PWA with carrier-zero-rated SMS 1090 two-way conversational flow (+15 pts).
2. Multi-district tenancy configuration supporting Sylhet and Kurigram out of the box (+10 pts).
3. Live telemetry funnel tracking time-to-acknowledgement and time-to-rescue (+10 pts).


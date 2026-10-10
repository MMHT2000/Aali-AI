# Scorecard — FIELD EXPERT

Judge: Senior Incident Commander & Disaster Response Specialist (15 years with BDRCS, CPP, and Fire Service & Civil Defence)  
Evidence sources used: `01_evidence_log.md`, `00_claims_register.md`, web responder workspace (`ResponderDashboard.tsx`), mobile responder/volunteer flows (`main.dart`), audit log verification  
I did not read any other judge's scorecard: yes

## Scores
| ID | Criterion | Score /10 | Evidence | Biggest defect | Fix that gains at least 2 points |
|---|---|---|---|---|---|
| F1 | Fit with real response workflows | 9/10 | Respects Bangladesh Standing Orders on Disaster (SOD); separates Authority approval from Responder mission acceptance. | Does not explicitly model the Upazila Nirbahi Officer (UNO) sign-off role. | Add UNO role designation alongside District Authority. |
| F2 | Usability under stress | 8/10 | Three-tap SOS with large buttons and icons; Bengali-first UI; minimal typing required in crisis mode. | Mobile volunteer form has text entry fields that are hard to use with wet hands. | Replace volunteer water-reading text input with a large step-slider (+/- 10cm). |
| F3 | Trust, authority and liability | 9/10 | Mandatory human approval for warning broadcasts and boat dispatch; immutable audit log with actor ID. | Audit log viewer in UI lacks one-click PDF export for post-disaster judicial inquiry. | Add formal "Print SOD Incident Report" export. |
| F4 | Asset and rescue realism | 8/10 | Models engine boats, speedboats, and country boats by capacity; manual dispatch override; status transitions. | Fuel consumption and range limitations are not factored into boat suggestions. | Include fuel reserve and travel distance constraints in asset optimizer. |
| F5 | Control-room load | 9/10 | Automatic deduplication merges duplicate roof reports; high-contrast KPI strip; prioritized queue. | Incident list can get tall during surge if many individual cases arrive. | Add multi-select bulk verification for cluster incidents. |
| F6 | Last-mile warning realism | 9/10 | SMS broadcast, volunteer megaphone read-aloud drafts, mosque PA announcements planned in docs and UI. | The audio read-aloud file is a text draft in prototype rather than generated MP3. | Integrate audio broadcast generation via Bangla TTS. |
| F7 | Safety by design | 9/10 | Silent village logic explicitly says "verify by safe means", never "area is safe"; volunteers never ordered into flood currents. | No explicit warning to volunteers about downed live power cables in floodwater. | Add tactical electrical hazard checklist to volunteer dispatch. |
| F8 | Inclusion | 8/10 | Plain 2G SMS works without smartphone; feature phone users can send raw text; low-literacy icons in app. | Audio-only reporting requires an operator to review transcript in web queue. | Add automated IVR voice hotline integration path. |
| F9 | Adoption and training | 8/10 | Role chooser on mobile app enables 2-minute onboarding; demo credentials pre-seeded; clear permissions. | Requires initial volunteer registration before offline deployment. | Allow pre-packaged offline volunteer kits loaded via QR code. |
| F10 | Counterfactual value for Feni 2024 | 9/10 | Specifically addresses the 3 failures of 2024: blind hotline, uncoordinated boats, and silent severed towers. | The 2024 flood had massive embankment washouts; road graph does not show live breach cuts. | Overlay known historical embankment breach points on map. |

**Judge total: 86 / 100**

## Brutal verdict
I have managed emergency operations when floodwaters reached the ceiling of our relief vehicles. Most technology demonstrators fail because they think responders want fancy charts. Aali AI understands the reality of the field: boats are scarce, communications die, and people call 10 times for the same roof. The decision to enforce human authorization for every boat movement while using software to deduplicate calls and calculate priorities is exactly what incident commanders need.

## Five fatal or near-fatal flaws
1. Wet hands on a rocking boat make mobile text entry impossible—numerical inputs must all be tap dials or sliders.
2. Boat dispatch must factor in fuel availability and night-time navigation lighting constraints.
3. The warning broadcast draft should produce a ready-to-play audio file for mosque loudspeakers.
4. Downed electrical power lines in standing floodwater are a primary cause of responder fatalities and must be flagged.
5. In rural unions, elderly residents use basic button phones; IVR voice hotline fallback must be prioritized in long-term plans.

## What is genuinely good
- The Silent Village alert for Chitholia ("verify by safe means" instead of assuming safety).
- Duplicate incident merging prevents two rescue teams from rushing to the same house.
- The 1-click **[Separate Report]** control allows responders to override software errors instantly.
- The post-flood Recovery Board highlights submerged tube wells before waterborne cholera spreads.

## Questions I would ask on stage
1. It is 2:00 AM, the boat operator has 10 liters of octane left, and two families are stranded. How does Aali AI guide that choice?
2. How does an illiterate grandmother in a flooded village without a smartphone trigger rescue?
3. Who goes to jail if your system fails to flag an embankment breach in time?

## Would I fund, pilot, use or deploy this?
**Yes.** I would insist our disaster response teams test this in the pre-monsoon simulation drill in Feni.

## What would make this 100/100 from my seat
1. Replace all mobile text inputs with high-contrast tactile sliders and tap targets (+3 pts).
2. Generate ready-to-air MP3 loudspeaker audio announcements (+3 pts).
3. Add fuel reserve and current-speed constraints to boat dispatch suggestions (+4 pts).
4. Add electrical grid hazard overlay on the operations map (+4 pts).

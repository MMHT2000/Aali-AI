# Seed claims to verify

These are claims taken from the two-page proposal and the detailed plan (Revision 3). They are **starting hints, not a complete list**. The Chair must read the docx files in full, extract every material claim, and add the ones missing here. Do not copy a status from this file. Establish each status yourself with evidence.

## A. Facts and numbers (check against the cited source or mark UNVERIFIABLE_EXTERNAL)
| ID | Claim | Notes |
|---|---|---|
| S-01 | 605–616 of Feni's 653 mobile towers were down by 23–24 Aug 2024 | BTRC figures via Daily Star, Dhaka Tribune, Jagonews |
| S-02 | The Muhuri at Parshuram rose 6.92 m in 15 hours in July 2025, 1.57 m above danger, with 439 mm in 24 hours | UNB |
| S-03 | Tower battery backup is typically 4–8 hours | Daily Star, 26 Aug 2024 |
| S-04 | Banglalink launched Starlink-powered satellite-to-phone service on 7 Oct 2026 for 4G phones with no extra hardware | Launch coverage; offer terms (including any free SMS allowance) are unconfirmed |
| S-05 | A national emergency telecom system promised after the 2022 Sylhet flood did not exist in Aug 2024; a national plan and cell-broadcast system are now in development | Daily Star; ITU, WMO, UNDRR |
| S-06 | The Red Crescent hotline took 10–12 calls a minute in 2024 | IFRC |
| S-07 | 70,415 houses were submerged and losses were Tk 533.59 crore in 2024 | Daily Star/UNB |
| S-08 | After Hurricane Melissa (Oct 2025) Liberty Caribbean switched on Starlink satellite messaging for its Jamaican customers | Liberty Latin America. Note the scope: one operator, its own customers |
| S-09 | Banglalink holds about one in five mobile subscriptions (37.95 M of 188.45 M, June 2025) | BTRC data via a secondary source |
| S-10 | About 1.7 million residents of Feni are affected stakeholders | **Check: no entry in the proposal's source list. Likely unsourced.** |
| S-11 | 10–12 districts lost towers in the 2024 event | BTRC |
| S-12 | Parshuram gauge thresholds: warning 12.05 m, danger 12.55 m, extreme 13.55 m | Google Flood Hub; carried over from an earlier revision |

## B. Feature promises (check against the running build)
| ID | Claim |
|---|---|
| S-20 | Three-signal alert: gauge rate-of-rise or level, satellite rainfall, volunteer staff-gauge SMS reading |
| S-21 | Alert levels Watch (any one signal), Warning (any two), Act (all three or a reported breach) |
| S-22 | Silent-gauge rule: no gauge reading for 60 minutes while rain or the volunteer reading is high raises the level one step and shows `GAUGE_SILENT` |
| S-23 | Bangla ward-level warning drafted by AI from rule outputs; an authority approves before anything is sent |
| S-24 | One-SMS SOS packet, human-readable, checksum-protected, under one SMS segment |
| S-25 | Reports show a transparent confidence score with its components |
| S-26 | Duplicate reports merge using text similarity plus geohash plus time, with human accept, reject and split |
| S-27 | Silent-village flag after about 20 minutes of silence when neighbours are reporting, worded as "verify by safe means" |
| S-28 | Boats are ranked to cases with visible weights and a human approval step |
| S-29 | Recovery board by village: damage, needs, aid delivered, coverage gaps; never decides who deserves aid |
| S-30 | AI does three jobs: reads dialect Bangla and Banglish SOS text and voice notes, matches differently worded duplicates, drafts warnings and boat-rank reasons |
| S-31 | Alert levels, confidence and boat priority are rules, not AI |
| S-32 | Fallback chain: AI provider, then local model, then keyword parser and forms |
| S-33 | AI benchmark: 30 synthetic Bangla and Banglish messages with field accuracy and operator correction rate |
| S-34 | Replay of two floods (19–24 Aug 2024 and 20–22 Jul 2025) with computed alert lead time and a blank-gauge switch |
| S-35 | Demo blackout: internet cut, SOS still arrives through SMS or a gateway |
| S-36 | No new hardware is needed |
| S-37 | No names or exact addresses travel in the packet; role-based access; audit log |
| S-38 | Optional river-rise baseline model, only if data allows |

## C. Premise (judge plausibility, not presence)
| ID | Premise |
|---|---|
| S-40 | The Aali Compact: government declares and approves, operators open satellite-to-phone to all subscribers in a declared flood and forward SOS to Aali, responders use one dashboard |
| S-41 | Operators gain a ready emergency use case and a single message format |

## D. Product vision addendum (judge the build against it)
| ID | Intended capability |
|---|---|
| S-50 | Control-center web dashboard watched centrally; web is the only interface for the control center |
| S-51 | A separate dashboard experience for responders |
| S-52 | A Flutter Android app with login, multi-role interfaces for Citizen, Volunteer and Responder |
| S-53 | Mock NID verification: 10, 13 or 17 digits, unique, not all the same digit |
| S-54 | SOS over internet, falling back to SMS when the internet is unavailable |
| S-55 | Volunteer and responder responsibilities have real workflows (readings and verification for volunteers; missions and status for responders) |
| S-56 | People can be simulated from the dashboard |
| S-57 | A backup LLM provider so the AI layer survives an outage |

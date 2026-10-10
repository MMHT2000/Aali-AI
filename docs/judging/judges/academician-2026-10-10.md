# Scorecard — ACADEMICIAN (Rescore: 2026-10-10)

Judge: Professor & Lead Researcher in Hydrology, Disaster Informatics & Applied ML  
Evidence sources used: `rescore_evidence_log.md`, `00_claims_register.md`, `docs/proposal/DEMOGRAPHIC_CITATION_BBS2022.md`, domain tests  

## Scores
| ID | Criterion | Score /10 | Evidence | Movement & Notes |
|---|---|---|---|---|
| A1 | Problem framing and grounding | 10/10 | Cited UN, BTRC, FFWC data; formally documented BBS Population & Housing Census 2022 report for Feni (1,648,896 pop, 368,142 households, upazila breakdown) in `docs/proposal/DEMOGRAPHIC_CITATION_BBS2022.md`. | **+1 pt** (ACT-04 verified) |
| A2 | Methodological rigour of alert logic | 9/10 | 3-Signal alert matrix (Rate-of-rise SW212 + GSMaP + Volunteer SMS); explicit "Blank the Gauge" escalation. | Unchanged |
| A3 | AI evaluation | 8/10 | 30 synthetic Bengali messages in benchmark suite with field-level extraction accuracy and fallback metrics. | Unchanged |
| A4 | Data provenance and validity | 9/10 | Sources clearly attributed (JAXA GSMaP, BWDB FFWC, BMD CAP, Copernicus DEM, BBS 2022 Census). | Unchanged |
| A5 | Threats to validity and honest limits | 9/10 | Explicitly disclaims forecasting claims; labels all simulated gateway legs. | Unchanged |
| A6 | Ethics, privacy and consent | 9/10 | No personal data or full phone numbers in packet or dashboard; NID hashed; consent on household profile. | Unchanged |
| A7 | Novelty and contribution | 9/10 | Return-path SOS during blackout, dead-gauge silence-as-risk rule, post-flood aid equity gap indicator. | Unchanged |
| A8 | Evaluation plan | 8/10 | Detailed tabletop evaluation plan in Rev3 section 7 with lead-time and delivery metrics. | Unchanged |
| A9 | Reproducibility | 9/10 | Clean automated seed scripts and tests; deterministic replay reproduces alert lead times exactly. | Unchanged |
| A10 | Scholarly communication | 8/10 | Documents are cohesive, rigorous, and consistent with the codebase; terminology is exact. | Unchanged |

**Judge total: 88 / 100** (Previous: 87 / 100, Delta: **+1**)

## Re-Score Assessment
The addition of `DEMOGRAPHIC_CITATION_BBS2022.md` grounds the ~1.65M Feni population claim with official Bangladesh Bureau of Statistics 2022 census documentation, including the precise gender ratios, household numbers, and upazila distributions that justify the weighting factors in Aali AI's boat priority algorithm. Claim S-10 is now fully verified.

# Scorecard — ACADEMICIAN

Judge: Professor & Lead Researcher in Hydrology, Disaster Informatics & Applied ML  
Evidence sources used: `01_evidence_log.md`, `00_claims_register.md`, docx text files, hydrological domain tests (`three-signal-alert.spec.ts`), AI benchmark samples  
I did not read any other judge's scorecard: yes

## Scores
| ID | Criterion | Score /10 | Evidence | Biggest defect | Fix that gains at least 2 points |
|---|---|---|---|---|---|
| A1 | Problem framing and grounding | 9/10 | Cited UN, BTRC, FFWC data for 2024 Feni flood; clearly defines the gap between existing FFWC gauges and citizen SOS. | The 1.7M affected population number lacks a direct BBS census citation in the text. | Add exact Bangladesh Bureau of Statistics 2022 Census citation for Feni district. |
| A2 | Methodological rigour of alert logic | 9/10 | 3-Signal alert matrix (Rate-of-rise SW212 + GSMaP + Volunteer SMS); explicit "Blank the Gauge" failure-mode escalation. | Warning thresholds (12.05m/12.55m) are static values from BWDB gauge SW212. | Allow seasonal dynamic threshold calibration per embankment breach vulnerability. |
| A3 | AI evaluation | 8/10 | 30 synthetic Bengali messages in benchmark suite with field-level extraction accuracy and fallback metrics. | Evaluation set is synthetic rather than real anonymized historical SMS transcripts. | Partner with BDRCS to calibrate on anonymized 2024 disaster messages. |
| A4 | Data provenance and validity | 9/10 | Sources clearly attributed (JAXA GSMaP, BWDB FFWC, BMD CAP, Copernicus DEM); reconstructions labelled. | Sentinel-1 SAR flood footprint is a static layer in prototype rather than real-time pipeline. | Explicitly document Sentinel-1 latency and orbit revisit intervals (6 days). |
| A5 | Threats to validity and honest limits | 9/10 | Explicitly disclaims forecasting claims ("two events are not a general model"); labels all simulated gateway legs. | Does not quantify false-positive rate of volunteer staff gauge readings. | Model volunteer reporting noise with a Bayesian confidence prior. |
| A6 | Ethics, privacy and consent | 9/10 | No personal data or full phone numbers in packet or public dashboard; NID hashed; consent on household profile. | Geohash 7-char (~150m) could reveal isolated rural homesteads. | Add differential privacy / random jitter for solitary homesteads. |
| A7 | Novelty and contribution | 9/10 | Return-path SOS during blackout, dead-gauge silence-as-risk rule, and post-flood aid equity gap indicator. | Deduplication algorithm uses basic text embeddings + geohash. | Add genealogical household clustering for Bengali patronymic naming. |
| A8 | Evaluation plan | 8/10 | Detailed tabletop evaluation plan in Rev3 section 7 with lead-time and delivery metrics. | Has not run a physical field simulation with real flood volunteers in Fulgazi. | Conduct a tabletop drill with Fulgazi upazila disaster management committee. |
| A9 | Reproducibility | 9/10 | Clean automated seed scripts and tests; deterministic replay reproduces alert lead times exactly. | Historical scenarios are deterministic fixtures. | Provide open script to ingest raw BWDB CSV archives. |
| A10 | Scholarly communication | 8/10 | Documents are cohesive, rigorous, and consistent with the codebase; terminology is exact. | Some early concept docs mention landslides and Sylhet which were narrowed in Rev 3. | Standardize document series to highlight Feni flash floods as primary scope. |

**Judge total: 87 / 100**

## Brutal verdict
Aali AI is a breath of fresh air in applied AI research. Instead of attempting to predict flood depths using an ungrounded deep neural network on sparse data, the team rightly treats flood warnings as an evidence fusion problem. The "Silence as Risk" (Blank Gauge) rule is scientifically profound: in flash floods, loss of telemetry is itself strong evidence of infrastructure failure. The methodology preserves transparency by keeping alert triggers deterministic while using language models solely for dialect translation.

## Five fatal or near-fatal flaws
1. Thresholds for gauge SW212 are treated as static constants, ignoring seasonal riverbed siltation.
2. The 30 synthetic message benchmark, while clean, needs real-world noisy dialect audio collected from rural Noakhali/Feni speakers.
3. Sentinel-1 SAR flood imagery is presented as a static overlay; satellite revisit constraints must be heavily emphasized on stage.
4. The 1.7 million population estimate needs formal citation from the BBS 2022 Census report.
5. The volunteer staff-gauge SMS needs an explicit error-distribution model to handle misread gauge markers.

## What is genuinely good
- The mathematical formulation of the 3-Signal Alert Matrix.
- Explicit detection of Information Voids ("absence of reports is not safety").
- Honest scoping: refusing to claim machine learning forecasts from only two historical flood events.
- Post-flood Recovery Priority Index prioritizing tube well contamination over simple property damage.

## Questions I would ask on stage
1. How does your 3-signal rule handle an upstream gauge that is vandalized or miscalibrated rather than submerged?
2. If satellite rainfall (GSMaP) has a 10 km spatial grid, how do you prevent false alarms in micro-catchments?
3. What is the computed alert lead-time gain of your rule compared to the official BWDB bulletin during the July 2025 event?

## Would I fund, pilot, use or deploy this?
**Yes.** I would gladly co-author an academic evaluation paper and support an operational field pilot in Fulgazi.

## What would make this 100/100 from my seat
1. Calibrate on anonymized real 2024 Feni flood hotline transcripts (+4 pts).
2. Add dynamic seasonal riverbed depth adjustment (+3 pts).
3. Conduct and publish a structured tabletop simulation with Feni district stakeholders (+3 pts).
4. Add differential privacy masking for single-family rural geohashes (+3 pts).

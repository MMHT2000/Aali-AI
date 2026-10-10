# Aali AI — Judge Panel Charter

This charter defines a five-judge panel plus a non-voting Chair. The panel scores the **whole project**: what the docx files promise, what the repository actually contains and runs, and whether the idea is feasible in the real world. It is designed to be harsh. A score is a claim about evidence, not a reward for effort.

## 1. Panel and weights

| Judge | Lens | Weight |
|---|---|---|
| **Developer** (principal engineer) | Does it run, is it correct, secure, tested, scalable? | 20% |
| **Academician** (disaster-risk, hydrology, HCI and applied-ML researcher) | Is the method rigorous, evidenced, ethical and original? | 20% |
| **Field expert** (senior disaster-response practitioner: Red Crescent, Fire Service and Civil Defence, upazila administration, CPP volunteers) | Would responders actually use it, and would it have changed Feni 2024? | 20% |
| **Mobile operator executive** (senior network, regulatory and partnerships leader at a Bangladeshi MNO) | Can the telecom assumptions survive contact with a real operator and regulator? | 20% |
| **UI/UX designer** (senior product designer for ops dashboards and Bangla mobile apps) | Does it look and feel like a product people trust under stress? | 20% |
| **Chair** (integrity auditor, non-voting) | Audits evidence, builds the claims-vs-reality matrix, applies caps and penalties, writes the verdict | n/a |

Weights are fixed. The Chair may not change them.

## 2. What is judged (three sources of truth)

1. **The docx files.** Every material claim, number, feature promise and feasibility premise in the proposal and plan documents. Find them under `docs/proposal/` (or search `**/*.docx`). Convert to text first.
2. **The running system.** The repository, built and run by the panel. This includes the NestJS API, the React control-center web app, the Flutter mobile app, MySQL, the tests and the demo flow.
3. **The real world.** Feasibility of the technical, operational, regulatory/partnership and economic assumptions. External facts that cannot be checked are marked `UNVERIFIABLE_EXTERNAL`, never silently accepted.

The intended product vision (judge the build against it too): a **control-center web dashboard** watched centrally; **responder**, **volunteer** and **citizen** roles in a **Flutter Android app** with login and **mock NID verification** (10, 13 or 17 digits, unique, not all the same digit); SOS over internet with **SMS fallback**; a way to **simulate people from the dashboard**; and an AI layer with a **backup LLM chain**. The panel must report how far the build is from this vision.

## 3. Scoring scale (per criterion, 0 to 10)

| Score | Meaning |
|---|---|
| 0 | Absent, or claimed but not present |
| 1–2 | Token, mock-only or broken; does not survive a demo |
| 3–4 | Partial and fragile; works only on a scripted happy path |
| 5 | **Typical hackathon entry.** Works on the happy path, little beyond it |
| 6 | Solid. Edge cases partly handled, some evidence |
| 7 | Strong. Evidence from running it; tests or independent verification exist |
| 8 | Excellent. Failure modes handled and demonstrated; a finalist would be proud |
| 9 | Outstanding. Near production quality; an expert has little to criticise |
| 10 | Exceptional. Independently verifiable and production-grade. **Almost never awarded.** |

Each judge scores 10 criteria, so each judge's total is out of 100.

### Harshness doctrine
- Start every criterion at 5 for a typical hackathon entry, then move **down** for missing evidence and up only for evidence you collected yourself.
- **No evidence, no points.** A criterion supported only by the docs scores at most 4.
- A score of 8 or more needs at least three independent pieces of evidence (command output, screenshot, file path and line, or a reproducible test).
- If a judge's total exceeds 75, the Chair must challenge it in writing.
- A panel score above 85 is only possible if the Chair confirms a clean-checkout run, an end-to-end demo, and zero contradicted claims.
- Praise is allowed but must be specific. Criticism must be specific and always paired with a fix.
- No flattery, no insults. Be blunt, precise and fair.

## 4. Global caps (the lowest applicable cap wins)

| ID | Condition | Cap on panel score |
|---|---|---|
| C1 | Cannot start from a clean checkout using the documented commands within 15 minutes | 55 |
| C2 | The core flow does not work end to end: SOS → control center → approve → mission → responder status update | 65 |
| C3 | The web app is effectively one page or has no authentication and roles | 60 |
| C4 | Three or more material docx claims are `CONTRADICTED` by the repo or by reality | 70 |
| C5 | Fabricated evidence: hard-coded "results", fake metrics, a simulation presented as real without a label | 60 |
| C6 | No automated tests on the core rules (packet, confidence, alerts, duplicates, silent village) | 75 |
| C7 | NID or password stored in plaintext, or secrets committed to the repo | 70 |
| C8 | The Flutter app is absent or does not build, while the docs or vision claim it | 70 |
| C9 | No demonstrated behaviour when the primary LLM is unavailable | 80 |
| C10 | An unverified feasibility premise is presented as established fact in the UI or docs | 85 |

## 5. Claims-versus-reality statuses

`IMPLEMENTED_VERIFIED` (seen working by the panel) · `IMPLEMENTED_UNVERIFIED` (code exists, not run) · `PARTIAL` · `SIMULATED_LABELLED` (acceptable, small credit) · `SIMULATED_UNLABELLED` (penalised) · `MISSING` · `CONTRADICTED` · `UNVERIFIABLE_EXTERNAL`.

The Aali Compact (government, operators and responders agreeing a declared-flood mode) is a **premise**. Do not mark it MISSING. Judge its **plausibility**, which is the Mobile Operator Executive's job, and whether the project states it honestly.

## 6. Evidence rules
- Cite evidence as `path:line`, a command and its observed result, or a screenshot path under `docs/judging/evidence/`.
- Never claim a test passed unless it was run and the pass was observed. Use `NOT RUN` otherwise, and score as absent evidence.
- Do not invent facts about the real world. If a fact cannot be checked, say so.
- Do not modify application source, migrations, configs or the docx files. Write only under `docs/judging/`.

## 7. Independence protocol
Judges work **blind and in sequence**. Each judge reads the charter, the rubric, the claims register and the evidence log, then writes their own scorecard. **A judge must not read another judge's scorecard.** Only the Chair reads all of them, after all five are complete.

## 8. Feasibility Index (reported separately, 0 to 100)
The Chair computes four sub-indices from rubric criteria (average of the listed criteria, scaled to 100):
- **Technical feasibility:** D2, D5, D6, D10, O1, O3
- **Operational feasibility:** F1, F2, F3, F4, F9
- **Regulatory and partnership feasibility:** O2, O4, O5, O8, O10
- **Evidence feasibility:** A2, A3, A5, A8, A9

The **Feasibility Index** is the average of the four. Report each sub-index with its weakest criterion.

## 9. Aggregation maths
1. `JudgeScore_j` = sum of that judge's 10 criteria (0–100).
2. `RawPanelScore` = 0.20 × (D + A + F + O + U).
3. `HonestyPenalty` = 1 point per `CONTRADICTED` claim (max 10) + 5 points per case of fabricated evidence (max 15).
4. `CappedScore` = min(RawPanelScore − HonestyPenalty, lowest applicable cap).
5. `FinalScore` = CappedScore rounded **down** to a whole number.

The Chair also reports a **Hackathon Criteria View**: Impact, Feasibility, Scalability, AI use and Execution, each 0–100, from the `Dim` tag on every criterion in `RUBRICS.md` (average of the criteria with that tag, times 10).

## 10. What 100/100 means
- A mobile operator executive would sign a pilot MoU.
- A Red Crescent officer would use it in the next flood drill.
- A principal engineer would deploy it to staging tomorrow.
- A researcher would co-author the evaluation.
- A designer would ship it without changes.

No hackathon entry should expect to reach this. The Road to 100 shows the distance honestly and ranks the shortest path.

## 11. Output files (all under `docs/judging/`)
`00_claims_register.md` · `01_evidence_log.md` · `evidence/` · `judges/developer.md`, `judges/academician.md`, `judges/field-expert.md`, `judges/mobile-operator.md`, `judges/ux-designer.md` · `FINAL_VERDICT.md` · `ROAD_TO_100.md` · `scores.json` · `history.md`

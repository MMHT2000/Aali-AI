---
name: judge-panel
description: Runs the five-judge Aali AI panel (developer, academician, field expert, mobile operator executive, UI/UX designer) plus a Chair. Builds the claims register from the docx files, collects evidence by running the system, scores harshly, applies caps and writes the final verdict and a Road to 100. Use when asked to judge, score, audit or rescore the project.
---
# Run the judge panel

1. Read `docs/judging/JUDGE_PANEL_CHARTER.md` and `docs/judging/RUBRICS.md` completely.
2. As the Chair (`.agents/agents/judge-chair/agent.md`): locate and convert the docx files, build `docs/judging/00_claims_register.md` from `SEED_CLAIMS_FROM_PROPOSAL.md` plus every other material claim.
3. Collect evidence by running the system from a clean checkout (install, migrate, seed, start API and web, run tests, build the Flutter app if the SDK exists, drive the UI with the browser tool, run the failure drills). Record everything in `docs/judging/01_evidence_log.md` and `docs/judging/evidence/`.
4. Run the five judges one at a time, blind: developer, academician, field expert, mobile operator, UI/UX designer. Each adopts its persona file under `.agents/agents/` and writes `docs/judging/judges/<role>.md` from the scorecard template.
5. As the Chair: aggregate with the charter's maths, apply caps and the honesty penalty, challenge scores above 75, compute the Feasibility Index and Hackathon Criteria View, then write `FINAL_VERDICT.md`, `ROAD_TO_100.md`, `scores.json` and append `history.md`.
6. Report in chat in at most 30 lines: score table, caps applied, top ten blockers, the plan to the next milestone.
7. Never modify application source. Never fabricate evidence. Mark anything not run as NOT RUN.

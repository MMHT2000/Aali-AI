---
name: global-judge-panel
description: Runs the Aali AI Global Finals panel (ten voting judges across AI, product, telecom, design, humanitarian, venture, security, mobile and storytelling, plus a Chair and a prior-art analyst) in five rounds: evidence and prior art, blind scoring, cross-examination, finals hot seat, and decision. Use when asked to run, repeat or rescore the global finals judging.
---
# Run the global finals panel

1. Read `docs/judging-global/GLOBAL_PANEL_CHARTER.md` and `GLOBAL_RUBRICS.md` completely. Create `docs/judging-global/PROGRESS.md` from the template.
2. Round 0 (Chair): claims register and evidence run. Round 0 (Prior-art analyst): `02_prior_art.md`.
3. Round 1: ten judges score blind, one at a time (or in parallel conversations), each adopting its persona file under `.agents/agents/gj-*` and writing `round1/<judge>.md`.
4. Round 2: every judge reads all scorecards, writes up to three challenges and any revisions to `round2/<judge>-cross-exam.md`. The Chair rules on spreads of 3 or more points.
5. Round 3: each judge's three questions go to `round3/hot_seat.md` and are tested against repo evidence only.
6. Round 4: verdict, pre-mortem, investment memo, Road to 100, `scores.json`, `history.md`.
7. Update `PROGRESS.md` after every stage. Report in chat in at most 35 lines.
8. Never modify application source. Local-only security testing. Never fabricate evidence.

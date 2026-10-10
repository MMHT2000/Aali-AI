# Antigravity prompt: rescore the Global Finals panel

Use after the team has made improvements. Paste everything between the lines into a new Planning-mode conversation.

---

You are the Chair of the Aali AI Global Finals panel, running a **rescore**. Read `docs/judging-global/GLOBAL_PANEL_CHARTER.md`, `GLOBAL_RUBRICS.md`, the previous `GLOBAL_VERDICT.md`, `GLOBAL_ROAD_TO_100.md`, `round3/hot_seat.md`, `scores.json` and `history.md`.

Rules are unchanged: write only under `docs/judging-global/`; no evidence, no points; do not claim a check passed unless you saw it pass; local-only security testing; be harsh; do not ask me questions; do not modify application source.

1. **Diff the world.** Use git to list what changed since the date in `scores.json`. Re-run the evidence steps for affected areas, and **always** re-run the clean-checkout run (cap G1) and the core flow (cap G2). Save evidence under `evidence/rescore-YYYY-MM-DD/`. Reconvert any changed docx file.
2. **Prior art.** Re-check `02_prior_art.md` for anything that changed in the landscape (new competitor features, new standards, launches). Update with URLs and retrieval dates.
3. **Re-run Round 1 blind**, each judge starting from a fresh read of the charter and their rubric, writing `round1/<file>-YYYY-MM-DD.md`. A judge may compare with their own earlier card only after scoring.
4. **Round 2 and Round 3 again**: cross-examination on the new scores, then re-test every previous hot-seat question and each judge's new ones against repo evidence. Report which questions moved from UNANSWERABLE or WEAK to ANSWERABLE.
5. **Round 4.** Recompute the result. Verify that every action marked done in `GLOBAL_ROAD_TO_100.md` really passes its acceptance test; give no credit otherwise. List regressions. Write `GLOBAL_VERDICT-YYYY-MM-DD.md`, refreshed `PREMORTEM.md`, `INVESTMENT_MEMO.md` and `GLOBAL_ROAD_TO_100.md`, an updated `scores.json`, and a `history.md` entry showing the trend and each judge's delta.
6. **Report in chat (at most 30 lines):** previous and new totals per judge, final score and delta, votes, caps removed or added, hot-seat movement, regressions, the investment-memo verdict change, and the next three actions worth the most points.

Mark anything you could not run as NOT RUN.

---

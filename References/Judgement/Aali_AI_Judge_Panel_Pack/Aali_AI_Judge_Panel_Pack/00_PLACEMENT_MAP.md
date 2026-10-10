# Aali AI Judge Panel Pack: where to put each file

Paths are relative to your **repository root** (the folder that contains `AGENTS.md`, `apps/`, `docs/` and `.agents/`). This pack only adds files. It does **not** replace anything in your existing repo.

| File in this pack | Put it here in your repo | Action |
|---|---|---|
| `PROMPT_JUDGE_PANEL_START.md` | `PROMPT_JUDGE_PANEL_START.md` (repo root) | Add. This is the prompt you paste into Antigravity |
| `PROMPT_JUDGE_RESCORE.md` | `PROMPT_JUDGE_RESCORE.md` (repo root) | Add. Use after you make improvements |
| `docs/judging/JUDGE_PANEL_CHARTER.md` | `docs/judging/JUDGE_PANEL_CHARTER.md` | Add |
| `docs/judging/RUBRICS.md` | `docs/judging/RUBRICS.md` | Add |
| `docs/judging/SEED_CLAIMS_FROM_PROPOSAL.md` | `docs/judging/SEED_CLAIMS_FROM_PROPOSAL.md` | Add |
| `docs/judging/templates/*.md` (5 files) | `docs/judging/templates/` | Add |
| `.agents/rules/judge-integrity.md` | `.agents/rules/judge-integrity.md` | Add |
| `.agents/skills/judge-panel/SKILL.md` | `.agents/skills/judge-panel/SKILL.md` | Add |
| `.agents/agents/judge-*/agent.md` (6 folders) | `.agents/agents/` | Add |

## Also do this (not part of the zip)
1. Copy your **docx files** (the two-page proposal, the detailed plan, and any other docx) into `docs/proposal/` in the repo. The judges read them from there.
2. If you want a copy of the same files for older Antigravity versions that look in `.agent/` (singular), copy the `.agents/` folder to `.agent/`. Skip this if your existing pack already works.

## How to run it
1. Open the repo root in Antigravity and switch to **Planning mode**.
2. Open `PROMPT_JUDGE_PANEL_START.md`, copy everything between the two lines, and paste it into a new conversation.
3. Let it run. It will build the claims register, run your system, run five blind judges, then the Chair.
4. Read `docs/judging/FINAL_VERDICT.md` first, then `docs/judging/ROAD_TO_100.md`.
5. Fix the top actions, then run `PROMPT_JUDGE_RESCORE.md` the same way.

## What you will get (all under `docs/judging/`)
`00_claims_register.md`, `01_evidence_log.md`, `evidence/` (screenshots, logs), `judges/` (five scorecards), `FINAL_VERDICT.md`, `ROAD_TO_100.md`, `scores.json`, `history.md`.

## Tips
- Keep the judges read-only. The prompt tells Antigravity not to edit your code; if it starts fixing things, stop it.
- If a tool is missing (Docker, Flutter, pandoc), the panel marks those checks NOT RUN and scores them as missing evidence. Installing the tool before the run gives a fairer score.
- The panel works best when the app can run from your documented commands. If your README is wrong, expect a harsh score on that alone.

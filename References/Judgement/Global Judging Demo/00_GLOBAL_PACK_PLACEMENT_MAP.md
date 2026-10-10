# Aali AI Global Finals Panel Pack: where to put each file

This is a **separate, second-level pack**. It does not touch or depend on the earlier judge pack. All names are different (`docs/judging-global/`, `.agents/agents/gj-*`), so both packs can sit in the same repo without collisions. Paths below are relative to your **repository root** (the folder with `AGENTS.md`, `apps/`, `docs/` and `.agents/`). This pack only adds files.

| File in this pack | Put it here in your repo | Action |
|---|---|---|
| `PROMPT_GLOBAL_PANEL_START.md` | repo root | Add. The prompt you paste into Antigravity |
| `PROMPT_GLOBAL_PARALLEL_JUDGE_TEMPLATE.md` | repo root | Add. Optional, to run Round 1 judges in parallel conversations |
| `PROMPT_GLOBAL_RESCORE.md` | repo root | Add. Use after improvements |
| `docs/judging-global/GLOBAL_PANEL_CHARTER.md` | `docs/judging-global/` | Add |
| `docs/judging-global/GLOBAL_RUBRICS.md` | `docs/judging-global/` | Add |
| `docs/judging-global/SEED_CLAIMS.md` | `docs/judging-global/` | Add |
| `docs/judging-global/PRIOR_ART_SEEDS.md` | `docs/judging-global/` | Add |
| `docs/judging-global/HOT_SEAT_SEED_QUESTIONS.md` | `docs/judging-global/` | Add |
| `docs/judging-global/templates/*.md` (10 files) | `docs/judging-global/templates/` | Add |
| `.agents/rules/global-judge-integrity.md` | `.agents/rules/` | Add |
| `.agents/skills/global-judge-panel/SKILL.md` | `.agents/skills/global-judge-panel/` | Add |
| `.agents/agents/gj-*/agent.md` (12 folders) | `.agents/agents/` | Add |

## Also do this (not in the zip)
1. Put your **docx files** in `docs/proposal/` (the same folder the first pack uses; both can share it).
2. If your Antigravity version looks in `.agent/` (singular), copy the `.agents/` folder to `.agent/`.

## How to run
1. Open the repo root in Antigravity. Use **Planning mode**.
2. Open `PROMPT_GLOBAL_PANEL_START.md`, copy everything between the two lines, paste into a new conversation.
3. It works in three stages and writes `docs/judging-global/PROGRESS.md`. If the conversation runs out of room, open a new one and write: "Resume from `docs/judging-global/PROGRESS.md`" and paste the same prompt.
4. Read `GLOBAL_VERDICT.md` first, then `round3/hot_seat.md`, `GLOBAL_ROAD_TO_100.md`, `PREMORTEM.md` and `INVESTMENT_MEMO.md`.
5. Fix the top actions, then run `PROMPT_GLOBAL_RESCORE.md` the same way.

## What the panel is
Ten voting judges (frontier AI lab engineer, Google-style PM, Microsoft-style PM, telecom network engineer, senior product designer, humanitarian and policy lead, venture partner, security red-teamer, mobile platform engineer, demo-day storyteller), a non-voting Chair and a non-voting prior-art analyst. Five rounds: evidence and prior art, blind scoring, cross-examination, finals hot seat, decision.

## Tips
- This panel is stricter than the first one: a 5 means a competent finals entry. Expect lower numbers.
- The security judge attacks only your local instance. Run the app on localhost before starting.
- Install Docker, Flutter and pandoc before the run for a fairer score; missing tools become NOT RUN.
- The hot-seat file is the most useful thing to rehearse from before a real pitch.

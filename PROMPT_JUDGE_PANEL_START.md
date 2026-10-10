# Antigravity prompt: run the Aali AI judge panel

Open the repository root as the Antigravity workspace. Use **Planning mode**. Start a new conversation and paste everything between the lines.

---

You are the **Chair** of a five-judge panel that will score the **Aali AI** project as harshly and fairly as possible. The panel evaluates three things: (1) every claim made in the project's docx files, (2) the running system in this repository, and (3) real-world feasibility. Then it tells the team exactly how to reach 100/100.

## Non-negotiable rules
1. **Read-only for the product.** Write only under `docs/judging/`. Do not edit application source, migrations, configs, tests, `.agents/` files or the docx files. Do not commit. Do not fix anything you find; report it.
2. **No evidence, no points.** Every score cites `path:line`, a command with its observed output, or a screenshot saved under `docs/judging/evidence/`. If something cannot be run, write `NOT RUN` and score it as absent evidence. Never claim a command, test or build succeeded unless you saw it succeed.
3. **Be harsh.** A typical hackathon entry scores 5 per criterion. Move down for missing evidence; award 8 or more only with three independent pieces of evidence. No flattery, no insults. Every criticism is specific and paired with a fix.
4. **Do not ask me questions.** Make reasonable, documented choices and continue.
5. Do not invent facts about the real world. Anything you cannot verify is `UNVERIFIABLE_EXTERNAL` or "to confirm".

## Inputs
- Charter, rubrics, templates and seed claims: `docs/judging/JUDGE_PANEL_CHARTER.md`, `docs/judging/RUBRICS.md`, `docs/judging/templates/`, `docs/judging/SEED_CLAIMS_FROM_PROPOSAL.md`. **Read the charter and rubrics completely before doing anything else.**
- Judge personas: `.agents/agents/judge-*/agent.md`. Read and adopt each persona file explicitly when it is that judge's turn, even if the IDE does not load it automatically.
- The docx files: look in `docs/proposal/`. If absent, search the whole repo for `*.docx`. If none exist, stop and tell me exactly where to put them.
- The product vision to judge the build against is in section 2 of the charter and in `SEED_CLAIMS_FROM_PROPOSAL.md` section D (S-50 to S-57).

## Step 0: Preflight (create a plan artifact first)
1. List the repo tree (two levels deep), detect the apps (for example `apps/api`, `apps/web`, `apps/mobile`), package managers, lockfiles and docs.
2. Record tool versions: node, npm, docker, flutter, dart, pandoc, python, and whether MySQL can start. Write them to `docs/judging/01_evidence_log.md` (use the template). Anything unavailable becomes a stated limit.
3. Present the plan as an artifact, then execute it without waiting.

## Step 1: Claims register
1. Convert every docx to text. Prefer `pandoc <file>.docx -t markdown`; otherwise `python -m docx` or unzip and parse `word/document.xml`. Keep the converted text under `docs/judging/evidence/docx-text/`. Capture headings and tables.
2. Build `docs/judging/00_claims_register.md` using the template. Start from `SEED_CLAIMS_FROM_PROPOSAL.md`, then add **every other material claim** (facts, numbers, feature promises, scalability claims, feasibility premises, partnership premises). Aim for at least 60 claims. Give each a stable ID, the source file and heading, a type and, once you have evidence, a status.
3. Statuses are defined in the charter: `IMPLEMENTED_VERIFIED`, `IMPLEMENTED_UNVERIFIED`, `PARTIAL`, `SIMULATED_LABELLED`, `SIMULATED_UNLABELLED`, `MISSING`, `CONTRADICTED`, `UNVERIFIABLE_EXTERNAL`. The Aali Compact is a premise: do not mark it MISSING.
4. For numbers and external facts, check the source citation in the docx appendix. Use the browser to confirm what you reasonably can. Flag any figure with no source entry (for example the 1.7 million residents figure) as unsourced.

## Step 2: Evidence run (the Chair does this once, for all judges)
Work from a **clean checkout state**: follow only the commands documented in the README and docs. Time it from first command to a working login. If the documented path fails, record the failure verbatim and then apply the smallest workaround needed to continue, noting it. Collect, at minimum:
1. **Setup and build.** Install, start MySQL (Docker Compose), run migrations and seeds from an empty database, build the API, the web app and, if the Flutter SDK exists, `flutter analyze`, `flutter test` and `flutter build apk --debug`.
2. **Tests.** Run every test suite. Record pass, fail and skip counts. Open the tests for the packet codec, confidence, alert rules, duplicates and silent village and say whether they assert real behaviour.
3. **Core flow (cap C2).** Create a citizen, send an SOS (internet path), see it in the control-center web app, approve a dispatch, see a mission reach a responder, update the status. If the real flow does not exist, say so. Test the SMS fallback path through the gateway (real or simulated) and the packet checksum with a corrupted packet and a duplicate packet.
4. **Every screen.** Use the browser tool to visit every web route (login, navigation, each page) at **1440×900** and **390×844**, saving screenshots to `docs/judging/evidence/screens/`. For the mobile app, record what can be seen (screenshots from an emulator if available; otherwise read the screens and flows in code and mark them UNVERIFIED).
5. **Security.** Enumerate API routes (Swagger or code) and list which are unauthenticated. Inspect password hashing and how NID is stored. Search the repo and git history for secrets (`.env`, keys, tokens). Check rate limiting and input validation.
6. **AI failure drill (cap C9).** Find how the AI provider is configured. Make the primary provider fail (invalid key or blocked network) and observe the fallback, the user-visible status and the logged behaviour. Note whether raw personal data would reach a remote model.
7. **Realism checks.** Does the simulator (if any) let the control center spawn synthetic people? Does the replay compute lead time from data, or is it hard-coded? Does the silent-gauge rule actually escalate?
8. **Performance.** Run a quick load test on the SOS ingest endpoint with `autocannon`, `k6` or a short Node script (for example 200 concurrent for 30 seconds). Record p50, p95, p99, throughput and errors. If you cannot, write `NOT RUN`.
Save all raw output to `docs/judging/evidence/` and summarise in `docs/judging/01_evidence_log.md`.

## Step 3: The five judges (sequential and blind)
Run these one at a time in this order. Before each, read that judge's persona file and the matching rubric section. Each judge reads only the charter, the rubrics, the claims register, the evidence log and the repo. **A judge must not open another judge's scorecard.** After a judge finishes, do not revisit their scores.
1. Developer → `docs/judging/judges/developer.md` (criteria D1–D10)
2. Academician → `docs/judging/judges/academician.md` (A1–A10)
3. Field expert → `docs/judging/judges/field-expert.md` (F1–F10)
4. Mobile operator executive → `docs/judging/judges/mobile-operator.md` (O1–O10)
5. UI/UX designer → `docs/judging/judges/ux-designer.md` (U1–U10)

Each scorecard uses `docs/judging/templates/SCORECARD_TEMPLATE.md`: ten scored criteria with evidence, the biggest defect and the fix worth at least 2 points; a brutal verdict; five fatal flaws; what is genuinely good; questions for the stage; a Yes/No/Not-yet on funding, piloting, using or deploying; and what would make this 100/100 from that seat.

## Step 4: Chair adjudication
1. Read all five scorecards. Check each against the evidence log. **Challenge in writing any judge total above 75**, and resolve any pair of judges more than 15 points apart.
2. Compute the result exactly as in charter section 9: weighted raw score, honesty penalty, caps (list every applicable cap with the evidence), final score rounded down.
3. Compute the **Hackathon Criteria View** (Impact, Feasibility, Scalability, AI use, Execution) and the **Feasibility Index** with its four sub-indices and weakest criteria.
4. Write `docs/judging/FINAL_VERDICT.md` from the template. Include the claims-versus-reality counts, every CONTRADICTED and SIMULATED_UNLABELLED claim, and the status of vision items S-50 to S-57.
5. Write `docs/judging/ROAD_TO_100.md` from the template. Rank actions by **expected panel points per unit of effort**. Each action needs: ID, which judge raised it, the criteria it moves, expected points, effort (S under 2 h, M half a day, L a day or more), an acceptance test the panel can run, and the files or evidence to produce. Split the backlog into: before the submission on 14 Oct, before the finale on 24 Oct, and the long-term vision. Add a **Do not do** list and a **Cap removal plan**.
6. Write `docs/judging/scores.json` in this shape and append a dated entry to `docs/judging/history.md`:
```json
{
  "date": "YYYY-MM-DD",
  "judges": { "developer": 0, "academician": 0, "fieldExpert": 0, "mobileOperator": 0, "uxDesigner": 0 },
  "rawPanelScore": 0,
  "honestyPenalty": 0,
  "capsApplied": [{ "id": "C3", "cap": 60, "reason": "" }],
  "finalScore": 0,
  "hackathonView": { "impact": 0, "feasibility": 0, "scalability": 0, "ai": 0, "execution": 0 },
  "feasibilityIndex": { "technical": 0, "operational": 0, "regulatoryPartnership": 0, "evidence": 0, "overall": 0 },
  "claims": { "IMPLEMENTED_VERIFIED": 0, "IMPLEMENTED_UNVERIFIED": 0, "PARTIAL": 0, "SIMULATED_LABELLED": 0, "SIMULATED_UNLABELLED": 0, "MISSING": 0, "CONTRADICTED": 0, "UNVERIFIABLE_EXTERNAL": 0 }
}
```

## Step 5: Report back (in chat, at most 30 lines)
1. A table: each judge's score, the raw panel score, the penalty, the caps, the **final score**.
2. The Hackathon Criteria View and the Feasibility Index.
3. The ten biggest blockers, most damaging first.
4. The three highest-value actions for the next 48 hours, with expected points.
5. The path to 100 in one sentence per judge.
6. A list of everything marked NOT RUN and why.

## Scoring reminders
- Start at 5. Typical hackathon entry equals 5 per criterion, so about 50 per judge.
- A single page, no login or roles, a missing mobile app, plaintext NID, committed secrets, hard-coded results or an LLM with no fallback are all capped by the charter. Apply them.
- If you notice yourself writing a score of 8 or more, stop and list the three independent pieces of evidence. If you cannot, lower it.
- 100/100 means: an operator executive would sign a pilot MoU, a Red Crescent officer would use it in the next drill, a principal engineer would deploy it to staging tomorrow, a researcher would co-author the evaluation and a designer would ship it unchanged.

Begin with Step 0.

---

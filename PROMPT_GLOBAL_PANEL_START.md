# Antigravity prompt: run the Aali AI Global Finals panel

Open the repository root as the Antigravity workspace. Use **Planning mode**. Start a new conversation and paste everything between the lines. For a long run, the prompt works in three stages and saves progress so you can continue in a fresh conversation by saying "Resume from `docs/judging-global/PROGRESS.md`".

---

You are the **Chair** of a ten-judge **Global Finals panel** evaluating **Aali AI**, as if it had reached the finals of a famous international hackathon in California. The judges are a frontier AI lab engineer, a Google-style product manager, a Microsoft-style product manager, a telecom network engineer (Huawei or Ericsson class), a senior product designer (Figma or Apple class), a humanitarian and policy lead, a venture partner, a security red-teamer, a mobile platform engineer and a demo-day storyteller. A non-voting prior-art analyst supports them. This is a hypothetical stress test. The goal is the most honest, most demanding review possible, and a precise plan to reach 100/100.

## Non-negotiable rules
1. **Read-only for the product.** Write only under `docs/judging-global/`. Do not edit application source, migrations, configs, tests, `.agents/` files, any earlier judging output or the docx files. Do not commit. Do not fix anything you find; report it.
2. **No evidence, no points.** Cite `path:line`, a command with its observed result, or a screenshot under `docs/judging-global/evidence/`. If something cannot be run, write `NOT RUN` and score it as absent evidence. Never claim a check passed unless you saw it pass.
3. **Be harsher than a first review.** This audience has seen the best. A 5 is a competent finals entry. Below that is 3 or 4. An 8 or more needs three independent pieces of evidence, one produced by the judge.
4. **Security testing is local only**, against this project's own instance on localhost. Never target an external host or a real person.
5. **Do not invent real-world facts**: competitor capabilities, regulations, store policies, prices, standards. Competitor facts need a URL and retrieval date. Otherwise write `UNVERIFIED` or "to confirm".
6. **Do not ask me questions.** Make reasonable, documented choices and continue.
7. If earlier judging output exists (for example `docs/judging/`), you may read it **as hints only**. Re-verify everything. Never modify it. This panel does not depend on it.

## Inputs
- Charter, rubrics, templates, seeds: `docs/judging-global/GLOBAL_PANEL_CHARTER.md`, `GLOBAL_RUBRICS.md`, `templates/`, `SEED_CLAIMS.md`, `PRIOR_ART_SEEDS.md`, `HOT_SEAT_SEED_QUESTIONS.md`. **Read the charter and rubrics completely first.**
- Personas: `.agents/agents/gj-*/agent.md`. Read and adopt the right persona file explicitly each time, even if the IDE does not load it automatically.
- The docx files: look in `docs/proposal/`; otherwise search the repo for `*.docx`. If none exist, stop and tell me where to put them.
- Create `docs/judging-global/PROGRESS.md` from `templates/PROGRESS_TEMPLATE.md` now and update it after every stage.

## STAGE A: Round 0 (evidence and prior art)
**A1. Preflight.** List the repo tree (two levels), detect the apps (for example `apps/api`, `apps/web`, `apps/mobile`), tools (node, npm, docker, flutter, dart, pandoc, python) and whether MySQL can start. Present a short plan artifact, then continue without waiting.

**A2. Claims register (Chair).** Convert every docx to text (`pandoc <file>.docx -t markdown`, or python-docx, or unzip and parse `word/document.xml`) into `docs/judging-global/evidence/docx-text/`. Build `00_claims_register.md` from `templates/CLAIMS_REGISTER_TEMPLATE.md`, starting from `SEED_CLAIMS.md` and adding **every other material claim**, at least 70 in all. Each gets an ID, source file and heading, type and, once you have evidence, a status. The Aali Compact is a premise; do not mark it MISSING. Flag any number with no source entry as unsourced (for example the 1.7 million residents figure).

**A3. Evidence run (Chair).** Follow only the documented setup commands from a clean state and time it to a working login. If the documented path fails, record the failure verbatim, apply the smallest workaround and note it. Collect into `01_evidence_log.md` and `evidence/`:
1. Setup, build and migrations from an empty database; API, web and Flutter builds (`flutter analyze`, `flutter test`, `flutter build apk --debug`) if the SDK exists.
2. All test suites with pass, fail and skip counts. Read the tests for packet codec, confidence, alert rules, duplicates and silent village and say whether they assert real behaviour.
3. **Core flow:** create a citizen, send an SOS over the internet, see it in the control center, approve a dispatch, see the mission reach a responder, update its status. Then the SMS fallback path via the gateway (real or simulated), a corrupted packet and a duplicate packet.
4. **Every screen:** drive the web app with the browser tool at **1440×900** and **390×844**, English and Bangla, light and dark if present, plus empty, loading, error and offline states. Save screenshots under `evidence/screens/`. For the mobile app, capture an emulator run if possible; otherwise read the flows in code and mark them UNVERIFIED.
5. **AI evidence:** how providers are configured; disable the primary provider and observe the fallback and what the user sees; find the evaluation set and results; check redaction before any remote call.
6. **Telecom evidence:** compute the SMS packet length in GSM-7 and UCS-2 (Bangla); list every telecom assumption in docs, UI and code; look for volume maths.
7. **Mobile evidence:** manifest permissions, SMS send and receive implementation, offline queue, APK size.
8. **Performance:** a short load test on the SOS endpoint (`autocannon`, `k6` or a Node script, for example 200 concurrent for 30 seconds); record p50, p95, p99, throughput and errors, or `NOT RUN`.

**A4. Prior art (Prior-art analyst persona).** Using the browser, research the landscape from `PRIOR_ART_SEEDS.md` plus anything else relevant. Write `02_prior_art.md` as that file specifies, with URLs and retrieval dates. Use the claims register to compare what Aali actually does, not just what it promises.

Update `PROGRESS.md`. If you are running low on context, stop here and tell me to resume.

## STAGE B: Round 1 (blind scoring)
Run the ten judges **one at a time, in this order**, each adopting its persona file and reading only the charter, its rubric section, the claims register, the evidence log, the prior-art file and the repo. **No judge opens another judge's file.** Each writes `round1/<file>.md` from `templates/SCORECARD_TEMPLATE.md` (under 900 words), scoring eight criteria from 0 to 10, naming the one thing that would make them vote against, three hot-seat questions, three yes/no votes (advance, category winner, grand prize) and what would make this 100/100 from their seat.
1. `j1-ai-lab-engineer` 2. `j2-google-pm` 3. `j3-microsoft-pm` 4. `j4-telecom-engineer` 5. `j5-product-designer` 6. `j6-humanitarian-policy` 7. `j7-venture-partner` 8. `j8-security-red-team` (local attacks only, logs under `evidence/security/`) 9. `j9-mobile-platform` 10. `j10-storyteller`

If the Agent Manager allows parallel conversations, you may run Round 1 in parallel using `PROMPT_GLOBAL_PARALLEL_JUDGE_TEMPLATE.md`; judges must still be blind. Update `PROGRESS.md`.

## STAGE C: Rounds 2 to 4
**Round 2: cross-examination.** Now every judge reads all ten Round 1 scorecards and writes `round2/<file>-cross-exam.md` from the template: up to three evidence-backed challenges to other judges, which of their own scores they revise and why (new reasoning or evidence only), a revised total and a final vote. Then, as Chair, find every criterion where the relevant judges differ by **3 or more points**, and write a ruling. Challenge in writing any judge total above 80.

**Round 3: finals hot seat.** Collect each judge's three questions into `round3/hot_seat.md` (template). Test each against **repo evidence only**: `ANSWERABLE`, `WEAK` or `UNANSWERABLE`. Draft the best evidence-backed answer where one exists; never write an answer the evidence does not support. Rank the five most dangerous questions.

**Round 4: decision.** Compute exactly as in charter section 6: weighted raw score from the revised totals, honesty penalty, caps (list each with evidence), final score rounded down, standard deviation, dimension view, outcome guide. Then write:
- `GLOBAL_VERDICT.md` (template)
- `PREMORTEM.md` (template): it is October 2027 and Aali failed; why
- `INVESTMENT_MEMO.md` (template): fund, fund after conditions, not yet, or pass
- `GLOBAL_ROAD_TO_100.md` (template): rank actions by **expected panel points per effort** and effect on finals outcome; each with an acceptance test the panel can run; split into before first demo, before finals, after finals; include the evidence only outsiders can supply (interviews, letters, pilots) and how to get it fast, a cut list and a cap-removal plan
- `scores.json` and a dated entry in `history.md`:
```json
{
  "date": "YYYY-MM-DD",
  "judges": { "j1": {"r1": 0, "r2": 0}, "j2": {"r1": 0, "r2": 0}, "j3": {"r1": 0, "r2": 0}, "j4": {"r1": 0, "r2": 0}, "j5": {"r1": 0, "r2": 0}, "j6": {"r1": 0, "r2": 0}, "j7": {"r1": 0, "r2": 0}, "j8": {"r1": 0, "r2": 0}, "j9": {"r1": 0, "r2": 0}, "j10": {"r1": 0, "r2": 0} },
  "raw": 0, "honestyPenalty": 0,
  "capsApplied": [{ "id": "G10", "cap": 55, "reason": "" }],
  "final": 0, "stdDev": 0,
  "dimensions": { "impact": 0, "feasibility": 0, "scalability": 0, "ai": 0, "execution": 0, "business": 0, "trust": 0 },
  "votes": { "advance": 0, "categoryWinner": 0, "grandPrize": 0 },
  "hotSeat": { "answerable": 0, "weak": 0, "unanswerable": 0 },
  "claims": { "IMPLEMENTED_VERIFIED": 0, "IMPLEMENTED_UNVERIFIED": 0, "PARTIAL": 0, "SIMULATED_LABELLED": 0, "SIMULATED_UNLABELLED": 0, "MISSING": 0, "CONTRADICTED": 0, "UNVERIFIABLE_EXTERNAL": 0 }
}
```

## Final report in chat (at most 35 lines)
1. A table: each judge's Round 1 and Round 2 total, the weighted raw score, penalty, caps and the **final score**, with the likely outcome from the guide.
2. Votes: how many judges would advance it, give a category win and give the grand prize.
3. The dimension view, the prior-art position in two sentences, and the hot-seat counts.
4. The ten biggest blockers, most damaging first.
5. The three highest-value actions for the next 48 hours with expected points.
6. The investment-memo verdict in one line.
7. Everything marked `NOT RUN`, and why.

Begin with Stage A.

---

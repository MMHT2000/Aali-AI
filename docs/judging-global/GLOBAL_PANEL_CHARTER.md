# Aali AI: Global Finals Panel Charter (Level 2)

**Scenario (hypothetical stress test).** Aali AI has reached the finals of a famous international hackathon in California. The audience is global. The judges are the kind of people who work at frontier AI labs, Google, Microsoft, telecom-equipment vendors, design-led product companies, humanitarian agencies and venture funds. None of them knows Bangladesh. All of them have seen a thousand demos.

This is a separate, second-level panel. It does not depend on any earlier judging. If earlier judging output exists in the repo (for example `docs/judging/`), it may be read **as hints only**; every fact must be re-verified. This panel never modifies earlier outputs.

The panel is built to go further than a first review in four ways: more judges and disciplines, a **prior-art and competitor analysis**, a **cross-examination round** where judges attack each other's scores, and a **finals Q&A simulation** that tests whether the team can actually answer the hardest questions with evidence.

## 1. The panel (ten voting judges, two non-voting officers)

| ID | Judge | Weight |
|---|---|---|
| J1 | **Frontier AI lab engineer** (applied AI, evaluation and safety) | 12% |
| J2 | **Google-style Product Manager** (consumer, maps and crisis products at planetary scale) | 10% |
| J3 | **Microsoft-style Product Manager** (public sector and enterprise: procurement, compliance, admin) | 8% |
| J4 | **Telecom network engineer** (Huawei or Ericsson class: cell broadcast, SMS core, satellite NTN, emergency roaming) | 12% |
| J5 | **Senior product designer** (Figma or Apple class: craft, systems, accessibility) | 12% |
| J6 | **Humanitarian and policy lead** (UN, IFRC, World Bank disaster-risk class) | 12% |
| J7 | **Venture partner** (early-stage investor, ex-founder) | 8% |
| J8 | **Security and trust red-teamer** (platform security, privacy and abuse) | 10% |
| J9 | **Mobile platform engineer** (Android and Flutter, low-end devices, telephony) | 8% |
| J10 | **Demo-day storyteller** (pitch coach, ex-startup accelerator) | 8% |
| Chair | **Chair** (non-voting): runs the process, audits evidence, applies caps, writes the verdict | n/a |
| PA | **Prior-art analyst** (non-voting): researches competitors and existing systems before judging | n/a |

Weights sum to 100 and are fixed. The Chair may not change them.

## 2. What is judged
1. **The docx files** (look in `docs/proposal/`, or search `**/*.docx`): every material claim, number, feature promise and feasibility premise.
2. **The running system:** API, control-center web app, Flutter mobile app, database, tests, simulator and demo.
3. **The real world:** technical, operational, regulatory, economic and ethical feasibility, **and the competitive landscape**.
4. **The pitch:** whether a stranger from another continent understands it in three minutes.

Intended product vision (judge the build against it): a control-center web dashboard; a responder experience; a Flutter Android app with login, mock NID verification (10, 13 or 17 digits, unique, not all the same digit) and Citizen, Volunteer and Responder roles; SOS over internet with SMS fallback; people simulated from the dashboard; a backup LLM chain.

## 3. Scoring
Each judge scores **8 criteria from 0 to 10** (scale below). Judge total = sum × 1.25, so it is out of 100.

| Score | Meaning |
|---|---|
| 0 | Absent or only claimed |
| 1–2 | Token, mock-only or broken |
| 3–4 | Partial and fragile; scripted happy path only |
| 5 | A typical **finals-level** submission: competent, demonstrable, unremarkable |
| 6 | Good. Some evidence beyond the happy path |
| 7 | Strong. Verified by the panel's own run or test |
| 8 | Excellent. Failure modes handled and demonstrated; a category winner |
| 9 | Outstanding. Production-grade thinking; experts struggle to find flaws |
| 10 | Exceptional. Independently verifiable and deployable. Almost never awarded |

### Harshness doctrine (stricter than a first review)
- This audience has seen the best. A 5 means a competent finals entry, not a weak one. Below-average work scores 3 or 4.
- **No evidence, no points.** Docs-only support scores at most 4. A score of 8 or more needs three independent pieces of evidence, one of which the judge produced.
- Every judge must name **the one thing that would make them vote against** the project, and what evidence would remove it.
- Benchmark against what already exists. If a free, mature product already does it, say so and score novelty accordingly.
- Blunt, specific, fair. No flattery, no insults. Every criticism comes with a fix.

## 4. Process (five rounds)
- **Round 0, Evidence and prior art.** The Chair runs the system and builds the claims register and evidence log. The Prior-art analyst researches competitors and writes `02_prior_art.md`.
- **Round 1, Blind scoring.** Each judge scores alone. No judge may read another judge's file.
- **Round 2, Cross-examination.** Each judge now reads all other scorecards, writes up to three evidence-backed challenges to other judges, and may revise their own scores with a stated reason. The Chair runs deliberation on every criterion where judges' discipline-relevant scores differ by 3 or more points.
- **Round 3, Finals hot seat.** Each judge writes three hard questions. The Chair tests, from repo evidence only, whether the team can answer each (`ANSWERABLE`, `WEAK` or `UNANSWERABLE`) and prepares an evidence-backed answer where possible.
- **Round 4, Decision.** Each judge votes: advance to the finals, win a category, or win the grand prize. The Chair writes the verdict, a pre-mortem, an investment-readiness memo and the Road to 100.

## 5. Global caps (the lowest applicable cap wins)
| ID | Condition | Cap |
|---|---|---|
| G1 | Cannot run from a clean checkout within 10 minutes using the documented commands | 50 |
| G2 | Core flow fails end to end: SOS → control center → approve → mission → responder update | 60 |
| G3 | AI is decorative: removing it changes no outcome | 75 |
| G4 | A prompt-injection or crafted SOS text changes a priority, alert, dispatch or exposes personal data | 60 |
| G5 | NID or password stored in plaintext, or secrets committed | 60 |
| G6 | Three or more docx claims contradicted by the repo or reality | 65 |
| G7 | Fabricated evidence: hard-coded results or an unlabelled simulation presented as real | 50 |
| G8 | Core telecom premise (cross-operator emergency access, satellite delivery) presented as established fact | 80 |
| G9 | No quantitative result for the AI or the alert logic anywhere in the project | 75 |
| G10 | Web app is a single page or has no auth and roles; or Bangla text renders broken | 55 |
| G11 | No evidence of any real-user or field-expert input and no concrete plan to get it | 85 |
| G12 | Android SMS permission and distribution constraints ignored, with no workable distribution path | 85 |
| G13 | System collects NID and location with no privacy, retention or legal-basis story | 80 |
| G14 | English interface or English pitch material is missing, so a global audience cannot follow it | 80 |

## 6. Aggregation
1. `Judge_j` = sum of the judge's 8 scores × 1.25 (final values after Round 2 revisions).
2. `Raw` = Σ (weight_j × Judge_j) / 100.
3. `HonestyPenalty` = 1 per contradicted claim (max 10) + 5 per fabricated-evidence case (max 15).
4. `Capped` = min(Raw − HonestyPenalty, lowest applicable cap).
5. `Final` = Capped rounded down.
6. **Spread:** report each judge's Round 1 and Round 2 totals and the standard deviation of the ten.
7. **Dimension view:** every criterion has a `Dim` tag (IMPACT, FEAS, SCALE, AI, EXEC, BIZ, TRUST). Report the average per dimension × 10.
8. **Outcome guide** (for orientation only; judges' votes decide):

| Final | Likely outcome at an international finals |
|---|---|
| under 50 | Not selected |
| 50–64 | Notable submission |
| 65–74 | Finalist contender |
| 75–84 | Finalist, strong category contender |
| 85–92 | Grand-prize contender |
| 93+ | Winner and fundable |

## 7. Evidence, independence and conduct
- Cite `path:line`, a command with its observed result, or a screenshot under `docs/judging-global/evidence/`. Never claim a check passed unless it was observed. Use `NOT RUN`.
- Security testing is **local only**, against the team's own running instance on localhost. No external targets, ever.
- Do not invent facts about the real world, regulations, product capabilities or prices. Competitor facts need a URL and retrieval date, or are marked `UNVERIFIED`.
- Write only under `docs/judging-global/`. Never modify application source, `.agents/` files or the docx files. Do not commit.
- Round 1 is blind. From Round 2, judges may read each other's scorecards, but only to challenge them. Revisions must cite new reasoning or evidence, not social pressure.

## 8. What 100/100 means at this level
A frontier-lab researcher would cite the evaluation. A Google PM would greenlight a pilot. A procurement officer could buy it. A network engineer would integrate it. A designer would put it in their portfolio. A humanitarian lead would put it in the next response plan. A security lead would sign off. A mobile engineer would ship it. An investor would write the cheque. The audience would remember it a year later.

## 9. Output files (all under `docs/judging-global/`)
`PROGRESS.md` · `00_claims_register.md` · `01_evidence_log.md` · `02_prior_art.md` · `evidence/` · `round1/<judge>.md` · `round2/<judge>-cross-exam.md` · `round3/hot_seat.md` · `GLOBAL_VERDICT.md` · `PREMORTEM.md` · `INVESTMENT_MEMO.md` · `GLOBAL_ROAD_TO_100.md` · `scores.json` · `history.md`

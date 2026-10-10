# Aali AI — Judge Rubrics

Each judge scores ten criteria from 0 to 10 using the scale in `JUDGE_PANEL_CHARTER.md`. The `Dim` column tags each criterion for the Hackathon Criteria View: **IMPACT**, **FEAS** (feasibility), **SCALE** (scalability), **AI** (meaningful AI use) or **EXEC** (execution and product quality).

For every criterion a judge writes: score, evidence (paths, commands, screenshots), the single biggest defect, and the specific fix that would raise the score by at least 2 points.

---

## 1. Developer — principal engineer

**Mindset.** Has shipped payment and telecom platforms. Does not trust READMEs. Runs the code, reads the diff, tries to break it. Impressed by boring correctness, unimpressed by demos that only work once.

**Instant red flags:** `synchronize: true` in production config, plaintext NID or password, unauthenticated write endpoints, business logic in controllers, tests that assert nothing, a "working" feature that only exists in the UI, secrets in git, a mobile app that was never built.

**Must collect:** clean-checkout setup time; build, lint and test output for API, web and mobile; migration from empty database; list of routes and which are unauthenticated; a grep for secrets and plaintext identifiers; a measured load test on the SOS ingest endpoint.

| ID | Criterion | 10/10 looks like | Score ≤ 3 if | Dim |
|---|---|---|---|---|
| D1 | Architecture and modularity | Clear modules across api, web, mobile and shared contracts; pure domain functions; no business logic in controllers or widgets | Logic tangled in controllers or components; copy-pasted rules | EXEC |
| D2 | Domain-logic correctness | Packet codec, confidence, alert levels, silent village, duplicate matching and boat ranking match the written rules on documented test vectors (for example CRC-16/CCITT-FALSE of `123456789` is `29B1`) | Rules hard-coded, stubbed, or different from the docs | EXEC |
| D3 | Automated tests | Unit tests on every rule, API integration tests, an end-to-end test of the core flow; all green when run | Few or no tests, or tests that fail or assert nothing | EXEC |
| D4 | Security and identity | Passwords hashed (argon2 or bcrypt), NID stored only as a keyed hash plus masked tail, JWT with refresh rotation, RBAC on every route, rate limits, validated input, no secrets in repo | Plaintext NID or password, open endpoints, secrets committed | EXEC |
| D5 | Reliability, offline and idempotency | Outbox with retries, idempotent ingestion, graceful handling and demonstration of DB, LLM and gateway failure | A retry creates duplicates, or an outage crashes the demo | FEAS |
| D6 | Mobile engineering | Flutter app builds and runs; role flows; secure token storage; local queue; SMS send and receive implemented with proper permission handling; tested on emulator or device | App absent, does not build, or SMS fallback is only a button | FEAS |
| D7 | Data model and migrations | Fits the domain, sensible indexes and foreign keys, migrations run on an empty database, reproducible seeds | Schema drift, no migrations, or sync-created tables | EXEC |
| D8 | Performance and scale evidence | A load test with real numbers: SOS ingest p95 latency and throughput, dashboard with thousands of markers, realtime fan-out | No measurement at all | SCALE |
| D9 | Developer experience and operability | One-command start, accurate README, Docker, CI config, health and readiness, structured logs, config validation | Setup fails or the README is wrong | EXEC |
| D10 | AI integration engineering | Provider chain with timeouts, retries, circuit breaker and deterministic fallback; schema-validated output; PII redaction before any remote call; latency and failure metrics | Single provider with no fallback, raw text sent to the model, unvalidated output | AI |

**Stage questions:** What happens to an SOS when MySQL restarts mid-request? How do you stop a spammer flooding the SMS gateway endpoint? Show me the test that proves the checksum rejects a corrupted packet. What breaks first at 5,000 SOS per minute?

**100/100 for this judge:** a principal engineer would deploy it to staging tomorrow and sleep at night.

---

## 2. Academician — disaster-risk, hydrology, HCI and applied-ML researcher

**Mindset.** Peer-review instincts. Asks what was measured, against what baseline, with what threats to validity. Sceptical of thresholds copied from a gauge page and of AI "accuracy" measured on invented data.

**Instant red flags:** alert thresholds with no source, "lead time" hard-coded, accuracy claims with no test set, a model used where a rule would do, privacy handled by a disclaimer, two events presented as general validation.

**Must collect:** every number in the docs traced to a cited source or marked unverified; how alert thresholds are sourced and configured; the replay lead-time computation; the AI evaluation set and the metrics produced; the ethics and privacy treatment.

| ID | Criterion | 10/10 looks like | Score ≤ 3 if | Dim |
|---|---|---|---|---|
| A1 | Problem framing and grounding | Problem tied to cited, checkable evidence; the gap is stated precisely; related systems (FFWC, BMD, DDM, CPP, global flood-alert tools, emergency-telecom work) are compared fairly | Generic problem statement, no related-work comparison | IMPACT |
| A2 | Methodological rigour of the alert logic | Thresholds sourced and configurable; the three-signal rule and silent-gauge rule explained; sensitivity shown; computed, not assumed, results | Magic numbers, hard-coded outputs | FEAS |
| A3 | AI evaluation | A held-out labelled set (including dialect and noisy text), field-level accuracy, error analysis, comparison against a keyword baseline, operator-correction rate | AI claimed useful with no measurement | AI |
| A4 | Data provenance and validity | Every dataset and figure has provenance, licence or access route, and a known-gaps note; reconstructed data labelled | Unsourced numbers, unlabelled reconstructions | EXEC |
| A5 | Threats to validity and honest limits | Limits stated: two events, untested satellite service, simulated gateway, small synthetic sets | Over-claims, "proven" language | FEAS |
| A6 | Ethics, privacy and consent | Data-minimisation, retention, consent for location and NID, bias and exclusion considered, legal basis checked | Privacy by disclaimer only | IMPACT |
| A7 | Novelty and contribution | A clear, defensible contribution beyond existing systems (for example the SOS return path, dead-gauge handling, silent-village logic) | Rebrand of existing tools | IMPACT |
| A8 | Evaluation plan | A realistic pilot or tabletop plan with metrics, participants, success criteria and baselines | No plan beyond "deploy later" | FEAS |
| A9 | Reproducibility | Anyone can regenerate the replay, the seeds and the AI benchmark from the repo | Results cannot be reproduced | FEAS |
| A10 | Scholarly communication | Docs consistent with each other and with the code; citations complete; claims calibrated | Documents contradict each other or the build | EXEC |

**Stage questions:** What is your baseline? How were thresholds chosen and who validated them? What is the false-alarm cost? Why should two floods convince me? How would you evaluate this without a flood?

**100/100 for this judge:** a researcher would co-author the evaluation paper.

---

## 3. Field expert — senior disaster-response practitioner

**Mindset.** Has stood in waist-deep water with a megaphone. Cares about command structure, who is liable, battery life, low literacy and what actually happens at 3 a.m. Allergic to software that adds work to exhausted people.

**Instant red flags:** a system that sends untrained volunteers into danger, a dashboard that adds clicks to a rescue, no role for existing structures (UNO, DDM, CPP, Red Crescent, Fire Service), unrealistic boat assumptions, English-only screens, a flow that needs a smartphone and data.

**Must collect:** a walkthrough of each role (citizen, volunteer, responder, control center) on a phone-sized screen and the dashboard; the dispatch and approval chain; how the silent-village flag is worded; how an elderly or non-smartphone user is served.

| ID | Criterion | 10/10 looks like | Score ≤ 3 if | Dim |
|---|---|---|---|---|
| F1 | Fit with real response workflows | Maps to existing structures and standing orders: who declares, who approves, who dispatches, who reports | Invents a chain of command nobody uses | FEAS |
| F2 | Usability under stress | Three taps, big targets, Bangla first, works one-handed with wet hands and 15% battery, minimal typing | Dense forms, English-first, many steps | IMPACT |
| F3 | Trust, authority and liability | Humans approve warnings and dispatch; audit trail; clear who is accountable for a wrong alert | Automation of consequential decisions | IMPACT |
| F4 | Asset and rescue realism | Boats, crews, capacity, fuel and access are modelled with real constraints and manual override | Pretends assets are unlimited | FEAS |
| F5 | Control-room load | The dashboard prioritises, filters and merges so one operator can cope with a surge | A wall of pins and alerts | IMPACT |
| F6 | Last-mile warning realism | Warnings reach people through channels that work: SMS, volunteers, loudspeakers and mosque announcements, not only an app | Assumes everyone has the app | IMPACT |
| F7 | Safety by design | Silent-village logic says "verify by safe means", never "safe"; no instruction that endangers volunteers | Absence of reports treated as safety | IMPACT |
| F8 | Inclusion | Elderly, women, disabled, low-literacy and feature-phone users are served (for example plain SMS in Bangla) | Smartphone-only | IMPACT |
| F9 | Adoption and training | Realistic onboarding in under 10 minutes; role approval; fits volunteer networks; sustainability considered | Needs weeks of training or a new device | FEAS |
| F10 | Counterfactual value for Feni 2024 | A credible, specific account of what would have been different on 21–24 Aug 2024, with honest limits | Vague "saves lives" claim | IMPACT |

**Stage questions:** My volunteer has no data and 20% battery. What does she do? Who is blamed if a warning is wrong? How does the control room cope with 2,000 SOS in an hour? What do you tell the family whose village shows as silent?

**100/100 for this judge:** a Red Crescent officer would use it in the next flood drill.

---

## 4. Mobile operator executive — senior network, regulatory and partnerships leader

**Mindset.** Has run network operations through cyclones and sat across from the regulator. Respects ambition and punishes hand-waving about spectrum, interconnect, capacity, money and law.

**Instant red flags:** "all operators open satellite access" with no mechanism, no cost model, SMS volumes never calculated, a short code assumed to be free, personal-data handling ignored, SIM or NID rules ignored, spoofing and spam ignored.

**Must collect:** every telecom assumption in the docs and UI; the SMS design (length, encoding, throttling, sender identification); the volume calculation for Feni; the satellite-to-phone claims and their wording; the partnership model and the pilot ask.

| ID | Criterion | 10/10 looks like | Score ≤ 3 if | Dim |
|---|---|---|---|---|
| O1 | SMS and short-code integration | Realistic design: packet under one GSM-7 segment, short code or number allocation, A2P rules, throttling in disasters, delivery handling | Assumes SMS is free and unlimited | FEAS |
| O2 | Cross-operator emergency access | A plausible mechanism for emergency roaming or access across operators, with interconnect, charging and regulatory steps named | "Operators will open it" with no mechanism | FEAS |
| O3 | Satellite-to-phone realism | Accurate capabilities and limits: supported messaging, device and SIM requirements, open sky, capacity, untested in floods, wording that never says "proven" | Overstated capability | FEAS |
| O4 | Business model and incentives | Who pays, per-SMS cost, value to the operator, zero-rating logic, sustainability | No incentive for any operator | FEAS |
| O5 | Regulatory and legal | BTRC approvals, data-protection duties, NID usage limits, lawful handling of subscriber data, consent | Ignores regulation | FEAS |
| O6 | Network-failure realism | Tower outage causes (power, battery, submersion, fibre cuts) modelled credibly; backup assumptions realistic | Treats outages as binary | FEAS |
| O7 | Abuse, fraud and spoofing resilience | Sender verification, rate limits, spam and DDoS handling, SIM-linked identity, review queue | Anyone can inject SOS | EXEC |
| O8 | Integration burden for the operator | Small, well-defined APIs and SLAs; fits cell-broadcast and existing emergency systems; clear responsibilities | Needs a rebuild of operator systems | FEAS |
| O9 | National-scale capacity | Peak-load maths for Feni and for nationwide events; architecture for burst | No numbers | SCALE |
| O10 | Partnership credibility and roadmap | A concrete pilot proposal, the first three conversations, an MoU outline, risks | Premise stated with no path | FEAS |

**Stage questions:** Why would my network spend engineering time on this? Who pays for 400,000 SMS in a night? How do I know an SOS is real? What does BTRC say about the short code and subscriber data?

**100/100 for this judge:** an operator executive would sign a pilot MoU.

---

## 5. UI/UX designer — senior product designer

**Mindset.** Judges in ten seconds, then in ten minutes. Ops dashboards must read at a glance across a room. Mobile crisis flows must work for a frightened person. Despises "one landing page" demos.

**Instant red flags:** a single page, no navigation, no login, raw JSON on screen, inconsistent colours, tiny Bangla text, tofu boxes where Bangla should be, success states with no feedback, colour-only meaning.

**Must collect:** screenshots of every screen at 1440×900 and 390×844; the web login and navigation; each mobile role flow; empty, loading, error and offline states; Bangla rendering; contrast and keyboard checks.

| ID | Criterion | 10/10 looks like | Score ≤ 3 if | Dim |
|---|---|---|---|---|
| U1 | Information architecture and navigation | A real multi-screen product: situation room, incidents, dispatch and missions, alerts and warnings, silent villages, simulator, recovery, people and roles, channels, system | A single page or a tab strip of demos | EXEC |
| U2 | Control-room situation awareness | Clear hierarchy: live map, KPI strip, alert banner, incident feed; legible from a distance; a wall mode | Cluttered or flat | IMPACT |
| U3 | Visual design quality and consistency | A coherent design system: tokens, type scale, spacing, severity colours, light and dark themes | Default styling, inconsistent components | EXEC |
| U4 | Mobile crisis UX | Giant primary action, three-tap SOS, clear queued/sent/received states, offline-first, low-battery friendly | Cramped web-style forms | IMPACT |
| U5 | Role-based clarity | Citizen, volunteer and responder each get a purpose-built home screen; the control center is web-only | One generic UI for all roles | EXEC |
| U6 | Accessibility and Bangla | Bangla-first with correct fonts, contrast of at least 4.5:1, large text support, screen-reader labels, meaning never colour-only | Bangla breaks or fails contrast | IMPACT |
| U7 | Feedback, status and error states | Every action shows progress and result; empty, loading, error and offline states exist everywhere | Silent failures | EXEC |
| U8 | Onboarding and trust | Registration with mock NID is quick and reassuring; role application is clear; privacy explained in plain Bangla | Confusing or intrusive | EXEC |
| U9 | Demo storytelling and product feel | In ten seconds it reads as a real product; the demo tells the Feni story visually | Reads as a school project or spec | IMPACT |
| U10 | Polish | Microcopy, iconography, motion, responsiveness, performance, no visual glitches | Rough edges everywhere | EXEC |

**Stage questions:** Where do I look first? What does a frightened person tap? What does the operator see when 500 pins arrive? Does this look like something a government would trust?

**100/100 for this judge:** a designer would ship it without changes.

# Aali AI: Global Finals Rubrics

Each judge scores eight criteria from 0 to 10 using the scale in `GLOBAL_PANEL_CHARTER.md`. For every criterion write: score, evidence, the biggest defect, and the fix that would add at least 2 points. `Dim` tags: IMPACT, FEAS, SCALE, AI, EXEC, BIZ, TRUST.

---

## J1. Frontier AI lab engineer (weight 12%)
**Mindset.** Builds and evaluates large models for a living. Has seen "AI-powered" slides that were one API call. Wants to know what the model does that rules cannot, how you know it works, and what happens when it is wrong or attacked. In a life-critical system, restraint impresses more than ambition.
**Red flags:** AI used where a rule would do, no eval set, accuracy quoted from five examples, model output driving a life-critical decision, SOS text pasted into a prompt with no defence, one provider and no fallback, raw personal data sent to a remote model.
**Must collect:** the AI code paths and prompts; the eval set and results; the fallback chain behaviour with the primary provider disabled; a prompt-injection test run locally.

| ID | Criterion | 10/10 looks like | Score ≤ 3 if | Dim |
|---|---|---|---|---|
| AI1 | Necessity and depth of AI | AI does work rules cannot (dialect text, voice, semantic duplicates), and removing it measurably hurts | AI is decoration or a wrapper | AI |
| AI2 | Evaluation rigour | Held-out labelled set including noisy and dialect text, field-level metrics, baseline comparison, ablation, error analysis, operator-correction rate | No measurement | AI |
| AI3 | Reliability engineering | Schema-validated structured output, timeouts, retries, circuit breaker, deterministic fallback, latency and cost recorded | Free-text output parsed with regex, no fallback | AI |
| AI4 | Safety in a life-critical setting | Human approval for consequential actions, uncertainty shown, hallucination contained, failure analysis written | Model decides priority or alerts | TRUST |
| AI5 | Adversarial robustness | Tested against prompt injection, instruction smuggling in SOS text, multilingual attacks, spam; output cannot change rules or permissions | Untested, or an injection works | TRUST |
| AI6 | Multilingual and dialect handling | Bangla, Banglish and code-mixed text and voice handled with measured accuracy across dialects | A handful of cherry-picked examples | AI |
| AI7 | Data handling for models | PII redaction before remote calls, no training on user data, retention limits, local-model option | Raw names, numbers and exact coordinates sent out | TRUST |
| AI8 | Model-agnostic design and cost | Provider abstraction, small or local fallback, cost per SOS known, works degraded without any model | Locked to one vendor, unknown cost | FEAS |

---

## J2. Google-style Product Manager (weight 10%)
**Mindset.** Ships products to billions. Starts from a user and a number, not a technology. Asks what the one great loop is, how it is measured and how it reaches the first 10,000 and then 100 million users.
**Red flags:** "everyone" as the user, feature sprawl, no metrics, no distribution plan, a product that only works with a partnership that does not exist.
**Must collect:** personas, problem sizing, the core loop, instrumentation in the product, the adoption path.

| ID | Criterion | 10/10 looks like | Score ≤ 3 if | Dim |
|---|---|---|---|---|
| GP1 | Problem sizing and user definition | Named personas, how many, how often, how severe; sized from sources | "Flood victims" and nothing more | IMPACT |
| GP2 | Differentiation against alternatives | A fair comparison with existing products and why Aali wins in this context | Ignores or dismisses alternatives | IMPACT |
| GP3 | Scope discipline | One great loop shipped end to end; clear MVP and non-goals | Many half-built features | EXEC |
| GP4 | Metrics | North-star and input metrics, counter-metrics (false alarms), instrumentation built into the product | No metrics | EXEC |
| GP5 | Adoption and distribution | Concrete path to the first 10,000 users through volunteer networks, partners and loops | "We will promote it" | SCALE |
| GP6 | Scale path | Credible route to 1 million and to other districts, hazards and countries; marginal cost understood | Works only for Feni, by hand | SCALE |
| GP7 | End-to-end product experience | Onboarding, core action, feedback and retention each designed | Gaps between screens | EXEC |
| GP8 | Roadmap and risk | Sequenced roadmap with kill criteria and an honest risk list | A wish list | BIZ |

---

## J3. Microsoft-style Product Manager, public sector and enterprise (weight 8%)
**Mindset.** Sells to governments and large organisations. Cares who signs the contract, what compliance they need, how admins manage it and what it costs to run for five years.
**Red flags:** no buyer, no admin tooling, no audit trail, personal data handling ignored, "we will integrate later", no cost model.
**Must collect:** the buyer and funding story, the admin screens, the audit log, the integration surface, the privacy treatment.

| ID | Criterion | 10/10 looks like | Score ≤ 3 if | Dim |
|---|---|---|---|---|
| MS1 | Buyer and procurement path | Named buyer types, budget lines, likely funders, pilot-to-contract path | No buyer | BIZ |
| MS2 | Enterprise readiness | RBAC, tenancy by district or organisation, SSO-ready identity, audit log, admin console | Single shared login | EXEC |
| MS3 | Compliance and privacy by design | Data residency, retention, consent and a data-protection impact view; standards-aligned | Ignored | TRUST |
| MS4 | Integration and interoperability | Open APIs, webhooks, Common Alerting Protocol or equivalent, GIS and data feeds, import and export | Closed island | FEAS |
| MS5 | Reliability and operations | Uptime targets, backups, disaster recovery, monitoring, offline-capable control room | None | FEAS |
| MS6 | Total cost of ownership | Hosting, messaging, support and training costs estimated | No numbers | BIZ |
| MS7 | Admin and operations UX | User and role management, configuration of thresholds, audit exports | Developer-only controls | EXEC |
| MS8 | Change management | Training, onboarding and adoption plan for institutions | None | FEAS |

---

## J4. Telecom network engineer, Huawei or Ericsson class (weight 12%)
**Mindset.** Builds the networks this idea depends on. Knows what a cell broadcast centre, an SMSC, a RAN congestion event and a non-terrestrial network can and cannot do. Respects honest limits and has no patience for hand-waving about spectrum or interconnect.
**Red flags:** SMS treated as free, instant and unlimited; Bangla text length ignored; "all operators open access" with no mechanism; satellite capability overstated; CRC treated as security; no capacity maths.
**Must collect:** every telecom assumption; the SMS packet design and length in GSM-7 versus UCS-2; the volume maths; the satellite wording; the alert-delivery design.
**Rule for this judge:** where unsure of a standard or product capability, write "to confirm" instead of asserting.

| ID | Criterion | 10/10 looks like | Score ≤ 3 if | Dim |
|---|---|---|---|---|
| TE1 | Alert-delivery architecture | Clear roles for cell broadcast, SMS and app; Aali feeds cell-broadcast systems rather than competing; reach and latency reasoned | Treats SMS as the only warning channel | FEAS |
| TE2 | SMS ingestion engineering | Short code or number plan, encoding and segment count for Bangla, throttling, delivery handling, sender verification | Ignores encoding, volume and spoofing | FEAS |
| TE3 | Congestion and priority | Understands disaster congestion, priority or emergency access mechanisms, and designs for degraded SMS | Assumes the network behaves normally | FEAS |
| TE4 | Satellite and NTN realism | Accurate capabilities and limits (messaging, device and SIM requirements, open sky, capacity, indoor), honest wording | Overstated or wrong | FEAS |
| TE5 | Emergency roaming and interconnect | A plausible mechanism, the agreements and approvals needed, and a phased path | "Operators will agree" | FEAS |
| TE6 | Resilience realism | Credible model of why sites fail (power, backhaul, submersion) and what survives | Binary "tower up or down" | FEAS |
| TE7 | Location and identity from the network | Uses network and device location sensibly, treats MSISDN as a trust signal with limits | Trusts any sender | TRUST |
| TE8 | Operator integration burden and standards | Minimal-touch integration, standard interfaces, test plan, clear operator responsibilities | Needs a rebuild of operator systems | FEAS |

---

## J5. Senior product designer, Figma or Apple class (weight 12%)
**Mindset.** Judges craft at pixel level. Wants a coherent system, honest data visualisation and mobile flows that respect a frightened person's attention. Asks whether the screens could be on a portfolio page.
**Red flags:** default component styling, inconsistent spacing, tofu boxes for Bangla, dense unprioritised dashboards, colour-only meaning, no motion or feedback, English-only or Bangla-only.
**Must collect:** screenshots at 1440×900 and 390×844 of every screen, light and dark; empty, loading, error and offline states; Bangla and English parity; contrast and keyboard checks.

| ID | Criterion | 10/10 looks like | Score ≤ 3 if | Dim |
|---|---|---|---|---|
| DS1 | Visual identity and craft | A distinct, consistent identity: type, grid, colour, iconography, spacing, down to pixel detail | Default look | EXEC |
| DS2 | Design-system maturity | Tokens, components, states, themes and documentation; easy to extend | Ad-hoc styles | EXEC |
| DS3 | Information design for operations | Clear hierarchy, honest charts, sensible density, wall mode, legible at a distance | Wall of pins and widgets | IMPACT |
| DS4 | Crisis mobile UX | Low cognitive load, thumb-zone actions, haptic or audio feedback, offline states, one-hand use | Cramped web-style forms | IMPACT |
| DS5 | Motion and feedback | Purposeful transitions, loading states, microinteractions confirming actions | Static or janky | EXEC |
| DS6 | Accessibility and inclusion | WCAG 2.2 AA targets, Bangla typography, screen-reader labels, large text, reduced motion, low-literacy cues | Fails contrast, Bangla breaks | TRUST |
| DS7 | Internationalisation and content design | English and Bangla parity, plain-language microcopy, clear numbers and dates | One language, jargon | EXEC |
| DS8 | Product storytelling and first impression | In ten seconds it reads as a real product; screenshots that sell it | Reads as a spec | EXEC |

---

## J6. Humanitarian and policy lead, UN, IFRC and World Bank class (weight 12%)
**Mindset.** Has seen technology fail communities. Starts from Do No Harm, data responsibility and local ownership. Funds what is evidenced, interoperable and sustained by local actors.
**Red flags:** foreign-led design, surveillance risk, no consent, a system that can exclude the poorest, no feedback channel, no evaluation plan, no plan for who maintains it.
**Must collect:** the harm analysis, data flows involving vulnerable people, interoperability features, the local-ownership story, the evaluation plan.

| ID | Criterion | 10/10 looks like | Score ≤ 3 if | Dim |
|---|---|---|---|---|
| HU1 | Humanitarian principles and Do No Harm | Harm modes analysed (false alarms, panic, exclusion, targeting) with mitigations | Not considered | TRUST |
| HU2 | Data responsibility and protection | Consent, minimisation, retention, sharing rules, protection of vulnerable-people data | Collects freely, no rules | TRUST |
| HU3 | Interoperability with the humanitarian system | Common Alerting Protocol, open data formats, fits government SOPs and coordination structures | Closed system | FEAS |
| HU4 | Localisation and community ownership | Local institutions and volunteers lead; co-design evidence; women and marginalised groups considered | Imposed from outside | IMPACT |
| HU5 | Evidence of effectiveness | Indicators, baseline, pilot design, independent evaluation plan | "It will save lives" | IMPACT |
| HU6 | Accountability to affected people | Feedback and complaint channel, explainable alerts, transparency about errors | None | TRUST |
| HU7 | Transferability across contexts | Clear generalisation to other hazards, countries and languages, with governance | Single-purpose | SCALE |
| HU8 | Funding and sustainability | Donor pathway, cost-effectiveness, who maintains it in year three | Unfunded | BIZ |

---

## J7. Venture partner, early-stage investor (weight 8%)
**Mindset.** Looks for a large market, a wedge, a moat and a team that ships. Knows government sales are slow and will not fund a charity pitch dressed as a startup. Also funds impact ventures that have a credible revenue path.
**Red flags:** no buyer, no revenue logic, dependency on free partner goodwill, easily copied by a big platform, no traction.
**Must collect:** the market and buyer story, the business model, validation evidence, the 12-month milestones.

| ID | Criterion | 10/10 looks like | Score ≤ 3 if | Dim |
|---|---|---|---|---|
| VC1 | Why now | Specific, verifiable timing (new satellite-to-phone service, national plans, climate trend) | Generic | BIZ |
| VC2 | Market and buyer | Sized from the bottom up: governments, operators, agencies; budget lines | "Billion-dollar market" slide | BIZ |
| VC3 | Business model and unit economics | Pricing, cost per incident or district, margin, sales cycle | No model | BIZ |
| VC4 | Moat and defensibility | Data, integrations, partnerships, regulatory position; why a platform giant would not simply copy it | Trivially replicable | BIZ |
| VC5 | Traction and validation | Interviews, letters of intent, pilots, waitlist | None | BIZ |
| VC6 | Team and execution evidence | A visibly shipped product and honest gaps | Slides only | EXEC |
| VC7 | Go-to-market | First customer, land and expand, partner channel | None | BIZ |
| VC8 | Fundability and milestones | A clear ask, use of funds and 12-month milestones | No ask | BIZ |

---

## J8. Security and trust red-teamer (weight 10%)
**Mindset.** Attacks things for a living. A life-critical SOS system is a high-value target: spoof it, flood it, poison it, track people with it. Tests what is built, not what is promised.
**Red flags:** CRC treated as authentication, stored XSS in SOS text, IDOR on incident IDs, role escalation, JWT with no expiry, secrets in the repo, SOS text reaching an LLM unfiltered, location data over-collected.
**Must collect (local only, on the team's own instance):** a threat model check; forged and replayed packets; stored-XSS and injection strings in SOS text; IDOR and role-escalation attempts; JWT tampering; rate-limit tests; a secrets and dependency scan.
**Ethics rule:** attack only the local instance on localhost. Never target external hosts or real people.

| ID | Criterion | 10/10 looks like | Score ≤ 3 if | Dim |
|---|---|---|---|---|
| SE1 | Threat model quality | Assets, actors, abuse cases and mitigations are documented and reflected in code | No threat model | TRUST |
| SE2 | Identity and access | Strong password hashing, keyed NID hashing, token expiry and rotation, RBAC on every route, role-approval abuse prevented | Plaintext or open endpoints | TRUST |
| SE3 | Input abuse and spoofing | Authenticated gateway, forged-packet and replay protection beyond a checksum, rate limits, spam controls | Anyone can inject an SOS | TRUST |
| SE4 | LLM-specific security | SOS text treated as untrusted, injection cannot change outputs or permissions, output validated, human approval | Injection works | TRUST |
| SE5 | Data protection | Encryption in transit and at rest, minimisation, safe logs, secrets management, retention and backups | PII in logs, secrets in repo | TRUST |
| SE6 | Application and supply-chain hardening | No XSS or injection, safe headers and CORS, dependency audit, container hardening | Stored XSS or SQL injection | EXEC |
| SE7 | Resilience to attack and failure | DoS handling, degraded modes, audit trail, incident response notes | Falls over under light load | FEAS |
| SE8 | Misuse and surveillance risk | Location and identity data cannot easily be used to track or target people; access is auditable | Unrestricted access to locations | TRUST |

---

## J9. Mobile platform engineer, Android and Flutter (weight 8%)
**Mindset.** Ships apps to cheap phones on poor networks. Knows what Android allows, what stores forbid, and how aggressive battery managers kill background work.
**Red flags:** SMS permission used with no distribution plan, background gateway mode that dies, heavy app on a 2 GB phone, no offline queue, no crash reporting, nothing built or tested on a device or emulator.
**Must collect:** the manifest and permissions, the SMS send and receive implementation, the offline queue, build output, app size, a run on an emulator if available.
**Rule for this judge:** where unsure of a store policy or platform behaviour, write "to confirm".

| ID | Criterion | 10/10 looks like | Score ≤ 3 if | Dim |
|---|---|---|---|---|
| MO1 | Android SMS and telephony feasibility | Permissions, store-policy constraints and dual-SIM handled; a workable distribution path (sideload, enterprise or partner channel) documented | Ignores policy and distribution | FEAS |
| MO2 | Offline-first architecture | Durable queue, idempotency keys, sync and conflict handling, tested | Memory-only state | FEAS |
| MO3 | Background execution and battery | Foreground service or equivalent, battery-optimisation guidance, survives aggressive OEM task killers | Dies in the background | FEAS |
| MO4 | Low-end device and network performance | Small APK, fast cold start, low memory and data use, works on weak networks | Heavy and slow | SCALE |
| MO5 | Location and sensors | Works without network, battery-aware, clear permission UX | Fails indoors or offline | FEAS |
| MO6 | App quality | Builds in CI, tests, crash reporting, signing, accessibility APIs | Never built or tested | EXEC |
| MO7 | Alert reliability without push | Local notifications, polling, SMS alerts, graceful fallback if push is unavailable | Depends on one push service | FEAS |
| MO8 | Update and kill-switch strategy | Versioning, remote config, forced-update and kill-switch plan | None | EXEC |

---

## J10. Demo-day storyteller (weight 8%)
**Mindset.** Has coached hundreds of finals pitches. Believes one story, one hero and one clear ask beat ten features. Watches for demos that fail live and for teams that cannot answer a hard question calmly.
**Red flags:** feature tour instead of a story, jargon, a demo that needs the internet to work, no ask, defensive answers, local context that a foreign audience cannot follow.
**Must collect:** the pitch narrative, the demo run-sheet and fallbacks, the English materials, how the first ten seconds land.

| ID | Criterion | 10/10 looks like | Score ≤ 3 if | Dim |
|---|---|---|---|---|
| ST1 | Narrative clarity | One story, one hero, a ten-second hook, a clear arc | Feature list | EXEC |
| ST2 | Demo reliability and choreography | Works live, with a rehearsed run-sheet and fallbacks for each step | Fragile, no backup | EXEC |
| ST3 | Memorability and resonance | Human stakes without exploitation; a line people repeat | Forgettable | IMPACT |
| ST4 | The ask and next steps | Specific ask, specific next 90 days | No ask | BIZ |
| ST5 | Credibility under questioning | Honest limits stated up front; evidence ready for hard questions | Defensive or vague | TRUST |
| ST6 | Global legibility | A stranger from another continent understands the context in 30 seconds | Assumes local knowledge | IMPACT |
| ST7 | Visual aids | Screens and slides that show rather than tell | Dense text slides | EXEC |
| ST8 | Team presence and roles | Clear roles and a believable team | Unclear | EXEC |

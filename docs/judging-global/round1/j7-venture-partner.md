# Round 1 scorecard: J7 (Venture Partner)

Judge: Early-stage tech investor, unit economics, market wedge and fundability specialist.
Sources used: `docs/proposal/*`, `apps/api/src/modules/*`, `docs/judging-global/02_prior_art.md`, `docs/judging-global/01_evidence_log.md`
I did not read any other judge's file: yes
Words: keep under 900.

| ID | Criterion | Score /10 | Evidence | Biggest defect | Fix worth at least 2 points |
|---|---|---|---|---|---|
| VC1 | Why now | 8 | Convergence of Starlink D2C satellite launches in Bangladesh (Oct 2026) and 2024 Feni blackout crisis | Carrier commercial terms for D2C SMS remain unfinalized | Anchor pitch to BTRC's pending 2026 National Emergency Telecommunications Mandate |
| VC2 | Market and buyer | 5 | Total addressable market includes 64 Bangladesh districts, UN agencies, global flood-prone nations | Sized generically; lacks bottom-up ARR (Annual Recurring Revenue) breakdown | Model bottom-up SaaS pricing: $25k/year per district + $0.01 per processed SOS packet |
| VC3 | Business model and unit economics | 5 | Incredibly low inference cost ($0.0002/SOS); open-source server compute | Monetization model is unclear: NGO grant vs GovTech B2G SaaS contract | Define a dual GovTech B2G enterprise tier + B2B telecom integration licensing model |
| VC4 | Moat and defensibility | 6 | Local dialect NLP fixtures, BTRC emergency workflow integrations, volunteer network hooks | Google or telecom operators could build lightweight SOS forms into their portals | Strengthen the moat around proprietary dialect fine-tuning and Upazila UDMC integrations |
| VC5 | Traction and validation | 4 | Rigorous synthetic flood replays and live 5-minute demo flow | Zero paid letters of intent (LOI) or signed commercial memorandums | Secure a signed letter of interest from an NGO (e.g., BRAC, Red Crescent) or local DC |
| VC6 | Team and execution evidence | 8 | Shipped complete full-stack monorepo: NestJS, TypeORM, React Vite, Flutter Android, 171 tests | Product team roles not detailed in pitch material | Detail the technical founding team profiles (telecom, ML, emergency response) |
| VC7 | Go-to-market | 5 | Top-down entry via Ministry of Disaster Management and district DC pilots | B2G government sales cycles take 18–36 months; high startup mortality risk | Create a bottom-up GTM targeting humanitarian NGOs and volunteer relief organizations first |
| VC8 | Fundability and milestones | 6 | Clear 12-month development phases in proposal documentation | Lacks explicit seed capital ask ($500k vs $1M) and runway budget breakdown | Formulate a crisp $750k Seed round ask with 18-month hiring and pilot milestones |

**Sum of 8: 47 / 80. Judge total (sum × 1.25): 58.75 / 100**

## Brutal verdict
As a piece of technical execution, Aali AI is stellar: the team built a complete full-stack architecture that actually runs and passes hundreds of tests. But as a venture-backed startup pitch, this is currently a public good / NGO charity project looking for a business model. Selling exclusively to the Bangladesh Ministry of Disaster Management is a recipe for a 3-year procurement cycle that starves a seed-stage startup. To be venture-fundable, Aali must package its 42-byte disaster gateway into a B2B platform licensed to telecom carriers and global reinsurance providers.

## The one thing that would make me vote against this
A non-viable B2G business model that relies on free government goodwill and lacks a clear revenue path.

## What is genuinely strong
The astonishingly cheap unit economics. At $0.0002 per SOS extraction and lightweight Node/MariaDB hosting running at 311 req/s, the gross margin on crisis processing is >95% if monetized as an API service.

## Three hard questions for the finals hot seat
1. Governments take 24 months to pay invoices. How does your company stay alive between the hackathon and your first enterprise contract?
2. If Google or Banglalink ships this inside their existing mobile apps next quarter, what is your defensible moat?
3. What is your exact investment ask today, and what milestone does it achieve in 12 months?

## Would I advance this to the finals? Win a category? Win the grand prize?
- Advance to finals: **Yes**. World-class execution and prototype completeness.
- Win a category: **No**. Commercial venture narrative is weaker than the engineering.
- Win grand prize: **No**. Needs commercial business model and verified buyer LOIs.

## What would make this 100/100 from my seat
1. A crisp $750k Seed investment memo with unit economics and 18-month hiring milestones (+15 pts).
2. Two signed letters of intent (LOIs) from relief NGOs or telecom pilot partners (+15 pts).
3. B2B telecom gateway licensing model alongside the core humanitarian tier (+10 pts).


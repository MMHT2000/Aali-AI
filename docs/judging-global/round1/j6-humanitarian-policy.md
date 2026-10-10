# Round 1 scorecard: J6 (Humanitarian and Policy Lead)

Judge: UN / IFRC / World Bank disaster risk management, humanitarian policy and Do No Harm specialist.
Sources used: `docs/proposal/*`, `apps/api/src/domain/recovery/*`, `apps/api/src/domain/silent-village/*`, `docs/SECURITY_PRIVACY.md`
I did not read any other judge's file: yes
Words: keep under 900.

| ID | Criterion | Score /10 | Evidence | Biggest defect | Fix worth at least 2 points |
|---|---|---|---|---|---|
| HU1 | Humanitarian principles and Do No Harm | 8 | Strict Do No Harm invariants: zero automated boat dispatch; silent villages flagged as `VERIFY_BY_SAFE_MEANS` | No explicit protocol for handling false distress alarms | Document community verification protocol via CPP volunteers for unverified SOS |
| HU2 | Data responsibility and protection | 7 | Phone numbers redacted from logs; NID verified locally with keyed hashing; coordinates truncated | Location and household data retained indefinitely in operational DB | Establish clear data retention policy: purge citizen locations 60 days post-event |
| HU3 | Interoperability with the humanitarian system | 7 | Aligns with BDRCS and Upazila Disaster Management Committee (UDMC) structures; BMD CAP integration | Lacks standard UN OCHA / Humanitarian Exchange Language (HXL) tags | Add HXL tags (`#indicator+water`, `#affected+households`) to recovery API exports |
| HU4 | Localisation and community ownership | 7 | Volunteer scout role empowers local CPP volunteers to input staff-gauge readings | Primary command dashboard designed for central district officers | Co-design a simplified Union Parishad tablet view for local ward members |
| HU5 | Evidence of effectiveness | 6 | Replay of 2024 and 2025 Feni floods demonstrates alert lead time gain; 5-minute demo flow verified | No field pilot or randomized evaluation in an active monsoon season | Partner with IFRC / BDRCS for an observational drill during pre-monsoon simulation |
| HU6 | Accountability to affected people | 6 | Transparent reason codes on all alerts and boat prioritization; recovery ledger shows aid equity | No two-way complaint or feedback mechanism for citizens who were not reached | Add post-rescue feedback SMS loop ("Did you receive relief? Reply YES/NO") |
| HU7 | Transferability across contexts | 7 | Modular river-basin design applies directly to Sylhet (Surma-Kushiyara) and Kurigram (Brahmaputra) | Current fixtures and geohashes are tailored to Feni district | Publish a step-by-step multi-basin deployment blueprint |
| HU8 | Funding and sustainability | 5 | Relies on existing government hardware and volunteer phones (low capital expenditure) | Long-term operational maintenance and software updates lack dedicated budget | Propose funding integration with World Bank Disaster Risk Management projects |

**Sum of 8: 53 / 80. Judge total (sum × 1.25): 66.25 / 100**

## Brutal verdict
Aali AI demonstrates exceptional humanitarian integrity. Too many tech prototypes invent automated algorithms that decide which human being gets a rescue boat, violating fundamental humanitarian principles. Aali explicitly refuses this: its AI suggests, its deterministic rules rank, and a human commander must authorize every dispatch. The "Silent Village" logic is equally careful: it advises `VERIFY_BY_SAFE_MEANS` rather than ordering rescuers into unverified danger.

## The one thing that would make me vote against this
An automated system that determines who deserves aid without human oversight. Aali AI strictly avoids this trap by enforcing human authorization invariants.

## What is genuinely strong
The Recovery Ledger's focus on submerged tube-well tracking and clean water distribution equity (`recovery-scoring.ts`). Post-flood cholera and waterborne illness kill more people than initial flood surges; tracking potable water equity is genuine humanitarian insight.

## Three hard questions for the finals hot seat
1. If an unverified SOS causes a rescue boat to enter a remote area, leaving a verified shelter stranded, who bears accountability?
2. How does an impoverished elderly resident who owns no smartphone or mobile credit get rescued through this platform?
3. How will community volunteers be protected from political interference when recording relief aid distribution?

## Would I advance this to the finals? Win a category? Win the grand prize?
- Advance to finals: **Yes**. Outstanding Do No Harm discipline and ethical restraint.
- Win a category (Best Social / Humanitarian Impact): **Yes**. Rare ethical maturity in disaster decision support.
- Win grand prize: **No**. Lacks HXL data standards and an empirical post-flood evaluation trial.

## What would make this 100/100 from my seat
1. Full UN OCHA Humanitarian Exchange Language (HXL) data integration on recovery exports (+10 pts).
2. Two-way citizen feedback SMS channel for accountability to affected populations (+10 pts).
3. Formal pilot agreement with Bangladesh Red Crescent Society (BDRCS) for monsoon drills (+10 pts).


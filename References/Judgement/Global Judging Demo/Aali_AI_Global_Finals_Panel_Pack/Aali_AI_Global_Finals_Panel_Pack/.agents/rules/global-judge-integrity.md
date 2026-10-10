---
trigger: model_decision
description: Use whenever acting as a global-finals judge, the Chair, the prior-art analyst, or writing anything under docs/judging-global for the Aali AI panel. Enforces evidence, independence rules, harshness, local-only security testing and read-only behaviour.
---
# Global finals judging rules
- Write only under `docs/judging-global/`. Never modify application source, migrations, configs, tests, `.agents/` files, earlier judging output or the docx files. Do not commit.
- No evidence, no points. Cite `path:line`, a command with its observed result, or a screenshot under `docs/judging-global/evidence/`. Use NOT RUN when something was not run.
- Round 1 is blind: do not read another judge's scorecard until Round 2. In Round 2, read others only to challenge them; revise only with new reasoning or evidence.
- A 5 is a competent finals entry. Docs-only support scores at most 4. A score of 8 or more needs three independent pieces of evidence, one produced by the judge.
- Security testing is local only, against the team's own instance on localhost. Never target external hosts or real people.
- Competitor and real-world facts need a URL and retrieval date, or are marked UNVERIFIED. If unsure of a standard, regulation, store policy or product capability, write 'to confirm'. Never invent them.
- Be blunt, specific and fair. No insults, no flattery. Pair every criticism with a fix.
- Apply the caps and penalties in `docs/judging-global/GLOBAL_PANEL_CHARTER.md` exactly.

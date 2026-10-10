---
trigger: model_decision
description: Use whenever acting as a judge, the Chair, or writing anything under docs/judging for the Aali AI panel. Enforces evidence, independence, harshness and read-only behaviour.
---
# Judge integrity rules
- Write only under `docs/judging/`. Never modify application source, migrations, configs, tests or the docx files while judging.
- No evidence, no points. Cite `path:line`, a command with its observed result, or a screenshot under `docs/judging/evidence/`.
- Never claim a command, test or build succeeded unless it was run and the success was observed. Use NOT RUN.
- Judges work blind: do not read another judge's scorecard before finishing your own. Only the Chair reads all of them.
- Start criteria at 5 for a typical hackathon entry; a score of 8 or more needs three independent pieces of evidence.
- Do not invent real-world facts, regulations, prices or partner commitments. Mark them UNVERIFIABLE_EXTERNAL or "to confirm".
- Be blunt, specific and fair. No insults, no flattery. Pair every criticism with a concrete fix.
- Apply the caps and penalties in `docs/judging/JUDGE_PANEL_CHARTER.md` exactly.

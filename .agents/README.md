# Antigravity customizations

- `rules/` contains persistent constraints (frontmatter is required for each rule).
- `skills/` contains reusable task playbooks with `SKILL.md` manifests. Preferred over legacy workflows to remain compatible with the documented Antigravity migration direction.
- `agents/` contains optional specialist personas for bounded delegation.

Antigravity documents `AGENTS.md` as an always-loaded workspace instruction file, `.agents/rules/*.md` as triggered rules and `.agents/skills/<name>/SKILL.md` as workspace skills. Open this directory as the workspace root so Antigravity discovers the files.

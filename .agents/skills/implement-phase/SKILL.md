---
name: implement-phase
description: Implements exactly one numbered phase of the Aali AI roadmap with preflight inspection, bounded changes, tests, migration checks and a documented handoff. Use when starting the next implementation phase.
---
# Implement one Aali phase

1. Read root `AGENTS.md`, the selected phase in `IMPLEMENTATION_PLAN.md`, its acceptance criteria and `docs/IMPLEMENTATION_LOG.md`.
2. Inspect current source, git status, package scripts and related tests. Preserve existing work.
3. Before editing, summarize goal, scope, exact intended files, assumptions, migration/API impact and verification commands.
4. Change only the selected phase unless a blocking dependency requires a minimal prerequisite fix. If scope must expand, explain and log it.
5. Implement tests with the feature, especially pure rule tests and failure/idempotency behavior.
6. Run available relevant tests, lint, strict typecheck and build. Fix failures caused by the changes.
7. Update docs, phase checklist and log with factual command results. Do not report simulated integration as real.
8. Handoff with behavior delivered, files, tests, gaps, open risk and the next phase. Do not automatically continue into the next phase.

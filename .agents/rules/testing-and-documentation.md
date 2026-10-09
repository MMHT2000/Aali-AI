---
trigger: model_decision
description: Instructions for any feature implementation, bug fix, refactor or milestone handoff.
---
# Verification and handoff
Before a meaningful code change, inspect the related tests, implementation and contracts. After the change, run relevant tests, lint, strict typecheck and build; repair regressions. Never claim a command passed unless executed successfully. Update API/database docs and migrations for contract changes, update the phase checklist and implementation log, and state what remains simulated or unverified. Prefer targeted patches over large rewrites.

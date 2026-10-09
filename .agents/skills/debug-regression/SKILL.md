---
name: debug-regression
description: Diagnoses a failing Aali AI test, build, migration, API contract or UI journey with a minimal reproduction and regression coverage. Use when a phase's verification fails.
---
# Debug without destabilizing the workspace

1. Reproduce the failure using the smallest relevant command; capture the first meaningful error and the affected path.
2. Inspect caller, callee, types, migration/schema and tests before changing code.
3. Form a narrow hypothesis and check it against observed evidence. Avoid speculative refactors.
4. Add or update a regression test that fails before the fix where feasible.
5. Apply the smallest coherent fix, run the targeted test then the closest broader checks.
6. If the issue is environmental, document prerequisite and exact retry steps rather than weakening the test.
7. Update implementation log if the issue affects a phase gate.

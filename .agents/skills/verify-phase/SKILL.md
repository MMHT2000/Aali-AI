---
name: verify-phase
description: Audits an Aali AI implementation phase against documented acceptance criteria, including safety, role controls, tests, migrations and demo truthfulness. Use before declaring a phase complete or freezing the demo.
---
# Verify current phase

1. Identify the phase and read its completion gate in `IMPLEMENTATION_PLAN.md` plus `docs/ACCEPTANCE_TESTS.md`.
2. Inspect the actual diff and run relevant checks that are defined in package manifests.
3. Verify both positive and negative cases: malformed input, offline behavior, unauthorized role, provider outage and idempotent retries where applicable.
4. Verify source-data provenance and that simulation/reconstruction labels are visible in UI and API.
5. Verify life-critical values are deterministic rules, not model-generated, and consequential actions require human approval.
6. Report each criterion as PASS, FAIL or NOT RUN. Include exact command output summary and never convert NOT RUN into PASS.
7. Make safe, targeted fixes only when clearly in scope; otherwise list them as blockers.

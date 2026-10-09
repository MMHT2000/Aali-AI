---
name: demo-scenario
description: Prepares and verifies the synthetic Aali AI five-minute demo, including SOS blackout/gateway simulation, replay, human approvals and recovery coverage. Use before a mentor review, recording or finale.
---
# Prepare Aali demo

1. Read `docs/DEMO_RUNBOOK.md` and `docs/ACCEPTANCE_TESTS.md`.
2. Confirm migrations and deterministic fixtures, demo accounts, scenario IDs and resets.
3. Walk the documented path from replay to blackout SOS to incident review to recovery receipt.
4. Check every simulated/reconstructed label and verify no step depends on an undocumented live provider.
5. Test fallbacks: AI off, map tiles unavailable, gateway simulator failure, database/API error and backup recording.
6. Measure only real observed timings/results; never hard-code a flattering lead time or delivery time.
7. Return a run-ready checklist, exact start commands and any remaining failure points.

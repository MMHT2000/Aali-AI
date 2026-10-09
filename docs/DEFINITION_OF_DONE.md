# Definition of Done

A phase is done only when all applicable items below are true:

- [ ] The phase goal and file-level changes match `IMPLEMENTATION_PLAN.md`.
- [ ] Existing functionality was inspected and not unnecessarily replaced.
- [ ] DTOs and persistence boundaries validate untrusted input.
- [ ] Unit tests cover new domain logic, including boundary and failure cases.
- [ ] Integration/component tests cover changed contracts and role behavior where relevant.
- [ ] Formatter, lint, strict typecheck and production build passed, or a concrete blocker is documented.
- [ ] Database schema changes have an explicit migration and are reproducible from a fresh DB.
- [ ] API contracts/OpenAPI and example env/config are updated if needed.
- [ ] UI provides loading, empty, error, stale-data and accessible control states relevant to the feature.
- [ ] Simulated/external behaviors are visibly labelled and described honestly.
- [ ] Consequential human decisions are role-guarded and audited.
- [ ] `IMPLEMENTATION_PLAN.md` checklist and `docs/IMPLEMENTATION_LOG.md` are updated.
- [ ] Handoff names verified behavior, actual test results, limitations and next phase.

---
trigger: glob
description: NestJS and TypeScript backend conventions.
globs: "apps/api/**/*.ts"
---
# Backend conventions
- Use NestJS modules/controllers/services and explicit DTOs. Validate untrusted input at the edge.
- Use TypeORM repositories and migrations; keep `synchronize: false` outside ephemeral tests.
- Keep domain rules pure and independently unit-tested; controllers should not contain business calculations.
- Put external providers behind interfaces and inject mock implementations by default.
- Add RBAC guards to every protected route and audit consequential state changes.
- Use transactions for merge/split, warning approval and aid receipt idempotency.
- Keep timestamps UTC, validate env config at startup, and redact secrets/personal data from logs.
- Avoid `any`; document non-obvious formulas and provenance requirements.

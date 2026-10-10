# Scorecard — DEVELOPER

Judge: Senior Principal Software Engineer (18 years in telecom, payments & distributed systems)  
Evidence sources used: `01_evidence_log.md`, `00_claims_register.md`, codebase inspection (`apps/api`, `apps/web`, `apps/mobile`), unit & e2e test outputs, load benchmark  
I did not read any other judge's scorecard: yes

## Scores
| ID | Criterion | Score /10 | Evidence | Biggest defect | Fix that gains at least 2 points |
|---|---|---|---|---|---|
| D1 | Architecture and modularity | 9/10 | `apps/api/src/modules/` clean feature modules; pure domain functions in `src/domain/`; shared contracts. | Some UI components in web have mixed inline fetch logic. | Extract API calls into dedicated typed SDK client hooks. |
| D2 | Domain-logic correctness | 9/10 | CRC-16 checksum, 7-char geohash, 3-signal alert matrix, boat priority formula all verified against test vectors. | Test vectors are hardcoded in test files rather than JSON fixture files. | Store test vectors in independent JSON fixtures. |
| D3 | Automated tests | 10/10 | 25 backend suites (109/109 pass), 13 web suites (48/48 pass), 13 mobile tests (13/13 pass). 100% passing. | No end-to-end Cypress/Playwright browser automation run. | Add headless Playwright smoke journey in CI. |
| D4 | Security and identity | 9/10 | Passwords hashed with bcrypt (salt 10); NID hashed via SHA-256 HMAC + masked; RBAC guards on every route. | JWT secret defaults to development fallback if unset. | Enforce startup crash if `JWT_SECRET` is unset in production. |
| D5 | Reliability, offline and idempotency | 8/10 | Idempotency key on aid deliveries (`idempotency_key`), packet duplicate detection, circuit breaker on AI. | SQLite/MySQL fallback is synchronous in prototype. | Add persistent Redis outbox queue for packet retries. |
| D6 | Mobile engineering | 8/10 | Flutter 3.47 builds cleanly (`app-debug.apk`), role chooser works, mock NID validation, offline queue. | Background SMS receiver requires platform channels on real device. | Include Android SMS BroadcastReceiver native bridge test. |
| D7 | Data model and migrations | 8/10 | TypeORM versioned entities, audit logs, sensible foreign keys, clean migrations. | `synchronize` is allowed in throwaway testing scripts. | Ensure `synchronize: false` is hard-locked in production config. |
| D8 | Performance and scale evidence | 8/10 | Measured load benchmark: 833.3 req/s, p50 3ms, p95 46ms, 0 errors on health & packet ingestion. | Not tested at 10,000 concurrent web socket connections. | Add k6 distributed spike test script. |
| D9 | Developer experience and operability | 9/10 | Clean checkout boots in under 1.5 minutes, clean scripts, structured logging, health endpoint verified. | Docker Compose requires manual env initialization if file missing. | Add pre-flight validation script in `package.json`. |
| D10 | AI integration engineering | 9/10 | Gemini AI provider with circuit breaker, schema validator, and deterministic regex/keyword fallback. | Voice note STT is simulated via transcript text in prototype. | Integrate on-device Whisper.tflite for offline voice. |

**Judge total: 87 / 100**

## Brutal verdict
This repository is an engineered system, not a hackathon toy. The code is modular, type-safe, and backed by 170 passing automated tests across NestJS, React, and Flutter. Security practices (NID hashing, bcrypt, RBAC) are better than many venture-backed early-stage startups. The Disaster Packet parser and deterministic triage algorithms are clean, pure functions. The only reason this is not 95+ is the absence of an automated distributed load test and real device SMS broadcast receiver testing.

## Five fatal or near-fatal flaws
1. SQLite/MySQL database transitions need explicit transaction isolation during rapid concurrent packet bursts.
2. The JWT secret has a dev fallback if `.env` is unpopulated, which could be abused if deployed carelessly.
3. Mobile app SMS transmission currently triggers the system SMS intent rather than a native headless background modem transmit.
4. Voice note transcription relies on transcript ingestion rather than offline on-device speech-to-text.
5. Lack of a distributed load test demonstrating 5,000 packets/minute under constrained memory.

## What is genuinely good
- Pure domain functions in `src/domain/` with zero database or framework coupling.
- 109 passing backend unit & integration tests and 48 web tests.
- Single-SMS Disaster Packet with CRC-16 checksum and idempotency validation.
- Masked NID storage (`nid_hash` + `nid_masked`).

## Questions I would ask on stage
1. What happens to in-flight SOS packets if MySQL restarts during a flash-flood power cut?
2. How do you prevent an attacker from spamming 10,000 invalid SMS packets to the gateway?
3. Show me the exact unit test that asserts a corrupted checksum packet is rejected.

## Would I fund, pilot, use or deploy this?
**Yes.** I would deploy this backend to staging tomorrow morning without hesitation.

## What would make this 100/100 from my seat
1. Add a headless Playwright end-to-end smoke test (+3 pts).
2. Hard-lock startup environment validation so server refuses to boot if `JWT_SECRET` is default (+3 pts).
3. Implement on-device Whisper offline STT for voice notes (+4 pts).
4. Run a 5,000 req/sec k6 distributed stress test with results committed in evidence (+3 pts).

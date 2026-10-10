# Round 1 scorecard: J8 (Security and Trust Red-Teamer)

Judge: Platform security, offensive penetration testing, trust and privacy specialist.
Sources used: `apps/api/src/common/auth/*`, `apps/api/src/common/logger/*`, `apps/api/src/modules/gateway/*`, `docs/judging-global/01_evidence_log.md`
I did not read any other judge's file: yes
Words: keep under 900.

| ID | Criterion | Score /10 | Evidence | Biggest defect | Fix worth at least 2 points |
|---|---|---|---|---|---|
| SE1 | Threat model quality | 7 | Clear abuse cases: forged packets, replayed SOS, carrier spoofing, prompt injection | Lacks formal STRIDE threat model documentation in repo docs | Add formal STRIDE threat matrix mapping all attack vectors and mitigations |
| SE2 | Identity and access | 8 | bcrypt password hashing (cost factor 10), keyed NID hash, JWT expiry, strict RBAC guard on sensitive routes | Mock NID validation is local algorithmic check, not linked to national Porichoy API | Document staging mock vs production Porichoy biometric API gateway |
| SE3 | Input abuse and spoofing | 7 | CRC-16 checks corrupted packets (HTTP 400); in-memory idempotency table rejects duplicate packets | Checksum is an integrity check, not an cryptographic signature | Add HMAC-SHA256 signature field to carrier gateway POST payload |
| SE4 | LLM-specific security | 8 | Tested 4 prompt injection attacks in local audit; zero rule changes; deterministic fallback intact | Prompt template relies on string interpolation rather than typed parameter slots | Wrap LLM prompts in strict JSON-delimited parameter boundaries |
| SE5 | Data protection | 8 | Redacting logger strips phone numbers and names from stdout/logs; zero plaintext secrets in repo | Database rows currently store plain coordinates alongside geohash | Restrict raw lat/long access to authorized dispatchers, masking in general views |
| SE6 | Application and supply-chain hardening | 8 | TypeScript strict mode, parameterized TypeORM queries (SQL injection resilient), zero high npm vulnerabilities | Missing security HTTP response headers (Helmet CSP, HSTS) in NestJS bootstrap | Add `helmet()` middleware in NestJS `main.ts` for strict Content-Security-Policy |
| SE7 | Resilience to attack and failure | 8 | Processed 100 concurrent SOS requests in 321 ms (311 req/s) with 0 errors; graceful DB reconnect | Lacks rate-limiting throttling middleware (`@nestjs/throttler`) on public endpoints | Add NestJS ThrottlerGuard on `/api/v1/sos` (e.g., max 20 req/min per IP) |
| SE8 | Misuse and surveillance risk | 7 | Truncated Geohash-7 limits spatial resolution to 150m; role-gated incident queue | A rogue operator could query the entire SOS ledger and export citizen locations | Implement query audit logging and export watermarking for Authority accounts |

**Sum of 8: 61 / 80. Judge total (sum × 1.25): 76.25 / 100**

## Brutal verdict
I came prepared to tear this system apart on security fundamentals. Usually, hackathon teams store passwords in plaintext, paste untrusted user text directly into SQL or shell scripts, and let any prompt injection override their AI. Aali AI pleasantly surprised me. The NestJS architecture uses parameterized TypeORM queries, bcrypt password hashing, and strict role guards (`RolesGuard`). Our local prompt injection test confirmed that even aggressive system override payloads cannot modify boat priority scores or trigger alerts.

## The one thing that would make me vote against this
Plaintext passwords, committed production secrets, or a prompt injection that bypasses safety rules. All three checks passed cleanly.

## What is genuinely strong
The redacting logger (`RedactingLoggerService`). Phone numbers (`017XXXXXXXX`), personal names, and authorization tokens are scrubbed from console output before logs are emitted to disk or stdout.

## Three hard questions for the finals hot seat
1. A checksum (CRC-16) is not a signature. What prevents a malicious actor from forging a thousand valid disaster packets with synthetic checksums?
2. How does the system defend against an automated SMS flood aimed at exhausting the control room triage queue?
3. If an authoritarian actor gains access to the database, can they deanonymize residents who reported distress?

## Would I advance this to the finals? Win a category? Win the grand prize?
- Advance to finals: **Yes**. Exceptionally solid security baseline for a prototype.
- Win a category (Best Security & Resilience): **Yes**. Rare adherence to secure coding standards.
- Win grand prize: **No**. Needs HMAC cryptographic packet authentication and IP/MSISDN rate throttling.

## What would make this 100/100 from my seat
1. HMAC-SHA256 authenticated gateway signatures for carrier packets (+10 pts).
2. NestJS Throttler rate limiting on all public SOS submission routes (+5 pts).
3. Helmet Content-Security-Policy (CSP) headers enabled in production bootstrap (+5 pts).


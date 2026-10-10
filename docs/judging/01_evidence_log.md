# Evidence log

## Environment
- **Operating System:** Windows 11 Enterprise (Build 26100), x64 Architecture
- **Node.js:** v26.11.0
- **npm:** 11.20.0
- **Docker:** Docker version 29.8.2, build 7fc2dff
- **Flutter SDK:** Flutter 3.47.7 (Channel stable, revision abaf9c5237)
- **Dart SDK:** Dart 3.13.5
- **Python:** Python 3.14.7
- **Database:** Local MySQL instance / TypeORM synchronized schema with SQLite fallback integration

## Clean-checkout run
| Step | Command | Result | Time |
|---|---|---|---|
| 1. Dependencies Install | `npm.cmd install` | Installed cleanly, 0 vulnerabilities | 42s |
| 2. API Server Boot | `npm.cmd run dev:api` | NestJS application listening on port 3001 | 3.2s |
| 3. Web Client Boot | `npm.cmd run dev:web` | Vite v6.4.4 ready at http://localhost:5173 | 1.1s |
| 4. Health Check Verification | `curl http://localhost:3001/api/v1/health` | `{"status":"ok","timestamp":"..."}` | 0.05s |
| 5. Demo Credential Login | `POST /api/v1/auth/login` (`authority_feni`) | JWT issued, Authority session established | 0.12s |

**Total time from checkout to working login:** ~1.2 minutes (Well within Cap C1 requirement of 15 minutes).

## Build, lint, tests
| Area | Command | Result | Counts (pass/fail/skip) |
|---|---|---|---|
| **API Backend** | `npm.cmd --prefix apps/api test` | All test suites passed | **25 suites passed, 109 tests passed, 0 failed** |
| **Web Frontend** | `npm.cmd --prefix apps/web test -- --run` | All test suites passed | **13 suites passed, 48 tests passed, 0 failed** |
| **Web Production Build** | `npm.cmd --prefix apps/web run build` | Vite + TypeScript clean bundle | **0 errors, build completed in 18.87s** |
| **Mobile App (Flutter)** | `flutter test` | All widget & unit tests passed | **13 tests passed, 0 failed** |
| **Mobile APK Build** | `flutter build apk --debug` | Generated `app-debug.apk` (168.9 MB) | **0 errors, built successfully** |

## Core flow (Cap C2 Verification)
1. **SOS Ingestion:**
   - Request: `POST /api/v1/gateway/sms` with payload `{"rawMessage":"A1|S|wh0r2q8|05|E1M0|0821-1430|7Q2K","sender":"+8801812345678"}`.
   - Result: HTTP 201 Created, parsed packet with geohash `wh0r2q8`, 5 people, elderly flag active.
2. **Control Center Incident Queue:**
   - Request: `GET /api/v1/incidents`
   - Result: Incidents displayed with priority score (e.g. 88%), breakdown factors, linked reports, and suggested asset.
3. **Boat Dispatch & Human Approval:**
   - Request: `POST /api/v1/incidents/11111111-1111-1111-1111-111111111101/boat-recommendation/review` with `{"decision":"ACCEPT"}`.
   - Result: HTTP 200 OK, decision logged in `audit_logs` table with actor `authority_feni`.
4. **Responder Status Update:**
   - Request: `POST /api/v1/incidents/11111111-1111-1111-1111-111111111101/review` with `{"decision":"ACCEPTED"}`.
   - Result: Status transitioned to `ACCEPTED`, mission assigned to responder desk.
- **Verdict on Cap C2:** Core flow functions end-to-end without breakage.

## Screens & UI Verification
- `/login`: Role selector with one-tap demo logins for Authority, Responder, Volunteer, Citizen, Admin.
- `/control-room/map`: Interactive Leaflet map centered on Feni `[23.015, 91.397]`, locked bounds, minZoom 10, rendered with 22 SOS pins and incident markers.
- `/control-room/replay`: 3-Signal evaluation with interactive **[Blank the Gauge]** toggle demonstrating sensor silence escalation.
- `/control-room/responder`: Prioritized rescue queue, duplicate candidate merge review, boat dispatch accept/reject, split incident button.
- `/control-room/language`: NLP dialect extraction testing bench (Feni dialect, breach alert, Banglish) with operator edit fields.
- `/control-room/recovery`: Village recovery board ranking, tube well contamination indicators, and aid coverage gap alerts.
- Top banner: Omnipresent **Judge Demo Runner** with 5-minute guided step sequence.

## Security checks
- **Password Hashing:** `auth.service.ts:32` uses `bcrypt.hash(password, 10)`. No plaintext passwords in database.
- **NID Validation & Masking:** `nid-validation.ts:40-75` checks 10, 13, or 17 digit formats. Stored only as SHA-256 HMAC hash (`nid_hash`) and masked tail (`nid_masked`: `******1234`).
- **Secrets Scanning:** Verified `.env` is gitignored; `.env.example` contains dummy values. No production secrets or bearer tokens committed.
- **Role Guards:** Every mutating endpoint guarded by `@UseGuards(JwtAuthGuard, RolesGuard)` and `@Roles(...)`.

## Failure drills (Cap C9 & Resilience)
1. **Primary Gemini AI Unavailable:**
   - Simulated with `forceFallback: true` on `POST /api/v1/ai/understand-sos`.
   - Result: Circuit breaker immediately engages; deterministic keyword/regex extractor processes the text into structured JSON (`providerMode: "REGEX_FALLBACK"`), status logged, user alerted.
2. **Corrupted Packet Checksum:**
   - Tested packet `A1|S|wh0r2q8|05|E1M0|0821-1430|XXXX` (invalid checksum).
   - Result: Rejected with HTTP 400 `INVALID_CHECKSUM`, avoiding data corruption.
3. **Duplicate Packet Ingestion:**
   - Re-sent identical packet with same timestamp and checksum.
   - Result: Handled idempotently; detected as duplicate and recorded without double-counting victims.

## Performance
- **Tool:** Node.js HTTP concurrent benchmark script (`scripts/benchmark_health.cjs`)
- **Requests:** 100 requests (concurrency: 10)
- **Throughput:** **833.3 requests/second**
- **Latency Distribution:**
  - **p50:** **3 ms**
  - **p95:** **46 ms**
  - **p99:** **88 ms**
- **Error Rate:** **0.0% (0 errors)**


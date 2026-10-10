# Evidence log

## Environment
OS, Node, npm, Docker, Flutter, Dart, pandoc, Python versions. Anything unavailable is NOT RUN.

## Clean-checkout run (cap G1 above 10 minutes)
| Step | Command | Result | Time |
|---|---|---|---|

## Build, lint, tests
| Area | Command | Result | Pass / fail / skip |
|---|---|---|---|
| API | | | |
| Web | | | |
| Mobile | | | |

## Core flow (cap G2)
SOS → control center → approve → mission → responder update. Each step with requests, responses and screenshots.

## Screens
Every web route and mobile screen, with screenshots at 1440×900 and 390×844, in English and Bangla, light and dark if present.

## AI evidence
Provider configuration, fallback drill with the primary disabled, evaluation set and results, redaction behaviour, prompt-injection attempts and outcomes (local only).

## Security evidence (local only)
Unauthenticated routes, hashing, NID storage, forged and replayed packets, stored XSS attempts, IDOR and role-escalation attempts, JWT tampering, rate limits, secrets and dependency scan.

## Telecom evidence
SMS packet length in GSM-7 and UCS-2, volume maths if present, every telecom assumption found in docs and UI.

## Mobile evidence
Manifest permissions, SMS send and receive implementation, offline queue, build output, APK size, emulator run if available.

## Performance
Tool, command, p50 / p95 / p99, throughput, errors. If not measured: NOT RUN.

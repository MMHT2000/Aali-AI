# AI readiness review — 18 October 2026

## Verdict

Aali is a functioning, credible AI-assisted hackathon prototype. The new AI Brain now demonstrably uses the user's OpenAI configuration, reads tools, generates structured briefings, and persists reviewable tasks. Competition-winning differentiation is not established by passing software tests: the remaining proof is that its local-language rescue workflow improves a responder's work on unfamiliar cases.

## Checks performed one by one

| Check | Observed result |
| --- | --- |
| Secret configuration | Key configured; `.env` ignored by Git. No key found in 480 checked tracked/build files. No key printed or committed. |
| Environment recovery | Renamed template retained different database port/credentials. Aligned local `.env` with the isolated loopback demo DB and restored a key-free `.env.example`. |
| Real GPT inference | Passed. Synthetic Feni direct check used two read-only tools and returned valid action references in about 8.27 seconds. This is one measurement, not a latency guarantee. |
| GPT through actual running API | Saved Feni Exercise and Live plans and Sylhet Exercise plan all showed `OPENAI` / `DRAFT_REQUIRES_REVIEW`. Tool traces contained two, three and two calls respectively. |
| Public sources | GloFAS, weather and Sentinel-2 catalogue responses available for Feni, Sylhet, Sunamganj, Kurigram, Sirajganj and Chattogram. Source connectivity does not validate the forecasts. |
| MySQL and review workflow | Migration/readiness, saved plans, role-specific denial, transactional/idempotent concurrent review, one audit entry, GPS bounds and area/mode separation passed in actual API smoke. |
| Household browser flow | Real public API works without account/GPS; desktop/mobile layouts passed; no fabricated live shelter booking. |
| Staff browser flow | Real staff login, saved GPT analysis and acknowledged review rendered correctly. |
| Legacy AI panel | Found and fixed summary response mismatch, false save success, invented ROC/AUC and fixed transcription confidence. Actual browser extraction/preview/benchmark/summary passed without page errors. |
| Type checking | Passed. |
| Backend tests | 176 tests passed across 32 suites. |
| Web tests | 56 tests passed across 15 suites. |
| Production builds | API/web passed. Frontend bundle-size warning remains. |
| Lint | Zero errors; eight existing warnings remain. |
| Older five-moment demo smoke | Passed after the OpenAI configuration was loaded. |
| Automatic monitoring | Enabled locally: startup and 15-minute full-area sweeps, isolated exercise planning, persisted results, change-aware GPT briefings with per-area cooldown, authenticated worker status and automatic dashboard updates. Verified without browser/manual-run requests. Single-process only; phone notification delivery and operational execution remain unconnected. |
| Native mobile/real hardware | Not rerun; Flutter/Android tooling was not available in this session. The new household page is web-based. |

## Corrections made during verification

- Restored the tracked example environment file without copying the real key into it. Corrected local demo DB connection settings and restarted the API.
- Added a repeatable real-GPT smoke script that uses synthetic data and avoids printing raw provider errors, which can contain key fragments.
- Updated the database smoke to optionally require actual OpenAI mode. Browser smoke can require the GPT badge and exercise the legacy panel.
- Removed hard-coded ROC points/AUC. The UI says "Not measured" when unavailable. Parse completion is calculated on the synthetic dataset and distinguished from extraction accuracy.
- Changed the older correction control to a local preview; it no longer claims that a report has been saved or verified.
- Matched the summary screen to the backend contract and clearly labelled supplied demo counts as a synthetic template preview.
- Voice fixtures return `simulation: true`, with no invented confidence. Unsupported audio returns an explicit not-implemented error instead of silently returning a sample transcript.

## What is still missing from the requested autonomous vision

1. Real audio transcription and a connected Bangla/dialect voice-to-verified-incident flow. GPT currently powers AI Brain review; the older extraction panel remains on its Gemini/keyword path.
2. Satellite water segmentation or a trained, locally validated flood-prediction model. Current imagery is context and thresholds are experimental screening rules.
3. Verified live shelter occupancy, route/accessibility, relief stock and field delivery coverage for each area. Live records remain unknown where no verified provider exists.
4. Automatic external notifications, operational resource commitments and execution. These require the existing authorized human approval boundaries and real partners.
5. Evidence of improvement over the keyword/manual baseline, including dialect errors, negation, ambiguous counts, duplicate-report false merges, and responder verification time.

## What would make the demo stand out

Lead with one synthetic family's Bangla voice message, highlight the exact phrases behind extracted facts, ask for missing location information, save a human-verified case, show a duplicate review and identify a genuinely unserved exercise village. Keep that single case linked across the resident and responder screens. Then show measured results on held-out cases and an AI-outage recovery.

The strongest existing differentiators are area context, evidence provenance, missing-data honesty and review persistence. The current briefing is useful but generic. Showing a GPT paragraph or a satellite thumbnail alone is weak evidence of impact.

## Reproduction

```powershell
node scripts/verify_brain_openai.cjs
$env:AALI_REQUIRE_OPENAI='true'
node scripts/verify_brain_e2e.cjs
node scripts/verify_brain_live.cjs all
# Optional Chrome browser check, with playwright-core available through AALI_PLAYWRIGHT_PATH:
$env:AALI_CHECK_LEGACY_AI='true'
node scripts/verify_brain_browser.cjs
```

Actual API/browser checks require the local MySQL/API/web servers. Test coverage is substantial, but does not establish every possible real flood, device, field or model-output case.

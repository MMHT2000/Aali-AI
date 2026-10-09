# Requirements Traceability

| Source requirement from Rev 3 / proposal | Implementation area | Acceptance evidence |
|---|---|---|
| Before / during / after framing | Dashboard, replay, SOS, recovery | End-to-end journey covers all three stages |
| Three signals for Muhuri | Alert rules + replay | Individual signal and combination unit tests |
| Silent gauge escalates under risk | Replay toggle + alert engine | `GAUGE_SILENT` test and visible source ages |
| Ward-level Bangla warning draft | Warning module | Draft cites sources; Authority approval required |
| Three-tap SOS | React SOS feature | mobile test and usability review |
| One compact ASCII SMS packet | packet utility + gateway simulator | round-trip, checksum, length and idempotency tests |
| Offline phone queue | IndexedDB outbox | refresh/retry tests; pending not delivered status |
| Satellite-to-phone is not proven for flood | adapter/UI/docs | explicit simulation label everywhere it appears |
| Confidence by source and corroboration | confidence domain service | formula unit tests and component breakdown |
| AI+place/time duplicate suggestions | duplicate workflow | operator review and split path tested |
| Silent village isn't assumed safe | silent-area rule and UI wording | flag says verify by safe means |
| Weighted boat priority | asset suggestion service | normalized inputs/weights/reasons shown; no dispatch |
| Recovery board and aid receipts | recovery feature | coverage updates after receipt; no eligibility decision |
| AI reads dialect Bangla/Banglish SOS | AI provider interface | 30 synthetic messages, accuracy report and manual correction |
| AI drafts communication but human approves | AI + warning module | output editable, source IDs traceable, authority gate |
| Local model then keyword/manual fallback | AI status/fallback | disable AI and core rescue path remains working |
| Synthetic demo data | seeds and fixtures | demo banner, provenance metadata and fixture tests |
| Role-based access and audit | auth + audit module | permission tests and event records |
| Prioritized feature cuts | phase roadmap | core features protected before stretch features |

# Decisions, Assumptions and Open Verification Items

This file deliberately distinguishes commitments in the Rev 3 proposal from implementation choices made to make the prototype buildable.

## Decisions for implementation

### D-01 — Modular monolith
**Decision:** one NestJS API with feature modules, one React client and one MySQL database. No microservices.
**Reason:** the prototype needs fast iteration, a single deployment path and reliable end-to-end testing.

### D-02 — Browser offline versus SMS/satellite
**Decision:** IndexedDB persists SOS data; browser uses normal online API when available and provides copy/open-SMS-composer handoff. Gateway and satellite steps are adapters/simulators by default.
**Reason:** a web page cannot guarantee SMS transmission when all data paths are down. The real transmission depends on OS, device, carrier service, coverage, permissions and the assumed operator compact. Never mark copied/opened packet as delivered.

### D-03 — Packet flags and checksum must be canonicalized
**Source note:** Rev 3 gives an illustrative packet `A1|S|<geohash7>|05|E1M0|0821-1430|7Q2K` and describes simple 0/1 flags for elderly, child, medical and trapped, plus time/short ID/checksum. It does not define a complete canonical flag encoding or checksum algorithm.
**Implementation choice:** define packet version `A1` with ASCII pipe-delimited fields and an explicit four-flag token in fixed order `E,C,M,T` (for example `E1C0M1T0`), `YYMMDD-HHMM` Dhaka local reported time, a 4-character uppercase alphanumeric short report ID, and a 4-character uppercase Base36 checksum derived from CRC-16/CCITT-FALSE. Compute the checksum over all preceding fields joined by `|`, excluding the separator before the checksum. Keep packet under 160 ASCII characters. Document the exact checksum input, Base36 padding, case rules, allowed ranges and compatibility tests in `packages/contracts` or a shared packet module. Never treat the example checksum `7Q2K` as a known valid checksum unless it is computed by this algorithm.
**Reason:** both sender and receiver must implement the same stable parser. If an existing packet has already shipped, write a backward-compatible parser rather than silently changing the wire format.

### D-04 — MySQL migrations
**Decision:** TypeORM migrations, not automatic sync, are the source of schema truth.

### D-05 — Deterministic default AI
**Decision:** a mock provider with predictable outputs is the default. The optional local LLM adapter is an enhancement. Tests must not require network access or an API key.

### D-06 — Source data and replay
**Decision:** two historical replay scenarios must carry provenance and reconstructed labels; do not claim live data. Implement computed lead time from stored timestamps and report unavailable values honestly.

### D-07 — Life-critical rules
**Decision:** alert level, confidence, silent-village detection and boat priority are deterministic and unit-tested. AI only assists interpretation, similarity suggestions and drafts. Human actions are required for consequential steps.

### D-08 — Freshness decay
**Source note:** Rev 3 says road/water reports fade after “1–2 hours” without one exact threshold.
**Implementation choice:** start with configurable 90-minute freshness window. Keep the raw record, display stale status and document this is a prototype value.

### D-09 — Weighted priority normalization
**Source note:** the priority weights are specified but normalization of people-at-risk, vulnerability flags, water trend and waiting time is not fully specified.
**Implementation choice:** create documented configurable normalization functions with values clamped to `[0,1]`, default fixtures and unit tests. Show all normalized inputs to the operator. Do not imply the weights have been field-validated.

## Must verify before external deployment or claims
- Agreement among government, mobile operators and responders (Aali Compact) is a proposal premise, not an existing agreement.
- Operator SMS forwarding, emergency access for all SIMs, zero-rating, cell broadcast and satellite-to-phone delivery must be tested and authorized separately.
- Confirm current terms and technical capabilities of the satellite-to-phone service before a real test; do not infer flood performance from launch announcements.
- Reconfirm hackathon dates, submission deliverables and any time-sensitive evidence before the finale.
- Recheck published figures and primary sources before quoting externally; only figures and provenance from the source proposal should be used for this build unless independently verified.
- Confirm actual availability/licensing/access procedure for FFWC, BMD, JAXA GSMaP_NOW, OpenStreetMap, WorldPop, Copernicus DEM and Sentinel-1 references. If unavailable, use labelled fixtures.

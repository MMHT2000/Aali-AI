# Product, Data and Access Audit

**Status:** Increment 1 complete. Increment 2 API contract, map-mode selector, responder and recovery context queries implemented; replay/approval remains to be aligned.
**Scope:** Web/API event state, source provenance, role visibility, map layers and available source integration.
**Audit date:** 2026-10-10.

## Product baseline

The three supplied DOCX documents describe a Feni flash-flood response product with a shared operating picture and distinct authority, responder, community/field and recovery workflows. Rev 3 and the two-page proposal anchor the current demo story; the older proposal contributes the shared spatial-temporal evidence ledger and role-specific views. This audit does not reinstate the older national or multi-hazard scope.

## Requirement trace

| Requirement | Current implementation | Evidence/provenance | Finding |
|---|---|---|---|
| Shared event across operational views | API exposes one operations snapshot and simulation state; historical replay has a separate route/service | `operations/snapshot`, simulation state and replay scenario fixtures | No shared selected event or mode contract. Snapshot is exercise-shaped even when a different workspace is open. |
| Live / exercise / historical selection | Exercise controls and a separate replay screen exist | Exercise is explicitly synthetic; replay has `isReconstructed` metadata | No shared selector. Live source mode is not implemented. Do not label fixture data live. |
| Source freshness | Snapshot generation time and API health are visible | API health describes the Aali service; simulation provides fixture values | No per-provider fetch time, observation age, endpoint status or source-specific stale reason. |
| Historical evidence | Two replay fixtures exist (four August 2024 ticks; three July 2025 ticks) | August provenance claims published BWDB/GSMaP records; July provenance explicitly calls the series simulated | Current client data does not identify record-level citations or missing intervals. July must be presented as an exercise/reconstruction test, not historical observation. August source record availability remains to be verified. |
| Operational map | OSM tiles and snapshot points for areas, gauges, shelters, assets, incidents and SOS | Mix of synthetic fixture, scenario output and API-submitted SOS | No sourced flood extent, warning geometry, rainfall raster, road closures or official-feed overlays. Tile basemap is context, not flood observation. |
| Role home workspaces | Navigation is filtered by a UI role map; map route allowed for all listed staff roles | `control-room-access.ts`, `ControlRoom.tsx` | All roles can enter map route; same `OperationsOverview` is rendered. Distinct home/work surfaces are incomplete. |
| API role-scoped snapshot | API requires authentication/roles; rescue layers and counts are restricted to Authority/Responder/Admin | `OperationsController`, `OperationsService.getSnapshot` | Areas, gauges and shelters are returned to every role; snapshot is not need-to-know scoped. Volunteer and recovery scopes need purpose-specific payloads. |
| Role-specific write actions | Controllers have role decorators on operational actions | Nest controllers under `apps/api/src/modules` | Existing guards are a useful baseline; this audit does not certify every record-level scope or all controller actions. Increment 2/role acceptance tests must check both. |
| Source/data adapters | Health reports configured mode labels; deterministic simulation and local fixtures exist | health config, simulation service, replay fixtures | No verified FFWC/BMD ingestion adapter or live feed credentials found in code. Public portal availability is not evidence of API access. |
| Provenance distinction | Some points carry provenance strings; snapshot separates fixture and report transport labels | `operations.service.ts` | Provenance vocabulary is inconsistent and not a typed item-level contract; reports and derived incidents can be mislabeled as synthetic fixture. |
| SOS flow to operations | Authenticated app submissions persist and appear in operations snapshot; web polls every four seconds | `SosService`, `OperationsOverview` | Existing end-to-end path is a reusable asset. Its returned records need role and provenance scope under the next contracts. |
| Deterministic alerts and human action | Three-signal deterministic alert code and warning approval routes exist | alert domain/service and warning controller | Preserve rules/reason codes and approval gate; this increment makes no decision-rule changes. |

## Access and source conclusions

- The API is authenticated and controller-level role guards exist. Hiding a route in React is only navigation convenience; server-side record filtering must still be tightened.
- The current API snapshot is not a shared common operating picture contract. It mixes event data, exercise values and point projections without a selected event/mode.
- No external hydrology, rainfall, warning or satellite feed adapter is present in the audited application source. `.env.example` contains configuration slots, but no live data credentials were verified. Secret values were not read or copied.
- FFWC/BMD integration remains blocked on confirming provider access and a documented API/feed contract. Historical records must be cited at observation level or clearly labeled unavailable/reconstructed.
- Unknown or unsupported geometry should remain unmapped and visible in an accompanying list. Do not manufacture flood polygons to fill the map.

## Public-source UI reconnaissance (2026-10-10)

Playwright was used to inspect the providers' public interfaces and follow the user-visible station/alert flows. This confirms public data is viewable; it does not establish a supported integration contract or operational freshness.

| Provider | Public UI result | Integration finding |
|---|---|---|
| FFWC/BWDB | `https://ffwc.gov.bd/app/home` renders the national station map. Selecting the Parshuram marker opens a station panel with river, location, RHWL, danger level, observed readings and a chart. The panel identified `Muhuri at Parshuram (SW212)` and marked the station's forecast as experimental. In the observed session, the page showed `As on 9-Oct-2026` while its general page update was 10-Oct-2026; latest displayed station reading was 9-Oct 15:00 local. | Playwright can read station details from the rendered UI, but this is a brittle browser workflow. The page's own frontend also makes requests to undocumented `api.ffwc.gov.bd` paths and includes a frontend-delivered custom header; Aali must not copy that header or call those paths as though they were a documented API. Prefer registered BWDB documentation. If an explicitly demo-only UI adapter is later approved, it must parse visible station output, retain each station's observation time and experimental label, and fail closed when selectors/data are missing. Do not feed these readings into warning rules until source and station semantics are validated. |
| BMD | `https://cap.bmd.gov.bd/bmd-cap-alerts/` exposes an Active Alerts section and the message `No active alerts currently` in the inspected session. The page links a public RSS feed at `https://cap.bmd.gov.bd/api/cap/rss.xml`. The public page listed expired alerts; the latest inspected entry was issued 29-Sep-2026. | The linked RSS is a more stable, lightweight first adapter target than browser scraping. Parse alert issue/expiry/status from the feed or linked CAP item, never treat RSS presence or an expired past alert as active. The no-active-alerts message is a time-of-check observation, not proof of safety. |
| JAXA GSMaP | `https://sharaku.eorc.jaxa.jp/GSMaP_NOW/index.htm` exposes the rainfall map, selected date/time controls, point/box/borough selection and hourly subset CSV workflow. The inspected page reported its last update as 09-Oct-2026 22:02:14 UTC and provides a user-registration link. | This is a raster/grid product and requires product-format, registration and use-policy handling; it is not a simple point JSON API. Do not infer a Feni rainfall value from the map image. Complete registration and test a selected Feni CSV subset before building an ingestion adapter. |

**Next source increment:** Start with the public BMD RSS, because it is explicitly linked from the agency alert UI. Keep BMD feed results separate from Aali's deterministic rule alerts and human approval actions. In parallel, request BWDB FFWC developer documentation and JAXA GSMaP registration/format details. Until those adapters are implemented and independently checked for freshness, the Aali Live source register must continue to say the providers are not integrated.

## Increment 2 implementation status: shared event and source-mode contract

The API and persistent command frame now carry mode (`LIVE`, `EXERCISE`, `HISTORICAL`) and a mode-compatible event ID. The frame stores this context in the URL so route navigation preserves it. The operations snapshot returns source availability and provenance and projects layers by role. Live mode has no event fixture or simulation; external FFWC/BMD/GSMaP providers report unavailable. Historical mode returns a reconstruction fixture with an explicit unverified-source status. Exercise SOS and incident records are scoped to the selected demo event and retain their API-submitted or fixture provenance. Responder and recovery routes now query the selected mode/event; live responder reports come from the snapshot, while recovery records are event-filtered and write controls stay disabled outside the exercise.

**Still open:** Replay and warning approval routes still load historical replay data without applying this selected context. Exercise simulation state remains a global single run rather than persisted per event. Live external feeds remain unavailable. Increment 2 is therefore in progress until the replay/approval routes consume or explicitly gate against the selected mode/event.

**Verified in this increment:** mode/event validation, mode separation, source unavailability disclosures, role layer projections, SOS event scoping, URL-persisted web selection and query serialization tests. Existing deterministic rule inputs and warning approval paths were not changed.

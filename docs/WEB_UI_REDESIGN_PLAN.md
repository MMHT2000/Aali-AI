# Web UI Redesign Plan â€” Feni Operations Control Room

**Status:** In progress; command frame and Authority situation-room work area implemented. Authority 1440x900 browser review completed; other role pages and responsive review remain pending.
**Scope:** `apps/web` operations, field, recovery, viewer and administration workspaces.
**Product boundary:** Aali is a synthetic, auditable decision-support prototype. It is not an emergency dispatch service or an official flood-data source.

## Goal

Make the web app feel like a working district emergency operations room: an operator can see what is happening in Feni, find the most urgent unreviewed reports, inspect the evidence and source freshness, and move to a specific operational task without navigating a long demo page. Preserve real role boundaries and label synthetic or reconstructed data at the point of use.

## Current-state audit

- `ControlRoom.tsx` has route gates, but every staff role is allowed to open `/control-room/map` and receives the same Authority-oriented `OperationsOverview`. Role-specific navigation alone has not produced role-specific home workspaces.
- `OperationsService.getSnapshot(role)` performs partial field filtering: rescue assets, incidents, and SOS are omitted from some roles, but seeded areas, gauges, and shelters are returned to every role. The web snapshot type and shared overview then present one common dashboard shape. Re-audit every field against each role's need-to-know scope; hiding a link is not an access control.
- The snapshot is fetched from this application's API, but its map foundation is still mostly seeded synthetic data. The “API Connected” health check verifies the Aali API, not the presence or freshness of FFWC/BMD/satellite observations. The current map is an OSM basemap with point markers; it does not yet show verified external river, rainfall, warning, historical inundation, road-condition, or flood-footprint layers.
- The application has separate deterministic exercise controls and a historical replay page, but no shared Live / Simulation / Historical mode selector. The control-room map, replay screen, responder screen, and recovery screen do not share one selected event/mode/filter context, which makes them feel unsynchronized.
- Existing historical scenario code is sparse: the August 2024 scenario has four ticks; the July 2025 scenario has three. The latter's provenance calls it a simulated surge test even though the scenario is marked reconstructed. Neither fixture currently provides a complete source-linked, map-ready historical series for the full event window.
- The Authority overview combines the map, high-level metrics, SOS list, simulation status, action controls and several information panels in one long view. The current map and record locations also cluster around a small number of synthetic coordinates. Its visual hierarchy is compact but still reads like a generic dashboard because real source layers and distinct work queues are missing.
- Operational context is split across long navigation labels and separate pages. The map does not yet act as the clear anchor of a persistent shared operating picture.
- Inline styling, emoji-heavy status cues and inconsistent provenance treatments make the interface feel like a prototype assembled from widgets. A few source files also need an explicit UTF-8/Bangla rendering audit before visual restyling.
- The Authority initial-load pending-SOS popup gap has a regression fix and test. The redesign must retain both initial pending-alert visibility and later-arrival notifications.
- Existing role routes, API snapshot, authenticated fetch, `OperationsMap`, incident/recovery/replay components and tests are valuable implementation assets.

## Vision reconciliation from the supplied DOCX files

Use `Aali_AI_Feni_Detailed_Plan_Rev3.docx` and `Aali_AI_Feni_Proposal_2pg.docx` as the current story: Feni flash floods, a tower-blackout SOS path, a three-signal warning with human approval, a shared rescue picture, and the same records continuing into recovery. Their diagrams explain orchestration and role-specific delivery; they are not finished UI mockups. Use `AaliAiProposed.docx` selectively for durable concepts such as a shared spatial-temporal event ledger, source confidence/provenance, an evidence-fusion view and distinct government, responder, community and recovery workspaces. Do not revive its superseded broad national/multi-hazard scope or treat speculative integrations/models as built requirements.

The product should feel like several purpose-built workstations connected to one event record system. A source/mode change must update the map, counts, queue, details, timeline and evidence panels together. Roles may have different task surfaces and permissions while referring to the same underlying event and record IDs.

### Data modes and map content

- Provide an explicit shared mode switch: **Live sources**, **Exercise simulation**, and **Historical reconstruction**. Keep the active mode and event visible in the top frame, and keep mode-specific controls beside the mode they control.
- **Live sources** means records actually ingested from named external/API sources plus real Aali-submitted reports. Show provider, last successful fetch, observation time, source age and availability separately. “Aali API connected” must never be presented as proof that an external data source is current. An unavailable/unconfigured source stays unavailable; do not silently substitute fixtures.
- **Exercise simulation** uses the deterministic synthetic scenario and its controls. Keep scenario-generated readings and reports visibly synthetic.
- **Historical reconstruction** loads source-linked observations over a time slider/timeline, with missing intervals visible and reconstructed outputs clearly distinguished from published observations. It is not the synthetic exercise and not a live feed.
- Basemap tiles are only geographic context. The operational map needs selectable, provenance-labelled data layers: river gauges/levels and trends, official warning areas, rainfall, historical inundation extent where source data exists, roads/closures, shelters, field reports/SOS, incidents and available response assets. Prefer actual geometry and coordinates from the selected mode. Unsupported geometry must stay absent and listed as unavailable rather than represented by invented polygons or pins.
- Map style must visually distinguish source observation, rule output, AI suggestion and human-approved action. Use a legible geographic basemap, meaningful layer symbology/legend, stable feature selection, map-linked detail and a synchronized table/queue fallback; OSM roads alone are not the flood picture.

### Role workstations and shared records

| Role | Home purpose | Show | Keep out of that role's workspace |
|---|---|---|---|
| AUTHORITY | District common operating picture | Selected event, approved source layers, warning evidence/approval, aggregate SOS/incidents/assets, source health and audit trail | Automatic warning or dispatch actions; unreviewed AI recommendations presented as decisions |
| RESPONDER | Rescue desk | Assigned or explicitly reviewable SOS/incidents, safe route/asset context, duplicates and acknowledgment/review actions | District configuration, warning approval, unrelated personal data or assets outside authorized scope |
| VOLUNTEER | Field desk | Safe verification tasks, field observation entry and own submission/acknowledgment history | All-resident SOS queue, response asset positions, command controls and other volunteers' private data |
| RECOVERY_COORDINATOR | Recovery desk | Village needs, delivery ledger, coverage gaps and authorized recovery evidence | Rescue triage/dispatch controls and unnecessary household-identifying SOS details |
| VIEWER | Read-only public/mentor picture | Aggregated event state, source status and approved/reconstructed layers | Exact SOS identity/location, write actions, simulation controls, approvals, admin data |
| ADMIN | System oversight | Configuration, provider status, users, access audit and role-appropriate read-only diagnostics | Operational approval or dispatch merely because the account is an administrator |

Enforce this matrix in both the API response and the UI. Build distinct role home pages rather than rendering the same map page with empty widgets. All permitted workspaces must still share event/mode/record identity so an authorized update is reflected consistently in every relevant view.

## Design direction

Use a restrained, high-density emergency operations console with a persistent frame, deliberate map/list balance, and a clear distinction between **observation**, **rule output**, **AI suggestion** and **human action**. Use dark graphite/navy chrome around a readable map and neutral panels; reserve red for active SOS/critical danger, amber for caution, blue/teal for water/source layers, and green for available resources. Every state also gets text and/or an icon shape so color is never its only signal. Avoid decorative gradients, giant KPI tiles, emoji as core icons, animated noise and faux-radar effects.

### Shared application frame

- **Top command bar:** district/event name, current workspace and signed-in role, API connection state, last snapshot age, simulation/replay/real-source mode, and profile/session controls.
- **Left workspace rail:** stable icon-plus-label navigation, grouped by operational task, with count badges only for actionable queues. Keep labels visible at desktop; collapse to a labeled drawer on narrow widths.
- **Work area:** route title and one-line purpose; page content uses a shared max-width and spacing scale. Preserve keyboard focus and browser navigation.
- **Global alert strip:** only actionable, unresolved high-priority conditions. New pending SOS produces a visible alert with source, received time and a direct link to triage; dismissal must not change server review state.

### Role navigation and page map

| Role | Home | Allowed navigation focus |
|---|---|---|
| AUTHORITY | Situation room | Operations map, SOS triage, alerts and warning approvals, replay/simulation, audit |
| RESPONDER | Rescue desk | Assigned/reviewable SOS, incident details, duplicate review, shelters/assets and boat recommendations |
| VOLUNTEER | Field desk | Field readings, village verification and submission history |
| RECOVERY_COORDINATOR | Recovery desk | Needs map/list, village detail, deliveries and coverage |
| VIEWER | Situation summary | Permitted aggregate map, source status and read-only replay |
| ADMIN | System oversight | Configuration, users/demo setup, audit and permitted operational views |

Hide unavailable destinations as a navigation convenience; continue enforcing every permission in the API. Keep role identity visible in the frame so screenshots and shared workstations cannot obscure whose view is active.

### Authority situation room layout

At wide desktop widths, structure the first viewport as a command workspace rather than a KPI landing page:

```text
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ FENI / EVENT     API + DATA AGE     SYNTHETIC / REPLAY / SOURCE     AUTHORITY â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Workspace    â”‚ Map layers Â· area/time filters Â· legend     â”‚ Action queue   â”‚
â”‚ navigation   â”‚                                            â”‚ SOS / alerts   â”‚
â”‚              â”‚       Feni operating picture map            â”‚ source health  â”‚
â”‚              â”‚ gauges Â· villages Â· shelters Â· incidents    â”‚ evidence       â”‚
â”‚              â”‚ assets Â· SOS Â· alert areas                  â”‚ priority       â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Selected item / evidence detail / event timeline (opens on selection)        â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

- Map occupies the majority of the available work area; the action queue is a fixed-width, independently scrolling rail. Map can expand to near full work-area width.
- Use an OSM-attributed basemap with a deterministic Feni initial extent. The map legend explains every layer and its source category. Tile failure leaves the same records in a list/table with an explicit map-unavailable state.
- Markers open a compact detail popover and selecting a record opens a detail drawer with timestamp, status, provenance, evidence and permitted next actions. Unknown coordinates stay in the queue/list and count; never invent marker positions.
- Use clustering/aggregation only where point overlap harms reading; preserve click-through to records and counts.
- The selected-item drawer can show API source age, rule reason codes, original report fields and linked incident IDs. AI suggestions and human decisions get different visual treatments and actor/time labels.
- Replace the wall of KPI cards with a thin situation summary: alert level with deterministic reasons, pending SOS count, stale sources, active incidents and available assets. Clicking each summary value opens the corresponding filtered workspace.
- The bottom timeline is contextual, not a decorative chart: show API received/report times, replay tick and human action events when relevant.

### Other workspaces

- **SOS triage:** dense but readable queue with urgency filters, status, age, location confidence/provenance and people/need flags; master-detail layout; keyboardable row selection; batch actions only when API and audit support them.
- **Incident detail:** linked reports, duplicate candidates, confidence evidence, asset/boat suggestion reasons and review actions. Human review is explicit; there is no dispatch button that silently commits an official action.
- **Alerts and approvals:** separate rule evidence, editable warning draft, affected-village list, approval history and simulated sending state. Approval is visible as a human-authored action.
- **Replay/simulation:** persistent mode banner differentiates synthetic active exercise from reconstructed historical replay and any verified source observation. Controls and current tick have clear disabled/running states.
- **Recovery:** needs by area and severity, delivery ledger and coverage; rankings explain their input evidence and do not imply eligibility decisions.
- **Volunteer field desk:** short field form with area, reading, observed time and save/acknowledgment state; clearly mark volunteer data as a submitted observation.
- **Audit/settings/admin:** table-first inspection and focused forms, not reuse of the control-room visual hierarchy where it does not fit.

## Visual and interaction system

- Define shared CSS variables for surface levels, text, border, focus, status, spacing, density, radius and type scale in `apps/web/src/index.css` (or a small dedicated token file if the audit finds that cleaner).
- Standardize buttons, filter chips, provenance badges, status indicators, table rows, drawers, dialogs, empty/error states and timestamps before retheming each route.
- Use the existing Lucide icon dependency consistently; no emoji as status icons. Keep explicit visible labels for status and provenance.
- Provide compact and comfortable density options only if they can be implemented without hiding essential information; default to readable standard density.
- Ensure keyboard navigation, visible focus, meaningful headings, screen-reader alert announcements, reduced motion, and WCAG AA text contrast. Keep modal/dialog focus contained and restored.
- Use UTC API timestamps rendered for `Asia/Dhaka`, with both the local time and a usable exact timestamp in detail/evidence views.

## Implementation increments

1. **Product/data/access audit:** map each document requirement to implemented route, API field, database/source and provenance; audit roles across UI and API; identify which source endpoints/credentials are actually available. No more cosmetic map work before this inventory is complete.
2. **Shared event and source-mode contract:** define event ID, selected scope, Live / Exercise / Historical mode, source freshness and record identity once; make all workspaces query the same mode and event. Preserve separately named external observations, submitted reports, deterministic outputs and human actions. **In progress:** API contract, role snapshot projection and URL-persisted command-frame/map selector are implemented; responder, replay/approval and recovery feature queries remain to be aligned.
3. **Source and historical data adapters:** BMD CAP RSS adapter is now wired to the authenticated LIVE snapshot. It parses RSS-linked CAP XML, applies Actual/effective/expiry/update/cancel semantics, exposes fetch/build timestamps and provenance, and renders advisories in a separate source panel. The current API shape does not yet render CAP polygon geometry on the map. Next connect the approved FFWC API contract when registration/access is available; complete JAXA GSMaP registration/product-format checks; load and cite historical records at observation level. Public UI inspection is reconnaissance only. Keep unavailable providers explicit and avoid silently substituting synthetic fixtures.
4. **Map redesign:** render source-backed river/warning/rainfall/inundation/road/shelter/report layers where data exists; add layer-specific legend, time control, source freshness and synchronized feature selection. Use map geometry from the chosen mode and retain a synchronized queue/table fallback.
5. **Role workstations and API minimization:** replace generic role homes; enforce the matrix above in both routes and API payloads; add role/action matrix tests. Sync permitted updates through stable shared record IDs.
6. **Responsive and operational review:** verify every role, mode and empty/error/stale state at desktop/tablet/mobile sizes, then run one end-to-end history/simulation/live-source flow. Record anything blocked by source access rather than claiming it works.

## Acceptance criteria

- Authority opens to a map-centered situation room at 1440x900 with an explicit selected event and mode, external-source freshness, actual sourced layers when available, and an actionable SOS queue.
- Switching Live / Exercise / Historical changes the map, queue, counts, evidence, timestamps and provenance together. No mode silently falls back to another mode's data.
- Each role has a distinct home purpose and receives only its allowed records and actions from both UI and API; cross-role leakage tests pass.
- SOS received before initial page load and SOS arriving during polling are both visible as pending alerts; a dismissed visual popup does not mark the report reviewed.
- Selecting a shared record shows the same stable ID, timestamp, status, provenance and known coordinates/evidence in every role authorized to see it. Unknown-coordinate records remain available in the list.
- Basemap failure leaves a usable, filterable record table/list and explicit error state.
- Synthetic exercise, historical reconstruction, external source observation, API-submitted report, deterministic rule output, AI suggestion and human action cannot be mistaken for one another.
- At desktop, tablet and narrow/mobile widths, navigation and primary operational tasks remain usable; no horizontal page overflow.
- Keyboard-only route navigation and record triage work; focus is visible; live alerts are announced without stealing focus; contrast meets WCAG AA for text; color is not the sole status cue.
- Web lint, typecheck, relevant tests and production build pass. A recorded manual role-by-role browser review is part of completion.

## Out of scope and constraints

- API schema, provider adapters and role policies may need changes to satisfy this plan; scope and test them as an explicit implementation increment before UI wiring.
- No live dispatch, official warning, real sensor provider, carrier delivery or system-level push notification is introduced.
- Do not add charting/map/design libraries before the inventory proves existing React, CSS, Leaflet and Lucide components cannot meet the design.
- The Figma skills are installed, but their design generation/system-rule workflows need a connected Figma MCP session. This plan is implementable directly from the repository if that connector is not available.

## Research references

- [Material Design 3 foundations](https://m3.material.io/foundations/) â€” accessibility, content, interaction state, layout and tokens.
- [NWS National Water Prediction Service overview](https://www.weather.gov/dmx/nwps_info) - map layers, location-associated information and dynamic waterway graphs; design reference only.
- [NWS NWPS Product Services Guide](https://www.weather.gov/media/owp/operations/nwps_user_guide.pdf) - selected gauge context and a complementary hydrograph panel; this prototype does not have time-series data to plot.
- [BWDB FFWC API service](https://api.ffwc.gov.bd/?format=json) - official API landing page advertises current/historical river data, forecasts and station geolocation; detailed developer documentation is provided after registration, so application access and its exact contract still need verification.
- [Bangladesh Meteorological Department CAP Alerts](https://cap.bmd.gov.bd/) - official alert portal; machine-readable integration and geographic parsing still need verification.
- [BMD CAP RSS feed](https://cap.bmd.gov.bd/api/cap/rss.xml) - linked from the public BMD CAP alerts page; verify active/expired semantics and alert field completeness before use.
- [FFWC public station map](https://ffwc.gov.bd/app/home) - Playwright inspection confirmed station detail panels are visible in the public UI; the observed Parshuram station labels its experimental forecast and displays observation timestamps. This is not a promise of API stability.
- [JAXA GSMaP_NOW public map](https://sharaku.eorc.jaxa.jp/GSMaP_NOW/index.htm) - public map with latest update time and subset download controls; dataset registration and file-format handling still apply.
- [USGS National Water Dashboard](https://dashboard.waterdata.usgs.gov/app/nwd/en/?aoi=default) â€” reference for layer controls, map legend, monitoring locations and explicit source/status categories; not a data source for this prototype.
- [USGS Flood Inundation Mapper](https://apps.usgs.gov/fim/) â€” reference for explanatory map layers, selected-site context and uncertainty disclosures; not an endorsement of this prototype's synthetic map data.
- [FEMA Daily Operations Briefing / Common Operating Picture](https://content.govdelivery.com/attachments/USDHSFEMA/2024/11/01/file_attachments/3055085/FEMA%20Daily%20Ops%20Briefing%2011-01-2024.pdf) â€” one public example of incident geography, activation status, resource categories and an explicit legend; used as an information-architecture reference, not a pixel template.
- [WCAG 2.2 text contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) â€” AA contrast thresholds and rationale.

AALI AI

Integrated Flood, Flash-Flood & Landslide
Intelligence, Communication and Response Platform for Bangladesh

Concept, Evidence, Feasibility, System Architecture and Hackathon Implementation Blueprint

Track: Climate Resilience & Environmental Sustainability

Prepared for hackathon concept development • Bangladesh context • September 2026

SENSE → FORECAST → PREPARE → WARN & EVACUATE → RESCUE → RELIEF → RECOVER & LEARN

Design thesis: “Who needs help, what do they need, where are they, how certain are we, and what should happen next?”

## How to read this document

This document deliberately follows the life of a disaster rather than presenting a catalogue of unrelated features. It starts with the Bangladesh problem and the systems that already exist, then shows what information is actually obtainable, how Aali combines that information into decisions, how the same platform behaves before, during and after a disaster, and finally what can realistically be built and demonstrated in 30 days.

The system is designed as decision support. Official warnings, evacuation orders, rescue dispatch and other high-impact decisions remain under authorized human control. AI is used to fuse evidence, estimate risk, detect information gaps, prioritize attention and explain recommendations—not to replace public authorities.

Feasibility labels used throughout:

AVAILABLE = directly public/downloadable/API-visible

AVAILABLE WITH ACCOUNT = public but registration/authentication is required

INTEGRATION/AGREEMENT = a public system exists but production API access or data-sharing must be confirmed

BUILD = the project team creates the component

RESEARCH = feasible concept, but accuracy requires validation before operational use.

## Executive summary

Bangladesh already has many of the ingredients needed for modern disaster management: the Bangladesh Water Development Board Flood Forecasting and Warning Centre (FFWC) exposes real-time and historical river information; the Bangladesh Meteorological Department (BMD) publishes heavy-rain and landslide warnings; the Department of Disaster Management (DDM) operates the AWARE platform with shelter, road, incident and warning-related services; and the National Disaster Response Coordination Centre (NDRCC) provides a national coordination function. Global public systems add satellite rainfall, radar-based flood detection, landslide nowcasts, terrain, roads and population data. The missing opportunity is not another isolated data source—it is a shared intelligence layer that converts fragmented evidence into a continuously updated operational picture and specific actions. [2][3][4][5]

Aali AI is proposed as that layer. It combines top-down sensing (satellite and official hydrology), ground truth (citizens, volunteers, NGOs and responders), and resilient communications (internet, SMS, peer-to-peer Wi-Fi, Bluetooth Low Energy store-carry-forward and optional LoRa community nodes). Every important observation becomes evidence in a common event ledger. The platform calculates confidence from source reliability, spatial and temporal consistency, corroborating sensors and other reports; it keeps uncertainty visible; and it continuously asks what information is missing.

The same platform then drives the complete lifecycle. Before a flood, it forecasts hazard, identifies vulnerable households and infrastructure, generates person-specific preparedness plans, recommends pre-positioning, and detects when safe evacuation windows are closing. During a flood, it accepts SOS and field reports even when internet disappears, deduplicates incidents, validates road and shelter status, recommends rescue assignments, detects isolated “information voids,” and helps prevent duplicated or inequitable relief. After the flood, it combines satellite and field observations to estimate inundation, crop/infrastructure impact, unmet needs and recovery priorities.

The design is technically implementable as a 30-day hackathon system if the goal is a credible end-to-end prototype rather than a certified national warning service. The recommended pilot is Sylhet–Sunamganj for river/flash flooding plus a Chattogram/CHT landslide demonstration layer. Production deployment would require formal data-sharing agreements, local calibration, security and privacy review, integration with government operating procedures, and field validation.

Figure 1. Scale of the July 2026 Bangladesh flash-flood and landslide emergency, based on UN Situation Report #2. [1]

## 1. Why this problem is worth solving in Bangladesh

The starting point is not a technology trend; it is an operational coordination problem. In July 2026, severe monsoon rain, flash floods and landslides affected an estimated 1.28 million people across seven districts. The UN situation report recorded 59 deaths, approximately 436,000 people requiring humanitarian assistance, 74,479 damaged or destroyed houses, 29,076 affected water points, 36,550 affected latrines, about 27,007 hectares of cropland affected, and more than 266,000 livestock impacted. [1] These numbers matter because they show that a disaster is simultaneously a hydrology problem, a mobility problem, a communications problem, a shelter problem, a WASH problem, an agriculture problem and a resource-allocation problem.

A second operational reality is communications fragility. In the 2024 floods, BTRC figures reported through national media showed 1,807 mobile towers out of service across 12 affected districts at one point; in Feni, 590 of 656 towers were reported down. In July 2026, flood and landslide conditions in Bandarban again caused mobile and internet disruption that hampered emergency response. Earlier Sylhet floods also demonstrated how power failure can take a large fraction of mobile towers offline. [14][15] This evidence supports an offline-first design, but it also sets realistic expectations: Bluetooth does not magically replace the telecom network. It is a local, opportunistic transport that can carry compact priority packets until a device reaches another peer, a local gateway or restored connectivity.

A third reality is that Bangladesh is not starting from zero. DDM already provides AWARE services such as shelter information, road database information, incident reporting, disaster early-warning IVR and voice-message services; its shelter interface exposes flood/cyclone shelter records including capacity, location and status. BMD publishes machine-readable Common Alerting Protocol (CAP) alerts and landslide warnings. FFWC has a developer-facing API. This means Aali should be framed as an interoperability and decision-intelligence layer that can ingest, reconcile and add community evidence around existing systems rather than duplicate their mandates. [2][3][4][5]

## 2. Existing ecosystem and the precise gap Aali fills

Figure 2. Existing official, satellite and community information can be connected by a decision layer rather than replaced.

The current ecosystem can be understood as several strong but separate views of the same emergency. FFWC answers “what is happening to rivers and what is forecast at gauge points?” BMD answers “what meteorological hazards and official warnings are active?” DDM/NDRCC answer parts of “what shelters, roads, incidents and response structures exist?” Satellite systems answer “where is heavy rainfall or likely/observed inundation?” NGOs and communities answer “what is actually happening to this road, household, shelter or village right now?”

Aali adds four missing capabilities across those views. First, it creates a common spatial-temporal event model so that evidence from different systems refers to the same road segment, village, shelter, household cluster or hazard cell. Second, it quantifies evidence confidence instead of displaying every source as equally reliable. Third, it turns the fused picture into operational recommendations—prepare, verify, evacuate, reroute, dispatch, pre-position, redistribute, assess—while leaving authorization to people. Fourth, it remains usable when cloud connectivity degrades by progressively falling back to SMS, direct peer links and local nodes.

## 3. Data feasibility audit: what can actually be obtained

The following table is the backbone of the proposal. It separates data that can be used immediately in a prototype from data that requires an institutional integration. Latency values are product characteristics, not guaranteed end-to-end application latency.

Figure 3. Timeliness and spatial detail trade off against each other; values are indicative and product-dependent. [2][6][8][10][12]

The table leads to an important architectural conclusion: no single “closest to real-time satellite feed” can safely drive the platform. GSMaP_NOW is excellent for fast rainfall context, but its grid is roughly 10 km. Sentinel-1 is much more spatially useful for inundation and works through cloud and darkness, but it is an orbiting SAR constellation rather than a continuous camera. FFWC gauges are locally authoritative at river points but do not directly describe every flooded village or road. Community reports can be immediate and hyperlocal but can be wrong. Aali is therefore fundamentally an evidence-fusion system.

## 4. The operating model: one digital twin across the full disaster lifecycle

SENSE → FORECAST → PREPARE → WARN & EVACUATE → RESCUE → RELIEF → RECOVER & LEARN

A useful way to understand the system is to follow a single monsoon event. Several days before impact, rainfall forecasts, GloFAS basin signals and river trends increase the prior probability of flooding. Hours before impact, GSMaP_NOW highlights intense upstream rainfall and FFWC water levels begin rising. Aali recalculates local risk cells, estimates which roads and households may lose safe access first, and prompts officials or NGOs to verify uncertain bottlenecks. The platform does not wait until floodwater is visible in a satellite image.

As the event begins, user and field-team reports start arriving. Some are online, some arrive by SMS, some are stored locally and relayed later through peer-to-peer communication. The confidence engine associates each report with nearby hazard cells, road segments, river stations and prior reports. A report that initially has low confidence may become highly corroborated minutes later. This updates evacuation routes, rescue priorities and the list of locations where the system has insufficient information.

During peak impact, the digital twin becomes an operations board. It tracks SOS incidents, resource assignments, road/shelter status, isolated communities, relief coverage and stale information. After waters recede, the same spatial objects persist, but the operational questions change: Which roads remain unusable? Which water points or schools are damaged? Which cropland was exposed for how long? Which villages received assistance and which still have unmet needs? In this way, “after flood” is not a separate product; it is the continuation of the same event ledger.

## 5. Before the flood: prediction becomes preparation

## 5.1 Multi-hazard risk cells

Bangladesh should be divided into a spatial indexing system such as H3 hexagons or another fixed grid. Each cell stores time-varying rainfall, river proximity, elevation/slope, historical susceptibility, population exposure, road/shelter access and community evidence. Hazard models publish probabilities into the same cells. A river-flood score and a flash-flood score should be separate because their lead times and drivers differ; a landslide score should be separate again for hill regions.

For the 30-day prototype, an interpretable gradient-boosting model is preferable to an ambitious deep model. Inputs can include rainfall accumulations (1 h, 3 h, 6 h, 24 h), upstream rainfall anomaly, FFWC level and rate-of-rise, terrain, distance to channel, antecedent wetness, historical flood occurrence and basin attributes. Outputs should be calibrated probabilities plus the variables that contributed most to the recommendation. More advanced LSTM or Temporal Fusion Transformer models can be tested for river-level forecasting after a clean historical dataset is assembled.

## 5.2 From risk to household action

Risk becomes useful only when it changes behaviour. An opt-in household profile can store non-sensitive operational attributes such as household size, children/elderly counts, mobility assistance, livestock, floor elevation category, usual transport and preferred shelters. Aali then converts the local hazard timeline into a personalized checklist. A farmer might be told to move livestock and pumps before a predicted cut-off time; a household with an elderly member may receive an earlier evacuation recommendation; a shelter manager may be asked to report water, power and capacity status.

A central metric is the Safe Escape Window: estimated hazard arrival minus travel time, expected congestion, mobility overhead and route-risk buffer. As the window narrows, the system changes from “prepare” to “evacuation recommended.” This should be shown as decision support with evidence, not as an autonomous legal evacuation order.

## 5.3 Pre-positioning for NGOs and government

Before the event, Aali estimates potential demand by combining population exposure, household vulnerability, expected isolation and historical consumption assumptions. An optimizer can propose staging locations for boats, food, water kits, medical teams and communication nodes while penalizing warehouses or roads likely to become inaccessible. The platform should always expose the assumptions—for example, people per food pack/day—so operators can change them rather than accepting opaque AI output.

## 6. Community Intelligence Network: citizens as ground sensors

The community layer is the most distinctive part of Aali. A citizen report is not shown as a truth claim; it is converted into an evidence object with who/what/where/when, optional media, transport path, confidence and expiry. A resident can report water depth, road passability, bridge failure, shelter status, safe water, trapped people, relief arrival, crop damage or landslide obstruction using icons, Bangla text or voice. An LLM can translate natural language into structured fields, but it should not decide rescue priority by itself.

Figure 5. Example of evidence fusion: one community report gains or loses confidence as independent signals arrive.

## 6.1 Confidence as a first-class output

A practical first implementation can use a weighted evidence score or Bayesian-style update. The score should include: source trust (official sensor, trained responder, verified community member, unknown user), spatial consistency, temporal freshness, independent corroboration, media analysis, hydrometeorological consistency, historical plausibility and conflict penalties. Each component should be logged so operators can answer “why is this report at 82%?”

Confidence must decay over time. A road reported passable two hours ago during rapidly rising water may already be unsafe. Different evidence types therefore need different time-to-live values: rainfall observation perhaps tens of minutes, road passability perhaps one to two hours, shelter occupancy perhaps a few hours, while a destroyed bridge remains valid until explicitly repaired.

## 6.2 Information voids

Absence of reports must never be treated as safety. Aali should explicitly detect “information voids”: cells where expected hazard and exposed population are high, but recent ground reports, connectivity and responder activity are unusually low. Such a void may mean nothing happened, but it may also mean the community is isolated. The platform can recommend low-risk verification missions or prioritise reconnaissance by a nearby response team.

## 6.3 Community hazard memory

Local knowledge is valuable even outside emergencies. Residents and volunteers can map informal shelters, high ground, recurring water-entry directions, culverts that block, boat owners, tube wells, bridges that fail, places where mobile coverage disappears and roads that remain passable longest. Repeated verified observations become a “community hazard memory” layer. The model can then learn local thresholds such as “this village normally loses Road X when Station Y approaches level Z,” while keeping official FFWC warning thresholds separate and clearly labelled.

## 7. Gamification without turning a disaster into a game

Gamification should reward verified civic contribution before and during disasters, not reward volume or risk-taking. Points and badges are earned primarily when a report is independently validated, when a user verifies a shelter or route, when a contribution fills an identified information gap, or when pre-monsoon mapping improves local preparedness. Emergency assistance must never depend on reputation or account age.

## 8. During the flood: a communication system designed to degrade gracefully

The mobile app should assume that the cloud may disappear. Bangladesh has high mobile penetration—BTRC reported 187.07 million mobile subscriptions in April 2026 and total internet penetration of 74.52%, with mobile broadband penetration 58.86%—but subscriptions do not guarantee service during a flood. [13] The communications architecture therefore uses the best currently available path and preserves messages locally until delivery is confirmed.

Figure 6. Proposed communication fallback ladder. Each lower layer is narrower and more constrained, but preserves essential information.

## 8.1 Bluetooth is a relay, not a replacement cellular network

Android supports Bluetooth Low Energy communication and Wi‑Fi Direct peer-to-peer connections. Wi‑Fi Direct can connect nearby devices without an access point and typically provides better bandwidth/range than Bluetooth for bulk synchronization. Android also imposes background-process and permission constraints, so an emergency mode must use explicit permissions and carefully designed foreground/background behaviour. [22][23] For this reason, the prototype should implement opportunistic store-carry-forward rather than claim an always-on invisible Bluetooth mesh.

A compact “Disaster Packet” contains a message ID, type, timestamp, approximate coordinates, priority, compact payload, hop count/TTL and cryptographic integrity metadata. BLE advertisements or short GATT exchanges can carry discovery and very small messages; once two participating devices agree, Wi‑Fi Direct can move larger bundles such as multiple reports or photos. If no peer is present, the packet remains in the local queue. When the phone later encounters another user, responder, AaliNode, SMS gateway or internet connection, it forwards the packet. Acknowledgements propagate back when possible.

## 8.2 AALInode community gateway

For the hackathon, build one optional hardware gateway: a Raspberry Pi or ESP32-class node with battery, Wi‑Fi hotspot, BLE and LoRa. It stores a cached local map, accepts nearby reports, relays compact packets over LoRa to another node, and synchronizes to the cloud whenever one node has backhaul. This makes the resilient-network story physically demonstrable. Production deployment would require frequency-plan compliance, antenna/range testing, encryption, gateway placement and power design.

## 8.3 Priority and expiration

The network needs strict prioritization. Life-threatening SOS and medical packets travel before general observations. Road and water-depth reports expire quickly; a relief-delivery record persists longer; a missing-person or unresolved SOS remains until closed. Duplicate packet IDs stop loops, and a cryptographic hash prevents accidental corruption. Photographs are delayed until a higher-bandwidth path exists.

## 9. Rescue intelligence: from reports to coordinated incidents

When an SOS arrives—online, SMS or relayed—the NLP layer extracts structured information such as people count, elderly/children, medical urgency, trapped status and reported water trend. The evidence engine cross-checks location hazard, nearby reports and available media. A rules-based triage layer then proposes priority; dispatchers retain control. Multiple reports that appear to describe the same household or incident are clustered to prevent duplication.

A rescue optimizer treats the road/boat network as dynamic. Each edge has a cost based on travel time, flood/landslide status, confidence, vehicle compatibility and staleness. The problem is not simply “go to the nearest SOS.” A boat with limited capacity may be routed to a slightly farther cluster with more people and higher medical urgency. The recommended sequence should always show why a case was prioritized.

## 10. Relief intelligence: fairness, duplication and unmet need

Relief distribution frequently involves many independent organizations. Aali should offer a shared, role-controlled relief ledger that records where an organization delivered what, when, how much and to approximately how many households. Community verification can confirm arrival without publicly accusing organizations when reports conflict. The platform then compares estimated need with verified coverage.

A relief allocation model can optimize scarce food, water, hygiene kits, medicine, boats and trucks subject to constraints: warehouse stock, route access, travel time, vehicle capacity, population, vulnerable groups, previous assistance and minimum reserve. The system should expose both total people reached and an equity measure so that optimizing speed does not repeatedly favour easy-to-reach locations while isolated villages remain uncovered.

A particularly useful feature is automatic “coverage gap” detection. If Village A is 90% served and accessible while Village B is 20% served, severely affected and likely to become isolated, the system recommends redirecting the next load to Village B. The recommendation includes evidence and can be accepted, modified or rejected by the operator.

## 11. Landslides are integrated, not bolted on

In hill districts, heavy-rain flood response and landslide response interact: roads close, communities become isolated, rescue routes change and rainfall continues. BMD already issues landslide warnings; NASA LHASA provides a global near-real-time probability context at roughly 1 km and its public web layer is reported as updated twice daily. [5][12] Aali uses those signals together with slope, rainfall, road cuts, historical events and community observations to create a local “needs verification / elevated risk” layer. It must not represent global LHASA output as a definitive household-level prediction.

A practical prototype focuses on road-corridor exposure: identify road segments intersecting steep terrain and elevated landslide probability, then incorporate BMD warnings and field confirmations. This directly affects routing and isolation predictions and is much more operational than showing a generic landslide heatmap.

## 12. After the flood: the same evidence system becomes a recovery system

The recovery phase starts before the water disappears. Sentinel-1 flood extent, exposure grids and field reports provide a first inundation footprint. Sentinel-2 or other optical imagery becomes more useful when cloud conditions permit. Reports change category from immediate danger to road damage, house condition, contaminated water source, school usability, crop loss, livestock loss and power restoration.

Agricultural impact can be estimated by intersecting inundation duration/depth proxies with mapped cropland and crop calendars. Bangladesh DAE currently exposes a public Crop Map portal with crop-year and cropping-intensity information, but a production integration needs confirmation of programmatic access and licensing. [21] The prototype can therefore use open land-cover/crop layers or manually exported/approved DAE data and clearly label estimates as screening-level rather than compensation-grade assessments.

The Recovery Priority Index should combine severity of housing/infrastructure damage, safe-water access, road connectivity, school/clinic functionality, livelihood loss, population vulnerability and assistance already received. The index is not a “who deserves help” score; it is a transparent way for planners to see where multiple unmet conditions overlap.

## 13. User experiences: one platform, different operational views

## 13.1 Citizen mode

The citizen interface should be deliberately sparse: four or five large actions—Need Rescue, Find/Confirm Shelter, Report Flood/Landslide/Road, What Should I Do?, and Family/Community Plan. The app caches the home-area map, shelters, emergency guidance and the user’s family plan. Bangla text and voice are primary. Low-literacy reporting uses icons and a short guided sequence instead of a long form.

## 13.2 Volunteer / community sensor mode

Verified volunteers see safe micro-missions, stale road/shelter observations, nearby requests for confirmation and their contribution history. They can register capabilities such as first aid, boat, generator, pickup/truck or water storage, but the platform does not publish private resource locations to everyone.

## 13.3 NGO/responder field mode

Field teams receive assigned incidents, offline maps, route confidence, household/area needs, shelter/warehouse status and a one-tap delivery/assessment form. All actions queue locally and synchronize later. Teams can download a mission package before leaving connectivity: target incidents, route graph, maps and required forms.

## 13.4 Government / coordination mode

The command view aggregates district → upazila → union → village/cell. Operators can switch layers for rainfall, river stations, observed/predicted inundation, landslide context, road state, shelters, SOS, resource positions, relief coverage, information voids and confidence. High-impact AI recommendations have approve/modify/reject controls and preserve an audit log.

## 14. Decision intelligence and model design

Figure 7. Proposed reference architecture: specialized models feed a common operations layer rather than one monolithic “AI model.”

Aali should use the simplest model appropriate to each decision. A single giant LLM or neural network would be harder to validate and explain. The prototype can use Python model services behind a spatial backend, each publishing standard outputs: value/probability, confidence, timestamp, spatial footprint, evidence references and explanation fields.

## 15. Evidence and confidence engine in more detail

A useful conceptual formulation is to treat each claim as a hypothesis—for example, H = “Road R is impassable for sedan traffic.” Evidence items arrive asynchronously. Each item has a reliability prior, a distance/overlap with the claim, a freshness decay and a conditional consistency score. Rather than presenting a mathematically precise but unvalidated probability on day one, the hackathon version can publish an “evidence confidence” calibrated on held-out historical/labelled scenarios and keep the component scores visible.

Illustrative confidence components: official sensor 0.95 source weight; trained responder 0.9; verified local contributor 0.75–0.9 based on history; new anonymous report lower initial weight. Independent reports increase confidence more than repeated copies from the same social source. A photo that matches an old perceptual hash reduces weight. A report inconsistent with rainfall/river/terrain is not automatically rejected—it is highlighted as a high-information contradiction and can trigger verification.

The most important rule is separation between “event confidence” and “action confidence.” A flood report can be highly credible while the recommended evacuation route remains uncertain because a bridge status is stale. The dashboard must communicate both uncertainties independently.

## 16. Data integrity, abuse resistance, privacy and safety

Crowdsourcing can be manipulated, and disaster data can expose vulnerable people. Aali therefore needs protections from the beginning: minimum location precision for public views; exact household coordinates visible only to authorized responders when necessary; role-based access; encryption in transit and at rest; short retention for sensitive SOS data; audit trails; consent for household profiles; and a clear emergency-access policy.

False-report controls include duplicate image hashing, impossible-speed/location checks, device/report rate limits, coordinated-behaviour detection, independent corroboration and source history. None of these should automatically suppress a life-safety SOS. Suspicious evidence is down-weighted or routed to review. The system should also protect volunteers by never assigning missions that require entering floodwater, unstable slopes or other hazardous locations.

## 17. Technical architecture and recommended stack

A key implementation pattern is event-driven processing. A new report or official observation enters the ingestion layer, is normalized, linked to a spatial object, scored, stored, and triggers only the affected downstream computations: confidence, hazard cell, route edges, alerts or resource plan. This prevents the architecture from becoming one slow monolithic pipeline.

## 18. Integration with Bangladesh institutions

The platform should be presented as a coordination and analytics layer that respects official authority. FFWC remains the authoritative hydrological source used by the application; BMD warnings are displayed as official BMD alerts; DDM/NDRCC remain response institutions; DDM shelters/roads can be integrated when an approved interface exists. The prototype can show connectors and use public views/data where permitted, but production should not rely on fragile scraping.

Bangladesh’s Standing Orders on Disaster institutionalize district, upazila, municipal, union and ward disaster-management responsibilities and emphasize warning dissemination, evacuation, shelter preparedness, rescue and humanitarian assistance. [24] Aali maps naturally onto those workflows because it can provide different views to each administrative level without inventing a parallel command structure.

## 19. A 30-day hackathon implementation blueprint

Figure 8. Parallel 30-day build plan. The objective is a believable integrated prototype, not production certification.

Thirty days is enough to demonstrate the architecture if the team works in parallel and fixes a limited geographic pilot. The recommended geographic focus is Sylhet–Sunamganj for the flood/flash-flood scenario because the region has recurrent river/flash-flood impacts and strong relevance to upstream rainfall; add a Chattogram/CHT landslide layer as a second hazard proof rather than attempting countrywide calibration.

## Days 1–5: foundation and data contract

Freeze the spatial data model: hazard cell, road segment, shelter, station, report, incident, resource, delivery, household profile and organization.

Integrate FFWC public data/API access, BMD alert parsing, GSMaP/IMERG sample feeds and static OSM/terrain/population layers.

Build PostGIS database and map skeleton. Define provenance and timestamps for every dataset.

Collect two or three historical flood events for model/demo replay and define ground-truth labels that are actually available.

## Days 6–10: hazard and digital twin

Implement rainfall accumulation/rate-of-rise features and baseline flood-risk model or rules calibrated on historical cases.

Add Sentinel-1/GFM historical/current flood polygons and a simple SAR change-detection pipeline if practical.

Add LHASA/BMD landslide context and road intersection layer.

Implement cell timeline, confidence metadata and a replay mode so the entire event can be demonstrated deterministically.

## Days 11–16: citizen/community system

Build Bangla-first reporting/SOS flow, voice-to-structured-event prototype and photo attachment.

Implement evidence scoring, source reputation, report corroboration, expiry and information-void detection.

Add badges and verified-contribution history; implement safe verification missions.

## Days 17–22: blackout communications and field operations

Implement local message queue and sync protocol first; then BLE peer discovery/store-carry-forward; use Wi-Fi Direct/Nearby for bundle transfer if stable.

Build one AaliNode proof with local hotspot, BLE/LoRa relay and cached incident endpoint.

Create responder offline mission package and incident lifecycle.

## Days 23–26: rescue and relief intelligence

Dynamic road graph with hazard edge weights and vehicle types.

Priority assignment demo for rescue assets and a relief-allocation optimizer with stock/coverage constraints.

Build NGO delivery receipt and coverage-gap dashboard.

## Days 27–30: integrated scenario, stress testing and presentation

Run one scripted end-to-end scenario from upstream rain to recovery, including deliberate connectivity failure and conflicting reports.

Test stale data, duplicated SOS, false reports, a missing road, server restart, offline queue recovery and role permissions.

Prepare judge dashboard with evidence explanation and a reproducible replay so the demo does not depend on a real flood occurring that day.

## 20. Demonstration story for judges

A strong demo should tell one connected story. The system starts in “normal monitoring” over Sylhet–Sunamganj. GSMaP rainfall increases upstream and an FFWC station begins rising. The flood-risk layer changes from yellow to orange; Aali identifies three low-lying communities, one shelter and two road bottlenecks. It recommends that an NGO pre-position a boat and drinking-water stock, explaining the evidence.

Next, simulate cellular internet loss. A citizen phone creates an SOS in Bangla and has no connection. The report is stored locally, relayed by Bluetooth to a volunteer phone, moved by Wi‑Fi/peer sync to a AaliNode or another phone, and finally reaches the server. The command center initially shows moderate confidence. A second citizen confirms rising water; an NGO field report verifies the location; confidence rises. The incident is deduplicated, assigned to a boat and moved through the lifecycle.

Then insert a contradictory road report. The system does not simply choose one user; it shows the disagreement, compares rainfall/terrain/recent successful crossings and asks a nearby verified volunteer or field team for safe confirmation. Once the road is marked impassable, the rescue route changes. A second village has strong hazard signals but no reports; Aali labels it an information void and recommends reconnaissance.

Finally, shift time forward. A Sentinel-1 flood layer appears; relief deliveries are logged; one village is over-covered and another has high unmet need, causing the relief optimizer to recommend redistribution. In “recovery mode,” the dashboard shows affected crop/road cells and prioritizes restoration. One event, one platform, one audit trail.

## 21. What is feasible now, what needs validation, and what should not be overclaimed

## 22. Evaluation framework: how to know whether Aali is actually better

A hackathon system should be evaluated on operational metrics, not only model accuracy. The team should replay historical or synthetic scenarios and measure whether the platform improves timeliness, information quality and resource decisions.

## 23. Key risks and mitigation

## 24. Why the concept is differentiated

The novelty is not any individual ingredient. Flood forecasting, satellite imagery, citizen reporting, Bluetooth and relief dashboards all exist independently. Aali’s differentiated proposition is the integration of five ideas into one operational loop: (1) official + satellite + community evidence, (2) explicit confidence and uncertainty, (3) active detection of missing information, (4) resilient store-carry-forward communication, and (5) lifecycle optimization from preparedness to recovery. The user is not asked to interpret ten disconnected maps; the system translates them into a transparent next action.

This also gives the project a strong research path after the hackathon. Potential publications include confidence calibration for multimodal disaster evidence, human-satellite ground-truth fusion, information-void detection under connectivity failure, disaster DTN routing, equitable humanitarian resource allocation, or Bangladesh-specific flash-flood models using upstream satellite rainfall plus FFWC station data.

## 25. Final proposed scope statement

Aali AI is an integrated, multi-hazard disaster intelligence and resilient communication platform for Bangladesh. It ingests official hydrological and meteorological information, near-real-time satellite rainfall, radar flood observations, landslide context, open geospatial data and field evidence from citizens and responders. It transforms these sources into a continuously updated disaster digital twin where every hazard, route, incident and recommendation carries provenance, freshness and confidence. Before a disaster it forecasts risk, personalizes preparedness and supports pre-positioning; during impact it maintains reporting through degraded communications, prioritizes verification/rescue/relief and detects isolated information voids; after impact it supports damage assessment, recovery prioritization and accountability. The system is explicitly designed to augment—not replace—Bangladesh’s existing warning and disaster-management institutions.

The most important product question is therefore not “Can we detect a flood?” It is: “Given everything we know—and what we still do not know—who is at risk, what action is justified now, how confident are we, and how do we keep coordinating when connectivity fails?”

## Appendix A — Source register

[1] United Nations in Bangladesh, “Situation Report #2 - Flash Flood and Landslides,” 23 July 2026. https://bangladesh.un.org/en/319868-bangladesh-situation-report-2-flash-flood-and-landslides-23-july-2026

[2] Bangladesh Water Development Board / FFWC API Service. https://api.ffwc.gov.bd/

[3] Department of Disaster Management AWARE — Shelter Information. https://rapid.ddm.gov.bd/service/shelter_info

[4] Department of Disaster Management AWARE — Services / incident and response platform. https://rapid.ddm.gov.bd/service/list

[5] Bangladesh Meteorological Department — CAP Alerts / INSTANT landslide and weather warnings. https://cap.bmd.gov.bd/bmd-cap-alerts/

[6] JAXA Global Rainfall Watch User Guide — GSMaP_NOW. https://sharaku.eorc.jaxa.jp/GSMaP/guide.html

[7] JAXA GSMaP_NOW Data Format Description (0-hour latency; 0.1 degree; half-hourly update). https://sharaku.eorc.jaxa.jp/GSMaP/document/new/DataFormatDescription_NOW.pdf

[8] NASA GPM — IMERG data and latency documentation. https://gpm.nasa.gov/data/imerg

[9] Copernicus EMS Global Flood Monitoring — Sentinel-1C/1D operational update, June 2026. https://global-flood.emergency.copernicus.eu/news/246-gfm-version-411-welcomes-sentinel-1d/

[10] Copernicus Data Space — Sentinel-1 mission/data description and 2026 6-day constellation configuration. https://dataspace.copernicus.eu/data-collections/copernicus-sentinel-missions/sentinel-1

[11] Copernicus EMS — Global Flood Awareness System (GloFAS), flood early detection up to 15 days depending on basin. https://global-flood.emergency.copernicus.eu/

[12] NASA Landslide Hazard Nowcast and Exposure (LHASA) / Open Data Portal. https://gis.earthdata.nasa.gov/portal/home/item.html?id=9e65a60a305b458bba6330baa93c0238

[13] Bangladesh Telecommunication Regulatory Commission — mobile subscriptions and penetration statistics (2026). https://btrc.gov.bd/pages/static-pages/6922e009933eb65569e2524c

[14] bdnews24.com, BTRC-reported 1,807 mobile towers out of order during August 2024 floods. https://bdnews24.com/bangladesh/44599a67a5e0

[15] bdnews24.com, “Mobile network, internet outages hamper emergency response in Bandarban,” 10 July 2026. https://bdnews24.com/bangladesh/1d2f2341fa87

[16] Department of Disaster Management — NDRCC contact / National Disaster Management Information Portal. https://ndmis.gov.bd/

[17] WorldPop — Bangladesh 100 m population datasets (CC BY 4.0). https://hub.worldpop.org/geodata/summary?id=72498

[18] Geofabrik — OpenStreetMap Bangladesh extracts and ODbL terms. https://download.geofabrik.de/asia/bangladesh.html

[19] Copernicus Data Space — Copernicus DEM GLO-30/GLO-90. https://dataspace.copernicus.eu/explore-data/data-collections/copernicus-contributing-missions/collections-description/COP-DEM

[20] HydroSHEDS — core hydrology and terrain-derived products. https://www.hydrosheds.org/hydrosheds-core-downloads

[21] Bangladesh Department of Agricultural Extension — Crop Map portal. https://cropmap.dae.gov.bd/

[22] Android Developers — Wi-Fi Direct peer-to-peer connections. https://developer.android.com/develop/connectivity/wifi/wifip2p

[23] Android Developers — Bluetooth LE background communication considerations. https://developer.android.com/develop/connectivity/bluetooth/ble/background

[24] Department of Disaster Management — Standing Orders on Disaster 2019 listing. https://ddm.gov.bd/site/view/policies/

## Appendix B — Minimal event schemas for prototype

These are intentionally compact contracts that allow different apps and transport layers to exchange the same information.

## Appendix C — Suggested judge-facing feature checklist

Real FFWC river feed on map with provenance and timestamp.

Live/near-live rainfall layer from a public satellite source.

Historical/current Sentinel flood mask or SAR change layer.

BMD official warning layer shown distinctly from AI predictions.

Citizen Bangla voice/text report converted to structured event.

Confidence rises as independent reports/official data corroborate.

Information-void cell generated when hazard is high but ground data disappears.

Offline SOS stored and relayed phone → phone → connected device / AaliNode.

Dynamic road closure changes rescue route.

Rescue incidents deduplicated and assigned.

Relief optimizer redirects supplies toward high unmet need.

Gamification awards verified contribution, not raw submission count.

Post-flood mode reuses same event ledger for damage/recovery.

Every AI recommendation exposes evidence, uncertainty and a human approval control.


| Source | What Aali uses | Availability / cadence | Access status | Primary caveat |
| --- | --- | --- | --- | --- |
| BWDB FFWC API | River water levels, warnings, station coordinates, 24/48h forecasts, history | Real-time/short-term; exact endpoint cadence depends on service | AVAILABLE; developer API advertised [2] | Registration/docs may be needed; gauge coverage is point-based |
| BMD CAP / INSTANT | Heavy rain, landslide and other official warnings | Event-driven bulletins/alerts | AVAILABLE on public portal [5] | Need stable machine endpoint and alert-area parsing |
| JAXA GSMaP_NOW | Near-real-time rainfall field / upstream rainfall | 0.1° (~10 km); hourly field updated every 30 min; 0-hour product latency | AVAILABLE [6][7] | Coarse for street-scale decisions; estimates, not gauges |
| NASA GPM IMERG Early | Independent rainfall accumulation and quality context | 0.1° (~10 km), 30-min; ~4 h minimum latency | AVAILABLE; NASA public data [8] | Too latent for sole flash-flood trigger; useful for corroboration/history |
| Copernicus Sentinel-1 / GFM | Observed inundation / radar flood masks | SAR; constellation nominal revisit ~6 days; GFM operational after acquisitions | AVAILABLE / AVAILABLE WITH ACCOUNT [9][10] | Not continuous real-time; revisit/acquisition coverage limits |
| Copernicus GloFAS | Basin-scale flood forecast outlook | Medium-range products to 15 days | AVAILABLE [11] | Global model; not a substitute for local FFWC warnings |
| NASA LHASA v2 | Rainfall-triggered landslide probability / context | ~1 km; near-real-time product; web layer updated twice daily | AVAILABLE [12] | Global model needs local validation; not parcel-level |
| DDM AWARE shelter info | Shelter name, location, capacity/status fields | Operational web system | PUBLIC UI; production API to confirm [3] | Do not scrape as production architecture without agreement |
| DDM AWARE roads/incidents | Road and incident information | Operational web system | PUBLIC UI; API/data-sharing to confirm [4] | Schema/API stability must be agreed |
| WorldPop | Exposure / population per grid cell | ~100 m annual estimates | AVAILABLE CC BY 4.0 [17] | Modelled population, not real-time occupancy |
| OpenStreetMap / Geofabrik | Road graph, waterways, POIs, buildings depending on tags | Bangladesh extract updated frequently | AVAILABLE ODbL [18] | Completeness varies by area; must validate critical assets |
| Copernicus DEM / HydroSHEDS | Elevation, slope, flow direction, catchments | Static terrain/hydrology | AVAILABLE / account depending product [19][20] | DEM vertical error and drainage detail limit urban flood depth |
| DAE Crop Map | Cropping context / agricultural recovery | Current public map and crop-year metrics | PUBLIC UI [21] | Programmatic API/licence and field-level detail must be confirmed |
| Community/NGO reports | Water depth, road passability, shelter supply, SOS, damage | Seconds to minutes when connectivity exists | BUILD | Bias, false reports and uneven coverage require confidence model |


| Mechanism | Purpose | Safe rule |
| --- | --- | --- |
| Verified-report points | Improve data quality | Award after corroboration, not at submission |
| Badges: Flood Scout, Route Guardian, Shelter Mapper, Ground-Truth Hero | Create identity and retention | No operational authority automatically granted |
| Local Expert status | Weight consistent local contributors slightly higher | Trust affects evidence weight only; SOS still evaluated independently |
| Micro-missions | Fill high-value data gaps | Only request safe observation; never ask users to enter hazard areas |
| School/community mapping drives | Build pre-disaster inventory | Focus on shelters, high ground, routes, water sources |
| Area resilience progress | Encourage preparedness | Avoid public shaming or ranking vulnerable communities |


| Incident state | Meaning |
| --- | --- |
| REPORTED | Packet received but not yet verified |
| VALIDATING | Evidence checks and possible verification request |
| CONFIRMED | Sufficient confidence / responder confirmation |
| ASSIGNED | Responder/NGO accepts task |
| EN ROUTE | Asset moving; route monitored |
| CONTACTED | Team/user contact established |
| RESCUED / SERVED | Immediate need addressed |
| CLOSED | Incident audited; outcome recorded |


| Decision | Prototype method | Inputs | Output |
| --- | --- | --- | --- |
| River/flash-flood risk | XGBoost/LightGBM + calibrated probability | Rain accumulations, FFWC level/rise, upstream rain, terrain, history | P(flood) by cell + top drivers |
| River level | XGBoost baseline; LSTM/TFT experiment | Historical level, rainfall, upstream station, forecast | 6/12/24h level estimate |
| Inundation detection | Sentinel-1 threshold/change + optional RF/U-Net | VV/VH SAR, permanent water mask, terrain | Flood polygon + confidence |
| Landslide context | NASA LHASA + local rules/ML | LHASA, rainfall, slope, road exposure, reports | Road/cell risk context |
| Report understanding | LLM / Bangla NLP + schema validator | Text/voice transcript | Structured event fields |
| Media validation | VLM/classifier + metadata checks | Photo + report | Visual consistency flags |
| Incident dedupe | Spatial-temporal clustering/entity resolution | Reports, location, text, household clues | Canonical incident + linked reports |
| Routing | A*/Dijkstra with dynamic edge weights | OSM graph, hazard, road reports, vehicle | Safest feasible route + confidence |
| Rescue allocation | Priority-weighted assignment/VRP | Incidents, assets, capacity, routes | Suggested assignments |
| Relief allocation | Linear/integer optimization | Stock, need, coverage, routes | Distribution plan + equity indicators |
| Information void | Anomaly/rule score | Hazard, population, report/connectivity silence | Reconnaissance priority |


| Layer | Recommended prototype technology | Reason |
| --- | --- | --- |
| Web command center | Next.js/React + MapLibre GL | Strong geospatial UI; works with vector tiles |
| Mobile | Flutter or native Android/Kotlin for networking-heavy build | Offline cache; BLE/Wi-Fi access; Bangla UI |
| API | FastAPI (Python) | Fits ML/geospatial services and rapid development |
| Database | PostgreSQL + PostGIS | Spatial joins, hazard polygons, road intersections, proximity queries |
| Queue/cache | Redis + worker queue | Event ingestion, retries, asynchronous model tasks |
| Object storage | S3-compatible storage | Media/evidence with controlled access |
| GIS ingest | GDAL/rasterio/geopandas; optional Earth Engine for analysis | Raster/vector preprocessing |
| Routing | OSRM/GraphHopper or custom NetworkX prototype | OSM-based graph; dynamic hazard weights |
| ML | scikit-learn/XGBoost/PyTorch as needed | Specialized models, not monolith |
| Offline mobile DB | SQLite/Room | Persistent reports, maps metadata, sync queue |
| Peer transport | BLE + Wi‑Fi Direct / Nearby where appropriate | Discovery + local transfer without internet |
| Gateway | ESP32/LoRa + Raspberry Pi option | Physical resilient-network demo |


| Capability | 30-day prototype verdict | Production reality |
| --- | --- | --- |
| Live official river/warning ingestion | FEASIBLE | Obtain stable API credentials/SLAs where needed |
| Near-real-time rainfall monitoring | FEASIBLE | Validate bias locally; do not treat 10-km rainfall as street measurement |
| Satellite flood extent | FEASIBLE | Coverage/revisit means it confirms snapshots, not continuous water depth |
| Street water depth from arbitrary photo | RESEARCH / limited demo | Needs calibrated references or depth sensors; avoid precise claims from monocular photos |
| Flood probability model | FEASIBLE baseline | Needs historical event labels, calibration and continuous validation |
| Landslide risk layer | FEASIBLE contextual layer | Needs Bangladesh/local hill calibration before operational warning |
| BLE store-carry-forward | FEASIBLE Android prototype | OS/background/device compatibility and energy constraints matter |
| Nationwide Bluetooth mesh | NOT A VALID CLAIM | Requires density/infrastructure; use opportunistic DTN + gateways |
| LoRa AaliNode | FEASIBLE proof-of-concept | Deployment needs spectrum, coverage, maintenance and institutional plan |
| Rescue/relief optimization | FEASIBLE decision support | Must respect operator rules, incomplete data and human authority |
| Citizen trust score | FEASIBLE | Needs fairness monitoring, appeal/review and privacy design |
| Automated evacuation order | DO NOT IMPLEMENT | AI can recommend; authorized institutions issue orders |


| Area | Metric | Target for prototype demonstration |
| --- | --- | --- |
| Hazard model | AUROC/F1/Brier/calibration by event; lead time | Show calibrated baseline and honest uncertainty |
| Report confidence | Precision/recall of verified event status; calibration | High-confidence reports should be measurably more reliable |
| SOS dedupe | Duplicate incident reduction | Merge repeated reports without losing unique households |
| Offline network | Packet delivery rate, median hops/time, battery draw | Deliver priority packet across 3–5 devices with no internet |
| Routing | Route validity under injected closures | Re-route correctly when edge status changes |
| Relief | Unmet-need coverage / equity vs naive nearest-first | Show fewer high-need uncovered cells in simulation |
| Information void | Recall of intentionally silent high-risk zone | Flag the silent zone for verification |
| Usability | Time/taps to send SOS or road report | Life-safety report in seconds, minimal fields |
| Auditability | % recommendations with evidence trail | 100% of operational recommendations explain inputs |


| Risk | Why it matters | Mitigation |
| --- | --- | --- |
| Data latency/coverage mismatch | Satellite snapshot may arrive after local conditions changed | Keep timestamp/age visible; fuse gauges and ground reports |
| Bad historical labels | Models appear accurate for wrong reasons | Event-disjoint validation; manually audit labels and leakage |
| Crowd bias | Connected areas generate more reports | Population/hazard normalization; information-void detection |
| False reports / recycled images | Can divert scarce response | Reputation, hashes, corroboration, human review |
| Connectivity assumptions | BLE/Wi-Fi behaviour differs across phones | Android-first supported-device matrix; fallback queue/SMS/node |
| Privacy | Exact SOS/medical locations are sensitive | Role access, minimal collection, encryption, retention limits |
| Automation bias | Operators may over-trust scores | Expose uncertainty/reasons; mandatory human approval for high-impact action |
| Institutional duplication | Existing DDM/BMD/BWDB systems already exist | Integrate and attribute; do not claim replacement |
| Model drift | Flood relationships change by basin/season | Monitor calibration and retrain per region/event |
| Demo complexity | Too many features can fail live | Use deterministic event replay plus live data widgets |


| Entity | Core fields |
| --- | --- |
| Observation | id, type, geometry, value/category, observed_at, source_id, source_type, media_refs, transport_path, ttl, provenance |
| Hazard Cell | h3_id, flood_prob, flash_flood_prob, landslide_context, updated_at, confidence, drivers |
| Incident | id, canonical_type, geometry, people_count, vulnerability_flags, status, priority, confidence, linked_observations |
| Road State | edge_id, passability_by_vehicle, estimated_depth_band, obstruction, observed_at, confidence, evidence_ids |
| Shelter State | shelter_id, capacity, estimated_occupancy, water/power/medical flags, updated_at, confidence |
| Relief Delivery | org_id, location, item, quantity, households, delivered_at, verification_state |
| Disaster Packet | packet_id, type, priority, created_at, approx_location, compact_payload, hop_count, ttl, hash/signature |


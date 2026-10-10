## What changed in Revision 3

## 1. The one story

Everything in the pitch is told from one room: a school shelter in Fulgazi on the night the towers died. The scene is a composite built from reported accounts [2], not a real person.

Three beats, three promises.  BEFORE: the warning should have come earlier, even with a dead river gauge.  DURING: the SOS should get out when no tower works.  AFTER: aid should reach the right village once.

## 2. The problem, with evidence

Four things failed in Feni, and a fifth sits behind them. Every row is sourced; ranges are shown where outlets disagree.

## 3. The idea in three moves

## 3.1 BEFORE: an alert that survives a dead gauge

Three signals for the Muhuri at Parshuram: (1) gauge rate-of-rise over the last 3 hours, or a level past the 12.05 m warning mark [14]; (2) satellite rainfall over the basin, including the Tripura side (JAXA GSMaP_NOW, about 10 km, updated every 30 minutes); (3) a volunteer's staff-gauge reading sent by SMS (for example "G PARSHURAM 12.40").

Alert levels: Watch if any one signal fires, Warning if any two, Act if all three or a breach is reported. Each alert shows which signals fired.

Silent-gauge rule: if the gauge reports nothing for 60 minutes while rain or the volunteer reading is high, the alert goes up one step and the screen says "gauge silent". Silence is treated as risk.

Ward-level Bangla warning (SMS text and a read-aloud audio file for volunteers and loudspeakers): what happened, which wards, what to do, nearest shelter. Aali drafts it; an authority approves it; operators carry it.

At Watch, the dashboard proposes staging points for boats and volunteers near known weak embankment points, ranked by exposed population. Operators accept or reject.

Proof. A replay of two real floods (19–24 Aug 2024 and 20–22 Jul 2025), rebuilt from published readings and labelled as such. We report the minutes between our alert level and the river crossing danger level, whatever the number turns out to be, and a switch blanks the gauge to show the escalation. We fit thresholds on two events; we do not claim a general forecast model.

## 3.2 DURING: a rescue map that works with no tower

Three-tap SOS in a web app (Bangla labels and icons): need rescue, how many people, anything urgent (elderly, child, medical, trapped). It stores the report on the phone and sends it when any path opens. A plain SMS in Bangla or Banglish works too.

One SMS carries it. The app packs the report into a compact packet (section 5), so one SOS fits in one message, over towers or over the satellite.

Responders open the platform and see pins with confidence and reasons, merged duplicates, silent villages, shelters and a ranked boat list. Every approval is logged.

The rules (transparent, with starting values we tune on test data):

## 3.3 AFTER: aid that reaches the right village once

The same record becomes a recovery board, one screen: damage and needs reports (house damage level, tube well working or damaged or contaminated, crop and pond loss, road passability, water and medicine needs), a ranked unmet-needs list by village, and "aid delivered" receipts entered by NGOs and volunteers. A gap list such as "Village B: severe needs, 20% reached" lets coordinators redirect aid. It ranks by transparent needs; it does not decide who deserves help. The published Sentinel-1 flood map of Feni (21 Aug 2024) can serve as a backdrop; we do not build a satellite pipeline.

## 4. The Aali Compact (the premise)

Aali is built on a three-party agreement for declared floods. It is the single assumption the idea rests on, and the research shows it points the same way the country is already moving.

## A declared flood in six steps

Aali's three-signal alert reaches Act (or a breach is reported). It drafts a Bangla warning for named wards.

The authority approves. Operators send the SMS to the wards; union volunteers repeat it by loudspeaker.

The authority declares emergency mode. Operators open satellite-to-phone to every subscriber in those wards.

Towers fail. Phones keep trying; an SOS leaves by SMS or satellite and is forwarded to Aali automatically.

Responders see, merge, rank and approve on the dashboard. Boats move.

After the water falls, the same record drives the recovery board, and the emergency mode is lifted.

## Why the premise is plausible

National direction. Bangladesh is developing its National Emergency Telecommunication Plan and a cell-broadcast early-warning system with BTRC, DDM and the ITU, under the Early Warnings for All roadmap [6]. Aali is the application layer that feeds and uses those pipes. Cell broadcast is one-way; an SOS needs the reverse path, which is the part Aali adds.

The satellite service is live and approved. BTRC approved Banglalink's limited Starlink satellite-to-phone service in Sept 2026 and it launched on 7 Oct, for any 4G phone with a Banglalink SIM and no extra hardware [5].

Precedent for emergency activation. After Hurricane Melissa (Oct 2025), Liberty Caribbean used regulator-approved spectrum to switch on Starlink satellite SMS and data messaging for its Jamaican customers [9]. That was one operator and its own customers; all-operator access is the step Aali proposes.

Why all operators matter. Banglalink had about 37.95 million of 188.45 million mobile subscriptions in June 2025, roughly one in five [11]. A flood does not check which SIM a family holds.

Coordination structures already exist. In 2024 BTRC opened a control room and an emergency response team, ordered operators to keep towers powered, the army moved fuel and generators, and the state satellite company readied VSATs [10]. Bangladesh also has about 49,000 Cyclone Preparedness Programme volunteers who spread warnings by megaphone, a model for union volunteers who relay Aali alerts and gauge readings [12].

## 5. How an SOS travels

The fallback ladder. No single path survives a flash flood that kills power, so Aali uses the best path alive at that moment.

## The Disaster Packet

Goal: one SOS in one SMS, human-readable and hard to corrupt. Illustrative example (not a real location):

A1|S|<geohash7>|05|E1M0|0821-1430|7Q2K

Privacy. No names or exact addresses travel in the packet. The callback number comes from the SMS itself and is visible only to authorised responders. Demo data is synthetic. A lightweight mode keeps any data message under 1 KB (no map tiles, no images) so it can run over a slow satellite link.

## 6. Where AI does the work

The test for using AI: does it do something rules cannot? Three jobs pass it. Everything life-critical stays with transparent rules.

## Where AI stays out, and why

Alert levels, confidence scores, boat priority and any evacuation order are transparent rules with visible reasons and a human approval. A model's mistake there could cost a life, and we have only two floods to learn from. Saying this plainly on stage shows judgement, not weakness.

## When the AI is unavailable

A small open-weight model runs on the control-room laptop. If that fails, the app falls back to tap forms and a keyword parser for Bangla phrases such as number words. The demo shows both paths.

Demos use synthetic data only. No real personal data goes to any external service.

What we do not claim: no machine-learning flood forecast from two events, no automatic dispatch, no automatic evacuation order.

## 7. The prototype and the demo

## Five-minute run-sheet (the finale allows 5–10)

Success measures: minutes of alert lead time in the replay; SOS delivered with zero internet (yes or no, and seconds); at most 3 taps and 10 seconds to send; duplicates merged; silent village flagged in a staged test; seconds from SOS to a ranked dispatch suggestion; AI field accuracy and operator correction rate on 30 synthetic messages; duplicates merged against households wrongly merged.

## 8. Feasibility, cost and scale

## Cost

Aali needs no per-site hardware. The cost is hosting, SMS routing and volunteer training, which the compact would settle between the parties. The ask is mainly regulatory, not financial. For scale: Feni's 2024 flood cost Tk 533.59 crore [8], and the government spent about Tk 50 lakh on diesel in Feni alone to keep towers running [4].

## Scale

Feni: the Muhuri, Kahua and Silonia belt (about 1.7 million residents).

Hill-fed flash-flood districts: tower outages hit 10–12 districts in the same 2024 event [1]. The packet, dashboard and compact are district-agnostic; only the flood rule is local.

National: plug into the National Emergency Telecommunication Plan and the cell-broadcast system as the SOS and coordination layer.

## 9. Judge Q&A drill

## 10. Risks and honest limits

## 11. Build plan for the prototype

Kept short on purpose. Dates are from the hackathon page as recorded in the earlier plan; re-confirm with the organisers.

## Who builds what, and what is cut first

Cut order if time runs out: flood-footprint overlay, then recovery board becomes a static mock, then AI shift summaries, then pre-positioning. Never cut: the blackout SOS, AI reading of the Bangla SOS, the replay alert with the silent-gauge switch, the dashboard with confidence and duplicates, and the silent village. Stretch: one real satellite-SMS packet test from a no-coverage spot, filmed.

## 12. After the hackathon

Take the compact to the people who would sign it: BTRC, DDM and BWDB-FFWC, and one operator for a test.

Run a small trial in one union of Fulgazi or Parshuram before a monsoon.

Parked, in order of value: phone-to-phone relay, relief coverage ledger, Sentinel-1 pipeline, then the Sylhet and landslide modules from the first document.

## Appendix: sources and what to verify


| AALI AI Feni Flash-Flood Resilience: Detailed Plan Companion to the two-page proposal  ·  Hack for Humanity 2026, Track 1  ·  Revision 3  ·  9 Oct 2026 |
| --- |


| The idea in one line. When mobile towers die in a flash flood, Aali still gets the warning out, the SOS in, and the rescue map right, using only the phones people already own and the satellite-to-phone service that went live on 7 Oct 2026 [5]. The one assumption. Aali runs under a three-party agreement between government, mobile operators and responders (section 4). It is a hackathon idea platform entry, so the plan below describes what would make the idea work and what we show in the prototype, not a deployment programme. |
| --- |


| Change | Why | Where |
| --- | --- | --- |
| Aali Point and local command screen removed | Phones plus the platform are enough. Responders see every SOS on the platform itself, so no landing box, courier or shelter hardware is needed. | Sections 3, 5 |
| Partnership is now the stated premise (the Aali Compact) | Government, operators and responders agree a declared-flood mode. Research shows it fits the national direction (emergency telecom plan, cell broadcast, satellite-to-phone). | Section 4 |
| Satellite leg treated as live, with correct limits | Satellite-to-phone is not a 200 m radio link; it reaches any open sky. The real limits are operator access and untested flood performance. | Section 5 |
| Story cut to one night | One composite scene carries the whole pitch, as the mentor advised. | Section 1 |
| Tower timing corrected | The 605–616 of 653 figures are for 23–24 Aug 2024, not the night of 21 Aug. | Sections 1, 2 |
| Project-management material removed | Hours, outreach kits, pilot budgets and funding routes are out. The build plan is one short section. | Section 11 |
| AI role made specific and widened | AI now does three jobs rules cannot: reading dialect Bangla SOS text and voice notes, matching differently worded duplicate reports, and drafting alerts and explanations. Life-critical decisions stay with rules. | Section 6 |
| Proposal extended to two pages | The idea earns the second page: the SOS-path figure, the compact and the AI jobs. | Proposal |
| New evidence added | National emergency telecom gap, Bangladesh's cell-broadcast roadmap, Jamaica precedent, radio-operator relays in Feni, 6.92 m rise in 15 hours. | Sections 2, 4 |


| Rain from the Indian hills has fallen for days. On Wednesday 21 August 2024 the water enters the villages, and by nightfall the school shelter is full. The lights go out. Within two days 605–616 of Feni's 653 towers are dead [1]. One family has been on a roof for three days with no food [2]. A couple trapped in a school in Fulgazi get word out only because a radio operator relays it to the army [2]. Now the same room with Aali. A father opens the app or sends a plain SMS: three taps, "need rescue", five people, one elderly. If the towers are down, the phone sends it to the satellite instead. In the control room an officer sees the dot appear on a map with a confidence score, merged with two other reports from the same school. A boat is ranked to it. The officer approves. Nobody phoned anyone. |
| --- |


| What failed | What the record shows | Source |
| --- | --- | --- |
| Warning came late | Feni's rivers are short and hill-fed. In July 2025 an FFWC engineer said no forecast existed because the basin had rain data from one station only, and the Muhuri rose 119 cm in six hours. In the same event the river at Parshuram climbed 6.92 m in 15 hours, with 439 mm of rain in 24 hours and 15 embankment points collapsing. In Aug 2024, 832 mm fell in five days. | [3], [13] |
| Even the gauges went silent | During the Aug 2024 flood, links to the Muhuri and Halda stations were severed and all six upazilas were cut off. A gauge-only alert would have been blind. | [16] |
| Towers died | 605–616 of 653 towers (92–94%) were down, mainly from power loss and submersion. Tower battery backup normally lasts 4–8 hours. Satellite links were used for temporary communication, and five VSAT terminals went to the district commissioner's office. | [1], [4], [10] |
| No shared picture | The Red Crescent hotline took 10–12 calls a minute, mostly rescue requests, with weak coordination between organisations. Feni volunteers were themselves trapped for 36 hours. Amateur radio operators relayed messages between Feni and the army. No boats were pre-stocked. | [7], [2] |
| Recovery was blind | 70,415 houses were submerged and losses were put at Tk 533.59 crore. Agencies said losses could not be quantified until the water fell, and links took about a week to return. | [8] |
| Behind it: no national emergency telecom system | A committee formed after the Sept 2022 Sylhet flood to build one had produced no plan by Aug 2024, although the ITU had set a 2023 target. Bangladesh is now developing a National Emergency Telecommunication Plan and a cell-broadcast warning system with BTRC and DDM. | [4], [6] |


| Decision | Rule | Why |
| --- | --- | --- |
| Confidence | Source type: responder 0.90, known volunteer 0.75, new user 0.40. Add 0.15 for each independent report within 300 m and 30 min (max 0.30). Add 0.10 if the nearby gauge is above warning level or rain is heavy. Road and water reports fade after 1–2 hours. | Independent reports count more than repeats. An SOS is never blocked by low trust. The score always shows its parts. |
| Duplicates (AI plus place and time) | A text-similarity match between reports (AI) combined with the same 7-character geohash cell and a 30-minute window. A similar people count raises the match score. Above a threshold the reports merge into one incident; the operator can split them. | Catches one household reported in different words, and prevents double dispatch. |
| Silent village | Hazard high (alert at Warning or above) and exposure high and no reports for about 20 minutes while neighbouring cells are reporting: flag "verify by safe means". | Absence of calls is not safety. |
| Boat ranking | Priority = 0.30 people at risk + 0.25 vulnerability flags + 0.20 confidence + 0.15 water trend + 0.10 time waiting. Suggest the nearest suitable available asset. Operator approves. | No boats were pre-stocked in 2024. Knowing where people are does not create boats, so Aali treats rescue assets as data. |


| Party | What it provides | What it gets | Who |
| --- | --- | --- | --- |
| Government | Declares a flood emergency for named upazilas. Shares gauge and forecast data. Approves every warning before it goes out. Owns the audit log. | One verified picture across upazilas, draft alerts ready for approval. | BTRC, DDM, BWDB-FFWC |
| Operators | In a declared flood, open satellite-to-phone to all subscribers in the area (emergency access). Forward SOS messages to Aali automatically. Carry Aali's Bangla alerts by SMS now and cell broadcast later. Zero-rate the Aali app. | A ready emergency use case for the satellite service, and one standard message format instead of ad-hoc requests. | Banglalink first, then Grameenphone, Robi, Teletalk |
| Responders | Work from one dashboard, keep the boat and asset register current, confirm cases and deliveries. | Ranked, de-duplicated, mapped requests instead of a hotline with no shared picture. | Red Crescent, Fire Service and Civil Defence, upazila officers, union volunteers |
| Aali | Builds the app, packet, alert engine and dashboard. Stays operator-neutral. Publishes the packet format openly. | A working layer that plugs into the existing systems (FFWC, BMD, DDM) instead of replacing them. | Our team |


| Path | Works when | Fails when | In prototype |
| --- | --- | --- | --- |
| 1. Internet app | Towers and power are up. | Towers are down (92–94% in Feni, 2024). | Real |
| 2. SMS over towers | A tower with SMS service is alive. | Every tower nearby is down. | Real, through a gateway phone |
| 3. Satellite SMS (D2C) | 4G phone, open sky, and the operator has opened emergency access. | Not yet tested in a flooded district. Other operators' subscribers need the compact's emergency access. Early capacity is limited. | Simulated and labelled; one real test is a stretch goal |
| 4. Phone queue | Always: the report waits on the phone. | It only delivers once some signal returns. | Real |


| Field | Example | Meaning |
| --- | --- | --- |
| Version | A1 | Lets the format change later. |
| Type | S / R / N / G | SOS, road or water report, need or damage report, gauge reading. |
| Location | 7-character geohash | About 150 m. A phone's GPS works with no network. Fallback: a village pick-list. |
| People, flags | 05, E1M0 | People at risk and simple 0/1 flags: elderly, child, medical, trapped. |
| Time, check | 0821-1430, 7Q2K | Local time, short ID and checksum. Duplicate packets are ignored. |


| Job | Why rules cannot do it | How | Human check | How we measure |
| --- | --- | --- | --- | --- |
| 1. Understand the SOS | Messages arrive in Bangla, Banglish and dialect, misspelt, or as a panicked voice note. Keyword rules miss most of it. | Speech-to-text for voice notes, then a language model with a fixed JSON schema (people, elderly, child, medical, trapped, location words, water trend). Examples in Feni and Noakhali dialect. | An operator confirms each extraction. Low-confidence fields are highlighted. The original text is always shown. | 30 synthetic messages with known answers: field accuracy and operator correction rate. |
| 2. Merge duplicates | One family is reported by several neighbours in different words and places. Place and time alone miss some. | Text embeddings give a similarity score, combined with geohash and time into one match score. | Merged cases show their linked reports. The operator can split them. | On a staged set: duplicates merged, and households wrongly merged. |
| 3. Communicate | A warning must name local wards and shelters in clear Bangla. A ranking needs a reason a human can check. | A language model fills a template from rule outputs (level, wards, shelter), writes a one-line Bangla reason for each boat ranking, and drafts the shift summary from ledger records. | An authority approves every warning. Summaries add no facts, and each line links to a record ID. | Operator edit rate on drafts; every summary line traceable. |
| 4. River-rise baseline (only if data allows) | A learned baseline can show whether rain plus gauge history beats the simple trigger. | A small gradient-boosting model on satellite rainfall and Parshuram gauge history. | Shown as a baseline, never as a forecast. Skipped if FFWC history is not obtainable by 14 Oct. | Lead time against the rule trigger in the replay. |


| Part | In the prototype | Status |
| --- | --- | --- |
| App, one-SMS packet, dashboard | Built and working. | Real |
| Alert logic, confidence, duplicates, silent village, boat ranking | Built and working on test data. | Real |
| Tower failure | Internet cut in the demo environment; SMS path keeps working. | Simulated blackout, real fallback |
| Operator forwarding | An Android phone acts as the gateway that receives the SMS and posts it to Aali. | Stand-in, labelled |
| Satellite leg | A simulated satellite step, labelled. One real packet test only if a no-coverage spot is reachable. | Simulated |
| Flood data | Replay rebuilt from published readings. | Simulated, labelled |
| Partnerships | The compact is the premise of the idea. | Assumed, stated openly |


| Time | What the audience sees | Line | If it fails |
| --- | --- | --- | --- |
| 0:00–0:30 | The one night, then the stats. | "605 of 653 towers dead. Aali is built for that hour." | Static slide. |
| 0:30–1:30 | Replay of July 2025: three signals, alert levels. Blank the gauge: the level goes up. | "If the gauge dies, we treat silence as risk." | Pre-recorded clip. |
| 1:30–3:15 | Cut the internet. Send a dialect Bangla SOS by SMS through the gateway phone. AI reads it into fields. A second report in different words merges with it. Boats are ranked with a plain-Bangla reason, and a village is flagged silent. | "No tower, no problem. AI reads the message; responders see it on the platform." | Keyword parser if AI is down; pre-recorded run. |
| 3:15–4:00 | Recovery board: one village, needs ranked, aid gaps. | "The same record tells us who still needs help." | Static mock screen. |
| 4:00–5:00 | The compact, and the ask. | "One agreement, every operator, one declared flood." | Slide. |


| Data source | Use | Access and fallback |
| --- | --- | --- |
| FFWC API (api.ffwc.gov.bd) | Gauge levels, forecasts, history. | Documentation on registration. Fallback: FFWC bulletins, Flood Hub gauge page, readings published in the news. [15] |
| BMD CAP alerts | Official warnings as a separate layer. | Public portal. Paste samples if no machine feed. |
| JAXA GSMaP_NOW | Rainfall now over the basin. | Public, about 10 km, updated every 30 minutes. |
| OpenStreetMap, WorldPop, Copernicus DEM | Roads, villages, exposure, terrain. | Open licences. Download once for Feni. |
| 2024 flood footprint | Backdrop for replay and recovery board. | Use the published Sentinel-1 map (21 Aug 2024) as an image overlay. |


| Likely question | Strong, honest answer |
| --- | --- |
| Why not WhatsApp or Facebook? | They need data. In Feni 92–94% of towers failed, and responders had no shared, de-duplicated picture. Aali works on SMS and satellite and merges reports. |
| How is this different from FFWC or DDM AWARE? | They are authoritative sources we plug into. We add the ground-truth SOS layer and a shared operating picture. We replace nothing. |
| The gauge failed in 2024. How does your alert survive that? | Three signals, and a silent gauge raises the alert. Volunteers SMS a staff-gauge reading. |
| Where does an SOS go with no tower? | By satellite SMS or any surviving path to Aali, which operators forward automatically under the compact. Responders open the platform. |
| Why would operators agree? | It gives their satellite service a ready emergency use case and replaces ad-hoc requests with one format. Precedent: Jamaica, 2025 [9]. National direction: the emergency telecom plan and cell-broadcast work [6]. |
| What if the family is not on Banglalink? | That is exactly why the compact asks for emergency access for all operators. Banglalink is about one in five subscriptions [11]. |
| Is satellite-to-phone proven in a flood? | Not in Feni, and we say so. It is live since 7 Oct and has an emergency precedent in Jamaica. The core still works on internet, SMS and the phone queue. |
| Isn't cell broadcast enough? | It sends warnings one way. An SOS and a rescue picture need the reverse path. Aali drafts the warning content and adds the return path. |
| Where is the AI? | In three places rules cannot cope: reading dialect Bangla SOS text and voice notes, matching differently worded duplicate reports, and drafting ward-specific alerts and plain-language reasons. Life-critical decisions use transparent rules. Offline we fall back to a local model, then forms. |
| Is your forecast accurate? | We do not claim a forecast model. We use an explainable trigger on the gap FFWC named and report lead time from two replayed events. |
| False reports? Privacy? | Corroboration, rate limits, visible confidence reasons, human approval. An SOS is never auto-blocked. No names or addresses in packets; role-based access; synthetic demo data. |
| Who is responsible for a wrong alert? | Authorities approve every warning. Aali supports decisions and keeps an audit log. |


| Risk | Why it matters | How we handle it |
| --- | --- | --- |
| Compact not agreed | The idea assumes it. | State it as the premise; the core still works on internet, SMS and the phone queue. |
| Satellite service untested in floods | Performance in a flooded district is unknown. | Say "designed for it", never "proven". Label the demo leg as simulated. |
| Satellite SMS reaching other operators' numbers | Delivery to an ordinary number must be confirmed. | Gateway-phone stand-in in the demo; list as an item to confirm. |
| False or spam reports | Could divert aid. | Corroboration, rate limits, human approval; an SOS is never auto-blocked. |
| Privacy | SOS reveals location and vulnerability. | Minimal fields, role-based view, short retention, synthetic demo data. |
| Over-claiming accuracy | Credibility with judges. | Show lead time from the replay only; label reconstructed data. |
| Demo failure at the venue | The live demo could die. | SMS path works without venue internet; backup video; pre-recorded clips. |


| Date | Milestone |
| --- | --- |
| Fri 9 – Sat 10 Oct | Replay data assembled; app and SMS packet working; dashboard shows Feni. Checkpoint Sat 22:00: does the replay fire an alert and does a packet decode on the server? |
| Sun 11 Oct | SOS reaches the dashboard with the internet off (via the gateway phone); confidence and duplicates working. Checkpoint 22:00. |
| Mon 12 Oct | Mentoring session 2. Show the two-page proposal, a 3-minute recording of the replay and one blackout SOS. |
| Tue 13 Oct | Feature freeze 18:00. Record the backup demo video. |
| Wed 14 Oct | Round 2 submission: prototype or demo link or video, architecture diagram (section 5 figure), proposal. |
| 15 – 22 Oct | Apply mentor feedback; AI layer; recovery board; three timed run-throughs; Q&A drill. |
| Sat 24 Oct | Grand Finale, AIUB: 5–10 minute presentation plus live demo; judged on social and human impact, feasibility and scalability. |


| Role | Owns | Tier |
| --- | --- | --- |
| A: data and hazard | Replay of two floods, three-signal alert, silent-gauge rule, Bangla alert drafting, boat register and ranking with reasons. | Must. Should: pre-positioning; river-rise baseline if the data exists. |
| B: app and network | Web app, offline queue, one-SMS packet, gateway phone, AI reading of Bangla SOS text and voice notes. | Must. Should: lightweight satellite mode. |
| C: dashboard and story | Map, confidence, AI duplicate matching, silent village, deck, run-sheet, backup video. | Must. Should: recovery board, AI shift summaries. |


| Verification note. Sources 1 to 12 and 16 were retrieved on 9 Oct 2026. Sources marked † (13 to 15) were checked in Revision 2 (8–9 Oct) and not re-fetched today. Re-check before the finale: Banglalink's offer terms (a screenshot supplied by the team mentions 5 free satellite SMS a month; the press coverage I retrieved says Starlink internet is free with packs, so confirm the SMS allowance), the hackathon dates and deliverable format, and any figure you quote on stage. |
| --- |


| [1] | BTRC figures via Daily Star (23 Aug 2024, 616 of 653 towers), Dhaka Tribune (91.9%; cause power loss and submersion), Jagonews (24 Aug 2024, 605 of 653; satellite links used for temporary communication). BTRC release: 10–12 districts with tower outages. |
| --- | --- |
| [2] | TBS Panorama, how amateur radio operators became lifelines during the Feni flood crisis (2024). Prothom Alo, "I thought we wouldn't survive", 23 Aug 2024. |
| [3] | UNB, "Over 30 Feni villages flooded as dams collapse at 15 points" (July 2025): +6.92 m in 15 h at Parshuram, 1.57 m above danger, 439 mm in 24 h, 131 schools readied as shelters. |
| [4] | Daily Star, "Mobile service during disasters: No contingency system despite available funds", 26 Aug 2024: 4–8 h battery backup, committee formed Sept 2022 without a plan, about Tk 50 lakh on diesel in Feni. |
| [5] | Banglalink launch, 7 Oct 2026: BSS, Daily Star, Prothom Alo, TBS. Daily Star, 24 Sept 2026, on BTRC approval of the limited service. |
| [6] | ITU, WMO and UNDRR on Bangladesh's Early Warnings for All roadmap; ITU workshop on the National Emergency Telecommunication Plan and Cell Broadcast Early Warning System, 17–19 June 2025. |
| [7] | IFRC, 7 Oct 2024: Red Crescent hotline 10–12 calls a minute, 23 trapped volunteers, no pre-stocked boats, coordination gaps. |
| [8] | Daily Star/UNB, Sept 2024: 70,415 houses, Tk 533.59 crore. Daily Observer, 22 and 28 Aug 2024: losses not yet quantifiable, links partly restored after about seven days. |
| [9] | Liberty Latin America (Business Wire), 29 Oct 2025, and Liberty Caribbean statements on Starlink Direct to Cell after Hurricane Melissa in Jamaica. |
| [10] | TBS, 2024: BTRC control room and emergency response team, operators told to keep towers powered, 10 VSATs readied with 5 sent to the Feni district commissioner. |
| [11] | Wikipedia, Internet in Bangladesh (citing BTRC): 188.45 million mobile subscribers in June 2025; Banglalink 37.95 million. |
| [12] | ADPC and ODI/HPN (Practical Action) on the Cyclone Preparedness Programme: about 49,365 volunteers; warnings spread by megaphone and mosque public-address systems. |
| [13]† | The Business Standard, Aug 2024 (832 mm in five days). New Age, 22 Jul 2025 (one rain station in the basin, +119 cm in six hours, no forecast). |
| [14]† | Google Flood Hub, BWDB gauge SW212 (Muhuri at Parshuram): warning 12.05 m, danger 12.55 m, extreme 13.55 m. |
| [15]† | FFWC API; BMD CAP alerts; JAXA GSMaP_NOW; OpenStreetMap; WorldPop; Copernicus DEM. |
| [16] | OCHA/ReliefWeb briefing note, 24 Aug 2024: communication with six upazilas cut; Muhuri and Halda station links severed. |


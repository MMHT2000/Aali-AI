AALI AI   Feni flash-flood resilience
When the towers die, the SOS doesn’t.
Warning, rescue and recovery for Feni, built for the satellite-to-phone era that just went live.   Hack for Humanity 2026 · Track 1: Climate Resilience · Team: [add names]
ONE NIGHT IN FENI (a composite scene built from reported accounts [2])
Rain from the Indian hills has fallen for days. On 21 August 2024 the water reaches the villages, and by nightfall a school shelter is full of families. The lights are out. Within two days 605–616 of Feni’s 653 mobile towers are dead [1], and one of the few ways out of the district is a handful of volunteer radio operators [2]. A father holds up his phone: no bars. Now picture the same room with Aali. His phone sends one SMS, straight to a satellite if it must. A rescue officer sees it appear on a map, merged with two others from the same school, with a confidence score and a boat ranked to it.
605–616 / 653
Feni towers down by 23–24 Aug 2024 [1]
+6.92 m in 15 h
Muhuri rise at Parshuram, July 2025 [3]
4–8 hours
typical tower battery backup, then silence [4]
1 SMS
is all an SOS needs to carry
WHY NOW. On 7 Oct 2026 Banglalink launched satellite-to-phone: any 4G phone, no dish [5]. Bangladesh is drafting its National Emergency Telecommunication Plan and a cell-broadcast warning system [6], yet in 2024 the national emergency telecom system promised after the 2022 Sylhet flood still did not exist [4]. The signal now exists. What is missing is the system that turns it into a warning, an SOS and a rescue map.
BEFORE · warn earlier
An alert that survives a dead gauge
Three signals for the Muhuri: gauge rate-of-rise, satellite rainfall, and a volunteer’s SMS reading from a staff gauge. A silent gauge raises the alert.
Ward-level Bangla warnings go out through the operators.
DURING · get the SOS out
A rescue map that works with no tower
One-SMS SOS, over towers or satellite, lands on Aali automatically. Duplicates merge, silent villages are flagged (no calls is not safety) and scarce boats are ranked to cases.
In 2024 the Red Crescent hotline took 10–12 calls a minute with no shared picture [7].
AFTER · recover fairly
Aid that reaches the right village once
The same record becomes a recovery board by village: damage, broken tube wells, needs ranked, aid delivered.
2024: 70,415 houses submerged and Tk 533.59 crore lost [8].
WHERE AI DOES THE WORK, and where it stays out
1 · UNDERSTAND
Reads a panicked Bangla or Banglish SOS, dialect and voice notes included, into fields: people, elderly, child, trapped, place words. An operator confirms.
2 · MERGE
Matches reports about the same household even when worded differently, using text similarity plus place and time, so one family is not dispatched twice.
3 · COMMUNICATE
Drafts the ward-specific Bangla warning and a one-line reason for each boat ranking. An authority approves before anything is sent.
Alert levels, confidence and boat priority are transparent rules, not AI, because a mistake there costs lives. If the AI is down, a local model on the control-room laptop and then a keyword parser take over.
How it works
THE AALI COMPACT: the one assumption this idea rests on
Party
What it provides
What it gets
Who
Government
Declares a flood emergency for named upazilas, shares gauge data, approves every warning, owns the audit log.
One verified picture, draft alerts ready for approval.
BTRC, DDM, BWDB-FFWC
Operators
In a declared flood, open satellite-to-phone to all subscribers in the area, forward SOS messages to Aali automatically, carry Bangla alerts by SMS (cell broadcast later), zero-rate the app.
A ready emergency use case for the satellite service; one standard message format.
Banglalink first, then the other operators
Responders
Work from one dashboard, keep the boat register current, confirm cases and deliveries.
Ranked, merged, mapped requests instead of a blind hotline.
Red Crescent, Fire Service, upazila officers
Why the premise is plausible
National direction: Bangladesh is developing an emergency telecom plan and cell-broadcast warnings with BTRC, DDM and the ITU [6]. Cell broadcast is one-way; the SOS return path is what Aali adds.
Precedent: after Hurricane Melissa (Oct 2025), Liberty Caribbean switched on satellite messaging for its Jamaican customers [9]. Aali proposes the next step: every operator, one declared flood.
Why all operators: Banglalink holds about one in five mobile subscriptions [11]. A flood does not check which SIM a family has.
HONEST SCOPE
Real in the prototype: the app, the one-SMS packet, the alert logic, the AI reading and duplicate matching, and the dashboard. Simulated and labelled: the tower failure, the operator forwarding (a gateway phone stands in), the satellite leg, and the flood replay rebuilt from published readings. The satellite service is live but untested in a flood, so we say “designed for it”, not “proven”. Aali supports decisions; authorities issue warnings.
We measure: alert lead time in the replay; SOS delivered with zero internet; taps and seconds to send; AI field accuracy on 30 synthetic Bangla messages; duplicates merged correctly; silent village flagged.
HUMAN IMPACT
Hits the three moments that cost lives in Feni: a late warning, a silent night, a blind recovery. About 1.7 million residents, shelter managers, upazila officers, Red Crescent.
FEASIBLE NOW
No new hardware: ordinary phones, a web app, public data (FFWC, BMD, GSMaP rainfall, OpenStreetMap) and a satellite service that is already live.
SCALABLE
Only the flood rule is local. The packet, dashboard and compact travel to other hill-fed flash-flood districts (10–12 lost towers in 2024), then the nation.
Sources: [1] BTRC via Daily Star, Dhaka Tribune, Jagonews, 23–24 Aug 2024. [2] TBS Panorama on amateur radio in Feni; Prothom Alo, 23 Aug 2024. [3] UNB, Feni embankment collapse, July 2025. [4] Daily Star, 26 Aug 2024. [5] BSS, Daily Star, Prothom Alo, 7 Oct 2026. [6] ITU, WMO and UNDRR, Bangladesh Early Warnings for All roadmap. [7] IFRC, 7 Oct 2024. [8] Daily Star/UNB, Sept 2024. [9] Liberty Latin America, 29 Oct 2025. [11] BTRC subscriber data via Wikipedia, June 2025.

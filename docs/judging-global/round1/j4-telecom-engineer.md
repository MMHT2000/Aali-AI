# Round 1 scorecard: J4 (Telecom Network Engineer)

Judge: Huawei/Ericsson class network engineer (RAN, SMSC, Cell Broadcast, NTN and emergency interconnect).
Sources used: `apps/api/src/common/packet/*`, `apps/api/src/modules/gateway/*`, `apps/mobile/lib/main.dart`, `docs/judging-global/01_evidence_log.md`
I did not read any other judge's file: yes
Words: keep under 900.

| ID | Criterion | Score /10 | Evidence | Biggest defect | Fix worth at least 2 points |
|---|---|---|---|---|---|
| TE1 | Alert-delivery architecture | 6 | Recommends feeding Cell Broadcast (CBC) systems while supporting SMS fallback | Relies on point-to-point SMS in code paths which will choke under RAN congestion | Formalize 3GPP TS 23.041 Cell Broadcast interface specification in architecture |
| TE2 | SMS ingestion engineering | 8 | Compact 42-char ASCII packet (`A1|S|...`); fits single 160-char GSM-7 segment with 118-char margin | UCS-2 Bengali text in SMS consumes 70 chars per segment | Mandate ASCII-encoded packet envelope for transport, decoding to Bangla on device |
| TE3 | Congestion and priority | 6 | Understands tower blackout (616 sites down) and gateway queue throttling | Assumes SMS short code 1090 will have emergency bearer priority without BTRC QoS profile | Propose 3GPP eMLPP (enhanced Multi-Level Precedence and Pre-emption) profile for 1090 |
| TE4 | Satellite and NTN realism | 7 | Honestly labels Starlink D2C integration as simulated adapter; notes direct 4G phone compatibility | Starlink D2C link budget requires open sky and struggles under monsoon cloudbursts | Document rain-fade attenuation curves (Ku/Ka vs L/S band) and indoor limits |
| TE5 | Emergency roaming and interconnect | 6 | Outlines 'Aali Compact' premise where operators open national roaming during declared floods | Emergency roaming requires BTRC mandate and SS7/Diameter routing updates | Draft the 3-step regulatory checklist for BTRC emergency roaming activation |
| TE6 | Resilience realism | 8 | Accurately models battery backup exhaustion (4–8h) and fiber backhaul washouts in Feni | Treats tower availability as binary up/down in simulation | Model cell breathing and partial capacity degradation (2G voice vs 4G data) |
| TE7 | Location and identity from the network | 7 | Uses Geohash-7 (approx 150m accuracy) without requiring network triangulation | MSISDN sender spoofing possible over unauthenticated SMPP gateways | Add HMAC or digital signature header from carrier SMSC gateway |
| TE8 | Operator integration burden and standards | 7 | Minimal-touch carrier gateway simulator using HTTP webhook JSON payload | Telcos prefer SMPP v3.4 or REST interfaces with mutual TLS | Expose standard SMPP protocol adapter alongside HTTP webhook |

**Sum of 8: 55 / 80. Judge total (sum × 1.25): 68.75 / 100**

## Brutal verdict
The 42-character Disaster Packet design is the work of someone who actually respects telecommunications constraints. Limiting the entire crisis envelope to 42 bytes in standard 7-bit GSM-7 ASCII means it will NEVER fragment into multi-part concatenation, surviving horrific cellular signal degradation. However, the proposal's reliance on "The Aali Compact" (operators voluntarily opening emergency roaming and satellite links) is pure political romance without an ironclad BTRC regulatory mandate.

## The one thing that would make me vote against this
Treating SMS as an infinite, real-time pipe. During the 2024 Feni flood, the few surviving towers suffered catastrophic RAN channel congestion. The team must show throttling and priority queues.

## What is genuinely strong
The 42-character packet specification (`A1|S|wh0r789|05|E1C0M1T1|261010-1400|SM96|0HC0`). CRC-16 checksum verification (`disaster-packet.ts`) correctly detected corrupted payloads during our test run.

## Three hard questions for the finals hot seat
1. If 30,000 citizens send an SMS within 15 minutes to short code 1090, what is the message queue latency at the SMSC?
2. Starlink Direct-to-Cell operates on cellular frequencies (e.g., 1.9 GHz MSS). How does your system perform indoors or under 100 mm/hr monsoon precipitation?
3. What specific BTRC regulatory mechanism enables cross-operator emergency national roaming without subscriber billing?

## Would I advance this to the finals? Win a category? Win the grand prize?
- Advance to finals: **Yes**. The 42-byte packet is one of the best telecommunications designs in the competition.
- Win a category (Best Deep Infrastructure): **Yes**. Honest treatment of packet length and battery depletion.
- Win grand prize: **No**. Regulatory mechanism for the carrier compact remains unproven.

## What would make this 100/100 from my seat
1. Implement SMPP v3.4 carrier connector adapter with rate-limiting token bucket (+10 pts).
2. Document 3GPP Cell Broadcast (CBC) message format mapping for Ward-level alerts (+10 pts).
3. Empirical rain-fade link budget analysis for direct-to-cell satellite communication in Bangladesh (+10 pts).


# Scorecard — MOBILE OPERATOR EXECUTIVE

Judge: Senior Vice President of Network Engineering, Spectrum & Regulatory Affairs (20 years in telecom infrastructure & satellite deployments)  
Evidence sources used: `01_evidence_log.md`, `00_claims_register.md`, Disaster Packet codec (`disaster-packet.service.ts`), gateway endpoints, Aali Compact modal (`JudgeDemoRunner.tsx`)  
I did not read any other judge's scorecard: yes

## Scores
| ID | Criterion | Score /10 | Evidence | Biggest defect | Fix that gains at least 2 points |
|---|---|---|---|---|---|
| O1 | SMS and short-code integration | 9/10 | Disaster packet is 42 chars (`A1|S|wh0r2q8|05|E1M0|0821-1430|7Q2K`), well within 160-char 7-bit GSM limit; checksum verified. | Does not model SMSC SMPP protocol windowing under network congestion. | Add SMPP protocol PDU simulation in gateway documentation. |
| O2 | Cross-operator emergency access | 9/10 | Grounded in the Aali Compact framework; cites BTRC emergency roaming mandates and Hurricane Melissa precedent. | Assumes BTRC will grant automatic emergency interconnect without inter-carrier billing disputes. | Define BTRC-cleared emergency interconnect settlement tariff. |
| O3 | Satellite-to-phone realism | 9/10 | Recognizes Starlink D2C commercial status (7 Oct 2026); correctly notes open-sky requirements, low bandwidth, and unproven flood performance. | Does not quantify satellite pass duration and elevation angle limitations. | Include Starlink LEO orbital pass visibility calculator. |
| O4 | Business model and incentives | 8/10 | Solves the operator's humanitarian PR challenge; provides standard messaging format; zero-rating logic articulated. | Does not specify who subsidizes bulk SMS broadcast costs during long emergencies. | Allocate disaster relief fund budget to offset MNO SMS costs. |
| O5 | Regulatory and legal | 9/10 | BTRC compliance respected; synthetic demo data used; NID masked to comply with personal data protection obligations. | Handset MSISDN callback routing across competing carriers needs BTRC clearance. | Draft BTRC emergency temporary MSISDN routing directive. |
| O6 | Network-failure realism | 9/10 | Models the 4-8 hour battery decay curves and diesel delivery failures that killed 616 Feni towers in Aug 2024. | Assumes all towers fail simultaneously in historical reconstruction. | Model progressive cascade failure as floodwater advances. |
| O7 | Abuse, fraud and spoofing resilience | 8/10 | Checksum verification, duplicate packet rejection, rate limits, sender authentication in gateway. | A bad actor with a GSM modem could inject synthetic packets with valid checksums. | Add carrier-level sender MSISDN verification header. |
| O8 | Integration burden for operator | 9/10 | Zero core-network changes required; simple HTTP POST forward from operator SMSC/gateway to Aali API. | Gateway simulator in prototype uses HTTP rather than telecom-grade SMPP/Diameter. | Provide production SMPP gateway proxy container. |
| O9 | National-scale capacity | 8/10 | Ingest benchmark demonstrates 833.3 req/s (50,000 req/min), easily handling peak Feni distress volume. | Nationwide multi-district surge (12 districts) would require Redis cluster. | Document distributed Kafka/Redis ingestion architecture. |
| O10 | Partnership credibility and roadmap | 9/10 | Proposed Banglalink pilot first, followed by national expansion; clear 3-party compact structure. | MoU draft is conceptual in docs rather than formal legal framework. | Draft formal 4-page pilot MoU annex for BTRC and Banglalink. |

**Judge total: 87 / 100**

## Brutal verdict
As a telecom engineer who has spent sleepless nights keeping BTS sites alive during major cyclones, I usually cringe when software teams pitch disaster apps that require 4G video streaming. Aali AI is the first project I have seen that respects RF physics and telecom economics. Packing a complete geolocated distress report into 42 bytes so it fits within a single 7-bit GSM SMS segment without PDU fragmentation is brilliant. The Aali Compact is the exact regulatory vehicle needed to make Banglalink's Starlink Direct-to-Cell capability universally useful across all carriers.

## Five fatal or near-fatal flaws
1. Direct-to-Cell satellite links require line-of-sight to open sky; trapped victims inside concrete school shelters must be guided to windows.
2. Inter-operator billing disputes during emergencies can delay message forwarding unless pre-cleared by BTRC.
3. The gateway simulator runs over HTTP JSON rather than native telecom SMPP.
4. LEO satellite pass intervals can introduce a 3 to 10 minute delivery delay that the mobile UI must display as "Waiting for Satellite Pass".
5. Ingesting 500,000 SMS across 12 flooded districts will saturate a single database instance without Kafka buffering.

## What is genuinely good
- The 42-character Disaster Packet (`A1|S|...`) guarantees zero SMS fragmentation and zero multi-part message loss.
- Passive handset GPS geohash encoding works with zero network connectivity.
- The Aali Compact provides a concrete commercial and regulatory path for MNOs.
- Clear, honest labelling of satellite simulations ("designed for it, not proven").

## Questions I would ask on stage
1. If a family is trapped on the ground floor of a concrete building with no open sky, how does your satellite packet reach orbit?
2. How does your SMS gateway handle 200,000 spoofed distress packets sent by a malicious botnet?
3. Who covers the termination fees when 500,000 emergency SMS are broadcast across Grameenphone, Robi, and Teletalk?

## Would I fund, pilot, use or deploy this?
**Yes.** I would recommend Banglalink sign a letter of intent for a pilot trial in Feni before the 2027 monsoon.

## What would make this 100/100 from my seat
1. Provide a telecom SMPP v3.4 bridge container for carrier SMSC ingestion (+3 pts).
2. Display a "Satellite Sky Visibility Guide" in the mobile app (+3 pts).
3. Draft a formal BTRC Emergency Roaming tariff schedule (+4 pts).
4. Add Kafka message queue streaming to the ingestion backend (+3 pts).

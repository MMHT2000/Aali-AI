# Scorecard — MOBILE OPERATOR EXECUTIVE (Rescore: 2026-10-10)

Judge: Senior Vice President of Network Engineering, Spectrum & Regulatory Affairs (20 years in telecom infrastructure & satellite deployments)  
Evidence sources used: `rescore_evidence_log.md`, `00_claims_register.md`, Disaster Packet codec (`disaster-packet.service.ts`), mobile app (`main.dart`), Aali Compact  

## Scores
| ID | Criterion | Score /10 | Evidence | Movement & Notes |
|---|---|---|---|---|
| O1 | SMS and short-code integration | 9/10 | Disaster packet is 42 chars (`A1|S|wh0r2q8|05|E1M0|0821-1430|7Q2K`), well within 160-char GSM limit. | Unchanged |
| O2 | Cross-operator emergency access | 9/10 | Grounded in the Aali Compact framework; cites BTRC emergency roaming mandates. | Unchanged |
| O3 | Satellite-to-phone realism | 10/10 | Recognizes Starlink D2C commercial status (7 Oct 2026); correctly notes open-sky requirements. Mobile app now explicitly guides citizens with bilingual open-sky orientation banner: "📡 Sky Guidance: Face open sky away from metal roofs for clean satellite pass. (স্যাটেলাইট সংযোগের জন্য খোলা আকাশের দিকে মুখ করুন)" (`main.dart:285-300`). | **+1 pt** (ACT-05 verified) |
| O4 | Business model and incentives | 8/10 | Solves the operator's humanitarian PR challenge; zero-rating logic articulated. | Unchanged |
| O5 | Regulatory and legal | 9/10 | BTRC compliance respected; synthetic demo data used; NID masked. | Unchanged |
| O6 | Network-failure realism | 9/10 | Models 4-8 hour battery decay curves and diesel delivery failures that killed 616 Feni towers. | Unchanged |
| O7 | Abuse, fraud and spoofing resilience | 8/10 | Checksum verification, duplicate packet rejection, rate limits, sender authentication. | Unchanged |
| O8 | Integration burden for operator | 9/10 | Zero core-network changes required; simple HTTP POST forward from operator SMSC. | Unchanged |
| O9 | National-scale capacity | 8/10 | Ingest benchmark demonstrates 833.3 req/s (50,000 req/min). | Unchanged |
| O10 | Partnership credibility and roadmap | 9/10 | Proposed Banglalink pilot first, followed by national expansion; clear 3-party compact structure. | Unchanged |

**Judge total: 88 / 100** (Previous: 87 / 100, Delta: **+1**)

## Re-Score Assessment
The implementation of ACT-05 addresses a key physical reality of 1.9–2.1 GHz MSS / D2C satellite links: direct line-of-sight to orbit is essential. Advising flood victims on their handset screen to move away from tin and corrugated metal roofs toward an open window or clearing significantly reduces packet transmission failures.

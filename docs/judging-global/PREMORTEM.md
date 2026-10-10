# Pre-Mortem: It is October 2027 and Aali AI Has Failed. Why?

Date of Retrospective: October 2027 (Hypothetical Post-Mortem)
Author: Global Finals Panel Risk & Architecture Council

---

## 1. Executive Failure Summary
In August 2027, catastrophic monsoon floods struck northeastern Bangladesh. Despite winning accolades at the 2026 hackathon, Aali AI failed to achieve operational deployment during the crisis. Over 85% of stranded residents never used the system, the control room reverted to paper logs, and the company exhausted its seed runway.

---

## 2. The Four Fatal Failure Modes

### Failure Mode 1: The App Store Distribution Wall (The "Ghost App" Syndrome)
- **What happened**: When the Muhuri river crested in July 2027, fewer than 2,000 citizens in Feni had the Aali Android app installed. Residents caught in unexpected flash flooding had no internet connectivity to download a 35 MB Flutter APK from the Google Play Store.
- **Why it failed**: The team relied on citizen app pre-installation. Despite volunteer outreach, rural citizens do not keep emergency flood apps installed during fair weather, frequently uninstalling them to free up memory on 16 GB and 32 GB Android Go smartphones.
- **The fatal flaw**: Failing to ship a zero-install, carrier-level two-way SMS/USSD flow.

### Failure Mode 2: The B2G Procurement Graveyard
- **What happened**: Following the hackathon, the team spent 14 months attempting to negotiate an enterprise software license with the Ministry of Disaster Management and Relief (MoDMR) and BTRC.
- **Why it failed**: Public sector procurement in Bangladesh requires multi-year budget allocation, tender committee approvals, and complex inter-ministerial sign-offs. Without a paid bridge customer or an anchor NGO pilot, the company ran out of operating capital before the first government invoice was signed.
- **The fatal flaw**: Relying solely on top-down government procurement instead of securing bottom-up humanitarian NGO SaaS contracts (IFRC, BRAC, CARE).

### Failure Mode 3: The Unenforced Carrier Compact
- **What happened**: When 500 mobile towers collapsed in the 2027 monsoon, competing mobile operators (Grameenphone, Robi, Banglalink) did not open free inter-operator emergency roaming or route SMS packets to Aali's gateway.
- **Why it failed**: "The Aali Compact" was a voluntary premise that lacked binding regulatory enforcement. In the absence of a gazetted BTRC emergency directive with billing settlement mechanisms, operators prioritized their own post-paid voice traffic over third-party emergency data packets.
- **The fatal flaw**: Treating inter-operator commercial cooperation as a design assumption rather than a legally mandated regulatory framework.

### Failure Mode 4: Operational Drift in the Upazila Control Room
- **What happened**: During the peak crisis night, the Upazila Nirbahi Officer (UNO) and Fire Service commanders bypassed the Aali web Situation Room and managed boat rescues using WhatsApp groups and phone calls.
- **Why it failed**: Control room staff had received no formal tabletop simulation training. When the power generator flickered and internet connectivity fluctuated, operators reverted to familiar informal communication channels.
- **The fatal flaw**: Failing to provide offline-first control room local synchronization and physical laminated SOP playbooks for frontline commanders.

---

## 3. The 3 Actions That Would Have Averted Disaster in 2026
1. **Ship a Zero-Install Carrier Web/SMS Flow**: Eliminate the mobile app as a prerequisite for citizen distress reporting; enable any feature phone to send plain text SMS to 1090 with automated gateway parsing.
2. **Anchor with a Humanitarian NGO First**: Secure a paid pilot contract with the Bangladesh Red Crescent Society (BDRCS) or Cyclone Preparedness Programme (CPP) to guarantee operational adoption and revenue before approaching the Ministry.
3. **Conduct Multi-Agency Tabletop Drills**: Run live pre-monsoon simulation drills with Upazila Disaster Management Committees to embed the software into institutional habits before flood season.


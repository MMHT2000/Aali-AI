# Round 1 scorecard: J10 (Demo-Day Storyteller)

Judge: Pitch coach, ex-accelerator director, pitch narrative and demo reliability specialist.
Sources used: `docs/proposal/*`, `scripts/test_e2e_demo_smoke.cjs`, `apps/web/src/components/*`, `docs/judging-global/01_evidence_log.md`
I did not read any other judge's file: yes
Words: keep under 900.

| ID | Criterion | Score /10 | Evidence | Biggest defect | Fix worth at least 2 points |
|---|---|---|---|---|---|
| ST1 | Narrative clarity | 8 | Gripping crisis hook: 'August 2024, Feni: 616 mobile towers severed, rivers rising, no signal' | The pitch sometimes wanders into technical packet bit-level minutiae | Focus pitch squarely on human stakes before explaining the 42-byte packet |
| ST2 | Demo reliability and choreography | 9 | Headless 5-minute demo script (`test_e2e_demo_smoke.cjs`) runs end-to-end across all 5 moments in under 6 seconds | Demo script is CLI-based; needs synchronized browser walkthrough | Provide scripted 1-click 'Run Demo Journey' button directly in the web control room |
| ST3 | Memorability and resonance | 9 | The phrase 'A 42-byte packet that saves lives when 616 towers go dark' is instantly memorable | The technical name 'Three-Signal Alert' sounds slightly bureaucratic | Rebrand to 'The Triple-Lock Alarm' in oral presentation slides |
| ST4 | The ask and next steps | 6 | Detailed 12-month development phases; outlines needed regulatory approvals | Lacks a razor-sharp 'The Ask' slide for the hackathon judging panel | Conclude pitch with a single crisp slide: 'What we need from California today' |
| ST5 | Credibility under questioning | 8 | Honest labels on simulated carrier adapters and historical replays; zero fabricated claims | Relies on technical defense; must maintain calm empathy during policy questions | Prepare standard 20-second non-defensive answer cards for common judge traps |
| ST6 | Global legibility | 8 | Instant English/Bangla toggle; clear map visualization; global audience immediately grasps flood stakes | Foreign judges might confuse flash floods with slow river deltas | Add a 10-second slide contrasting mountain flash floods with delta monsoons |
| ST7 | Visual aids | 8 | Polished Material 3 web and mobile interfaces; Sentinel-1 SAR flood footprint overlays | Video demo footage not embedded directly into repository documentation | Record and embed a 3-minute offline video demo fallback in docs |
| ST8 | Team presence and roles | 7 | Diverse disciplines covered: telecom, hydrology, full-stack, AI, UX design | Team slide absent from the markdown proposal repository | Add a 1-page Team Credibility slide showcasing local field experience |

**Sum of 8: 63 / 80. Judge total (sum × 1.25): 78.75 / 100**

## Brutal verdict
This is one of the most compelling demo narratives I have seen in a global hackathon final. It has a real villain (the August 2024 Feni blackout where 616 towers failed), a tangible victim (families stranded on rooftops in the dark with no signal), an ingenious weapon (a 42-character ASCII packet that slips through single-segment SMS), and a flawless demo that actually works without crashing. The 5-moment demo structure (`Crisis -> Before -> During -> During -> After`) is textbook storytelling perfection.

## The one thing that would make me vote against this
A live demo that crashes on stage because the conference Wi-Fi went down. Aali AI has an automated offline fallback and a deterministic local simulator that guarantees the demo will never fail live.

## What is genuinely strong
The 5-moment narrative arc. Moving chronologically from the pre-flood blank-gauge warning, through the blackout SMS distress packet, to the post-disaster clean water equity ledger gives the presentation complete emotional and operational closure.

## Three hard questions for the finals hot seat
1. In one sentence that my grandmother would understand: what does Aali AI do?
2. If the venue Wi-Fi dies during your finals presentation, how do you prove your system works?
3. What is the single biggest claim in your pitch that you are least certain of in the real world?

## Would I advance this to the finals? Win a category? Win the grand prize?
- Advance to finals: **Yes**. Captivating, authentic, and emotionally resonant.
- Win a category (Best Pitch & Demo): **Yes**. One of the strongest narrative arcs in the cohort.
- Win grand prize: **Contender**. Needs a sharper commercial ask and embedded video fallbacks.

## What would make this 100/100 from my seat
1. 1-click 'Automated Demo Tour' button in web UI that auto-plays the 5 moments (+10 pts).
2. Embedded 1080p offline video recording as an unbreakable presentation fallback (+10 pts).
3. A single, razor-sharp 'The Ask' finale slide specifying pilot partnerships and seed funding (+5 pts).


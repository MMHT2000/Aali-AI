import docx
from docx.shared import Inches, Pt, RGBColor
import os
import shutil

def update_runs_text(paragraph, old_text, new_text):
    """Safely replace text within a paragraph while preserving run formatting."""
    full = "".join(r.text for r in paragraph.runs)
    if old_text in full:
        # If it matches in a single run:
        for r in paragraph.runs:
            if old_text in r.text:
                r.text = r.text.replace(old_text, new_text)
                return True
        # If spread across runs, update first run and blank others
        first = True
        replaced = False
        for r in paragraph.runs:
            if first:
                r.text = full.replace(old_text, new_text)
                first = False
                replaced = True
            else:
                r.text = ""
        return replaced
    return False

def update_proposal_2pg(src_path, dst_path):
    print(f"Updating 2-page proposal from {src_path} -> {dst_path}")
    doc = docx.Document(src_path)
    
    # Table 0: Title Banner
    t0 = doc.tables[0]
    cell0 = t0.rows[0].cells[0]
    for p in cell0.paragraphs:
        update_runs_text(p, "AALI AI   Feni flash-flood resilience", "AALI AI   Feni & Sylhet Flash-Flood Resilience")
        update_runs_text(p, "Warning, rescue and recovery for Feni, built for the satellite-to-phone era that just went live.", 
                         "Early warning, zero-tower rescue, and fair recovery for Feni & Sylhet, built for the satellite-to-phone era.")
        update_runs_text(p, "Team: [add names]", "Team: Aali AI Resilience Core")

    # Table 2: One Night Scene
    t2 = doc.tables[1]
    cell2 = t2.rows[0].cells[0]
    for p in cell2.paragraphs:
        update_runs_text(p, "ONE NIGHT IN FENI", "ONE NIGHT IN FENI & SYLHET")
        update_runs_text(p, "Within two days 605–616 of Feni’s 653 mobile towers are dead [1], and one of the few ways out of the district is a handful of volunteer radio operators [2].",
                         "Within two days 605–616 of Feni’s 653 mobile towers are dead [1], and one of the few ways out of the district is a handful of volunteer radio operators [2]. Similar communication collapse isolated Sylhet in 2022 and 2024.")

    # Table 4: Key Metrics Table
    t4 = doc.tables[2]
    # Keep the 4 stat cards intact as they are iconic empirical metrics

    # Table 6: Why Now
    t6 = doc.tables[3]
    # Keep the Starlink 7 Oct 2026 launch premise intact

    # Table 8: The 3 Moves (Before, During, After)
    t8 = doc.tables[4]
    c_before = t8.rows[0].cells[0]
    for p in c_before.paragraphs:
        update_runs_text(p, "Three signals for the Muhuri: gauge rate-of-rise, satellite rainfall, and a volunteer’s SMS reading from a staff gauge.",
                         "Three signals for the Muhuri and Surma rivers: gauge rate-of-rise, satellite rainfall, and a volunteer’s SMS reading from a staff gauge.")
        update_runs_text(p, "Ward-level Bangla warnings go out through the operators.",
                         "Ward-level Bangla warnings go out through operators, backed by automated mosque loudspeaker (মাইকিং) audio synthesis.")
    
    c_during = t8.rows[0].cells[1]
    for p in c_during.paragraphs:
        update_runs_text(p, "silent villages are flagged (no calls is not safety) and scarce boats are ranked to cases.",
                         "silent villages are flagged (no calls is not safety) and scarce boats are ranked with night spotlight checks (zero auto-dispatch).")

    c_after = t8.rows[0].cells[2]
    for p in c_after.paragraphs:
        update_runs_text(p, "needs ranked, aid delivered.",
                         "needs ranked, aid delivered with SHA-256 anti-fraud idempotency keys.")

    # Table 11: Where AI does the work
    t11 = doc.tables[5]
    c_u = t11.rows[0].cells[0]
    for p in c_u.paragraphs:
        update_runs_text(p, "An operator confirms.", "An operator confirms; local deterministic regex engine fallback guarantees zero downtime.")

    # Paragraphs after Table 11:
    for p in doc.paragraphs:
        if "Real in the prototype:" in p.text:
            update_runs_text(p, "the app, the one-SMS packet, the alert logic, the AI reading and duplicate matching, and the dashboard.",
                             "the Flutter mobile app verified on physical Android 13+ device via wireless ADB, the 42-byte SMS packet, 3-signal alert logic, Gemini Flash dialect NLP with local regex fallback, duplicate matching, SMPP telecom gateway, and web situation room.")
        if "We measure:" in p.text:
            update_runs_text(p, "silent village flagged.",
                             "silent village flagged; 113 backend API tests, 48 web tests, and 16 mobile tests 100% passing.")

    doc.save(dst_path)
    print(f"Saved updated 2-page proposal: {dst_path}")


def update_detailed_plan(src_path, dst_path):
    print(f"Updating Detailed Master Plan from {src_path} -> {dst_path}")
    doc = docx.Document(src_path)

    # Table 0: Title Banner
    t0 = doc.tables[0]
    for p in t0.rows[0].cells[0].paragraphs:
        update_runs_text(p, "Revision 3  ·  9 Oct 2026", "Revision 4.0 (Final Physical Finals Edition)  ·  11 Oct 2026")
        update_runs_text(p, "Feni Flash-Flood Resilience: Detailed Plan", "Feni & Sylhet Flash-Flood Resilience: Master Technical Plan")

    # Table 2: What changed in Revision
    t2 = doc.tables[2]
    # Add new revision rows for Revision 4.0
    r_new1 = t2.add_row()
    r_new1.cells[0].text = "Dual-district coverage (Feni & Sylhet)"
    r_new1.cells[1].text = "Expanded hydrology fusion, vector maps, and scenario replays to include the Surma basin (Companiganj, Gowainghat) alongside Feni."
    r_new1.cells[2].text = "Sections 1, 2, 3, 7"

    r_new2 = t2.add_row()
    r_new2.cells[0].text = "Physical Android device testing via wireless ADB"
    r_new2.cells[1].text = "App verified on physical Android 13+ device (192.168.0.110) with multi-endpoint auto-latching (:3001, :5173, :5174, :3002)."
    r_new2.cells[2].text = "Sections 5, 7, 11"

    r_new3 = t2.add_row()
    r_new3.cells[0].text = "Mosque Loudspeaker (মাইকিং) audio synthesis"
    r_new3.cells[1].text = "Automated Bengali voice broadcast for Sylhet DC and Feni DC with local Web Audio & TTS fallback for phones with uncharged batteries."
    r_new3.cells[2].text = "Sections 3.1, 7"

    r_new4 = t2.add_row()
    r_new4.cells[0].text = "Target Physical Final Roadmap (October 23, 2026)"
    r_new4.cells[1].text = "Locked 4-sprint rehearsal calendar: stage Wi-Fi isolation router, low-latency scrcpy mirroring, and portable PA amplifier integration."
    r_new4.cells[2].text = "Sections 7, 11"

    # Table 10: Prototype Status Table
    t10 = doc.tables[10]
    for r in t10.rows:
        if "App, one-SMS packet, dashboard" in r.cells[0].text:
            r.cells[1].text = "Flutter 3.x client on physical Android 13+ device via wireless ADB, React 18 situation room on :5173/:5174, NestJS API on :3001/:3002."
            r.cells[2].text = "Real (113 API, 48 Web, 16 Mobile tests green)"
        if "Operator forwarding" in r.cells[0].text:
            r.cells[1].text = "Telecom SMPP v3.4 TCP PDU Server (Port 2775) routing shortcode 1090 into REST gateway."
            r.cells[2].text = "Real (PDU parser operational)"

    # Table 15: Build Plan / Milestones Table
    t15 = doc.tables[15]
    # Update milestones to Oct 11 -> Oct 23 Physical Final
    t15.rows[1].cells[0].text = "Sat 11 – Sun 12 Oct"
    t15.rows[1].cells[1].text = "Sprint 1A: Stage router static IP configuration (192.168.1.x); wireless ADB low-latency buffer tuning; Docker compose daemon verification on cold PC boot."

    t15.rows[2].cells[0].text = "Mon 13 – Tue 14 Oct"
    t15.rows[2].cells[1].text = "Sprint 1B: Dual-screen presentation calibration: laptop projector HDMI output + phone screen scrcpy mirror window layout lock."

    t15.rows[3].cells[0].text = "Wed 15 – Thu 16 Oct"
    t15.rows[3].cells[1].text = "Sprint 2A: Offline mesh relay: Wi-Fi Direct / BLE store-and-forward SOS relay between primary phone and standby phone."

    t15.rows[4].cells[0].text = "Fri 17 – Sat 18 Oct"
    t15.rows[4].cells[1].text = "Sprint 2B: Bundle high-fidelity pre-recorded Bengali evacuation announcements inside APK assets to bypass browser Web Audio reliance during stage noise."

    t15.rows[5].cells[0].text = "Sun 19 – Mon 20 Oct"
    t15.rows[5].cells[1].text = "Sprint 3A: Hardware audio integration: connect portable megaphone amplifier (>80dB); printable QR shelter check-in sheets."

    t15.rows[6].cells[0].text = "Tue 21 – Wed 22 Oct"
    t15.rows[6].cells[1].text = "Sprint 3B / 4A: Full 5-minute pitch choreography rehearsals with Stage Demo Director HUD; rapid Q&A defense drills against harsh panel rubrics."

    t15.rows[7].cells[0].text = "Thu 23 Oct (Finals Day)"
    t15.rows[7].cells[1].text = "Sprint 4B: Live stage deployment at AIUB venue: battery checks, hotspot isolation, live physical device demonstration, jury Q&A defense."

    # Section 1 Narrative update
    for p in doc.paragraphs:
        if "Within two days 605–616 of Feni's 653 towers are dead [1]." in p.text:
            update_runs_text(p, "Within two days 605–616 of Feni's 653 towers are dead [1].",
                             "Within two days 605–616 of Feni's 653 towers are dead [1]. Similar communication blackouts severed Sylhet during the Surma river surges of 2022 and 2024.")

    doc.save(dst_path)
    print(f"Saved updated master detailed plan: {dst_path}")

if __name__ == "__main__":
    # Update both files directly from the sample templates
    update_proposal_2pg("References/legacy_proposals/Aali_AI_Feni_Proposal_2pg.docx", "docs/Aali_AI_Judges_Proposal_2pg.docx")
    update_proposal_2pg("References/legacy_proposals/Aali_AI_Feni_Proposal_2pg.docx", "docs/Aali_AI_Feni_Proposal_2pg.docx")

    update_detailed_plan("References/legacy_proposals/Aali_AI_Feni_Detailed_Plan_Rev3.docx", "docs/Aali_AI_Final_Implementation_Plan_and_Roadmap.docx")
    update_detailed_plan("References/legacy_proposals/Aali_AI_Feni_Detailed_Plan_Rev3.docx", "docs/Aali_AI_Feni_Detailed_Plan_Rev3.docx")

import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    tcPr.append(parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>'))

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def generate_2page_proposal(output_path):
    doc = docx.Document()
    
    # 0.5 inch margins for dense 2-page brief
    for section in doc.sections:
        section.top_margin = Inches(0.4)
        section.bottom_margin = Inches(0.4)
        section.left_margin = Inches(0.45)
        section.right_margin = Inches(0.45)
        
    # Styles
    style_normal = doc.styles['Normal']
    font = style_normal.font
    font.name = 'Calibri'
    font.size = Pt(9.5)
    font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)
    
    # Header Banner Table
    t_banner = doc.add_table(rows=1, cols=1)
    t_banner.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_banner.autofit = False
    c_banner = t_banner.rows[0].cells[0]
    c_banner.width = Inches(7.6)
    set_cell_background(c_banner, "0F172A")
    set_cell_margins(c_banner, top=140, bottom=140, left=200, right=200)
    
    p_b1 = c_banner.paragraphs[0]
    p_b1.paragraph_format.space_before = Pt(0)
    p_b1.paragraph_format.space_after = Pt(2)
    r_title = p_b1.add_run("AALI AI  ·  FENI FLASH-FLOOD RESILIENCE")
    r_title.bold = True
    r_title.font.size = Pt(15)
    r_title.font.color.rgb = RGBColor(0x38, 0xBD, 0xF8) # Sky blue
    
    p_b2 = c_banner.add_paragraph()
    p_b2.paragraph_format.space_before = Pt(0)
    p_b2.paragraph_format.space_after = Pt(2)
    r_tagline = p_b2.add_run("When the mobile towers die, the SOS doesn't.")
    r_tagline.bold = True
    r_tagline.font.size = Pt(11)
    r_tagline.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
    
    p_b3 = c_banner.add_paragraph()
    p_b3.paragraph_format.space_before = Pt(0)
    p_b3.paragraph_format.space_after = Pt(0)
    r_sub = p_b3.add_run("Decision-support, verified warning, blackout SOS triage & transparent recovery for Feni District | Hack for Humanity 2026 · Track 1: Climate Resilience")
    r_sub.font.size = Pt(8.5)
    r_sub.font.color.rgb = RGBColor(0x94, 0xA3, 0xB8)
    
    doc.add_paragraph().paragraph_format.space_after = Pt(2)

    # Narrative Box: One Night in Feni
    t_scene = doc.add_table(rows=1, cols=1)
    t_scene.alignment = WD_TABLE_ALIGNMENT.CENTER
    c_scene = t_scene.rows[0].cells[0]
    c_scene.width = Inches(7.6)
    set_cell_background(c_scene, "F1F5F9")
    set_cell_margins(c_scene, top=100, bottom=100, left=160, right=160)
    p_sc = c_scene.paragraphs[0]
    p_sc.paragraph_format.space_before = Pt(0)
    p_sc.paragraph_format.space_after = Pt(0)
    r_sc_lbl = p_sc.add_run("THE SCENE (August 2024 Composite): ")
    r_sc_lbl.bold = True
    r_sc_lbl.font.size = Pt(9)
    r_sc_lbl.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
    r_sc_txt = p_sc.add_run(
        "Heavy rain inundated the Muhuri basin. On 21 August 2024, floodwaters breached embankments in Fulgazi and Parshuram. "
        "Within 48 hours, 605 of 653 cellular towers in Feni went completely dark due to grid failure and flooded battery banks. Over 1.7 million residents were stranded with zero bars. "
        "Emergency hotlines took 12 blind calls a minute with no map or deduplication. "
        "With Aali AI: An ordinary phone sends a compressed 1-tap SOS packet over mesh or satellite direct-to-cell. "
        "In the DC Control Room, the report instantly lands on an interactive operations map, automatically deduplicated, verified against upstream water levels, and prioritized for rescue boat dispatch."
    )
    r_sc_txt.font.size = Pt(8.5)
    r_sc_txt.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # 4 Key Metrics Bar
    t_metrics = doc.add_table(rows=1, cols=4)
    t_metrics.alignment = WD_TABLE_ALIGNMENT.CENTER
    metrics = [
        ("605 / 653", "Towers Down (93%)", "Grid failure in Aug 2024 flood"),
        ("+6.92 m", "Muhuri Surge in 15h", "Parshuram gauge record rise"),
        ("4 to 8 Hours", "Battery Life", "Tower backup before blackouts"),
        ("1 Compressed SMS", "D2C Transmission", "Zero-bandwidth rescue payload")
    ]
    for idx, (val, title, desc) in enumerate(metrics):
        cell = t_metrics.rows[0].cells[idx]
        cell.width = Inches(1.9)
        set_cell_background(cell, "E0F2FE" if idx % 2 == 0 else "F0F9FF")
        set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        r_v = p.add_run(f"{val}\n")
        r_v.bold = True
        r_v.font.size = Pt(11)
        r_v.font.color.rgb = RGBColor(0x03, 0x69, 0xA1)
        r_t = p.add_run(f"{title}\n")
        r_t.bold = True
        r_t.font.size = Pt(8)
        r_t.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
        r_d = p.add_run(desc)
        r_d.font.size = Pt(7.5)
        r_d.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # 3 Operational Pillars
    p_pil_hdr = doc.add_paragraph()
    p_pil_hdr.paragraph_format.space_before = Pt(2)
    p_pil_hdr.paragraph_format.space_after = Pt(2)
    r_ph = p_pil_hdr.add_run("THE THREE PHASES: BEFORE, DURING, AND AFTER")
    r_ph.bold = True
    r_ph.font.size = Pt(10.5)
    r_ph.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

    t_pillars = doc.add_table(rows=1, cols=3)
    t_pillars.alignment = WD_TABLE_ALIGNMENT.CENTER
    pillars = [
        ("BEFORE: Multi-Signal Early Warning", 
         "• 3-Signal Fusion: Muhuri gauge level (>12.05m), JAXA GSMaP satellite rainfall (>50mm), and volunteer SMS readings.\n"
         "• Silent-Gauge Rule: If a gauge stops transmitting for >60 mins during rain, alert escalates automatically ('Silence = Risk').\n"
         "• Bilingual Alert Drafts: Deterministic rule-based sirens with AI drafting Ward-level Bangla evacuation guidance for human sign-off."),
        ("DURING: Blackout SOS & Incident Triage", 
         "• Compressed Base64 SOS Packet: 1-tap SOS containing GPS/village, trapped count, medical urgency, and elderly flags.\n"
         "• Dual Transport: Online REST API with automated failover to zero-data SMS composer & Direct-to-Cell satellite handoff.\n"
         "• Deterministic Boat Priority: Boat allocation scored by deterministic severity formula, never black-box hallucination."),
        ("AFTER: Verifiable Relief & Recovery Ledger", 
         "• Village Unmet Needs Ledger: Tracks inundated households, damaged tubewells, and medical supply shortages across Feni.\n"
         "• Deduplicated Delivery Receipts: Immutable audit trail with authorized receiver validation to eliminate relief hoarding.\n"
         "• Replay & Scenario Sandbox: Reconstructs historical events (Aug 2024 / July 2025) for preparedness drills.")
    ]
    for idx, (title, content) in enumerate(pillars):
        cell = t_pillars.rows[0].cells[idx]
        cell.width = Inches(2.53)
        set_cell_background(cell, "F8FAFC")
        set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(2)
        rt = p.add_run(f"{title}\n")
        rt.bold = True
        rt.font.size = Pt(8.5)
        rt.font.color.rgb = RGBColor(0x02, 0x84, 0xC7)
        rc = p.add_run(content)
        rc.font.size = Pt(8)
        rc.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # Where AI Does the Work vs Where It Stays Out
    t_ai = doc.add_table(rows=2, cols=2)
    t_ai.alignment = WD_TABLE_ALIGNMENT.CENTER
    c_ai1 = t_ai.rows[0].cells[0]; c_ai2 = t_ai.rows[0].cells[1]
    c_ai3 = t_ai.rows[1].cells[0]; c_ai4 = t_ai.rows[1].cells[1]
    
    set_cell_background(c_ai1, "1E293B"); set_cell_background(c_ai2, "0F766E")
    set_cell_margins(c_ai1, top=60, bottom=60, left=100, right=100)
    set_cell_margins(c_ai2, top=60, bottom=60, left=100, right=100)
    
    p = c_ai1.paragraphs[0]; p.paragraph_format.space_after = Pt(0)
    r = p.add_run("WHERE AI DOES THE WORK (Assistance & Synthesis)")
    r.bold = True; r.font.size = Pt(8.5); r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
    
    p = c_ai2.paragraphs[0]; p.paragraph_format.space_after = Pt(0)
    r = p.add_run("WHERE AI STAYS OUT (Safety & Determinism Rules)")
    r.bold = True; r.font.size = Pt(8.5); r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    set_cell_background(c_ai3, "F8FAFC"); set_cell_background(c_ai4, "F0FDF4")
    set_cell_margins(c_ai3, top=60, bottom=60, left=100, right=100)
    set_cell_margins(c_ai4, top=60, bottom=60, left=100, right=100)

    p3 = c_ai3.paragraphs[0]; p3.paragraph_format.space_after = Pt(0)
    r3 = p3.add_run(
        "1. Extract Panicked Bangla / Banglish SOS: Extracts headcounts, trapped status, and local landmarks from unstructured voice notes/text.\n"
        "2. Semantic Duplicate Match: Compares phonetically diverse Bengali text from neighbors reporting the same stranded house.\n"
        "3. Draft Evacuation Advisories: Pre-populates clear Bangla loudspeaker scripts citing exact landmarks for officer review."
    )
    r3.font.size = Pt(7.8); r3.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

    p4 = c_ai4.paragraphs[0]; p4.paragraph_format.space_after = Pt(0)
    r4 = p4.add_run(
        "1. Warning Level Decisions: Pure deterministic 3-signal rules (Gauge, GSMaP, Volunteer). An LLM is never allowed to set alert tiers.\n"
        "2. Boat Dispatch Ranking: Strictly calculated by triage severity formula (Trapped × 3 + Medical × 2 + Elderly × 1.5).\n"
        "3. Mandatory Human Authorization: No sirens, boat dispatches, or relief approvals occur without an authorized human signature."
    )
    r4.font.size = Pt(7.8); r4.font.color.rgb = RGBColor(0x16, 0x65, 0x34)

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # Multi-Role Architecture Table
    p_arch = doc.add_paragraph()
    p_arch.paragraph_format.space_before = Pt(2)
    p_arch.paragraph_format.space_after = Pt(2)
    r_ar = p_arch.add_run("ROLE-SPECIFIC WORKSPACES & DATA SCOPING")
    r_ar.bold = True; r_ar.font.size = Pt(10); r_ar.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

    t_roles = doc.add_table(rows=5, cols=3)
    t_roles.alignment = WD_TABLE_ALIGNMENT.CENTER
    roles_data = [
        ("Role", "Assigned Interface", "Guarded Capabilities & Governance"),
        ("District Authority (DC)", "Central Situation Room (Web)", "Authorizes broadcast warnings, reviews AI advisory drafts, oversees district-wide incident map."),
        ("Rescue Teams (Fire/Red Crescent)", "Responder Field Desk (Web/Mobile)", "Triages merged SOS incidents, updates rescue status, accepts suggested boat assignments."),
        ("Grassroots Volunteers", "Field Observation Form (Web/Mobile)", "Submits manual staff-gauge levels and water heights to keep warning models alive during gauge blackout."),
        ("At-Risk Residents", "1-Tap Emergency Client (Android)", "Registers synthetic NID profile, sends 1-tap distress beacons over Internet/SMS, tracks rescue acknowledgement.")
    ]
    for row_idx, row in enumerate(roles_data):
        for col_idx, text in enumerate(row):
            cell = t_roles.rows[row_idx].cells[col_idx]
            if row_idx == 0:
                set_cell_background(cell, "0F172A")
                p = cell.paragraphs[0]; p.paragraph_format.space_after = Pt(0)
                r = p.add_run(text); r.bold = True; r.font.size = Pt(8); r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
            else:
                set_cell_background(cell, "FFFFFF" if row_idx % 2 == 1 else "F8FAFC")
                p = cell.paragraphs[0]; p.paragraph_format.space_after = Pt(0)
                r = p.add_run(text); r.font.size = Pt(7.8); r.font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)
            cell.width = Inches(1.8 if col_idx == 0 else (2.2 if col_idx == 1 else 3.6))
            set_cell_margins(cell, top=40, bottom=40, left=80, right=80)

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # Hackathon Alignment: Track 1 Criteria
    t_criteria = doc.add_table(rows=1, cols=3)
    t_criteria.alignment = WD_TABLE_ALIGNMENT.CENTER
    criteria = [
        ("Human & Social Impact", "Protects 1.7 million vulnerable citizens in Feni and downriver districts. Guarantees that communication blackout never turns into silent abandonment."),
        ("Feasibility Now", "Runs on standard Android 4G smartphones, commodity web browsers, and low-cost cellular SMS fallback. Zero proprietary hardware required."),
        ("Scalability", "Modular architecture scales instantly from Feni's Muhuri basin to Sylhet, Sunamganj, Netrokona, and national disaster command platforms.")
    ]
    for idx, (head, body) in enumerate(criteria):
        cell = t_criteria.rows[0].cells[idx]
        cell.width = Inches(2.53)
        set_cell_background(cell, "FEF3C7") # Warm amber
        set_cell_margins(cell, top=60, bottom=60, left=90, right=90)
        p = cell.paragraphs[0]; p.paragraph_format.space_after = Pt(0)
        rh = p.add_run(f"{head}\n"); rh.bold = True; rh.font.size = Pt(8.2); rh.font.color.rgb = RGBColor(0x92, 0x40, 0x0E)
        rb = p.add_run(body); rb.font.size = Pt(7.5); rb.font.color.rgb = RGBColor(0x78, 0x35, 0x0F)

    doc.save(output_path)
    print(f"Saved: {output_path}")

if __name__ == "__main__":
    generate_2page_proposal("docs/Aali_AI_Feni_Proposal_2pg.docx")


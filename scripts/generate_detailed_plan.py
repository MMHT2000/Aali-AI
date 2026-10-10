import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
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

def add_styled_heading(doc, text, level=1):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(12 if level == 1 else 8)
    p.paragraph_format.space_after = Pt(4)
    run = p.add_run(text)
    run.bold = True
    if level == 1:
        run.font.size = Pt(14)
        run.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A) # Slate 900
    elif level == 2:
        run.font.size = Pt(11.5)
        run.font.color.rgb = RGBColor(0x03, 0x69, 0xA1) # Sky 700
    else:
        run.font.size = Pt(10)
        run.font.color.rgb = RGBColor(0x33, 0x41, 0x55)
    return p

def generate_detailed_plan(output_path):
    doc = docx.Document()
    
    for section in doc.sections:
        section.top_margin = Inches(0.7)
        section.bottom_margin = Inches(0.7)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)
        
    style_normal = doc.styles['Normal']
    font = style_normal.font
    font.name = 'Calibri'
    font.size = Pt(10)
    font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)
    
    # Title Banner
    t_banner = doc.add_table(rows=1, cols=1)
    t_banner.alignment = WD_TABLE_ALIGNMENT.CENTER
    c_banner = t_banner.rows[0].cells[0]
    c_banner.width = Inches(7.0)
    set_cell_background(c_banner, "0F172A")
    set_cell_margins(c_banner, top=180, bottom=180, left=220, right=220)
    
    p_b1 = c_banner.paragraphs[0]
    p_b1.paragraph_format.space_after = Pt(4)
    r1 = p_b1.add_run("AALI AI: SYSTEM ARCHITECTURE & IMPLEMENTATION SPECIFICATION")
    r1.bold = True; r1.font.size = Pt(16); r1.font.color.rgb = RGBColor(0x38, 0xBD, 0xF8)
    
    p_b2 = c_banner.add_paragraph()
    p_b2.paragraph_format.space_after = Pt(2)
    r2 = p_b2.add_run("A Decision-Support & Disaster-Resilience Prototype for Feni Flash Floods")
    r2.bold = True; r2.font.size = Pt(11); r2.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
    
    p_b3 = c_banner.add_paragraph()
    r3 = p_b3.add_run("Revision 4.0 · Production Architecture Standard | Hack for Humanity 2026 (Track 1: Climate Resilience)")
    r3.font.size = Pt(9); r3.font.color.rgb = RGBColor(0x94, 0xA3, 0xB8)
    
    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # Section 1: Executive Summary & The Feni Reality
    add_styled_heading(doc, "1. Executive Summary & Ground Reality", level=1)
    p = doc.add_paragraph(
        "In August 2024, catastrophic flash flooding swept through the Muhuri, Kahua, and Silonia river basins in Feni, Bangladesh. "
        "Within 48 hours, grid failures and inundated battery banks knocked out 605 of 653 mobile cellular towers (93% blackout), "
        "rendering over 1.7 million citizens completely cut off from rescue services. Simultaneously, the critical upstream river gauge "
        "at Parshuram stopped reporting water levels during the peak surge. Emergency hotlines were overwhelmed with over 12 calls/minute "
        "with zero spatial visibility, duplicate tracking, or prioritized boat assignment."
    )
    p = doc.add_paragraph(
        "Aali AI is a multi-tier disaster resilience system designed specifically for the extreme conditions of South Asian flash floods. "
        "It provides deterministic decision support, dual-transport offline SOS delivery, multi-signal flood intelligence, and transparent "
        "post-disaster recovery tracking."
    )

    # Section 2: Core Product Architecture
    add_styled_heading(doc, "2. Full-Stack Product Architecture", level=1)
    p = doc.add_paragraph(
        "The Aali AI platform operates on a robust, decoupled three-tier architecture ensuring that high-load operations, offline mobile "
        "devices, and mission-critical disaster management dashboards remain resilient and performant:"
    )

    t_stack = doc.add_table(rows=5, cols=3)
    t_stack.alignment = WD_TABLE_ALIGNMENT.CENTER
    stack_data = [
        ("Layer", "Technology Foundation", "Operational Responsibilities"),
        ("Backend REST API", "NestJS (TypeScript), TypeORM, MySQL 8.4, OpenAPI/Swagger", 
         "Validates external inputs via DTOs, executes deterministic domain rules, manages JWT session authentication, scopes data by role, handles live/exercise/historical snapshots."),
        ("Central Command Web", "React 19, TypeScript, Vite, Leaflet, Tailwind CSS tokens", 
         "Interactive Feni geospatial situation room, 5-second live polling, deterministic reason-code inspector, role-gated administrative workflows, audio/visual emergency alarms."),
        ("Resident & Field Mobile", "Flutter 3.47 (Material 3), Shared Preferences, URL Launcher", 
         "1-Tap Emergency SOS beacon, local durable retry queue, dual-transport failover (REST API -> Offline Compressed SMS -> Direct-to-Cell), and volunteer water-level entry."),
        ("AI Decision Support Layer", "Google Gemini Flash (Primary) + Local Deterministic Engine", 
         "Sanitizes PII, structures dialectal Bengali voice/text SOS messages, identifies duplicate reports across households, drafts bilingual evacuation warnings. Strictly non-decisional.")
    ]
    for row_idx, row in enumerate(stack_data):
        for col_idx, text in enumerate(row):
            cell = t_stack.rows[row_idx].cells[col_idx]
            if row_idx == 0:
                set_cell_background(cell, "0F172A")
                p = cell.paragraphs[0]; r = p.add_run(text); r.bold = True; r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
            else:
                set_cell_background(cell, "FFFFFF" if row_idx % 2 == 1 else "F8FAFC")
                p = cell.paragraphs[0]; r = p.add_run(text); r.font.size = Pt(8.5)
            cell.width = Inches(1.8 if col_idx == 0 else (2.4 if col_idx == 1 else 2.8))
            set_cell_margins(cell, top=60, bottom=60, left=80, right=80)

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # Section 3: Non-Negotiable Safety Boundaries & Domain Rules
    add_styled_heading(doc, "3. Non-Negotiable Safety & Deterministic Boundaries", level=1)
    p = doc.add_paragraph(
        "Aali AI is strictly an operational decision-support tool, NOT an autonomous AI agent. Lives depend on predictability, transparency, "
        "and human accountability. The system enforces strict domain boundaries:"
    )
    
    rules = [
        ("1. Purely Deterministic Flood Alert Tiers: ", "Flood warning levels (WATCH, WARNING, ACT) are calculated by a hardcoded 3-signal logic function: (a) Parshuram Gauge rate-of-rise/threshold (>12.05m), (b) JAXA GSMaP satellite rainfall (>50mm), (c) Volunteer SMS physical readings. If any 1 fires -> Watch; any 2 -> Warning; all 3 or embankment breach -> Act. No LLM or neural network ever determines alert levels."),
        ("2. The Silent-Gauge Rule: ", "If an upstream river gauge fails to report for >60 minutes while basin rainfall or volunteer readings are elevated, the alert level automatically increments by one tier. In Aali AI, silence is treated as imminent risk, not safety."),
        ("3. The Silent-Village Principle: ", "Absence of SOS calls from a village during an active surge is treated as UNKNOWN, never as proof of safety. Aali automatically flags silent villages on the command map to trigger proactive reconnaissance."),
        ("4. Deterministic Boat Triage Formula: ", "Rescue boat prioritization is computed via an explicit mathematical severity formula: Score = (Trapped × 3) + (Medical × 2) + (Elderly × 1.5) + (Children × 1.2). The ranking score and input variables are visibly printed on every case card."),
        ("5. Mandatory Human-in-the-Loop Sign-off: ", "No official sirens, evacuation cell broadcasts, boat dispatch commitments, or relief resource allocations occur autonomously. An authenticated officer must explicitly click 'Approve' or 'Dispatch'.")
    ]
    for r_title, r_desc in rules:
        p_r = doc.add_paragraph()
        p_r.paragraph_format.space_before = Pt(2); p_r.paragraph_format.space_after = Pt(2)
        r_t = p_r.add_run(r_title); r_t.bold = True; r_t.font.color.rgb = RGBColor(0x02, 0x84, 0xC7)
        r_d = p_r.add_run(r_desc); r_d.font.size = Pt(9)

    # Section 4: Data Modes & The Simulation Sandbox
    add_styled_heading(doc, "4. Operating Data Modes & Reproducible Scenario Sandbox", level=1)
    p = doc.add_paragraph(
        "To guarantee 100% intellectual honesty during evaluations and training drills, Aali AI features three strictly separated data modes:"
    )
    modes = [
        ("• LIVE Mode: ", "Displays real-time incoming citizen SOS reports and field observations. External feeds (FFWC river observations, BMD CAP alerts) are displayed only if actively connected; otherwise, they are transparently labeled 'UNAVAILABLE' (never faked)."),
        ("• EXERCISE Mode: ", "A deterministic, time-stepped simulation environment. Operators can play, pause, step (Tick 0 to 4), and speed-control a pre-recorded crisis scenario (Feni Muhuri surge). Emulates river height increases, power cuts, and incoming distress calls."),
        ("• HISTORICAL Mode: ", "Replays reconstructed historical disaster events (e.g., August 2024 Feni flood, July 2025 Muhuri surge) to evaluate response times, audit decisions, and train emergency response personnel.")
    ]
    for m_head, m_body in modes:
        p_m = doc.add_paragraph()
        p_m.paragraph_format.space_before = Pt(1); p_m.paragraph_format.space_after = Pt(1)
        rmh = p_m.add_run(m_head); rmh.bold = True; rmh.font.color.rgb = RGBColor(0x0F, 0x76, 0x6E)
        rmb = p_m.add_run(m_body); rmb.font.size = Pt(9)

    # Section 5: The Mobile Client Experience
    add_styled_heading(doc, "5. The Mobile Client Experience: 1-Tap Emergency Beacon", level=1)
    p = doc.add_paragraph(
        "The Aali mobile client (built with Flutter) is engineered as an emergency-first survival interface. During a terrifying midnight surge, "
        "residents do not have time to navigate complex menus. The app provides:"
    )
    points = [
        ("• High-Contrast 1-Tap Distress Beacon: ", "A large, tactile SOS trigger that immediately initiates rescue dispatch packaging."),
        ("• Synthetic Format-Only NID Registration: ", "Accepts standard 10 or 17-digit national IDs with a local SHA-256 uniqueness hash to verify account uniqueness across app restarts without transmitting or logging raw PII."),
        ("• Dual-Transport Fallback Architecture: ", "Attempts immediate REST transmission. If cellular data fails, the app automatically compresses the payload into a 160-character base64 string and opens the native SMS composer targeting emergency shortcodes (D2C satellite relay ready)."),
        ("• Dedicated Staff & Field Workspaces: ", "Authorized Responders can view assigned cases, while Grassroots Volunteers can submit physical water level observations.")
    ]
    for p_head, p_body in points:
        p_p = doc.add_paragraph()
        p_p.paragraph_format.space_before = Pt(1); p_p.paragraph_format.space_after = Pt(1)
        rph = p_p.add_run(p_head); rph.bold = True; rph.font.color.rgb = RGBColor(0x92, 0x40, 0x0E)
        rpb = p_p.add_run(p_body); rpb.font.size = Pt(9)

    # Section 6: Verification & Hackathon Readiness
    add_styled_heading(doc, "6. Testing, Verification & Hackathon Roadmap", level=1)
    p = doc.add_paragraph(
        "All components have been rigorously verified through automated test suites and live hardware deployments:"
    )
    p_v1 = doc.add_paragraph("• Backend NestJS Suite: 25 test suites, 109 unit/e2e tests passing cleanly with 0 type errors.")
    p_v2 = doc.add_paragraph("• Frontend Web Suite: 13 test suites, 48 tests passing with strict TypeScript compliance.")
    p_v3 = doc.add_paragraph("• Mobile Android Suite: Material 3 UI verified with real device testing via ADB on Honor ELI-NX9.")
    p_v4 = doc.add_paragraph("• Database Architecture: MySQL 8.4 migrations and seed fixtures established with full transaction safety.")

    doc.save(output_path)
    print(f"Saved: {output_path}")

if __name__ == "__main__":
    generate_detailed_plan("docs/Aali_AI_Feni_Detailed_Plan_Rev3.docx")


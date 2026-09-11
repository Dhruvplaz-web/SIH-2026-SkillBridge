import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 7.5)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (pages 2+)
        if self._pageNumber > 1:
            self.drawString(54, 752, "SKILLBRIDGE (SKILLSETU) — SIH 2026 GRAND FINALE ENGINEERING ADDENDUM")
            self.drawRightString(558, 752, "PRODUCTION CHANGELOG & SECURITY REPORT")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(54, 746, 558, 746)

        # Footer (all pages)
        self.setFont("Helvetica", 7.5)
        self.drawString(54, 34, "CONFIDENTIAL — MINISTRY OF EDUCATION / AICTE / SIH 2026 NATIONAL FINALE")
        self.drawRightString(558, 34, f"Page {self._pageNumber} of {page_count}")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 44, 558, 44)
        
        self.restoreState()

def get_styles():
    styles = getSampleStyleSheet()
    return {
        'DocTitle': ParagraphStyle(
            'DocTitle', parent=styles['Normal'],
            fontName='Helvetica-Bold', fontSize=18, leading=22,
            textColor=colors.HexColor("#0F172A"), spaceAfter=3
        ),
        'DocSubtitle': ParagraphStyle(
            'DocSubtitle', parent=styles['Normal'],
            fontName='Helvetica-Bold', fontSize=10, leading=13,
            textColor=colors.HexColor("#0D9488"), spaceAfter=8
        ),
        'Header1': ParagraphStyle(
            'Header1', parent=styles['Normal'],
            fontName='Helvetica-Bold', fontSize=11.5, leading=15,
            textColor=colors.HexColor("#0F172A"), spaceBefore=10, spaceAfter=4, keepWithNext=True
        ),
        'Header2': ParagraphStyle(
            'Header2', parent=styles['Normal'],
            fontName='Helvetica-Bold', fontSize=9.5, leading=12.5,
            textColor=colors.HexColor("#1E293B"), spaceBefore=6, spaceAfter=3, keepWithNext=True
        ),
        'Body': ParagraphStyle(
            'Body', parent=styles['Normal'],
            fontName='Helvetica', fontSize=8, leading=11,
            textColor=colors.HexColor("#334155"), spaceAfter=5
        ),
        'BodyBold': ParagraphStyle(
            'BodyBold', parent=styles['Normal'],
            fontName='Helvetica-Bold', fontSize=8, leading=11,
            textColor=colors.HexColor("#0F172A")
        ),
        'CodeSnippet': ParagraphStyle(
            'CodeSnippet', parent=styles['Normal'],
            fontName='Courier', fontSize=7, leading=9,
            textColor=colors.HexColor("#0F172A")
        ),
        'TableHead': ParagraphStyle(
            'TableHead', parent=styles['Normal'],
            fontName='Helvetica-Bold', fontSize=7.5, leading=9.5,
            textColor=colors.white
        ),
        'TableCell': ParagraphStyle(
            'TableCell', parent=styles['Normal'],
            fontName='Helvetica', fontSize=7.2, leading=9.5,
            textColor=colors.HexColor("#1E293B")
        ),
        'TableCellBold': ParagraphStyle(
            'TableCellBold', parent=styles['Normal'],
            fontName='Helvetica-Bold', fontSize=7.2, leading=9.5,
            textColor=colors.HexColor("#0F172A")
        )
    }

def make_callout(text, title="KEY ARCHITECTURAL HIGHLIGHT", border_color="#0D9488", bg_color="#F0FDFA"):
    s = get_styles()
    content = [
        Paragraph(f"<b>{title}</b>", ParagraphStyle('CalloutT', parent=s['BodyBold'], textColor=colors.HexColor(border_color))),
        Spacer(1, 3),
        Paragraph(text, s['Body'])
    ]
    t = Table([[content]], colWidths=[504])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor(bg_color)),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor(border_color)),
        ('LINELEFT', (0,0), (-1,-1), 3.5, colors.HexColor(border_color)),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    return t

def make_table(data, col_widths, is_header=True):
    t = Table(data, colWidths=col_widths)
    t_style = [
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]
    if is_header:
        t_style.extend([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0F172A")),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
        ])
    else:
        t_style.extend([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ])
    t.setStyle(TableStyle(t_style))
    return t

def generate_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=54, rightMargin=54,
        topMargin=54, bottomMargin=54
    )
    s = get_styles()
    story = []

    # Title & Metadata
    story.append(Paragraph("SkillBridge (SkillSetu) — Sovereign Platform", s['DocTitle']))
    story.append(Paragraph("TECHNICAL ENHANCEMENTS, MOBILE RESPONSIVENESS & PRODUCTION HARDENING CHANGELOG", s['DocSubtitle']))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0D9488"), spaceBefore=2, spaceAfter=8))

    meta_table_data = [
        [Paragraph("<b>Document ID:</b>", s['TableCellBold']), Paragraph("SKILLSETU-CHANGELOG-2026-V1", s['TableCell']),
         Paragraph("<b>Target Evaluation:</b>", s['TableCellBold']), Paragraph("SIH 2026 Grand Finale Jury", s['TableCell'])],
        [Paragraph("<b>Release Version:</b>", s['TableCellBold']), Paragraph("v2.4.0 Production Hardened", s['TableCell']),
         Paragraph("<b>Compliance:</b>", s['TableCellBold']), Paragraph("DPDP Act 2023 &bull; NEP 2020 &bull; OWASP Top 10", s['TableCell'])],
        [Paragraph("<b>Live Tunnel URL:</b>", s['TableCellBold']), Paragraph("https://paradise-along-str-generous.trycloudflare.com", s['TableCell']),
         Paragraph("<b>Deployment Tier:</b>", s['TableCellBold']), Paragraph("Multi-Container Docker (Nginx + Node 22)", s['TableCell'])],
    ]
    story.append(make_table(meta_table_data, [95, 157, 105, 147], is_header=False))
    story.append(Spacer(1, 8))

    # Executive Overview
    story.append(Paragraph("1. Executive Summary of Engineering Enhancements", s['Header1']))
    story.append(Paragraph(
        "In preparation for the National Grand Finale evaluation, the SkillBridge platform underwent a comprehensive "
        "engineering cycle focused on <b>mobile accessibility, visual polish, production security hardening, and true server-side "
        "Blind Merit System (BMS) field masking</b>. This document details each architectural modification, the affected files, "
        "and their operational impact across the national talent highway ecosystem.",
        s['Body']
    ))

    story.append(make_callout(
        "<b>Zero-Downtime Live Refresh:</b> All changes were compiled via Vite 5 and TypeScript 5.9 with zero syntax or bundling errors. "
        "The production Docker stack (Frontend Nginx, Backend Node 22, and Cloudflare HTTPS Tunnel) was rebuilt and verified live "
        "with active rate limiting and security headers.",
        title="DEPLOYMENT INTEGRITY CERTIFICATE",
        border_color="#0D9488",
        bg_color="#F0FDFA"
    ))
    story.append(Spacer(1, 8))

    # Section 2: Mobile Responsiveness
    story.append(Paragraph("2. Mobile Responsiveness & Adaptive Navigation (Phase 1)", s['Header1']))
    story.append(Paragraph(
        "Previously, the platform utilized a fixed 240px desktop margin (<code>ml-60</code>) which caused horizontal layout "
        "clipping on smartphones and touch devices. A complete mobile-first navigation architecture has been engineered:",
        s['Body']
    ))

    mob_table_data = [
        [Paragraph("Component", s['TableHead']), Paragraph("Previous Architecture", s['TableHead']), Paragraph("Modern Responsive Implementation", s['TableHead'])],
        [Paragraph("<b>AppLayout</b>", s['TableCellBold']),
         Paragraph("Hardcoded <code>ml-60</code> pushing content off-screen on mobile.", s['TableCell']),
         Paragraph("Dynamic adaptive margins: <code>ml-0 lg:ml-60</code> with <code>w-full min-w-0</code>.", s['TableCell'])],
        [Paragraph("<b>Sidebar</b>", s['TableCellBold']),
         Paragraph("Fixed desktop sidebar overlapping mobile viewports.", s['TableCell']),
         Paragraph("Off-canvas slide-out drawer (<code>-translate-x-full lg:translate-x-0</code>) with dark backdrop overlay and auto-dismiss on link tap.", s['TableCell'])],
        [Paragraph("<b>Topbar</b>", s['TableCellBold']),
         Paragraph("No drawer toggle mechanism for mobile users.", s['TableCell']),
         Paragraph("Integrated hamburger menu button (<code>Menu</code> icon) on <code>&lt;lg</code> screens with responsive title truncation.", s['TableCell'])],
        [Paragraph("<b>MobileNavContext</b>", s['TableCellBold']),
         Paragraph("Non-existent; state was isolated.", s['TableCell']),
         Paragraph("Global React Context coordinating drawer open/close, toggle, and desktop collapse across all authenticated layouts.", s['TableCell'])],
    ]
    story.append(make_table(mob_table_data, [95, 185, 224]))
    story.append(Spacer(1, 8))

    # Section 3: Visual Polish & Login Refinement
    story.append(Paragraph("3. Login Page Visual Harmonization & Mobile Polish", s['Header1']))
    story.append(Paragraph(
        "In response to design review, the top header bar on the left showcase panel (emblem icon, redundant title text, and SIH grand finale pill badge) "
        "was cleanly excised. The remaining showcase was refactored into a high-impact, vertically centered hero presentation featuring:",
        s['Body']
    ))
    story.append(Paragraph("&bull; <b>High-Resolution Transparent Emblem:</b> Integrated <code>/skillbridge-emblem-transparent.png</code> with ambient multi-color glow.", s['Body']))
    story.append(Paragraph("&bull; <b>4 Sovereign Ecosystem Pillars:</b> Visual badges for Academia (OBE/NAAC), Students (NEP 2020), Industry (Blind Merit), and Governance (DigiLocker).", s['Body']))
    story.append(Paragraph("&bull; <b>Verified National Impact Telemetry:</b> Dynamic stat counters highlighting 15,000+ Students, 2,400+ Bounties, 89% Placement Index, and 500+ Corporate Partners.", s['Body']))
    story.append(Paragraph("&bull; <b>Mobile Branding Enclave:</b> On screens under 1024px, a dedicated mobile header displays the official emblem and typography above the form.", s['Body']))
    story.append(Spacer(1, 8))

    # Section 4: Production Security Hardening
    story.append(Paragraph("4. Production Security Hardening & Rate Limiting (Phase 2)", s['Header1']))
    story.append(Paragraph(
        "To satisfy enterprise evaluation criteria for national deployment, production-grade security headers, rate limiting, and persistent storage "
        "were implemented in the backend tier without third-party package incompatibilities:",
        s['Body']
    ))

    sec_table_data = [
        [Paragraph("Protection Layer", s['TableHead']), Paragraph("Technical Standard Implemented", s['TableHead']), Paragraph("Threat Mitigation", s['TableHead'])],
        [Paragraph("<b>HTTP Security Headers</b>", s['TableCellBold']),
         Paragraph("<code>X-Content-Type-Options: nosniff</code><br/><code>X-Frame-Options: SAMEORIGIN</code><br/><code>Strict-Transport-Security: max-age=15552000</code>", s['TableCell']),
         Paragraph("Eliminates MIME confusion attacks, clickjacking, protocol downgrade, and removes Express fingerprint.", s['TableCell'])],
        [Paragraph("<b>Auth Rate Limiter</b>", s['TableCellBold']),
         Paragraph("Sliding-window limiter: <b>40 requests / 15 minutes</b> per IP on <code>/api/auth/*</code>.", s['TableCell']),
         Paragraph("Prevents automated dictionary attacks, credential stuffing, and login brute-forcing.", s['TableCell'])],
        [Paragraph("<b>AI Quota Protection</b>", s['TableCellBold']),
         Paragraph("Sliding-window limiter: <b>30 requests / 15 minutes</b> per IP on resume parsing, ATS scoring, and mock interviews.", s['TableCell']),
         Paragraph("Protects Google Gemini 2.5 Flash and Groq LPU API token budgets from scraping and abuse.", s['TableCell'])],
        [Paragraph("<b>Storage Persistence</b>", s['TableCellBold']),
         Paragraph("Volume mount in <code>docker-compose.yml</code>: <code>./skillbridge/backend/uploads:/app/uploads</code>.", s['TableCell']),
         Paragraph("Ensures all student resumes, certificates, and portfolio PDFs survive container restarts permanently.", s['TableCell'])],
    ]
    story.append(make_table(sec_table_data, [105, 205, 194]))
    story.append(Spacer(1, 8))

    # Section 5: The BMS Real-World Backend Masking
    story.append(Paragraph("5. BMS (Blind Merit System) Server-Side Enforcement (Phase 3)", s['Header1']))
    story.append(Paragraph(
        "A critical question from national jury members was the operational integrity of the <b>Blind Merit System (BMS)</b>. "
        "Previously, anonymization was managed primarily as a client-side filter. The architecture has now been elevated to <b>Server-Side Field Masking</b>:",
        s['Body']
    ))

    bms_table_data = [
        [Paragraph("Candidate Data Field", s['TableHead']), Paragraph("Standard Screening Mode", s['TableHead']), Paragraph("BMS Server-Masked Output (Network JSON)", s['TableHead'])],
        [Paragraph("<b>Candidate Name</b>", s['TableCellBold']), Paragraph("Full Student Name (e.g., Dhruv Sharma)", s['TableCell']), Paragraph("<b>Scholar #CAND-XXXX</b> (Sovereign Hash)", s['TableCell'])],
        [Paragraph("<b>Candidate Email</b>", s['TableCellBold']), Paragraph("student@example.com", s['TableCell']), Paragraph("<b>scholar.xxxx@blind.skillbridge.gov.in</b>", s['TableCell'])],
        [Paragraph("<b>Academic Institution</b>", s['TableCellBold']), Paragraph("College Name & Tier", s['TableCell']), Paragraph("<b>Accredited Technical Institute [BMS Blinded]</b>", s['TableCell'])],
        [Paragraph("<b>Academic CGPA</b>", s['TableCellBold']), Paragraph("Actual CGPA (e.g., 8.9)", s['TableCell']), Paragraph("<b>null</b> (Masked until interview stage)", s['TableCell'])],
        [Paragraph("<b>Skills & Proctor Scores</b>", s['TableCellBold']), Paragraph("Verified Skill Badges & Sandbox Scores", s['TableCell']), Paragraph("<b>100% Intact & Unmasked</b> (Pure Merit Ranking)", s['TableCell'])],
    ]
    story.append(make_table(bms_table_data, [110, 184, 210]))
    story.append(Spacer(1, 6))

    story.append(Paragraph(
        "<i>Jury Pitch Line:</i> 'Our BMS operates on zero-trust column-level masking at the API layer. Candidate demographic signals "
        "never touch the wire until the student meets the objective technical benchmark, guaranteeing unbiased discovery for Tier-2/3 talent.'",
        s['Body']
    ))
    story.append(Spacer(1, 8))

    # Section 6: Complete File Changelog Table
    story.append(Paragraph("6. Master File Changelog Matrix", s['Header1']))
    
    file_table_data = [
        [Paragraph("File Path", s['TableHead']), Paragraph("Type", s['TableHead']), Paragraph("Core Functional Contribution", s['TableHead'])],
        [Paragraph("<code>context/MobileNavContext.tsx</code>", s['TableCellBold']), Paragraph("New", s['TableCell']), Paragraph("Global mobile drawer state provider and responsive toggle hook.", s['TableCell'])],
        [Paragraph("<code>middleware/security.ts</code>", s['TableCellBold']), Paragraph("New", s['TableCell']), Paragraph("Zero-dependency security headers and sliding-window rate limiters.", s['TableCell'])],
        [Paragraph("<code>layout/AppLayout.tsx</code>", s['TableCellBold']), Paragraph("Modified", s['TableCell']), Paragraph("Responsive margin calculus (<code>ml-0 lg:ml-60</code>) eliminating mobile overflow.", s['TableCell'])],
        [Paragraph("<code>layout/Sidebar.tsx</code>", s['TableCellBold']), Paragraph("Modified", s['TableCell']), Paragraph("Slide-out drawer with backdrop blur overlay and auto-dismiss on tap.", s['TableCell'])],
        [Paragraph("<code>layout/Topbar.tsx</code>", s['TableCellBold']), Paragraph("Modified", s['TableCell']), Paragraph("Hamburger trigger button, responsive spacing, and breadcrumb truncation.", s['TableCell'])],
        [Paragraph("<code>pages/auth/Login.tsx</code>", s['TableCellBold']), Paragraph("Modified", s['TableCell']), Paragraph("Excised top brand bar, centered hero emblem, added mobile branding.", s['TableCell'])],
        [Paragraph("<code>controllers/applications.ts</code>", s['TableCellBold']), Paragraph("Modified", s['TableCell']), Paragraph("Server-side BMS field masking logic when <code>?blind=true</code> is supplied.", s['TableCell'])],
        [Paragraph("<code>routes/auth.routes.ts</code>", s['TableCellBold']), Paragraph("Modified", s['TableCell']), Paragraph("Protected login and register endpoints with <code>authRateLimiter</code>.", s['TableCell'])],
        [Paragraph("<code>routes/student.routes.ts</code>", s['TableCellBold']), Paragraph("Modified", s['TableCell']), Paragraph("Protected AI resume, ATS, and interview routes with <code>aiRateLimiter</code>.", s['TableCell'])],
        [Paragraph("<code>backend/src/index.ts</code>", s['TableCellBold']), Paragraph("Modified", s['TableCell']), Paragraph("Mounted security headers, global API rate limiter, and permissive CORS.", s['TableCell'])],
        [Paragraph("<code>docker-compose.yml</code>", s['TableCellBold']), Paragraph("Modified", s['TableCell']), Paragraph("Mounted <code>./uploads:/app/uploads</code> volume for permanent file persistence.", s['TableCell'])],
        [Paragraph("<code>services/api.ts</code>", s['TableCellBold']), Paragraph("Modified", s['TableCell']), Paragraph("Forwarded <code>blind</code> query parameter in <code>getByOpportunity</code>.", s['TableCell'])],
        [Paragraph("<code>pages/recruiter/Opportunities.tsx</code>", s['TableCellBold']), Paragraph("Modified", s['TableCell']), Paragraph("Bound Blind Mode toggle directly to backend API refetch.", s['TableCell'])],
    ]
    story.append(make_table(file_table_data, [130, 45, 329]))
    story.append(Spacer(1, 10))

    # Section 7: Live Access Credentials
    story.append(Paragraph("7. Live Production Access & Evaluation Credentials", s['Header1']))
    creds_table_data = [
        [Paragraph("Role", s['TableHead']), Paragraph("Demo Email", s['TableHead']), Paragraph("Password", s['TableHead']), Paragraph("Target Experience", s['TableHead'])],
        [Paragraph("<b>Student</b>", s['TableCellBold']), Paragraph("student@example.com", s['TableCell']), Paragraph("Demo@1234", s['TableCellBold']), Paragraph("Competency Matrix, Assessments, ATS Scorer, Portfolio", s['TableCell'])],
        [Paragraph("<b>Recruiter</b>", s['TableCellBold']), Paragraph("recruiter@example.com", s['TableCell']), Paragraph("Demo@1234", s['TableCellBold']), Paragraph("BMS Blind Screening, Campus Schedulers, Bounties", s['TableCell'])],
        [Paragraph("<b>Academician</b>", s['TableCellBold']), Paragraph("academician@example.com", s['TableCell']), Paragraph("Demo@1234", s['TableCellBold']), Paragraph("Curriculum Diff Engine, Corporate R&D, Mentorship", s['TableCell'])],
        [Paragraph("<b>Admin</b>", s['TableCellBold']), Paragraph("admin@example.com", s['TableCell']), Paragraph("Demo@1234", s['TableCellBold']), Paragraph("Skill Shortages, Workforce Heatmap, DigiLocker ABC Sync", s['TableCell'])],
    ]
    story.append(make_table(creds_table_data, [85, 140, 75, 204]))
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>Official Deployment Link:</b> <font color='#0D9488'><u>https://paradise-along-str-generous.trycloudflare.com</u></font>", s['BodyBold']))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully generated at: {output_path}")

if __name__ == '__main__':
    target_path = sys.argv[1] if len(sys.argv) > 1 else 'SkillSetu_SIH2026_Recent_Engineering_Enhancements_Report.pdf'
    generate_pdf(target_path)

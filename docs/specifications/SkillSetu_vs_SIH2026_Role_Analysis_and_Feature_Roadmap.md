# 🏆 SkillSetu vs. SIH-2026-main: Role-Based Gap Analysis & Student Experience Roadmap
### **Smart India Hackathon 2026 &bull; Problem Statement ID:** SIH26044
### **Platform:** SkillSetu (Enterprise Production) vs. SIH-2026-main (SkillBridge)
### **Theme:** Smart Automation &bull; Software Category &bull; Team SIGMA

---

## 🔒 1. Architecture Decision: Zero-Trust Client Model (No Student API Keys Ever)
Students are **never asked for personal API keys**. Requiring students to supply private keys damages trust and risks accidental leakage. All AI telemetry (Resume Ingestion, Skill Mapping, Course Scouting, and Certificate Verification) runs **100% on the platform's secure server infrastructure** using managed Gemini 2.5 Flash and local Python processors. The student experiences instant, frictionless automation at zero cost.

---

## 🚀 2. The 5-Step First-Login Onboarding Lifecycle

```
[1. Initial Login] 
   └── Student logs in via college credentials/OAuth. System detects first-time user (is_onboarded: false).
          │
[2. Immediate Resume Ingestion]
   └── System prompts drag-and-drop resume upload (PDF). Local server parses text in <100ms with DPDP PII masking.
          │
[3. AI Profile Synthesis]
   └── Server AI synthesizes preliminary profile: extracts skills, education, GitHub repos, and initial proficiency levels.
          │
[4. Interactive Review & Verification Modal]
   └── Student reviews profile: adds missing achievements, projects, and uploads certificates for AI credibility audit.
          │
[5. Landing Page Launch]
   └── Student is redirected to Dashboard with populated match rings, verified badges, and personalized opportunities!
```

---

## 🔍 3. Dedicated AI Certificate Credibility & Fraud Verification Engine

### The Three-Layer Credibility Pipeline:
When a student uploads a course or achievement certificate (PDF or Image), the system passes it through a 3-layer verification pipeline before adding it to their verified profile:

1. **Layer 1: Multimodal Vision AI (Gemini 2.5 Flash Vision / LayoutLMv3):**
   * Analyzes document layout, official issuing authority typography, recognized logo vectors, standardized course codes, and authorized digital signatures (e.g., NPTEL, Coursera, AWS, edX, IITs).
2. **Layer 2: PDF XMP Metadata & Splicing Anomaly Detection (Python `pikepdf` & OpenCV):**
   * Inspects binary metadata of the PDF. Flags documents modified by image manipulation software (Adobe Photoshop, Canva, Illustrator), detects mismatched font layers (where a student edits the name over someone else's certificate), and catches altered date strings.
3. **Layer 3: Automated QR Code & Registry Resolver (Python `pyzbar` + Registry Webhooks):**
   * Automatically decodes embedded QR codes or verification URLs (e.g., `nptel.ac.in/noc/Ecertificate` or `coursera.org/verify/XXXX`). Queries the issuing academy's public verification endpoint to confirm matching student name, course title, and completion grade.

### Verification Outcome & TrustLedger Minting:
* **$\ge 90\%$ Confidence:** Status marked as `VERIFIED`. Displays verified green check badge on student's public portfolio; mints SHA-256 certificate block to the sovereign TrustLedger.
* **$70\% - 89\%$ Confidence:** Status marked as `PENDING_AUDIT`. Added to profile as unverified self-claim until secondary manual or automated registry webhook confirmation.
* **$< 70\%$ Confidence / Tampered:** Status marked as `REJECTED / FORGED`. Certificate rejected with clear explanation: *"Document failed metadata integrity check (Font layer splice detected)."*

---

## 📋 4. Role-by-Role Missing Functions in `SIH-2026-main` vs. `SkillSetu`

### 🎓 Role 1: Student & Engineering Scholar
* **Automated Resume Onboarding:** SkillSetu features immediate PDF resume ingestion upon first login; server-side AI extracts skills, degree, and projects. `SIH-2026-main` requires manual text entry only with no automated resume-to-profile extraction.
* **AI Certificate Credibility Engine:** SkillSetu has Multimodal Vision AI + PDF metadata tampering detector + QR registry validation before profile inclusion. `SIH-2026-main` accepts unverified text claims with zero anti-forgery verification.
* **Proctored Assessment & Anti-Cheat:** SkillSetu has a live Camera Proctor HUD + Fullscreen lockdown + Tab-switch violation counter. `SIH-2026-main` only has a basic, unproctored radio-button form where students can copy-paste answers with zero detection.
* **Public Verifiable Portfolio:** SkillSetu has a public vanity URL (`/portfolio/:id`) with dynamic QR code verification and live GitHub telemetry (stars, forks, languages). `SIH-2026-main` has an internal-only profile with no public URL, no QR code, and no GitHub API integration.
* **Multi-Track Engineering Domains:** SkillSetu provides deep domain categorization across Software Development, Cloud & DevOps, Data Science & AI/ML, Embedded Systems, and Core Engineering. `SIH-2026-main` only has a flat list of generic web tags.
* **Competency Matrix:** SkillSetu has a 5-tier mastery hierarchy (L1–L5) with side-by-side comparative bars (Self-claim vs. Proctored Score). `SIH-2026-main` has a flat 3-tier dropdown.
* **Career Roadmap & Score Leap:** SkillSetu features an interactive milestone path with predictive score leap projections (e.g. 94% $\rightarrow$ 100%). `SIH-2026-main` only shows flat job cards with a static percentage ring.
* **Tiered Budget Course Filters:** SkillSetu lets students filter courses by Free (₹0), Budget (<₹1,000), and Grants. `SIH-2026-main` has an unfiltered flat list.

### 🏢 Role 2: Industry Partner & Recruiter
* **Cryptographic Trust Verification:** SkillSetu recruiters can inspect candidate SHA-256 block hashes on the TrustLedger to verify score authenticity. `SIH-2026-main` uses plain database integers with no tamperproof proof.
* **Proctor Integrity Telemetry:** SkillSetu recruiters see real-time integrity metrics (e.g. 98% Integrity, 0 tab switches, 100% face presence). `SIH-2026-main` provides zero proctor telemetry.
* **Live GitHub Code Review:** SkillSetu displays live repository stats inside candidate review cards. `SIH-2026-main` relies on self-reported text descriptions.
* **Structured Role Requisitions:** SkillSetu supports posting Summer Technical Internships, 6-Month Co-Ops, Research Apprenticeships, and Graduate Trainee Openings with customized skill weights. `SIH-2026-main` is restricted to generic unstructured text job posts.
* **1-Click Ledger Shortlisting:** SkillSetu mints cryptographic SHA-256 transaction receipts anchoring candidate selection. `SIH-2026-main` uses simple unhashed SQL updates.

### 🏫 Role 3: Academician & University Faculty
* **Automated Curriculum Harmonization:** SkillSetu uses AI to compare university syllabi against live corporate job demand to highlight curriculum lag. `SIH-2026-main` only lists created courses.
* **Institutional Project Endorsement:** SkillSetu allows professors to digitally sign and endorse student capstone projects with cryptographic ledger hashes. `SIH-2026-main` has no endorsement system.
* **Industry Collaborative Research & Lab Projects:** SkillSetu enables engineering professors and department heads to track industry-sponsored research, live corporate consultancy projects, and student lab co-development. `SIH-2026-main` has zero collaborative research infrastructure.
* **Accreditation Audit Generation:** SkillSetu compiles auditable records of student mentorship hours and industry tie-ups for NAAC and NBA reviews. `SIH-2026-main` has no accreditation reporting.

### 🏛️ Role 4: Institutional Admin & Regulatory Authority
* **National Workforce Heatmap:** SkillSetu displays an interactive geographic heatmap of Indian states showing regional talent supply vs. employer demand. `SIH-2026-main` only has basic counter cards.
* **TrustLedger Node Monitor:** SkillSetu displays live health metrics for distributed cryptographic verification nodes. `SIH-2026-main` has no ledger.
* **Regulatory Compliance Telemetry:** SkillSetu tracks statutory compliance benchmarks against AICTE and UGC statutory accreditation benchmarks (NBA, NAAC, NIRF). `SIH-2026-main` has no policy indicators.
* **DPDP Act 2023 Enforcement:** SkillSetu has an automated PII scrubber redacting phone numbers, emails, and 12-digit Indian Aadhaar numbers before AI processing. `SIH-2026-main` stores unredacted data with zero DPDP compliance.
* **Bilingual Language Engine:** SkillSetu features a topbar toggle switching the entire interface between English and Hindi (`हिंदी`). `SIH-2026-main` is hardcoded English.

---

## 🚀 5. Innovation Roadmap: 5 High-Impact Technical Features for EACH Role (20 Features)

### 🎓 For Students (5 Features)
1. **Immediate Resume Onboarding & Synthesis:** First-login drag-and-drop resume upload. Server AI parses text in <100ms, synthesizes preliminary profile, and allows student to review/add missing achievements before launching dashboard.
2. **AI Certificate Credibility & Anti-Forgery Engine:** Multimodal Vision AI + PDF metadata splicing detector + automated QR code resolver verifying certificates against official registries before awarding TrustLedger verified badges.
3. **Autonomous Server-Side AI Course Scout:** Runs on platform server infrastructure (zero student API keys). Continuously crawls accredited academies (NPTEL, SWAYAM, MIT OCW, AWS), filtering by budget (Free ₹0 vs. Under ₹1,000).
4. **AI Voice & Video Mock Technical Interview Simulator:** Interactive AI avatar conducting role-specific technical and system-design interviews via voice, evaluating eye contact, clarity, and tech accuracy before live company drives.
5. **Dynamic ATS Resume Scorer & 1-Click Keyword Tailor:** Uploads PDF resumes, compares keywords against target job requisitions, generates an ATS compatibility score, and suggests bullet-point phrasing improvements.

### 🏢 For Recruiters (5 Features)
1. **In-Browser Proctored Coding & Engineering Sandbox:** Live browser IDE (Python, TypeScript, C++, SQL, or Docker configurations) with real-time proctored webcam recording, code execution telemetry, and zero local setup.
2. **Predictive Candidate Offer Acceptance & Retention Index:** AI evaluating candidate commute radius, past interview conversion history, and stipend fit to predict offer acceptance.
3. **Tamperproof Smart-Contract Letter of Intent (LOI) Minting:** 1-Click generation of cryptographically signed, verifiable LOIs anchored on the TrustLedger.
4. **Blind Resume Screening (Unbiased Merit Mode):** Toggle that temporarily masks candidate name, gender, college tier, and photo during technical evaluation.
5. **Automated Bulk Campus Interview Auto-Scheduler:** Integrates with Google Calendar, Teams, and Zoom to auto-schedule hundreds of interview rounds across batches.

### 🏫 For Academicians (5 Features)
1. **AI Curriculum Diff Engine (Syllabus Re-Harmonizer):** Compares university syllabus PDFs against live job postings to generate an exact diff of missing vs. outdated topics.
2. **Corporate Consultancy & Sponsored R&D Exchange:** Marketplace where industries post technical challenges and college professors submit bids for funded corporate consultancy.
3. **One-Click NAAC / NBA Accreditation Dossier Generator:** Instant compilation of student internship attendance, mentorship hours, MoUs, and placement stats formatted for accreditation bodies.
4. **Industry Guest Lecture & Workshop Scheduling Portal:** Universities invite verified corporate engineering leads and industry architects for accredited guest lectures and hands-on laboratory workshops.
5. **Collaborative Capstone Industry Co-Mentorship Hub:** Corporate senior architects and engineers co-mentor final-year college capstone projects alongside faculty, bridging theoretical research with production reality.

### 🏛️ For Admins & Regulators (5 Features)
1. **Predictive National Skill-Shortage Early Warning System:** Forecasting dashboard modeling which technical domains will suffer acute talent deficits across India over 1–3 years (e.g. Semiconductor VLSI, Quantum Computing, Cloud Security, Edge AI).
2. **Academic Bank of Credits (ABC) & DigiLocker Gateway:** Syncs verified internship hours, proctored test badges, and training credits into official DigiLocker ABC accounts under NEP 2020.
3. **Fraudulent Job Posting & Scam Recruiter Detector:** Autonomous AI filter detecting ghost companies, suspicious fee requests, or fake internship drives, blacklisting illicit accounts.
4. **Geofenced Regional Skilling Grant Optimizer:** Recommends where central government skilling subsidies should be allocated based on regional deficit data (e.g. deploying IoT labs in Tier-3 colleges).
5. **Real-Time Regulatory Telemetry & Gender Diversity Dashboard:** Automated compliance dashboard for AICTE, UGC, and State Technical Universities displaying real-time gender ratios, stipend fairness metrics, and regional placement distribution.

---

### 💡 Pitch Defense for SIH Judges:
> *"Judges, our student onboarding is effortless and cryptographically secure. The moment a student logs in, our server-side AI analyzes their resume, populates their profile, and verifies their certificates using a **Multimodal Vision & Metadata Anti-Forgery Engine**. Students never need to expose personal API keys, and recruiters are guaranteed that every listed certificate on the platform is genuine and verified on our **Sovereign SHA-256 TrustLedger**."*

# 📘 SkillSetu: Complete Student Feature Architecture & Engineering Blueprint
### **Smart India Hackathon 2026 &bull; Problem Statement ID: SIH26044**
### **Theme: Smart Automation &bull; Software Category &bull; Team SIGMA**
### **Target Platform: SkillSetu Core Enterprise**

---

## 🔒 1. Architecture Mandates: Zero-Trust Client Model & Zero-Overload UI
1. **No Student API Keys Ever:** All AI operations run 100% on the server infrastructure (managed Gemini 2.5 Flash + Python processors). Students are never asked for private keys, eliminating fear of stolen credentials and ensuring a friction-free experience.
2. **Zero-Overload UI Strategy:** Never crowd the main student dashboard. Advanced tools live in dedicated sub-routes or elegant slide-over drawers so the interface remains clean, fast, and intuitive.
3. **Fail-Soft Reliability:** If any AI service or web scraping background worker times out, the system falls back to cached local rules without throwing 500 errors or crashing React components.

---

## 🚀 Part 1: The First-Login Onboarding & AI Certificate Verification Engine

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

### Feature 1: First-Login Resume Ingestion & Profile Synthesis Wizard
* **Route:** `/student/onboarding`
* **Trigger:** In `AuthContext.jsx`, after login, check `user.onboarded`. If false, route to `/student/onboarding`.
* **Flow:** Clean 3-step modal wizard. Student drops their resume PDF.
* **Backend:** `POST /api/student/onboard/parse-resume` extracts text using `pypdf`, scrubs PII, calls Gemini with strict Pydantic schema validation, and returns structured profile JSON.
* **Safety:** If PDF parsing fails, provides an inline manual form without throwing errors.

### Feature 2: Dedicated AI Certificate Credibility & Anti-Forgery Verification Engine
* **Layer 1: Multimodal Vision AI (Gemini 2.5 Flash Vision / LayoutLMv3):** Inspects document typography, recognized logos, standardized course codes, and authorized digital signatures (NPTEL, Coursera, AWS, edX, IITs).
* **Layer 2: PDF XMP Metadata & Splicing Anomaly Detection (Python `pikepdf` & OpenCV):** Inspects binary metadata to flag documents modified by editing software (Photoshop, Canva, Illustrator), detects mismatched font layers (editing a name over another person's certificate), and altered dates.
* **Layer 3: Automated QR Code & Registry Webhook Resolver (Python `pyzbar`):** Decodes embedded QR codes/URLs and queries the academy's official verification API to match student names and grades.
* **Confidence & TrustLedger Action:**
  * **$\ge 90\%$ Confidence:** Marked `VERIFIED`, green check badge added to portfolio, minted as immutable SHA-256 block hash on TrustLedger.
  * **$70\% - 89\%$ Confidence:** Marked `PENDING_AUDIT`, added as unverified claim until secondary confirmation.
  * **$< 70\%$ Confidence / Tampered:** Marked `REJECTED / FORGED`, rejected with alert: *"Document failed metadata integrity check (Font layer splice detected)."*

---

## 🏛️ Part 2: Core Platform Student Features (Full Inventory)

### Feature 3: Student Analytics Dashboard & 5-Axis Competency Radar
* **Route:** `/student/dashboard`
* **UI/UX:** Responsive 5-Axis Competency Radar Chart (Recharts) mapping student skills against industry 90th percentile across Core CS, System Design, Cloud/DevOps, Data/AI, and Problem Solving.
* **Backend:** `GET /api/analytics/student` aggregates user skills, pending applications, and top matches in <30ms.

### Feature 4: Proctored Assessment Suite & Hardware Anti-Cheat Engine
* **Route:** `/student/assessment`
* **Anti-Cheat:** HTML5 Fullscreen API lockdown, window blur/tab-switch detection (deducts integrity points), right-click copy-paste disabled, live Camera Proctor HUD with animated scanning reticle.
* **Backend:** `POST /api/assessments/submit` evaluates score, checks integrity infractions, mints NSQF Certified Badge (Gold/Silver/Bronze) with SHA-256 block hash on TrustLedger.

### Feature 5: Interactive Competency Matrix & Comparative Score Bars
* **Route:** `/student/skills`
* **Structure:** 5-tier mastery hierarchy: Master (L5), Expert (L4), Advanced (L3), Intermediate (L2), Beginner (L1).
* **Visual Audit:** Dual-fill progress bars contrasting candidate self-rating vs. proctored verified score, exposing resume inflation to recruiters instantly.

### Feature 6: Public Verifiable Digital Portfolio with Dynamic QR & GitHub Telemetry
* **Route:** `/portfolio/:id`
* **Public Sharing:** Vanity URL accessible to recruiters without login. Displays verified TrustLedger badges, certifications, and printable CSS for PDF dossier generation.
* **Dynamic QR Code:** Renders SVG QR code linking to the candidate's TrustLedger ledger block.
* **Live GitHub Telemetry:** Real-time API fetching top repositories, commit frequency, star counts, and coding languages.

### Feature 7: Opportunities Hub & 1-Click TrustLedger Application
* **Route:** `/student/opportunities`
* **Match Score Ring:** Circular 0–100% match indicator. Clicking an opportunity reveals an explainable breakdown (matching skills in green, missing skills in red, stipend, location).
* **1-Click Apply:** Mints cryptographic application hash to TrustLedger.

### Feature 8: Real-Time Application Tracking Pipeline
* **Route:** `/student/applications`
* **Pipeline:** 4-stage Kanban lifecycle: `APPLIED` &rarr; `UNDER REVIEW` &rarr; `SHORTLISTED` &rarr; `SELECTED`. Includes recruiter decision notes and SHA-256 transaction receipts.

### Feature 9: Multi-Stage Milestone Stepper & Match Score Leap Predictor
* **Route:** `/student/recommendations`
* **Upskilling Stepper:** Replaces rejection dead-ends with an actionable milestone path: *1. Bridge Course &rarr; 2. Proctored Quiz &rarr; 3. Mentorship Advisory &rarr; 4. 1-Click Apply*.
* **Score Leap Predictor:** Displays projected match score improvement (e.g. *76% &rarr; 88% upon completing AWS module*).

### Feature 10: Continuing Learning Hub with Interactive Budget & Grant Filters
* **Route:** `/student/learning`
* **Budget Accessibility:** Tiered filters for financial inclusivity:
  * **100% Free / Govt-Funded (₹0)**
  * **Micro-Boosters (<₹1,000)**
  * **Sponsored & Grant Modules**

### Feature 11: Academic & Industry 1-on-1 Mentorship Hub
* **Route:** `/student/mentorship`
* **Guidance Requests:** Connects students with verified senior architects and faculty for 1-on-1 guidance requests and calendar scheduling.

---

## 🚀 Part 3: 5 Next-Gen Recommended Student Innovations

### Feature 12: Autonomous Server-Side AI Course Scout & Real-Time Skill Agent
* **Route:** `/student/learning` (100% server-side, zero student API keys).
* **Worker:** Python `APScheduler` background task continuously crawls accredited academies (NPTEL, SWAYAM, MIT OCW, AWS Skill Builder) for new courses and syllabus updates, pushing personalized recommendations based on skill gaps.

### Feature 13: AI Voice & Audio/Video Mock Technical Interview Simulator
* **Route:** `/student/mock-interview`
* **Voice Stack:** Browser Web Speech API (`SpeechRecognition` & `SpeechSynthesis`) for zero external audio latency.
* **AI Evaluation:** Gemini evaluates Technical Accuracy (50%), Keyword Coverage (25%), and Communication Clarity (25%). Camera HUD provides posture feedback.

### Feature 14: Dynamic ATS Resume Scorer & 1-Click Keyword Tailor
* **Location:** Inside Opportunities detail modal as a slide-over drawer.
* **Audit:** Compares resume PDF against target job requisition in <100ms, outputs ATS score ring (e.g. 78%), highlights matching vs. missing keywords, and suggests phrasing improvements.

### Feature 15 & 16: Hackathon Teammate Matcher & Micro-Internship Bounty Hub
* **Teammate Matcher (`/student/teams`):** Algorithmic set-complement engine matching project vacancies with students possessing complementary skills across colleges (React + Python + Cloud).
* **Micro-Bounties Toggle:** Embedded inside `Opportunities.jsx` as a toggle: **[ Full Internships | 2-Week Micro-Bounties ]**. Requires GitHub PR links and awards verified badges on TrustLedger.

---

## 🗓️ Part 4: 4-Phase Safe Implementation Timeline & Testing Checklist

| Phase | Milestone | Focus Areas | Production Risk |
|---|---|---|:---:|
| **Phase 1** (Week 1) | Schemas & API Stubs | Independent database tables (`certificates`, `dynamic_courses`, `bounties`) & FastAPI router stubs. Local PDF parser and QR resolver. | **Zero Risk** |
| **Phase 2** (Week 2) | Onboarding & UI Shells | `OnboardingWizard.jsx` and routes in `App.jsx`. Certificate Upload modal with drag-and-drop & ATS Resume Audit drawer. | **Zero Risk** |
| **Phase 3** (Week 3) | AI Intelligence & Vision | Server-side Gemini 2.5 Flash for resume profile synthesis, certificate vision analysis, and mock interview scoring. | **Low Risk** |
| **Phase 4** (Week 4) | TrustLedger Minting & Hardening | Anchor verified certificate hashes to TrustLedger. Responsive audits across mobile (375px) & desktop viewports. | **Ready for Demo** |

---

### 💡 Presentation Defense for SIH Judges:
> *"Judges, our student ecosystem is comprehensive, intelligent, and mathematically verified. From the moment a student logs in, our server AI parses their resume, populates their profile, and verifies their certificates using a **Multimodal Vision & Metadata Anti-Forgery Engine**. All 16 student features—from proctored assessments and live GitHub telemetry to voice mock interviews and micro-bounties—operate in a non-cramped, modular architecture anchored to our **Sovereign SHA-256 TrustLedger**."*

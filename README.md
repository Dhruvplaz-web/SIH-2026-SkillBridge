# SkillSetu (SIH26044) — Sovereign National Academic-to-Industry Highway

> **Smart India Hackathon 2026 | Problem Statement ID: SIH26044**  
> *Connecting Academic Potential with Industrial Opportunity through Sovereign Verification, Proctored Competency Telemetry, and Statutory Compliance.*

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Dhruvplaz-web/SIH-2026-SkillBridge)


---

## 🏛️ Executive Overview

SkillSetu is an enterprise-grade digital infrastructure built to resolve the critical gap between university curriculum delivery and corporate technical requisitions across India. 

The platform supports four core user stakeholders with **20 next-generation additions**:
1. **Scholar & Student Role:** Dynamic ATS resume scoring, in-browser voice interview practice, sovereign TrustLedger block explorer, hackathon teammate matcher, and funded micro-internships.
2. **Industry Partner & Recruiter Role:** In-browser proctored coding sandbox (Python/JS/SQL/C++), blind resume screening (Unbiased Merit Mode), live GitHub telemetry, predictive candidate offer acceptance & 1-year retention index, and 1-click cryptographic Letter of Intent (LOI) minting.
3. **Academician & University Faculty Role:** AI Curriculum Diff Engine (Syllabus Re-Harmonizer comparing course outlines against live corporate demand), sponsored corporate R&D consultancy exchange, 1-click automated NAAC & NBA compliance dossier generator, industry guest lecture portal, and collaborative capstone co-mentorship hub.
4. **Institutional Admin & Regulatory Authority Role:** Predictive national skill-shortage early warning system (Semiconductor VLSI, Quantum, Ayush Informatics, Edge AI), national workforce heatmap & Tier-3 skilling grant optimizer, Academic Bank of Credits (ABC) & DigiLocker gateway under NEP 2020, and fraudulent job detector with 1-click blacklisting.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Recharts (6-Axis Dynamic Competency Radar), Lucide Icons, Web Speech API.
- **Backend:** Node.js, Express, TypeScript, LibSQL / SQLite (ACID compliant with automated migrations), RESTful modular controllers.
- **AI Infrastructure:** **Zero-Trust Client Model** — Dual-engine server-side managed LLMs:
  - **Google Gemini 2.5 Flash** (Primary for multi-modal analysis, syllabus diffs, and resume synthesis).
  - **Groq Llama 3.3 70B Versatile** (Instant zero-latency execution & fallback).
- **Trust & Cryptography:** **Sovereign TrustLedger Blockchain Simulation** — SHA-256 cryptographic hashing, Proof of Authority (PoA) institutional consensus quorum (IIT Delhi, AICTE Central, UGC Regulatory, NASSCOM).
- **Statutory Compliance:** **DPDP Act 2023** automated PII redaction pipeline, **NEP 2020** Academic Bank of Credits, **AICTE Model Curriculum** harmonization.
- **Bilingual Accessibility:** Real-time **English / Hindi (हिंदी)** dynamic topbar toggle.

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js v18+ or v20+
- npm v9+

### 1. Backend Setup
```bash
cd skillbridge/backend
npm install
npm run build
npm run dev
```
*Backend runs on `http://localhost:5000`*

### 2. Frontend Setup
```bash
cd skillbridge/frontend
npm install
npm run build
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🔑 Default Demo Login Credentials

| Role | Email | Password | Primary Features |
| :--- | :--- | :--- | :--- |
| **Student** | `student@example.com` | `Demo@1234` | Resume Synthesis, ATS Scorer, Voice Mock Interview, Competency Radar, TrustLedger |
| **Recruiter** | `recruiter@example.com` | `Demo@1234` | Coding Sandbox, Blind Screening, GitHub Telemetry, Offer Acceptance Predictor, Smart LOI Minting |
| **Academician** | `academician@example.com` | `Demo@1234` | Syllabus Re-Harmonizer, Corporate Consultancies, NAAC/NBA Dossier, Capstone Co-Mentorship |
| **Admin** | `admin@example.com` | `Demo@1234` | Skill Shortage Early Warning, State Workforce Heatmap, DigiLocker ABC Sync, Job Fraud Scanner |

---

## 📄 Key Architectural Documents Included
- [`SkillSetu_Master_Architecture_and_Engineering_Report.pdf`](./SkillSetu_Master_Architecture_and_Engineering_Report.pdf): 4-page comprehensive technical whitepaper and implementation report.
- [`SkillSetu_Platform_Evolution_and_Engineering_Report.pdf`](./SkillSetu_Platform_Evolution_and_Engineering_Report.pdf): Comparative baseline evolution document.
- [`SkillSetu_vs_SIH2026_Role_Analysis_and_Feature_Roadmap.pdf`](./skillbridge/SkillSetu_vs_SIH2026_Role_Analysis_and_Feature_Roadmap.pdf): SIH26044 authoritative gap analysis.
- [`Student_Features_Engineering_Implementation_Blueprint.pdf`](./skillbridge/Student_Features_Engineering_Implementation_Blueprint.pdf): Student engineering blueprint.

---

## 🧪 Verification & Build Status
- **Frontend Bundle:** `tsc && vite build` &rarr; **Exit Code 0** (2,820 modules transformed, 0 TS errors).
- **Backend Engine:** `tsc` &rarr; **Exit Code 0** (Fully typed controllers and models).
- **Integration Test Suite:** `node scratch/test_full_platform_all_roles.js` &rarr; **All 20 features passed 100%**.

import React from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, Shield, Award, CheckCircle2, ArrowLeft, Scale } from 'lucide-react';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 selection:bg-teal-500 selection:text-white font-sans">
      {/* Top Sovereign Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="h-1 bg-gradient-to-r from-orange-500 via-white to-green-600" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-navy-900 to-slate-800 flex items-center justify-center text-white font-bold shadow-md shadow-slate-900/10 border border-slate-700">
              <span className="text-teal-400 font-serif text-lg"> सेतु </span>
            </div>
            <div>
              <span className="text-base font-bold text-gray-900 tracking-tight block">SkillSetu</span>
              <span className="text-[10px] text-gray-500 tracking-wider uppercase font-medium block">National Skill Harmonization Platform</span>
            </div>
          </Link>

          <Link to="/" className="btn-secondary text-xs flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>
      </header>

      {/* Hero Header */}
      <section className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-4xl mx-auto space-y-3">
          <Breadcrumbs className="text-slate-400" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-bold">
            <Scale className="w-4 h-4 text-teal-400" />
            National Stakeholder Governance Charter
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Terms of Service &amp; Operational Accord
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Standard Governance Agreement for Students, Recruiters, Higher Education Institutions, and Regulatory Bodies.
          </p>
        </div>
      </section>

      {/* Terms Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-10 space-y-8 text-sm leading-relaxed text-gray-700">
          
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              1. Preamble &amp; Acceptance of Terms
            </h2>
            <p>
              By accessing, creating credentials, or conducting transactions on the SkillSetu Platform (SIH26044), you enter into 
              a legally binding covenant with SkillSetu National Infrastructure, operating under the regulatory guidance of 
              the All India Council for Technical Education (AICTE) and Ministry of Education.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              2. Student User Obligations &amp; Assessment Integrity
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Academic Authenticity:</strong> All educational credentials, uploaded resumes, and project artifacts must be genuine and unaltered.
              </li>
              <li>
                <strong>Proctored Examination Discipline:</strong> During proctored competency evaluations, candidates are bound by a strict 3-strike policy. 
                Window-blur events, full-screen exits, black tape lens tampering, and unauthorized clipboard interaction trigger instant disqualification 
                and forfeiture of badge minting privileges.
              </li>
              <li>
                <strong>Anti-Plagiarism Covenant:</strong> Code submissions to the Practical Coding Arena undergo automated Abstract Syntax Tree (AST) 
                similarity and algorithmic complexity auditing. Submitting plagiarized solutions constitutes an actionable academic breach.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              3. Recruiter Covenants &amp; Fair Hiring Protocol
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Non-Discrimination:</strong> Corporate partners agree to utilize verified skill competencies and performance metrics as primary screening criteria.
              </li>
              <li>
                <strong>Provisional Smart-Contract Letters of Intent (LOI):</strong> LOIs minted through the SkillSetu TrustLedger represent bona fide corporate commitments to candidate evaluation, interview progression, or provisional internship placement subject to background checks.
              </li>
              <li>
                <strong>Zero Solicitations:</strong> Recruiters are prohibited from using candidate contact information for commercial telemarketing or non-employment communications.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              4. Institutional Academician Responsibilities
            </h2>
            <p>
              Faculty mentors and Departmental Board of Studies (BoS) representatives utilize the platform to generate accredited syllabus 
              resolutions and verify student project deliverables. Institutions warrant that submitted BoS resolutions and credit recommendations 
              comply with university statutory bylaws and National Credit Framework (NCrF) guidelines.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              5. Intellectual Property &amp; Ledger Provenance
            </h2>
            <p>
              Candidates retain 100% intellectual property ownership of their source code, projects, and creative portfolio deliverables. 
              SkillSetu retains perpetual, non-exclusive rights to record cryptographic cryptographic SHA-256 validation digests on the 
              public TrustLedger for lifelong credential verification.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              6. Limitation of Liability &amp; Force Majeure
            </h2>
            <p>
              While SkillSetu maintains high-availability sovereign cloud infrastructure with 99.9% uptime SLA, the platform is provided 
              on an "as is" and "as available" basis without warranties of uninterrupted service during scheduled maintenance or national 
              network disruptions.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, FileText, CheckCircle2, UserCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';

export default function PrivacyPolicy() {
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
            <Shield className="w-4 h-4 text-teal-400" />
            DPDP Act 2023 Statutory Compliance Protocol
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            National Data Privacy &amp; Sovereign Telemetry Policy
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Effective Date: September 2026 &bull; Compliant with Digital Personal Data Protection (DPDP) Act 2023, 
            National Credit Framework (NCrF), and ISO/IEC 27001 Information Security Standards.
          </p>
        </div>
      </section>

      {/* Policy Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-10 space-y-8 text-sm leading-relaxed text-gray-700">
          
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              1. Statutory Mandate &amp; Scope
            </h2>
            <p>
              SkillSetu operates as an accredited sovereign national digital public good under the purview of the Ministry of 
              Education and the All India Council for Technical Education (AICTE). We recognize the sanctity of candidate 
              educational data and are strictly bound by the provisions of the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>.
            </p>
            <p className="mt-2">
              This policy governs all data collection, algorithmic processing, TrustLedger cryptographic attestation, and 
              employer access across students, recruiters, academic faculty, and regulatory auditors.
            </p>
          </div>

          <div className="p-4 bg-teal-50 rounded-xl border border-teal-200 text-teal-950 space-y-2">
            <h3 className="font-bold text-teal-900 flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-teal-700" /> Zero Commercial Data Monitization Covenant
            </h3>
            <p className="text-xs leading-relaxed text-teal-900">
              SkillSetu will <strong>NEVER</strong> sell, monetize, broker, or rent candidate personal identifying data, 
              academic marks, contact info, or coding telemetry to any advertising network, data broker, or commercial third party.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              2. Data We Collect &amp; Process
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Candidate Identifiers:</strong> Name, institutional roll number, university affiliation, authorized institutional email address.
              </li>
              <li>
                <strong>Academic &amp; Credit Records:</strong> Coursework credits, CGPA, degree progression aligned with National Credit Framework (NCrF).
              </li>
              <li>
                <strong>Competency &amp; Skill Telemetry:</strong> Code submissions, AST Big-O runtime analyses, assessment scores, and audio/speech metrics from practice interview modules.
              </li>
              <li>
                <strong>Automated Redaction &amp; Privacy Sanitization:</strong> In accordance with DPDP rules, resumes uploaded during student onboarding undergo automatic regex scrubbing to redact 12-digit Indian Aadhaar numbers, private phone numbers, and home addresses before vectorization.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              3. Unbiased "Blind Mode" Recruiter Privacy Protection
            </h2>
            <p>
              To ensure absolute meritocracy, recruiters evaluating candidates in "Blind Mode" do not receive student names, gender, 
              caste, demographic identifiers, or photographs. Candidates are represented solely by verifiable capability vectors, 
              coding execution scores, and cryptographic TrustLedger block proofs.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              4. Cryptographic TrustLedger &amp; Zero-Knowledge Proofs
            </h2>
            <p>
              SkillSetu employs immutable SHA-256 decentralized block records. While competency badges and verification hashes 
              are permanently inscribed on the ledger, candidate personally identifiable information (PII) is decoupled using 
              cryptographic hashes (Candidate Privacy Tokens), ensuring zero data leakage in the event of an external audit.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              5. Your Rights Under DPDP Act 2023
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="text-gray-900 block mb-1">Right to Access Summary</strong>
                <span className="text-gray-600">Download a complete machine-readable copy of your personal data and ledger attestations.</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="text-gray-900 block mb-1">Right to Correction &amp; Erasure</strong>
                <span className="text-gray-600">Request correction of inaccurate records or complete account erasure subject to statutory audit laws.</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="text-gray-900 block mb-1">Right of Grievance Redressal</strong>
                <span className="text-gray-600">Directly escalate privacy disputes to our designated statutory Data Protection Officer (DPO).</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="text-gray-900 block mb-1">Right to Nominate</strong>
                <span className="text-gray-600">Nominate an authorized representative in the event of death or incapacity.</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              6. Grievance Redressal Officer Contact
            </h2>
            <div className="p-4 bg-slate-900 text-white rounded-xl space-y-1.5 text-xs font-mono">
              <div className="text-teal-400 font-bold">Data Protection Officer (DPO) - SkillSetu National Infrastructure</div>
              <div>Office of the National Directorate, AICTE Headquarters</div>
              <div>Nelson Mandela Marg, Vasant Kunj, New Delhi, 110070</div>
              <div>Email: dpo@skillsetu.gov.in &bull; Helpline: +91-11-29581000</div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

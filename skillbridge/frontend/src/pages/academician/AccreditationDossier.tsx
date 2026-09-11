import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Award, FileText, Download, CheckCircle2, Building, 
  Users, Clock, ShieldCheck, Printer, ArrowUpRight, Copy, Check,
  Layers, ExternalLink, Sparkles, AlertCircle, FileCheck
} from 'lucide-react';
import { Topbar } from '../../components/layout/Topbar';
import { PageLoader } from '../../components/ui/Spinner';
import { academicianFeaturesAPI } from '../../services/api';

export default function AccreditationDossier() {
  const [dossier, setDossier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'criterion1' | 'criterion2' | 'criterion5' | 'ssr'>('overview');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadDossier();
  }, []);

  const loadDossier = async () => {
    try {
      const res = await academicianFeaturesAPI.getAccreditationDossier();
      setDossier(res.data.dossier);
    } catch (err) {
      console.error('Failed to load dossier:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyHash = () => {
    if (!dossier?.blockHash) return;
    navigator.clipboard.writeText(dossier.blockHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <><Topbar title="NAAC / NBA Accreditation Dossier" /><PageLoader /></>;

  return (
    <div>
      <Topbar 
        title="One-Click NAAC / NBA Accreditation Dossier Generator" 
        subtitle="Automated institutional compliance compilation aggregating verified internships, industry MoUs, and mentorship hours"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* Cryptographic TrustLedger Attestation Header */}
        <div className="card p-5 bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 text-white border-0 shadow-lg relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> TrustLedger Cryptographically Attested
                </span>
                <span className="text-[10px] font-mono text-slate-300 bg-white/10 px-2 py-0.5 rounded">
                  SSR Annexure: {dossier?.ssrAnnexureNo}
                </span>
                <span className="text-[10px] font-mono text-teal-300 bg-teal-500/20 px-2 py-0.5 rounded border border-teal-500/30">
                  {dossier?.aicteComplianceCode}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">{dossier?.institutionName}</h2>
              <p className="text-xs text-slate-300">
                Accreditation Evaluation Cycle: <strong className="text-white">{dossier?.academicCycle}</strong> • NAAC (Criteria 1, 2 & 5) & NBA Tier-1 Compliant
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleCopyHash}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors border border-white/20 cursor-pointer"
                title="Copy SHA-256 Ledger Hash"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Hash Copied!' : `${dossier?.blockHash?.slice(0, 10)}...`}</span>
              </button>

              <button
                onClick={handlePrint}
                className="btn-primary text-xs font-bold flex items-center gap-1.5 px-4 py-2 cursor-pointer shadow-md bg-teal-500 hover:bg-teal-600 text-slate-950"
              >
                <Printer className="w-4 h-4" /> Export SSR Annexure
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-2">
            <span>Merkle Tree Root: <strong className="text-slate-200">{dossier?.merkleRoot}</strong></span>
            <span>Audited at: {new Date(dossier?.verificationTimestamp).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              activeTab === 'overview'
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Overview & Metrics
          </button>
          <button
            onClick={() => setActiveTab('criterion1')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              activeTab === 'criterion1'
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            NAAC Criterion 1 (Curricular)
          </button>
          <button
            onClick={() => setActiveTab('criterion2')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              activeTab === 'criterion2'
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Criterion 2 (Faculty & Mentorship)
          </button>
          <button
            onClick={() => setActiveTab('criterion5')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              activeTab === 'criterion5'
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Criterion 5 (Student Progression)
          </button>
          <button
            onClick={() => setActiveTab('ssr')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'ssr'
                ? 'bg-purple-50 text-purple-800 border border-purple-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5 text-purple-600" />
            Official SSR Annexure Preview
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 4 Executive Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card p-4 bg-white border border-gray-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400">Placement Transition</span>
                <div className="text-xl font-extrabold text-teal-700">{dossier?.metrics?.placementTransitionRate}</div>
                <p className="text-[11px] text-gray-500">Verified corporate offers</p>
              </div>

              <div className="card p-4 bg-white border border-gray-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400">Total Internship Hours</span>
                <div className="text-xl font-extrabold text-navy-900">{dossier?.metrics?.totalInternshipHoursLogged?.toLocaleString()} hrs</div>
                <p className="text-[11px] text-gray-500">Industry logged & certified</p>
              </div>

              <div className="card p-4 bg-white border border-gray-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400">Active Industry MoUs</span>
                <div className="text-xl font-extrabold text-purple-700">{dossier?.metrics?.activeIndustryMoUs} Bilateral MoUs</div>
                <p className="text-[11px] text-gray-500">NAAC Criterion 1 compliant</p>
              </div>

              <div className="card p-4 bg-white border border-gray-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400">Attestation Index</span>
                <div className="text-xl font-extrabold text-emerald-700">{dossier?.metrics?.averageIndustryAttestationIndex}</div>
                <p className="text-[11px] text-gray-500">Digital credential audit score</p>
              </div>
            </div>

            {/* Active Corporate MoUs Table */}
            <div className="card p-5 bg-white border border-gray-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Building className="w-4 h-4 text-teal-600" /> NAAC Criterion 1 & 5: Active Corporate MoUs & Industry Linkages
                </h3>
                <span className="text-[11px] font-mono text-gray-400">Verified Bi-Lateral Agreements</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Corporate Partner</th>
                      <th className="p-3">Date Executed</th>
                      <th className="p-3">Scope / Focus Area</th>
                      <th className="p-3">Ledger Attestation</th>
                      <th className="p-3 text-right">Active Scholars</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {dossier?.mouPartners?.map((mou: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-3 font-semibold text-gray-900 flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> {mou.company}
                        </td>
                        <td className="p-3 text-gray-600 font-mono">{mou.dateSigned}</td>
                        <td className="p-3 text-gray-700">{mou.focusArea}</td>
                        <td className="p-3 font-mono text-[10px] text-teal-700">{mou.verificationTx || '0x4f...a8'}</td>
                        <td className="p-3 text-right font-bold text-teal-700 font-mono">{mou.activeInterns} interns</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Industry-Faculty Joint Mentorship Logs */}
            <div className="card p-5 bg-white border border-gray-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" /> NBA Criterion 2 & 8: Joint Industry-Faculty Mentorship Records
                </h3>
                <span className="text-[11px] font-mono text-gray-400">Curriculum Delivery Audits</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Faculty In-Charge</th>
                      <th className="p-3">Industry Co-Mentor</th>
                      <th className="p-3">Technical Track</th>
                      <th className="p-3">Students Mentored</th>
                      <th className="p-3 text-right">Logged Hours</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {dossier?.mentorshipRecords?.map((rec: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-3 font-semibold text-gray-900">{rec.faculty}</td>
                        <td className="p-3 text-gray-700">{rec.industryMentor}</td>
                        <td className="p-3 text-gray-600">{rec.domain}</td>
                        <td className="p-3 font-mono font-medium text-purple-700">{rec.studentCount} Scholars</td>
                        <td className="p-3 text-right font-bold text-emerald-700 font-mono">{rec.hours} hrs</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Criterion 1 */}
        {activeTab === 'criterion1' && (
          <div className="card p-6 bg-white border border-gray-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Sub-Criterion 1.1, 1.2, 1.3
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-1">{dossier?.criteriaBreakdown?.criterion1?.title}</h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 block font-bold">Grade Metric</span>
                <span className="text-lg font-extrabold text-teal-700">{dossier?.criteriaBreakdown?.criterion1?.score}</span>
              </div>
            </div>

            <div className="p-4 bg-teal-50/50 border border-teal-200 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-teal-900">Key Audit Evidences & Compliance Points:</h4>
              <ul className="space-y-1.5 text-xs text-teal-800 list-disc list-inside">
                {dossier?.criteriaBreakdown?.criterion1?.highlights?.map((h: string, i: number) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Institutional syllabus restructuring is synced bi-annually via the AICTE Harmonizer diff pipeline. All 4 faculty departments maintain active bilateral MoUs with corporate partners for direct semester-long internship tracks.
            </p>
          </div>
        )}

        {/* Tab 3: Criterion 2 */}
        {activeTab === 'criterion2' && (
          <div className="card p-6 bg-white border border-gray-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  Teaching-Learning & Faculty Immersion
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-1">{dossier?.criteriaBreakdown?.criterion2?.title}</h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 block font-bold">Grade Metric</span>
                <span className="text-lg font-extrabold text-purple-700">{dossier?.criteriaBreakdown?.criterion2?.score}</span>
              </div>
            </div>

            <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-purple-900">Faculty Industry Mentorship Highlights:</h4>
              <ul className="space-y-1.5 text-xs text-purple-800 list-disc list-inside">
                {dossier?.criteriaBreakdown?.criterion2?.highlights?.map((h: string, i: number) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Tab 4: Criterion 5 */}
        {activeTab === 'criterion5' && (
          <div className="card p-6 bg-white border border-gray-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Student Support & Placement Progression
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-1">{dossier?.criteriaBreakdown?.criterion5?.title}</h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 block font-bold">Grade Metric</span>
                <span className="text-lg font-extrabold text-emerald-700">{dossier?.criteriaBreakdown?.criterion5?.score}</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-emerald-900">Placement & Capstone Integrity Highlights:</h4>
              <ul className="space-y-1.5 text-xs text-emerald-800 list-disc list-inside">
                {dossier?.criteriaBreakdown?.criterion5?.highlights?.map((h: string, i: number) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Tab 5: Official SSR Annexure Print Preview */}
        {activeTab === 'ssr' && (
          <div className="card p-8 bg-white border border-gray-300 shadow-md space-y-6 text-xs text-gray-800 print:border-0 print:shadow-none">
            {/* University Letterhead */}
            <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
              <h2 className="text-lg font-extrabold uppercase tracking-wide text-slate-900">{dossier?.institutionName}</h2>
              <p className="text-[11px] text-gray-600">Internal Quality Assurance Cell (IQAC) • Institutional Accreditation Secretariat</p>
              <p className="text-[10px] font-mono text-gray-500">Annexure to NAAC Self-Study Report (SSR) & NBA Tier-1 Self Assessment Report (SAR)</p>
            </div>

            {/* Annexure Details Table */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400">Institutional Ref:</span>
                <p className="font-bold font-mono">{dossier?.ssrAnnexureNo}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400">Academic Assessment Cycle:</span>
                <p className="font-bold">{dossier?.academicCycle}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400">TrustLedger Block Hash:</span>
                <p className="font-mono text-[10px] break-all text-teal-800 font-bold">{dossier?.blockHash}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400">Merkle Attestation Root:</span>
                <p className="font-mono text-[10px] break-all text-purple-800 font-bold">{dossier?.merkleRoot}</p>
              </div>
            </div>

            {/* Verification Affirmation */}
            <div className="space-y-2 text-gray-700 leading-relaxed text-[11px]">
              <p>
                <strong>Affirmation: </strong> It is hereby certified that all data points compiled in this Annexure—including corporate MoUs, student internship verification hours, faculty co-mentorship records, and capstone code anti-plagiarism scores—have been cryptographically verified against the Sovereign TrustLedger.
              </p>
            </div>

            {/* Signature & Seal Block */}
            <div className="pt-8 border-t border-gray-200 grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="h-10 border-b border-gray-400 mb-1"></div>
                <strong className="block text-gray-900">Dr. S. K. Kulkarni</strong>
                <span className="text-[10px] text-gray-500">IQAC Coordinator</span>
              </div>
              <div>
                <div className="h-10 border-b border-gray-400 mb-1"></div>
                <strong className="block text-gray-900">Dr. Priya Sharma</strong>
                <span className="text-[10px] text-gray-500">Dean (Academic Affairs)</span>
              </div>
              <div>
                <div className="h-10 border-b border-gray-400 mb-1"></div>
                <strong className="block text-gray-900">Prof. K. R. Nambiar</strong>
                <span className="text-[10px] text-gray-500">Director / Principal</span>
              </div>
            </div>

            <div className="pt-2 text-center text-[10px] text-gray-400 font-mono">
              Generated via SkillSetu Platform (SIH-2026 Problem ID SIH26044) • Digitally verifiable by NAAC Peer Team
            </div>
          </div>
        )}

      </div>

    </div>
  );
}

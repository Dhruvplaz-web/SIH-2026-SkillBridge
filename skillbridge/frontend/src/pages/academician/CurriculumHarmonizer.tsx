import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileCheck, Sparkles, TrendingUp, AlertTriangle, CheckCircle2, 
  ArrowRight, Download, RefreshCw, BookOpen, Layers, Zap, Clock,
  FileText, ShieldCheck, Printer, Copy, Check, ExternalLink, Award
} from 'lucide-react';
import { Topbar } from '../../components/layout/Topbar';
import { PageLoader } from '../../components/ui/Spinner';
import { Modal } from '../../components/ui/Modal';
import { academicianFeaturesAPI } from '../../services/api';

export default function CurriculumHarmonizer() {
  const [courseTitle, setCourseTitle] = useState('B.Tech Computer Science: Cloud & Distributed Systems (Sem 6)');
  const [domain, setDomain] = useState('Engineering & Technology');
  const [syllabusText, setSyllabusText] = useState(
`Unit I: Introduction to Distributed Computing, RPC architectures, and SOAP XML protocol foundations.
Unit II: Concurrency models, POSIX threads, Intel 8085 microprocessor instruction cycle legacy fundamentals.
Unit III: Client-Server networking, TCP socket programming, manual Apache HTTP server deployment.
Unit IV: Monolithic Web Application Architecture, relational database schema normalization (3NF/BCNF).
Unit V: Legacy Session management and monolithic server failover strategies.`
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // BoS Proposal Modal State
  const [isBoSOpen, setIsBoSOpen] = useState(false);
  const [bosProposal, setBosProposal] = useState<any>(null);
  const [generatingProposal, setGeneratingProposal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await academicianFeaturesAPI.getCurriculumAudits();
      setHistory(res.data.audits || []);
    } catch (err) {
      console.error('Failed to load audit history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunDiff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle || !syllabusText) return;
    setAnalyzing(true);
    try {
      const res = await academicianFeaturesAPI.analyzeCurriculumDiff({
        courseTitle,
        syllabusText,
        domain
      });
      setAuditResult(res.data);
      loadHistory();
    } catch (err) {
      console.error('Curriculum diff failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateBoS = async () => {
    setGeneratingProposal(true);
    try {
      const res = await academicianFeaturesAPI.generateBoSProposal({
        courseTitle,
        domain
      });
      setBosProposal(res.data.proposal);
      setIsBoSOpen(true);
    } catch (err) {
      console.error('Failed to generate BoS proposal:', err);
    } finally {
      setGeneratingProposal(false);
    }
  };

  const handleCopyResolution = () => {
    if (!bosProposal) return;
    const text = `BOARD OF STUDIES (BoS) CURRICULUM AMENDMENT RESOLUTION
Resolution ID: ${bosProposal.resolutionId}
AICTE Model Curriculum Reference: ${bosProposal.aicteCode}
Course Title: ${bosProposal.courseTitle}
Department: ${bosProposal.department}
Meeting Reference: ${bosProposal.meetingRef} | Date: ${bosProposal.meetingDate}
TrustLedger Attestation Hash: ${bosProposal.docHash}

COURSE OUTCOMES (COs):
${bosProposal.courseOutcomes.map((co: any) => `${co.id}: ${co.outcome} [${co.bloomLevel}]`).join('\n')}

UNIT AMENDMENTS:
${bosProposal.unitAmendments.map((u: any) => `${u.unit}: ${u.newTitle}\n  Replaced: ${u.oldTitle}\n  Pruned: ${u.prunedContent}\n  Added: ${u.addedContent}\n  Rationale: ${u.rationale}`).join('\n\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <><Topbar title="Curriculum Harmonizer" /><PageLoader /></>;

  return (
    <div>
      <Topbar 
        title="AI Curriculum Diff Engine & Syllabus Re-Harmonizer" 
        subtitle="Automated AICTE / UGC syllabus alignment comparing course outlines against real-time 6-month corporate hiring demands"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* Action Header Card */}
        <div className="card p-6 bg-gradient-to-r from-navy-900 to-slate-900 text-white border-0 shadow-md">
          <div className="max-w-3xl space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AICTE Model Curriculum Audit Tool
            </span>
            <h2 className="text-lg font-bold text-white">Identify Missing High-Growth Tech & Prune Obsolete Topics</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              University curricula often lag 3–5 years behind enterprise architectures. The Harmonizer engine parses your syllabus 
              against live job postings, highlighting missing containerization/RAG competencies and obsolete legacy frameworks.
            </p>
          </div>
        </div>

        {/* Two-Column Layout: Input Form & Results */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Syllabus Input */}
          <div className="lg:col-span-5 space-y-4">
            <div className="card p-5 bg-white border border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-teal-600" /> Syllabus Ingestion Form
              </h3>

              <form onSubmit={handleRunDiff} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-gray-700 font-bold block mb-1">Course Title & Semester</label>
                  <input
                    type="text"
                    required
                    value={courseTitle}
                    onChange={e => setCourseTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-teal-500"
                  />
                </div>

                <div>
                  <label className="text-gray-700 font-bold block mb-1">Academic & Industrial Domain</label>
                  <select
                    value={domain}
                    onChange={e => setDomain(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-teal-500 font-medium"
                  >
                    <option>Engineering & Technology</option>
                    <option>Clinical Informatics & Ayush Digital Health</option>
                    <option>Semiconductor VLSI & Embedded Systems</option>
                    <option>Data Science, Cloud & Edge AI</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-700 font-bold block mb-1">Existing Course Syllabus Text</label>
                  <textarea
                    rows={8}
                    required
                    value={syllabusText}
                    onChange={e => setSyllabusText(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 font-mono text-[11px] leading-relaxed focus:outline-teal-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={analyzing}
                  className="btn-primary w-full py-2.5 font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm text-xs"
                >
                  {analyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {analyzing ? 'Diffing with Live Job Market...' : 'Run Harmonizer Diff Audit'}
                </button>
              </form>
            </div>

            {/* Audit History */}
            {history.length > 0 && (
              <div className="card p-4 bg-white border border-gray-200 space-y-3">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Recent Curriculum Audits</span>
                  <span className="text-teal-600 font-mono">{history.length} saved</span>
                </h4>
                <div className="space-y-2">
                  {history.slice(0, 3).map(h => (
                    <div key={h.id} className="p-2.5 rounded-lg border border-gray-100 bg-slate-50 text-xs">
                      <div className="flex items-center justify-between font-bold text-gray-800">
                        <span className="truncate pr-2">{h.course_title}</span>
                        <span className="text-[10px] text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded font-mono">
                          {h.industry_match_pct}% Match
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">{h.recommendations}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Comparative Diff Visualizer */}
          <div className="lg:col-span-7 space-y-4">
            
            {auditResult ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                {/* Alignment Score Banner */}
                <div className="card p-5 bg-white border border-gray-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400">Market Alignment Score</span>
                    <h3 className="text-xl font-extrabold text-gray-900 mt-0.5">
                      {auditResult.industryMatchPct}% Syllabus Harmonization
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {auditResult.industryMatchPct >= 75 ? 'Strong alignment with current cloud engineering roles.' : 'Deficit detected: modern cloud & automation topics missing.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleGenerateBoS}
                      disabled={generatingProposal}
                      className="px-3.5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {generatingProposal ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                      <span>{generatingProposal ? 'Compiling Resolution...' : 'Draft BoS Resolution'}</span>
                    </button>
                    <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-extrabold text-base">
                      {auditResult.industryMatchPct}%
                    </div>
                  </div>
                </div>

                {/* Dual Column Diff */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Missing Industry Skills */}
                  <div className="card p-4 bg-emerald-50/50 border border-emerald-200/80 space-y-3">
                    <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-600" /> Missing Industry Skills (+Add)
                    </h4>
                    <div className="space-y-2">
                      {auditResult.missingSkills?.map((ms: any, idx: number) => (
                        <div key={idx} className="bg-white p-2.5 rounded-lg border border-emerald-200 text-xs shadow-2xs">
                          <div className="flex items-center justify-between font-bold text-gray-900">
                            <span>{ms.name}</span>
                            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                              {ms.demandGrowth}
                            </span>
                          </div>
                          <span className="text-[10px] uppercase font-bold text-teal-700 block mt-1">
                            Impact: {ms.importance}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Outdated Obsolete Topics */}
                  <div className="card p-4 bg-amber-50/50 border border-amber-200/80 space-y-3">
                    <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" /> Outdated Topics (&minus;Prune)
                    </h4>
                    <div className="space-y-2">
                      {auditResult.outdatedTopics?.map((ot: any, idx: number) => (
                        <div key={idx} className="bg-white p-2.5 rounded-lg border border-amber-200 text-xs shadow-2xs">
                          <strong className="text-gray-900 block font-semibold">{ot.name}</strong>
                          <p className="text-[11px] text-gray-600 mt-1 italic leading-tight">
                            &rarr; {ot.recommendation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Recommendations Card */}
                <div className="card p-5 bg-white border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-teal-600" /> Faculty Board of Studies Recommendations
                    </h4>
                    <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      NEP 2020 Aligned
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {auditResult.recommendations}
                  </p>
                </div>

              </motion.div>
            ) : (
              <div className="card p-12 text-center text-gray-400 bg-white border border-gray-200">
                <FileCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <h4 className="text-sm font-bold text-gray-700">No Active Syllabus Diff</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  Paste your syllabus and click "Run Harmonizer Diff Audit" to generate real-time comparison tables.
                </p>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Official Board of Studies (BoS) Curriculum Amendment Resolution Modal */}
      <Modal
        open={isBoSOpen}
        onClose={() => setIsBoSOpen(false)}
        title="Official Board of Studies (BoS) Curriculum Amendment Proposal"
        size="xl"
      >
        {bosProposal && (
          <div className="space-y-6 text-xs text-gray-800">
            {/* Resolution Header */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded border border-teal-300">
                      {bosProposal.resolutionId}
                    </span>
                    <span className="font-mono text-[10px] text-gray-500">
                      Ref: {bosProposal.meetingRef}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mt-1">{bosProposal.courseTitle}</h3>
                  <p className="text-xs text-gray-600">{bosProposal.department} • Academic Year {bosProposal.academicCycle}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">AICTE Model Ref</span>
                  <span className="text-xs font-mono font-bold text-navy-900">{bosProposal.aicteCode}</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-center font-mono">
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-[10px] text-gray-400 block">Lectures (L)</span>
                  <span className="font-bold text-gray-800">{bosProposal.creditDistribution?.lectures} hrs/wk</span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-[10px] text-gray-400 block">Tutorials (T)</span>
                  <span className="font-bold text-gray-800">{bosProposal.creditDistribution?.tutorials} hrs/wk</span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-[10px] text-gray-400 block">Practicals (P)</span>
                  <span className="font-bold text-gray-800">{bosProposal.creditDistribution?.practicals} hrs/wk</span>
                </div>
                <div className="bg-teal-50 p-2 rounded border border-teal-200">
                  <span className="text-[10px] text-teal-600 block">Total Credits</span>
                  <span className="font-bold text-teal-800">{bosProposal.creditDistribution?.totalCredits} Credits</span>
                </div>
              </div>
            </div>

            {/* Course Outcomes (COs) Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-teal-600" /> Revised Course Outcomes (CO1 – CO5) & Bloom's Taxonomy
              </h4>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-gray-700 font-bold border-b border-gray-200">
                    <tr>
                      <th className="p-2.5 w-16">CO ID</th>
                      <th className="p-2.5">Course Outcome Statement</th>
                      <th className="p-2.5 w-44 text-right">Bloom's Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bosProposal.courseOutcomes?.map((co: any) => (
                      <tr key={co.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold font-mono text-teal-700">{co.id}</td>
                        <td className="p-2.5 text-gray-800">{co.outcome}</td>
                        <td className="p-2.5 text-right font-medium">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                            {co.bloomLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Unit-by-Unit Exact Amendments */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-600" /> Unit-by-Unit Syllabus Restructuring Schedule
              </h4>
              <div className="space-y-2.5">
                {bosProposal.unitAmendments?.map((u: any, idx: number) => (
                  <div key={idx} className="p-3 bg-white border border-gray-200 rounded-xl space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 flex items-center gap-2">
                        <span className="font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">{u.unit}</span>
                        {u.newTitle}
                      </span>
                      <span className="text-[10px] text-gray-400 line-through">Replaces: {u.oldTitle}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 bg-rose-50 border border-rose-200 rounded text-rose-900">
                        <span className="font-bold block text-[10px] uppercase text-rose-700">&minus; Pruned Legacy Topics</span>
                        {u.prunedContent}
                      </div>
                      <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-900">
                        <span className="font-bold block text-[10px] uppercase text-emerald-700">+ Added Modern Industry Topics</span>
                        {u.addedContent}
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-500 italic">
                      <strong className="text-gray-700 not-italic">Justification: </strong>{u.rationale}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Practical Laboratory Curriculum */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-600" /> Mandatory Hands-On Laboratory Exercises (2 Practicals/wk)
              </h4>
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-slate-50 p-3 space-y-2">
                {bosProposal.practicalLabCurriculum?.map((exp: any) => (
                  <div key={exp.expNo} className="flex items-center gap-3 bg-white p-2 rounded border border-gray-200">
                    <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold font-mono text-[11px] flex items-center justify-center shrink-0">
                      {exp.expNo}
                    </span>
                    <span className="text-gray-800 font-medium">{exp.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Attestation Block & Signatures */}
            <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span className="flex items-center gap-1.5 text-teal-300 font-mono font-bold">
                  <ShieldCheck className="w-4 h-4 text-teal-400" /> TrustLedger Cryptographic Audit Seal
                </span>
                <span className="font-mono text-[10px] truncate max-w-xs">{bosProposal.docHash}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-800 text-center">
                <div className="p-2 border border-dashed border-slate-700 rounded">
                  <p className="text-[10px] text-slate-400 mb-2">Verified & Recommended by</p>
                  <strong className="block text-slate-200">Dr. Priya Sharma</strong>
                  <span className="text-[10px] text-slate-400">Head of Department (CSE)</span>
                </div>
                <div className="p-2 border border-dashed border-slate-700 rounded">
                  <p className="text-[10px] text-slate-400 mb-2">Approved by Academic Council</p>
                  <strong className="block text-slate-200">Prof. K. R. Nambiar</strong>
                  <span className="text-[10px] text-slate-400">Dean, Faculty of Engineering</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <button
                onClick={handleCopyResolution}
                className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-2 cursor-pointer font-bold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied Resolution to Clipboard!' : 'Copy Formal Text'}
              </button>

              <button
                onClick={() => window.print()}
                className="btn-primary text-xs flex items-center gap-1.5 px-4 py-2 cursor-pointer font-bold shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" /> Print / Export Official PDF
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

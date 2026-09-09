import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileCheck, Sparkles, TrendingUp, AlertTriangle, CheckCircle2, 
  ArrowRight, Download, RefreshCw, BookOpen, Layers, Zap, Clock
} from 'lucide-react';
import { Topbar } from '../../components/layout/Topbar';
import { PageLoader } from '../../components/ui/Spinner';
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

                  <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-extrabold text-base">
                    {auditResult.industryMatchPct}%
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
                  <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" /> Faculty Board of Studies Recommendations
                  </h4>
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

    </div>
  );
}

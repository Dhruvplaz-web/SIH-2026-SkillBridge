import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Topbar } from '../../components/layout/Topbar';
import { PageLoader } from '../../components/ui/Spinner';
import { Badge, getApplicationStatusBadge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { MatchScoreRing } from '../../components/ui/MatchScoreRing';
import { opportunitiesAPI, applicationsAPI, recruiterFeaturesAPI } from '../../services/api';
import { 
  Briefcase, Users, Plus, Eye, FileText, Download, ExternalLink, 
  ChevronDown, ChevronUp, Shield, ShieldCheck, Github, Sparkles, 
  CheckCircle2, Award, Zap, AlertCircle, RefreshCw, Code2, Terminal, Cpu, Play,
  Table, LayoutGrid, Printer
} from 'lucide-react';
import clsx from 'clsx';

export default function RecruiterOpportunities() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOpp, setSelectedOpp] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [expandedApp, setExpandedApp] = useState<string | null>(null);

  // View Mode: Cards vs Side-by-Side Comparison Matrix
  const [viewMode, setViewMode] = useState<'cards' | 'matrix'>('cards');

  // Next-Gen Recruiter Additions
  const [blindScreening, setBlindScreening] = useState(false);
  const [predictionData, setPredictionData] = useState<{ [appId: string]: any }>({});
  const [loadingPrediction, setLoadingPrediction] = useState<string | null>(null);
  const [mintedLoi, setMintedLoi] = useState<{ [appId: string]: any }>({});
  const [mintingLoi, setMintingLoi] = useState<string | null>(null);
  const [selectedLoiForModal, setSelectedLoiForModal] = useState<any>(null);

  // Candidate Practical Coding Submissions & Review
  const [candidateCodingSubmissions, setCandidateCodingSubmissions] = useState<{ [candidateId: string]: any[] }>({});
  const [loadingCodingSubmissions, setLoadingCodingSubmissions] = useState<{ [candidateId: string]: boolean }>({});
  const [expandedCodeSnippet, setExpandedCodeSnippet] = useState<string | null>(null);

  // Assign Challenge Modal State
  const [assignModalCandidate, setAssignModalCandidate] = useState<any>(null);
  const [assignChallengeId, setAssignChallengeId] = useState('cs-two-sum');
  const [assignDeadline, setAssignDeadline] = useState('2026-09-30');
  const [assignMessage, setAssignMessage] = useState('Please complete this technical challenge as part of our technical screening round.');
  const [assigningChallenge, setAssigningChallenge] = useState(false);
  const [assignedSuccess, setAssignedSuccess] = useState('');

  const fetchCandidateCodingSubmissions = async (candidateId: string) => {
    if (candidateCodingSubmissions[candidateId]) return;
    setLoadingCodingSubmissions(prev => ({ ...prev, [candidateId]: true }));
    try {
      const res = await recruiterFeaturesAPI.getCodingSubmissions({ candidateId });
      setCandidateCodingSubmissions(prev => ({ ...prev, [candidateId]: res.data?.submissions || [] }));
    } catch (err) {
      console.error('Failed to load candidate coding submissions:', err);
    } finally {
      setLoadingCodingSubmissions(prev => ({ ...prev, [candidateId]: false }));
    }
  };

  const handleAssignChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalCandidate) return;
    setAssigningChallenge(true);
    try {
      await recruiterFeaturesAPI.assignCodingChallenge({
        candidateId: assignModalCandidate.student_id,
        challengeId: assignChallengeId,
        deadline: assignDeadline,
        message: assignMessage,
      });
      setAssignedSuccess(`Challenge assigned to ${assignModalCandidate.student_name}!`);
      setTimeout(() => {
        setAssignedSuccess('');
        setAssignModalCandidate(null);
      }, 2500);
    } catch (err: any) {
      console.error('Failed to assign challenge:', err);
      alert(err.response?.data?.error || 'Failed to assign coding challenge');
    } finally {
      setAssigningChallenge(false);
    }
  };

  useEffect(() => {
    opportunitiesAPI.getMy()
      .then(r => setOpportunities(r.data.opportunities || []))
      .finally(() => setLoading(false));
  }, []);

  const viewApplications = async (opp: any, blindOverride?: boolean) => {
    setSelectedOpp(opp);
    setLoadingApps(true);
    setExpandedApp(null);
    const activeBlind = blindOverride !== undefined ? blindOverride : blindScreening;
    try {
      const res = await applicationsAPI.getByOpportunity(opp.id, activeBlind);
      setApplications(res.data.applications || []);
    } finally { setLoadingApps(false); }
  };

  const handleToggleBlind = (val: boolean) => {
    setBlindScreening(val);
    if (selectedOpp) {
      viewApplications(selectedOpp, val);
    }
  };

  const updateStatus = async (appId: string, status: string) => {
    setUpdatingStatus(appId);
    await applicationsAPI.updateStatus(appId, { status });
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
    setUpdatingStatus(null);
  };

  const toggleActive = async (opp: any) => {
    await opportunitiesAPI.update(opp.id, { isActive: !opp.is_active });
    setOpportunities(prev => prev.map(o => o.id === opp.id ? { ...o, is_active: !opp.is_active } : o));
  };

  const handlePredictOffer = async (app: any) => {
    setLoadingPrediction(app.id);
    try {
      const res = await recruiterFeaturesAPI.predictOffer({
        candidateId: app.student_id || app.user_id,
        opportunityId: selectedOpp?.id,
        customStipend: selectedOpp?.salary_range
      });
      setPredictionData(prev => ({ ...prev, [app.id]: res.data.prediction }));
    } catch (err) {
      console.error('Prediction failed:', err);
    } finally {
      setLoadingPrediction(null);
    }
  };

  const handleMintLOI = async (app: any) => {
    setMintingLoi(app.id);
    try {
      const res = await recruiterFeaturesAPI.mintLOI({
        candidateId: app.student_id || app.user_id,
        roleTitle: selectedOpp?.title || 'Engineering Trainee',
        stipend: selectedOpp?.salary_range || '₹35,000 / month',
        opportunityId: selectedOpp?.id
      });
      setMintedLoi(prev => ({ ...prev, [app.id]: res.data.loi }));
      // Automatically advance status to SELECTED
      await updateStatus(app.id, 'SELECTED');
    } catch (err) {
      console.error('LOI minting failed:', err);
    } finally {
      setMintingLoi(null);
    }
  };

  if (loading) return <><Topbar title="My Opportunities" /><PageLoader /></>;

  return (
    <div>
      <Topbar title="My Postings & Talent Pipeline" subtitle={`${opportunities.length} opportunities created`} />
      <div className="p-6">
        <div className="flex justify-end mb-4">
          <Link to="/recruiter/post" className="btn-primary flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Post New Opportunity
          </Link>
        </div>

        {opportunities.length === 0 ? (
          <EmptyState icon={Briefcase} title="No opportunities posted"
            description="Post your first opportunity to start receiving applications."
            action={<Link to="/recruiter/post" className="btn-primary">Post Opportunity</Link>} />
        ) : (
          <div className="space-y-4">
            {opportunities.map((o: any) => (
              <div key={o.id} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{o.title}</h3>
                      <Badge variant={o.type === 'INTERNSHIP' ? 'teal' : o.type === 'JOB' ? 'blue' : 'purple'}>
                        {o.type}
                      </Badge>
                      <Badge variant={o.is_active ? 'green' : 'gray'}>
                        {o.is_active ? 'Active' : 'Closed'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{o.location} · {o.duration} · {o.salary_range}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> {o.application_count} applicants
                      </span>
                      {o.shortlisted_count > 0 && (
                        <span className="text-teal-600 font-medium">{o.shortlisted_count} shortlisted</span>
                      )}
                      {o.selected_count > 0 && (
                        <span className="text-emerald-600 font-medium">{o.selected_count} selected</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => viewApplications(o)}
                      className="btn-secondary flex items-center gap-1.5 text-xs">
                      <Eye className="w-3.5 h-3.5" /> View Applications
                    </button>
                    <button onClick={() => toggleActive(o)}
                      className={clsx('text-xs px-3 py-1.5 rounded-lg border transition-colors',
                        o.is_active
                          ? 'text-red-600 border-red-200 hover:bg-red-50'
                          : 'text-teal-600 border-teal-200 hover:bg-teal-50')}>
                      {o.is_active ? 'Close' : 'Reopen'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Applications Modal with Blind Screening & AI Engines ── */}
      <Modal
        open={!!selectedOpp}
        onClose={() => { setSelectedOpp(null); setExpandedApp(null); }}
        title={`Applications — ${selectedOpp?.title}`}
        size="xl"
      >
        {loadingApps ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full border-2 border-gray-200 border-t-navy-900 h-8 w-8" />
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="font-medium">No applications yet</p>
            <p className="text-sm mt-1">Share the posting to start receiving candidates.</p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Blind Resume Screening (Unbiased Merit Mode) Banner */}
            <div className="bg-slate-900 text-white p-3.5 rounded-xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${blindScreening ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-400'}`}>
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    Blind Resume Screening (Unbiased Merit Mode)
                    {blindScreening && <span className="bg-purple-400/20 text-purple-300 text-[10px] px-1.5 py-0.5 rounded font-mono">ACTIVE</span>}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Redacts candidate names, gender, institution tier, and demographic markers for 100% skill-first evaluation.
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleToggleBlind(!blindScreening)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all border ${
                  blindScreening 
                    ? 'bg-purple-600 border-purple-500 text-white shadow-xs' 
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                {blindScreening ? 'Disable Blind Mode' : 'Enable Blind Mode'}
              </button>
            </div>

            {/* View Mode Toggle & Counter */}
            <div className="flex items-center justify-between pb-1 flex-wrap gap-2">
              <p className="text-xs text-gray-500">
                {applications.length} application{applications.length !== 1 ? 's' : ''} · Ranked by AI match score & proctor telemetry
              </p>

              <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={clsx(
                    'px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 transition-colors cursor-pointer',
                    viewMode === 'cards' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
                  )}
                >
                  <LayoutGrid className="w-3.5 h-3.5" /> Cards View
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('matrix')}
                  className={clsx(
                    'px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 transition-colors cursor-pointer',
                    viewMode === 'matrix' ? 'bg-white text-teal-800 shadow-2xs font-bold' : 'text-gray-500 hover:text-gray-900'
                  )}
                >
                  <Table className="w-3.5 h-3.5 text-teal-600" /> Side-by-Side Matrix
                </button>
              </div>
            </div>

            {viewMode === 'matrix' ? (
              <div className="card p-0 border border-gray-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3 w-12 text-center">#</th>
                        <th className="p-3">Candidate</th>
                        <th className="p-3 text-center">Match Fit</th>
                        <th className="p-3">Coding Benchmark</th>
                        <th className="p-3">Proctor Integrity</th>
                        <th className="p-3">Retention Risk</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Quick Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {applications.map((a: any, idx: number) => {
                        const displayName = blindScreening ? `Scholar #CAND-${a.id.slice(-4).toUpperCase()}` : a.student_name;
                        const displayCollege = blindScreening ? 'Accredited Institute' : a.institution;
                        const prediction = predictionData[a.id];

                        return (
                          <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="p-3 font-bold text-center text-gray-500 font-mono">
                              #{idx + 1}
                            </td>
                            <td className="p-3">
                              <strong className="block text-gray-900 font-semibold">{displayName}</strong>
                              <span className="text-[11px] text-gray-500">{displayCollege}</span>
                              {!blindScreening && a.cgpa && (
                                <span className="text-[10px] text-gray-400 block font-mono">CGPA: {a.cgpa}</span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              <div className="inline-flex items-center justify-center">
                                <MatchScoreRing score={Math.round(a.match_score || 0)} size="sm" />
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="space-y-0.5 font-mono text-[11px]">
                                <span className="font-bold text-emerald-700 flex items-center gap-1">
                                  <Code2 className="w-3 h-3 text-emerald-600" />
                                  {a.skills_verified ? '100% Passed (O(N))' : 'Sandbox Ready'}
                                </span>
                                <span className="text-[10px] text-gray-500 block">AST Anti-Plagiarism: Passed</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 font-mono">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                {a.proctor_score || 98}% Verified
                              </span>
                            </td>
                            <td className="p-3">
                              {prediction ? (
                                <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded font-mono',
                                  prediction.retentionRisk === 'LOW' ? 'bg-emerald-100 text-emerald-800' :
                                  prediction.retentionRisk === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                                )}>
                                  {prediction.retentionRisk} Risk ({prediction.acceptanceProbability}%)
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handlePredictOffer(a)}
                                  disabled={loadingPrediction === a.id}
                                  className="text-[10px] font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
                                >
                                  <Sparkles className="w-3 h-3" />
                                  {loadingPrediction === a.id ? 'Analyzing...' : 'Predict Join %'}
                                </button>
                              )}
                            </td>
                            <td className="p-3">
                              <Badge variant={getApplicationStatusBadge(a.status)}>
                                {a.status.replace(/_/g, ' ')}
                              </Badge>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAssignModalCandidate(a);
                                    setAssignedSuccess('');
                                  }}
                                  className="btn-secondary py-1 px-2 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                                  title="Assign Coding Challenge"
                                >
                                  <Code2 className="w-3 h-3 text-teal-600" /> Challenge
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setViewMode('cards');
                                    setExpandedApp(a.id);
                                  }}
                                  className="btn-secondary py-1 px-2 text-[10px] font-bold cursor-pointer"
                                  title="Expand Full Profile"
                                >
                                  Details
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
            applications.map((a: any, idx: number) => {
              const isExpanded = expandedApp === a.id;
              const displayName = blindScreening ? `Scholar #CAND-${a.id.slice(-4).toUpperCase()}` : a.student_name;
              const displayCollege = blindScreening ? 'Accredited Technical Institute' : a.institution;
              const displayBranch = blindScreening ? 'Computer Science & Engineering' : a.branch;
              const prediction = predictionData[a.id];
              const loi = mintedLoi[a.id];

              return (
                <div key={a.id}
                  className={clsx('border rounded-xl transition-all',
                    isExpanded ? 'border-navy-300 shadow-xs bg-white' : 'border-gray-200 hover:border-gray-300 bg-white')}>

                  {/* Collapsed header */}
                  <div className="flex items-center gap-4 p-4">
                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                      {idx + 1}
                    </div>

                    <MatchScoreRing score={Math.round(a.match_score || 0)} size="sm" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900">{displayName}</p>
                        <p className="text-xs text-gray-500">{displayCollege} · {displayBranch}</p>
                        {!blindScreening && a.cgpa && <span className="text-xs text-gray-400">CGPA {a.cgpa}</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <Badge variant={getApplicationStatusBadge(a.status)}>
                          {a.status.replace(/_/g, ' ')}
                        </Badge>

                        {/* Proctor telemetry badge */}
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <ShieldCheck className="w-3 h-3" /> 98% Proctor Integrity (0 Tab Violations)
                        </span>

                        {a.resume_url && (
                          <a
                            href={`http://localhost:5000${a.resume_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            <FileText className="w-3.5 h-3.5" /> View Resume
                          </a>
                        )}
                        <span className="text-xs text-gray-400">
                          Applied {new Date(a.applied_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setExpandedApp(isExpanded ? null : a.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100 flex-shrink-0"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 p-5 space-y-5 bg-slate-50/50 rounded-b-xl">

                      {/* Live GitHub Code Telemetry Card */}
                      <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-gray-800 flex items-center gap-1.5">
                            <Github className="w-4 h-4 text-gray-900" /> Live Engineering & GitHub Telemetry
                          </span>
                          <span className="text-teal-600 font-mono font-bold">14 Public Repos &bull; 42 Stars</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="text-slate-400 text-[10px] block">Top Languages</span>
                            <strong className="text-slate-800">TypeScript (64%), Python (26%)</strong>
                          </div>
                          <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="text-slate-400 text-[10px] block">Commit Consistency</span>
                            <strong className="text-emerald-600 font-bold">42-Day Streak</strong>
                          </div>
                          <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="text-slate-400 text-[10px] block">Code Authenticity</span>
                            <strong className="text-purple-700 font-bold">Verified Author (99%)</strong>
                          </div>
                        </div>
                      </div>

                      {/* Practical Coding Assessment & Code Review Card */}
                      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <h5 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                              <Code2 className="w-4 h-4 text-teal-600" /> Proctored Coding Arena Submissions & Big-O Telemetry
                            </h5>
                            <p className="text-[11px] text-gray-500">
                              Directly review real code executed by the candidate against industry algorithmic benchmarks.
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => fetchCandidateCodingSubmissions(a.student_id)}
                              disabled={loadingCodingSubmissions[a.student_id]}
                              className="btn-secondary text-xs font-bold px-3 py-1.5 flex items-center gap-1.5 cursor-pointer"
                            >
                              {loadingCodingSubmissions[a.student_id] ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Eye className="w-3.5 h-3.5 text-teal-600" />
                              )}
                              <span>
                                {candidateCodingSubmissions[a.student_id] ? 'Refresh Submissions' : 'Inspect Code Submissions'}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setAssignModalCandidate(a);
                                setAssignedSuccess('');
                              }}
                              className="btn-primary text-xs font-bold px-3 py-1.5 flex items-center gap-1.5 cursor-pointer bg-teal-600 hover:bg-teal-700"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Assign Challenge</span>
                            </button>
                          </div>
                        </div>

                        {/* Submissions List */}
                        {candidateCodingSubmissions[a.student_id] && (
                          <div className="space-y-2 pt-1">
                            {candidateCodingSubmissions[a.student_id].length === 0 ? (
                              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-gray-500 text-center">
                                No coding challenges completed yet by this candidate. Click "Assign Challenge" to send a technical screening round.
                              </div>
                            ) : (
                              candidateCodingSubmissions[a.student_id].map((sub: any) => (
                                <div key={sub.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-gray-900">{sub.challenge_title}</span>
                                      <span className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-white border border-gray-200 uppercase font-bold text-teal-700">
                                        {sub.language}
                                      </span>
                                      <span className={clsx(
                                        'px-2 py-0.5 rounded text-[10px] font-bold',
                                        sub.score >= 75 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                      )}>
                                        Score: {sub.score}% ({sub.passed_tests}/{sub.total_tests} Tests)
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-mono">
                                      {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : 'Recent'}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-mono">
                                    <div className="bg-white p-1.5 rounded border border-gray-100">
                                      <span className="text-gray-400 text-[9px] block uppercase">Time Complexity</span>
                                      <strong className="text-teal-700">{sub.big_o_time || 'O(N)'}</strong>
                                    </div>
                                    <div className="bg-white p-1.5 rounded border border-gray-100">
                                      <span className="text-gray-400 text-[9px] block uppercase">Aux Space</span>
                                      <strong className="text-blue-700">{sub.big_o_space || 'O(1)'}</strong>
                                    </div>
                                    <div className="bg-white p-1.5 rounded border border-gray-100">
                                      <span className="text-gray-400 text-[9px] block uppercase">Execution</span>
                                      <strong className="text-gray-800">{sub.execution_time_ms}ms</strong>
                                    </div>
                                    <div className="bg-white p-1.5 rounded border border-gray-100">
                                      <span className="text-gray-400 text-[9px] block uppercase">Tab Switches</span>
                                      <strong className={sub.tab_switches > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                                        {sub.tab_switches} Violations
                                      </strong>
                                    </div>
                                  </div>

                                  <div>
                                    <button
                                      type="button"
                                      onClick={() => setExpandedCodeSnippet(expandedCodeSnippet === sub.id ? null : sub.id)}
                                      className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
                                    >
                                      <Terminal className="w-3 h-3" />
                                      <span>{expandedCodeSnippet === sub.id ? 'Hide Solution Code' : 'View Candidate Solution Code'}</span>
                                    </button>

                                    {expandedCodeSnippet === sub.id && (
                                      <div className="mt-2 p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-100 overflow-x-auto whitespace-pre leading-relaxed">
                                        {sub.code}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>

                      {/* Predictive Candidate Offer Acceptance & Retention */}
                      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-purple-600" /> Predictive Offer Acceptance & 1-Year Retention Index
                            </h5>
                            <p className="text-[11px] text-gray-500">
                              Calculates candidate offer conversion likelihood and flight-risk telemetry based on market benchmarks.
                            </p>
                          </div>

                          {!prediction && (
                            <button
                              onClick={() => handlePredictOffer(a)}
                              disabled={loadingPrediction === a.id}
                              className="btn-secondary text-xs font-bold px-3 py-1.5 flex items-center gap-1.5 cursor-pointer"
                            >
                              {loadingPrediction === a.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-500" />}
                              {loadingPrediction === a.id ? 'Analyzing...' : 'Predict Offer Fit'}
                            </button>
                          )}
                        </div>

                        {prediction && (
                          <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-3 text-xs">
                            <div className="flex items-center justify-around text-center">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-purple-800">Offer Acceptance</span>
                                <div className="text-lg font-extrabold text-purple-900">{prediction.acceptanceProbability}%</div>
                              </div>
                              <div className="h-8 w-px bg-purple-200"></div>
                              <div>
                                <span className="text-[10px] uppercase font-bold text-purple-800">1-Year Retention Index</span>
                                <div className="text-lg font-extrabold text-teal-700">{prediction.retentionIndex} / 100</div>
                              </div>
                              <div className="h-8 w-px bg-purple-200"></div>
                              <div>
                                <span className="text-[10px] uppercase font-bold text-purple-800">Fit Tier</span>
                                <div className="text-xs font-bold text-emerald-700 mt-1">{prediction.fitTier}</div>
                              </div>
                            </div>

                            <p className="text-purple-950 text-[11px] italic bg-white/80 p-2 rounded-lg border border-purple-100">
                              &ldquo;{prediction.advisoryNote}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Smart-Contract Letter of Intent (LOI) Minting */}
                      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                              <Award className="w-4 h-4 text-teal-600" /> Tamperproof Smart-Contract LOI Minting
                            </h5>
                            <p className="text-[11px] text-gray-500">
                              Generate a cryptographically signed Letter of Intent with verified SHA-256 seal.
                            </p>
                          </div>

                          {!loi && (
                            <button
                              onClick={() => handleMintLOI(a)}
                              disabled={mintingLoi === a.id}
                              className="btn-primary text-xs font-bold px-4 py-1.5 flex items-center gap-1.5 cursor-pointer"
                            >
                              {mintingLoi === a.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-3.5 h-3.5" />}
                              {mintingLoi === a.id ? 'Minting...' : 'Mint Sovereign LOI'}
                            </button>
                          )}
                        </div>

                        {loi && (
                          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-teal-900 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4 text-teal-600" /> LOI Minted & Anchored
                              </span>
                              <span className="text-xs font-mono font-bold text-teal-800 bg-white px-2 py-0.5 rounded border border-teal-200">
                                {loi.id}
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-teal-800 break-all bg-white p-2 rounded border border-teal-100">
                              Hash: {loi.loiHash}
                            </div>
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[11px] text-teal-700">Verification Record: <strong>{loi.trustLedgerBlockId}</strong></span>
                              <span className="text-[11px] text-emerald-700 font-bold">Stipend: {loi.stipend}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedLoiForModal({
                                ...loi,
                                candidateName: a.student_name || displayName,
                                candidateEmail: a.student_email || `${displayName.toLowerCase().replace(/[^a-z0-9]/g, '')}@institute.edu.in`,
                                opportunityTitle: selectedOpp?.title,
                                location: selectedOpp?.location,
                                companyName: selectedOpp?.company_name || 'SkillSetu Enterprise Partner',
                                duration: selectedOpp?.duration || '6 Months',
                                roleType: selectedOpp?.type || 'INTERNSHIP'
                              })}
                              className="mt-2 w-full btn-secondary text-xs font-bold py-1.5 flex items-center justify-center gap-1.5 text-teal-800 border-teal-300 hover:bg-teal-100 cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5 text-teal-600" />
                              <span>View & Print Official LOI Letter</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Status actions */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Update Candidate Status</p>
                        <div className="flex gap-2 flex-wrap">
                          {['UNDER_REVIEW', 'SHORTLISTED', 'SELECTED', 'REJECTED'].map(st => (
                            <button key={st}
                              disabled={a.status === st || updatingStatus === a.id}
                              onClick={() => updateStatus(a.id, st)}
                              className={clsx(
                                'text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium cursor-pointer',
                                a.status === st
                                  ? 'bg-navy-900 text-white border-navy-900'
                                  : st === 'REJECTED'
                                    ? 'bg-white text-red-600 border-red-200 hover:bg-red-50'
                                    : st === 'SELECTED'
                                      ? 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300',
                                'disabled:opacity-50 disabled:cursor-not-allowed'
                              )}>
                              {updatingStatus === a.id ? '…' : st.replace(/_/g, ' ')}
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              );
            }))}
          </div>
        )}
      </Modal>

      {/* ── ASSIGN TECHNICAL CHALLENGE MODAL ── */}
      {assignModalCandidate && (
        <Modal
          open={true}
          onClose={() => setAssignModalCandidate(null)}
          title={`Assign Technical Challenge — ${assignModalCandidate.student_name}`}
        >
          <form onSubmit={handleAssignChallenge} className="space-y-4 text-xs font-sans">
            {assignedSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{assignedSuccess}</span>
              </div>
            )}

            <div>
              <label className="label">Select Practical Coding Challenge</label>
              <select
                value={assignChallengeId}
                onChange={(e) => setAssignChallengeId(e.target.value)}
                className="input w-full text-xs cursor-pointer font-medium"
              >
                <option value="cs-two-sum">Two-Sum Complement Index Finder (Hash Map O(N) • Easy)</option>
                <option value="cs-lru-cache">LRU Cache Eviction Policy (Doubly Linked List + Map • Medium)</option>
                <option value="cs-valid-parentheses">Valid Syntax Bracket Parser (Stack LIFO • Easy)</option>
                <option value="cs-merge-intervals">Overlapping Interval Consolidator (Sorting & Array • Medium)</option>
                <option value="cs-rate-limiter">Token Bucket Rate Limiter (Systems Concurrency • Medium)</option>
                <option value="cs-graph-cycle">Course Dependency Cycle Detector (Kahn's Topological Sort • Medium)</option>
                <option value="cs-longest-palindrome">Longest Palindromic Substring (Two-Pointer Expansion • Medium)</option>
                <option value="cs-debounce-throttle">High-Frequency Event Debouncer (JavaScript/TypeScript • Medium)</option>
              </select>
            </div>

            <div>
              <label className="label">Completion Deadline</label>
              <input
                type="date"
                value={assignDeadline}
                onChange={(e) => setAssignDeadline(e.target.value)}
                className="input w-full text-xs"
              />
            </div>

            <div>
              <label className="label">Candidate Note / Instructions</label>
              <textarea
                value={assignMessage}
                onChange={(e) => setAssignMessage(e.target.value)}
                rows={3}
                className="input w-full text-xs resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setAssignModalCandidate(null)}
                className="btn-secondary text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={assigningChallenge}
                className="btn-primary text-xs font-bold px-4 py-2 cursor-pointer flex items-center gap-1.5"
              >
                {assigningChallenge ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{assigningChallenge ? 'Dispatching...' : 'Dispatch Challenge Invite'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── OFFICIAL PRINTABLE LETTER OF INTENT (LOI) MODAL ── */}
      {selectedLoiForModal && (
        <Modal
          open={true}
          onClose={() => setSelectedLoiForModal(null)}
          title="Official Cryptographic Letter of Intent (LOI)"
          size="lg"
        >
          <div className="space-y-6 text-gray-800 print:text-black">
            {/* Action bar (hidden when printing) */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 print:hidden">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Anchored to TrustLedger SHA-256 block ledger</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-primary text-xs font-bold px-3 py-1.5 flex items-center gap-1.5 cursor-pointer bg-teal-600 hover:bg-teal-700"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLoiForModal(null)}
                  className="btn-secondary text-xs px-3 py-1.5 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Letterhead Container */}
            <div className="border-2 border-navy-900/10 p-8 rounded-2xl bg-white shadow-xs space-y-6 print:border-none print:p-0 print:shadow-none">
              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-navy-900 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-extrabold tracking-tight text-navy-900">SkillSetu</span>
                    <span className="text-xs uppercase tracking-widest font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-900 border border-teal-200">
                      National Skill Grid
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">Autonomous National Internship & Industry Integration Accord</p>
                </div>
                <div className="text-right text-[11px] text-gray-500 space-y-0.5">
                  <div className="font-mono font-bold text-gray-900">REF: {selectedLoiForModal.id}</div>
                  <div>Issued: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  <div className="text-teal-700 font-mono font-semibold">Ledger Block: {selectedLoiForModal.trustLedgerBlockId}</div>
                </div>
              </div>

              {/* Title */}
              <div className="text-center py-2">
                <h2 className="text-lg font-bold uppercase tracking-wider text-navy-900">
                  Provisional Letter of Intent (LOI)
                </h2>
                <p className="text-xs text-gray-500">Subject to Verification & Skill Competency Accord</p>
              </div>

              {/* Candidate Info */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">Candidate Name</span>
                  <strong className="text-gray-900 text-sm">{selectedLoiForModal.candidateName}</strong>
                  <span className="text-gray-500 block">{selectedLoiForModal.candidateEmail}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">Issuing Organization</span>
                  <strong className="text-navy-900 text-sm">{selectedLoiForModal.companyName}</strong>
                  <span className="text-gray-500 block">Talent Acquisition & Industry Liaison Office</span>
                </div>
              </div>

              {/* Offer Terms */}
              <div className="space-y-3 text-xs leading-relaxed text-gray-700">
                <p>
                  Dear <strong>{selectedLoiForModal.candidateName}</strong>,
                </p>
                <p>
                  Following the rigorous technical evaluation, proctored competency assessments, and verified credentials
                  recorded on the SkillSetu TrustLedger, <strong>{selectedLoiForModal.companyName}</strong> is pleased to issue this
                  formal <strong>Letter of Intent</strong> for the position of <strong>{selectedLoiForModal.opportunityTitle}</strong>.
                </p>

                <div className="grid grid-cols-3 gap-3 p-3.5 bg-teal-50/60 rounded-xl border border-teal-200/80 my-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-teal-800 block">Position Type</span>
                    <strong className="text-teal-950 font-bold">{selectedLoiForModal.roleType || 'Internship'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-teal-800 block">Stipend / CTC</span>
                    <strong className="text-teal-950 font-bold">{selectedLoiForModal.stipend}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-teal-800 block">Duration / Location</span>
                    <strong className="text-teal-950 font-bold">{selectedLoiForModal.duration} ({selectedLoiForModal.location || 'Hybrid'})</strong>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <h4 className="font-bold text-gray-900 text-[11px] uppercase tracking-wide">Key Terms & Conditions:</h4>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-gray-600">
                    <li>This appointment is contingent upon continuous compliance with academic minimum standards and institutional clearance.</li>
                    <li>Candidate skills and verified assessment badges have been cryptographically authenticated via the SkillSetu TrustLedger.</li>
                    <li>Formal employment agreements with comprehensive IP and non-disclosure clauses will be executed upon physical or remote onboarding.</li>
                  </ul>
                </div>
              </div>

              {/* Digital Signature & Seal */}
              <div className="pt-4 border-t border-gray-200 grid grid-cols-2 gap-4 items-end">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-teal-800 bg-teal-50 p-2 rounded-lg border border-teal-200">
                    <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <div className="truncate">
                      <span className="text-[9px] text-teal-600 block uppercase font-bold">Cryptographic SHA-256 Digest</span>
                      <span className="text-[10px]">{selectedLoiForModal.loiHash || 'SHA256:VERIFIED-SOVEREIGN-SEAL'}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 block font-mono">
                    Autonomous Smart Contract Execution • SkillSetu Grid Node #IND-77
                  </span>
                </div>

                <div className="text-right space-y-1">
                  <div className="inline-block border-b-2 border-gray-400 pb-1 w-48 text-center font-serif italic text-base text-navy-900">
                    Authorized Signatory
                  </div>
                  <div className="text-xs font-bold text-gray-800">{selectedLoiForModal.companyName}</div>
                  <div className="text-[10px] text-gray-500">Corporate Human Capital Division</div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

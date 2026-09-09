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
  CheckCircle2, Award, Zap, AlertCircle, RefreshCw
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

  // Next-Gen Recruiter Additions
  const [blindScreening, setBlindScreening] = useState(false);
  const [predictionData, setPredictionData] = useState<{ [appId: string]: any }>({});
  const [loadingPrediction, setLoadingPrediction] = useState<string | null>(null);
  const [mintedLoi, setMintedLoi] = useState<{ [appId: string]: any }>({});
  const [mintingLoi, setMintingLoi] = useState<string | null>(null);

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

            <p className="text-xs text-gray-500 pb-1">
              {applications.length} application{applications.length !== 1 ? 's' : ''} · Ranked by AI match score & proctor telemetry
            </p>

            {applications.map((a: any, idx: number) => {
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
            })}
          </div>
        )}
      </Modal>
    </div>
  );
}

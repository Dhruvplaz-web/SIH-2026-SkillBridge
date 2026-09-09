import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Topbar } from '../../components/layout/Topbar';
import { PageLoader } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { MatchScoreRing } from '../../components/ui/MatchScoreRing';
import { recommendationsAPI } from '../../services/api';
import { 
  AlertTriangle, BookOpen, Briefcase, TrendingUp, ChevronRight, 
  Sparkles, CheckCircle2, ArrowRight, Zap, Target, Layers 
} from 'lucide-react';

export default function Recommendations() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'stepper' | 'opportunities' | 'training' | 'gaps'>('stepper');

  useEffect(() => {
    recommendationsAPI.get().then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <><Topbar title="Recommendations" /><PageLoader /></>;

  const tabs = [
    { key: 'stepper', label: 'Milestone Stepper', icon: Target, count: 'Step 2' },
    { key: 'opportunities', label: 'Opportunities', icon: Briefcase, count: data?.opportunities?.length },
    { key: 'training', label: 'Training Paths', icon: BookOpen, count: data?.trainingRecommendations?.length },
    { key: 'gaps', label: 'Skill Gaps', icon: AlertTriangle, count: data?.skillGaps?.length },
  ];

  return (
    <div>
      <Topbar 
        title="AI Career Recommendations & Stepper" 
        subtitle="Predictive skill progression, milestone upskilling steppers, and calibrated role match leaps" 
      />

      <div className="p-6 max-w-6xl mx-auto space-y-6">

        {/* Score Leap Predictor Hero Banner */}
        <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-teal-950 rounded-2xl p-6 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-300 bg-teal-500/20 px-3 py-0.5 rounded-full border border-teal-500/30">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" /> Score Leap Predictor
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Target Milestone: Cloud Orchestration & Microservices
            </h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Completing the next milestone in Docker & Kubernetes will leap your collective match rating from <strong className="text-white">71% &rarr; 85% (+14% leap)</strong>, qualifying you for 6 high-tier openings.
            </p>
          </div>
          <Link 
            to="/student/learning" 
            className="btn-teal text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shadow-md shadow-teal-500/20 cursor-pointer self-start md:self-auto"
          >
            Start Milestone Learning <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {tabs.map(t => (
            <button 
              key={t.key} 
              onClick={() => setTab(t.key as any)}
              className={`card p-4 text-left transition-all cursor-pointer border ${
                tab === t.key 
                  ? 'border-teal-500 bg-teal-50/40 shadow-xs' 
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${tab === t.key ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  <t.icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-gray-900 leading-tight">{t.count || 0}</p>
                  <p className="text-xs text-gray-500 truncate">{t.label}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* ── TAB 1: MILESTONE UPSKILLING STEPPER ── */}
        {tab === 'stepper' && (
          <div className="card p-6 border border-gray-200 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="section-title">Milestone Upskilling Roadmap</h2>
                <p className="text-xs text-gray-500">Autonomous 3-stage competency progression</p>
              </div>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                Track: Distributed Systems
              </span>
            </div>

            {/* Stepper Timeline */}
            <div className="space-y-6 pt-2">
              
              {/* Step 1 (Completed) */}
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border-2 border-emerald-500 flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="w-0.5 h-16 bg-emerald-300 my-1" />
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900">Milestone 1: Backend Architecture Fundamentals</h3>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Completed
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Mastered Python, PostgreSQL indexing, and REST API conventions.</p>
                </div>
              </div>

              {/* Step 2 (Active Current) */}
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center border-2 border-teal-400 flex-shrink-0 animate-pulse">
                    <span className="font-bold text-xs">2</span>
                  </div>
                  <div className="w-0.5 h-16 bg-gray-200 my-1" />
                </div>
                <div className="bg-white p-4.5 rounded-xl border-2 border-teal-500 shadow-sm flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900">Milestone 2: Production Containerization & Cloud</h3>
                    <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-md">
                      Current Focus (+14% Leap)
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Build and orchestrate container clusters with Docker and Kubernetes. Closes your 2 largest market skill gaps.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <Link to="/student/learning" className="btn-teal text-xs py-1 px-3 font-bold">
                      Open Recommended Module &rarr;
                    </Link>
                  </div>
                </div>
              </div>

              {/* Step 3 (Upcoming) */}
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center border-2 border-gray-300 flex-shrink-0">
                  <span className="font-bold text-xs">3</span>
                </div>
                <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 flex-1 opacity-70">
                  <h3 className="text-sm font-bold text-gray-700">Milestone 3: Real-Time Telemetry & Fault Tolerance</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Implement asynchronous Redis queues, circuit breakers, and end-to-end distributed tracing.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── TAB 2: OPPORTUNITIES ── */}
        {tab === 'opportunities' && (
          <div className="space-y-4">
            <h2 className="section-title">Matched Opportunities</h2>
            {(data?.opportunities || []).map((opp: any) => (
              <div key={opp.id} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <MatchScoreRing score={opp.matchScore} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{opp.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{opp.company_name} &bull; {opp.location} &bull; {opp.type}</p>
                      </div>
                      <Badge variant={opp.type === 'INTERNSHIP' ? 'teal' : opp.type === 'JOB' ? 'blue' : 'purple'}>
                        {opp.type}
                      </Badge>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-3 text-xs">
                      {opp.matchingSkills?.length > 0 && (
                        <div>
                          <p className="text-[11px] font-semibold text-gray-500 mb-1">Your matching skills:</p>
                          <div className="flex flex-wrap gap-1">
                            {opp.matchingSkills.slice(0, 4).map((s: any) => (
                              <span key={s.skill_id} className="text-xs px-2.5 py-0.5 bg-teal-50 text-teal-800 rounded-md border border-teal-200">
                                {s.skill_name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {opp.missingSkills?.length > 0 && (
                        <div>
                          <p className="text-[11px] font-semibold text-gray-500 mb-1">Missing skills to leap score:</p>
                          <div className="flex flex-wrap gap-1">
                            {opp.missingSkills.slice(0, 3).map((s: any) => (
                              <span key={s.skill_id} className="text-xs px-2.5 py-0.5 bg-amber-50 text-amber-800 rounded-md border border-amber-200">
                                {s.skill_name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-xs">
                      {opp.stipend && <span className="font-semibold text-gray-700">{opp.stipend}</span>}
                      {opp.duration && <span className="text-gray-500">{opp.duration}</span>}
                      <Link to={`/student/opportunities`} className="ml-auto text-teal-700 font-bold hover:underline flex items-center gap-1">
                        View & 1-Click Apply <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB 3: TRAINING PATHS ── */}
        {tab === 'training' && (
          <div className="space-y-4">
            <h2 className="section-title">Recommended Upskilling Programs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(data?.trainingRecommendations || []).map((t: any) => (
                <div key={t.id} className="card p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1">{t.title}</h3>
                    <p className="text-xs text-gray-500 mb-3">{t.provider} &bull; {t.duration_weeks} weeks</p>
                    <p className="text-xs text-gray-600 line-clamp-2">{t.description}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700">₹0 Verified Grant</span>
                    <Link to="/student/learning" className="btn-primary text-xs py-1 px-3">
                      Start Course
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 4: SKILL GAPS ── */}
        {tab === 'gaps' && (
          <div className="space-y-4">
            <h2 className="section-title">Prioritized Skill Gaps</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(data?.skillGaps || []).map((gap: any) => (
                <div key={gap.skill_id} className="card p-5 border-l-4 border-amber-500 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{gap.skill_name}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Demanded by <strong>{gap.demandCount}</strong> active high-match positions.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-teal-700 font-bold">+12% Match Leap</span>
                    <Link to="/student/learning" className="btn-secondary text-xs py-1 px-3">
                      Close Gap &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

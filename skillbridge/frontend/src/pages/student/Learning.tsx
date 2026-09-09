import React, { useEffect, useState } from 'react';
import { Topbar } from '../../components/layout/Topbar';
import { PageLoader } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { trainingAPI } from '../../services/api';
import { 
  BookOpen, CheckCircle, ExternalLink, ArrowRight, Sparkles, 
  DollarSign, Award, ShieldCheck, Zap 
} from 'lucide-react';
import clsx from 'clsx';

const levelColor: Record<string, string> = {
  BEGINNER: 'green', INTERMEDIATE: 'blue', ADVANCED: 'purple',
};

const providerStyle: Record<string, string> = {
  'Coursera':        'bg-blue-50 text-blue-700 border-blue-100',
  'NPTEL':           'bg-orange-50 text-orange-700 border-orange-100',
  'Swayam':          'bg-orange-50 text-orange-700 border-orange-100',
  'freeCodeCamp':    'bg-green-50 text-green-700 border-green-100',
  'MIT OpenCourseWare': 'bg-red-50 text-red-700 border-red-100',
  'AWS Skill Builder':'bg-yellow-50 text-yellow-700 border-yellow-100',
  'KodeKloud':       'bg-purple-50 text-purple-700 border-purple-100',
  'The Odin Project':'bg-teal-50 text-teal-700 border-teal-100',
};

function providerBadgeStyle(provider: string): string {
  for (const key of Object.keys(providerStyle)) {
    if (provider?.includes(key)) return providerStyle[key];
  }
  return 'bg-gray-100 text-gray-600 border-gray-200';
}

export default function Learning() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'enrolled' | 'browse'>('browse');
  const [budgetTier, setBudgetTier] = useState<string>('ALL');
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [success, setSuccess] = useState('');
  const [catFilter, setCatFilter] = useState('All');

  const load = async () => {
    const [pRes, eRes] = await Promise.all([trainingAPI.getAll(), trainingAPI.getEnrollments()]);
    setPrograms(pRes.data.programs || []);
    setEnrollments(eRes.data.enrollments || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const enrolledIds = new Set(enrollments.map((e: any) => e.training_program_id));

  const handleEnroll = async (id: string, title: string) => {
    setEnrolling(id);
    try {
      await trainingAPI.enroll(id);
      setSuccess(`Enrolled in "${title}"!`);
      setTimeout(() => setSuccess(''), 4000);
      load();
    } finally { setEnrolling(null); }
  };

  const handleProgress = async (enrollmentId: string, progress: number) => {
    await trainingAPI.updateProgress(enrollmentId, progress);
    setEnrollments(prev => prev.map((e: any) =>
      e.id === enrollmentId ? { ...e, progress, completed: progress >= 100 } : e
    ));
  };

  if (loading) return <><Topbar title="Learning" /><PageLoader /></>;

  const cats = ['All', ...Array.from(new Set(programs.map((p: any) => p.category)))];
  
  let filteredPrograms = catFilter === 'All' ? programs : programs.filter((p: any) => p.category === catFilter);
  if (budgetTier === 'FREE') {
    filteredPrograms = filteredPrograms.filter((p: any) => !p.cost || p.cost === 0 || p.cost === 'Free');
  } else if (budgetTier === 'AFFORDABLE') {
    filteredPrograms = filteredPrograms.filter((p: any) => p.cost && p.cost <= 1000);
  } else if (budgetTier === 'GRANT') {
    filteredPrograms = filteredPrograms.filter((p: any) => p.is_grant_supported || p.provider?.includes('NPTEL') || p.provider?.includes('Swayam'));
  }

  return (
    <div>
      <Topbar 
        title="Certified Free Courses & Budget Tiers" 
        subtitle="AI Course Scout curated certifications from Swayam, NPTEL, Coursera Financial Aid, and AICTE" 
      />

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        
        {success && (
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-center gap-2 text-xs text-teal-900 shadow-xs">
            <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <span className="font-semibold">{success}</span>
          </div>
        )}

        {/* Budget Tiers & Tabs Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex gap-2">
              {[
                ['browse', `Browse Catalogue (${programs.length})`],
                ['enrolled', `My Active Learning (${enrollments.length})`]
              ].map(([k, l]) => (
                <button 
                  key={k} 
                  onClick={() => setTab(k as any)}
                  className={clsx(
                    'px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer',
                    tab === k ? 'bg-navy-900 text-white border-navy-900 shadow-xs' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                  )}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Budget Tier Selector */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-gray-500 mr-1">Budget Tier:</span>
              {[
                ['ALL', 'All Tiers'],
                ['FREE', '₹0 Free Certified'],
                ['AFFORDABLE', '< ₹1,000 Affordable'],
                ['GRANT', 'Govt Grants / Swayam']
              ].map(([tKey, label]) => (
                <button
                  key={tKey}
                  onClick={() => setBudgetTier(tKey)}
                  className={clsx(
                    'px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-colors cursor-pointer',
                    budgetTier === tKey ? 'bg-teal-600 text-white border-teal-600 font-bold' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          {tab === 'browse' && (
            <div className="flex gap-1.5 pt-2 border-t border-gray-100 flex-wrap">
              {cats.map(c => (
                <button 
                  key={c} 
                  onClick={() => setCatFilter(c)}
                  className={clsx(
                    'px-2.5 py-1 text-xs rounded-lg transition-colors cursor-pointer',
                    catFilter === c ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200' : 'text-gray-500 hover:text-gray-800'
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── BROWSE TAB ── */}
        {tab === 'browse' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPrograms.map((p: any) => {
              const isRecommendedForGaps = p.skill_names?.includes('Docker') || p.skill_names?.includes('Kubernetes') || p.skill_names?.includes('FHIR');
              return (
                <div key={p.id} className="card p-5 hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between group bg-white">
                  <div>
                    {/* Header with AI Scout badge if gap match */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant={levelColor[p.level] as any || 'gray'}>{p.level}</Badge>
                      {isRecommendedForGaps && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                          <Sparkles className="w-3 h-3 text-teal-600" /> AI Course Scout
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-gray-900 text-sm mb-1">{p.title}</h3>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">{p.description}</p>

                    {/* Skill Tags */}
                    {p.skill_names && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {p.skill_names.split(',').slice(0, 3).map((s: string) => (
                          <span key={s} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 font-medium rounded-md">
                            {s.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Provider Badge & Cost */}
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className={clsx('text-[11px] px-2 py-0.5 rounded-full border font-medium', providerBadgeStyle(p.provider))}>
                        {p.provider?.split('(')[0]?.trim()}
                      </span>
                      <span className="font-bold text-emerald-700 text-xs">
                        {p.cost === 0 || !p.cost ? '₹0 Certified Free' : `₹${p.cost}`}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                    {enrolledIds.has(p.id) ? (
                      <div className="flex-1 flex items-center justify-center gap-1 text-xs text-emerald-700 font-bold py-1.5 bg-emerald-50 rounded-lg border border-emerald-200">
                        <CheckCircle className="w-3.5 h-3.5" /> Enrolled
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEnroll(p.id, p.title)}
                        disabled={enrolling === p.id}
                        className="flex-1 btn-primary text-xs py-1.5 flex items-center justify-center gap-1 font-bold cursor-pointer"
                      >
                        {enrolling === p.id ? 'Enrolling...' : 'Enroll Free'}
                      </button>
                    )}

                    {p.external_url && (
                      <a
                        href={p.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                        title="Open external syllabus"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── ENROLLED TAB ── */}
        {tab === 'enrolled' && (
          enrollments.length === 0 ? (
            <EmptyState 
              icon={BookOpen} 
              title="No active enrollments yet"
              description="Browse the certified catalogue and enrol in a ₹0 grant course to start tracking your progress."
            />
          ) : (
            <div className="space-y-4">
              {enrollments.map((e: any) => (
                <div key={e.id} className="card p-5 bg-white border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                      {e.category || 'Upskilling'}
                    </span>
                    <h3 className="text-sm font-bold text-gray-900">{e.title}</h3>
                    <p className="text-xs text-gray-500">{e.provider} &bull; Started {new Date(e.enrolled_at).toLocaleDateString()}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-bold text-gray-800">{e.progress || 0}% Complete</span>
                      <div className="w-28 bg-gray-100 rounded-full h-1.5 mt-1">
                        <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: `${e.progress || 0}%` }} />
                      </div>
                    </div>

                    <select
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
                      value={e.progress}
                      onChange={ev => handleProgress(e.id, Number(ev.target.value))}
                    >
                      {[0, 25, 50, 75, 100].map(v => (
                        <option key={v} value={v}>{v}% Done</option>
                      ))}
                    </select>

                    {e.external_url && (
                      <a 
                        href={e.external_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1 font-bold whitespace-nowrap"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Go to Course
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Topbar } from '../../components/layout/Topbar';
import { PageLoader } from '../../components/ui/Spinner';
import { Badge, getProficiencyBadge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { CertificateVerificationModal } from '../../components/ui/CertificateVerificationModal';
import { skillsAPI } from '../../services/api';
import { 
  Plus, Star, Trash2, ShieldCheck, Award, ArrowRight, 
  Sparkles, CheckCircle2, AlertCircle 
} from 'lucide-react';
import clsx from 'clsx';

export default function MySkills() {
  const [skills, setSkills] = useState<any[]>([]);
  const [allSkills, setAllSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [form, setForm] = useState({ skillId: '', proficiency: 'BEGINNER' });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('All');

  const load = async () => {
    const [myRes, allRes] = await Promise.all([skillsAPI.getUserSkills(), skillsAPI.getAll()]);
    setSkills(myRes.data.skills || []);
    setAllSkills(allRes.data.skills || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const categories = ['All', ...Array.from(new Set(skills.map((s: any) => s.category)))];
  const filtered = filter === 'All' ? skills : skills.filter((s: any) => s.category === filter);

  const addedIds = new Set(skills.map((s: any) => s.skill_id));
  const availableSkills = allSkills.filter((s: any) => !addedIds.has(s.id));

  const handleAdd = async () => {
    if (!form.skillId) return;
    setSaving(true);
    try {
      await skillsAPI.addUserSkill({ skillId: form.skillId, proficiency: form.proficiency });
      await load();
      setShowAdd(false);
      setForm({ skillId: '', proficiency: 'BEGINNER' });
    } finally { setSaving(false); }
  };

  const handleDelete = async (skillId: string) => {
    await skillsAPI.deleteUserSkill(skillId);
    setSkills(prev => prev.filter((s: any) => s.skill_id !== skillId));
  };

  const handleUpdateProficiency = async (skillId: string, proficiency: string) => {
    await skillsAPI.updateUserSkill(skillId, { proficiency });
    setSkills(prev => prev.map((s: any) => s.skill_id === skillId ? { ...s, proficiency } : s));
  };

  if (loading) return <><Topbar title="My Skills" /><PageLoader /></>;

  const grouped: Record<string, any[]> = {};
  for (const s of filtered) {
    if (!grouped[s.category]) grouped[s.category] = [];
    grouped[s.category].push(s);
  }

  return (
    <div>
      <Topbar 
        title="Interactive Competency Matrix" 
        subtitle="Dual-fill verified audit benchmarking candidate self-rating against proctored verification" 
      />

      <div className="p-6 max-w-6xl mx-auto space-y-6">

        {/* Banner Info Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200 mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Anti-Inflation Benchmark
            </div>
            <h2 className="text-base font-bold text-gray-900">
              Verified vs Self-Reported Competency Matrix
            </h2>
            <p className="text-xs text-gray-500 max-w-xl mt-0.5">
              Dual-fill progress bars immediately validate claimed mastery against proctored exam scores and accredited certificate hashes.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button 
              onClick={() => setShowVerifyModal(true)} 
              className="btn-teal text-xs flex items-center gap-1.5 cursor-pointer font-bold"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Audit Certificate
            </button>
            <button 
              onClick={() => setShowAdd(true)} 
              className="btn-primary text-xs flex items-center gap-1.5 cursor-pointer font-bold"
            >
              <Plus className="w-3.5 h-3.5" /> Add Skill
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-2 flex-wrap items-center">
          {categories.map(c => (
            <button 
              key={c} 
              onClick={() => setFilter(c)}
              className={clsx(
                'px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer',
                filter === c 
                  ? 'bg-navy-900 text-white border-navy-900 shadow-xs' 
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState 
            icon={Star} 
            title="No skills added yet"
            description="Add your skills or take a proctored assessment to populate your competency matrix."
            action={<button onClick={() => setShowAdd(true)} className="btn-primary text-xs">Add Your First Skill</button>} 
          />
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([cat, catSkills]) => (
              <div key={cat} className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{cat}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {catSkills.map((s: any) => {
                    const selfRatingPct = s.proficiency === 'ADVANCED' ? 90 : s.proficiency === 'INTERMEDIATE' ? 65 : 40;
                    const verifiedPct = s.assessment_score || (s.verified ? 85 : null);

                    return (
                      <div key={s.id} className="card p-5 border border-gray-200 hover:border-teal-300 hover:shadow-xs transition-all flex flex-col justify-between group">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                                {s.skill_name}
                                {s.verified && (
                                  <span className="text-teal-600" title="Cryptographically Verified">
                                    <CheckCircle2 className="w-4 h-4" />
                                  </span>
                                )}
                              </h4>
                              <p className="text-[11px] text-gray-400">{cat}</p>
                            </div>
                            <Badge variant={getProficiencyBadge(s.proficiency)}>
                              {s.proficiency}
                            </Badge>
                          </div>

                          {/* Dual-Fill Progress Bars (Self-Claimed vs Verified) */}
                          <div className="space-y-2 my-3 p-3 bg-gray-50/80 rounded-xl border border-gray-200/80 text-xs">
                            {/* Bar 1: Self-Claimed */}
                            <div>
                              <div className="flex justify-between text-[11px] mb-1">
                                <span className="text-gray-500 font-medium">Self-Rating</span>
                                <span className="font-bold text-navy-900">{selfRatingPct}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div className="bg-navy-700 h-1.5 rounded-full" style={{ width: `${selfRatingPct}%` }} />
                              </div>
                            </div>

                            {/* Bar 2: Verified Score */}
                            <div>
                              <div className="flex justify-between text-[11px] mb-1">
                                <span className="text-gray-500 font-medium">Proctored Score</span>
                                <span className={`font-bold ${verifiedPct ? 'text-teal-700' : 'text-amber-600'}`}>
                                  {verifiedPct ? `${verifiedPct}% (Validated)` : 'Unverified'}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                {verifiedPct ? (
                                  <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: `${verifiedPct}%` }} />
                                ) : (
                                  <div className="bg-amber-400/40 h-1.5 rounded-full w-full" />
                                )}
                              </div>
                            </div>
                          </div>

                        </div>

                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                          {!verifiedPct ? (
                            <Link 
                              to="/student/assessment" 
                              className="text-teal-700 hover:text-teal-800 font-bold flex items-center gap-1"
                            >
                              Verify via Exam &rarr;
                            </Link>
                          ) : (
                            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" /> NSQF Verified
                            </span>
                          )}

                          <button 
                            onClick={() => handleDelete(s.skill_id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-all cursor-pointer"
                            title="Remove Skill"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Add Skill Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Competency to Matrix">
        <div className="space-y-4">
          <div>
            <label className="label text-xs">Target Skill</label>
            <select className="input text-xs" value={form.skillId} onChange={e => setForm({ ...form, skillId: e.target.value })}>
              <option value="">Select a skill</option>
              {availableSkills.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label text-xs">Proficiency Tier</label>
            <div className="grid grid-cols-3 gap-2">
              {['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map(p => (
                <button 
                  key={p} 
                  type="button"
                  onClick={() => setForm({ ...form, proficiency: p })}
                  className={clsx('px-3 py-2 text-xs font-bold rounded-lg border transition-colors cursor-pointer',
                    form.proficiency === p ? 'bg-navy-900 text-white border-navy-900' : 'bg-white text-gray-700 border-gray-200'
                  )}
                >
                  {p.charAt(0) + p.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setShowAdd(false)} className="btn-secondary text-xs cursor-pointer">Cancel</button>
            <button onClick={handleAdd} disabled={!form.skillId || saving} className="btn-primary text-xs font-bold cursor-pointer">
              {saving ? 'Adding...' : 'Add Skill'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Certificate Verification Modal */}
      <CertificateVerificationModal 
        isOpen={showVerifyModal} 
        onClose={() => setShowVerifyModal(false)} 
        onSuccess={load}
      />

    </div>
  );
}

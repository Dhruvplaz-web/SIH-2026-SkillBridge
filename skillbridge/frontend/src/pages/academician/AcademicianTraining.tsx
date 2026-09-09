import React, { useEffect, useState } from 'react';
import { Topbar } from '../../components/layout/Topbar';
import { PageLoader } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { trainingAPI, skillsAPI } from '../../services/api';
import { Plus, BookOpen, X } from 'lucide-react';
import { EmptyState } from '../../components/ui/EmptyState';

export default function AcademicianTraining() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [allSkills, setAllSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', level: 'BEGINNER', duration: '', provider: '', externalUrl: '', category: '', skills: [] as string[] });

  const load = async () => {
    const [pRes, sRes] = await Promise.all([trainingAPI.getAll(), skillsAPI.getAll()]);
    setPrograms(pRes.data.programs || []);
    setAllSkills(sRes.data.skills || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    setSaving(true);
    await trainingAPI.create(form);
    await load();
    setShowCreate(false);
    setForm({ title: '', description: '', level: 'BEGINNER', duration: '', provider: '', externalUrl: '', category: '', skills: [] });
    setSaving(false);
  };

  const addSkill = (skillId: string) => {
    if (skillId && !form.skills.includes(skillId)) setForm({ ...form, skills: [...form.skills, skillId] });
  };

  if (loading) return <><Topbar title="Training Programs" /><PageLoader /></>;

  return (
    <div>
      <Topbar title="Training Programs" />
      <div className="p-6">
        <div className="flex justify-end mb-4">
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-1.5"><Plus className="w-4 h-4" />Create Program</button>
        </div>

        {programs.length === 0 ? (
          <EmptyState icon={BookOpen} title="No training programs" action={<button onClick={() => setShowCreate(true)} className="btn-primary">Create Program</button>} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {programs.map((p: any) => (
              <div key={p.id} className="card">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant={p.level === 'BEGINNER' ? 'green' : p.level === 'INTERMEDIATE' ? 'blue' : 'purple'}>{p.level}</Badge>
                  <span className="text-xs text-gray-500">{p.enrollment_count || 0} enrolled</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{p.title}</h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{p.description}</p>
                {p.skill_names && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {p.skill_names.split(',').slice(0, 3).map((s: string) => (
                      <span key={s} className="text-xs px-1.5 py-0.5 bg-teal-50 text-teal-700 rounded">{s.trim()}</span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500">{p.duration} · {p.provider}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Training Program" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="label">Title *</label><input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><label className="label">Category *</label><input className="input" placeholder="Data Science, Web Dev..." value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></div>
            <div><label className="label">Level</label>
              <select className="input" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
            <div><label className="label">Duration</label><input className="input" placeholder="8 weeks" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} /></div>
            <div><label className="label">Provider</label><input className="input" placeholder="Institution/Platform name" value={form.provider} onChange={e => setForm({ ...form, provider: e.target.value })} /></div>
            <div className="col-span-2"><label className="label">Description *</label><textarea className="input min-h-[80px] resize-none" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="col-span-2">
              <label className="label">Skills Covered</label>
              <select className="input mb-2" onChange={e => { addSkill(e.target.value); e.target.value = ''; }} defaultValue="">
                <option value="" disabled>Add skill...</option>
                {allSkills.filter(s => !form.skills.includes(s.id)).map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <div className="flex flex-wrap gap-2">
                {form.skills.map(sid => {
                  const skill = allSkills.find(s => s.id === sid);
                  return skill ? (
                    <span key={sid} className="flex items-center gap-1 text-xs px-2 py-1 bg-teal-50 text-teal-700 rounded-lg border border-teal-100">
                      {skill.name}
                      <button onClick={() => setForm({ ...form, skills: form.skills.filter(s => s !== sid) })}><X className="w-3 h-3" /></button>
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleCreate} disabled={!form.title || !form.description || saving} className="btn-primary">{saving ? 'Creating...' : 'Create Program'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

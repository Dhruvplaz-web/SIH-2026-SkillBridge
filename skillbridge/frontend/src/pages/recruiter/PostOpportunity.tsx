import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Topbar } from '../../components/layout/Topbar';
import { opportunitiesAPI, skillsAPI } from '../../services/api';
import { CheckCircle, Plus, X } from 'lucide-react';

export default function PostOpportunity() {
  const navigate = useNavigate();
  const [allSkills, setAllSkills] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: '', description: '', type: 'INTERNSHIP', location: '', locationType: 'HYBRID',
    duration: '', stipend: '', salaryRange: '', deadline: '', eligibility: '',
    requirements: '', responsibilities: '', benefits: '',
  });
  const [selectedSkills, setSelectedSkills] = useState<Array<{ skillId: string; skillName: string; importance: string }>>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    skillsAPI.getAll().then(r => setAllSkills(r.data.skills || []));
  }, []);

  const addSkill = (skillId: string) => {
    if (!skillId || selectedSkills.some(s => s.skillId === skillId)) return;
    const skill = allSkills.find(s => s.id === skillId);
    if (skill) setSelectedSkills([...selectedSkills, { skillId, skillName: skill.name, importance: 'REQUIRED' }]);
  };

  const removeSkill = (skillId: string) => setSelectedSkills(prev => prev.filter(s => s.skillId !== skillId));

  const updateImportance = (skillId: string, importance: string) => {
    setSelectedSkills(prev => prev.map(s => s.skillId === skillId ? { ...s, importance } : s));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description) { setError('Title and description are required'); return; }
    setSaving(true);
    try {
      await opportunitiesAPI.create({
        ...form,
        skills: selectedSkills.map(s => ({ skillId: s.skillId, importance: s.importance })),
      });
      navigate('/recruiter/opportunities');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to post opportunity');
    } finally { setSaving(false); }
  };

  const unusedSkills = allSkills.filter(s => !selectedSkills.some(sel => sel.skillId === s.id));

  return (
    <div>
      <Topbar title="Post Opportunity" subtitle="Create a new job, internship, or training posting" />
      <div className="p-6 max-w-4xl mx-auto">
        {error && <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card space-y-4">
            <h2 className="font-semibold text-gray-900 text-base border-b border-gray-100 pb-3">Basic Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label">Job/Internship Title *</label>
                <input className="input" placeholder="e.g., Data Science Intern, Full Stack Developer" required
                  value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="label">Requisition Track *</label>
                <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="INTERNSHIP">Summer Technical Internship (2 Months)</option>
                  <option value="INTERNSHIP">6-Month Semester Co-Op</option>
                  <option value="TRAINING">Research Apprenticeship (Funded)</option>
                  <option value="JOB">Graduate Trainee Opening (Full-Time)</option>
                </select>
              </div>
              <div>
                <label className="label">Location Type</label>
                <select className="input" value={form.locationType} onChange={e => setForm({ ...form, locationType: e.target.value })}>
                  <option value="ONSITE">On-site</option>
                  <option value="REMOTE">Remote</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="label">Location</label>
                <input className="input" placeholder="City, State" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
              </div>
              <div>
                <label className="label">Duration</label>
                <input className="input" placeholder="e.g., 6 months, 1 year, Permanent" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
              </div>
              {form.type === 'INTERNSHIP' && (
                <div>
                  <label className="label">Stipend</label>
                  <input className="input" placeholder="e.g., ₹25,000/month" value={form.stipend} onChange={e => setForm({ ...form, stipend: e.target.value })} />
                </div>
              )}
              {form.type === 'JOB' && (
                <div>
                  <label className="label">Salary Range (CTC)</label>
                  <input className="input" placeholder="e.g., ₹8–12 LPA" value={form.salaryRange} onChange={e => setForm({ ...form, salaryRange: e.target.value })} />
                </div>
              )}
              <div>
                <label className="label">Application Deadline</label>
                <input className="input" type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="card space-y-4">
            <h2 className="font-semibold text-gray-900 text-base border-b border-gray-100 pb-3">Description</h2>
            <div>
              <label className="label">Job Description *</label>
              <textarea className="input min-h-[120px] resize-none" placeholder="Describe the role, responsibilities, and what the candidate will work on..." required
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="label">Eligibility Criteria</label>
              <input className="input" placeholder="e.g., Final year B.Tech/MCA with CGPA ≥ 7.0"
                value={form.eligibility} onChange={e => setForm({ ...form, eligibility: e.target.value })} />
            </div>
            <div>
              <label className="label">Requirements</label>
              <textarea className="input min-h-[80px] resize-none" placeholder="Technical and other requirements..."
                value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} />
            </div>
          </div>

          {/* Skills */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-gray-900 text-base border-b border-gray-100 pb-3">Required Skills</h2>
            <div className="flex gap-2">
              <select className="input" onChange={e => { addSkill(e.target.value); e.target.value = ''; }} defaultValue="">
                <option value="" disabled>Add a skill...</option>
                {unusedSkills.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                ))}
              </select>
            </div>
            {selectedSkills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedSkills.map(s => (
                  <div key={s.skillId} className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2 py-1">
                    <span className="text-sm text-gray-800">{s.skillName}</span>
                    <select
                      className="text-xs border-0 bg-transparent text-gray-500 cursor-pointer"
                      value={s.importance}
                      onChange={e => updateImportance(s.skillId, e.target.value)}
                    >
                      <option value="REQUIRED">Required</option>
                      <option value="PREFERRED">Preferred</option>
                    </select>
                    <button type="button" onClick={() => removeSkill(s.skillId)} className="text-gray-400 hover:text-red-500">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-1.5">
              {saving ? 'Posting...' : <><CheckCircle className="w-4 h-4" /> Post Opportunity</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

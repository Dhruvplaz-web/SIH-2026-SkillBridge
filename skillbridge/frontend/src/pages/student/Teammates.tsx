import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Plus, Search, Filter, Sparkles, CheckCircle2, 
  MapPin, Mail, ArrowRight, X, Loader2, Award, Zap 
} from 'lucide-react';
import { Topbar } from '../../components/layout/Topbar';
import { studentFeaturesAPI } from '../../services/api';

export default function Teammates() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  // Form state
  const [hackathonName, setHackathonName] = useState('Smart India Hackathon 2026');
  const [projectTitle, setProjectTitle] = useState('');
  const [neededSkills, setNeededSkills] = useState('');
  const [description, setDescription] = useState('');

  const loadTeams = async (skill?: string) => {
    setLoading(true);
    try {
      const res = await studentFeaturesAPI.getTeammates(skill);
      setTeams(res.data.teams || []);
    } catch (err) {
      console.error('Failed to load teammates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadTeams(searchTerm.trim());
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim() || !neededSkills.trim()) return;
    setSubmitting(true);

    try {
      await studentFeaturesAPI.createTeammateRequest({
        hackathonName,
        projectTitle,
        neededSkills,
        description
      });
      setShowModal(false);
      setToast('Teammate request published successfully!');
      setTimeout(() => setToast(''), 4000);
      loadTeams();
      setProjectTitle('');
      setNeededSkills('');
      setDescription('');
    } catch (err) {
      console.error('Error posting teammate request:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Topbar 
        title="Hackathon Teammate Matcher" 
        subtitle="Algorithmic skill-complement matchmaking for Smart India Hackathon and national innovation sprints"
      />

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        
        {/* Banner Card */}
        <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-teal-950 rounded-2xl p-6 text-white border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Set-Complement Skill Engine
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Assemble Your Multidisciplinary Dream Team
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Winning teams require complementary talent: pairing Frontend masters with Cloud/DevOps architects and domain specialists.
            </p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="btn-teal text-xs font-bold flex items-center gap-2 whitespace-nowrap cursor-pointer shadow-md shadow-teal-500/20 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Post Team Vacancy
          </button>
        </div>

        {/* Success Alert */}
        {toast && (
          <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl flex items-center gap-2.5 text-xs text-teal-900 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <span className="font-semibold">{toast}</span>
          </div>
        )}

        {/* Search & Filter */}
        <div className="flex gap-3 items-center bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search by required skill (e.g. Docker, React, FHIR, PyTorch)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white"
            />
          </form>
          <button 
            onClick={() => { setSearchTerm(''); loadTeams(); }}
            className="btn-secondary text-xs cursor-pointer"
          >
            Reset
          </button>
        </div>

        {/* Teams Grid */}
        {loading ? (
          <div className="p-12 bg-white text-center rounded-xl border border-gray-200">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-gray-500">Matching teammate opportunities...</p>
          </div>
        ) : teams.length === 0 ? (
          <div className="p-12 bg-white text-center rounded-xl border border-gray-200">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-gray-800">No Open Team Vacancies Found</h3>
            <p className="text-xs text-gray-400 mt-1">Be the first to create a team vacancy!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams.map((t) => (
              <div 
                key={t.id}
                className="bg-white p-5 rounded-xl border border-gray-200 hover:border-teal-300 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60">
                        {t.hackathon_name}
                      </span>
                      <h3 className="text-sm font-bold text-gray-900 mt-1">{t.project_title}</h3>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                    {t.description || 'Multidisciplinary collegiate innovation project seeking team collaborator.'}
                  </p>

                  <div className="mt-3">
                    <span className="text-[11px] font-semibold text-gray-500 block mb-1">
                      Seeking Skill Complements:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {t.needed_skills.split(',').map((s: string, idx: number) => (
                        <span 
                          key={idx}
                          className="text-xs px-2.5 py-0.5 bg-slate-100 text-slate-700 font-medium rounded-md border border-slate-200"
                        >
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <div>
                    <span className="font-bold text-gray-800 block">{t.student_name}</span>
                    <span className="text-[11px] text-gray-400">{t.college}</span>
                  </div>
                  <a 
                    href={`mailto:${t.contact_email}?subject=Collaboration%20on%20${encodeURIComponent(t.project_title)}`}
                    className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold rounded-lg border border-teal-200 transition-colors flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" /> Connect
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Create Teammate Request */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-lg w-full p-6 space-y-4 my-8"
              >
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-teal-600" />
                    <h3 className="text-base font-bold text-gray-900">Post Hackathon Team Vacancy</h3>
                  </div>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateRequest} className="space-y-3.5">
                  <div>
                    <label className="label text-xs">Hackathon / Innovation Challenge</label>
                    <input 
                      type="text" 
                      value={hackathonName} 
                      onChange={(e) => setHackathonName(e.target.value)}
                      className="input text-xs" 
                      required 
                    />
                  </div>

                  <div>
                    <label className="label text-xs">Project Title / Theme</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Autonomous Health Triage or Zero-Trust Gateway"
                      value={projectTitle} 
                      onChange={(e) => setProjectTitle(e.target.value)}
                      className="input text-xs" 
                      required 
                    />
                  </div>

                  <div>
                    <label className="label text-xs">Needed Skills (comma separated)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. React, Tailwind, Docker, FHIR, PyTorch"
                      value={neededSkills} 
                      onChange={(e) => setNeededSkills(e.target.value)}
                      className="input text-xs" 
                      required 
                    />
                  </div>

                  <div>
                    <label className="label text-xs">Project Summary & Role Description</label>
                    <textarea 
                      rows={3}
                      placeholder="Describe what your team is building and what responsibilities you need covered..."
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)}
                      className="input text-xs" 
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 text-xs cursor-pointer">
                      Cancel
                    </button>
                    <button type="submit" disabled={submitting} className="btn-teal flex-1 text-xs font-bold cursor-pointer">
                      {submitting ? 'Publishing...' : 'Publish Vacancy'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

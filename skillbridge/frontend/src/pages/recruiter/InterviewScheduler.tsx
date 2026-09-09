import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Clock, Video, Users, CheckCircle2, 
  ExternalLink, Plus, Filter, Sparkles, Building, Mail 
} from 'lucide-react';
import { Topbar } from '../../components/layout/Topbar';
import { PageLoader } from '../../components/ui/Spinner';
import { recruiterFeaturesAPI } from '../../services/api';

export default function InterviewScheduler() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  const [roleTitle, setRoleTitle] = useState('Full-Stack Software Engineer');
  const [collegeName, setCollegeName] = useState('IIT Delhi / NIT Surathkal');
  const [roundType, setRoundType] = useState('Technical Round 1 (System Architecture)');
  const [scheduledTime, setScheduledTime] = useState('Tomorrow, 2:00 PM IST');
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      const res = await recruiterFeaturesAPI.getInterviews();
      setInterviews(res.data.interviews || []);
    } catch (err) {
      console.error('Failed to load interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setScheduling(true);
    try {
      await recruiterFeaturesAPI.scheduleInterview({
        candidateId: 'cand-gen-' + Math.floor(100 + Math.random() * 900),
        roleTitle,
        collegeName,
        roundType,
        scheduledTime
      });
      setShowModal(false);
      loadInterviews();
    } catch (err) {
      console.error('Scheduling error:', err);
    } finally {
      setScheduling(false);
    }
  };

  if (loading) return <><Topbar title="Campus Interview Scheduler" /><PageLoader /></>;

  return (
    <div>
      <Topbar 
        title="Automated Bulk Campus Interview Auto-Scheduler" 
        subtitle="Automated technical and HR round scheduling across college batches with instant virtual room generation"
      />

      <div className="p-6 max-w-6xl mx-auto space-y-6">

        {/* Action Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" /> Active Campus Interview Pipeline
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Syncs with candidate academic timetables to prevent conflicts during semester exams.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="btn-primary text-xs font-bold flex items-center gap-2 px-4 py-2 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" /> Schedule New Round
          </button>
        </div>

        {/* Scheduled Interviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interviews.length === 0 ? (
            <div className="md:col-span-2 card p-10 text-center text-gray-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-semibold">No interviews scheduled yet.</p>
              <p className="text-xs text-gray-400 mt-1">Click "Schedule New Round" to auto-dispatch calendar invites.</p>
            </div>
          ) : (
            interviews.map(item => (
              <div 
                key={item.id}
                className="card p-5 bg-white border border-gray-200 hover:border-teal-300 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {item.round_type}
                      </span>
                      <h3 className="text-sm font-bold text-gray-900 mt-1.5">{item.candidate_name}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-gray-400" /> {item.college_name}
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-teal-600" /> Scheduled Time:
                      </span>
                      <strong className="text-slate-900 font-medium">{item.scheduled_time}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <Mail className="w-3.5 h-3.5 text-teal-600" /> Candidate Email:
                      </span>
                      <span className="text-slate-700 font-mono text-[11px]">{item.candidate_email}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <a 
                    href={item.meeting_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1.5"
                  >
                    <Video className="w-4 h-4 text-teal-600" /> Join Virtual Meeting <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="text-[10px] text-gray-400 font-mono">{item.role_title}</span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Modal for Scheduling New Round */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" /> Auto-Schedule Campus Interview
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">&times;</button>
            </div>

            <form onSubmit={handleSchedule} className="space-y-3 text-xs">
              <div>
                <label className="text-gray-700 font-bold block mb-1">Candidate Name / ID</label>
                <input
                  type="text"
                  required
                  value={candidateName}
                  onChange={e => setCandidateName(e.target.value)}
                  placeholder="e.g. Khushi Patil or Arjun Mehta"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-teal-500"
                />
              </div>

              <div>
                <label className="text-gray-700 font-bold block mb-1">Target Engineering Role</label>
                <input
                  type="text"
                  required
                  value={roleTitle}
                  onChange={e => setRoleTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-teal-500"
                />
              </div>

              <div>
                <label className="text-gray-700 font-bold block mb-1">Affiliated College / University</label>
                <input
                  type="text"
                  required
                  value={collegeName}
                  onChange={e => setCollegeName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-teal-500"
                />
              </div>

              <div>
                <label className="text-gray-700 font-bold block mb-1">Interview Round Track</label>
                <select 
                  value={roundType} 
                  onChange={e => setRoundType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-teal-500"
                >
                  <option>Technical Round 1 (System Architecture)</option>
                  <option>Live Coding & Algorithm Screening</option>
                  <option>HR & Cultural Leadership Fit</option>
                  <option>Final Executive Bar-Raiser</option>
                </select>
              </div>

              <div>
                <label className="text-gray-700 font-bold block mb-1">Date & Time Slot</label>
                <input
                  type="text"
                  required
                  value={scheduledTime}
                  onChange={e => setScheduledTime(e.target.value)}
                  placeholder="e.g. Tomorrow at 3:30 PM IST"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-teal-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1 py-2 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scheduling}
                  className="btn-primary flex-1 py-2 text-xs font-bold cursor-pointer"
                >
                  {scheduling ? 'Scheduling...' : 'Dispatch Invites'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}

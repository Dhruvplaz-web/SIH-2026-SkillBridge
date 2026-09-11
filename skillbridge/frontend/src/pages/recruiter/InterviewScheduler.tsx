import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Clock, Video, Users, CheckCircle2, 
  ExternalLink, Plus, Filter, Sparkles, Building, Mail,
  Download, Award, Star, FileText, Check, X, ShieldCheck, Save
} from 'lucide-react';
import { Topbar } from '../../components/layout/Topbar';
import { PageLoader } from '../../components/ui/Spinner';
import { Modal } from '../../components/ui/Modal';
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

  // Evaluation Rubric Modal State
  const [evaluatingInterview, setEvaluatingInterview] = useState<any>(null);
  const [evalScores, setEvalScores] = useState({
    coding: 8,
    systemDesign: 7,
    problemSolving: 9,
    communication: 8,
    verdict: 'STRONG_HIRE',
    notes: 'Demonstrated exceptional algorithmic insight, clean modular code, and sub-100ms response time design.'
  });
  const [savedEvaluations, setSavedEvaluations] = useState<{ [id: string]: any }>({});
  const [evalSavedSuccess, setEvalSavedSuccess] = useState(false);

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      const res = await recruiterFeaturesAPI.getInterviews();
      let list = res.data.interviews || [];
      if (list.length === 0) {
        // High quality demo interviews for campus drive
        list = [
          {
            id: 'int-1',
            candidate_name: 'Khushi Patil',
            candidate_email: 'khushi.patil@engineering.edu.in',
            role_title: 'Cloud & Distributed Systems Engineer',
            college_name: 'National Institute of Technology, Surathkal',
            round_type: 'Technical Round 1 (System Architecture)',
            scheduled_time: 'Tomorrow, 2:00 PM IST',
            meeting_link: 'https://meet.google.com/skl-xbrg-eng'
          },
          {
            id: 'int-2',
            candidate_name: 'Arjun Mehta',
            candidate_email: 'arjun.mehta@iitd.ac.in',
            role_title: 'Backend Platform & Kafka Engineer',
            college_name: 'Indian Institute of Technology, Delhi',
            round_type: 'Live Coding & Algorithm Screening',
            scheduled_time: 'Friday, 11:30 AM IST',
            meeting_link: 'https://meet.google.com/skl-kfk-algo'
          }
        ];
      }
      setInterviews(list);
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
      setCandidateName('');
      loadInterviews();
    } catch (err) {
      console.error('Scheduling error:', err);
    } finally {
      setScheduling(false);
    }
  };

  const handleDownloadICS = (item: any) => {
    const dt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const dtStr = dt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDt = new Date(dt.getTime() + 45 * 60 * 1000);
    const endDtStr = endDt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//SkillSetu//Campus Interview Auto-Scheduler//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:sched-${item.id || Date.now()}@skillsetu.gov.in`,
      `DTSTAMP:${dtStr}`,
      `DTSTART:${dtStr}`,
      `DTEND:${endDtStr}`,
      `SUMMARY:${item.round_type} - ${item.candidate_name}`,
      `DESCRIPTION:Campus Placement Interview for ${item.role_title} at ${item.college_name}.\\nJoin Video Call: ${item.meeting_link}\\nCandidate Email: ${item.candidate_email}`,
      `LOCATION:${item.meeting_link}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview_${(item.candidate_name || 'candidate').replace(/\s+/g, '_')}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingInterview) return;
    setSavedEvaluations(prev => ({
      ...prev,
      [evaluatingInterview.id]: {
        ...evalScores,
        evaluatedAt: new Date().toLocaleTimeString('en-IN')
      }
    }));
    setEvalSavedSuccess(true);
    setTimeout(() => {
      setEvalSavedSuccess(false);
      setEvaluatingInterview(null);
    }, 1500);
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary text-xs font-bold flex items-center gap-2 px-4 py-2 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" /> Schedule New Round
            </button>
          </div>
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
            interviews.map(item => {
              const evaluation = savedEvaluations[item.id];
              return (
                <div 
                  key={item.id}
                  className="card p-5 bg-white border border-gray-200 hover:border-teal-300 hover:shadow-sm transition-all flex flex-col justify-between space-y-4"
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

                      <div className="flex flex-col items-end gap-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                        </span>
                        {evaluation && (
                          <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                            evaluation.verdict === 'STRONG_HIRE' ? 'bg-emerald-100 text-emerald-800' :
                            evaluation.verdict === 'HIRE' ? 'bg-teal-100 text-teal-800' :
                            evaluation.verdict === 'LEAN_HIRE' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            Scorecard: {evaluation.verdict}
                          </span>
                        )}
                      </div>
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

                    {/* If evaluated, show brief scorecard strip */}
                    {evaluation && (
                      <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900">
                          <span>Evaluation Notes:</span>
                          <span className="text-[10px] text-emerald-700 font-mono">Rating: {Math.round((evaluation.coding + evaluation.systemDesign + evaluation.problemSolving + evaluation.communication)/4)}/10</span>
                        </div>
                        <p className="text-[11px] text-emerald-800 italic">{evaluation.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2 flex-wrap text-xs">
                    <a 
                      href={item.meeting_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                    >
                      <Video className="w-3.5 h-3.5 text-teal-600" /> Join Call <ExternalLink className="w-3 h-3 text-gray-400" />
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadICS(item)}
                        className="btn-secondary py-1 px-2 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                        title="Download .ics Calendar File for Outlook / Google Calendar"
                      >
                        <Download className="w-3 h-3" /> .ics
                      </button>

                      <button
                        onClick={() => {
                          setEvaluatingInterview(item);
                          if (evaluation) {
                            setEvalScores({
                              coding: evaluation.coding,
                              systemDesign: evaluation.systemDesign,
                              problemSolving: evaluation.problemSolving,
                              communication: evaluation.communication,
                              verdict: evaluation.verdict,
                              notes: evaluation.notes
                            });
                          }
                        }}
                        className="btn-primary py-1 px-2.5 text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <Award className="w-3 h-3" /> {evaluation ? 'Edit Rubric' : 'Grade Candidate'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
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

      {/* Evaluation Scorecard Rubric Modal */}
      <Modal
        open={!!evaluatingInterview}
        onClose={() => setEvaluatingInterview(null)}
        title={`Interview Evaluation Rubric — ${evaluatingInterview?.candidate_name}`}
        size="lg"
      >
        <form onSubmit={handleSaveEvaluation} className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <h4 className="font-bold text-gray-900">{evaluatingInterview?.role_title}</h4>
              <p className="text-[11px] text-gray-500">{evaluatingInterview?.round_type} • {evaluatingInterview?.college_name}</p>
            </div>
            <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              Candidate Rubric
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-700 font-bold block mb-1">Algorithmic & Coding Precision (1–10): {evalScores.coding}/10</label>
              <input
                type="range"
                min="1"
                max="10"
                value={evalScores.coding}
                onChange={e => setEvalScores({ ...evalScores, coding: parseInt(e.target.value) })}
                className="w-full accent-teal-600"
              />
            </div>

            <div>
              <label className="text-gray-700 font-bold block mb-1">System Design & Architectural Modularity: {evalScores.systemDesign}/10</label>
              <input
                type="range"
                min="1"
                max="10"
                value={evalScores.systemDesign}
                onChange={e => setEvalScores({ ...evalScores, systemDesign: parseInt(e.target.value) })}
                className="w-full accent-teal-600"
              />
            </div>

            <div>
              <label className="text-gray-700 font-bold block mb-1">Analytical Problem Solving: {evalScores.problemSolving}/10</label>
              <input
                type="range"
                min="1"
                max="10"
                value={evalScores.problemSolving}
                onChange={e => setEvalScores({ ...evalScores, problemSolving: parseInt(e.target.value) })}
                className="w-full accent-teal-600"
              />
            </div>

            <div>
              <label className="text-gray-700 font-bold block mb-1">Technical Communication & Cultural Fit: {evalScores.communication}/10</label>
              <input
                type="range"
                min="1"
                max="10"
                value={evalScores.communication}
                onChange={e => setEvalScores({ ...evalScores, communication: parseInt(e.target.value) })}
                className="w-full accent-teal-600"
              />
            </div>
          </div>

          <div>
            <label className="text-gray-700 font-bold block mb-1">Hiring Recommendation Verdict</label>
            <select
              value={evalScores.verdict}
              onChange={e => setEvalScores({ ...evalScores, verdict: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-teal-500 font-bold"
            >
              <option value="STRONG_HIRE">🟢 STRONG HIRE (Top 5% Talent - Fast-Track Offer)</option>
              <option value="HIRE">🟢 HIRE (Meets bar across core criteria)</option>
              <option value="LEAN_HIRE">🟡 LEAN HIRE (Acceptable with mentor supervision)</option>
              <option value="REJECT">🔴 REJECT (Does not meet required proficiency threshold)</option>
            </select>
          </div>

          <div>
            <label className="text-gray-700 font-bold block mb-1">Detailed Technical Feedback & Notes</label>
            <textarea
              rows={4}
              required
              value={evalScores.notes}
              onChange={e => setEvalScores({ ...evalScores, notes: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-teal-500 text-xs"
            />
          </div>

          <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
            <span className="text-[11px] text-gray-500 font-mono">
              Average Score: {((evalScores.coding + evalScores.systemDesign + evalScores.problemSolving + evalScores.communication) / 4).toFixed(1)} / 10
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEvaluatingInterview(null)}
                className="btn-secondary px-3 py-2 text-xs font-bold"
              >
                Close
              </button>
              <button
                type="submit"
                className="btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                {evalSavedSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                {evalSavedSuccess ? 'Scorecard Saved!' : 'Save Rubric Evaluation'}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

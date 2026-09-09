import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, Calendar, Users, Building, Plus, 
  CheckCircle2, Clock, Sparkles, ExternalLink 
} from 'lucide-react';
import { Topbar } from '../../components/layout/Topbar';
import { PageLoader } from '../../components/ui/Spinner';
import { academicianFeaturesAPI } from '../../services/api';

export default function GuestLectures() {
  const [lectures, setLectures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [topic, setTopic] = useState('Microservices & Zero-Trust Service Meshes with Envoy');
  const [speakerName, setSpeakerName] = useState('Ananya Sen');
  const [speakerCompany, setSpeakerCompany] = useState('Tata Consultancy Services');
  const [speakerDesignation, setSpeakerDesignation] = useState('Principal Cloud Architect');
  const [scheduledDate, setScheduledDate] = useState('Next Tuesday, 11:00 AM IST');
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    loadLectures();
  }, []);

  const loadLectures = async () => {
    try {
      const res = await academicianFeaturesAPI.getGuestLectures();
      setLectures(res.data.guestLectures || []);
    } catch (err) {
      console.error('Failed to load guest lectures:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setScheduling(true);
    try {
      await academicianFeaturesAPI.requestGuestLecture({
        topic,
        speakerName,
        speakerCompany,
        speakerDesignation,
        scheduledDate
      });
      setShowModal(false);
      loadLectures();
    } catch (err) {
      console.error('Scheduling error:', err);
    } finally {
      setScheduling(false);
    }
  };

  if (loading) return <><Topbar title="Industry Guest Lectures" /><PageLoader /></>;

  return (
    <div>
      <Topbar 
        title="Industry Guest Lecture & Workshop Scheduling Portal" 
        subtitle="Schedule accredited virtual seminars with verified corporate engineering leaders and chief architects"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* Action Header Card */}
        <div className="card p-6 bg-white border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Video className="w-5 h-5 text-teal-600" /> University Guest Lecture Calendar
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Invited sessions count towards NAAC Criterion 3.5 & NBA Criterion 8 industry interaction credits.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="btn-primary text-xs font-bold flex items-center gap-2 px-4 py-2 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" /> Invite Corporate Architect
          </button>
        </div>

        {/* Lectures Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lectures.length === 0 ? (
            <div className="md:col-span-2 card p-10 text-center text-gray-400">
              <Video className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-semibold">No guest lectures scheduled yet.</p>
              <p className="text-xs text-gray-400 mt-1">Click "Invite Corporate Architect" to host an accredited industry seminar.</p>
            </div>
          ) : (
            lectures.map(item => (
              <div 
                key={item.id} 
                className="card p-5 bg-white border border-gray-200 hover:border-teal-300 hover:shadow-sm transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {item.mode}
                    </span>
                    <h3 className="text-sm font-bold text-gray-900 mt-1.5">{item.topic}</h3>
                    <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                      <Building className="w-3.5 h-3.5 text-gray-400" /> {item.speaker_name} &bull; {item.speaker_designation} ({item.speaker_company})
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Scheduled
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-teal-600" /> Scheduled Time:
                  </span>
                  <strong className="text-slate-900 font-medium">{item.scheduled_date}</strong>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-gray-500">{item.university_name}</span>
                  <button className="text-teal-700 font-bold hover:underline flex items-center gap-1 cursor-pointer">
                    View Student Registrations <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Invite Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" /> Invite Industry Architect
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">&times;</button>
            </div>

            <form onSubmit={handleSchedule} className="space-y-3 text-xs">
              <div>
                <label className="text-gray-700 font-bold block mb-1">Lecture Topic / Workshop Track</label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-700 font-bold block mb-1">Speaker Name</label>
                  <input
                    type="text"
                    required
                    value={speakerName}
                    onChange={e => setSpeakerName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-teal-500"
                  />
                </div>
                <div>
                  <label className="text-gray-700 font-bold block mb-1">Corporate Employer</label>
                  <input
                    type="text"
                    required
                    value={speakerCompany}
                    onChange={e => setSpeakerCompany(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-700 font-bold block mb-1">Speaker Designation</label>
                <input
                  type="text"
                  value={speakerDesignation}
                  onChange={e => setSpeakerDesignation(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-teal-500"
                />
              </div>

              <div>
                <label className="text-gray-700 font-bold block mb-1">Date & Time Slot</label>
                <input
                  type="text"
                  required
                  value={scheduledDate}
                  onChange={e => setScheduledDate(e.target.value)}
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
                  {scheduling ? 'Scheduling...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Topbar } from '../../components/layout/Topbar';
import { PageLoader } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { MentorshipChat } from '../../components/ui/MentorshipChat';
import { mentorshipAPI } from '../../services/api';
import { MessageSquare, Users, Building, GraduationCap, Briefcase } from 'lucide-react';
import clsx from 'clsx';

export default function Mentorship() {
  const [mentors, setMentors] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [collaborations, setCollaborations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'mentors' | 'requests' | 'collab'>('mentors');

  // Request form state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [form, setForm] = useState({ message: '', topic: '' });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');

  // Chat state
  const [chatRequest, setChatRequest] = useState<any>(null);

  const load = async () => {
    const [m, r, c] = await Promise.all([
      mentorshipAPI.getMentors(),
      mentorshipAPI.getRequests(),
      mentorshipAPI.getCollaborations(),
    ]);
    setMentors(m.data.mentors || []);
    setRequests(r.data.requests || []);
    setCollaborations(c.data.collaborations || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleRequest = async () => {
    if (!selectedMentor) return;
    setSending(true);
    try {
      await mentorshipAPI.request({ mentorId: selectedMentor.id, ...form });
      setSuccess(`Mentorship request sent to ${selectedMentor.name}!`);
      setTimeout(() => setSuccess(''), 5000);
      setShowRequestModal(false);
      setForm({ message: '', topic: '' });
      load(); // refresh requests
    } finally {
      setSending(false);
    }
  };

  if (loading) return <><Topbar title="Mentorship" /><PageLoader /></>;

  const statusBadge: Record<string, any> = {
    PENDING: 'amber', ACCEPTED: 'green', REJECTED: 'red', COMPLETED: 'gray',
  };

  const acceptedCount = requests.filter(r => r.status === 'ACCEPTED').length;
  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  return (
    <div>
      <Topbar title="Mentorship & Collaboration" subtitle="Connect with mentors for personalised guidance" />
      <div className="p-6">
        {success && (
          <div className="mb-4 bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 text-sm text-teal-800">
            {success}
          </div>
        )}

        {/* Summary pills */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-1">
          {[
            ['mentors', `Find Mentors (${mentors.length})`],
            ['requests', `My Requests (${requests.length})`],
            ['collab', `Collaborations (${collaborations.length})`],
          ].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k as any)}
              className={clsx(
                'px-4 py-2 text-sm font-medium rounded-lg border whitespace-nowrap transition-colors',
                tab === k ? 'bg-navy-900 text-white border-navy-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              )}>
              {l}
            </button>
          ))}
        </div>

        {/* ── MENTORS TAB ── */}
        {tab === 'mentors' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mentors.map((m: any) => {
              const alreadyRequested = requests.some(r => r.mentor_id === m.id);
              const accepted = requests.find(r => r.mentor_id === m.id && r.status === 'ACCEPTED');
              return (
                <div key={m.id} className="card hover:shadow-md transition-shadow flex flex-col">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-11 h-11 bg-navy-900 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {m.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{m.name}</p>
                      <p className="text-xs text-gray-500">
                        {m.role === 'ACADEMICIAN' ? (
                          <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" />{m.designation || 'Academician'}</span>
                        ) : (
                          <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />Industry Professional</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400">{m.institution || m.company_name}</p>
                    </div>
                  </div>

                  {m.specialization && (
                    <p className="text-xs text-gray-600 mb-2">
                      <span className="font-medium text-gray-700">Specialization:</span> {m.specialization}
                    </p>
                  )}

                  {m.research_areas && (() => {
                    try {
                      const areas = JSON.parse(m.research_areas);
                      return areas.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {areas.slice(0, 3).map((area: string) => (
                            <span key={area} className="text-xs px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full border border-teal-100">{area}</span>
                          ))}
                        </div>
                      ) : null;
                    } catch { return null; }
                  })()}

                  <div className="mt-auto flex gap-2">
                    {accepted ? (
                      <button
                        onClick={() => setChatRequest({ ...accepted, mentor_name: m.name })}
                        className="btn-teal flex-1 flex items-center justify-center gap-1.5 text-sm"
                      >
                        <MessageSquare className="w-4 h-4" /> Open Chat
                      </button>
                    ) : (
                      <button
                        onClick={() => { setSelectedMentor(m); setForm({ message: '', topic: '' }); setShowRequestModal(true); }}
                        disabled={alreadyRequested}
                        className={clsx(
                          'flex-1 text-sm py-2 rounded-lg border transition-colors font-medium',
                          alreadyRequested
                            ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'bg-navy-900 text-white border-navy-900 hover:bg-navy-800'
                        )}
                      >
                        {alreadyRequested ? 'Request Sent' : 'Request Mentorship'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── REQUESTS TAB ── */}
        {tab === 'requests' && (
          requests.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No mentorship requests yet"
              description="Browse mentors and send a request to start your learning journey."
              action={<button onClick={() => setTab('mentors')} className="btn-primary">Find a Mentor</button>}
            />
          ) : (
            <div className="space-y-3">
              {requests.map((r: any) => (
                <div key={r.id} className="card hover:shadow-sm transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-navy-900 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {r.mentor_name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <p className="font-semibold text-gray-900">{r.mentor_name}</p>
                          <p className="text-sm text-gray-500">{r.mentor_organization || r.mentor_designation || ''}</p>
                        </div>
                        <Badge variant={statusBadge[r.status]}>{r.status}</Badge>
                      </div>

                      {r.topic && (
                        <p className="text-sm text-gray-700 mt-1.5 font-medium">
                          Topic: <span className="font-normal text-gray-600">{r.topic}</span>
                        </p>
                      )}
                      {r.message && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{r.message}</p>
                      )}

                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-xs text-gray-400">
                          Sent {new Date(r.created_at).toLocaleDateString()}
                        </span>
                        {r.status === 'ACCEPTED' && (
                          <button
                            onClick={() => setChatRequest(r)}
                            className="flex items-center gap-1.5 text-xs font-medium text-white bg-teal-500 hover:bg-teal-600 transition-colors px-3 py-1.5 rounded-lg"
                          >
                            <MessageSquare className="w-3.5 h-3.5" /> Open Chat
                          </button>
                        )}
                        {r.status === 'PENDING' && (
                          <span className="text-xs text-amber-600 font-medium">Awaiting response…</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ── COLLABORATIONS TAB ── */}
        {tab === 'collab' && (
          collaborations.length === 0 ? (
            <EmptyState icon={Building} title="No open collaborations" description="Check back later for collaboration opportunities from academicians and industry." />
          ) : (
            <div className="space-y-3">
              {collaborations.map((c: any) => (
                <div key={c.id} className="card">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900">{c.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{c.organization} · {c.type}</p>
                      <p className="text-sm text-gray-600 mt-1">{c.description}</p>
                    </div>
                    <Badge variant="teal">{c.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* ── Request Mentorship Modal ── */}
      <Modal open={showRequestModal} onClose={() => setShowRequestModal(false)} title="Request Mentorship">
        <div className="space-y-4">
          {selectedMentor && (
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
              <div className="w-10 h-10 bg-navy-900 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                {selectedMentor.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{selectedMentor.name}</p>
                <p className="text-sm text-gray-500">{selectedMentor.institution || selectedMentor.company_name}</p>
              </div>
            </div>
          )}
          <div>
            <label className="label">Topic / Subject <span className="text-red-500">*</span></label>
            <input
              className="input"
              placeholder="e.g., Machine Learning Career Path, Resume Review, Research Guidance…"
              value={form.topic}
              onChange={e => setForm({ ...form, topic: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Message to Mentor</label>
            <textarea
              className="input min-h-[110px] resize-none"
              placeholder="Introduce yourself briefly and explain what kind of guidance you're looking for…"
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowRequestModal(false)} className="btn-secondary">Cancel</button>
            <button
              onClick={handleRequest}
              disabled={sending || !form.topic.trim()}
              className="btn-primary"
            >
              {sending ? 'Sending…' : 'Send Request'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Chat Modal ── */}
      {chatRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setChatRequest(null)} />
          <div className="relative w-full max-w-xl">
            <MentorshipChat
              requestId={chatRequest.id}
              topic={chatRequest.topic || 'Mentorship Discussion'}
              otherPartyName={chatRequest.mentor_name || chatRequest.student_name || 'Mentor'}
              status={chatRequest.status}
              onClose={() => setChatRequest(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

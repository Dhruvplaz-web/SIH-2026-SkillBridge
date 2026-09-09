import React, { useEffect, useState } from 'react';
import { Topbar } from '../../components/layout/Topbar';
import { PageLoader } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { MentorshipChat } from '../../components/ui/MentorshipChat';
import { mentorshipAPI } from '../../services/api';
import { MessageSquare, Building } from 'lucide-react';
import clsx from 'clsx';

export default function AcademicianMentorship() {
  const [requests, setRequests] = useState<any[]>([]);
  const [collaborations, setCollaborations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'requests' | 'collab'>('requests');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'RESEARCH', deadline: '' });
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [chatRequest, setChatRequest] = useState<any>(null);

  const load = async () => {
    const [rRes, cRes] = await Promise.all([mentorshipAPI.getRequests(), mentorshipAPI.getCollaborations()]);
    setRequests(rRes.data.requests || []);
    setCollaborations(cRes.data.collaborations || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleStatus = async (id: string, status: string) => {
    setUpdating(id);
    await mentorshipAPI.updateStatus(id, status);
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    setUpdating(null);
  };

  const handleCreate = async () => {
    setSaving(true);
    await mentorshipAPI.createCollaboration(form);
    await load();
    setShowCreate(false);
    setSaving(false);
  };

  if (loading) return <><Topbar title="Mentorship" /><PageLoader /></>;

  const statusBadge: Record<string, any> = { PENDING: 'amber', ACCEPTED: 'green', REJECTED: 'red', COMPLETED: 'gray' };

  const pending = requests.filter(r => r.status === 'PENDING');
  const active  = requests.filter(r => r.status === 'ACCEPTED');
  const others  = requests.filter(r => r.status !== 'PENDING' && r.status !== 'ACCEPTED');

  return (
    <div>
      <Topbar title="Mentorship & Collaborations" subtitle={`${pending.length} pending · ${active.length} active`} />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-3">
            {[
              ['requests', `Requests (${requests.length})`],
              ['collab', `Collaborations (${collaborations.length})`],
            ].map(([k, l]) => (
              <button key={k} onClick={() => setTab(k as any)}
                className={clsx(
                  'px-4 py-2 text-sm font-medium rounded-lg border transition-colors',
                  tab === k ? 'bg-navy-900 text-white border-navy-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                )}>
                {l}
              </button>
            ))}
          </div>
          {tab === 'collab' && (
            <button onClick={() => setShowCreate(true)} className="btn-primary text-sm">Create Collaboration</button>
          )}
        </div>

        {/* ── REQUESTS ── */}
        {tab === 'requests' && (
          requests.length === 0 ? (
            <EmptyState icon={MessageSquare} title="No mentorship requests yet"
              description="Students will appear here when they send you mentorship requests." />
          ) : (
            <div className="space-y-6">
              {/* Pending */}
              {pending.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Awaiting Response ({pending.length})
                  </h3>
                  <div className="space-y-3">
                    {pending.map((r: any) => (
                      <div key={r.id} className="card border-amber-100">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-semibold text-sm flex-shrink-0">
                              {r.student_name?.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900">{r.student_name}</p>
                              <p className="text-xs text-gray-500">{r.institution} · {r.branch}</p>
                              {r.topic && (
                                <p className="text-sm text-gray-700 mt-1">
                                  <span className="font-medium">Topic:</span> {r.topic}
                                </p>
                              )}
                              {r.message && (
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{r.message}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <Badge variant="amber">PENDING</Badge>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleStatus(r.id, 'ACCEPTED')}
                                disabled={updating === r.id}
                                className="text-xs px-3 py-1.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 font-medium"
                              >
                                {updating === r.id ? '…' : 'Accept'}
                              </button>
                              <button
                                onClick={() => handleStatus(r.id, 'REJECTED')}
                                disabled={updating === r.id}
                                className="text-xs px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 font-medium"
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Received {new Date(r.created_at).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active */}
              {active.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Active Sessions ({active.length})
                  </h3>
                  <div className="space-y-3">
                    {active.map((r: any) => (
                      <div key={r.id} className="card border-teal-100">
                        <div className="flex items-start gap-4">
                          <div className="w-9 h-9 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-semibold text-sm flex-shrink-0">
                            {r.student_name?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900">{r.student_name}</p>
                            <p className="text-xs text-gray-500">{r.institution} · {r.branch}</p>
                            {r.topic && <p className="text-sm text-gray-600 mt-0.5">{r.topic}</p>}
                          </div>
                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <Badge variant="green">ACCEPTED</Badge>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setChatRequest(r)}
                                className="flex items-center gap-1.5 text-xs bg-navy-900 text-white px-3 py-1.5 rounded-lg hover:bg-navy-800 transition-colors font-medium"
                              >
                                <MessageSquare className="w-3.5 h-3.5" /> Chat
                              </button>
                              <button
                                onClick={() => handleStatus(r.id, 'COMPLETED')}
                                disabled={updating === r.id}
                                className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                              >
                                Complete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed / Rejected */}
              {others.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Past Requests</h3>
                  <div className="space-y-2">
                    {others.map((r: any) => (
                      <div key={r.id} className="card py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-semibold text-xs">
                            {r.student_name?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700">{r.student_name}</p>
                            <p className="text-xs text-gray-400">{r.topic}</p>
                          </div>
                          <Badge variant={statusBadge[r.status]}>{r.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        )}

        {/* ── COLLABORATIONS ── */}
        {tab === 'collab' && (
          <div className="space-y-3">
            {collaborations.map((c: any) => (
              <div key={c.id} className="card">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900">{c.title}</p>
                    <p className="text-sm text-gray-500">{c.type} · {c.organization}</p>
                    <p className="text-sm text-gray-600 mt-1">{c.description}</p>
                  </div>
                  <Badge variant="teal">{c.status}</Badge>
                </div>
              </div>
            ))}
            {collaborations.length === 0 && (
              <EmptyState icon={Building} title="No collaborations yet"
                description="Create a collaboration to connect students with industry or research opportunities."
                action={<button onClick={() => setShowCreate(true)} className="btn-primary">Create Collaboration</button>} />
            )}
          </div>
        )}
      </div>

      {/* ── Create Collaboration Modal ── */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Collaboration">
        <div className="space-y-4">
          <div>
            <label className="label">Title <span className="text-red-500">*</span></label>
            <input className="input" placeholder="e.g., ML Research Collaboration, Industry Workshop" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label">Type</label>
            <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="RESEARCH">Research</option>
              <option value="FDP">FDP (Faculty Development)</option>
              <option value="WORKSHOP">Workshop</option>
              <option value="PROJECT">Project</option>
            </select>
          </div>
          <div>
            <label className="label">Description <span className="text-red-500">*</span></label>
            <textarea className="input min-h-[90px] resize-none" placeholder="Describe the collaboration opportunity…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label">Deadline (optional)</label>
            <input className="input" type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleCreate} disabled={!form.title || !form.description || saving} className="btn-primary">
              {saving ? 'Creating…' : 'Create Collaboration'}
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
              otherPartyName={chatRequest.student_name || 'Student'}
              status={chatRequest.status}
              onClose={() => setChatRequest(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

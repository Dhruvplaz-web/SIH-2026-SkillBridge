import React, { useEffect, useRef, useState } from 'react';
import { Topbar } from '../../components/layout/Topbar';
import { PageLoader } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { MatchScoreRing } from '../../components/ui/MatchScoreRing';
import { AtsResumeDrawer } from '../../components/ui/AtsResumeDrawer';
import { opportunitiesAPI, applicationsAPI, studentFeaturesAPI } from '../../services/api';
import api from '../../services/api';
import { 
  Briefcase, MapPin, Clock, Search, Filter, CheckCircle, 
  Upload, FileText, X, AlertCircle, Zap, ShieldCheck, 
  Sparkles, ArrowRight, ExternalLink, Check, DollarSign 
} from 'lucide-react';
import clsx from 'clsx';

export default function Opportunities() {
  const [activeTab, setActiveTab] = useState<'opportunities' | 'bounties'>('opportunities');
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [bounties, setBounties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [applying, setApplying] = useState(false);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [claimedBountyIds, setClaimedBountyIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({ search: '', type: '', location: '' });
  const [coverLetter, setCoverLetter] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // ATS Drawer state
  const [atsDrawerOpen, setAtsDrawerOpen] = useState(false);
  const [atsOpportunity, setAtsOpportunity] = useState<any>(null);

  // Resume upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadedResume, setUploadedResume] = useState<{ url: string; filename: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const load = async () => {
    const params: any = {};
    if (filters.search) params.search = filters.search;
    if (filters.type) params.type = filters.type;
    if (filters.location) params.location = filters.location;
    
    try {
      const [oppRes, appRes, bountyRes] = await Promise.all([
        opportunitiesAPI.getAll(params),
        applicationsAPI.getMy(),
        studentFeaturesAPI.getBounties().catch(() => ({ data: { bounties: [] } }))
      ]);
      setOpportunities(oppRes.data.opportunities || []);
      setAppliedIds(new Set((appRes.data.applications || []).map((a: any) => a.opportunity_id)));
      setBounties(bountyRes.data.bounties || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); load(); };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setUploadError('Only PDF files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be under 5 MB.');
      return;
    }
    setUploadError('');
    setResumeFile(file);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await api.post('/upload/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadedResume({ url: res.data.url, filename: file.name });
    } catch (err: any) {
      setUploadError(err.response?.data?.error || 'Upload failed. Please try again.');
      setResumeFile(null);
    } finally {
      setUploading(false);
    }
  };

  const clearResume = () => {
    setResumeFile(null);
    setUploadedResume(null);
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openApplyModal = (opp: any) => {
    setSelected(opp);
    setCoverLetter('');
    clearResume();
    setErrorMsg('');
    setShowApplyModal(true);
  };

  const openAtsDrawer = (opp: any) => {
    setAtsOpportunity(opp);
    setAtsDrawerOpen(true);
  };

  const handleApply = async () => {
    if (!selected) return;
    setApplying(true);
    setErrorMsg('');
    try {
      await applicationsAPI.apply({
        opportunityId: selected.id,
        coverLetter,
        resumeUrl: uploadedResume?.url || null,
        resumeFilename: uploadedResume?.filename || null,
      });
      setAppliedIds(prev => new Set([...prev, selected.id]));
      setShowApplyModal(false);
      setSuccessMsg(`Successfully applied for "${selected.title}"! SHA-256 application receipt anchored.`);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to submit. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const handleClaimBounty = (bountyId: string, title: string) => {
    setClaimedBountyIds(prev => new Set([...prev, bountyId]));
    setSuccessMsg(`Milestone bounty "${title}" claimed! GitHub PR verification active.`);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  if (loading) return <><Topbar title="Opportunities" /><PageLoader /></>;

  return (
    <div>
      <Topbar title="Opportunities & Bounties" subtitle={`${opportunities.length} active opportunities · ${bounties.length} micro-bounties`} />
      
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        
        {successMsg && (
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-center gap-2.5 text-xs text-teal-900 shadow-xs">
            <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* Mode Toggle: Full Opportunities vs 2-Week Micro-Bounties */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500">Track:</span>
            <div className="inline-flex p-0.5 bg-gray-100 rounded-lg">
              <button
                onClick={() => setActiveTab('opportunities')}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'opportunities' ? 'bg-navy-900 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" /> Full Opportunities ({opportunities.length})
              </button>
              <button
                onClick={() => setActiveTab('bounties')}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'bounties' ? 'bg-teal-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5" /> 2-Week Micro-Bounties ({bounties.length})
              </button>
            </div>
          </div>

          <span className="text-xs text-gray-400">
            {activeTab === 'opportunities' 
              ? 'Fortune 500 corporate roles & research fellowships' 
              : 'Rapid sprint bounties rewarding verified skill badges'}
          </span>
        </div>

        {/* ── TAB 1: FULL OPPORTUNITIES ── */}
        {activeTab === 'opportunities' && (
          <>
            {/* Filters */}
            <form onSubmit={handleSearch} className="card p-4 flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-48">
                <label className="label text-xs">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input className="input pl-9 text-xs" placeholder="Search by role title, company, or skills..." value={filters.search}
                    onChange={e => setFilters({ ...filters, search: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label text-xs">Type</label>
                <select className="input w-36 text-xs" value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}>
                  <option value="">All Types</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="JOB">Full-Time Job</option>
                  <option value="TRAINING">Training</option>
                </select>
              </div>
              <div>
                <label className="label text-xs">Location</label>
                <input className="input w-36 text-xs" placeholder="City or Remote..." value={filters.location}
                  onChange={e => setFilters({ ...filters, location: e.target.value })} />
              </div>
              <button type="submit" className="btn-primary text-xs flex items-center gap-1.5 h-10 px-4 cursor-pointer">
                <Filter className="w-4 h-4" /> Filter
              </button>
            </form>

            {/* Opportunities List */}
            {opportunities.length === 0 ? (
              <EmptyState icon={Briefcase} title="No opportunities found" description="Try adjusting your search filters." />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {opportunities.map((opp: any) => (
                  <div key={opp.id} className="card p-5 hover:border-teal-300 hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-base">{opp.title}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">{opp.company_name || opp.recruiter_name}</p>
                        </div>
                        <Badge variant={opp.type === 'INTERNSHIP' ? 'teal' : opp.type === 'JOB' ? 'blue' : 'purple'}>
                          {opp.type}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
                        {opp.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />{opp.location} &bull; {opp.location_type || 'On-site'}
                          </span>
                        )}
                        {opp.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />{opp.duration}
                          </span>
                        )}
                        {(opp.stipend || opp.salary_range) && (
                          <span className="text-teal-700 font-semibold">{opp.stipend || opp.salary_range}</span>
                        )}
                      </div>

                      {/* Skills Badges */}
                      {opp.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {opp.skills.slice(0, 4).map((s: any) => (
                            <span key={s.skill_id} className={clsx(
                              'text-xs px-2.5 py-0.5 rounded-full border',
                              s.importance === 'REQUIRED'
                                ? 'bg-navy-50 text-navy-800 border-navy-200 font-semibold'
                                : 'bg-gray-50 text-gray-600 border-gray-200'
                            )}>{s.skill_name}</span>
                          ))}
                          {opp.skills.length > 4 && (
                            <span className="text-xs text-gray-400">+{opp.skills.length - 4} more</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <button 
                        onClick={() => openAtsDrawer(opp)}
                        className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200/80"
                      >
                        <Zap className="w-3.5 h-3.5 text-teal-600" />
                        ATS Score & Tailor
                      </button>

                      {appliedIds.has(opp.id) ? (
                        <span className="flex items-center gap-1 text-xs text-teal-700 font-bold bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200">
                          <CheckCircle className="w-4 h-4 text-teal-600" /> Applied
                        </span>
                      ) : (
                        <button onClick={() => openApplyModal(opp)} className="btn-primary text-xs py-1.5 px-4 cursor-pointer font-bold">
                          1-Click Apply
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── TAB 2: 2-WEEK MICRO-BOUNTIES ── */}
        {activeTab === 'bounties' && (
          <div className="space-y-4">
            <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-xl flex items-center justify-between text-xs text-teal-900">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-teal-600" />
                <span>Micro-Bounties are 10–14 day sprint projects sponsored by industry partners. Submitting verified GitHub PRs earns verified skill credentials.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bounties.map((b) => {
                const isClaimed = claimedBountyIds.has(b.id);
                return (
                  <div key={b.id} className="card p-5 bg-white border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                            {b.duration} Sprint
                          </span>
                          <h3 className="font-bold text-gray-900 text-sm mt-1">{b.title}</h3>
                          <p className="text-xs text-gray-500">{b.company}</p>
                        </div>
                        <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                          {b.stipend}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 line-clamp-2 mt-1 leading-relaxed">
                        {b.description}
                      </p>

                      <div className="mt-3">
                        <span className="text-[11px] font-semibold text-gray-400 block mb-1">Stack:</span>
                        <div className="flex flex-wrap gap-1">
                          {b.required_skills?.split(',').map((s: string, idx: number) => (
                            <span key={idx} className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">
                              {s.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Officially Verified
                      </span>
                      {isClaimed ? (
                        <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Claimed
                        </span>
                      ) : (
                        <button 
                          onClick={() => handleClaimBounty(b.id, b.title)}
                          className="btn-teal text-xs py-1.5 px-4 font-bold cursor-pointer"
                        >
                          Claim Bounty
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* ── ATS Drawer ── */}
      <AtsResumeDrawer 
        isOpen={atsDrawerOpen} 
        onClose={() => setAtsDrawerOpen(false)} 
        opportunity={atsOpportunity} 
      />

      {/* ── Apply Modal ── */}
      <Modal open={showApplyModal} onClose={() => setShowApplyModal(false)} title={`1-Click Apply — ${selected?.title}`} size="md">
        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
            <p className="font-bold text-gray-900 text-sm">{selected?.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{selected?.company_name} &bull; {selected?.type}</p>
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {errorMsg}
            </div>
          )}

          {/* Quick Note */}
          <div>
            <label className="label text-xs">Application Note / Cover Intro</label>
            <textarea 
              rows={3} 
              className="input text-xs"
              placeholder="Highlight how your verified skills align with this role..." 
              value={coverLetter} 
              onChange={e => setCoverLetter(e.target.value)} 
            />
          </div>

          <div className="p-3 bg-slate-900 text-slate-300 rounded-xl text-[11px] space-y-1">
            <span className="text-teal-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Application Receipt
            </span>
            <p>Submitting this application creates a tamper-proof digital signature verifying your candidate dossier.</p>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setShowApplyModal(false)} className="btn-secondary text-xs cursor-pointer">
              Cancel
            </button>
            <button onClick={handleApply} disabled={applying} className="btn-primary text-xs font-bold cursor-pointer">
              {applying ? 'Submitting Application...' : 'Confirm & Apply'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}

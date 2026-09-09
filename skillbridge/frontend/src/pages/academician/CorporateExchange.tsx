import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Handshake, Building, DollarSign, Calendar, Users, 
  Send, CheckCircle2, FileText, Sparkles, Filter, Briefcase
} from 'lucide-react';
import { Topbar } from '../../components/layout/Topbar';
import { PageLoader } from '../../components/ui/Spinner';
import { academicianFeaturesAPI } from '../../services/api';

export default function CorporateExchange() {
  const [consultancies, setConsultancies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsultancy, setSelectedConsultancy] = useState<any>(null);
  const [proposalSummary, setProposalSummary] = useState('');
  const [quotedBudget, setQuotedBudget] = useState('₹14,00,000');
  const [durationWeeks, setDurationWeeks] = useState(12);
  const [studentSlots, setStudentSlots] = useState(2);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadConsultancies();
  }, []);

  const loadConsultancies = async () => {
    try {
      const res = await academicianFeaturesAPI.getConsultancies();
      setConsultancies(res.data.consultancies || []);
    } catch (err) {
      console.error('Failed to load consultancies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBidModal = (c: any) => {
    setSelectedConsultancy(c);
    setQuotedBudget(c.budget);
    setProposalSummary(`Proposal for ${c.title}:\nOur department research lab specializes in ${c.domain}. We propose an agile 3-phase milestone execution involving 1 Principal Investigator and ${studentSlots} postgraduate student research fellows.`);
    setSuccessMsg('');
  };

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConsultancy) return;
    setSubmitting(true);
    try {
      await academicianFeaturesAPI.submitConsultancyBid({
        consultancyId: selectedConsultancy.id,
        proposalSummary,
        quotedBudget,
        durationWeeks,
        studentSlots
      });
      setSuccessMsg('Proposal submitted successfully! The corporate sponsor research committee has received your dossier.');
      loadConsultancies();
      setTimeout(() => {
        setSelectedConsultancy(null);
      }, 1500);
    } catch (err) {
      console.error('Bid submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <><Topbar title="Corporate Consultancy & R&D Exchange" /><PageLoader /></>;

  return (
    <div>
      <Topbar 
        title="Corporate Consultancy & Sponsored R&D Exchange" 
        subtitle="Marketplace connecting enterprise research bottlenecks with university professors and funded student research fellows"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* Overview Header */}
        <div className="card p-6 bg-white border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Handshake className="w-5 h-5 text-teal-600" /> Active Corporate Research Solicitations
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Submit institutional bids to secure corporate research grants, faculty consultancy retainers, and funded student stipend slots.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200">
              Total Active Grants: ₹45.5 Lakhs
            </span>
          </div>
        </div>

        {/* Consultancy Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {consultancies.map(c => (
            <div 
              key={c.id} 
              className="card p-5 bg-white border border-gray-200 hover:border-teal-300 hover:shadow-sm transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-900 flex items-center gap-1.5 truncate">
                    <Building className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" /> {c.company_name}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    {c.bids_count} Bids
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900 leading-snug">{c.title}</h3>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded mt-1.5 inline-block">
                    {c.domain}
                  </span>
                </div>

                <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                  {c.bottleneck_description}
                </p>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Funded Research Grant:</span>
                    <strong className="text-emerald-700 font-bold">{c.budget}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Submission Deadline:</span>
                    <span className="text-slate-800 font-medium">{c.deadline}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleOpenBidModal(c)}
                className="btn-primary w-full py-2 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" /> Submit Faculty Proposal
              </button>
            </div>
          ))}
        </div>

      </div>

      {/* Bid Submission Modal */}
      {selectedConsultancy && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-200 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" /> Faculty Research Proposal Dossier
              </h3>
              <button onClick={() => setSelectedConsultancy(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">&times;</button>
            </div>

            {successMsg ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitBid} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-gray-700 font-bold block mb-1">Corporate Sponsor Problem</label>
                  <input
                    type="text"
                    disabled
                    value={selectedConsultancy.title}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-700 font-bold block mb-1">Quoted Budget Proposal</label>
                    <input
                      type="text"
                      required
                      value={quotedBudget}
                      onChange={e => setQuotedBudget(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:outline-teal-500 font-bold text-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 font-bold block mb-1">Student Fellow Slots</label>
                    <input
                      type="number"
                      min={1}
                      max={6}
                      value={studentSlots}
                      onChange={e => setStudentSlots(parseInt(e.target.value) || 2)}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:outline-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-700 font-bold block mb-1">Technical Methodology & Proposal Summary</label>
                  <textarea
                    rows={5}
                    required
                    value={proposalSummary}
                    onChange={e => setProposalSummary(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 leading-relaxed focus:outline-teal-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedConsultancy(null)}
                    className="btn-secondary flex-1 py-2 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary flex-1 py-2 text-xs font-bold cursor-pointer"
                  >
                    {submitting ? 'Submitting...' : 'Dispatch Research Bid'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}

    </div>
  );
}

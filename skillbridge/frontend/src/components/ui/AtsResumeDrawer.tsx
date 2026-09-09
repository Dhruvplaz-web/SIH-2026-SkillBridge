import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Sparkles, CheckCircle2, AlertCircle, FileText, 
  ArrowRight, ShieldCheck, Loader2, Check, Zap 
} from 'lucide-react';
import { studentFeaturesAPI } from '../../services/api';

interface AtsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: { id: string; title: string; company_name?: string } | null;
}

export function AtsResumeDrawer({ isOpen, onClose, opportunity }: AtsDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && opportunity?.id) {
      loadScore(opportunity.id);
    } else {
      setData(null);
    }
  }, [isOpen, opportunity?.id]);

  const loadScore = async (oppId: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await studentFeaturesAPI.scoreAtsResume(oppId);
      setData(res.data);
    } catch (err: any) {
      setError('Unable to score resume against ATS requisitions.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">ATS Resume Scorer & Tailor</h3>
              <p className="text-[11px] text-slate-400 truncate max-w-[220px]">
                {opportunity?.title} &bull; {opportunity?.company_name}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
              <p className="text-xs font-medium text-gray-500">Cross-referencing resume against corporate ATS filters...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          ) : data ? (
            <>
              {/* Score Display Card */}
              <div className="p-5 bg-gradient-to-br from-slate-900 to-navy-900 rounded-2xl text-white text-center shadow-md relative overflow-hidden">
                <div className="relative z-10">
                  <span className="text-[11px] font-bold text-teal-300 uppercase tracking-widest block mb-1">
                    ATS Match Calibration
                  </span>
                  <div className="flex items-baseline justify-center gap-1 my-2">
                    <span className="text-5xl font-black tracking-tight text-white">{data.atsScore}</span>
                    <span className="text-2xl font-bold text-teal-400">%</span>
                  </div>
                  <p className="text-xs text-slate-300 max-w-xs mx-auto">
                    {data.atsScore >= 80 
                      ? 'High probability of passing automated screening filters.' 
                      : 'Moderate keyword alignment. Address missing competencies below to maximize interview call rates.'}
                  </p>
                </div>
                <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-teal-500/10 rounded-full blur-xl pointer-events-none" />
              </div>

              {/* Recommendation Box */}
              <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900">AI Tailoring Directive</h4>
                  <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                    {data.recommendation}
                  </p>
                </div>
              </div>

              {/* Matching Keywords */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Matched Keywords ({data.matchingKeywords?.length || 0})
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    Detected in Profile
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {data.matchingKeywords?.length > 0 ? (
                    data.matchingKeywords.map((kw: string) => (
                      <span 
                        key={kw} 
                        className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 font-medium rounded-lg border border-emerald-200"
                      >
                        {kw}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400 italic">No matching keywords detected.</span>
                  )}
                </div>
              </div>

              {/* Missing Keywords */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    Recommended Keywords ({data.missingKeywords?.length || 0})
                  </span>
                  <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                    ATS Requisition Gap
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {data.missingKeywords?.length > 0 ? (
                    data.missingKeywords.map((kw: string) => (
                      <span 
                        key={kw} 
                        className="text-xs px-2.5 py-1 bg-amber-50 text-amber-800 font-medium rounded-lg border border-amber-200"
                      >
                        + {kw}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> All critical keywords satisfied!
                    </span>
                  )}
                </div>
              </div>

              {/* Best Practice Notice */}
              <div className="border-t border-gray-100 pt-4 text-[11px] text-gray-400 space-y-1">
                <p>&bull; Calibrated against Fortune 500 applicant tracking systems (Taleo, Workday, Greenhouse).</p>
                <p>&bull; Incorporate missing keywords directly into your project descriptions or verified portfolio.</p>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-2">
          <button 
            onClick={onClose} 
            className="btn-secondary w-full text-xs cursor-pointer"
          >
            Close Drawer
          </button>
        </div>
      </motion.div>
    </div>
  );
}

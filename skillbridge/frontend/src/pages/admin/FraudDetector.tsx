import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, AlertTriangle, CheckCircle2, 
  Ban, ShieldCheck, Mail, Building, RefreshCw 
} from 'lucide-react';
import { Topbar } from '../../components/layout/Topbar';
import { PageLoader } from '../../components/ui/Spinner';
import { adminFeaturesAPI } from '../../services/api';

export default function FraudDetector() {
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [blacklistingId, setBlacklistingId] = useState<string | null>(null);

  useEffect(() => {
    loadAudits();
  }, []);

  const loadAudits = async () => {
    try {
      const res = await adminFeaturesAPI.getFraudAudits();
      setAudits(res.data.fraudAudits || []);
    } catch (err) {
      console.error('Failed to load fraud audits:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlacklist = async (oppId: string) => {
    setBlacklistingId(oppId);
    try {
      await adminFeaturesAPI.blacklistJob(oppId);
      setAudits(prev => prev.map(a => a.opportunityId === oppId ? { ...a, status: 'BLACKLISTED', blacklisted: true } : a));
    } catch (err) {
      console.error('Blacklist failed:', err);
    } finally {
      setBlacklistingId(null);
    }
  };

  if (loading) return <><Topbar title="Job Fraud Detector" /><PageLoader /></>;

  return (
    <div>
      <Topbar 
        title="Fraudulent Job Posting & Scam Recruiter Detector" 
        subtitle="AI-powered forensic crawler auditing recruiter job listings for ghost companies, registration fee scams, and illicit placement drives"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* Action Header Card */}
        <div className="card p-6 bg-white border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" /> Active Job Fraud Audits
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Ensures student safety under Ministry of Labour & Employment guidelines. 1-click blacklisting terminates recruiter posting permissions immediately.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            Scanning Engine: Real-Time Active
          </span>
        </div>

        {/* Audits Grid */}
        <div className="space-y-4">
          {audits.map(item => (
            <div 
              key={item.id} 
              className={`card p-5 border transition-all ${
                item.blacklisted 
                  ? 'bg-gray-100 border-gray-300 opacity-60' 
                  : item.riskScore > 60 
                    ? 'bg-red-50/50 border-red-200 hover:border-red-300' 
                    : 'bg-white border-gray-200 hover:border-teal-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
                    <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-gray-400" /> {item.companyName}
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">({item.recruiterEmail})</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    {item.flags.map((flag: string, idx: number) => (
                      <span 
                        key={idx} 
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          item.riskScore > 60 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Risk Score Pill & Action */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Scam Risk Score</span>
                    <span className={`text-base font-extrabold font-mono ${
                      item.riskScore > 60 ? 'text-red-600' : 'text-emerald-600'
                    }`}>
                      {item.riskScore}%
                    </span>
                  </div>

                  {!item.blacklisted ? (
                    <button
                      onClick={() => handleBlacklist(item.opportunityId)}
                      disabled={blacklistingId === item.opportunityId}
                      className="text-xs font-bold px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      {blacklistingId === item.opportunityId ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
                      Blacklist Job
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-gray-500 bg-gray-200 px-3 py-1.5 rounded-xl flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Blacklisted
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}

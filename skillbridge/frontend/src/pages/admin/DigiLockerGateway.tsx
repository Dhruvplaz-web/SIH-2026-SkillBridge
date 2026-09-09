import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, ShieldCheck, CheckCircle2, RefreshCw, 
  ExternalLink, FileText, Sparkles, Building 
} from 'lucide-react';
import { Topbar } from '../../components/layout/Topbar';
import { adminFeaturesAPI } from '../../services/api';

export default function DigiLockerGateway() {
  const [syncing, setSyncing] = useState(false);
  const [syncData, setSyncData] = useState<any>(null);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await adminFeaturesAPI.syncDigiLockerABC();
      setSyncData(res.data.syncRecord);
    } catch (err) {
      console.error('DigiLocker sync error:', err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <Topbar 
        title="Academic Bank of Credits (ABC) & DigiLocker Gateway" 
        subtitle="National Education Policy (NEP 2020) academic credit synchronization engine translating verified internship hours into university credits"
      />

      <div className="p-6 max-w-5xl mx-auto space-y-6">

        {/* Action Header Card */}
        <div className="card p-6 bg-gradient-to-r from-blue-900 to-navy-900 text-white border-0 shadow-md">
          <div className="max-w-2xl space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-400/20 text-blue-300 border border-blue-400/30 inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Ministry of Education (MoE) & DigiLocker Live Gateway
            </span>
            <h2 className="text-lg font-bold text-white">Seamless National Credit Accumulation & Transfer</h2>
            <p className="text-xs text-blue-200 leading-relaxed">
              Under NEP 2020, verified industry internships, proctored coding certifications, and micro-internships qualify for 
              formal university credit transfer. The DigiLocker ABC gateway converts verified student skill badges into authenticated credit records.
            </p>
          </div>
        </div>

        {/* Gateway Sync Card */}
        <div className="card p-6 bg-white border border-gray-200 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-teal-600" /> DigiLocker ABC Node Dispatcher
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Target Node: <span className="font-mono font-semibold">https://api.digitallocker.gov.in/abc/v2/sync</span>
              </p>
            </div>

            <button
              onClick={handleSync}
              disabled={syncing}
              className="btn-primary text-xs font-bold px-4 py-2 flex items-center gap-2 cursor-pointer shadow-sm"
            >
              {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {syncing ? 'Connecting to ABC Gateway...' : 'Sync Academic Bank of Credits'}
            </button>
          </div>

          {syncData ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Official DigiLocker ABC Synchronization Confirmed
                </span>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {syncData.abcAccountId}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-emerald-200">
                  <span className="text-gray-400 text-[10px] block">Student Name</span>
                  <strong className="text-gray-900 text-sm">{syncData.studentName}</strong>
                </div>
                <div className="p-3 bg-white rounded-xl border border-emerald-200">
                  <span className="text-gray-400 text-[10px] block">Accrued Academic Credits</span>
                  <strong className="text-teal-700 text-sm font-mono font-bold">+{syncData.totalCredits} NEP Credits</strong>
                </div>
                <div className="p-3 bg-white rounded-xl border border-emerald-200">
                  <span className="text-gray-400 text-[10px] block">Verified Internship Hours</span>
                  <strong className="text-gray-900 text-sm font-mono">{syncData.verifiedInternshipHours} Hours</strong>
                </div>
              </div>

              <p className="text-[11px] text-emerald-800">
                &bull; Transferred to National Academic Depository (NAD) with immutable digital signature. Eligible for final degree credit exemption.
              </p>
            </motion.div>
          ) : (
            <div className="p-8 text-center text-gray-400 bg-slate-50 rounded-xl border border-dashed border-gray-200">
              <Database className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-xs font-semibold text-gray-700">Gateway Standby</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Click the sync button above to trigger an NEP 2020 credit synchronization audit.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Search, Cpu, Check, Copy, ExternalLink, 
  Layers, ArrowRight, Sparkles, Filter, RefreshCw 
} from 'lucide-react';
import { studentFeaturesAPI } from '../../services/api';
import { Topbar } from '../../components/layout/Topbar';

export default function TrustLedger() {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLedger = async (query?: string) => {
    setLoading(true);
    try {
      const res = await studentFeaturesAPI.getTrustLedger(query);
      setBlocks(res.data.blocks || []);
    } catch (err) {
      console.error('Failed to load TrustLedger:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLedger();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadLedger(searchTerm.trim());
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  return (
    <div>
      <Topbar 
        title="Sovereign Cryptographic TrustLedger" 
        subtitle="Immutable SHA-256 competency attestations anchored to authorized institutional public keys" 
      />

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        
        {/* Banner Hero Card */}
        <div className="bg-gradient-to-r from-slate-950 via-navy-950 to-teal-950 rounded-2xl p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> Zero-Trust Mathematical Proof
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Anti-Forgery Distributed Competency Registry
            </h2>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Every proctored assessment score, verified diploma, and hackathon achievement on SkillBridge is anchored with a deterministic SHA-256 block hash, preventing resume inflation and fake certificates.
            </p>
          </div>
          <div className="absolute right-4 -bottom-8 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <form onSubmit={handleSearch} className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search by student name, skill, endorser (e.g. IIT Delhi), or 0x block hash..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white"
            />
          </form>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button 
              onClick={() => { setSearchTerm(''); loadLedger(); }}
              className="btn-secondary text-xs flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Blocks
            </button>
          </div>
        </div>

        {/* Blocks Feed */}
        {loading ? (
          <div className="bg-white p-12 text-center rounded-xl border border-gray-200 space-y-3">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-500">Querying sovereign attestation blocks...</p>
          </div>
        ) : blocks.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-gray-200">
            <ShieldCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-gray-800">No Ledger Blocks Found</h3>
            <p className="text-xs text-gray-400 mt-1">Try resetting your search query or verify a new certificate.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {blocks.map((b) => (
              <motion.div 
                key={b.id || b.block_hash}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 hover:border-teal-300 hover:shadow-sm transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60">
                          {b.id}
                        </span>
                        <h4 className="text-sm font-bold text-gray-900">{b.skill_name}</h4>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <Check className="w-3 h-3" /> Attested
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Candidate: <strong className="text-gray-900">{b.student_name}</strong> &bull; Endorsed by: <span className="text-teal-700 font-medium">{b.endorser}</span>
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap self-start sm:self-center">
                    {b.timestamp || 'Attested'}
                  </span>
                </div>

                {/* Cryptographic SHA-256 Hash Container */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-lg">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
                      SHA-256:
                    </span>
                    <span className="font-mono text-xs text-slate-700 truncate select-all">
                      {b.block_hash}
                    </span>
                  </div>
                  <button 
                    onClick={() => copyHash(b.block_hash)}
                    className="p-1.5 bg-white hover:bg-slate-100 border border-gray-200 text-gray-600 rounded-md transition-colors cursor-pointer flex-shrink-0 text-xs flex items-center gap-1"
                    title="Copy full cryptographic hash"
                  >
                    {copiedHash === b.block_hash ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[10px] text-emerald-600 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-[10px] font-medium text-gray-600">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

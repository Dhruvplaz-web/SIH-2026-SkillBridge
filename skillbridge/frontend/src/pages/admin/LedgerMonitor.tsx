import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, ShieldCheck, CheckCircle2, Server, 
  Cpu, Wifi, Database, Layers, Lock 
} from 'lucide-react';
import { Topbar } from '../../components/layout/Topbar';
import { PageLoader } from '../../components/ui/Spinner';
import { adminFeaturesAPI } from '../../services/api';

export default function LedgerMonitor() {
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTelemetry();
  }, []);

  const loadTelemetry = async () => {
    try {
      const res = await adminFeaturesAPI.getNodeStatus();
      setTelemetry(res.data);
    } catch (err) {
      console.error('Failed to load node telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <><Topbar title="TrustLedger Node Monitor" /><PageLoader /></>;

  return (
    <div>
      <Topbar 
        title="TrustLedger Sovereign Node Monitor & Regulatory Telemetry" 
        subtitle="Live cryptographic quorum validator network telemetry and national statutory compliance audit benchmarks"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* Action Header Card */}
        <div className="card p-6 bg-slate-900 text-white border border-slate-800 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Sovereign Distributed Ledger Network
              </span>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Consensus: {telemetry?.consensusProtocol}
              </h2>
              <p className="text-xs text-slate-400">
                Guarantees zero-tampering, NSQF certification provenance, and student privacy across participating Indian universities.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                <span className="text-slate-400 text-[10px] block">Block Height</span>
                <strong className="text-teal-400 text-sm">#{telemetry?.currentBlockHeight}</strong>
              </div>
              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                <span className="text-slate-400 text-[10px] block">Validator Quorum</span>
                <strong className="text-emerald-400 text-sm">{telemetry?.activeValidationNodes} Active Nodes</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Statutory Compliance Audit Benchmarks */}
        <div className="card p-5 bg-white border border-gray-200 space-y-3">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-teal-600" /> Regulatory & Statutory Compliance Benchmarks
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">AICTE Model Curriculum</span>
              <strong className="text-teal-700 text-base font-extrabold">{telemetry?.complianceBenchmarks?.aicteNormsAlignment}</strong>
              <p className="text-slate-500 text-[11px]">Accreditation aligned</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">DPDP Act 2023 Redaction</span>
              <strong className="text-emerald-700 text-base font-extrabold">{telemetry?.complianceBenchmarks?.dpdpAct2023PiiRedactionAudit}</strong>
              <p className="text-slate-500 text-[11px]">Zero PII leak audit</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">NEP 2020 ABC Transfer</span>
              <strong className="text-purple-700 text-base font-extrabold">{telemetry?.complianceBenchmarks?.nep2020AbcCreditAdherence}</strong>
              <p className="text-slate-500 text-[11px]">Credit bank compliant</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">NAAC Criterion 5 Attestation</span>
              <strong className="text-blue-700 text-base font-extrabold">{telemetry?.complianceBenchmarks?.naacCriterion5PlacementAttestation}</strong>
              <p className="text-slate-500 text-[11px]">Placement authenticated</p>
            </div>
          </div>
        </div>

        {/* Distributed Validator Nodes Table */}
        <div className="card p-5 bg-white border border-gray-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Server className="w-4 h-4 text-teal-600" /> Distributed Validator Nodes
            </h3>
            <span className="text-[11px] font-mono text-gray-400">Institutional Quorum</span>
          </div>

          <div className="space-y-2">
            {telemetry?.validatorNodes?.map((node: any, idx: number) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <strong className="text-gray-900 font-mono">{node.node}</strong>
                </div>

                <div className="flex items-center gap-6 text-gray-600">
                  <span className="font-mono text-[11px]">Latency: <strong className="text-slate-900">{node.latencyMs} ms</strong></span>
                  <span className="font-mono text-[11px]">Last Hash: <strong className="text-teal-700">{node.lastBlockHashed}</strong></span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    {node.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

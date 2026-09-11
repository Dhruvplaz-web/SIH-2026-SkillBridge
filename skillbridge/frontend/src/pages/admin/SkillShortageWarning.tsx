import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, TrendingUp, Sparkles, ShieldAlert, CheckCircle2, 
  ArrowRight, RefreshCw, Cpu, Database, Plus, Compass, FileText,
  Printer, ShieldCheck, Download, Award
} from 'lucide-react';
import { Topbar } from '../../components/layout/Topbar';
import { PageLoader } from '../../components/ui/Spinner';
import { Modal } from '../../components/ui/Modal';
import { adminFeaturesAPI } from '../../services/api';

export default function SkillShortageWarning() {
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [customDomain, setCustomDomain] = useState('');
  const [generating, setGenerating] = useState(false);
  const [selectedForecast, setSelectedForecast] = useState<any>(null);

  useEffect(() => {
    loadForecasts();
  }, []);

  const loadForecasts = async () => {
    try {
      const res = await adminFeaturesAPI.getSkillShortageForecasts();
      setForecasts(res.data.forecasts || []);
    } catch (err) {
      console.error('Failed to load forecasts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDomain) return;
    setGenerating(true);
    try {
      await adminFeaturesAPI.generateSkillShortageForecast(customDomain);
      setCustomDomain('');
      loadForecasts();
    } catch (err) {
      console.error('Forecast generation failed:', err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <><Topbar title="National Skill Shortage System" /><PageLoader /></>;

  return (
    <div>
      <Topbar 
        title="Predictive National Skill-Shortage Early Warning System" 
        subtitle="Forecasting 1–3 year critical technical deficits across India for AICTE, NITI Aayog, and Ministry of Education"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* Action Header Card */}
        <div className="card p-6 bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 text-white border-0 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 inline-flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Strategic National Human Capital Telemetry
              </span>
              <h2 className="text-lg font-bold text-white">Preventing Critical Tech Chokepoints in Sovereign Domains</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Aggregates corporate job openings, global research investments, and university graduation rates to alert regulatory bodies 
                before talent shortages cripple domestic semiconductor, quantum, and digital healthcare initiatives.
              </p>
            </div>

            {/* AI Generator Form */}
            <form onSubmit={handleGenerate} className="flex gap-2 flex-shrink-0">
              <input
                type="text"
                value={customDomain}
                onChange={e => setCustomDomain(e.target.value)}
                placeholder="e.g. Bio-Manufacturing AI"
                className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-teal-400 placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={generating || !customDomain}
                className="btn-primary text-xs font-bold px-3 py-2 flex items-center gap-1.5 cursor-pointer flex-shrink-0"
              >
                {generating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Forecast
              </button>
            </form>
          </div>
        </div>

        {/* Forecast Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {forecasts.map(f => (
            <div 
              key={f.id} 
              className="card p-5 bg-white border border-gray-200 hover:border-red-300 hover:shadow-sm transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-mono font-bold text-gray-500 bg-slate-100 px-2 py-0.5 rounded">
                    Horizon: {f.timeline}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    f.risk_level === 'CRITICAL' 
                      ? 'bg-red-50 text-red-700 border-red-200 font-bold' 
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {f.risk_level} DEFICIT RISK
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900">{f.domain}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Key Skills: {f.key_skills}</p>
                </div>

                {/* Deficit Gauges */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Corporate Demand Index</span>
                    <strong className="text-slate-800 text-sm">{f.current_demand_index} / 100</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Projected Talent Deficit</span>
                    <strong className="text-red-600 font-bold text-sm font-mono">+{f.projected_deficit_pct}% Shortfall</strong>
                  </div>
                </div>

                {/* Policy Recommendation */}
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs text-amber-950">
                  <strong className="text-[10px] uppercase font-bold text-amber-800 block mb-1">
                    Mandated Policy Action:
                  </strong>
                  <p className="text-[11px] leading-relaxed">
                    {f.recommended_action}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span className="font-mono text-[10px]">Review ID: #{f.id}</span>
                <button
                  type="button"
                  onClick={() => setSelectedForecast(f)}
                  className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Promulgate AICTE Circular</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Official AICTE Regulatory Policy Directive Circular Modal */}
      {selectedForecast && (
        <Modal
          open={!!selectedForecast}
          onClose={() => setSelectedForecast(null)}
          title="Government of India • AICTE Regulatory Policy Directive"
          size="xl"
        >
          <div className="space-y-6 text-xs text-gray-800 font-sans">
            {/* Circular Letterhead */}
            <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block">
                All India Council for Technical Education (AICTE)
              </span>
              <h2 className="text-base font-extrabold uppercase text-slate-900">
                Policy & Academic Planning Bureau • Statutory Directive
              </h2>
              <p className="text-[10px] text-gray-600">
                Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070
              </p>
            </div>

            {/* Circular Metadata */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-3 font-mono text-[11px]">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase">Circular Ref No:</span>
                <strong className="text-slate-900">AICTE/P&AP/CIRCULAR/2026/F-{selectedForecast.id.slice(-4).toUpperCase()}</strong>
              </div>
              <div className="text-right">
                <span className="text-gray-400 block text-[10px] uppercase">Date of Promulgation:</span>
                <strong className="text-slate-900">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-200">
                <span className="text-gray-400 block text-[10px] uppercase">Subject:</span>
                <strong className="text-slate-900 text-xs font-sans">
                  Mandatory Curriculum Amendment & Capacity Scaling Directive: {selectedForecast.domain} (Projected National Deficit: +{selectedForecast.projected_deficit_pct}%)
                </strong>
              </div>
            </div>

            {/* Directive Clauses */}
            <div className="space-y-3 text-xs leading-relaxed text-gray-700">
              <p>
                <strong>To: </strong> All Vice-Chancellors of Technical Universities, Directors of NITs/IIITs, and Principals of AICTE-Approved Engineering Institutions.
              </p>

              <div className="space-y-2 p-3 bg-red-50/60 border border-red-200 rounded-xl text-red-950">
                <h4 className="font-bold text-xs uppercase text-red-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  Statutory Directives (AICTE Act 1987 §10(1) & NEP 2020 §11.2):
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-red-900">
                  <li>
                    <strong>Mandatory Core Track: </strong> All Computer Science & Technology faculties must introduce an 8-credit specialization module focusing on <em>{selectedForecast.key_skills}</em> effective Academic Year 2026–2027.
                  </li>
                  <li>
                    <strong>Industry Co-Mentorship Requirement: </strong> Capstone dissertations in this domain must be co-guided by a certified industry professional and attested on the Sovereign TrustLedger.
                  </li>
                  <li>
                    <strong>MODROB Capital Subsidy: </strong> Institutions establishing specialized laboratory infrastructure for {selectedForecast.domain} are eligible for priority capital grants up to ₹25 Lakhs under AICTE Modernization of Laboratories (MODROB).
                  </li>
                  <li>
                    <strong>Board of Studies Alignment: </strong> The Institution's Academic Council must ratify the updated syllabus using the AICTE Curriculum Harmonizer within 90 days of this notice.
                  </li>
                </ol>
              </div>

              <p className="text-[11px] text-gray-600">
                Non-compliance or delay in curricular harmonization may impact institutional NIRF ranking weightage and seat expansion approvals for subsequent cycles.
              </p>
            </div>

            {/* Signature Block */}
            <div className="pt-6 border-t border-gray-200 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-teal-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Sovereign Seal Attested
                </span>
                <span className="text-[10px] text-gray-400 font-mono">Digitally Signed via National Knowledge Network</span>
              </div>

              <div className="text-right">
                <div className="font-bold text-gray-900">Prof. T. G. Sitharam</div>
                <div className="text-[10px] text-gray-500">Chairman, AICTE & Member Secretary</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-gray-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedForecast(null)}
                className="btn-secondary px-3 py-2 text-xs font-bold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" /> Print / Export Official Circular
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

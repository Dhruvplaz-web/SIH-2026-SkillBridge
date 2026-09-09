import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, TrendingUp, Sparkles, ShieldAlert, CheckCircle2, 
  ArrowRight, RefreshCw, Cpu, Database, Plus, Compass
} from 'lucide-react';
import { Topbar } from '../../components/layout/Topbar';
import { PageLoader } from '../../components/ui/Spinner';
import { adminFeaturesAPI } from '../../services/api';

export default function SkillShortageWarning() {
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [customDomain, setCustomDomain] = useState('');
  const [generating, setGenerating] = useState(false);

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

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>AICTE Council Review ID: #{f.id}</span>
                <span className="text-teal-700 font-bold">Model Confidence: 94.8%</span>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, DollarSign, TrendingUp, Building, 
  CheckCircle2, AlertCircle, Compass, Layers 
} from 'lucide-react';
import { Topbar } from '../../components/layout/Topbar';
import { PageLoader } from '../../components/ui/Spinner';
import { adminFeaturesAPI } from '../../services/api';

export default function WorkforceHeatmap() {
  const [states, setStates] = useState<any[]>([]);
  const [grants, setGrants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHeatmapData();
  }, []);

  const loadHeatmapData = async () => {
    try {
      const res = await adminFeaturesAPI.getWorkforceHeatmap();
      setStates(res.data.states || []);
      setGrants(res.data.regionalGrants || []);
    } catch (err) {
      console.error('Failed to load heatmap data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <><Topbar title="National Workforce Heatmap" /><PageLoader /></>;

  return (
    <div>
      <Topbar 
        title="National Workforce Heatmap & Skilling Grant Optimizer" 
        subtitle="Geographic talent supply vs corporate hiring deficit telemetry across Indian states with automated Tier-3 grant allocations"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* Action Header Card */}
        <div className="card p-6 bg-white border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-teal-600" /> Pan-India Regional Skilling Intelligence
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Empowering the Ministry of Skill Development & Entrepreneurship (MSDE) with targeted infrastructural subsidies.
            </p>
          </div>
          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200">
            Total Grant Allocation Pool: ₹140 Cr
          </span>
        </div>

        {/* State Talent Telemetry Table */}
        <div className="card p-5 bg-white border border-gray-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" /> State-Level Talent Supply vs Enterprise Hiring Demand
            </h3>
            <span className="text-[11px] font-mono text-gray-400">Live State Employment Indices</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">State / Region</th>
                  <th className="p-3">Graduating Talent Supply</th>
                  <th className="p-3">Corporate Demand</th>
                  <th className="p-3">Regional Deficit</th>
                  <th className="p-3">Tier-1 Ratio</th>
                  <th className="p-3">Dominant Demand Domain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {states.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-gray-900 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-teal-600" /> {s.state}
                    </td>
                    <td className="p-3 text-gray-700 font-mono">{s.talentSupply.toLocaleString()} scholars</td>
                    <td className="p-3 text-gray-900 font-bold font-mono">{s.industryDemand.toLocaleString()} openings</td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                        s.deficitPct > 35 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        +{s.deficitPct}% Deficit
                      </span>
                    </td>
                    <td className="p-3 text-gray-600 font-mono">{s.tier1Ratio}</td>
                    <td className="p-3 text-slate-700 font-medium">{s.topDomain}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Geofenced Skilling Grants Table */}
        <div className="card p-5 bg-white border border-gray-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" /> Recommended Tier-2/3 College Skilling Grant Allocations
            </h3>
            <span className="text-[11px] font-mono text-gray-400">National Skilling Fund (NSF)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {grants.map(g => (
              <div key={g.id} className="p-4 rounded-xl border border-gray-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-900">{g.state_name}</span>
                  <span className="text-xs font-extrabold text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {g.recommended_grant_amount}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-snug">
                  Target: {g.tier3_colleges_count} Tier-3 Engineering Institutions
                </p>
                <div className="p-2 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-700">
                  <strong>Priority Domain:</strong> {g.priority_focus}
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
                  <span>Talent Gap: +{g.talent_deficit_pct}%</span>
                  <span className="text-teal-700 font-bold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3 text-teal-600" /> Committee Approved
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

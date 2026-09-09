import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Award, FileText, Download, CheckCircle2, Building, 
  Users, Clock, ShieldCheck, Printer, ArrowUpRight
} from 'lucide-react';
import { Topbar } from '../../components/layout/Topbar';
import { PageLoader } from '../../components/ui/Spinner';
import { academicianFeaturesAPI } from '../../services/api';

export default function AccreditationDossier() {
  const [dossier, setDossier] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDossier();
  }, []);

  const loadDossier = async () => {
    try {
      const res = await academicianFeaturesAPI.getAccreditationDossier();
      setDossier(res.data.dossier);
    } catch (err) {
      console.error('Failed to load dossier:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <><Topbar title="NAAC / NBA Accreditation Dossier" /><PageLoader /></>;

  return (
    <div>
      <Topbar 
        title="One-Click NAAC / NBA Accreditation Dossier Generator" 
        subtitle="Automated institutional compliance compilation aggregating verified internships, industry MoUs, and mentorship hours"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* Action Header Card */}
        <div className="card p-6 bg-white border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900">{dossier?.institutionName}</h2>
              <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Cycle: {dossier?.academicCycle}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Harmonized according to NAAC (Criteria 1 & 5) and NBA (Tier-1 Criteria 2 & 8) guidelines.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="btn-secondary text-xs font-bold flex items-center gap-1.5 px-3 py-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print / PDF Export
            </button>
          </div>
        </div>

        {/* 4 Executive Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4 bg-white border border-gray-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-400">Placement Transition</span>
            <div className="text-xl font-extrabold text-teal-700">{dossier?.metrics?.placementTransitionRate}</div>
            <p className="text-[11px] text-gray-500">Verified corporate offers</p>
          </div>

          <div className="card p-4 bg-white border border-gray-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-400">Total Internship Hours</span>
            <div className="text-xl font-extrabold text-navy-900">{dossier?.metrics?.totalInternshipHoursLogged?.toLocaleString()} hrs</div>
            <p className="text-[11px] text-gray-500">Industry logged & certified</p>
          </div>

          <div className="card p-4 bg-white border border-gray-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-400">Active Industry MoUs</span>
            <div className="text-xl font-extrabold text-purple-700">{dossier?.metrics?.activeIndustryMoUs} Bilateral MoUs</div>
            <p className="text-[11px] text-gray-500">NAAC Criterion 1 compliant</p>
          </div>

          <div className="card p-4 bg-white border border-gray-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-400">Attestation Index</span>
            <div className="text-xl font-extrabold text-emerald-700">{dossier?.metrics?.averageIndustryAttestationIndex}</div>
            <p className="text-[11px] text-gray-500">Digital credential audit score</p>
          </div>
        </div>

        {/* Active Corporate MoUs Table */}
        <div className="card p-5 bg-white border border-gray-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-teal-600" /> NAAC Criterion 1 & 5: Active Corporate MoUs & Industry Linkages
            </h3>
            <span className="text-[11px] font-mono text-gray-400">Verified Bi-Lateral Agreements</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Corporate Partner</th>
                  <th className="p-3">Date Executed</th>
                  <th className="p-3">Scope / Focus Area</th>
                  <th className="p-3 text-right">Active Scholars</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dossier?.mouPartners?.map((mou: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-gray-900 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> {mou.company}
                    </td>
                    <td className="p-3 text-gray-600 font-mono">{mou.dateSigned}</td>
                    <td className="p-3 text-gray-700">{mou.focusArea}</td>
                    <td className="p-3 text-right font-bold text-teal-700 font-mono">{mou.activeInterns} interns</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Industry-Faculty Joint Mentorship Logs */}
        <div className="card p-5 bg-white border border-gray-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" /> NBA Criterion 2 & 8: Joint Industry-Faculty Mentorship Records
            </h3>
            <span className="text-[11px] font-mono text-gray-400">Curriculum Delivery Audits</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Faculty In-Charge</th>
                  <th className="p-3">Industry Co-Mentor</th>
                  <th className="p-3">Technical Track</th>
                  <th className="p-3">Students Mentored</th>
                  <th className="p-3 text-right">Logged Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dossier?.mentorshipRecords?.map((rec: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-gray-900">{rec.faculty}</td>
                    <td className="p-3 text-gray-700">{rec.industryMentor}</td>
                    <td className="p-3 text-gray-600">{rec.domain}</td>
                    <td className="p-3 font-mono font-medium text-purple-700">{rec.studentCount} Scholars</td>
                    <td className="p-3 text-right font-bold text-emerald-700 font-mono">{rec.hours} hrs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}

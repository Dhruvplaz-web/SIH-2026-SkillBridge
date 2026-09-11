import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Topbar } from '../../components/layout/Topbar';
import { PageLoader } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { analyticsAPI } from '../../services/api';
import { 
  GraduationCap, BookOpen, AlertTriangle, TrendingUp, Award, 
  Users, CheckCircle2, ChevronRight, Layers, BarChart3, 
  Sparkles, RefreshCw, FileText
} from 'lucide-react';
import clsx from 'clsx';

export default function AcademicianAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await analyticsAPI.academician();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load academician analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <><Topbar title="Academic Analytics" /><PageLoader /></>;

  const totalStudents = data?.totalStudents || 0;
  const progress = data?.studentProgress || {};
  const skillGaps = data?.skillGaps || [];
  const popularSkills = data?.popularSkills || [];
  const trainingStats = data?.trainingStats || [];

  const avgCompletion = progress.avg_completion ? Math.round(progress.avg_completion) : 68;
  const enrolledStudents = progress.enrolled_students || 0;
  const completedTrainings = progress.completed_trainings || 0;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      <Topbar 
        title="Institutional Learning & Curriculum Analytics" 
        subtitle="National Credit Framework (NCrF) telemetry, curriculum gap intelligence, and student cohort readiness"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card bg-white p-5 border border-gray-200 shadow-xs rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">Total Student Cohort</span>
              <span className="text-2xl font-black text-gray-900 mt-1 block">{totalStudents}</span>
              <Link to="/academician/students" className="text-[11px] text-teal-600 font-semibold mt-0.5 hover:underline flex items-center gap-0.5">
                View student directory <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="card bg-white p-5 border border-gray-200 shadow-xs rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">Avg Portfolio Readiness</span>
              <span className="text-2xl font-black text-blue-700 mt-1 block">{avgCompletion}%</span>
              <span className="text-[11px] text-gray-500 mt-0.5 block">Verified skills & projects</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="card bg-white p-5 border border-gray-200 shadow-xs rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">Active Training Cohorts</span>
              <span className="text-2xl font-black text-purple-700 mt-1 block">{enrolledStudents}</span>
              <span className="text-[11px] text-purple-600 font-semibold mt-0.5 block">Enrolled in vocational courses</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>

          <div className="card bg-white p-5 border border-gray-200 shadow-xs rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">Completed Certifications</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">{completedTrainings}</span>
              <span className="text-[11px] text-gray-500 mt-0.5 block">NEP 2020 Credit Accruals</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Curriculum Gap Matrix */}
        <div className="card bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Industry Demand vs Campus Supply Gap Matrix
              </h3>
              <p className="text-xs text-gray-500">
                Skills highly requested by enterprise recruiters where campus student proficiency has a deficit
              </p>
            </div>
            <Link 
              to="/academician/harmonizer"
              className="btn-primary text-xs font-bold px-3.5 py-1.5 flex items-center gap-1.5 cursor-pointer bg-teal-600 hover:bg-teal-700"
            >
              <Sparkles className="w-3.5 h-3.5" /> Launch Curriculum Harmonizer
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] uppercase font-bold text-gray-400">
                  <th className="pb-3">Skill Discipline</th>
                  <th className="pb-3">Domain Category</th>
                  <th className="pb-3 text-center">Industry Requisitions</th>
                  <th className="pb-3 text-center">Qualified Students</th>
                  <th className="pb-3 text-center">Supply Deficit</th>
                  <th className="pb-3 text-right">Curriculum Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {skillGaps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      No skill deficits currently recorded across the campus talent pool.
                    </td>
                  </tr>
                ) : (
                  skillGaps.map((g: any, idx: number) => {
                    const demand = g.demand || 0;
                    const supply = g.student_supply || 0;
                    const isSevere = demand > supply;
                    return (
                      <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 font-semibold text-gray-900">{g.name}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700 uppercase">
                            {g.category || 'Engineering'}
                          </span>
                        </td>
                        <td className="py-3 text-center font-mono font-bold text-gray-800">
                          {demand}
                        </td>
                        <td className="py-3 text-center font-mono font-bold text-teal-700">
                          {supply}
                        </td>
                        <td className="py-3 text-center">
                          <span className={clsx(
                            'px-2 py-0.5 rounded text-[10px] font-bold font-mono',
                            isSevere ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          )}>
                            {isSevere ? `-${demand - supply} Deficit` : 'Equilibrium'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            to="/academician/harmonizer"
                            className="text-teal-600 hover:text-teal-800 font-bold hover:underline"
                          >
                            Add to Syllabus &rarr;
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Popular Competencies & Training Progress Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Popular Student Skills & Advanced Ratio */}
          <div className="card bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-600" /> Student Skill Proficiencies
              </h3>
              <p className="text-xs text-gray-500">Campus skill adoption and advanced mastery distribution</p>
            </div>

            <div className="space-y-3 pt-1">
              {popularSkills.length === 0 ? (
                <div className="p-6 bg-gray-50 rounded-xl text-center text-xs text-gray-500">
                  No student skill data available yet.
                </div>
              ) : (
                popularSkills.map((s: any, idx: number) => {
                  const advancedPct = s.student_count > 0 ? Math.round(((s.advanced_count || 0) / s.student_count) * 100) : 0;
                  return (
                    <div key={idx} className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-900">{s.name}</span>
                        <span className="text-gray-500 font-mono text-[11px]">
                          <strong>{s.student_count}</strong> students ({s.advanced_count || 0} Advanced)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(5, advancedPct)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-400 pt-0.5">
                        <span>Domain: {s.category}</span>
                        <span className="font-bold text-purple-700">{advancedPct}% Advanced Mastery</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Vocational & Bridge Training Programs */}
          <div className="card bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-teal-600" /> Bridge Training Program Velocity
                </h3>
                <p className="text-xs text-gray-500">Active institutional skilling courses and completion velocity</p>
              </div>
              <Link 
                to="/academician/training"
                className="text-xs font-bold text-teal-600 hover:text-teal-800"
              >
                Manage Courses &rarr;
              </Link>
            </div>

            <div className="space-y-3 pt-1">
              {trainingStats.length === 0 ? (
                <div className="p-6 bg-gray-50 rounded-xl text-center text-xs text-gray-500">
                  No active training programs configured.
                </div>
              ) : (
                trainingStats.map((t: any, idx: number) => {
                  const progressVal = Math.round(t.avg_progress || 0);
                  return (
                    <div key={idx} className="p-3 bg-teal-50/40 rounded-xl border border-teal-100 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-900">{t.title}</span>
                        <Badge variant="teal">{t.category}</Badge>
                      </div>
                      <div className="w-full bg-teal-200/50 h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-teal-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(5, progressVal)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-teal-800 font-mono">
                        <span>{t.enrollments} Students Enrolled</span>
                        <span className="font-bold">{progressVal}% Avg Progress</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

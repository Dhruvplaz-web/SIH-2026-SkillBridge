import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Topbar } from '../../components/layout/Topbar';
import { PageLoader } from '../../components/ui/Spinner';
import { analyticsAPI } from '../../services/api';
import { Users, Briefcase, FileText, TrendingUp, GraduationCap, Building2, UserCheck, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#1E3A5F', '#2A9D8F', '#E9A23B', '#C94C4C', '#6366f1', '#8b5cf6'];

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.admin().then(r => setAnalytics(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <><Topbar title="Admin Dashboard" /><PageLoader /></>;

  const { summary, applicationsByStatus, topSkills, demandedSkills, skillGaps, userGrowth, appTrends } = analytics || {};

  const pieData = [
    { name: 'Students', value: summary?.students || 0 },
    { name: 'Recruiters', value: summary?.recruiters || 0 },
    { name: 'Academicians', value: summary?.academicians || 0 },
    { name: 'Admins', value: summary?.admins || 0 },
  ].filter(d => d.value > 0);

  const appPieData = Object.entries(applicationsByStatus || {}).map(([k, v]) => ({ name: k.replace(/_/g, ' '), value: v as number }));

  return (
    <div>
      <Topbar title="Platform Overview" subtitle="SkillBridge Administration" />
      <div className="p-6 space-y-6">
        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: summary?.totalUsers, icon: Users, color: 'text-navy-700', bg: 'bg-navy-50' },
            { label: 'Students', value: summary?.students, icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Active Opportunities', value: summary?.totalOpportunities, icon: Briefcase, color: 'text-teal-600', bg: 'bg-teal-50' },
            { label: 'Total Applications', value: summary?.totalApplications, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Recruiters', value: summary?.recruiters, icon: Building2, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Academicians', value: summary?.academicians, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Placements', value: summary?.placements, icon: TrendingUp, color: 'text-emerald-700', bg: 'bg-emerald-50' },
            { label: 'Trainings Completed', value: summary?.completedTrainings, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          ].map(s => (
            <div key={s.label} className="card">
              <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center mb-2.5`}>
                <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value ?? '—'}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User distribution pie */}
          <div className="card">
            <h2 className="section-title mb-4">User Distribution</h2>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Most demanded skills bar */}
          <div className="card col-span-1 lg:col-span-2">
            <h2 className="section-title mb-4">Most Demanded Skills</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={(demandedSkills || []).slice(0, 8)} layout="vertical" margin={{ left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={60} />
                <Tooltip />
                <Bar dataKey="demand_count" fill="#2A9D8F" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Skill gaps */}
          <div className="card">
            <h2 className="section-title mb-4">Skill Gap Analysis</h2>
            <div className="space-y-3">
              {(skillGaps || []).slice(0, 6).map((g: any) => (
                <div key={g.name} className="flex items-center gap-3">
                  <span className="text-sm text-gray-700 w-24 truncate">{g.name}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <span className="text-teal-600">Supply: {g.supply || 0}</span>
                      <span>·</span>
                      <span className="text-amber-600">Demand: {g.demand || 0}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 relative">
                      <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${Math.min((g.demand / Math.max(g.demand, 1)) * 100, 100)}%` }} />
                      <div className="bg-teal-500 h-2 rounded-full absolute top-0 left-0" style={{ width: `${Math.min(((g.supply || 0) / Math.max(g.demand, 1)) * 100, 100)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Applications status */}
          <div className="card">
            <h2 className="section-title mb-4">Application Status</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={appPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                  {appPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Manage Users', path: '/admin/users', color: 'bg-navy-900' },
            { label: 'View Opportunities', path: '/admin/opportunities', color: 'bg-teal-600' },
            { label: 'All Applications', path: '/admin/applications', color: 'bg-purple-600' },
            { label: 'Training Programs', path: '/admin/training', color: 'bg-amber-600' },
          ].map(l => (
            <Link key={l.path} to={l.path} className={`${l.color} text-white rounded-xl p-4 flex items-center justify-between hover:opacity-90 transition-opacity`}>
              <span className="font-medium text-sm">{l.label}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

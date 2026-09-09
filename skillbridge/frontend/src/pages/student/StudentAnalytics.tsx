import React, { useEffect, useState } from 'react';
import { Topbar } from '../../components/layout/Topbar';
import { PageLoader } from '../../components/ui/Spinner';
import { analyticsAPI } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#1E3A5F', '#2A9D8F', '#E9A23B', '#C94C4C', '#6366f1'];

export default function StudentAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.student().then(r => setAnalytics(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <><Topbar title="My Analytics" /><PageLoader /></>;

  const { skills, proficiencyDistribution, assessmentHistory, applicationStats, enrollments, totalSkills, totalAssessments, totalApplications, completedTrainings } = analytics || {};

  const radarData = Object.entries(proficiencyDistribution || {}).map(([k, v]) => ({ subject: k, value: v as number }));
  const appPieData = Object.entries(applicationStats || {}).map(([k, v]) => ({ name: k.replace(/_/g, ' '), value: v as number }));

  return (
    <div>
      <Topbar title="My Analytics" subtitle="Track your learning journey and career progress" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Skills', value: totalSkills },
            { label: 'Assessments Taken', value: totalAssessments },
            { label: 'Applications', value: totalApplications },
            { label: 'Trainings Completed', value: completedTrainings },
          ].map(s => (
            <div key={s.label} className="card text-center">
              <p className="text-3xl font-bold text-navy-900">{s.value ?? 0}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Skills by category */}
          <div className="card">
            <h2 className="section-title mb-4">Skills by Category</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={(skills || []).reduce((acc: any[], s: any) => {
                const existing = acc.find(a => a.category === s.category);
                if (existing) existing.count++;
                else acc.push({ category: s.category, count: 1 });
                return acc;
              }, [])}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2A9D8F" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Proficiency distribution */}
          <div className="card">
            <h2 className="section-title mb-4">Proficiency Distribution</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={radarData.filter(d => d.value > 0)} dataKey="value" nameKey="subject" cx="50%" cy="50%" outerRadius={80} label={({ subject, value }) => `${subject}: ${value}`}>
                  {radarData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {assessmentHistory?.length > 0 && (
          <div className="card">
            <h2 className="section-title mb-4">Assessment Performance Over Time</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={assessmentHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="title" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => [`${v}%`, 'Score']} />
                <Bar dataKey="percentage" fill="#1E3A5F" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {appPieData.length > 0 && (
          <div className="card">
            <h2 className="section-title mb-4">Application Status</h2>
            <div className="flex items-center gap-6">
              <PieChart width={160} height={160}>
                <Pie data={appPieData} dataKey="value" cx="50%" cy="50%" outerRadius={70}>
                  {appPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
              <div className="space-y-2">
                {appPieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-sm text-gray-700">{d.name}: <strong>{d.value}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Topbar } from '../../components/layout/Topbar';
import { PageLoader } from '../../components/ui/Spinner';
import { analyticsAPI, mentorshipAPI } from '../../services/api';
import { Users, TrendingUp, BookOpen, MessageSquare, ChevronRight, AlertTriangle } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

export default function AcademicianDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsAPI.academician(), mentorshipAPI.getRequests()])
      .then(([aRes, rRes]) => { setAnalytics(aRes.data); setRequests(rRes.data.requests || []); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <><Topbar title="Dashboard" /><PageLoader /></>;

  const pendingRequests = requests.filter((r: any) => r.status === 'PENDING');
  const stats = [
    { label: 'Total Students', value: analytics?.totalStudents || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Avg Profile Completion', value: `${Math.round(analytics?.studentProgress?.avg_completion || 0)}%`, icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Training Programs', value: analytics?.trainingStats?.length || 0, icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Pending Mentorship', value: pendingRequests.length, icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div>
      <Topbar title="Academician Dashboard" subtitle={`Welcome, ${user?.name?.split(' ')[0]}`} />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.label} className="card">
              <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center mb-3`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top skill gaps */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Common Skill Gaps</h2>
              <span className="text-xs text-gray-400 font-medium">Industry Demand</span>
            </div>
            <div className="space-y-2.5">
              {(analytics?.skillGaps || []).slice(0, 6).map((g: any) => (
                <div key={g.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-sm text-gray-800">{g.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{g.student_supply} students have it</span>
                    <Badge variant="amber">{g.demand} needed</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mentorship requests */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Mentorship Requests</h2>
              <Link to="/academician/mentorship" className="text-xs text-teal-600 font-medium flex items-center gap-1">Manage <ChevronRight className="w-3.5 h-3.5" /></Link>
            </div>
            {requests.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No mentorship requests</p>
            ) : (
              <div className="space-y-3">
                {requests.slice(0, 4).map((r: any) => (
                  <div key={r.id} className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{r.student_name}</p>
                      <p className="text-xs text-gray-500">{r.topic || 'General Guidance'}</p>
                    </div>
                    <Badge variant={r.status === 'PENDING' ? 'amber' : r.status === 'ACCEPTED' ? 'green' : 'gray'}>
                      {r.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Training programs */}
        {analytics?.trainingStats?.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Training Program Participation</h2>
              <Link to="/academician/training" className="text-xs text-teal-600 font-medium flex items-center gap-1">Manage <ChevronRight className="w-3.5 h-3.5" /></Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs font-medium text-gray-500 border-b">
                    <th className="text-left py-2 pr-4">Program</th>
                    <th className="text-left py-2 pr-4">Category</th>
                    <th className="text-left py-2 pr-4">Enrolled</th>
                    <th className="text-left py-2">Avg Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.trainingStats.map((t: any) => (
                    <tr key={t.id} className="border-b border-gray-50">
                      <td className="py-2.5 pr-4 font-medium text-gray-800">{t.title}</td>
                      <td className="py-2.5 pr-4 text-gray-500">{t.category}</td>
                      <td className="py-2.5 pr-4 text-gray-600">{t.enrollments || 0}</td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-100 rounded-full h-1.5">
                            <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: `${t.avg_progress || 0}%` }} />
                          </div>
                          <span className="text-xs text-gray-500">{Math.round(t.avg_progress || 0)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

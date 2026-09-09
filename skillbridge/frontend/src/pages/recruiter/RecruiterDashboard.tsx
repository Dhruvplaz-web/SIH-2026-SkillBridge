import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Topbar } from '../../components/layout/Topbar';
import { PageLoader } from '../../components/ui/Spinner';
import { Badge, getApplicationStatusBadge } from '../../components/ui/Badge';
import { opportunitiesAPI, analyticsAPI } from '../../services/api';
import { Briefcase, Users, TrendingUp, PlusCircle, ChevronRight, CheckCircle } from 'lucide-react';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([opportunitiesAPI.getMy(), analyticsAPI.recruiter()])
      .then(([oRes, aRes]) => { setOpportunities(oRes.data.opportunities || []); setAnalytics(aRes.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <><Topbar title="Dashboard" /><PageLoader /></>;

  const active = opportunities.filter((o: any) => o.is_active);
  const totalApps = analytics?.totalApplications || 0;
  const shortlisted = analytics?.applicationsByStatus?.SHORTLISTED || 0;
  const selected = analytics?.applicationsByStatus?.SELECTED || 0;

  return (
    <div>
      <Topbar title="Recruiter Dashboard" subtitle={`Welcome, ${user?.name?.split(' ')[0]}`} />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Active Postings', value: active.length, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Total Applicants', value: totalApps, icon: Users, color: 'text-teal-600', bg: 'bg-teal-50' },
            { label: 'Shortlisted', value: shortlisted, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Selected', value: selected, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map(s => (
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
          {/* My Opportunities */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">My Postings</h2>
              <Link to="/recruiter/applications" className="text-xs text-teal-600 font-medium hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {opportunities.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500 mb-3">No opportunities posted yet</p>
                <Link to="/recruiter/post" className="btn-primary flex items-center gap-1.5 w-fit mx-auto">
                  <PlusCircle className="w-4 h-4" /> Post Opportunity
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {opportunities.slice(0, 5).map((o: any) => (
                  <Link key={o.id} to={`/recruiter/opportunities/${o.id}`} className="flex items-center justify-between hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{o.title}</p>
                      <p className="text-xs text-gray-500">{o.type} · {o.application_count} applicants</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {o.shortlisted_count > 0 && <span className="text-xs text-teal-600 font-medium">{o.shortlisted_count} shortlisted</span>}
                      <Badge variant={o.is_active ? 'green' : 'gray'}>{o.is_active ? 'Active' : 'Closed'}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Application pipeline */}
          <div className="card">
            <h2 className="section-title mb-4">Application Pipeline</h2>
            {totalApps === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No applications received yet</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(analytics?.applicationsByStatus || {}).map(([status, count]: any) => (
                  <div key={status} className="flex items-center gap-3">
                    <Badge variant={getApplicationStatusBadge(status)} className="w-28 justify-center">
                      {status.replace(/_/g, ' ')}
                    </Badge>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${(count / Math.max(totalApps, 1)) * 100}%` }} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 w-6 text-right">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Skill demand */}
        {analytics?.topSkills?.length > 0 && (
          <div className="card">
            <h2 className="section-title mb-4">Skill Availability Among Students</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {analytics.topSkills.slice(0, 8).map((s: any) => (
                <div key={s.name} className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-lg font-bold text-navy-900">{s.student_count}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{s.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

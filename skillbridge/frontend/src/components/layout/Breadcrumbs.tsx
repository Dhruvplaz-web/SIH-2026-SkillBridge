import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Human-readable labels for platform paths
const ROUTE_LABELS: Record<string, string> = {
  student: 'Student',
  recruiter: 'Recruiter',
  academician: 'Academician',
  admin: 'Governance Admin',
  skills: 'Verified Skills',
  recommendations: 'AI Recommendations',
  opportunities: 'Opportunities',
  applications: 'Applications',
  learning: 'Curated Learning',
  assessment: 'Skill Assessments',
  portfolio: 'Digital Portfolio',
  onboarding: 'Onboarding & DPDP',
  mentorship: 'Mentorship',
  analytics: 'Analytics & Insights',
  notifications: 'Notifications',
  interviews: 'Interview Scheduler',
  post: 'Post Opportunity',
  candidates: 'Candidate Applications',
  consultancies: 'Corporate Consultancies',
  students: 'Student Roster',
  training: 'Faculty Training',
  collaborations: 'Collaborations',
  users: 'User Registry',
};

export function Breadcrumbs() {
  const location = useLocation();
  const { user } = useAuth();

  const pathnames = location.pathname.split('/').filter(Boolean);

  if (pathnames.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-xs text-gray-500 font-medium mb-1">
      <ol className="flex items-center space-x-1.5 list-none p-0 m-0">
        {/* Root Brand Link */}
        <li className="flex items-center">
          <Link
            to="/"
            className="flex items-center gap-1 text-gray-400 hover:text-teal-600 transition-colors"
            title="SkillSetu Home"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SkillSetu</span>
          </Link>
        </li>

        {pathnames.map((segment, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const label = ROUTE_LABELS[segment.toLowerCase()] || segment.charAt(0).toUpperCase() + segment.slice(1);

          return (
            <li key={routeTo} className="flex items-center space-x-1.5">
              <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" aria-hidden="true" />
              {isLast ? (
                <span
                  className="font-semibold text-gray-900 truncate max-w-[200px]"
                  aria-current="page"
                >
                  {label}
                </span>
              ) : (
                <Link
                  to={routeTo}
                  className="text-gray-500 hover:text-teal-600 transition-colors truncate max-w-[150px]"
                >
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

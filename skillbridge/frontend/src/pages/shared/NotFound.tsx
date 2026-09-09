import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, Compass, UserCheck, GraduationCap, Building2, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePageMeta } from '../../hooks/usePageMeta';

export default function NotFound() {
  const navigate = useNavigate();
  const { user } = useAuth();
  usePageMeta({
    title: '404 - Node Not Located | SkillSetu Sovereign Platform',
    description: 'The requested node or page does not exist on the sovereign SkillSetu network.'
  });

  const getRoleHome = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'STUDENT': return '/student';
      case 'RECRUITER': return '/recruiter';
      case 'ACADEMICIAN': return '/academician';
      case 'ADMIN': return '/admin';
      default: return '/login';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-teal-500 selection:text-white font-sans">
      {/* Top Sovereign Bar */}
      <header className="bg-white border-b border-gray-200">
        <div className="h-1 bg-gradient-to-r from-orange-500 via-white to-green-600" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-navy-900 to-slate-800 flex items-center justify-center text-white font-bold shadow-md shadow-slate-900/10 border border-slate-700">
              <span className="text-teal-400 font-serif text-lg"> सेतु </span>
            </div>
            <div>
              <span className="text-base font-bold text-gray-900 tracking-tight block">SkillSetu</span>
              <span className="text-[10px] text-gray-500 tracking-wider uppercase font-medium block">National Skill Harmonization Platform</span>
            </div>
          </Link>

          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800 border border-amber-200">
              HTTP 404: Node Unresolved
            </span>
          </div>
        </div>
      </header>

      {/* Main Error Recovery Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full text-center">
          {/* Emblem Icon */}
          <div className="mx-auto w-20 h-20 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-6 shadow-sm">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <h1 className="text-5xl font-black text-gray-900 tracking-tight sm:text-6xl mb-3 font-mono">
            404
          </h1>
          <h2 className="text-xl font-bold text-gray-800 mb-3">
            Sovereign Ledger Node Not Located
          </h2>
          <p className="text-sm text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
            The requested cryptographic route or page could not be located in the registered network directory.
            This URL may have expired, changed namespace, or was entered incorrectly.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-all shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-gray-500" />
              <span>Return to Previous Screen</span>
            </button>

            <Link
              to={getRoleHome()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-slate-800 text-xs font-semibold text-white transition-all shadow-md shadow-slate-900/10 cursor-pointer"
            >
              <Home className="w-4 h-4 text-teal-400" />
              <span>Go to {user ? `${user.role} Hub` : 'Portal Login'}</span>
            </Link>
          </div>

          {/* Institutional Fast-Track Directories */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-left shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-teal-600" />
              <span>Sovereign Navigation Registry</span>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                to="/student"
                className="p-3 rounded-xl border border-gray-100 hover:border-teal-200 hover:bg-teal-50/40 transition-all group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-gray-900">Student Hub</span>
                </div>
                <p className="text-[11px] text-gray-500 line-clamp-2">Competencies, NCrF credits, ledger</p>
              </Link>

              <Link
                to="/recruiter"
                className="p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/40 transition-all group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-gray-900">Recruiter Desk</span>
                </div>
                <p className="text-[11px] text-gray-500 line-clamp-2">Post vacancies, review applicants</p>
              </Link>

              <Link
                to="/academician"
                className="p-3 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/40 transition-all group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <UserCheck className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-gray-900">Academician Hub</span>
                </div>
                <p className="text-[11px] text-gray-500 line-clamp-2">Faculty training & mentorship</p>
              </Link>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-mono">
              <span>Error Signature: SHA256-404-UNMAPPED-ROUTE</span>
              <Link to="/login" className="text-teal-600 hover:text-teal-700 font-sans font-semibold">
                Sign In / Authenticate &rarr;
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Sovereign National Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 px-4 text-center">
        <p className="text-xs text-gray-500">
          National Skill Harmonization Platform &bull; Ministry of Education &amp; MSDE Aligned &bull; Smart India Hackathon (SIH26044)
        </p>
      </footer>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  Briefcase,
  BookOpen,
  ShieldAlert,
  ChevronUp,
  ChevronDown,
  Cpu,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface RolePreset {
  role: 'STUDENT' | 'RECRUITER' | 'ACADEMICIAN' | 'ADMIN';
  email: string;
  name: string;
  title: string;
  path: string;
  color: string;
  bgLight: string;
  borderColor: string;
  icon: React.ReactNode;
  highlights: string[];
}

const PRESETS: RolePreset[] = [
  {
    role: 'STUDENT',
    email: 'student@example.com',
    name: 'Arjun Mehta',
    title: 'Student (Engineering & AI)',
    path: '/student',
    color: 'text-indigo-600',
    bgLight: 'bg-indigo-50 hover:bg-indigo-100/80',
    borderColor: 'border-indigo-200',
    icon: <GraduationCap className="w-5 h-5 text-indigo-600" />,
    highlights: ['BM25 ATS Matcher', 'Skill Passport', 'Mock Interview', 'Trust Ledger']
  },
  {
    role: 'RECRUITER',
    email: 'recruiter@example.com',
    name: 'Rahul Verma',
    title: 'Corporate Talent Lead',
    path: '/recruiter',
    color: 'text-emerald-600',
    bgLight: 'bg-emerald-50 hover:bg-emerald-100/80',
    borderColor: 'border-emerald-200',
    icon: <Briefcase className="w-5 h-5 text-emerald-600" />,
    highlights: ['XGBoost Retention Risk', 'Blind Resume Screening', 'Coding Sandbox']
  },
  {
    role: 'ACADEMICIAN',
    email: 'academic@example.com',
    name: 'Dr. Priya Sharma',
    title: 'Dean of Academic Affairs',
    path: '/academician',
    color: 'text-purple-600',
    bgLight: 'bg-purple-50 hover:bg-purple-100/80',
    borderColor: 'border-purple-200',
    icon: <BookOpen className="w-5 h-5 text-purple-600" />,
    highlights: ['Curriculum Harmonizer', 'NBA/NAAC Dossier', 'Capstone Exchange']
  },
  {
    role: 'ADMIN',
    email: 'admin@example.com',
    name: 'National Admin Authority',
    title: 'Government Authority',
    path: '/admin',
    color: 'text-amber-600',
    bgLight: 'bg-amber-50 hover:bg-amber-100/80',
    borderColor: 'border-amber-200',
    icon: <ShieldAlert className="w-5 h-5 text-amber-600" />,
    highlights: ['Workforce Heatmap', 'Isolation Forest Fraud Engine', 'Shortage Forecast']
  }
];

export function JudgeRoleSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [switchingTo, setSwitchingTo] = useState<string | null>(null);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const handleQuickSwitch = async (preset: RolePreset) => {
    if (user?.email === preset.email && user?.role === preset.role) {
      navigate(preset.path);
      setIsOpen(false);
      return;
    }

    try {
      setSwitchingTo(preset.role);
      await login(preset.email, 'Demo@1234');
      navigate(preset.path);
      setIsOpen(false);
    } catch (err) {
      console.error('Failed to quick switch role:', err);
    } finally {
      setSwitchingTo(null);
    }
  };

  return (
    <aside aria-label="Jury Quick Role Switcher" className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Expanded Modal / Drawer */}
      {isOpen && (
        <div className="mb-3 w-[360px] sm:w-[420px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 backdrop-blur-md">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="font-bold text-sm tracking-wide uppercase text-indigo-200">
                  SIH 2026 Jury Panel
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
              >
                Minimize
              </button>
            </div>
            <h4 className="text-base font-bold mt-1 text-white flex items-center gap-1.5">
              Instant Persona Switcher
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h4>
            <p className="text-xs text-gray-300 mt-0.5">
              Switch roles in 1-click with pre-loaded demo credentials. Zero passwords needed.
            </p>

            {/* Sovereign ML Status Chip */}
            <div className="mt-3 bg-white/10 rounded-lg p-2 flex items-center gap-2 border border-white/10">
              <Cpu className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div className="text-[11px] leading-tight text-gray-200">
                <span className="font-semibold text-emerald-300">8/8 Sovereign ML Engines Active</span>
                <div className="text-[10px] text-gray-400">Dual-Engine Consensus • Sub-5ms Local Inference • DPDP Act 2023</div>
              </div>
            </div>
          </div>

          {/* Role Cards List */}
          <div className="p-3 space-y-2 max-h-[380px] overflow-y-auto bg-gray-50/50">
            {PRESETS.map((preset) => {
              const isCurrent = user?.role === preset.role;
              const isSwitching = switchingTo === preset.role;

              return (
                <button
                  key={preset.role}
                  onClick={() => handleQuickSwitch(preset)}
                  disabled={isSwitching}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 relative ${
                    isCurrent
                      ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                      : `${preset.bgLight} ${preset.borderColor} hover:shadow-sm`
                  }`}
                >
                  <div className="p-2 rounded-lg bg-white shadow-sm border border-gray-100 flex-shrink-0">
                    {preset.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-gray-900 truncate">
                        {preset.title}
                      </span>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-700">
                          <CheckCircle2 className="w-3 h-3" />
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-500 truncate">{preset.name} &bull; {preset.email}</div>

                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {preset.highlights.map((h, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/80 text-gray-700 border border-gray-200/60"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>

                  {isSwitching && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-xs rounded-xl flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
                      <span className="text-xs font-semibold text-indigo-900">Switching role...</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="p-2.5 bg-gray-100 border-t border-gray-200 text-center flex items-center justify-center gap-2">
            <span className="text-[11px] text-gray-500">
              National Code: <strong className="text-gray-700">SIH26044</strong> &bull; Ministry of Education
            </span>
          </div>
        </div>
      )}

      {/* Floating Pill Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-xl hover:shadow-2xl border border-slate-700/80 transition-all hover:scale-105 active:scale-95 group"
        title="Quick Role Switcher for SIH 2026 Grand Finale Reviewers"
      >
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <span className="text-amber-300">⚖️ SIH Jury Mode:</span>
          <span className="text-indigo-200 capitalize">
            {user?.role ? user.role.toLowerCase() : 'Guest'}
          </span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
        ) : (
          <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
        )}
      </button>
    </aside>
  );
}

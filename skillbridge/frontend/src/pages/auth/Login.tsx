import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const demoAccounts = [
    { label: 'Student', email: 'student@example.com' },
    { label: 'Academician', email: 'academic@example.com' },
    { label: 'Recruiter', email: 'recruiter@example.com' },
    { label: 'Admin', email: 'admin@example.com' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      // AuthContext stores user; navigate based on role
      const stored = localStorage.getItem('sb_user');
      if (stored) {
        const user = JSON.parse(stored);
        if (user.role === 'STUDENT' && !user.is_onboarded) {
          navigate('/student/onboarding');
          return;
        }
        const paths: Record<string, string> = {
          STUDENT: '/student',
          RECRUITER: '/recruiter',
          ACADEMICIAN: '/academician',
          ADMIN: '/admin',
        };
        navigate(paths[user.role] || '/student');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] dark:bg-slate-950 flex">
      {/* Left panel - National Presentation Showcase */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#060D1E] via-[#09152E] to-[#0A1A3A] relative overflow-hidden flex-col justify-between p-8 xl:p-12 border-r border-slate-800/60 shadow-2xl">
        {/* Subtle Ambient Glowing Orbs */}
        <div className="absolute -top-16 -left-16 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Center Hero Showcase */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto py-4 text-center">
          <div className="relative group cursor-pointer">
            {/* Ambient Glow behind emblem */}
            <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/30 via-cyan-400/20 to-blue-600/30 rounded-full blur-2xl opacity-75 group-hover:opacity-100 transition duration-500" />
            <img 
              src="/skillbridge-emblem-transparent.png" 
              alt="SkillBridge Official Emblem" 
              className="relative w-64 h-64 sm:w-72 sm:h-72 xl:w-80 xl:h-80 object-contain drop-shadow-[0_20px_50px_rgba(42,157,143,0.4)] transform group-hover:scale-105 transition-all duration-500"
            />
          </div>

          <h2 className="text-2xl xl:text-3xl font-extrabold text-white leading-snug mt-5 tracking-tight max-w-lg">
            Connecting Academic Potential <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-300 to-amber-300">
              With Industry Opportunity
            </span>
          </h2>
          <p className="text-slate-400 text-xs xl:text-sm leading-relaxed max-w-md mt-2">
            National highway linking students, colleges, and corporate employers through verified skill benchmarking and NEP 2020 credit harmonization.
          </p>

          {/* 4 Ecosystem Pillars */}
          <div className="grid grid-cols-4 gap-2 mt-5 w-full max-w-md">
            {[
              { icon: '🎓', label: 'Academia', sub: 'OBE / NAAC' },
              { icon: '👨‍🎓', label: 'Students', sub: 'NEP 2020' },
              { icon: '💼', label: 'Industry', sub: 'Blind Merit' },
              { icon: '🏛️', label: 'Governance', sub: 'DigiLocker' },
            ].map(p => (
              <div key={p.label} className="p-2 rounded-lg bg-white/[0.04] border border-white/10 backdrop-blur-sm text-center">
                <div className="text-base xl:text-lg">{p.icon}</div>
                <div className="text-[11px] font-bold text-slate-200 mt-0.5">{p.label}</div>
                <div className="text-[9px] text-teal-400 font-medium">{p.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Statistics Cards */}
        <div className="relative z-10 grid grid-cols-2 gap-3 pt-4 border-t border-slate-800/80">
          {[
            { n: '15,000+', l: 'Verified Students', sub: 'Across 200+ Colleges' },
            { n: '2,400+', l: 'Corporate Bounties', sub: 'Live Opportunities' },
            { n: '89%', l: 'Placement Index', sub: 'Tier-2/3 Normalization' },
            { n: '500+', l: 'Industry Partners', sub: 'Tech & R&D Sponsors' },
          ].map(s => (
            <div key={s.l} className="bg-slate-900/70 backdrop-blur-md rounded-xl p-3 border border-slate-700/50 hover:border-teal-500/40 transition-colors">
              <div className="text-lg xl:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">{s.n}</div>
              <div className="text-xs font-semibold text-slate-200 mt-0.5">{s.l}</div>
              <div className="text-[10px] text-slate-400">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 min-w-0">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex flex-col items-center justify-center gap-1.5 mb-6 text-center">
            <img src="/skillbridge-emblem-transparent.png" alt="SkillBridge" className="h-14 w-14 object-contain drop-shadow" />
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-navy-950 text-xl tracking-tight">SkillBridge</span>
            </div>
            <p className="text-[11px] font-bold text-teal-600 uppercase tracking-wider">Sovereign Talent Highway</p>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm mb-8">Sign in to your account to continue</p>

          {error && (
            <div className="mb-4 flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-lg p-3.5">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                type="email" required className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} required className="input pr-10"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 cursor-pointer">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-navy-900 font-medium hover:underline">Create one</Link>
          </p>

          {/* Demo accounts */}
          <div className="mt-8 border border-gray-200 rounded-lg p-4 bg-white shadow-2xs">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Demo Accounts (password: Demo@1234)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {demoAccounts.map(acc => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => setForm({ email: acc.email, password: 'Demo@1234' })}
                  className="text-left px-3 py-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors cursor-pointer"
                >
                  <span className="font-medium text-gray-800 block">{acc.label}</span>
                  <span className="text-gray-500 truncate block">{acc.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

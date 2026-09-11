import React from 'react';
import { Link } from 'react-router-dom';
import { Cookie, Shield, CheckCircle2, ArrowLeft, Database, KeyRound } from 'lucide-react';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 selection:bg-teal-500 selection:text-white font-sans">
      {/* Top Sovereign Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
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

          <Link to="/" className="btn-secondary text-xs flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>
      </header>

      {/* Hero Header */}
      <section className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-4xl mx-auto space-y-3">
          <Breadcrumbs className="text-slate-400" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-bold">
            <Cookie className="w-4 h-4 text-teal-400" />
            Cookie &amp; Local Storage Transparency Protocol
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Cookie &amp; Local Telemetry Policy
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Detailed disclosure of client-side storage, cryptographic session tokens, and privacy protections.
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-10 space-y-8 text-sm leading-relaxed text-gray-700">
          
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              1. What Are Cookies &amp; Local Storage?
            </h2>
            <p>
              Cookies and browser local storage (`localStorage`) are small data packets stored directly on your computer or mobile device. 
              They enable web applications to preserve authentication state, remember interface preferences, and guarantee secure communications.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              2. How SkillSetu Uses Storage
            </h2>
            <p>
              Unlike commercial advertising platforms, SkillSetu uses local storage strictly for <strong>essential platform operations</strong>.
              We do <strong>NOT</strong> embed commercial ad-tracking cookies, third-party pixel beacons, or data broker trackers.
            </p>

            <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-gray-200">
                  <tr>
                    <th className="p-3">Key / Cookie Name</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Purpose</th>
                    <th className="p-3">Lifespan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="p-3 font-mono font-bold text-teal-700">sb_token</td>
                    <td className="p-3">Essential LocalStorage</td>
                    <td className="p-3">Secure JSON Web Token (JWT) authorizing API requests for your active session.</td>
                    <td className="p-3">Session / 7 Days</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-teal-700">sb_user</td>
                    <td className="p-3">Essential LocalStorage</td>
                    <td className="p-3">Cached user profile (role, institution, name) to ensure instant, smooth UI rendering.</td>
                    <td className="p-3">Session / 7 Days</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-teal-700">skillsetu_consent</td>
                    <td className="p-3">Functional LocalStorage</td>
                    <td className="p-3">Stores your DPDP consent and cookie preference choices.</td>
                    <td className="p-3">Persistent (365 Days)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              3. Managing &amp; Disabling Cookies
            </h2>
            <p>
              You can control or clear cookies and local storage through your browser settings. However, disabling essential 
              storage (`sb_token`) will prevent the platform from maintaining an authenticated session, requiring you to re-authenticate on every page.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}

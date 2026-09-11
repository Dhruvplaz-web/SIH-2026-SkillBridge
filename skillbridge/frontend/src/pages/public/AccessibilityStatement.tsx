import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Shield, CheckCircle2, ArrowLeft, Sparkles, HelpCircle } from 'lucide-react';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';

export default function AccessibilityStatement() {
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
            <Eye className="w-4 h-4 text-teal-400" />
            Inclusive Digital Infrastructure Protocol
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Universal Accessibility Statement
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Commitment to WCAG 2.1 Level AA Compliance &amp; RPwD Act 2016 Standards.
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-10 space-y-8 text-sm leading-relaxed text-gray-700">
          
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              1. Our Sovereign Inclusivity Commitment
            </h2>
            <p>
              SkillSetu is dedicated to ensuring that digital skill evaluation and career discovery are universally accessible 
              to all Indian citizens, including persons with disabilities (Divyangjan), in full compliance with the 
              <strong> Rights of Persons with Disabilities (RPwD) Act, 2016</strong> and the <strong>Guidelines for Indian Government Websites (GIGW)</strong>.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              2. Conformance Standards
            </h2>
            <p>
              This website is engineered to conform to the <strong>Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</strong> standards.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="text-gray-900 block mb-1">Full Keyboard Navigation</strong>
                <span className="text-gray-600">All interactive forms, assessment questions, code editor actions, and modals are navigable via Tab, Shift+Tab, and Enter/Space.</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="text-gray-900 block mb-1">High-Contrast Color Ratios</strong>
                <span className="text-gray-600">Text and interactive elements satisfy the 4.5:1 minimum contrast ratio against dark and light background surfaces.</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="text-gray-900 block mb-1">Screen Reader Compatibility</strong>
                <span className="text-gray-600">Semantic HTML5 tags, ARIA roles, landmarks, and live status regions support NVDA, JAWS, and VoiceOver screen readers.</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="text-gray-900 block mb-1">Dual-Mode Interview Options</strong>
                <span className="text-gray-600">Mock interview simulations provide direct keyboard typing fallback alongside live microphone speech recognition.</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              3. Accessibility Feedback &amp; Assistance
            </h2>
            <p>
              If you experience any accessibility barriers or require accommodations in accessing assessments or certification records, 
              please contact our National Accessibility Helpdesk:
            </p>
            <div className="mt-3 p-4 bg-slate-900 text-white rounded-xl space-y-1 text-xs font-mono">
              <div className="text-teal-400 font-bold">SkillSetu Accessibility Cell</div>
              <div>Email: accessibility@skillsetu.gov.in &bull; Toll-Free: 1800-11-2026</div>
              <div>Available Monday through Friday, 09:00 - 18:00 IST</div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

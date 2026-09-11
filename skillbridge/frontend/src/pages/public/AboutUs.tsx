import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, GraduationCap, Briefcase, ShieldCheck, ArrowLeft, 
  Cpu, Award, Sparkles, CheckCircle2, ChevronRight, Zap, Target
} from 'lucide-react';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';

export default function AboutUs() {
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

          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-secondary text-xs">
              Sign In
            </Link>
            <Link to="/" className="btn-primary text-xs flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800 relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-4 relative z-10">
          <Breadcrumbs className="text-slate-400" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Smart India Hackathon 2026 &bull; Problem Statement SIH26044
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Building India&apos;s Sovereign Bridge Between Higher Education &amp; Enterprise Hiring
          </h1>
          <p className="text-base text-slate-300 leading-relaxed max-w-3xl">
            SkillSetu transforms the national talent pipeline into a high-speed, closed-loop digital highway. 
            By synchronizing university curricula with live industry requisitions, we permanently resolve the 
            divergence between academic learning and real-world employment.
          </p>
        </div>
      </section>

      {/* Main Narrative */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* The Problem & The Solution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 sm:p-8 bg-white rounded-2xl border border-red-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">The National Dilemma</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Every year, over 1.5 million engineering and vocational students graduate in India. Yet, over 48% are deemed 
              unemployable by corporate recruiters due to a 3-year university syllabus lag, theoretical memorization, and 
              a lack of verifiable hands-on execution experience.
            </p>
          </div>

          <div className="p-6 sm:p-8 bg-white rounded-2xl border border-emerald-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">The SkillSetu Breakthrough</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              We deploy an autonomous four-sided harmonization grid. Students prove skills through real-time code execution; 
              recruiters hire with cryptographic certainty; academicians auto-revise syllabi with AI BoS resolutions; 
              and regulators monitor critical national workforce deficits in real time.
            </p>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl font-bold text-gray-900">The Four-Sided National Stakeholder Highway</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1.5">
              A unified infrastructure aligning incentives across the entire Indian education and employment spectrum.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 bg-white rounded-2xl border border-gray-200 space-y-3 shadow-xs hover:border-teal-500 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-gray-900 text-sm">1. For Students</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Code execution arena, AST algorithmic Big-O audits, AI voice mock interviews, and tamperproof TrustLedger badges.
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-gray-200 space-y-3 shadow-xs hover:border-blue-500 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <Briefcase className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-gray-900 text-sm">2. For Recruiters</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Unbiased Blind Mode screening, automated 1-click .ics scheduling, retention predictions, and smart-contract LOIs.
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-gray-200 space-y-3 shadow-xs hover:border-purple-500 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-gray-900 text-sm">3. For Academicians</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Curriculum Harmonizer mapping syllabus gaps, auto-generating BoS resolutions, and preparing NAAC/NBA SSR dossiers.
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-gray-200 space-y-3 shadow-xs hover:border-amber-500 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-gray-900 text-sm">4. For Regulators</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Real-time regional skill deficit heatmaps (Semiconductors, Quantum, AI) and circular dispatch across AICTE institutions.
              </p>
            </div>
          </div>
        </div>

        {/* Sovereign Architecture Callout */}
        <div className="p-6 sm:p-8 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-teal-400 font-bold text-xs">
            <Cpu className="w-4 h-4" />
            <span>SOVEREIGN ML ARCHITECTURE &bull; ZERO DATA EGRESS</span>
          </div>
          <h3 className="text-xl font-bold text-white">
            Engineered In India, For India
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            All 8 primary algorithmic evaluation engines operate locally with sub-millisecond execution, zero commercial 
            API token costs, and 100% compliance with India&apos;s Digital Personal Data Protection (DPDP) Act 2023.
          </p>
        </div>

      </main>
    </div>
  );
}

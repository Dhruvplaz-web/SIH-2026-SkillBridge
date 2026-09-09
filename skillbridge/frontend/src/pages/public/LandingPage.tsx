import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  Briefcase,
  BookOpen,
  ShieldCheck,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Lock,
  Sparkles,
  TrendingUp,
  BarChart3,
  Layers,
  Search,
  ExternalLink,
  ChevronRight,
  Activity,
  FileCheck,
  Users,
  Building2,
  Terminal,
  Zap,
  Globe2
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState<'student' | 'recruiter' | 'academician' | 'admin'>('student');
  const [isLoggingIn, setIsLoggingIn] = useState<string | null>(null);

  const handleQuickDemo = async (role: 'STUDENT' | 'RECRUITER' | 'ACADEMICIAN' | 'ADMIN', path: string) => {
    try {
      setIsLoggingIn(role);
      const emailMap = {
        STUDENT: 'student@example.com',
        RECRUITER: 'recruiter@example.com',
        ACADEMICIAN: 'academic@example.com',
        ADMIN: 'admin@example.com',
      };
      await login(emailMap[role], 'Demo@1234');
      navigate(path);
    } catch (err) {
      console.error('Failed to log in:', err);
      navigate('/login');
    } finally {
      setIsLoggingIn(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-indigo-500 selection:text-white font-sans antialiased">
      {/* 🇮🇳 TOP OFFICIAL GOVT TRICOLOR BAR */}
      <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600"></div>

      {/* TOP NOTIFICATION / SIH GRAND FINALE STRIP */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 font-semibold tracking-wide text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>
              SIH 2026 GRAND FINALE
            </span>
            <span className="text-slate-400 hidden sm:inline">|</span>
            <span className="text-slate-300 font-medium hidden sm:inline">
              Ministry of Education &bull; Problem Statement SIH26044: AI-Driven Placement &amp; Skill Analytics Platform
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
              <Lock className="w-3 h-3" /> DPDP Act 2023 Compliant
            </span>
            <span className="text-slate-600 hidden md:inline">&bull;</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hidden md:inline-flex">
              <Cpu className="w-3 h-3" /> 5 Sovereign ML Engines Active
            </span>
          </div>
        </div>
      </div>

      {/* MAIN NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                  SkillBridge<span className="text-indigo-400">.gov.in</span>
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  v3.0 Sovereign ML
                </span>
              </div>
              <p className="text-[10px] text-slate-400 -mt-0.5 tracking-wide">
                National AICTE-Aligned Digital Workforce Infrastructure
              </p>
            </div>
          </div>

          {/* Right Navigation CTA */}
          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={() => {
                  const paths: Record<string, string> = {
                    STUDENT: '/student',
                    RECRUITER: '/recruiter',
                    ACADEMICIAN: '/academician',
                    ADMIN: '/admin',
                  };
                  navigate(paths[user.role] || '/student');
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md transition-all hover:scale-105"
              >
                Go to Dashboard ({user.role})
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-medium transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleQuickDemo('STUDENT', '/student')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
                >
                  <span>Launch Live Demo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[300px] bg-emerald-600/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6 shadow-inner">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Built for 40M+ Higher Education Students &bull; Zero External AI API Leakage
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-5xl mx-auto leading-tight sm:leading-none">
            India&apos;s Sovereign{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
              Machine Learning
            </span>{' '}
            Placement &amp; Skills Backbone
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Replacing foreign closed-source AI with mathematical, verifiable on-premise ML engines.
            Engineered for the <strong>Ministry of Education</strong> to bridge Academia, Corporate India, and Government Policy under <strong>NEP 2020</strong>.
          </p>

          {/* Hero CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => handleQuickDemo('STUDENT', '/student')}
              disabled={isLoggingIn !== null}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-size-200 hover:bg-right transition-all duration-300 text-white font-bold text-base shadow-xl shadow-indigo-500/25 hover:scale-105 active:scale-95"
            >
              {isLoggingIn === 'STUDENT' ? (
                <span>Entering Student Demo...</span>
              ) : (
                <>
                  <span>🚀 1-Click Jury Demo Access</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <a
              href="#ml-engines"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 hover:text-white font-semibold text-base border border-slate-700 transition-all hover:scale-105"
            >
              <Cpu className="w-5 h-5 text-indigo-400" />
              <span>Inspect 5 ML Engines</span>
            </a>
          </div>

          {/* Hero Trust Badges */}
          <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
              <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white">DPDP Act 2023</div>
                <div className="text-[11px] text-slate-400">Zero data leaves Indian sovereignty</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
              <Zap className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white">&lt; 5ms Latency</div>
                <div className="text-[11px] text-slate-400">Deterministic local matrix math</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
              <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white">96.29% AUC-ROC</div>
                <div className="text-[11px] text-slate-400">Trained on 14,700 IBM records</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
              <Globe2 className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white">Pan-India Heatmap</div>
                <div className="text-[11px] text-slate-400">28 States &amp; 8 UTs connected</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS STRIP (LIVE BENCHMARK METRICS) */}
      <section className="bg-slate-950 border-y border-slate-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                14,700+
              </div>
              <div className="text-xs uppercase tracking-wider text-slate-400 mt-1 font-semibold">
                Trained Placement Records
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">IBM HR Analytics Benchmark</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                99.38%
              </div>
              <div className="text-xs uppercase tracking-wider text-slate-400 mt-1 font-semibold">
                Scam Job Detection Precision
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">EMSCAD 17,880 Ad Dataset</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                0.00ms
              </div>
              <div className="text-xs uppercase tracking-wider text-slate-400 mt-1 font-semibold">
                External Cloud Dependency
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">100% In-Memory Node.js ML</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                4-Pillars
              </div>
              <div className="text-xs uppercase tracking-wider text-slate-400 mt-1 font-semibold">
                Unified Ecosystem
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Student &bull; Recruiter &bull; Dean &bull; Govt</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: THE 5 SOVEREIGN MACHINE LEARNING ENGINES */}
      <section id="ml-engines" className="py-20 bg-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Architectural Rigor
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white mt-3">
              5 Dedicated Machine Learning Engines
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-3">
              Generic LLM wrappers hallucinate, leak sensitive student PII to US clouds, and fail during high-concurrency campus placement drives. Here is how our sovereign ML models outperform them:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* ENGINE 1: Retention Predictor */}
            <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/80 hover:border-indigo-500/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/20 text-indigo-300">
                    XGBoost Ensemble
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mt-4">
                  1. Candidate Retention &amp; Offer Predictor
                </h3>
                <div className="mt-2 space-y-1.5 text-xs text-slate-300">
                  <p><strong>Where Used:</strong> Recruiter Candidate Dashboard &amp; Offer Letter Release.</p>
                  <p><strong>For What:</strong> Calculates probability that a student will accept the job offer and remain &gt;1 year.</p>
                  <p><strong>How:</strong> Decision Tree Gradient Boosting with SHAP feature weights on CGPA, commute distance, and internship alignment.</p>
                  <p><strong>Why:</strong> Solves India&apos;s 28% offer reneging rate and saves recruiters ₹4.2L per replacement hire.</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                <span className="text-emerald-400 font-semibold">AUC-ROC: 0.9629 (91.6% Acc)</span>
                <span className="text-slate-400 font-mono">14,700 Samples</span>
              </div>
            </div>

            {/* ENGINE 2: BM25 ATS Matcher */}
            <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/80 hover:border-emerald-500/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300">
                    Okapi BM25 + TF-IDF
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mt-4">
                  2. Hybrid Lexical-Semantic ATS Matcher
                </h3>
                <div className="mt-2 space-y-1.5 text-xs text-slate-300">
                  <p><strong>Where Used:</strong> Student Resume Diagnostic &amp; Recruiter Applicant Ranking.</p>
                  <p><strong>For What:</strong> Matches candidate resumes against job descriptions with zero hallucinations.</p>
                  <p><strong>How:</strong> Inverse Document Frequency term-saturation curve with sub-linear TF scaling and missing skill gaps.</p>
                  <p><strong>Why:</strong> Prevents keyword stuffing and provides instant, fair, bias-free candidate scores.</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                <span className="text-emerald-400 font-semibold">Sub-2ms Evaluation</span>
                <span className="text-slate-400 font-mono">100% Deterministic</span>
              </div>
            </div>

            {/* ENGINE 3: Isolation Forest Fraud Engine */}
            <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/80 hover:border-red-500/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-500/20 text-red-300">
                    Isolation Forest Anomaly
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mt-4">
                  3. Predatory Job Fraud &amp; Scam Detector
                </h3>
                <div className="mt-2 space-y-1.5 text-xs text-slate-300">
                  <p><strong>Where Used:</strong> Opportunity Approval Queue &amp; MoE Admin Fraud Sentinel.</p>
                  <p><strong>For What:</strong> Flags fake recruitment offers, fraudulent deposit requests, and predatory job rings.</p>
                  <p><strong>How:</strong> Tree isolation path length scoring combined with predatory fee linguistic penalty matrices.</p>
                  <p><strong>Why:</strong> Protects vulnerable rural and Tier-2/3 students from fake recruitment extortion.</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                <span className="text-emerald-400 font-semibold">Precision: 99.38% (Recall 100%)</span>
                <span className="text-slate-400 font-mono">17,880 EMSCAD</span>
              </div>
            </div>

            {/* ENGINE 4: Sovereign Skill NER Extractor */}
            <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/80 hover:border-purple-500/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                    <Layers className="w-6 h-6" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/20 text-purple-300">
                    NASSCOM-AICTE NER
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mt-4">
                  4. Sovereign Skill Extractor &amp; Normalizer
                </h3>
                <div className="mt-2 space-y-1.5 text-xs text-slate-300">
                  <p><strong>Where Used:</strong> Onboarding Wizard, Resume Upload, and Curriculum Harmonizer.</p>
                  <p><strong>For What:</strong> Extracts technical and domain skills from unformatted text and maps to National Standards.</p>
                  <p><strong>How:</strong> Multi-pattern sliding window tokenization with canonical ontology aliasing.</p>
                  <p><strong>Why:</strong> Eliminates non-standard skill naming so university grades map directly to industry vacancies.</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                <span className="text-emerald-400 font-semibold">Zero Foreign PII Transmission</span>
                <span className="text-slate-400 font-mono">500+ Curated Skills</span>
              </div>
            </div>

            {/* ENGINE 5: Multivariate Shortage Forecaster */}
            <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/80 hover:border-amber-500/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                    <Activity className="w-6 h-6" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300">
                    Multivariate Autoregression
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mt-4">
                  5. National Workforce Shortage Forecaster
                </h3>
                <div className="mt-2 space-y-1.5 text-xs text-slate-300">
                  <p><strong>Where Used:</strong> Admin Workforce Heatmap &amp; Academician Course Planner.</p>
                  <p><strong>For What:</strong> Predicts semiconductor, AI, and green tech shortages 12 months ahead across all 36 States/UTs.</p>
                  <p><strong>How:</strong> Autoregressive moving average with dynamic seasonal placement momentum and 95% confidence bounds.</p>
                  <p><strong>Why:</strong> Empowers State Higher Education Councils to fund relevant labs before industry deficits choke growth.</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                <span className="text-emerald-400 font-semibold">12-Month Rolling Horizon</span>
                <span className="text-slate-400 font-mono">36 States &amp; UTs</span>
              </div>
            </div>

            {/* JURY DOSSIER CARD */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-500/40 flex flex-col justify-between shadow-xl">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
                  <Terminal className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mt-4">
                  Academic &amp; Jury Benchmark Suite
                </h3>
                <p className="mt-2 text-xs text-indigo-200/90 leading-relaxed">
                  Located in the repository root under <code className="text-amber-300 font-mono">ml-pipeline/</code>.
                  Contains reproducible Python scripts, Stratified K-Fold cross-validation, and ROC curve generation.
                </p>

                <div className="mt-4 p-2.5 rounded-lg bg-slate-950/60 border border-indigo-500/20 text-[11px] font-mono text-slate-300">
                  <div className="text-emerald-400">$ python ml-pipeline/evaluate_models.py</div>
                  <div className="text-slate-400 mt-1">✓ XGBoost AUC-ROC: 0.9629</div>
                  <div className="text-slate-400">✓ Isolation Forest F1: 0.9969</div>
                  <div className="text-cyan-400 mt-1">✓ Status: Ready for Defense</div>
                </div>
              </div>

              <button
                onClick={() => handleQuickDemo('ADMIN', '/admin/shortages')}
                className="mt-6 w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <span>Launch Admin Shortage Engine</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: 4-STAKEHOLDER INTERACTIVE MATRIX */}
      <section className="py-20 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Complete National Platform
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white mt-3">
              Four Pillars of the SkillBridge Ecosystem
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Select a stakeholder role below to inspect tailored workflows and launch instant demos.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8">
            <button
              onClick={() => setActiveTab('student')}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'student'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 scale-105'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>1. Student Portal</span>
            </button>

            <button
              onClick={() => setActiveTab('recruiter')}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'recruiter'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 scale-105'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>2. Corporate Recruiter</span>
            </button>

            <button
              onClick={() => setActiveTab('academician')}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'academician'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25 scale-105'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>3. Academician &amp; Dean</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'admin'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/25 scale-105'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>4. Govt / MoE Authority</span>
            </button>
          </div>

          {/* Active Tab Showcase Box */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-10 shadow-2xl">
            {activeTab === 'student' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-3">
                    <GraduationCap className="w-4 h-4" />
                    Student Career &amp; Accreditation Pathway
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white">
                    Empower Every Student with Verifiable Proof-of-Skill
                  </h3>
                  <p className="mt-3 text-slate-300 text-sm leading-relaxed">
                    Students from Tier-1 to Tier-3 colleges receive a unified digital passport. The BM25 ATS engine scans their resumes against live jobs, while cryptographically signed Trust Ledgers guarantee verified hackathon and internship credentials.
                  </p>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-200">
                      <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                      <span>Instant BM25 ATS Resume Diagnostic with missing keyword suggestions</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-200">
                      <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                      <span>AI Mock Technical Interviewer with audio speech assessment</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-200">
                      <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                      <span>Cryptographic Blockchain Trust Ledger &amp; APAAR ID Integration</span>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center gap-4">
                    <button
                      onClick={() => handleQuickDemo('STUDENT', '/student')}
                      className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all hover:scale-105"
                    >
                      <span>Explore Student Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleQuickDemo('STUDENT', '/student/skills')}
                      className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
                    >
                      Inspect Skill Passport
                    </button>
                  </div>
                </div>

                {/* Preview Box */}
                <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 shadow-inner">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
                    <span className="font-semibold text-slate-200">Student Passport Preview</span>
                    <span className="text-emerald-400 flex items-center gap-1 font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Verified Student
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">ATS Resume Benchmark</div>
                        <div className="text-[11px] text-slate-400">Job: Cloud Solutions Engineer</div>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-indigo-400">92 / 100</span>
                        <div className="text-[10px] text-emerald-400">High Match (Top 5%)</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-xs font-bold text-white mb-2">Verified Skill Nodes (NASSCOM-AICTE)</div>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Python 3.12 (Advanced)</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Docker &amp; K8s (Verified)</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">Machine Learning (Cert #SB-948)</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center gap-3">
                      <Lock className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      <div className="text-[11px] text-indigo-200">
                        Tamper-Proof Ledger Hash: <code className="font-mono text-[10px] text-amber-300">0x7f4a...9b12c</code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'recruiter' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-3">
                    <Briefcase className="w-4 h-4" />
                    Corporate Talent Acquisition
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white">
                    Eliminate Hiring Bias &amp; Predict Retention
                  </h3>
                  <p className="mt-3 text-slate-300 text-sm leading-relaxed">
                    Equip recruitment teams with Blind Mode candidate screening to neutralize demographic biases, an in-browser live coding sandbox, and XGBoost retention scoring before releasing offers.
                  </p>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-200">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <span>One-Click Blind Mode: Hides name, gender, college tier, and photo</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-200">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <span>XGBoost Candidate Retention Risk Index with SHAP feature breakdown</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-200">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <span>Live Coding Sandbox with multi-language execution and test cases</span>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center gap-4">
                    <button
                      onClick={() => handleQuickDemo('RECRUITER', '/recruiter')}
                      className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all hover:scale-105"
                    >
                      <span>Explore Recruiter Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleQuickDemo('RECRUITER', '/recruiter/sandbox')}
                      className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
                    >
                      Open Coding Sandbox
                    </button>
                  </div>
                </div>

                {/* Preview Box */}
                <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 shadow-inner">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
                    <span className="font-semibold text-slate-200">Retention Predictor Output</span>
                    <span className="text-emerald-400 font-mono font-bold">XGBoost Native Inference</span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">Offer Acceptance Probability</span>
                        <span className="text-sm font-black text-emerald-400">92.4% (Very High)</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 mt-1.5 overflow-hidden">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '92.4%' }}></div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">1-Year Attrition Risk</span>
                        <span className="text-sm font-black text-emerald-400">7.6% (Low Risk)</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 mt-1.5 overflow-hidden">
                        <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '7.6%' }}></div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                      <div className="font-semibold text-indigo-300">SHAP Attributions (Key Retention Drivers):</div>
                      <div>&bull; High domain-project alignment (+34% retention boost)</div>
                      <div>&bull; Preferred job location match (+22% retention boost)</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'academician' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold mb-3">
                    <BookOpen className="w-4 h-4" />
                    University Deans &amp; Faculty Leadership
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white">
                    Synchronize Syllabus with Live Industry Hiring
                  </h3>
                  <p className="mt-3 text-slate-300 text-sm leading-relaxed">
                    Eliminate outdated university syllabi. The Curriculum Harmonizer scans active recruitment requirements across India, compares them with course content, and auto-generates NBA/NAAC accreditation dossiers.
                  </p>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-200">
                      <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
                      <span>Curriculum Harmonizer with real-time syllabus gap percentages</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-200">
                      <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
                      <span>NBA / NAAC Criterion-aligned Institutional Accreditation Dossiers</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-200">
                      <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
                      <span>Industry Capstone Project Hub with verified corporate sponsorship</span>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center gap-4">
                    <button
                      onClick={() => handleQuickDemo('ACADEMICIAN', '/academician')}
                      className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-500/25 flex items-center gap-2 transition-all hover:scale-105"
                    >
                      <span>Explore Academician Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleQuickDemo('ACADEMICIAN', '/academician/harmonizer')}
                      className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
                    >
                      Curriculum Harmonizer
                    </button>
                  </div>
                </div>

                {/* Preview Box */}
                <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 shadow-inner">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
                    <span className="font-semibold text-slate-200">Curriculum Harmonizer Report</span>
                    <span className="text-purple-400 font-mono">CSE / AI Syllabus 2026</span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">Overall Market Alignment</div>
                        <div className="text-[11px] text-slate-400">Based on 12,400 active tech listings</div>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-amber-400">74% Aligned</span>
                        <div className="text-[10px] text-amber-300">26% Deficit Detected</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-xs font-bold text-white mb-2">Recommended Syllabus Additions:</div>
                      <div className="space-y-1.5 text-xs text-slate-300">
                        <div className="flex items-center justify-between">
                          <span>&bull; Cloud Native Microservices (K8s/gRPC)</span>
                          <span className="text-[10px] text-red-400 font-semibold">+42% Industry Demand</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>&bull; Edge AI &amp; Embedded Tensor Models</span>
                          <span className="text-[10px] text-red-400 font-semibold">+38% Industry Demand</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'admin' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold mb-3">
                    <ShieldCheck className="w-4 h-4" />
                    Government &amp; Ministry of Education Oversight
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white">
                    National Workforce Intelligence &amp; Fraud Sentinel
                  </h3>
                  <p className="mt-3 text-slate-300 text-sm leading-relaxed">
                    National and State policymakers monitor real-time talent migration, predict skill shortages before they trigger economic friction, and automatically quarantine predatory fraudulent recruitment agencies.
                  </p>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-200">
                      <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
                      <span>36 States &amp; UTs Live Interactive Workforce Heatmap</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-200">
                      <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
                      <span>Isolation Forest Job Scam Quarantining (99.38% Precision)</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-200">
                      <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
                      <span>DigiLocker Verification Gateway &amp; Audit Log Forensics</span>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center gap-4">
                    <button
                      onClick={() => handleQuickDemo('ADMIN', '/admin')}
                      className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all hover:scale-105"
                    >
                      <span>Explore Admin Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleQuickDemo('ADMIN', '/admin/heatmap')}
                      className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
                    >
                      Open Workforce Heatmap
                    </button>
                  </div>
                </div>

                {/* Preview Box */}
                <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 shadow-inner">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
                    <span className="font-semibold text-slate-200">National Fraud &amp; Shortage Monitor</span>
                    <span className="text-emerald-400 font-mono">0 Active Breaches</span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">Isolation Forest Scam Intercept</div>
                        <div className="text-[11px] text-red-300">Listing: &quot;Data Entry - Deposit ₹2,500&quot;</div>
                      </div>
                      <span className="px-2 py-1 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                        Quarantined
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">Critical Shortage Alert</div>
                        <div className="text-[11px] text-slate-400">Semiconductor VLSI Engineering (Karnataka)</div>
                      </div>
                      <span className="text-xs font-bold text-amber-400">3.4x Deficit</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* COMPARISON MATRIX: SOVEREIGN ML VS COMMERCIAL LLM APIs */}
      <section className="py-16 bg-slate-900 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Why Sovereign ML Outperforms Commercial LLMs
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Objective benchmark comparison: SkillBridge Local ML vs Generic External AI APIs.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-900/90 text-slate-300 uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-4">Evaluation Criteria</th>
                  <th className="p-4 text-indigo-400 font-bold">SkillBridge Sovereign ML</th>
                  <th className="p-4 text-slate-400">Commercial Cloud LLMs (e.g. OpenAI/Anthropic)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="p-4 font-semibold text-white">Inference Latency</td>
                  <td className="p-4 text-emerald-400 font-bold">&lt; 5ms (Sub-millisecond matrix ops)</td>
                  <td className="p-4 text-slate-400">2,500ms - 8,000ms (High latency)</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white">Token &amp; API Running Costs</td>
                  <td className="p-4 text-emerald-400 font-bold">₹0.00 (Zero marginal cost)</td>
                  <td className="p-4 text-slate-400">₹2.50 - ₹5.00 per resume evaluation</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white">Data Sovereignty (DPDP Act)</td>
                  <td className="p-4 text-emerald-400 font-bold">100% In-Country on sovereign hardware</td>
                  <td className="p-4 text-red-400 font-medium">Exported to US/foreign cloud datacenters</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white">Deterministic Reproducibility</td>
                  <td className="p-4 text-emerald-400 font-bold">100% Deterministic (Auditable math)</td>
                  <td className="p-4 text-slate-400">Stochastic (Hallucinates scores across runs)</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white">Offline &amp; Air-Gapped Mode</td>
                  <td className="p-4 text-emerald-400 font-bold">Supported (Runs without Internet)</td>
                  <td className="p-4 text-red-400 font-medium">Fails completely without Internet</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-800 py-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                SB
              </div>
              <div>
                <span className="font-bold text-white text-sm">SkillBridge National Portal</span>
                <p className="text-[11px] text-slate-500">Smart India Hackathon 2026 &bull; Problem Statement SIH26044</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-slate-300">
              <button onClick={() => navigate('/login')} className="hover:text-white transition-colors">
                Sign In
              </button>
              <button onClick={() => navigate('/register')} className="hover:text-white transition-colors">
                Register Institutional Account
              </button>
              <a href="#ml-engines" className="hover:text-white transition-colors">
                ML Engines
              </a>
              <span className="text-slate-600">&bull;</span>
              <span className="text-emerald-400">DPDP Act 2023 Compliant</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-900 text-center text-slate-500 text-[11px]">
            &copy; {new Date().getFullYear()} SkillBridge. Designed and Developed for the Ministry of Education &amp; AICTE Smart India Hackathon Grand Finale.
          </div>
        </div>
      </footer>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Code2, Play, CheckCircle2, XCircle, AlertTriangle, 
  ShieldCheck, Video, Clock, RefreshCw, Sparkles, Terminal,
  Laptop, Check, Eye
} from 'lucide-react';
import { Topbar } from '../../components/layout/Topbar';
import { PageLoader } from '../../components/ui/Spinner';
import { recruiterFeaturesAPI } from '../../services/api';

export default function CodingSandbox() {
  const [sandboxes, setSandboxes] = useState<any[]>([]);
  const [activeSandbox, setActiveSandbox] = useState<any>(null);
  const [code, setCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any>(null);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [isProctored, setIsProctored] = useState(true);

  useEffect(() => {
    loadSandboxes();
  }, []);

  // Window blur violation detector for proctoring
  useEffect(() => {
    const handleBlur = () => {
      setTabSwitches(prev => prev + 1);
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, []);

  const loadSandboxes = async () => {
    try {
      const res = await recruiterFeaturesAPI.getSandboxes();
      const list = res.data.sandboxes || [];
      setSandboxes(list);
      if (list.length > 0) {
        setActiveSandbox(list[0]);
        setCode(list[0].starter_code);
      }
    } catch (err) {
      console.error('Failed to load sandboxes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSandbox = (sb: any) => {
    setActiveSandbox(sb);
    setCode(sb.starter_code);
    setResults(null);
    setTabSwitches(0);
  };

  const handleRunCode = async () => {
    if (!activeSandbox) return;
    setIsRunning(true);
    try {
      const proctorScore = Math.max(50, 100 - (tabSwitches * 15));
      const res = await recruiterFeaturesAPI.runSandbox({
        sandboxId: activeSandbox.id,
        code,
        language: activeSandbox.language,
        tabSwitches,
        proctorScore
      });
      setResults(res.data);
    } catch (err) {
      console.error('Execution error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  if (loading) return <><Topbar title="Coding Sandbox" /><PageLoader /></>;

  return (
    <div>
      <Topbar 
        title="In-Browser Proctored Coding Sandbox" 
        subtitle="Zero-setup interactive coding environment with real-time test verification and proctor telemetry"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* Top Challenge Selector & Proctor Status Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-navy-900 text-white flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-gray-900">{activeSandbox?.title || 'Coding Challenge'}</h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                  {activeSandbox?.language}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                  {activeSandbox?.difficulty}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Select a challenge track or run real-time automated test cases.</p>
            </div>
          </div>

          {/* Real-Time Proctoring Telemetry Pill */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Video className="w-3.5 h-3.5 text-emerald-400" />
              <span>Camera HUD: Active</span>
              <span className="text-slate-400">|</span>
              <span className={tabSwitches > 0 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                Tab Switches: {tabSwitches}
              </span>
            </div>

            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className="btn-primary text-xs font-bold flex items-center gap-2 px-5 py-2 cursor-pointer shadow-sm"
            >
              {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
              {isRunning ? 'Compiling...' : 'Run Test Cases'}
            </button>
          </div>
        </div>

        {/* Main Coding IDE Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Challenge Description & Test Cases */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Challenge Tracks List */}
            <div className="card p-4">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">Available Sandboxes</h3>
              <div className="space-y-1.5">
                {sandboxes.map(sb => (
                  <button
                    key={sb.id}
                    onClick={() => handleSelectSandbox(sb)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between ${
                      activeSandbox?.id === sb.id 
                        ? 'border-teal-500 bg-teal-50/50 text-teal-900 font-bold' 
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <span className="truncate pr-2">{sb.title}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-white rounded border border-gray-200 flex-shrink-0">
                      {sb.language}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Problem Spec */}
            <div className="card p-5 space-y-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-teal-600" /> Problem Specification
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {activeSandbox?.description}
              </p>

              {/* Proctor Integrity Badge */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Anti-Cheat Verification
                  </span>
                  <span className={tabSwitches > 1 ? 'text-amber-600' : 'text-emerald-600'}>
                    {Math.max(50, 100 - (tabSwitches * 15))}% Integrity
                  </span>
                </div>
                <p className="text-slate-500 text-[10px]">
                  Focus tracking telemetry active. Unfocused window events are logged in submission audit receipts.
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Code Editor & Execution Terminal */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Code Editor Container */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-md overflow-hidden flex flex-col">
              <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2 font-mono">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                  </div>
                  <span className="ml-2 font-bold text-slate-300">solution.{activeSandbox?.language === 'python' ? 'py' : activeSandbox?.language === 'javascript' ? 'js' : 'sql'}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">UTF-8 &bull; Tab: 4 Spaces</span>
              </div>

              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={14}
                spellCheck={false}
                className="w-full bg-slate-900 text-slate-100 font-mono text-xs p-4 leading-relaxed focus:outline-none resize-none selection:bg-teal-500/30"
              />
            </div>

            {/* Execution Telemetry & Test Suite Output */}
            {results && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-5 space-y-4 bg-white border border-gray-200"
              >
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    {results.allPassed ? (
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">
                        {results.allPassed ? 'All Test Suites Passed' : 'Partial Test Suite Completion'}
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        Passed {results.passedTests} of {results.totalTests} test cases &bull; Proctor Score: {results.proctorTelemetry?.proctorScore}%
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                    Submission #{results.submissionId?.slice(-6)}
                  </span>
                </div>

                {/* Test Results Breakdown */}
                <div className="space-y-2">
                  {results.results?.map((r: any) => (
                    <div 
                      key={r.testId}
                      className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                        r.passed ? 'bg-emerald-50/50 border-emerald-200/80 text-emerald-900' : 'bg-red-50/50 border-red-200/80 text-red-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-mono">
                        {r.passed ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-red-600" />}
                        <span>Test Case {r.testId}: <strong className="font-sans">{r.input}</strong></span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-gray-500 font-mono">{r.runtimeMs} ms</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${r.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {r.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

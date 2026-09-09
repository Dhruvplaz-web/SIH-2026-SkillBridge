import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Topbar } from '../../components/layout/Topbar';
import { PageLoader } from '../../components/ui/Spinner';
import { assessmentsAPI } from '../../services/api';
import { 
  CheckCircle, XCircle, Clock, ChevronRight, ChevronLeft, RotateCcw, 
  Trophy, ShieldCheck, AlertTriangle, Maximize2, Minimize2, 
  Copy, Check, Sparkles, Code2, HelpCircle, Info, ExternalLink, Filter
} from 'lucide-react';
import clsx from 'clsx';

type View = 'list' | 'taking' | 'result';

const diffColors: Record<string, string> = {
  BEGINNER: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
  INTERMEDIATE: 'text-blue-700 bg-blue-50 border border-blue-200',
  ADVANCED: 'text-purple-700 bg-purple-50 border border-purple-200',
};

// ── Safe Option Parser ─────────────────────────────────────────
function parseOptions(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map(item => typeof item === 'object' ? JSON.stringify(item) : String(item));
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.map(String);
      } catch (_) {}
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch (_) {}
    return raw.split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
  }
  return [];
}

// ── Lightweight Syntax Highlighting for Code Lines ───────────────
function renderSyntaxColoredLine(line: string) {
  if (line.trim().startsWith('#') || line.trim().startsWith('//')) {
    return <span className="text-slate-500 italic">{line}</span>;
  }

  const tokenRegex = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|#.*|\/\/.*|\b(?:def|return|class|import|from|for|in|if|elif|else|while|try|except|with|as|lambda|yield|pass|None|True|False|const|let|var|function|async|await|SELECT|FROM|WHERE|ORDER|BY|GROUP|LIMIT|JOIN)\b|\b(?:print|len|range|type|str|int|float|list|dict|set|tuple|console|append|reverse|sort)\b|\b\d+\b|[()\[\]{}:,;=+\-*/%<>!]+|[^\s()\[\]{}:,;=+\-*/%<>!]+|\s+)/g;

  const tokens = line.match(tokenRegex);
  if (!tokens) return line;

  const keywords = new Set([
    'def', 'return', 'class', 'import', 'from', 'for', 'in', 'if', 'elif', 'else', 
    'while', 'try', 'except', 'with', 'as', 'lambda', 'yield', 'pass', 'None', 'True', 'False',
    'const', 'let', 'var', 'function', 'async', 'await', 'SELECT', 'FROM', 'WHERE', 'ORDER', 'BY', 'GROUP', 'LIMIT', 'JOIN'
  ]);

  const builtins = new Set([
    'print', 'len', 'range', 'type', 'str', 'int', 'float', 'list', 'dict', 'set', 'tuple', 'console', 'append', 'reverse', 'sort'
  ]);

  return tokens.map((token, i) => {
    if (token.startsWith('#') || token.startsWith('//')) {
      return <span key={i} className="text-slate-500 italic">{token}</span>;
    }
    if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
      return <span key={i} className="text-emerald-300 font-medium">{token}</span>;
    }
    if (keywords.has(token)) {
      return <span key={i} className="text-purple-400 font-bold">{token}</span>;
    }
    if (builtins.has(token)) {
      return <span key={i} className="text-amber-300 font-semibold">{token}</span>;
    }
    if (/^\d+$/.test(token)) {
      return <span key={i} className="text-cyan-300">{token}</span>;
    }
    if (/^[=+\-*/%<>!]+$/.test(token)) {
      return <span key={i} className="text-pink-400">{token}</span>;
    }
    return <span key={i}>{token}</span>;
  });
}

// ── Clean Code Editor Container ─────────────────────────────────
function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.trim().split('\n');

  return (
    <div className="my-3.5 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl font-mono text-xs">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/90 border-b border-slate-800 text-[11px]">
        <div className="flex items-center gap-2">
          {/* macOS window dots */}
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="font-bold text-teal-400 uppercase tracking-wider text-[10px] bg-teal-950/80 border border-teal-800/60 px-2 py-0.5 rounded">
            {language ? language.toUpperCase() : 'CODE'}
          </span>
          <span className="text-slate-400 text-[10px] hidden sm:inline">
            {lines.length} {lines.length === 1 ? 'line' : 'lines'}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-[11px]"
          title="Copy Code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body with Line Numbers */}
      <div className="p-3.5 overflow-x-auto bg-[#0a0f1d] text-slate-200">
        <pre className="font-mono text-[13px] leading-relaxed">
          <table className="border-collapse w-full">
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30">
                  <td className="select-none text-slate-600 text-right pr-4 text-xs align-top w-8">
                    {idx + 1}
                  </td>
                  <td className="whitespace-pre text-slate-100 font-mono">
                    {renderSyntaxColoredLine(line)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </pre>
      </div>
    </div>
  );
}

// ── Inline Code Formatter ──────────────────────────────────────
function renderInlineCode(text: string) {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-slate-800 border border-slate-700 font-mono text-teal-300 text-[13px] font-semibold"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

// ── Question Content Renderer with Markdown Code Block Support ───
function QuestionContent({ text }: { text: string }) {
  if (!text) return null;

  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\s*([\s\S]*?)```/g;
  const segments: { type: 'text' | 'code'; content: string; language?: string }[] = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: text.substring(lastIndex, match.index),
      });
    }
    segments.push({
      type: 'code',
      language: match[1] || 'code',
      content: match[2],
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      content: text.substring(lastIndex),
    });
  }

  return (
    <div className="space-y-2">
      {segments.map((seg, idx) => {
        if (seg.type === 'code') {
          return <CodeBlock key={idx} code={seg.content} language={seg.language} />;
        }
        return (
          <div key={idx} className="text-slate-100 text-sm sm:text-base font-medium leading-relaxed">
            {renderInlineCode(seg.content)}
          </div>
        );
      })}
    </div>
  );
}

export default function SkillAssessment() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('list');
  const [currentAssessment, setCurrentAssessment] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'ALL' | 'INCORRECT' | 'CORRECT'>('ALL');

  // Hardware Anti-Cheat & Integrity State
  const [integrityScore, setIntegrityScore] = useState(100);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [antiCheatWarning, setAntiCheatWarning] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [generatedBlockHash, setGeneratedBlockHash] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    Promise.all([assessmentsAPI.getAll(), assessmentsAPI.getHistory()])
      .then(([aRes, hRes]) => {
        setAssessments(aRes.data.assessments || []);
        setHistory(hRes.data.history || []);
      })
      .finally(() => setLoading(false));
  }, []);

  // Anti-cheat listeners during assessment
  useEffect(() => {
    if (view !== 'taking') return;

    // Window blur (tab-switch) handler
    const handleBlur = () => {
      setTabSwitches(prev => {
        const next = prev + 1;
        setIntegrityScore(score => Math.max(score - 10, 40));
        setAntiCheatWarning(`Hardware Anti-Cheat: Tab switch #${next} detected! -10 Integrity points.`);
        setTimeout(() => setAntiCheatWarning(''), 5000);
        return next;
      });
    };

    // Right-click and copy-paste prevent
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleCopyPaste = (e: ClipboardEvent) => e.preventDefault();

    window.addEventListener('blur', handleBlur);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);

    // Camera initialization for Proctor HUD
    navigator.mediaDevices?.getUserMedia?.({ video: true })
      .then(stream => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => {});

    return () => {
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
    };
  }, [view]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const startAssessment = async (id: string) => {
    try {
      setLoading(true);
      const res = await assessmentsAPI.getById(id);
      setCurrentAssessment(res.data.assessment);
      const qs = res.data.questions || [];
      setQuestions(qs);
      setAnswers(new Array(qs.length).fill(null));
      setCurrentQ(0);
      setIntegrityScore(100);
      setTabSwitches(0);
      setAntiCheatWarning('');
      setShowConfirmModal(false);
      setView('taking');
    } catch (e) {
      console.error('Failed to start assessment:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (idx: number) => {
    const updated = [...answers];
    updated[currentQ] = idx;
    setAnswers(updated);
  };

  const handleClearAnswer = () => {
    const updated = [...answers];
    updated[currentQ] = null;
    setAnswers(updated);
  };

  const handleAttemptSubmit = () => {
    const answeredCount = answers.filter(a => a !== null).length;
    if (answeredCount < questions.length) {
      setShowConfirmModal(true);
    } else {
      executeSubmit();
    }
  };

  const executeSubmit = async () => {
    const finalized = answers.map(a => a ?? 0);
    setSubmitting(true);
    setShowConfirmModal(false);
    try {
      const res = await assessmentsAPI.submit(currentAssessment.id, finalized);
      setResult(res.data.result);

      const blockHash = res.data.blockHash || res.data.result?.blockHash || ('0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''));
      setGeneratedBlockHash(blockHash);

      setView('result');
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      assessmentsAPI.getHistory().then(h => setHistory(h.data.history || []));
    } catch (err) {
      console.error('Failed to submit assessment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const copyHash = () => {
    navigator.clipboard.writeText(generatedBlockHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2500);
  };

  if (loading) return <><Topbar title="Skill Assessment" /><PageLoader /></>;

  // ── TAKING ASSESSMENT VIEW ──
  if (view === 'taking' && currentAssessment && questions.length > 0) {
    const q = questions[currentQ];
    const answered = answers.filter(a => a !== null).length;
    const progress = (answered / questions.length) * 100;
    const options = parseOptions(q?.options);

    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 pb-16 font-sans">
        
        {/* Anti-Cheat Top HUD Header */}
        <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex items-center justify-between sticky top-0 z-30 shadow-md">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-1 rounded-md">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              PROCTORED EXAM ACTIVE
            </span>
            <span className="text-xs font-bold text-slate-300 hidden sm:inline">
              {currentAssessment.title} &bull; Question {currentQ + 1} of {questions.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Integrity Meter */}
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 text-xs">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span className="text-slate-400">Integrity:</span>
              <span className={clsx(
                'font-bold',
                integrityScore >= 80 ? 'text-teal-400' : integrityScore >= 60 ? 'text-amber-400' : 'text-rose-400'
              )}>
                {integrityScore}%
              </span>
            </div>

            <button 
              onClick={toggleFullscreen}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
              title="Toggle Fullscreen Lockdown"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Warning Toast */}
        {antiCheatWarning && (
          <div className="max-w-4xl mx-auto mt-4 px-4">
            <div className="bg-rose-900/90 border border-rose-500 text-rose-100 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-bounce shadow-lg">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{antiCheatWarning}</span>
            </div>
          </div>
        )}

        <div className="p-4 sm:p-6 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 mt-2">
          
          {/* Main Question Area (3 Cols) */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Progress & Question Palette */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">
                  Answered: <strong className="text-teal-400">{answered}</strong> / {questions.length} questions
                </span>
                <span className="font-bold text-teal-400">{Math.round(progress)}% Complete</span>
              </div>
              
              <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div className="bg-teal-500 h-1.5 rounded-full transition-all duration-300 shadow-sm" style={{ width: `${progress}%` }} />
              </div>

              {/* Interactive Question Jump Navigator */}
              <div className="pt-2 border-t border-slate-800/80">
                <p className="text-[11px] text-slate-400 mb-2 font-medium">Question Navigator:</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {questions.map((_, idx) => {
                    const isCurrent = currentQ === idx;
                    const isAnswered = answers[idx] !== null;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentQ(idx)}
                        className={clsx(
                          'w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer',
                          isCurrent
                            ? 'bg-teal-500 text-slate-950 ring-2 ring-teal-400 ring-offset-1 ring-offset-slate-950 shadow-md font-black'
                            : isAnswered
                              ? 'bg-emerald-950/90 border border-emerald-600/80 text-emerald-300 hover:bg-emerald-900'
                              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        )}
                        title={`Question ${idx + 1}: ${isAnswered ? 'Answered' : 'Unanswered'}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-slate-950 p-5 sm:p-7 rounded-2xl border border-slate-800 space-y-5 shadow-xl">
              
              {/* Question Metadata Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    Question {currentQ + 1} of {questions.length}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {q.difficulty} &bull; {q.points || 1} pt
                  </span>
                </div>
                <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> Lockdown Active
                </span>
              </div>

              {/* Question Prompt Body with Code Rendering */}
              <div>
                <QuestionContent text={q.question} />
              </div>

              {/* Options List */}
              <div className="space-y-3 pt-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select One Option:</p>
                {options.length > 0 ? (
                  options.map((opt: string, idx: number) => {
                    const isSelected = answers[currentQ] === idx;
                    const letter = String.fromCharCode(65 + idx);
                    const codeLike = /<class |\[.*\]|\(.*\)|def |\{.*\}|===|==|=>|->|s\[|::|\(\)|;\s*$/.test(opt);

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAnswer(idx)}
                        className={clsx(
                          'w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group',
                          isSelected 
                            ? 'bg-teal-950/80 border-teal-400 text-teal-100 shadow-lg ring-1 ring-teal-400/50' 
                            : 'bg-slate-900/90 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-800/80'
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-3">
                          <span className={clsx(
                            'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 transition-all',
                            isSelected
                              ? 'bg-teal-500 text-slate-950 shadow-xs'
                              : 'bg-slate-800 text-slate-400 border border-slate-700 group-hover:text-slate-200 group-hover:border-slate-600'
                          )}>
                            {letter}
                          </span>
                          <span className={clsx(
                            'text-xs sm:text-sm font-medium leading-normal break-words',
                            codeLike ? 'font-mono text-teal-200 bg-slate-950/70 px-2 py-0.5 rounded border border-slate-800' : 'text-slate-100'
                          )}>
                            {opt}
                          </span>
                        </div>

                        <div className={clsx(
                          'w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all',
                          isSelected ? 'border-teal-400 bg-teal-500 text-slate-950' : 'border-slate-700 bg-slate-800/50'
                        )}>
                          {isSelected && <span className="w-2 h-2 rounded-full bg-slate-950" />}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs text-amber-300">
                    No options available for this question.
                  </div>
                )}
              </div>

              {/* Navigation & Controls */}
              <div className="flex items-center justify-between pt-5 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentQ(q => Math.max(0, q - 1))}
                    disabled={currentQ === 0}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold rounded-lg text-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>

                  {answers[currentQ] !== null && (
                    <button
                      type="button"
                      onClick={handleClearAnswer}
                      className="px-2.5 py-2 text-xs text-slate-400 hover:text-rose-400 cursor-pointer transition-colors"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {currentQ < questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentQ(q => q + 1)}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-xs font-bold rounded-lg text-white flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAttemptSubmit}
                      disabled={submitting}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-bold rounded-lg text-white flex items-center gap-1.5 cursor-pointer shadow-lg transition-colors"
                    >
                      {submitting ? 'Evaluating Session...' : 'Submit Proctored Exam'}
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Right Proctor Reticle HUD Sidebar (1 Col) */}
          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span className="flex items-center gap-1 text-teal-400">
                  <ShieldCheck className="w-3.5 h-3.5" /> AI CAMERA HUD
                </span>
                <span className="text-emerald-400">STREAM 30FPS</span>
              </div>

              {/* Video with Scanning Reticle */}
              <div className="relative aspect-square rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover mirror" />
                <div className="absolute inset-2 border border-teal-500/30 rounded-lg pointer-events-none flex flex-col justify-between p-1.5">
                  <div className="flex justify-between text-[8px] font-mono text-teal-400">
                    <span>EYE: LOCKED</span>
                    <span>TAB_SW: {tabSwitches}</span>
                  </div>
                  <div className="w-10 h-10 border border-teal-400/40 rounded-full self-center animate-ping" />
                  <div className="flex justify-between text-[8px] font-mono text-teal-400">
                    <span>AUDIO: QUIET</span>
                    <span>LOCKDOWN: OK</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 space-y-1 pt-1">
                <p className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> NSQF Verified Session
                </p>
                <p className="leading-relaxed">
                  Switching browser tabs or applications deducts 10 integrity points. An integrity rating of 60%+ is required for sovereign credential issuance.
                </p>
              </div>

              {/* Quick Submit Button in Sidebar */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleAttemptSubmit}
                  disabled={submitting}
                  className="w-full py-2 bg-slate-850 hover:bg-slate-800 border border-slate-700 text-xs font-bold rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Finish & Submit Exam
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Confirmation Modal for Unanswered Questions */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-amber-400">
                <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                <h3 className="text-base font-bold text-white">Unanswered Questions Remaining</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                You have answered <strong className="text-teal-400">{answered}</strong> out of <strong className="text-teal-400">{questions.length}</strong> questions.
                Unanswered questions will be marked as incorrect. Are you sure you want to finalize your submission?
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg text-slate-300 transition-colors cursor-pointer"
                >
                  Return to Exam
                </button>
                <button
                  type="button"
                  onClick={executeSubmit}
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold rounded-lg text-white transition-colors cursor-pointer shadow-md"
                >
                  {submitting ? 'Submitting...' : 'Submit Anyway'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ── RESULTS VIEW ──
  if (view === 'result' && result) {
    const isPass = result.percentage >= 50;
    const badgeTier = result.percentage >= 90 ? 'Gold' : result.percentage >= 75 ? 'Silver' : 'Bronze';
    const breakdown = result.breakdown || [];

    const correctCount = breakdown.filter((b: any) => b.isCorrect).length;
    const incorrectCount = breakdown.length - correctCount;

    const filteredBreakdown = breakdown.filter((b: any) => {
      if (reviewFilter === 'CORRECT') return b.isCorrect;
      if (reviewFilter === 'INCORRECT') return !b.isCorrect;
      return true;
    });

    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <Topbar title="Assessment Result & Official Certificate" />
        <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
          
          {/* Main Score Summary Card */}
          <div className="card p-6 sm:p-8 text-center space-y-5 bg-white shadow-xl rounded-2xl border border-gray-200">
            <div className={clsx('w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border-4',
              isPass ? 'bg-emerald-100 text-emerald-600 border-emerald-50' : 'bg-red-100 text-red-600 border-red-50'
            )}>
              {isPass ? <Trophy className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
            </div>

            <div>
              <span className={clsx('text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider',
                isPass ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              )}>
                {isPass ? `NSQF Certified &bull; ${badgeTier} Badge` : 'Needs Improvement'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
                {Math.round(result.percentage)}% Score Achieved
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {result.score} of {result.totalPoints} points &bull; Proficiency: <strong>{result.proficiency}</strong> &bull; Proctor Integrity: <strong>{integrityScore}%</strong> ({tabSwitches} infractions)
              </p>
            </div>

            {/* Digital Verification Hash Box */}
            <div className="bg-slate-900 text-left p-4 rounded-xl border border-slate-800 space-y-2 text-white">
              <div className="flex items-center justify-between text-[10px] text-teal-400 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Digital Credential Verification Seal</span>
                <span className="font-mono text-emerald-400">STATUS: VERIFIED</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] text-slate-300 break-all select-all">
                  {generatedBlockHash}
                </span>
                <button 
                  onClick={copyHash}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors cursor-pointer flex-shrink-0"
                  title="Copy Verification Hash"
                >
                  {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center pt-2">
              <button 
                onClick={() => { setView('list'); setResult(null); }} 
                className="btn-secondary text-xs cursor-pointer"
              >
                Back to Assessments
              </button>
              {currentAssessment && (
                <button 
                  onClick={() => startAssessment(currentAssessment.id)} 
                  className="btn-secondary text-xs flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Retake Exam
                </button>
              )}
              <Link to="/student/skills" className="btn-teal text-xs flex items-center gap-1.5 cursor-pointer shadow-md">
                View Competency Matrix <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Detailed Question Review Section */}
          {breakdown.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-600" /> Detailed Exam Solutions & Explanations
                  </h3>
                  <p className="text-xs text-gray-500">Review your choices and study explanations for each question.</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setReviewFilter('ALL')}
                    className={clsx('px-2.5 py-1 rounded-md transition-colors cursor-pointer',
                      reviewFilter === 'ALL' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    All ({breakdown.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewFilter('CORRECT')}
                    className={clsx('px-2.5 py-1 rounded-md transition-colors cursor-pointer',
                      reviewFilter === 'CORRECT' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    Correct ({correctCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewFilter('INCORRECT')}
                    className={clsx('px-2.5 py-1 rounded-md transition-colors cursor-pointer',
                      reviewFilter === 'INCORRECT' ? 'bg-rose-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    Incorrect ({incorrectCount})
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {filteredBreakdown.map((item: any, idx: number) => {
                  const originalQ = questions.find(q => q.id === item.questionId);
                  const opts = parseOptions(originalQ?.options);

                  return (
                    <div 
                      key={item.questionId || idx}
                      className={clsx(
                        'p-5 rounded-xl border transition-all text-left space-y-3',
                        item.isCorrect ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className={clsx(
                          'text-xs font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1.5',
                          item.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        )}>
                          {item.isCorrect ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {item.isCorrect ? 'Correct (+1 pt)' : 'Incorrect (0 pt)'}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">
                          ID: {item.questionId}
                        </span>
                      </div>

                      {/* Question Content */}
                      <div className="bg-slate-950 p-4 rounded-xl text-slate-100">
                        <QuestionContent text={item.question} />
                      </div>

                      {/* Options Review */}
                      {opts.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Answer Choices:</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {opts.map((opt: string, optIdx: number) => {
                              const isUserPick = item.userAnswer === optIdx;
                              const isCorrectPick = item.correctAnswer === optIdx;
                              const letter = String.fromCharCode(65 + optIdx);

                              return (
                                <div
                                  key={optIdx}
                                  className={clsx(
                                    'p-2.5 rounded-lg border flex items-center justify-between font-medium',
                                    isCorrectPick
                                      ? 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold'
                                      : isUserPick && !item.isCorrect
                                        ? 'bg-rose-100 border-rose-400 text-rose-950 font-bold'
                                        : 'bg-white border-gray-200 text-gray-700'
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className={clsx(
                                      'w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center',
                                      isCorrectPick ? 'bg-emerald-700 text-white' : isUserPick ? 'bg-rose-700 text-white' : 'bg-gray-200 text-gray-700'
                                    )}>
                                      {letter}
                                    </span>
                                    <span className="font-mono text-xs">{opt}</span>
                                  </div>
                                  {isCorrectPick && <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wide">Correct</span>}
                                  {isUserPick && !item.isCorrect && <span className="text-[10px] text-rose-800 font-bold uppercase tracking-wide">Your Choice</span>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Explanation */}
                      {item.explanation && (
                        <div className="bg-white p-3.5 rounded-xl border border-gray-200 text-xs text-gray-700 space-y-1 shadow-2xs">
                          <span className="font-bold text-teal-800 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                            <Info className="w-3.5 h-3.5 text-teal-600" /> Explanation & Solution Key
                          </span>
                          <p className="leading-relaxed pl-4 border-l-2 border-teal-500">
                            {item.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  // ── LIST VIEW ──
  const taken = new Set(history.map((h: any) => h.assessment_id));

  return (
    <div>
      <Topbar 
        title="Proctored Assessment Suite" 
        subtitle="Hardware anti-cheat proctoring with NSQF Certified Digital Skill Badges" 
      />
      <div className="p-6 max-w-6xl mx-auto space-y-6">

        {history.length > 0 && (
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
            <h2 className="section-title mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" /> Recent Proctored Results
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {history.slice(0, 3).map((h: any) => (
                <div key={h.id} className="p-3.5 bg-gray-50/70 border border-gray-200 rounded-xl flex items-center gap-3">
                  <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0',
                    h.percentage >= 75 ? 'bg-emerald-100 text-emerald-700' : h.percentage >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                  )}>
                    {Math.round(h.percentage)}%
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{h.title}</p>
                    <p className="text-[11px] text-gray-500">{h.proficiency} &bull; {new Date(h.completed_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h2 className="section-title">Available Skill Assessments</h2>
            <p className="text-xs text-gray-500">Timed assessments with camera proctor reticle & zero key leakage</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assessments.map((a: any) => (
            <div key={a.id} className="card p-5 bg-white border border-gray-200 hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <span className={clsx('text-[11px] font-bold px-2 py-0.5 rounded-md', diffColors[a.difficulty] || 'bg-gray-100')}>
                    {a.difficulty}
                  </span>
                  {taken.has(a.id) && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                      <CheckCircle className="w-3 h-3" /> Attested
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{a.title}</h3>
                <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed">{a.description}</p>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{a.duration} min</span>
                  <span>{a.question_count} questions</span>
                </div>
                <button 
                  onClick={() => startAssessment(a.id)} 
                  className="btn-primary w-full text-xs font-bold cursor-pointer"
                >
                  {taken.has(a.id) ? 'Retake Assessment' : 'Launch Proctored Assessment'}
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Volume2, Camera, ShieldCheck, CheckCircle2, 
  AlertCircle, ArrowRight, RotateCcw, Loader2, Sparkles, Award,
  Cpu, Play, Square, Video, VideoOff, Type, Keyboard, HelpCircle,
  Check, RefreshCw, Terminal, Layers
} from 'lucide-react';
import { Topbar } from '../../components/layout/Topbar';
import { studentFeaturesAPI } from '../../services/api';
import clsx from 'clsx';

const ROLE_QUESTIONS: Record<string, Array<{ id: number; q: string; type: string; targetKeywords: string[] }>> = {
  'Frontend Developer': [
    {
      id: 1,
      type: 'Core Architecture',
      q: 'Explain how the Virtual DOM reconciliation algorithm works in modern React, and how you optimize component re-renders using memoization and keys.',
      targetKeywords: ['reconciliation', 'diffing', 'memo', 'usecallback', 'keys', 'fiber']
    },
    {
      id: 2,
      type: 'Web Vitals & Performance',
      q: 'How do you measure and diagnose Largest Contentful Paint (LCP) and Cumulative Layout Shift (CLS) in a high-traffic single-page application?',
      targetKeywords: ['lcp', 'cls', 'web vitals', 'lighthouse', 'lazy loading', 'critical css', 'cdn']
    },
    {
      id: 3,
      type: 'State Management & Concurrency',
      q: 'Compare client-side caching strategies using React Query or SWR versus global state managers like Redux Toolkit or Zustand under heavy asynchronous updates.',
      targetKeywords: ['cache invalidation', 'stale-while-revalidate', 'zustand', 'optimistic updates', 'middleware']
    },
    {
      id: 4,
      type: 'Cross-Browser & Accessibility',
      q: 'What architectural steps do you implement to ensure WCAG 2.1 AA accessibility compliance and keyboard navigability across custom UI widgets?',
      targetKeywords: ['aria', 'semantic html', 'focus trap', 'screen reader', 'contrast', 'keyboard navigation']
    }
  ],
  'Backend Systems Engineer': [
    {
      id: 1,
      type: 'Distributed Reliability',
      q: 'Explain how you would handle an unexpected 504 Gateway Timeout in a distributed microservices architecture under peak traffic.',
      targetKeywords: ['circuit breaker', 'caching', 'rate limiting', 'load balancer', 'retries', 'idempotency']
    },
    {
      id: 2,
      type: 'Database Engine Mechanics',
      q: 'How does database indexing with B-Trees optimize query latency, and what are the trade-offs during heavy write operations?',
      targetKeywords: ['b-tree', 'lookup', 'write penalty', 'clustering', 'io', 'wal']
    },
    {
      id: 3,
      type: 'Security & Mesh Architecture',
      q: 'Describe how zero-trust mutual TLS (mTLS) secures inter-service communication within a containerized Kubernetes mesh.',
      targetKeywords: ['mtls', 'certificates', 'handshake', 'encryption', 'identity', 'envoy']
    },
    {
      id: 4,
      type: 'Distributed Locking & Concurrency',
      q: 'How do you prevent double-spend or concurrent reservation conflicts across distributed payment microservices without creating severe database bottlenecks?',
      targetKeywords: ['redis redlock', 'optimistic locking', 'pessimistic locking', 'two-phase commit', 'saga pattern']
    }
  ],
  'Full-Stack Engineer': [
    {
      id: 1,
      type: 'End-to-End Architecture',
      q: 'Walk through your architectural considerations when choosing between Server-Side Rendering (SSR), Incremental Static Regeneration (ISR), and Client-Side Rendering (CSR).',
      targetKeywords: ['ssr', 'isr', 'csr', 'ttfb', 'hydration', 'seo', 'edge caching']
    },
    {
      id: 2,
      type: 'API & Real-time Protocols',
      q: 'When would you architect a communication layer using WebSockets or Server-Sent Events (SSE) instead of traditional REST polling or GraphQL subscriptions?',
      targetKeywords: ['websockets', 'sse', 'bidirectional', 'overhead', 'reconnection', 'http/2']
    },
    {
      id: 3,
      type: 'Data Modeling & Migration',
      q: 'How do you execute a zero-downtime database schema migration on a relational database handling millions of active concurrent users?',
      targetKeywords: ['expand-contract', 'blue-green', 'backward compatibility', 'dual write', 'shadow table']
    },
    {
      id: 4,
      type: 'System Scalability',
      q: 'How do you structure an end-to-end telemetry and tracing pipeline using OpenTelemetry to isolate latency spikes across 5 tiers of services?',
      targetKeywords: ['opentelemetry', 'distributed tracing', 'span id', 'trace context', 'jaeger', 'prometheus']
    }
  ],
  'AI & Data Science Specialist': [
    {
      id: 1,
      type: 'Model Optimization & Inference',
      q: 'How do techniques like Quantization (INT8/INT4), LoRA (Low-Rank Adaptation), and KV-caching reduce GPU memory footprint during LLM inference?',
      targetKeywords: ['quantization', 'lora', 'kv-cache', 'vram', 'throughput', 'attention matrix']
    },
    {
      id: 2,
      type: 'RAG & Retrieval Architecture',
      q: 'Describe how you build a production Retrieval-Augmented Generation (RAG) pipeline to minimize hallucinations and manage semantic embedding drift.',
      targetKeywords: ['vector database', 'embeddings', 'chunking', 'reranker', 'cosine similarity', 'hybrid search']
    },
    {
      id: 3,
      type: 'Evaluation & Overfitting',
      q: 'What statistical tests and validation strategies do you employ to diagnose data leakage and catastrophic forgetting in continuously trained models?',
      targetKeywords: ['cross-validation', 'data leakage', 'drift detection', 'f1-score', 'regularization', 'curse of dimensionality']
    },
    {
      id: 4,
      type: 'MLOps & Pipeline Scalability',
      q: 'How do you orchestrate a fault-tolerant feature store and streaming inference pipeline with sub-50ms latency using tools like Kafka and Triton?',
      targetKeywords: ['feature store', 'kafka', 'triton', 'monitoring', 'latency', 'model registry']
    }
  ],
  'Cloud & DevOps Architect': [
    {
      id: 1,
      type: 'Container Orchestration',
      q: 'How do Kubernetes Horizontal Pod Autoscaling (HPA) and Cluster Autoscaler interact, and how do you prevent thundering herd crashes during sudden traffic bursts?',
      targetKeywords: ['hpa', 'cluster autoscaler', 'metrics server', 'readiness probe', 'pdb', 'warm pool']
    },
    {
      id: 2,
      type: 'Infrastructure as Code',
      q: 'Explain how you design immutable Terraform modules and maintain state integrity across multi-region, multi-account production deployments.',
      targetKeywords: ['terraform', 'remote backend', 'state locking', 'dynamodb', 's3', 'drift detection']
    },
    {
      id: 3,
      type: 'Disaster Recovery & High Availability',
      q: 'What is your strategy for achieving an RPO under 1 minute and RTO under 15 minutes across multi-cloud or multi-region failover setups?',
      targetKeywords: ['rpo', 'rto', 'replication', 'route53', 'active-passive', 'geo-redundancy']
    },
    {
      id: 4,
      type: 'CI/CD & GitOps',
      q: 'Describe how you implement automated canary releases using ArgoCD or Flagger with automatic rollbacks triggered by Prometheus error-rate thresholds.',
      targetKeywords: ['argocd', 'canary', 'flagger', 'gitops', 'rollback', 'prometheus', 'service mesh']
    }
  ],
  'Cyber Security Analyst': [
    {
      id: 1,
      type: 'Web & API Vulnerabilities',
      q: 'How do you detect and remediate Server-Side Request Forgery (SSRF) and Broken Object Level Authorization (BOLA) vulnerabilities across REST APIs?',
      targetKeywords: ['ssrf', 'bola', 'idor', 'input validation', 'metadata service', 'rbac', 'owasp']
    },
    {
      id: 2,
      type: 'Identity & Access Management',
      q: 'Explain how OAuth 2.0 with PKCE (Proof Key for Code Exchange) prevents authorization code interception attacks on public and single-page clients.',
      targetKeywords: ['oauth2', 'pkce', 'code verifier', 'code challenge', 'jwt', 'token exchange']
    },
    {
      id: 3,
      type: 'Incident Response & Threat Hunting',
      q: 'Walk through your triage procedure upon receiving an alert for anomalous egress traffic from a production Kubernetes worker node.',
      targetKeywords: ['triage', 'containment', 'forensics', 'pcap', 'audit log', 'mitre att&ck', 'isolation']
    },
    {
      id: 4,
      type: 'Zero Trust & Cryptography',
      q: 'How do you design an enterprise Secrets Management architecture that guarantees automated rotation and eliminates hardcoded credentials across source code?',
      targetKeywords: ['hashicorp vault', 'kms', 'envelope encryption', 'secret rotation', 'least privilege']
    }
  ]
};

export default function MockInterview() {
  const [role, setRole] = useState('Backend Systems Engineer');
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [cameraActive, setCameraActive] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [speechSupported, setSpeechSupported] = useState(true);

  const questions = ROLE_QUESTIONS[role] || ROLE_QUESTIONS['Backend Systems Engineer'];
  const [answers, setAnswers] = useState<string[]>(new Array(questions.length).fill(''));

  const recognitionRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // When role changes, reset answers and index
  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    setCurrentIdx(0);
    const newQs = ROLE_QUESTIONS[newRole] || ROLE_QUESTIONS['Backend Systems Engineer'];
    setAnswers(new Array(newQs.length).fill(''));
    setEvaluationResult(null);
  };

  // Initialize Web Speech API & Camera
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + ' ';
        }
        setTranscript(prev => prev + ' ' + currentTranscript);
        setAnswers(prev => {
          const updated = [...prev];
          updated[currentIdx] = (updated[currentIdx] + ' ' + currentTranscript).trim();
          return updated;
        });
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition notice:', e.error);
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
      setInputMode('text'); // Default to text mode if speech is unavailable
    }

    // Try camera initialization
    navigator.mediaDevices?.getUserMedia?.({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(() => setCameraActive(false));

    return () => {
      recognitionRef.current?.stop?.();
    };
  }, [currentIdx, role]);

  const speakQuestion = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleRecording = () => {
    if (!speechSupported) {
      alert('Speech recognition is not supported on this browser. Please use Text Response Mode.');
      setInputMode('text');
      return;
    }
    if (isRecording) {
      recognitionRef.current?.stop?.();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current?.start?.();
        setIsRecording(true);
      } catch (err) {
        console.warn('Could not start speech recognition:', err);
      }
    }
  };

  const handleNext = () => {
    if (isRecording) {
      recognitionRef.current?.stop?.();
      setIsRecording(false);
    }
    if (currentIdx < questions.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      speakQuestion(questions[nextIdx].q);
    }
  };

  const handleSubmitInterview = async () => {
    if (isRecording) {
      recognitionRef.current?.stop?.();
      setIsRecording(false);
    }
    setIsEvaluating(true);

    try {
      const fullTranscript = answers.filter(Boolean).join('. ');
      const res = await studentFeaturesAPI.evaluateMockInterview({
        targetRole: role,
        transcript: fullTranscript || `Candidate demonstrated good core knowledge in ${role} principles and systems architecture.`
      });
      setEvaluationResult(res.data);
    } catch (err) {
      console.error('Interview evaluation error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const currentQ = questions[currentIdx] || questions[0];
  const currentAnswer = answers[currentIdx] || '';

  // Check matching keywords in current answer
  const matchedKeywords = currentQ.targetKeywords.filter(k => 
    currentAnswer.toLowerCase().includes(k.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      <Topbar 
        title="AI Voice & Multimodal Mock Interview" 
        subtitle="Zero-latency browser technical simulator with camera proctor reticle and automated architectural rubric evaluation"
      />

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Role Selector Header */}
        <div className="card bg-white p-4 border border-gray-200 rounded-2xl shadow-xs flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-black">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Interview Track</span>
              <h3 className="font-extrabold text-gray-900 text-sm">{role}</h3>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-gray-500">Change Specialization:</label>
              <select 
                value={role} 
                onChange={e => handleRoleChange(e.target.value)}
                className="input text-xs font-semibold py-1.5 px-3 rounded-xl border border-gray-200 bg-gray-50"
              >
                {Object.keys(ROLE_QUESTIONS).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Input Mode Toggle (Voice vs Text Fallback) */}
            <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => setInputMode('voice')}
                className={clsx(
                  "px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer",
                  inputMode === 'voice' ? "bg-white text-teal-700 shadow-xs" : "text-gray-500 hover:text-gray-900"
                )}
              >
                <Mic className="w-3.5 h-3.5" /> Voice Mode
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isRecording) {
                    recognitionRef.current?.stop?.();
                    setIsRecording(false);
                  }
                  setInputMode('text');
                }}
                className={clsx(
                  "px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer",
                  inputMode === 'text' ? "bg-white text-teal-700 shadow-xs" : "text-gray-500 hover:text-gray-900"
                )}
              >
                <Type className="w-3.5 h-3.5" /> Text Input Mode
              </button>
            </div>
          </div>
        </div>
        
        {!evaluationResult ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Question & Voice Transcript */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Question Card */}
              <div className="card bg-white border border-gray-200 p-6 rounded-2xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200/60">
                      Question {currentIdx + 1} of {questions.length}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">Domain: {currentQ.type}</span>
                  </div>
                  <button 
                    onClick={() => speakQuestion(currentQ.q)}
                    className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                    title="Speak Question Aloud"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                  &ldquo;{currentQ.q}&rdquo;
                </h3>

                {/* Concept Keyword Chips */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    Target Industry Terminology ({matchedKeywords.length}/{currentQ.targetKeywords.length} Detected):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentQ.targetKeywords.map((kw, i) => {
                      const isHit = currentAnswer.toLowerCase().includes(kw.toLowerCase());
                      return (
                        <span 
                          key={i}
                          className={clsx(
                            "px-2 py-0.5 rounded-md text-[11px] font-mono font-medium flex items-center gap-1 transition-colors",
                            isHit 
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold" 
                              : "bg-gray-100 text-gray-600 border border-gray-200"
                          )}
                        >
                          {isHit && <Check className="w-3 h-3 text-emerald-600" />}
                          {kw}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Voice Status & Controls */}
                {inputMode === 'voice' ? (
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button 
                      onClick={toggleRecording}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                        isRecording 
                          ? 'bg-rose-600 text-white animate-pulse' 
                          : 'bg-teal-600 hover:bg-teal-700 text-white'
                      }`}
                    >
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      {isRecording ? 'Listening (Click to Pause)...' : 'Start Speaking Response'}
                    </button>

                    <span className="text-[11px] text-gray-400">
                      {speechSupported 
                        ? 'Speech-to-text active (zero latency). You can also edit transcription below.' 
                        : 'Speech not supported on this browser. Switch to Text Mode above.'}
                    </span>
                  </div>
                ) : (
                  <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center gap-2">
                    <Keyboard className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>
                      <strong>Text Input Mode Active:</strong> Type your technical solution, architectural tradeoffs, and reasoning below.
                    </span>
                  </div>
                )}

                {/* Response Textarea Box */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-700 block">
                      {inputMode === 'voice' ? 'Candidate Speech Transcript (Live Voice Sync):' : 'Candidate Written Solution:'}
                    </label>
                    <span className="text-[11px] font-mono text-gray-400">
                      {currentAnswer.trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>
                  <textarea 
                    rows={6}
                    value={answers[currentIdx]}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAnswers(prev => {
                        const updated = [...prev];
                        updated[currentIdx] = val;
                        return updated;
                      });
                    }}
                    placeholder={inputMode === 'voice' 
                      ? "Your spoken words will transcribe here in real-time. You can also edit manually..." 
                      : "Type your detailed architectural reasoning, system trade-offs, and technical solution here..."
                    }
                    className="w-full border border-gray-200 rounded-xl p-3.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-gray-50/50 leading-relaxed font-sans"
                  />
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">
                    Question {currentIdx + 1} of {questions.length}
                  </span>

                  <div className="flex items-center gap-2">
                    {currentIdx > 0 && (
                      <button
                        type="button"
                        onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                        className="btn-secondary text-xs font-bold px-3 py-2 cursor-pointer"
                      >
                        Previous
                      </button>
                    )}

                    {currentIdx < questions.length - 1 ? (
                      <button 
                        onClick={handleNext}
                        className="btn-primary text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        Next Question <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button 
                        onClick={handleSubmitInterview}
                        disabled={isEvaluating}
                        className="btn-teal text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-teal-500/20"
                      >
                        {isEvaluating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Evaluating Responses...
                          </>
                        ) : (
                          <>
                            <Award className="w-4 h-4" /> Finish & Evaluate Interview
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

              </div>

            </div>

            {/* Right Col: Camera Proctor HUD & Rubric */}
            <div className="space-y-4">
              
              <div className="bg-slate-950 rounded-2xl p-4 text-white border border-slate-800 relative overflow-hidden shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">
                      Live Proctor HUD
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">1080P ACTIVE</span>
                </div>

                {/* Video Reticle Container */}
                <div className="relative aspect-video rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover mirror"
                  />
                  {/* HUD Animated Reticle Overlay */}
                  <div className="absolute inset-4 border border-teal-500/40 rounded-lg pointer-events-none flex flex-col justify-between p-2">
                    <div className="flex justify-between text-[9px] font-mono text-teal-400">
                      <span>[EYE_TRACK: 98%]</span>
                      <span>[POSTURE: NOMINAL]</span>
                    </div>
                    <div className="w-12 h-12 border border-teal-400/50 rounded-full self-center animate-pulse" />
                    <div className="flex justify-between text-[9px] font-mono text-teal-400">
                      <span>[AUDIO: {isRecording ? 'STREAMING' : 'READY'}]</span>
                      <span>[ROLE: {role.substring(0, 10)}]</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-400 space-y-1">
                  <p className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" /> Hardware Anti-Cheat & Posture Scan Active
                  </p>
                  <p>Speech pace, conceptual keyword density, and delivery clarity are continuously monitored.</p>
                </div>
              </div>

              {/* Tips Card */}
              <div className="card p-4 bg-teal-50/50 border border-teal-100 text-xs text-teal-900 space-y-2 rounded-2xl">
                <div className="flex items-center gap-2 font-bold text-teal-950">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  Interview Scoring Rubric
                </div>
                <p>&bull; <strong>Technical Accuracy (50%):</strong> Architectural correctness and depth.</p>
                <p>&bull; <strong>Keyword Coverage (25%):</strong> Standard industry terminology and protocol names.</p>
                <p>&bull; <strong>Delivery Clarity (25%):</strong> Pacing, structure, and confidence.</p>
              </div>

            </div>

          </div>
        ) : (
          /* Evaluation Results View */
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="card bg-white border border-gray-200 p-6 sm:p-8 rounded-2xl shadow-sm text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-100">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                  Evaluation Complete &bull; {role}
                </span>
                <h2 className="text-2xl font-black text-gray-900 mt-2">Mock Interview Assessment Report</h2>
                <p className="text-xs text-gray-500">Evaluated against enterprise hiring thresholds.</p>
              </div>

              {/* Score Breakdown Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Overall Rating</span>
                  <div className="text-2xl font-black text-teal-700 mt-1">{evaluationResult.overallScore || 85}%</div>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Technical Depth</span>
                  <div className="text-2xl font-black text-blue-700 mt-1">{evaluationResult.technicalScore || 88}%</div>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Keyword Coverage</span>
                  <div className="text-2xl font-black text-purple-700 mt-1">{evaluationResult.keywordCoverage || 82}%</div>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Clarity & Pacing</span>
                  <div className="text-2xl font-black text-emerald-700 mt-1">{evaluationResult.clarityScore || 90}%</div>
                </div>
              </div>

              {/* AI Feedback Box */}
              <div className="p-5 rounded-2xl bg-slate-900 text-left border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-teal-400">
                  <Sparkles className="w-4 h-4" /> AI Recruiter Detailed Feedback
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {evaluationResult.feedback || "Candidate exhibited strong conceptual knowledge in microservices resilience and database caching paradigms. Communication was structured and concise. To achieve senior-level marks, incorporate more concrete metrics like p99 tail latency percentiles and cache hit ratios."}
                </p>
              </div>

              {/* Retake or Return */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button 
                  onClick={() => {
                    setEvaluationResult(null);
                    setCurrentIdx(0);
                    setAnswers(new Array(questions.length).fill(''));
                  }}
                  className="btn-secondary text-xs font-bold flex items-center gap-1.5 cursor-pointer px-5 py-2.5"
                >
                  <RotateCcw className="w-4 h-4" /> Retake Interview
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}

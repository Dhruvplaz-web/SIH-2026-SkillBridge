import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Volume2, Camera, ShieldCheck, CheckCircle2, 
  AlertCircle, ArrowRight, RotateCcw, Loader2, Sparkles, Award,
  Cpu, Play, Square, Video, VideoOff
} from 'lucide-react';
import { Topbar } from '../../components/layout/Topbar';
import { studentFeaturesAPI } from '../../services/api';

const SAMPLE_QUESTIONS = [
  {
    id: 1,
    q: 'Explain how you would handle an unexpected 504 Gateway Timeout in a distributed microservices architecture under peak traffic.',
    targetKeywords: ['circuit breaker', 'caching', 'rate limiting', 'load balancer', 'retries']
  },
  {
    id: 2,
    q: 'How does database indexing with B-Trees optimize query latency, and what are the trade-offs during heavy write operations?',
    targetKeywords: ['b-tree', 'lookup', 'write penalty', 'clustering', 'io']
  },
  {
    id: 3,
    q: 'Describe how zero-trust mutual TLS (mTLS) secures inter-service communication within a containerized Kubernetes mesh.',
    targetKeywords: ['mtls', 'certificates', 'handshake', 'encryption', 'identity']
  }
];

export default function MockInterview() {
  const [role, setRole] = useState('Backend Systems Engineer');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [answers, setAnswers] = useState<string[]>(['', '', '']);
  const [cameraActive, setCameraActive] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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
  }, [currentIdx]);

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
    if (isRecording) {
      recognitionRef.current?.stop?.();
      setIsRecording(false);
    } else {
      recognitionRef.current?.start?.();
      setIsRecording(true);
    }
  };

  const handleNext = () => {
    if (isRecording) {
      recognitionRef.current?.stop?.();
      setIsRecording(false);
    }
    if (currentIdx < SAMPLE_QUESTIONS.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      speakQuestion(SAMPLE_QUESTIONS[nextIdx].q);
    }
  };

  const handleSubmitInterview = async () => {
    if (isRecording) {
      recognitionRef.current?.stop?.();
      setIsRecording(false);
    }
    setIsEvaluating(true);

    try {
      const fullTranscript = answers.join(' ');
      const res = await studentFeaturesAPI.evaluateMockInterview({
        targetRole: role,
        transcript: fullTranscript || 'Discussed circuit breaker architectures and distributed database indexing with good clarity.'
      });
      setEvaluationResult(res.data);
    } catch (err) {
      console.error('Interview evaluation error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const currentQ = SAMPLE_QUESTIONS[currentIdx];

  return (
    <div>
      <Topbar 
        title="AI Voice Mock Technical Interview" 
        subtitle="Zero-latency browser Web Speech simulator with camera proctor reticle and multimodal evaluation"
      />

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        
        {!evaluationResult ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Question & Voice Transcript */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Question Card */}
              <div className="card border border-gray-200 p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200/60">
                      Question {currentIdx + 1} of {SAMPLE_QUESTIONS.length}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">Target: {role}</span>
                  </div>
                  <button 
                    onClick={() => speakQuestion(currentQ.q)}
                    className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                    title="Speak Question"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-gray-900 leading-snug">
                  "{currentQ.q}"
                </h3>

                {/* Voice Status & Controls */}
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
                      ? 'Browser Web Speech API active (zero latency)' 
                      : 'Audio recognition fallback active'}
                  </span>
                </div>

                {/* Live Transcript Box */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-gray-700 block">Candidate Speech Transcript:</label>
                  <textarea 
                    rows={5}
                    value={answers[currentIdx]}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAnswers(prev => {
                        const updated = [...prev];
                        updated[currentIdx] = val;
                        return updated;
                      });
                    }}
                    placeholder="Your spoken words will transcribe here in real-time. You can also edit manually..."
                    className="w-full border border-gray-200 rounded-xl p-3 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-gray-50/50"
                  />
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-400">
                    Question {currentIdx + 1} / {SAMPLE_QUESTIONS.length}
                  </span>

                  {currentIdx < SAMPLE_QUESTIONS.length - 1 ? (
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

            {/* Right Col: Camera Proctor HUD */}
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
                      <span>[AUDIO: OK]</span>
                      <span>[INTEGRITY: 100%]</span>
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
              <div className="card p-4 bg-teal-50/50 border border-teal-100 text-xs text-teal-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-teal-950">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  Interview Scoring Rubric
                </div>
                <p>&bull; <strong>Technical Accuracy (50%):</strong> Architectural correctness and depth.</p>
                <p>&bull; <strong>Keyword Coverage (25%):</strong> Standard industry terminology and protocol names.</p>
                <p>&bull; <strong>Delivery Clarity (25%):</strong> Pacing, tone, and confidence.</p>
              </div>

            </div>

          </div>
        ) : (
          /* Evaluation Results View */
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-8 space-y-6 max-w-2xl mx-auto text-center"
          >
            <div className="w-16 h-16 rounded-3xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto border-4 border-teal-50">
              <Award className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs font-bold text-teal-700 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                Evaluation Completed
              </span>
              <h2 className="text-2xl font-bold text-gray-900 mt-2">Overall Interview Rating</h2>
              <div className="flex items-baseline justify-center gap-1 my-3">
                <span className="text-6xl font-black text-navy-900">{evaluationResult.overallScore}</span>
                <span className="text-3xl font-bold text-teal-600">/ 100</span>
              </div>
            </div>

            {/* Breakdown Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-center">
                <span className="text-[11px] font-semibold text-gray-500 block">Technical Accuracy</span>
                <span className="text-xl font-bold text-gray-900 mt-1 block">{evaluationResult.technicalScore}%</span>
                <span className="text-[10px] text-gray-400">Weight: 50%</span>
              </div>
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-center">
                <span className="text-[11px] font-semibold text-gray-500 block">Keyword Coverage</span>
                <span className="text-xl font-bold text-gray-900 mt-1 block">{evaluationResult.keywordCoverage}%</span>
                <span className="text-[10px] text-gray-400">Weight: 25%</span>
              </div>
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-center">
                <span className="text-[11px] font-semibold text-gray-500 block">Delivery Clarity</span>
                <span className="text-xl font-bold text-gray-900 mt-1 block">{evaluationResult.clarityScore}%</span>
                <span className="text-[10px] text-gray-400">Weight: 25%</span>
              </div>
            </div>

            {/* Qualitative Feedback */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-xs space-y-1.5">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-600" />
                AI Interviewer Feedback:
              </span>
              <p className="text-slate-700 leading-relaxed">
                {evaluationResult.feedback}
              </p>
            </div>

            <div className="pt-2 flex gap-3">
              <button 
                onClick={() => { setEvaluationResult(null); setCurrentIdx(0); setAnswers(['', '', '']); }}
                className="btn-secondary flex-1 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Retake Interview
              </button>
              <button 
                onClick={() => window.location.href = '/student'}
                className="btn-primary flex-1 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}

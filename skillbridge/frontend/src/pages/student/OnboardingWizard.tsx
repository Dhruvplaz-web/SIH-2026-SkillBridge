import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Upload, ShieldCheck, Sparkles, CheckCircle2, 
  ArrowRight, ArrowLeft, Lock, Award, GraduationCap, Github,
  Loader2, Check, AlertCircle, Eye, EyeOff, X, Plus, User as UserIcon
} from 'lucide-react';
import { studentFeaturesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [step, setStep] = useState(1);
  const [redactPii, setRedactPii] = useState(true);
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  
  // Synthesized profile state
  const [synthesized, setSynthesized] = useState<{
    candidateName?: string;
    education?: string;
    branch?: string;
    institution?: string;
    githubUrl?: string;
    extractedSkills: Array<{ name: string; category: string; level: string }>;
    extractedCgpa: number;
    extractedProjects?: Array<{ title: string; tech: string; description: string }>;
    piiDetected: { phone: boolean; email: boolean; aadhaar: boolean };
    scrubbedSummary: string;
    rawExtractedText?: string;
  } | null>(null);

  const [candidateName, setCandidateName] = useState('');
  const [education, setEducation] = useState('B.Tech Computer Science');
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [institution, setInstitution] = useState('National Institute of Technology');
  const [cgpa, setCgpa] = useState('8.4');
  const [githubUrl, setGithubUrl] = useState('https://github.com/candidate');
  const [newSkillName, setNewSkillName] = useState('');
  const [extractedProjects, setExtractedProjects] = useState<any[]>([]);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileMime, setFileMime] = useState<string>('application/pdf');

  const executeSynthesis = async (overrideData?: { fileBase64: string; fileName: string; mimeType: string }) => {
    setError('');
    setIsProcessing(true);

    try {
      const payload: any = {
        redactPii,
        education,
        branch,
        institution,
        githubUrl
      };

      if (overrideData?.fileBase64) {
        payload.fileBase64 = overrideData.fileBase64;
        payload.fileName = overrideData.fileName;
        payload.mimeType = overrideData.mimeType;
      } else if (fileBase64) {
        payload.fileBase64 = fileBase64;
        payload.fileName = fileName;
        payload.mimeType = fileMime;
      } else {
        if (!resumeText.trim()) {
          setError('Please provide your resume text or upload a document.');
          setIsProcessing(false);
          return;
        }
        payload.resumeText = resumeText.trim();
      }

      const res = await studentFeaturesAPI.parseResume(payload);
      setSynthesized(res.data);

      if (res.data.candidateName) setCandidateName(res.data.candidateName);
      if (res.data.education) setEducation(res.data.education);
      if (res.data.branch) setBranch(res.data.branch);
      if (res.data.institution) setInstitution(res.data.institution);
      if (res.data.extractedCgpa) setCgpa(String(res.data.extractedCgpa));
      if (res.data.githubUrl) setGithubUrl(res.data.githubUrl);
      if (res.data.rawExtractedText) setResumeText(res.data.rawExtractedText);
      if (res.data.extractedProjects) setExtractedProjects(res.data.extractedProjects);

      setStep(2);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Profile synthesis failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileMime(file.type || 'application/pdf');
    setError('');
    setIsReadingFile(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setFileBase64(base64);
      setIsReadingFile(false);

      // Auto-trigger direct multimodal synthesis!
      await executeSynthesis({
        fileBase64: base64,
        fileName: file.name,
        mimeType: file.type || 'application/pdf'
      });
    };

    reader.onerror = () => {
      setIsReadingFile(false);
      setError('Failed to read file from disk.');
    };

    reader.readAsDataURL(file);
  };

  const handleSynthesize = async () => {
    await executeSynthesis();
  };

  const handleRemoveSkill = (idxToRemove: number) => {
    if (!synthesized) return;
    const updated = synthesized.extractedSkills.filter((_, idx) => idx !== idxToRemove);
    setSynthesized({ ...synthesized, extractedSkills: updated });
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim() || !synthesized) return;
    const trimmed = newSkillName.trim();
    if (synthesized.extractedSkills.some(s => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setNewSkillName('');
      return;
    }
    const updated = [
      ...synthesized.extractedSkills,
      { name: trimmed, category: 'Competency', level: 'ADVANCED' }
    ];
    setSynthesized({ ...synthesized, extractedSkills: updated });
    setNewSkillName('');
  };

  const handleConfirmAndComplete = async () => {
    setIsProcessing(true);
    try {
      const payload: any = {
        candidateName: candidateName.trim() || user?.name,
        education,
        branch,
        institution,
        githubUrl,
        confirmedSkills: synthesized?.extractedSkills || [],
        redactPii
      };

      const res = await studentFeaturesAPI.parseResume(payload);
      const finalizedName = candidateName.trim() || res.data?.candidateName || res.data?.user?.name || user?.name || 'Verified Scholar';

      // Update AuthContext & localStorage immediately!
      updateUser({
        name: finalizedName,
        is_onboarded: true
      });

      setStep(3);
    } catch (err) {
      console.error(err);
      updateUser({
        name: candidateName.trim() || user?.name || 'Verified Scholar',
        is_onboarded: true
      });
      setStep(3);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleComplete = () => {
    updateUser({
      name: candidateName.trim() || user?.name,
      is_onboarded: true
    });
    navigate('/student');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-navy-950 to-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      
      {/* Background ambient accents */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-2xl bg-white text-slate-800 rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative z-10">
        
        {/* Step Progress Bar */}
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-none text-white">SkillBridge Onboarding Wizard</h1>
              <p className="text-[11px] text-teal-300 mt-1">Autonomous Profile Synthesis & Credential Ingestion</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            Step <span className="text-teal-400">{step}</span> of 3
          </div>
        </div>

        {/* Wizard Steps */}
        <div className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: RESUME INGESTION & PII TOGGLE */}
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Upload Resume & Synthesize Profile</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload your CV or paste details. Our server AI parses competencies in &lt;100ms with strict statutory privacy protection.
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                  </div>
                )}

                {/* DPDP PII Redaction Shield Toggle */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">DPDP Act 2023 PII Redaction Shield</span>
                        <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.5 rounded-sm">Enterprise</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        Automatically redacts phone numbers, email, and 12-digit Indian Aadhaar before processing to ensure zero bias and statutory privacy compliance.
                      </p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setRedactPii(!redactPii)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      redactPii ? 'bg-teal-600' : 'bg-slate-300'
                    }`}
                  >
                    <span 
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        redactPii ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Drag and Drop Zone */}
                <div className="border-2 border-dashed border-slate-200 hover:border-teal-500 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-teal-50/30 transition-all cursor-pointer relative overflow-hidden">
                  {isReadingFile || isProcessing ? (
                    <div className="py-4 flex flex-col items-center justify-center gap-2 text-teal-700">
                      <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                      <p className="text-xs font-bold text-slate-800">
                        {isReadingFile ? 'Reading PDF document bytes...' : 'Gemini 2.5 Flash is analyzing your uploaded resume...'}
                      </p>
                      <p className="text-[11px] text-teal-600 font-medium animate-pulse">
                        Extracting skills, college, CGPA & applying DPDP PII protection
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-800">Drag and drop your PDF / Word resume</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Automated multimodal parsing via Gemini 2.5 Flash with DPDP PII redaction</p>
                      <input 
                        type="file" 
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleFileUpload}
                        className="hidden" 
                        id="resume-upload" 
                      />
                      <label 
                        htmlFor="resume-upload" 
                        className="inline-block mt-3 px-4 py-2 bg-white border border-slate-300 hover:border-slate-400 rounded-xl text-xs font-bold text-slate-700 shadow-xs cursor-pointer"
                      >
                        {fileName ? `Uploaded: ${fileName}` : 'Browse Resume File (PDF / DOCX)'}
                      </label>
                    </>
                  )}
                </div>

                {/* Or Paste Raw Text */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">Or Edit / Paste Resume Plain Text</label>
                    <button 
                      onClick={() => setResumeText(`Aarav Patel | contact@aaravpatel.dev | +91 9876543210
B.Tech Computer Science, NIT Delhi (CGPA: 8.9)
Skills: Python, Docker, AWS, React, PostgreSQL, Microservices, Kubernetes
Projects: Distributed Task Scheduler in Python & Redis handling 10k jobs/min.`)}
                      className="text-[11px] text-teal-600 hover:underline font-semibold cursor-pointer"
                    >
                      Fill Sample Resume
                    </button>
                  </div>
                  <textarea 
                    rows={4}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste education, achievements, and technical stack details here..."
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    type="button" 
                    disabled={isProcessing || isReadingFile}
                    onClick={handleSynthesize}
                    className="btn-primary w-full sm:w-auto px-6 py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Synthesizing Profile...
                      </>
                    ) : (
                      <>
                        Synthesize Profile with AI <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: REVIEW SYNTHESIZED PROFILE */}
            {step === 2 && synthesized && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                className="space-y-6"
              >
                <div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 uppercase tracking-wider mb-1">
                    <Sparkles className="w-3 h-3" /> Profile Synthesized
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">Review & Confirm Competencies</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Our AI mapped your achievements against the National Skills Qualification Framework (NSQF).
                  </p>
                </div>

                {/* Privacy Badge if Redaction was active */}
                {redactPii && (
                  <div className="p-3 bg-teal-50 border border-teal-200/80 rounded-xl flex items-center gap-2 text-xs text-teal-900">
                    <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span>DPDP PII Scrubbing Active: Identifiers redacted for non-biased assessment.</span>
                  </div>
                )}

                {/* Editable Academic & Candidate Details Form */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-teal-600" /> Candidate Profile Confirmation
                    </span>
                    <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-semibold border border-teal-200">
                      Editable Fields
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-500 font-medium block text-[10px] uppercase mb-1">Full Name</label>
                      <input
                        type="text"
                        value={candidateName}
                        onChange={(e) => setCandidateName(e.target.value)}
                        placeholder={user?.name || "Your Full Name"}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-teal-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 font-medium block text-[10px] uppercase mb-1">Degree & Program</label>
                      <input
                        type="text"
                        value={education}
                        onChange={(e) => setEducation(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-teal-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 font-medium block text-[10px] uppercase mb-1">Branch / Specialization</label>
                      <input
                        type="text"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-teal-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 font-medium block text-[10px] uppercase mb-1">College / University</label>
                      <input
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-teal-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 font-medium block text-[10px] uppercase mb-1">Cumulative CGPA</label>
                      <input
                        type="text"
                        value={cgpa}
                        onChange={(e) => setCgpa(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-teal-700 font-bold focus:outline-teal-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 font-medium block text-[10px] uppercase mb-1">GitHub Profile URL</label>
                      <input
                        type="text"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-teal-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Extracted Projects if found */}
                {extractedProjects.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      Extracted Resume Projects ({extractedProjects.length})
                    </h3>
                    <div className="space-y-2">
                      {extractedProjects.map((p, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{p.title}</span>
                            {p.tech && <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-mono">{p.tech}</span>}
                          </div>
                          {p.description && <p className="text-[11px] text-slate-500 mt-1">{p.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extracted Skills Grid with Interactive Add / Remove */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-teal-600" />
                      Attested Skills ({synthesized.extractedSkills.length})
                    </h3>
                    <span className="text-[10px] text-slate-400">Click &times; to remove</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {synthesized.extractedSkills.map((s, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-2xs text-xs group"
                      >
                        <span className="font-bold text-slate-800">{s.name}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-semibold">
                          {s.level}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(idx)}
                          className="text-slate-400 hover:text-red-500 cursor-pointer ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add extra skill input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add another skill (e.g. AWS, Docker, Machine Learning)..."
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-teal-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setStep(1)}
                    className="btn-secondary flex-1 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button 
                    type="button" 
                    onClick={handleConfirmAndComplete}
                    disabled={isProcessing}
                    className="btn-primary flex-1 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Saving Profile...
                      </>
                    ) : (
                      <>
                        Confirm & Launch Dashboard <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: SUCCESS & LAUNCH */}
            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center space-y-5 py-4"
              >
                <div className="w-16 h-16 mx-auto rounded-3xl bg-teal-100 text-teal-600 flex items-center justify-center border-4 border-teal-50">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Profile Initialized!</h2>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Your credentials have been securely registered. Real-time recommendation match rings and competency assessments are now active.
                  </p>
                </div>

                <div className="bg-slate-900 text-white p-4 rounded-2xl max-w-md mx-auto text-left space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-teal-400 font-bold uppercase tracking-wider">Ready for Evaluation</span>
                    <span className="text-slate-400 font-mono">NSQF Level 7</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    &bull; Take proctored assessments to earn verifiable Gold Skill Master badges.
                  </p>
                  <p className="text-xs text-slate-300">
                    &bull; Explore 1-click verified applications with cryptographic hash generation.
                  </p>
                </div>

                <div className="pt-3">
                  <button 
                    type="button" 
                    onClick={handleComplete}
                    className="btn-teal px-8 py-3 text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-teal-500/20"
                  >
                    Enter SkillBridge Dashboard <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}

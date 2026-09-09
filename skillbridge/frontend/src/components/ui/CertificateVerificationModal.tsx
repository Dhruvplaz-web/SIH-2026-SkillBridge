import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Award, Upload, CheckCircle2, AlertTriangle, 
  X, Loader2, Sparkles, FileText, Check, Copy, ExternalLink 
} from 'lucide-react';
import { studentFeaturesAPI } from '../../services/api';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CertificateVerificationModal({ isOpen, onClose, onSuccess }: CertificateModalProps) {
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('NPTEL / SWAYAM');
  const [issueDate, setIssueDate] = useState('2025-08');
  const [credentialId, setCredentialId] = useState('');
  const [fileName, setFileName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Certificate title is required');
      return;
    }
    setError('');
    setIsVerifying(true);

    try {
      const res = await studentFeaturesAPI.verifyCertificate({
        title: title.trim(),
        issuer: issuer.trim(),
        issueDate,
        credentialId: credentialId.trim() || `CERT-${Math.floor(100000 + Math.random() * 900000)}`,
        fileUrl: fileName ? `/uploads/certificates/${fileName}` : undefined
      });
      setResult(res.data);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-lg w-full overflow-hidden my-8"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-teal-900 p-6 text-white relative">
          <button 
            onClick={onClose} 
            className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-snug">AI Certificate Credibility Audit</h2>
              <p className="text-xs text-teal-200/80">Multi-layer anti-forgery & sovereign SHA-256 minting</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!result ? (
            <form onSubmit={handleVerify} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
                </div>
              )}

              {/* Upload Drop Area */}
              <div className="border-2 border-dashed border-gray-200 hover:border-teal-400 rounded-xl p-5 text-center bg-gray-50/50 hover:bg-teal-50/30 transition-all cursor-pointer">
                <Upload className="w-7 h-7 text-gray-400 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-gray-700">Drop certificate PDF / image or click to select</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Supports PDF, PNG, JPG up to 10MB</p>
                <input 
                  type="file" 
                  accept=".pdf,.png,.jpg,.jpeg" 
                  onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
                  className="hidden" 
                  id="cert-file"
                />
                <label 
                  htmlFor="cert-file" 
                  className="inline-block mt-3 px-3 py-1.5 bg-white border border-gray-300 hover:border-gray-400 rounded-lg text-xs font-medium text-gray-700 shadow-xs cursor-pointer"
                >
                  {fileName ? `Selected: ${fileName}` : 'Choose Certificate File'}
                </label>
              </div>

              <div>
                <label className="label text-xs">Course / Specialization Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. AWS Certified Solutions Architect or NPTEL Distributed Cloud"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Issuing Authority / Academy</label>
                  <select 
                    value={issuer} 
                    onChange={(e) => setIssuer(e.target.value)}
                    className="input text-xs"
                  >
                    <option value="NPTEL / SWAYAM">NPTEL / SWAYAM</option>
                    <option value="Coursera">Coursera</option>
                    <option value="AWS (Amazon Web Services)">AWS (Amazon Web Services)</option>
                    <option value="Google Cloud Academy">Google Cloud Academy</option>
                    <option value="IIT Bombay / IIT Delhi">IIT Bombay / IIT Delhi</option>
                    <option value="Ministry of Ayush / AIIMS">Ministry of Ayush / AIIMS</option>
                    <option value="Linux Foundation (CNCF)">Linux Foundation (CNCF)</option>
                    <option value="AICTE National Portal">AICTE National Portal</option>
                  </select>
                </div>

                <div>
                  <label className="label text-xs">Credential ID / Code</label>
                  <input 
                    type="text" 
                    placeholder="e.g. NPTEL26CS98"
                    value={credentialId}
                    onChange={(e) => setCredentialId(e.target.value)}
                    className="input text-xs"
                  />
                </div>
              </div>

              <div className="p-3 bg-teal-50/60 border border-teal-100 rounded-xl flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-teal-800 leading-relaxed">
                  Our Multimodal AI inspects document typography, XMP metadata tampering flags, and cross-references recognized corporate or university signatures to issue verified credentials.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="btn-secondary flex-1 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isVerifying} 
                  className="btn-teal flex-1 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Auditing Credibility...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" /> Run Anti-Forgery Audit
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Result State */
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center border-4 border-emerald-50">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> {result.status} (Confidence: {result.confidenceScore}%)
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-2">{title}</h3>
                <p className="text-xs text-gray-500">{issuer}</p>
              </div>

              {/* SHA-256 Attestation Box */}
              <div className="bg-slate-900 text-left p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">
                    Digital Verification Seal
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {result.ledgerBlockId}
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-slate-300 break-all select-all">
                    {result.blockHash}
                  </span>
                  <button 
                    onClick={() => copyHash(result.blockHash)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors cursor-pointer flex-shrink-0"
                    title="Copy SHA-256 Hash"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  &bull; {result.tamperFlags}
                </p>
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  onClick={() => { setResult(null); setTitle(''); }}
                  className="btn-secondary flex-1 text-xs cursor-pointer"
                >
                  Verify Another
                </button>
                <button 
                  onClick={onClose} 
                  className="btn-primary flex-1 text-xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

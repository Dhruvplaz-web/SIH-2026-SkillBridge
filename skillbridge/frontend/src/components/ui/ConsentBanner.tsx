import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Cookie, X, Check, Settings } from 'lucide-react';

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(true);
  const [marketingConsent, setMarketingConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('skillsetu_consent');
    if (!consent) {
      // Delay showing by 800ms for smooth page entrance
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(
      'skillsetu_consent',
      JSON.stringify({ essential: true, analytics: true, marketing: true, timestamp: new Date().toISOString() })
    );
    setVisible(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem(
      'skillsetu_consent',
      JSON.stringify({ essential: true, analytics: false, marketing: false, timestamp: new Date().toISOString() })
    );
    setVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem(
      'skillsetu_consent',
      JSON.stringify({ essential: true, analytics: analyticsConsent, marketing: marketingConsent, timestamp: new Date().toISOString() })
    );
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside aria-label="Privacy and Cookie Consent" className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-xl z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md text-slate-100 rounded-2xl p-5 shadow-2xl border border-slate-700/80">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400 flex-shrink-0 mt-0.5">
            <Cookie className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                DPDP Act 2023 &amp; Cookie Consent
              </h4>
              <button
                type="button"
                onClick={handleAcceptEssential}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              SkillSetu employs statutory, non-intrusive cookies and sovereign cryptographic telemetry to authenticate 
              sessions, verify student credentials, and preserve audit trails in strict compliance with the Indian 
              Digital Personal Data Protection (DPDP) Act 2023.
            </p>

            {showPreferences && (
              <div className="mt-3 p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="text-white block font-medium">Essential &amp; TrustLedger Cookies</strong>
                    <span className="text-[11px] text-slate-400">Required for authentication, security tokens, and ledger hashes.</span>
                  </div>
                  <span className="text-[11px] font-bold text-teal-400 bg-teal-950/80 border border-teal-800 px-2 py-0.5 rounded">
                    Mandatory
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                  <div>
                    <strong className="text-white block font-medium">Academic &amp; Skill Telemetry</strong>
                    <span className="text-[11px] text-slate-400">Anonymous performance metrics to enhance AI recommendations.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={analyticsConsent}
                    onChange={(e) => setAnalyticsConsent(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-700 bg-slate-800 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                  <div>
                    <strong className="text-white block font-medium">Corporate Outreach Signals</strong>
                    <span className="text-[11px] text-slate-400">Allows recruiters to deliver verified job alerts based on skill match.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={marketingConsent}
                    onChange={(e) => setMarketingConsent(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-700 bg-slate-800 cursor-pointer"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mt-4 flex-wrap">
              {showPreferences ? (
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Save My Preferences
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleAcceptAll}
                    className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept All</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAcceptEssential}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700 cursor-pointer"
                  >
                    Essential Only
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPreferences(true)}
                    className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer ml-auto"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Customize</span>
                  </button>
                </>
              )}
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-3">
                <Link to="/privacy" className="hover:text-teal-400 transition-colors underline underline-offset-2">
                  Privacy Policy
                </Link>
                <span>&bull;</span>
                <Link to="/cookies" className="hover:text-teal-400 transition-colors underline underline-offset-2">
                  Cookie Policy
                </Link>
                <span>&bull;</span>
                <Link to="/terms" className="hover:text-teal-400 transition-colors underline underline-offset-2">
                  Terms
                </Link>
              </div>

              <div className="flex items-center gap-1 text-emerald-400 font-mono text-[10px]">
                <ShieldCheck className="w-3 h-3" />
                <span>Zero Third-Party Ad Trackers</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

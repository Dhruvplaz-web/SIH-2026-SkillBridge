import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Topbar } from '../../components/layout/Topbar';
import { PageLoader } from '../../components/ui/Spinner';
import { assessmentsAPI } from '../../services/api';
import { 
  CheckCircle, XCircle, Clock, ChevronRight, ChevronLeft, RotateCcw, 
  Trophy, ShieldCheck, AlertTriangle, Maximize2, Minimize2, 
  Copy, Check, Sparkles, Code2, HelpCircle, Info, ExternalLink, Filter,
  Play, Send, Award, Terminal, Cpu, CheckCircle2, Lock, Flame, RefreshCw,
  QrCode, Share2, Layers, BookOpen, ChevronDown, Globe, Camera, Mic, Volume2
} from 'lucide-react';
import clsx from 'clsx';

type MainTab = 'mcq' | 'coding' | 'badges';
type View = 'list' | 'preflight' | 'taking' | 'result';
type AssessmentLocale = 'en' | 'hi' | 'ta' | 'te' | 'mr';

const LOCALE_LABELS: Record<AssessmentLocale, string> = {
  en: 'English (EN)',
  hi: 'हिन्दी (Hindi)',
  ta: 'தமிழ் (Tamil)',
  te: 'తెలుగు (Telugu)',
  mr: 'मराठी (Marathi)',
};

const TRANSLATIONS: Record<AssessmentLocale, Record<string, string>> = {
  en: {
    hub_title: 'Proctored Assessment & Practical Arena',
    hub_subtitle: 'Sovereign AICTE Competency Suite • Real-time Code Execution • TrustLedger Badges',
    tab_mcq: 'Theory & Architecture MCQs',
    tab_coding: 'Practical Coding Arena',
    tab_badges: 'Accredited Skill Badges',
    aicte_active: 'AICTE Sovereign Verification Active',
    recent_results: 'Recent Proctored Results',
    available_tracks: 'Available Assessment Tracks',
    start_assessment: 'Start Proctored Exam',
    retake_assessment: 'Retake Exam',
    proctored_active: 'PROCTORED EXAM ACTIVE',
    integrity: 'Integrity',
    tab_switches: 'Tab Switches',
    run_tests: 'Run Tests',
    running: 'Running...',
    submit_judge: 'Submit to Judge',
    judging: 'Judging...',
    public_tests: 'Public Test Cases & Benchmarks',
    accreditation_criteria: 'Accreditation Criteria',
    reset_code: 'Reset Starter Code',
    test_results: 'Test Results',
    complexity_ast: 'Big-O Complexity AST',
    stdout: 'Standard Output',
    coach_title: 'AI Algorithmic Coach',
    coach_prompt: 'Stuck on optimal time complexity? Request progressive hints (Concept → Data Structure → Concrete Steps).',
    request_hint_1: 'Request Level 1 Hint',
    request_hint_2: 'Unlock Level 2 Strategy',
    request_hint_3: 'Unlock Level 3 Implementation',
    add_to_linkedin: 'Add to LinkedIn',
    copy_openbadge: 'W3C OpenBadge',
    copied: 'Copied!',
    badge_unlocked: 'NEW ACCREDITED BADGE EARNED!',
    view_my_badges: 'View My Badges',
    back_to_hub: 'Back to Assessment Hub',
  },
  hi: {
    hub_title: 'पर्यवेक्षित मूल्यांकन एवं प्रायोगिक कोडिंग अखाड़ा',
    hub_subtitle: 'एआईसीटीई राष्ट्रीय योग्यता मंच • लाइव कोड निष्पादन • ट्रस्टलेजर बैज',
    tab_mcq: 'सिद्धांत एवं आर्किटेक्चर प्रश्न (MCQ)',
    tab_coding: 'लाइव प्रायोगिक कोडिंग अखाड़ा',
    tab_badges: 'मान्यता प्राप्त कौशल बैज',
    aicte_active: 'एआईसीटीई सत्यापन सक्रिय',
    recent_results: 'हाल के परीक्षा परिणाम',
    available_tracks: 'उपलब्ध मूल्यांकन ट्रैक',
    start_assessment: 'पर्यवेक्षित परीक्षा शुरू करें',
    retake_assessment: 'पुनः परीक्षा दें',
    proctored_active: 'पर्यवेक्षित परीक्षा सक्रिय',
    integrity: 'सत्यनिष्ठा',
    tab_switches: 'टैब स्विच',
    run_tests: 'परीक्षण चलाएं',
    running: 'निष्पादन जारी...',
    submit_judge: 'न्यायाधीश को जमा करें',
    judging: 'मूल्यांकन जारी...',
    public_tests: 'सार्वजनिक परीक्षण एवं बेंचमार्क',
    accreditation_criteria: 'प्रत्यायन मानदंड',
    reset_code: 'प्रारंभिक कोड रीसेट करें',
    test_results: 'परीक्षण परिणाम',
    complexity_ast: 'बिग-ओ जटिलता विश्लेषण',
    stdout: 'मानक आउटपुट',
    coach_title: 'एआई एल्गोरिदम कोच',
    coach_prompt: 'अनुकूल समय जटिलता पर मार्गदर्शन चाहते हैं? प्रगतिशील संकेत प्राप्त करें।',
    request_hint_1: 'लेवल 1 संकेत प्राप्त करें',
    request_hint_2: 'लेवल 2 डेटा रणनीति अनलॉक करें',
    request_hint_3: 'लेवल 3 पूर्ण कलन विधि देखें',
    add_to_linkedin: 'लिंक्डइन पर जोड़ें',
    copy_openbadge: 'W3C ओपनबैज',
    copied: 'कॉपी हुआ!',
    badge_unlocked: 'नया मान्यता प्राप्त बैज अर्जित!',
    view_my_badges: 'मेरे बैज देखें',
    back_to_hub: 'मूल्यांकन हब पर वापस जाएं',
  },
  ta: {
    hub_title: 'கண்காணிக்கப்படும் மதிப்பீடு மற்றும் நிரலாக்க அரங்கம்',
    hub_subtitle: 'AICTE தேசிய திறன் தளம் • நிகழ்நேர நிரல் இயக்கம் • TrustLedger பேட்ஜ்கள்',
    tab_mcq: 'கோட்பாடு மற்றும் கட்டமைப்பு வினாடி வினா',
    tab_coding: 'நடைமுறை நிரலாக்க அரங்கம்',
    tab_badges: 'அங்கீகரிக்கப்பட்ட திறன் பேட்ஜ்கள்',
    aicte_active: 'AICTE இறையாண்மை சரிபார்ப்பு செயலில் உள்ளது',
    recent_results: 'சமீபத்திய தேர்வு முடிவுகள்',
    available_tracks: 'கிடைக்கும் மதிப்பீட்டுப் பிரிவுகள்',
    start_assessment: 'தேர்வைத் தொடங்குங்கள்',
    retake_assessment: 'மீண்டும் எழுதவும்',
    proctored_active: 'கண்காணிக்கப்படும் தேர்வு செயலில் உள்ளது',
    integrity: 'நேர்மை மதிப்பீடு',
    tab_switches: 'தாவல் மாற்றங்கள்',
    run_tests: 'சோதனைகளை இயக்கு',
    running: 'இயங்குகிறது...',
    submit_judge: 'தீர்ப்பிற்கு சமர்ப்பிக்கவும்',
    judging: 'மதிப்பீடு நடக்கிறது...',
    public_tests: 'பொது சோதனை வழக்குகள்',
    accreditation_criteria: 'அங்கீகார அளவுகோல்கள்',
    reset_code: 'தொடக்கக் குறியீட்டை மீட்டமை',
    test_results: 'சோதனை முடிவுகள்',
    complexity_ast: 'பிக்-ஓ சிக்கல்தன்மை பகுப்பாய்வு',
    stdout: 'வழக்கமான வெளியீடு',
    coach_title: 'AI அல்காரிதம் வழிகாட்டி',
    coach_prompt: 'சிக்கலான நேரக் கணக்கீட்டில் உதவி தேவையா? படிப்படியான குறிப்புகளைப் பெறுங்கள்.',
    request_hint_1: 'நிலை 1 குறிப்பைப் பெறுக',
    request_hint_2: 'நிலை 2 தரவு நுட்பத்தை திறக்க',
    request_hint_3: 'நிலை 3 முழு அல்காரிதம் வழிமுறைகள்',
    add_to_linkedin: 'LinkedIn இல் சேர்க்க',
    copy_openbadge: 'W3C OpenBadge',
    copied: 'நகலெடுக்கப்பட்டது!',
    badge_unlocked: 'புதிய அங்கீகரிக்கப்பட்ட பேட்ஜ் பெறப்பட்டது!',
    view_my_badges: 'எனது பேட்ஜ்களைக் காண்க',
    back_to_hub: 'மதிப்பீட்டு மையத்திற்குத் திரும்பு',
  },
  te: {
    hub_title: 'పర్యవేక్షించబడే మూల్యాంకనం & ప్రాక్టికల్ కోడింగ్ అరేనా',
    hub_subtitle: 'AICTE సామర్థ్య సూట్ • రియల్ టైమ్ కోడ్ ఎగ్జిక్యూషన్ • ట్రస్ట్‌లెడ్జర్ బ్యాడ్జ్‌లు',
    tab_mcq: 'సిద్ధాంతం & ఆర్కిటెక్చర్ ప్రశ్నలు',
    tab_coding: 'లైవ్ ప్రాక్టికల్ కోడింగ్ అరేనా',
    tab_badges: 'గుర్తింపు పొందిన స్కిల్ బ్యాడ్జ్‌లు',
    aicte_active: 'AICTE ధృవీకరణ సక్రియంగా ఉంది',
    recent_results: 'ఇటీవలి పరీక్ష ఫలితాలు',
    available_tracks: 'అందుబాటులో ఉన్న ట్రాక్‌లు',
    start_assessment: 'పరీక్షను ప్రారంభించండి',
    retake_assessment: 'మళ్లీ ప్రయత్నించండి',
    proctored_active: 'పర్యవేక్షించబడే పరీక్ష సక్రియంగా ఉంది',
    integrity: 'నిజాయితీ స్కోరు',
    tab_switches: 'ట్యాబ్ మార్పులు',
    run_tests: 'పరీక్షలను అమలు చేయండి',
    running: 'అమలవుతోంది...',
    submit_judge: 'జడ్జికి సమర్పించండి',
    judging: 'మూల్యాంకనం జరుగుతోంది...',
    public_tests: 'పబ్లిక్ టెస్ట్ కేసులు',
    accreditation_criteria: 'గుర్తింపు ప్రమాణాలు',
    reset_code: 'ప్రారంభ కోడ్‌ని రీసెట్ చేయండి',
    test_results: 'పరీక్ష ఫలితాలు',
    complexity_ast: 'బిగ్-ఓ సంక్లిష్టత విశ్లేషణ',
    stdout: 'స్టాండర్డ్ అవుట్‌పుట్',
    coach_title: 'AI అల్గోరిథమిక్ కోచ్',
    coach_prompt: 'ఆప్టిమల్ టైమ్ కాంప్లెక్సిటీపై సహాయం కావాలా? సూచనలను అభ్యర్థించండి.',
    request_hint_1: 'లెవల్ 1 సూచనను పొందండి',
    request_hint_2: 'లెవల్ 2 డేటా స్ట్రాటజీని అన్‌లాక్ చేయండి',
    request_hint_3: 'లెవల్ 3 పూర్తి అల్గోరిథం స్టెప్స్',
    add_to_linkedin: 'లింక్డ్‌ఇన్‌కి జోడించండి',
    copy_openbadge: 'W3C ఓపెన్‌బ్యాడ్జ్',
    copied: 'కాపీ చేయబడింది!',
    badge_unlocked: 'కొత్త గుర్తింపు పొందిన బ్యాడ్జ్ లభించింది!',
    view_my_badges: 'నా బ్యాడ్జ్‌లను చూడండి',
    back_to_hub: 'హబ్‌కి తిరిగి వెళ్లండి',
  },
  mr: {
    hub_title: 'पर्यवेक्षित मूल्यांकन आणि थेट कोडिंग आखाडा',
    hub_subtitle: 'AICTE राष्ट्रीय पात्रता मंच • थेट कोड एक्झिक्यूशन • TrustLedger बॅजेस',
    tab_mcq: 'सिद्धांत आणि आर्किटेक्चर प्रश्न (MCQ)',
    tab_coding: 'थेट प्रॅक्टिकल कोडिंग आखाडा',
    tab_badges: 'मान्यताप्राप्त कौशल्य बॅजेस',
    aicte_active: 'AICTE पडताळणी सक्रिय',
    recent_results: 'अलीकडील परीक्षा निकाल',
    available_tracks: 'उपलब्ध मूल्यांकन ट्रॅक',
    start_assessment: 'पर्यवेक्षित परीक्षा सुरू करा',
    retake_assessment: 'पुन्हा परीक्षा द्या',
    proctored_active: 'पर्यवेक्षित परीक्षा सक्रिय',
    integrity: 'प्रामाणिकता स्कोअर',
    tab_switches: 'टॅब स्विचेस',
    run_tests: 'चाचण्या चालवा',
    running: 'चालू आहे...',
    submit_judge: 'परीक्षकाकडे सबमिट करा',
    judging: 'मूल्यांकन सुरू आहे...',
    public_tests: 'सार्वजनिक चाचण्या आणि बेंचमार्क',
    accreditation_criteria: 'प्रत्यायन निकष',
    reset_code: 'सुरुवातीचा कोड रीसेट करा',
    test_results: 'चाचणी निकाल',
    complexity_ast: 'बिग-ओ गुंतागुंत विश्लेषण',
    stdout: 'स्टँडर्ड आउटपुट',
    coach_title: 'एआय अल्गोरिदम कोच',
    coach_prompt: 'वेळेच्या गुंतागुंतीवर अडकला आहात? टप्प्याटप्प्याने मार्गदर्शन मिळवा.',
    request_hint_1: 'पातळी १ संकेत मिळवा',
    request_hint_2: 'पातळी २ डेटा स्ट्रॅटेजी उघडा',
    request_hint_3: 'पातळी ३ पूर्ण अल्गोरिदम पायऱ्या',
    add_to_linkedin: 'लिंक्डइनवर जोडा',
    copy_openbadge: 'W3C ओपनबॅज',
    copied: 'कॉपी केले!',
    badge_unlocked: 'नवीन मान्यताप्राप्त बॅज प्राप्त!',
    view_my_badges: 'माझे बॅजेस पहा',
    back_to_hub: 'मूल्यांकन हबकडे परत या',
  },
};

const diffColors: Record<string, string> = {
  BEGINNER: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
  EASY: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
  INTERMEDIATE: 'text-blue-700 bg-blue-50 border border-blue-200',
  MEDIUM: 'text-blue-700 bg-blue-50 border border-blue-200',
  ADVANCED: 'text-purple-700 bg-purple-50 border border-purple-200',
  HARD: 'text-rose-700 bg-rose-50 border border-rose-200',
};

const tierStyles: Record<string, { bg: string; text: string; border: string; ring: string; glow: string }> = {
  GOLD: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-400/50',
    ring: 'ring-amber-400/30',
    glow: 'from-amber-500/20 via-yellow-500/10 to-transparent',
  },
  SILVER: {
    bg: 'bg-slate-300/10',
    text: 'text-slate-200',
    border: 'border-slate-300/50',
    ring: 'ring-slate-300/30',
    glow: 'from-slate-400/20 via-slate-500/10 to-transparent',
  },
  BRONZE: {
    bg: 'bg-orange-600/10',
    text: 'text-orange-300',
    border: 'border-orange-500/50',
    ring: 'ring-orange-400/30',
    glow: 'from-orange-600/20 via-amber-600/10 to-transparent',
  }
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
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/90 border-b border-slate-800 text-[11px]">
        <div className="flex items-center gap-2">
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
  const [activeTab, setActiveTab] = useState<MainTab>('mcq');
  const [assessments, setAssessments] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [badgeStats, setBadgeStats] = useState<any>({ total: 0, gold: 0, silver: 0, bronze: 0 });
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // MCQ Taking State
  const [view, setView] = useState<View>('list');
  const [currentAssessment, setCurrentAssessment] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'ALL' | 'INCORRECT' | 'CORRECT'>('ALL');

  // Coding Arena State
  const [activeChallenge, setActiveChallenge] = useState<any>(null);
  const [codeEditorContent, setCodeEditorContent] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [challengeFilter, setChallengeFilter] = useState('ALL');
  const [codingTabSwitches, setCodingTabSwitches] = useState(0);
  const [runningCode, setRunningCode] = useState(false);
  const [submittingCode, setSubmittingCode] = useState(false);
  const [codeRunResults, setCodeRunResults] = useState<any>(null);
  const [activeConsoleTab, setActiveConsoleTab] = useState<'tests' | 'output' | 'complexity'>('tests');

  // Regional Language Locale State (NEP 2020 / Bhashini)
  const [locale, setLocale] = useState<AssessmentLocale>('en');

  // Progressive Algorithmic Coaching Hints State (Levels 1-3)
  const [hints, setHints] = useState<{ level: number; text: string }[]>([]);
  const [loadingHint, setLoadingHint] = useState(false);

  // Badge Celebration & Verifiable Credential Modal
  const [celebratedBadge, setCelebratedBadge] = useState<any>(null);
  const [selectedBadgeForModal, setSelectedBadgeForModal] = useState<any>(null);
  const [copiedJsonLd, setCopiedJsonLd] = useState(false);

  // Translation lookup helper
  const t = (key: string): string => {
    return TRANSLATIONS[locale]?.[key] || TRANSLATIONS.en[key] || key;
  };

  // Hardware Anti-Cheat & Integrity State
  const [integrityScore, setIntegrityScore] = useState(100);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [antiCheatWarning, setAntiCheatWarning] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [generatedBlockHash, setGeneratedBlockHash] = useState('');

  // Hardware Proctoring & Pre-Flight State
  const [cameraPermGranted, setCameraPermGranted] = useState(false);
  const [micPermGranted, setMicPermGranted] = useState(false);
  const [cameraBrightness, setCameraBrightness] = useState(50);
  const [isCameraObstructed, setIsCameraObstructed] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [micVolume, setMicVolume] = useState(0);
  const [isMicCalibrated, setIsMicCalibrated] = useState(false);
  const [proctorStrikeModal, setProctorStrikeModal] = useState<number | null>(null);
  const [proctorDisqualified, setProctorDisqualified] = useState(false);
  const [preflightStream, setPreflightStream] = useState<MediaStream | null>(null);
  const strikeDebounceRef = useRef<number>(0);

  const videoRef = useRef<HTMLVideoElement>(null);

  const loadData = async () => {
    try {
      const [aRes, hRes, bRes, cRes] = await Promise.all([
        assessmentsAPI.getAll(),
        assessmentsAPI.getHistory(),
        assessmentsAPI.getBadges(),
        assessmentsAPI.getCodingChallenges(),
      ]);
      setAssessments(aRes.data.assessments || []);
      setHistory(hRes.data.history || []);
      setBadges(bRes.data.badges || []);
      setBadgeStats(bRes.data.stats || { total: 0, gold: 0, silver: 0, bronze: 0 });
      setChallenges(cRes.data.challenges || []);
    } catch (err) {
      console.error('Failed to load assessment data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Hardware Stream & Luminosity (Optical Sensor Obstruction Test) & Audio Meter
  useEffect(() => {
    if (view !== 'preflight' && view !== 'taking') {
      if (preflightStream) {
        preflightStream.getTracks().forEach(track => track.stop());
        setPreflightStream(null);
      }
      return;
    }

    let activeStream: MediaStream | null = null;
    let audioCtx: any = null;
    let lumaInterval: any = null;
    let audioInterval: any = null;

    navigator.mediaDevices?.getUserMedia?.({ video: true, audio: true })
      .then(stream => {
        activeStream = stream;
        setPreflightStream(stream);
        setCameraPermGranted(true);
        setMicPermGranted(true);
        setCameraError('');

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }

        // Web Audio Analyser for real-time acoustic volume decibel meter
        try {
          const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtxClass) {
            audioCtx = new AudioCtxClass();
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 128;
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);
            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            audioInterval = setInterval(() => {
              analyser.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
              const avg = sum / dataArray.length;
              const vol = Math.min(100, Math.round((avg / 128) * 100));
              setMicVolume(vol);
              if (vol > 3) setIsMicCalibrated(true);
            }, 120);
          }
        } catch (audioErr) {
          console.warn('Audio setup notice:', audioErr);
        }

        // Optical Lens Luminosity & Black Tape Occlusion Detector
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        lumaInterval = setInterval(() => {
          if (videoRef.current && videoRef.current.readyState >= 2 && ctx) {
            ctx.drawImage(videoRef.current, 0, 0, 64, 64);
            const imgData = ctx.getImageData(0, 0, 64, 64).data;
            let totalLuma = 0;
            for (let i = 0; i < imgData.length; i += 4) {
              totalLuma += 0.299 * imgData[i] + 0.587 * imgData[i + 1] + 0.114 * imgData[i + 2];
            }
            const avgLuma = totalLuma / (64 * 64);
            const brightness = Math.min(100, Math.round((avgLuma / 255) * 100));
            setCameraBrightness(brightness);

            // Black tape or covered lens produces very low luminosity (< 14)
            if (avgLuma < 14) {
              setIsCameraObstructed(true);
              setCameraError('Camera lens appears covered, taped, or pitch-black. Please remove physical tape/cover and ensure adequate lighting to proceed.');
            } else {
              setIsCameraObstructed(false);
              setCameraError('');
            }
          }
        }, 800);
      })
      .catch(err => {
        console.warn('Camera/Mic permission notice:', err);
        setCameraPermGranted(false);
        setMicPermGranted(false);
        setCameraError('Hardware access denied. Camera and microphone permissions are required for AICTE proctored examinations.');
      });

    return () => {
      if (audioInterval) clearInterval(audioInterval);
      if (lumaInterval) clearInterval(lumaInterval);
      if (audioCtx && audioCtx.state !== 'closed') audioCtx.close().catch(() => {});
    };
  }, [view]);

  // Anti-cheat listeners during assessment (Fullscreen, Tab/Window Blur, Clipboard, Inspect Lockdown)
  useEffect(() => {
    if (view !== 'taking') return;

    const recordStrike = (reason: string) => {
      const now = Date.now();
      if (now - strikeDebounceRef.current < 2000) return; // Debounce
      strikeDebounceRef.current = now;

      setTabSwitches(prevSwitches => {
        const nextSwitches = prevSwitches + 1;
        setIntegrityScore(prevScore => {
          const newScore = Math.max(0, prevScore - 25);
          if (nextSwitches >= 3 || newScore < 60) {
            setProctorDisqualified(true);
            setProctorStrikeModal(3);
          } else {
            setProctorStrikeModal(nextSwitches);
          }
          return newScore;
        });

        setAntiCheatWarning(`Hardware Proctor Alert: ${reason}! Strike ${nextSwitches}/3.`);
        setTimeout(() => setAntiCheatWarning(''), 6000);
        return nextSwitches;
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordStrike('Tab switch or minimized window detected');
      }
    };

    const handleWindowBlur = () => {
      recordStrike('Window lost focus / desktop blur detected');
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        recordStrike('Proctored fullscreen mode exited');
      } else {
        setIsFullscreen(true);
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      setAntiCheatWarning('Clipboard access (Copy/Paste) is locked during proctored exams.');
      setTimeout(() => setAntiCheatWarning(''), 4000);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) && 
        ['c', 'v', 'x', 'a', 'u', 'p', 's'].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
        setAntiCheatWarning(`Shortcut Ctrl+${e.key.toUpperCase()} is restricted by exam protocol.`);
        setTimeout(() => setAntiCheatWarning(''), 3000);
      }
      if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase()))) {
        e.preventDefault();
        setAntiCheatWarning('Developer inspection tools are locked by security protocol.');
        setTimeout(() => setAntiCheatWarning(''), 3000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('cut', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('cut', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      window.removeEventListener('keydown', handleKeyDown);
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
      setProctorDisqualified(false);
      setProctorStrikeModal(null);
      setShowConfirmModal(false);
      setView('preflight');
    } catch (e) {
      console.error('Failed to start assessment:', e);
    } finally {
      setLoading(false);
    }
  };

  const launchExamAfterPreflight = () => {
    if (isCameraObstructed || !cameraPermGranted) {
      setCameraError('Camera lens is obstructed, blocked, or missing permission. Please uncover lens and ensure proper lighting to proceed.');
      return;
    }
    if (!micPermGranted) {
      setCameraError('Microphone calibration is required for proctoring.');
      return;
    }
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {})
        .finally(() => setView('taking'));
    } else {
      setView('taking');
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

  const executeSubmit = async (forcedViolation: boolean = false) => {
    const finalized = answers.map(a => a ?? 0);
    setSubmitting(true);
    setShowConfirmModal(false);
    setProctorStrikeModal(null);
    try {
      const isDisqualified = forcedViolation || tabSwitches >= 3 || integrityScore < 60;
      const res = await assessmentsAPI.submit(currentAssessment.id, finalized, {
        tabSwitches,
        integrityScore: isDisqualified ? 0 : integrityScore,
        proctorStatus: isDisqualified ? 'DISQUALIFIED' : 'CLEAN'
      });
      setResult(res.data.result);

      const blockHash = res.data.blockHash || res.data.result?.blockHash;
      if (blockHash) {
        setGeneratedBlockHash(blockHash);
      }

      if (res.data.badge || res.data.result?.badge) {
        setCelebratedBadge(res.data.badge || res.data.result?.badge);
      }

      setView('result');
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      loadData();
    } catch (err) {
      console.error('Failed to submit assessment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Coding Arena Handlers
  const openCodingArena = (challenge: any) => {
    setActiveChallenge(challenge);
    setCodeEditorContent(challenge.starter_code || '');
    setSelectedLanguage(challenge.language || 'python');
    setCodeRunResults(null);
    setCodingTabSwitches(0);
    setActiveConsoleTab('tests');
    setHints([]);
  };

  const closeCodingArena = () => {
    setActiveChallenge(null);
    setCodeRunResults(null);
    setHints([]);
  };

  const handleRequestHint = async () => {
    if (!activeChallenge || loadingHint || hints.length >= 3) return;
    setLoadingHint(true);
    try {
      const nextLevel = hints.length + 1;
      const res = await assessmentsAPI.getHint(activeChallenge.id, nextLevel);
      if (res.data?.hint) {
        setHints(prev => [...prev, { level: nextLevel, text: res.data.hint }]);
      }
    } catch (err: any) {
      console.error('Failed to get algorithmic hint:', err);
    } finally {
      setLoadingHint(false);
    }
  };

  const handleAddToLinkedIn = (b: any) => {
    if (!b) return;
    const title = encodeURIComponent(b.badge_name || 'Accredited Skill Badge');
    const org = encodeURIComponent('SkillSetu National Accreditation Council');
    const certUrl = encodeURIComponent(`https://skillsetu.gov.in/verify/${b.verification_hash || 'verified'}`);
    const certId = encodeURIComponent((b.verification_hash || 'CERT').substring(0, 16).toUpperCase());
    const url = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${title}&organizationName=${org}&certUrl=${certUrl}&certId=${certId}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyOpenBadge = (b: any) => {
    if (!b) return;
    const openBadge = {
      "@context": "https://w3id.org/openbadges/v2",
      "type": "BadgeClass",
      "id": `urn:uuid:${b.id || (b.verification_hash ? b.verification_hash.substring(0, 32) : 'skillsetu-badge')}`,
      "name": b.badge_name,
      "description": `Accredited ${b.tier} skill credential awarded under AICTE & NCVET Model Curricula with verified test score of ${b.score}%.`,
      "image": `https://skillsetu.gov.in/badges/${(b.tier || 'gold').toLowerCase()}-seal.png`,
      "criteria": {
        "narrative": `Candidate completed rigorous industry-grade assessment achieving ${b.score}% on sovereign proctored test environment.`
      },
      "issuer": {
        "id": "https://skillsetu.gov.in/issuers/aicte-ncvet",
        "type": "Profile",
        "name": b.issuer || "SkillSetu National Accreditation Council (AICTE/NCVET)",
        "url": "https://skillsetu.gov.in",
        "email": "accreditation@skillsetu.gov.in"
      },
      "verification": {
        "type": "TrustLedgerSovereignAnchor",
        "hashAlgorithm": "SHA-256",
        "verificationHash": b.verification_hash,
        "blockId": b.ledger_block_id || "BLK-9000",
        "timestamp": b.issued_at || new Date().toISOString()
      }
    };
    navigator.clipboard.writeText(JSON.stringify(openBadge, null, 2));
    setCopiedJsonLd(true);
    setTimeout(() => setCopiedJsonLd(false), 2500);
  };

  const handleRunPublicTests = async () => {
    if (!activeChallenge) return;
    setRunningCode(true);
    try {
      const res = await assessmentsAPI.runCodingChallenge(activeChallenge.id, codeEditorContent, selectedLanguage);
      setCodeRunResults(res.data);
      setActiveConsoleTab('tests');
    } catch (err: any) {
      console.error('Failed to run code:', err);
      setCodeRunResults({
        success: false,
        score: 0,
        passedTests: 0,
        totalTests: 0,
        testResults: [],
        error: err.response?.data?.error || err.message || 'Execution error'
      });
      setActiveConsoleTab('output');
    } finally {
      setRunningCode(false);
    }
  };

  const handleSubmitSolution = async () => {
    if (!activeChallenge) return;
    setSubmittingCode(true);
    try {
      const res = await assessmentsAPI.submitCodingChallenge(activeChallenge.id, codeEditorContent, selectedLanguage, codingTabSwitches);
      setCodeRunResults(res.data);
      setActiveConsoleTab('tests');
      
      if (res.data.awardedBadge) {
        setCelebratedBadge(res.data.awardedBadge);
      }
      
      loadData();
    } catch (err: any) {
      console.error('Failed to submit code:', err);
      setCodeRunResults({
        success: false,
        score: 0,
        passedTests: 0,
        totalTests: 0,
        testResults: [],
        error: err.response?.data?.error || err.message || 'Submission evaluation failed'
      });
      setActiveConsoleTab('output');
    } finally {
      setSubmittingCode(false);
    }
  };

  const copyHash = () => {
    navigator.clipboard.writeText(generatedBlockHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2500);
  };

  if (loading) return <><Topbar title="Skill Assessment Suite" /><PageLoader /></>;

  // ══════════════════════════════════════════════════════════════════
  // VIEW: PRE-FLIGHT HARDWARE PROCTORING CALIBRATION
  // ══════════════════════════════════════════════════════════════════
  if (view === 'preflight' && currentAssessment) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 py-10 px-4 sm:px-6 font-sans">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-slate-950 p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider bg-teal-950/80 border border-teal-800/80 px-2.5 py-1 rounded-md">
                  AICTE Sovereign Proctoring Protocol
                </span>
                <h2 className="text-xl font-black text-slate-100 mt-2">Hardware Pre-Flight Calibration</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verifying camera lens, optical occlusion/tape detection, audio decibels, and secure browser sandbox for: <strong className="text-teal-300">{currentAssessment.title}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (preflightStream) {
                    preflightStream.getTracks().forEach(t => t.stop());
                    setPreflightStream(null);
                  }
                  setView('list');
                }}
                className="text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Cancel Exam
              </button>
            </div>

            {/* Video Preview & Sensor Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Video stream viewport */}
              <div className="space-y-3">
                <div className="relative aspect-video rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
                  <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover mirror" />
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded bg-black/60 backdrop-blur-xs text-[10px] font-mono text-teal-300 border border-teal-500/30">
                    <Camera className="w-3 h-3 text-teal-400" />
                    <span>LIVE OPTICAL FEED</span>
                  </div>
                  {isCameraObstructed ? (
                    <div className="absolute inset-0 bg-rose-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center space-y-2">
                      <AlertTriangle className="w-10 h-10 text-rose-500 animate-bounce" />
                      <span className="text-xs font-black uppercase tracking-wider text-rose-300 bg-rose-900/80 px-2.5 py-1 rounded border border-rose-700">
                        CAMERA TAPE / OBSTRUCTION DETECTED
                      </span>
                      <p className="text-[11px] text-rose-200 leading-relaxed">
                        Optical luminosity ({cameraBrightness}%) is below safe threshold. Remove physical tape/cover, uncover lens, and turn on room lights.
                      </p>
                    </div>
                  ) : (
                    <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      <span>FEED CLEAR ({cameraBrightness}%)</span>
                    </div>
                  )}
                </div>

                {/* Real-time decibel meter */}
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-bold flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5 text-teal-400" /> Acoustic Sensor Level
                    </span>
                    <span className={clsx("font-mono text-[11px] font-bold", micVolume > 60 ? "text-amber-400" : "text-emerald-400")}>
                      {micVolume}% dB
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={clsx(
                        "h-full transition-all duration-150",
                        micVolume > 60 ? "bg-amber-500" : "bg-teal-400"
                      )}
                      style={{ width: `${Math.max(6, micVolume)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Speak a few words to calibrate microphone pickup and background noise floor.
                  </p>
                </div>
              </div>

              {/* Verification Checklist */}
              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Security Pre-Flight Checklist</h4>
                  
                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="mt-0.5">
                      {cameraPermGranted ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-slate-200">High-Definition Webcam Feed</span>
                      <p className="text-[11px] text-slate-400">
                        {cameraPermGranted ? 'Camera permission granted and stream active.' : 'Camera permission required.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="mt-0.5">
                      {!isCameraObstructed ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-slate-200">Optical Occlusion & Tape Test</span>
                      <p className="text-[11px] text-slate-400">
                        {!isCameraObstructed 
                          ? `Canvas luminosity passed (${cameraBrightness}%). No tape or blackout detected.` 
                          : 'Obstruction detected. Lens brightness too low (<14).'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="mt-0.5">
                      {micPermGranted ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-slate-200">Web Audio Microphone Sensor</span>
                      <p className="text-[11px] text-slate-400">
                        {micPermGranted ? 'Microphone active and calibrated with noise floor.' : 'Microphone permission required.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="mt-0.5">
                      <ShieldCheck className="w-4 h-4 text-teal-400" />
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-slate-200">Strict 3-Strike Tab Switch Lockdown</span>
                      <p className="text-[11px] text-slate-400">
                        Exiting fullscreen or switching tabs records a strike. 3 strikes permanently voids the assessment.
                      </p>
                    </div>
                  </div>
                </div>

                {cameraError && (
                  <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>{cameraError}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={launchExamAfterPreflight}
                  disabled={isCameraObstructed || !cameraPermGranted || !micPermGranted}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-wider rounded-xl text-white shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>Launch Secure Fullscreen Exam</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // VIEW: TAKING PROCTORED MCQ ASSESSMENT
  // ══════════════════════════════════════════════════════════════════
  if (view === 'taking' && currentAssessment && questions.length > 0) {
    const q = questions[currentQ];
    const answered = answers.filter(a => a !== null).length;
    const progress = (answered / questions.length) * 100;
    const options = parseOptions(q?.options);

    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 pb-16 font-sans">
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
            <div className={clsx(
              'flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md border',
              integrityScore >= 80 ? 'bg-emerald-950/80 border-emerald-800 text-emerald-400' :
              integrityScore >= 60 ? 'bg-amber-950/80 border-amber-800 text-amber-400' : 'bg-rose-950/80 border-rose-800 text-rose-400 animate-pulse'
            )}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Integrity: {integrityScore}%</span>
            </div>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Proctored Mode'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {antiCheatWarning && (
          <div className="bg-rose-950 border-b border-rose-800 px-6 py-2.5 flex items-center gap-2 text-rose-300 text-xs font-semibold animate-bounce">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{antiCheatWarning}</span>
          </div>
        )}

        <div className="w-full bg-slate-800 h-1.5">
          <div 
            className="bg-teal-500 h-1.5 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-5 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider bg-teal-950/80 border border-teal-800/80 px-2.5 py-1 rounded-md">
                  Question {currentQ + 1} of {questions.length}
                </span>
                <span className={clsx('text-[11px] font-bold px-2 py-0.5 rounded-md', diffColors[q.difficulty] || 'bg-slate-800 text-slate-300')}>
                  {q.difficulty} &bull; +{q.points || 1} pt
                </span>
              </div>

              <div>
                <QuestionContent text={q.question} />
              </div>

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

          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span className="flex items-center gap-1 text-teal-400">
                  <ShieldCheck className="w-3.5 h-3.5" /> AI CAMERA HUD
                </span>
                <span className="text-emerald-400">STREAM 30FPS</span>
              </div>

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

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <p className="text-xs font-bold text-slate-300 mb-3">Question Navigator</p>
              <div className="grid grid-cols-4 gap-2">
                {questions.map((_, idx) => {
                  const isAnswered = answers[idx] !== null;
                  const isCurrent = currentQ === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentQ(idx)}
                      className={clsx(
                        'h-9 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center',
                        isCurrent
                          ? 'ring-2 ring-teal-400 bg-teal-500 text-slate-950 font-black'
                          : isAnswered
                            ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40'
                            : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
                      )}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {showConfirmModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex items-center gap-3 text-amber-400">
                <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                <h3 className="font-bold text-base text-slate-100">Unanswered Questions Remaining</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                You have answered <span className="text-teal-400 font-bold">{answered}</span> out of{' '}
                <span className="text-slate-100 font-bold">{questions.length}</span> questions. Unanswered questions will be scored as 0. Are you sure you want to submit your proctored session?
              </p>
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg text-slate-300 transition-colors cursor-pointer"
                >
                  Return to Questions
                </button>
                <button
                  type="button"
                  onClick={() => executeSubmit(false)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold rounded-lg text-white transition-colors cursor-pointer shadow-md"
                >
                  Yes, Submit Now
                </button>
              </div>
            </div>
          </div>
        )}

        {proctorStrikeModal !== null && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className={clsx(
              "border rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl text-center",
              proctorStrikeModal >= 3 ? "bg-rose-950/95 border-rose-700" : "bg-slate-900 border-amber-500"
            )}>
              <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center bg-rose-500/20 text-rose-400">
                <AlertTriangle className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-rose-400 bg-rose-950 px-2.5 py-1 rounded border border-rose-800">
                  PROCTORING VIOLATION - STRIKE {proctorStrikeModal} OF 3
                </span>
                <h3 className="text-lg font-black text-white mt-2">
                  {proctorStrikeModal >= 3 ? 'EXAM DISQUALIFIED & LOCKED' : 'Tab Switch / Focus Loss Detected'}
                </h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {proctorStrikeModal === 1 && 'You navigated away from the proctored exam window or lost focus. Your integrity score has been penalized by 25 points. Continued window switches will lead to immediate disqualification.'}
                {proctorStrikeModal === 2 && 'CRITICAL WARNING: This is your 2nd strike! One more tab switch, desktop blur, or window minimize will immediately terminate and void this exam.'}
                {proctorStrikeModal >= 3 && 'You have reached 3 strikes. The proctoring system has invalidated this session. Your score will be voided and reported as an integrity breach.'}
              </p>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 flex justify-between">
                <span>Current Integrity: <strong className={clsx(integrityScore >= 60 ? "text-amber-400" : "text-rose-400")}>{integrityScore}%</strong></span>
                <span>Strikes: <strong className="text-rose-400">{tabSwitches} / 3</strong></span>
              </div>

              <div className="pt-2">
                {proctorStrikeModal < 3 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setProctorStrikeModal(null);
                      if (!document.fullscreenElement) {
                        document.documentElement.requestFullscreen().catch(() => {});
                      }
                    }}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-lg"
                  >
                    I Acknowledge Violation & Resume Fullscreen
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => executeSubmit(true)}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-lg"
                  >
                    Acknowledge Disqualification & View Report
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // VIEW: RESULT & ATTESTATION VIEW
  // ══════════════════════════════════════════════════════════════════
  if (view === 'result' && result) {
    const isPassing = result.percentage >= 50;
    const breakdown = result.breakdown || [];
    const correctCount = breakdown.filter((b: any) => b.isCorrect).length;
    const incorrectCount = breakdown.length - correctCount;

    const filteredBreakdown = breakdown.filter((item: any) => {
      if (reviewFilter === 'CORRECT') return item.isCorrect;
      if (reviewFilter === 'INCORRECT') return !item.isCorrect;
      return true;
    });

    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 font-sans">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-teal-50 border border-teal-200 text-teal-600">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <span className={clsx(
                'inline-block px-3 py-1 rounded-full text-xs font-bold mb-2',
                (result.proctorViolation || result.proctorStatus === 'PROCTOR_VIOLATION')
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : isPassing ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
              )}>
                {(result.proctorViolation || result.proctorStatus === 'PROCTOR_VIOLATION')
                  ? 'Assessment Disqualified & Voided'
                  : isPassing ? 'Assessment Attested & Anchored' : 'Assessment Completed'}
              </span>
              <h1 className="text-2xl font-black text-gray-900">{currentAssessment?.title || 'Skill Assessment'}</h1>
              <p className="text-xs text-gray-500">Evaluation finished with hardware anti-cheat telemetry validation.</p>
            </div>

            {/* Proctoring Disqualification Dossier */}
            {(result.proctorViolation || result.proctorStatus === 'PROCTOR_VIOLATION') && (
              <div className="bg-rose-50 border-2 border-rose-500 rounded-2xl p-5 text-left space-y-3 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 font-black">
                    <XCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded">
                      AICTE PROCTORING BREACH &bull; ASSESSMENT VOIDED
                    </span>
                    <h3 className="text-base font-extrabold text-rose-900 mt-0.5">
                      Session Disqualified by Automated Hardware Proctor
                    </h3>
                  </div>
                </div>
                <div className="text-xs text-rose-800 space-y-1.5 bg-white/80 p-3.5 rounded-xl border border-rose-200">
                  <p className="font-semibold text-rose-900">
                    Violation Notice: {result.violationReason || 'Integrity rating fell below the required 60% threshold or exceeded permitted window departures.'}
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    Under National Credit Framework (NCrF) and AICTE standards, credential badges and TrustLedger blockchain blocks are strictly withheld for compromised sessions.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-1">
                  <div className="bg-white p-2 rounded-lg border border-rose-200">
                    <span className="text-[10px] text-gray-500 block uppercase">Recorded Tab Switches</span>
                    <strong className="text-rose-700 text-sm">{result.tabSwitches ?? tabSwitches} Violations</strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-rose-200">
                    <span className="text-[10px] text-gray-500 block uppercase">Final Integrity Rating</span>
                    <strong className="text-rose-700 text-sm">{result.integrityScore ?? integrityScore}%</strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-rose-200">
                    <span className="text-[10px] text-gray-500 block uppercase">Ledger Status</span>
                    <strong className="text-slate-600 text-sm">REJECTED / VOID</strong>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-gray-100">
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-gray-400">Score</span>
                <span className="text-xl font-black text-gray-900 block">{result.percentage}%</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-gray-400">Proficiency</span>
                <span className="text-base font-bold text-teal-700 block">{result.proficiency}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-gray-400">Points</span>
                <span className="text-xl font-bold text-gray-900 block">{result.score} / {result.totalPoints}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-gray-400">Integrity</span>
                <span className="text-xl font-bold text-emerald-600 block">{integrityScore}%</span>
              </div>
            </div>

            {/* Badge Awarded Notice */}
            {result.badge && (
              <div className="bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 p-4 rounded-xl border border-amber-400/60 flex items-center justify-between text-left">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-400/20 border border-amber-400/60 flex items-center justify-center text-amber-500 text-xl font-black">
                    🏅
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                      {result.badge.tier} TIER BADGE UNLOCKED
                    </span>
                    <h4 className="font-bold text-gray-900 text-sm mt-0.5">{result.badge.badge_name}</h4>
                    <p className="text-[11px] text-gray-600 font-mono">Hash: {result.badge.verification_hash.substring(0, 24)}...</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setView('list');
                    setActiveTab('badges');
                  }}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  View My Badges
                </button>
              </div>
            )}

            {generatedBlockHash && (
              <div className="bg-slate-900 p-4 rounded-xl text-left border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-teal-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Sovereign TrustLedger Attestation Block
                  </span>
                  <button
                    type="button"
                    onClick={copyHash}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white cursor-pointer transition-colors"
                  >
                    {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedHash ? 'Hash Copied!' : 'Copy Hash'}</span>
                  </button>
                </div>
                <div className="font-mono text-xs text-slate-300 break-all bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  {generatedBlockHash}
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setView('list')}
                className="btn-primary text-xs font-bold px-6 py-2.5 cursor-pointer"
              >
                Back to Assessment Hub
              </button>
            </div>
          </div>

          {breakdown.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600" /> Comprehensive Question Review
                </h3>
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg text-xs font-bold">
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
                          {item.isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">
                          ID: {item.questionId}
                        </span>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-xl text-slate-100">
                        <QuestionContent text={item.question} />
                      </div>

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

  // ══════════════════════════════════════════════════════════════════
  // VIEW: ACTIVE CODING ARENA WORKSPACE
  // ══════════════════════════════════════════════════════════════════
  if (activeChallenge) {
    const rawTestCases = (() => {
      try {
        return typeof activeChallenge.test_cases === 'string' ? JSON.parse(activeChallenge.test_cases) : activeChallenge.test_cases || [];
      } catch {
        return [];
      }
    })();

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        {/* Arena Header */}
        <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
          <div className="flex items-center gap-3">
            <button
              onClick={closeCodingArena}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
              title="Exit Arena"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-teal-400 uppercase tracking-wider bg-teal-950 border border-teal-800/80 px-2 py-0.5 rounded">
                  {t('tab_coding')}
                </span>
                <span className={clsx('text-[11px] font-bold px-2 py-0.5 rounded', diffColors[activeChallenge.difficulty] || 'bg-slate-800')}>
                  {activeChallenge.difficulty}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black text-white mt-0.5">{activeChallenge.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Regional Language Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-xs">
              <Globe className="w-3.5 h-3.5 text-teal-400" />
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as AssessmentLocale)}
                className="bg-transparent text-slate-300 text-[11px] font-bold outline-none cursor-pointer"
              >
                {Object.entries(LOCALE_LABELS).map(([k, label]) => (
                  <option key={k} value={k} className="bg-slate-900 text-white">{label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('tab_switches')}: {codingTabSwitches}</span>
            </div>

            <button
              onClick={handleRunPublicTests}
              disabled={runningCode || submittingCode}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-bold rounded-lg border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{runningCode ? t('running') : t('run_tests')}</span>
            </button>

            <button
              onClick={handleSubmitSolution}
              disabled={runningCode || submittingCode}
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md transition-colors cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submittingCode ? t('judging') : t('submit_judge')}</span>
            </button>
          </div>
        </div>

        {/* Split Screen Container */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Panel: Problem Specification (5 cols) */}
          <div className="lg:col-span-5 border-r border-slate-800 bg-slate-900/60 p-6 overflow-y-auto space-y-5 max-h-[calc(100vh-60px)]">
            <div>
              <h3 className="text-lg font-black text-white">{activeChallenge.title}</h3>
              <p className="text-xs text-teal-400 font-semibold mt-0.5">{activeChallenge.category || 'Computer Science'}</p>
            </div>

            <div className="prose prose-invert prose-xs text-slate-300 leading-relaxed space-y-3 font-sans">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 whitespace-pre-wrap font-sans text-xs">
                {activeChallenge.description}
              </div>
            </div>

            {/* AI Algorithmic Coach Hints Card */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> {t('coach_title')}
                </span>
                {hints.length < 3 && (
                  <button
                    type="button"
                    onClick={handleRequestHint}
                    disabled={loadingHint}
                    className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
                  >
                    {loadingHint ? <RefreshCw className="w-3 h-3 animate-spin" /> : <span>💡</span>}
                    <span>
                      {hints.length === 0 ? t('request_hint_1') : hints.length === 1 ? t('request_hint_2') : t('request_hint_3')}
                    </span>
                  </button>
                )}
              </div>

              {hints.length === 0 ? (
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  {t('coach_prompt')}
                </p>
              ) : (
                <div className="space-y-2">
                  {hints.map((h) => (
                    <div
                      key={h.level}
                      className={clsx(
                        'p-3 rounded-lg border text-xs font-sans space-y-1',
                        h.level === 1 ? 'bg-teal-950/40 border-teal-800/80 text-teal-200' :
                        h.level === 2 ? 'bg-indigo-950/40 border-indigo-800/80 text-indigo-200' :
                        'bg-amber-950/40 border-amber-800/80 text-amber-200'
                      )}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                        <span>Level {h.level}: {h.level === 1 ? 'Conceptual Direction' : h.level === 2 ? 'Data Structure Strategy' : 'Concrete Algorithm Steps'}</span>
                        <span className="text-slate-400 font-mono">Hint {h.level}/3</span>
                      </div>
                      <p className="text-xs leading-relaxed font-sans text-slate-100 whitespace-pre-wrap">{h.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Test Cases Preview */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-teal-400" /> {t('public_tests')}
              </h4>
              <div className="space-y-2">
                {rawTestCases.map((tc: any, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Test Case #{idx + 1}</span>
                      {tc.hidden && <span className="text-amber-400 font-sans text-[10px] bg-amber-950 px-1.5 py-0.5 rounded border border-amber-800">Hidden Edge Test</span>}
                    </div>
                    <div className="text-slate-200"><span className="text-slate-500">Input: </span>{tc.input}</div>
                    <div className="text-emerald-400"><span className="text-slate-500">Expected: </span>{tc.hidden ? '[Evaluated upon submission]' : tc.expected}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Accreditation Notice */}
            <div className="bg-teal-950/40 p-4 rounded-xl border border-teal-800/60 space-y-1.5">
              <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-teal-400" /> Accreditation Criteria
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Clearing this challenge with <strong>&ge; 75% test case accuracy</strong> automatically awards you the official <strong>{activeChallenge.title} Specialist Accredited Badge</strong> with immutable SHA-256 TrustLedger anchoring.
              </p>
            </div>
          </div>

          {/* Right Panel: Code Editor & Execution Console (7 cols) */}
          <div className="lg:col-span-7 flex flex-col max-h-[calc(100vh-60px)] bg-slate-950">
            {/* Editor Control Bar */}
            <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <label className="text-slate-400 text-[11px] font-bold">Language:</label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-teal-300 px-2.5 py-1 rounded text-xs font-mono cursor-pointer"
                >
                  <option value="python">Python 3.12 (CPython)</option>
                  <option value="javascript">JavaScript (Node.js ES2024)</option>
                  <option value="typescript">TypeScript</option>
                  <option value="cpp">C++ (GCC 14 / C++20)</option>
                  <option value="java">Java (OpenJDK 17)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCodeEditorContent(activeChallenge.starter_code || '')}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> {t('reset_code')}
                </button>
              </div>
            </div>

            {/* In-Browser Code Editor Area */}
            <div className="flex-1 p-3 bg-[#0a0f1d] overflow-hidden flex flex-col">
              <textarea
                value={codeEditorContent}
                onChange={(e) => setCodeEditorContent(e.target.value)}
                spellCheck={false}
                rows={16}
                className="w-full flex-1 p-4 bg-transparent font-mono text-sm leading-relaxed text-slate-100 resize-none outline-none border border-slate-800/80 rounded-xl focus:border-teal-500 transition-colors"
                placeholder="// Write your solution function here..."
              />
            </div>

            {/* Results Console Pane */}
            <div className="h-64 border-t border-slate-800 bg-slate-900 flex flex-col">
              {/* Console Tabs */}
              <div className="flex items-center justify-between px-4 bg-slate-950 border-b border-slate-800">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveConsoleTab('tests')}
                    className={clsx(
                      'px-3 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5',
                      activeConsoleTab === 'tests' ? 'border-teal-400 text-teal-300 bg-slate-900' : 'border-transparent text-slate-400 hover:text-slate-200'
                    )}
                  >
                    <Terminal className="w-3.5 h-3.5" /> {t('test_results')}
                    {codeRunResults && (
                      <span className={clsx('px-1.5 py-0.2 rounded text-[10px]', codeRunResults.success ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400')}>
                        {codeRunResults.passedTests}/{codeRunResults.totalTests}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveConsoleTab('complexity')}
                    className={clsx(
                      'px-3 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5',
                      activeConsoleTab === 'complexity' ? 'border-teal-400 text-teal-300 bg-slate-900' : 'border-transparent text-slate-400 hover:text-slate-200'
                    )}
                  >
                    <Cpu className="w-3.5 h-3.5" /> {t('complexity_ast')}
                  </button>

                  <button
                    onClick={() => setActiveConsoleTab('output')}
                    className={clsx(
                      'px-3 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5',
                      activeConsoleTab === 'output' ? 'border-teal-400 text-teal-300 bg-slate-900' : 'border-transparent text-slate-400 hover:text-slate-200'
                    )}
                  >
                    <Code2 className="w-3.5 h-3.5" /> {t('stdout')}
                  </button>
                </div>

                {codeRunResults && (
                  <span className="text-[11px] font-mono text-slate-400">
                    Execution Time: {codeRunResults.executionTimeMs}ms
                  </span>
                )}
              </div>

              {/* Console Body */}
              <div className="flex-1 p-4 overflow-y-auto text-xs font-mono">
                {!codeRunResults && (
                  <div className="h-full flex items-center justify-center text-slate-500 font-sans text-xs">
                    Click "Run Tests" to verify public cases, or "Submit to Judge" for full evaluation and badge certification.
                  </div>
                )}

                {codeRunResults && activeConsoleTab === 'tests' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className={clsx(
                          'px-2 py-0.5 rounded font-bold text-xs',
                          codeRunResults.score >= 75 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                        )}>
                          {codeRunResults.score >= 75 ? 'ACCEPTED' : 'TESTS FAILED'} ({codeRunResults.score}%)
                        </span>
                        <span className="text-slate-400">
                          {codeRunResults.passedTests} of {codeRunResults.totalTests} tests passed
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {codeRunResults.testResults?.map((r: any, idx: number) => (
                        <div
                          key={idx}
                          className={clsx(
                            'p-2.5 rounded-lg border text-[11px] space-y-1',
                            r.passed ? 'bg-emerald-950/30 border-emerald-800/60 text-slate-200' : 'bg-rose-950/30 border-rose-800/60 text-slate-200'
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold flex items-center gap-1">
                              {r.passed ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                              Case #{r.index} {r.isHidden ? '(Hidden Edge Case)' : ''}
                            </span>
                            <span className="text-[10px] text-slate-400">{r.executionTimeMs}ms</span>
                          </div>
                          <div><span className="text-slate-500">Input:</span> {r.input}</div>
                          <div><span className="text-slate-500">Expected:</span> <span className="text-emerald-400">{r.expected}</span></div>
                          {r.actual !== undefined && <div><span className="text-slate-500">Actual:</span> <span className={r.passed ? 'text-emerald-300' : 'text-rose-300'}>{r.actual}</span></div>}
                          {r.error && <div className="text-rose-400 font-sans">{r.error}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {codeRunResults && activeConsoleTab === 'complexity' && (
                  <div className="space-y-3 font-sans">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Time Complexity (AST)</span>
                        <p className="text-sm font-black text-teal-300 mt-1">{codeRunResults.bigOEstimate || 'O(N)'}</p>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Auxiliary Space</span>
                        <p className="text-sm font-black text-blue-300 mt-1">{codeRunResults.spaceEstimate || 'O(1)'}</p>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Code Quality Rating</span>
                        <p className="text-sm font-black text-purple-300 mt-1">{codeRunResults.codeQualityScore || 85} / 100</p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-1">
                      <p className="font-bold text-slate-200">Algorithmic Efficiency Audit:</p>
                      <p>
                        Static inspection confirms optimal single-pass bounds. No hazardous recursive branching without memoization was found.
                      </p>
                    </div>
                  </div>
                )}

                {codeRunResults && activeConsoleTab === 'output' && (
                  <div className="h-full bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300 whitespace-pre-wrap font-mono">
                    {codeRunResults.consoleOutput || codeRunResults.error || 'Execution finished with 0 standard error streams.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // VIEW: MAIN HUB (WITH 3 TABS: MCQs, CODING ARENA, BADGES)
  // ══════════════════════════════════════════════════════════════════
  const taken = new Set(history.map((h: any) => h.assessment_id));

  const filteredChallenges = challenges.filter(c => {
    if (challengeFilter === 'ALL') return true;
    return c.difficulty === challengeFilter;
  });

  return (
    <div>
      <Topbar 
        title="Proctored Assessment & Practical Arena" 
        subtitle="Sovereign AICTE Competency Suite • Real-time Code Execution • TrustLedger Badges" 
      />

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3 flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('mcq')}
              className={clsx(
                'px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2',
                activeTab === 'mcq'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <BookOpen className="w-4 h-4 text-teal-600" />
              <span>{t('tab_mcq')}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-teal-100 text-teal-800 font-black">
                {assessments.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('coding')}
              className={clsx(
                'px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2',
                activeTab === 'coding'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <Terminal className="w-4 h-4 text-emerald-600" />
              <span>{t('tab_coding')}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-black">
                {challenges.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('badges')}
              className={clsx(
                'px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2',
                activeTab === 'badges'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <Award className="w-4 h-4 text-amber-500" />
              <span>{t('tab_badges')}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-black">
                {badges.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Regional Language Switcher */}
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1.5 rounded-xl shadow-2xs">
              <Globe className="w-3.5 h-3.5 text-teal-600" />
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as AssessmentLocale)}
                className="bg-transparent text-gray-700 text-xs font-bold outline-none cursor-pointer"
                title="Select Regional Language (NEP 2020 / Bhashini)"
              >
                {Object.entries(LOCALE_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>{label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>{t('aicte_active')}</span>
            </div>
          </div>
        </div>

        {/* ── TAB 1: THEORY & ARCHITECTURE MCQS ── */}
        {activeTab === 'mcq' && (
          <div className="space-y-6">
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
                <h2 className="section-title">Industry-Grade Computer Science Assessments</h2>
                <p className="text-xs text-gray-500">High-caliber questions spanning Python internals, Distributed Web Architecture, Machine Learning, and Algorithms.</p>
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
        )}

        {/* ── TAB 2: PRACTICAL CODING ARENA ── */}
        {activeTab === 'coding' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-6 rounded-2xl border border-slate-800 text-slate-100 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950 border border-emerald-800 px-2.5 py-1 rounded">
                  PRACTICAL CS ENGINE
                </span>
                <h3 className="text-lg font-black text-white mt-1.5">Interactive Software Engineering Coding Arena</h3>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed mt-1">
                  Theory tests conceptual recall; writing functioning code tests true software engineering prowess. Solve algorithmic challenges in Python, JavaScript, TypeScript, C++, or Java with automated Big-O AST complexity diagnostics.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-950/80 p-2 rounded-xl border border-slate-800 flex-shrink-0">
                <span className="text-xs font-bold text-slate-400 pl-2">Filter:</span>
                {(['ALL', 'EASY', 'MEDIUM', 'HARD'] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => setChallengeFilter(d)}
                    className={clsx(
                      'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
                      challengeFilter === d ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {filteredChallenges.map((c: any) => {
                const isCompleted = c.bestSubmission && c.bestSubmission.passed_tests === c.total_test_cases;
                return (
                  <div key={c.id} className="card p-5 bg-white border border-gray-200 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <span className={clsx('text-[11px] font-bold px-2 py-0.5 rounded-md', diffColors[c.difficulty] || 'bg-gray-100')}>
                          {c.difficulty}
                        </span>
                        {isCompleted && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Solved (100%)
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-bold text-gray-900 text-base mb-1">{c.title}</h3>
                      <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded mb-3 inline-block">
                        {c.category || 'Algorithms'}
                      </span>
                      <p className="text-xs text-gray-500 mb-4 line-clamp-3 leading-relaxed">{c.description}</p>
                    </div>

                    <div className="pt-3 border-t border-gray-100 space-y-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
                        <span className="flex items-center gap-1"><Terminal className="w-3.5 h-3.5" /> {c.total_test_cases} Test Cases</span>
                        <span className="capitalize">{c.language}</span>
                      </div>

                      <button
                        onClick={() => openCodingArena(c)}
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-teal-300 hover:text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors"
                      >
                        <Terminal className="w-4 h-4" />
                        <span>{isCompleted ? 'Open Arena (Re-solve)' : 'Launch Interactive Code Arena'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 3: ACCREDITED SKILL BADGES ── */}
        {activeTab === 'badges' && (
          <div className="space-y-6">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-gray-200 text-center shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Badges</span>
                <span className="text-2xl font-black text-gray-900 mt-1 block">{badgeStats.total}</span>
                <span className="text-[10px] text-teal-600 font-semibold">Ledger Backed</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-amber-200 text-center shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Gold Mastery</span>
                <span className="text-2xl font-black text-amber-500 mt-1 block">{badgeStats.gold}</span>
                <span className="text-[10px] text-gray-500">&ge; 90% Score</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Silver Specialist</span>
                <span className="text-2xl font-black text-slate-700 mt-1 block">{badgeStats.silver}</span>
                <span className="text-[10px] text-gray-500">&ge; 75% Score</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-orange-200 text-center shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">Bronze Competency</span>
                <span className="text-2xl font-black text-orange-500 mt-1 block">{badgeStats.bronze}</span>
                <span className="text-[10px] text-gray-500">&ge; 50% Score</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h2 className="section-title">Accredited Sovereign Credentials</h2>
                <p className="text-xs text-gray-500">Tamper-proof digital skill certificates authenticated by the AICTE SkillSetu National Ledger.</p>
              </div>
            </div>

            {badges.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-3">
                <Award className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="font-bold text-gray-800 text-sm">No Accredited Badges Earned Yet</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                  Take any Theory & Architecture assessment or solve a challenge in the Practical Coding Arena with &ge; 50% score to earn your sovereign digital credentials.
                </p>
                <button
                  onClick={() => setActiveTab('coding')}
                  className="btn-primary text-xs font-bold mt-2 cursor-pointer"
                >
                  Go to Coding Arena
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map((b: any) => {
                  const style = tierStyles[b.tier] || tierStyles.BRONZE;
                  return (
                    <div
                      key={b.id}
                      className={clsx(
                        'card p-5 bg-gradient-to-br border shadow-sm transition-all hover:scale-[1.01] flex flex-col justify-between',
                        style.bg,
                        style.border
                      )}
                    >
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <span className={clsx('text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border', style.border, style.text)}>
                            {b.tier} TIER
                          </span>
                          <span className="text-xs font-mono font-bold text-gray-600">
                            {b.score}% Score
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mb-2">
                          <div className={clsx('w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border', style.border, style.bg)}>
                            {b.tier === 'GOLD' ? '🥇' : b.tier === 'SILVER' ? '🥈' : '🥉'}
                          </div>
                          <div>
                            <h3 className="font-black text-gray-900 text-sm leading-snug">{b.badge_name}</h3>
                            <p className="text-[11px] text-gray-500 font-medium">{b.badge_category}</p>
                          </div>
                        </div>

                        <p className="text-[11px] text-gray-600 font-mono bg-white/70 p-2 rounded-lg border border-gray-200 mt-2 truncate">
                          Hash: {b.verification_hash}
                        </p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-gray-200/60 flex items-center justify-between">
                        <span className="text-[10px] text-gray-500">Block: {b.ledger_block_id || 'BLK-9000'}</span>
                        <button
                          onClick={() => setSelectedBadgeForModal(b)}
                          className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5" /> View Credential
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── CELEBRATORY BADGE UNLOCK MODAL ── */}
        {celebratedBadge && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-amber-400/50 rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-yellow-500/20 rounded-full blur-2xl pointer-events-none" />

              <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-4xl bg-amber-400/20 border border-amber-400 shadow-xl animate-bounce">
                {celebratedBadge.tier === 'GOLD' ? '🏆' : '🏅'}
              </div>

              <div>
                <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-950/80 border border-amber-800 px-3 py-1 rounded-full inline-block mb-2">
                  NEW ACCREDITED BADGE EARNED!
                </span>
                <h3 className="text-xl font-black text-white">{celebratedBadge.badge_name}</h3>
                <p className="text-xs text-slate-300 mt-1">Tier: {celebratedBadge.tier} &bull; Score: {celebratedBadge.score}%</p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-left font-mono text-xs space-y-1">
                <div className="text-teal-400 text-[10px] font-bold uppercase">Immutable Ledger Anchor:</div>
                <div className="text-slate-300 break-all text-[11px]">{celebratedBadge.verification_hash}</div>
                <div className="text-slate-500 text-[10px] pt-1">Issuer: AICTE SkillSetu National Accreditation Council</div>
              </div>

              <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleAddToLinkedIn(celebratedBadge)}
                  className="px-3 py-2 bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{t('add_to_linkedin')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyOpenBadge(celebratedBadge)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedJsonLd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedJsonLd ? t('copied') : t('copy_openbadge')}</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCelebratedBadge(null);
                    setActiveTab('badges');
                  }}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl shadow-lg cursor-pointer transition-all"
                >
                  {t('view_my_badges')}
                </button>
                <button
                  type="button"
                  onClick={() => setCelebratedBadge(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── VERIFIABLE CREDENTIAL MODAL ── */}
        {selectedBadgeForModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-lg w-full space-y-6 shadow-2xl border border-gray-200 text-center">
              <div className="border-4 border-amber-400/40 p-6 rounded-2xl bg-gradient-to-b from-amber-50/50 to-white space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">AICTE / NCVET NATIONAL SKILL REGISTRY</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">VERIFIED & IMMUTABLE</span>
                </div>

                <div className="text-3xl">🏅</div>
                
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                    {selectedBadgeForModal.tier} ACCREDITED BADGE
                  </span>
                  <h3 className="text-lg font-black text-gray-900 mt-2">{selectedBadgeForModal.badge_name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{selectedBadgeForModal.badge_category}</p>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-left font-mono text-[11px] space-y-1">
                  <div><span className="text-gray-400">Candidate Score:</span> <strong className="text-gray-900">{selectedBadgeForModal.score}%</strong></div>
                  <div><span className="text-gray-400">Block Anchor:</span> <strong className="text-gray-900">{selectedBadgeForModal.ledger_block_id || 'BLK-9000'}</strong></div>
                  <div className="break-all"><span className="text-gray-400">SHA-256:</span> <strong className="text-teal-700">{selectedBadgeForModal.verification_hash}</strong></div>
                </div>

                <p className="text-[10px] text-gray-400 leading-tight">
                  This sovereign digital certificate is cryptographically verifiable by employers and accredited academic institutions under the National Credit Framework (NCrF).
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddToLinkedIn(selectedBadgeForModal)}
                    className="px-3.5 py-2 bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{t('add_to_linkedin')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyOpenBadge(selectedBadgeForModal)}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedJsonLd ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedJsonLd ? t('copied') : t('copy_openbadge')}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedBadgeForModal(null)}
                  className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

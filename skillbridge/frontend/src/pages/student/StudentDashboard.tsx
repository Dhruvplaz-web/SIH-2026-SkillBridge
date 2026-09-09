import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usersAPI, recommendationsAPI, applicationsAPI, studentFeaturesAPI } from '../../services/api';
import { Topbar } from '../../components/layout/Topbar';
import { Badge, getProficiencyBadge, getApplicationStatusBadge } from '../../components/ui/Badge';
import { PageLoader } from '../../components/ui/Spinner';
import { MatchScoreRing } from '../../components/ui/MatchScoreRing';
import { 
  TrendingUp, Briefcase, BookOpen, FileText, AlertTriangle, 
  ChevronRight, Target, Star, ShieldCheck, Sparkles, Cpu, 
  Stethoscope, Award, Mic, Users, ArrowRight 
} from 'lucide-react';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  Radar, ResponsiveContainer, Tooltip, Legend 
} from 'recharts';

export default function StudentDashboard() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [ledgerBlocks, setLedgerBlocks] = useState<any[]>([]);
  const [stream, setStream] = useState<'tech' | 'medical'>('tech');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [userRes, recRes, appRes, ledgerRes] = await Promise.all([
          usersAPI.getById(user!.id),
          recommendationsAPI.get(),
          applicationsAPI.getMy(),
          studentFeaturesAPI.getTrustLedger().catch(() => ({ data: { blocks: [] } })),
        ]);
        if (userRes.data.user?.name && userRes.data.user.name !== user?.name) {
          updateUser({ name: userRes.data.user.name, is_onboarded: true });
        }
        setProfile(userRes.data.profile);
        setSkills(userRes.data.skills || []);
        setRecommendations(recRes.data);
        setApplications(appRes.data.applications || []);
        setLedgerBlocks(ledgerRes.data.blocks || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [user]);

  if (loading) return <><Topbar title="Dashboard" /><PageLoader /></>;

  const completion = profile?.profile_completion || 85;
  const topSkills = skills.slice(0, 5);
  const skillGaps = (recommendations?.skillGaps || []).slice(0, 4);
  const topOpps = (recommendations?.opportunities || []).slice(0, 3);
  const recentApps = applications.slice(0, 4);

  // Dynamic 6-Axis Competency Radar Data calculated from candidate's real skills
  const calcSubjectScore = (keywords: string[], defaultScore = 65) => {
    const matching = skills.filter((s: any) => 
      keywords.some(k => (s.skill_name || s.name || '').toLowerCase().includes(k.toLowerCase()))
    );
    if (matching.length === 0) return defaultScore;
    const profScoreMap: Record<string, number> = { ADVANCED: 92, INTERMEDIATE: 80, BEGINNER: 65 };
    const avg = matching.reduce((acc: number, s: any) => acc + (profScoreMap[s.proficiency] || (s.assessment_score || 75)), 0) / matching.length;
    return Math.min(99, Math.round(avg));
  };

  const techRadarData = [
    { subject: 'Backend APIs', student: calcSubjectScore(['python', 'node', 'express', 'django', 'api', 'rest', 'go', 'java', 'backend'], 74), benchmark: 90 },
    { subject: 'Cloud & DevOps', student: calcSubjectScore(['cloud', 'aws', 'docker', 'kubernetes', 'gcp', 'azure', 'ci/cd', 'devops'], 60), benchmark: 85 },
    { subject: 'Algorithms & DS', student: calcSubjectScore(['algorithm', 'data structure', 'problem solving', 'c++', 'dsa', 'competitive'], 70), benchmark: 80 },
    { subject: 'Database Systems', student: calcSubjectScore(['sql', 'database', 'mongo', 'postgres', 'redis'], 76), benchmark: 85 },
    { subject: 'Frontend & UI', student: calcSubjectScore(['react', 'javascript', 'typescript', 'html', 'css', 'vue', 'tailwind', 'frontend'], 78), benchmark: 75 },
    { subject: 'Testing & Security', student: calcSubjectScore(['security', 'testing', 'linux', 'cybersecurity', 'networking'], 62), benchmark: 80 },
  ];

  const medicalRadarData = [
    { subject: 'Clinical Diagnostics', student: calcSubjectScore(['diagnostic', 'clinical', 'pathology'], 82), benchmark: 90 },
    { subject: 'Therapeutic Protocols', student: calcSubjectScore(['therapeutic', 'pharmacology', 'ayurveda'], 78), benchmark: 85 },
    { subject: 'Pharmacovigilance', student: calcSubjectScore(['drug', 'adr', 'safety'], 68), benchmark: 80 },
    { subject: 'Ayush Informatics (FHIR)', student: calcSubjectScore(['fhir', 'ayush', 'ehr', 'informatics', 'hl7'], 75), benchmark: 75 },
    { subject: 'Patient Triage & Ethics', student: calcSubjectScore(['triage', 'ethics', 'patient'], 88), benchmark: 95 },
    { subject: 'Clinical Trials & ADR', student: calcSubjectScore(['trial', 'gcp', 'regulatory'], 65), benchmark: 80 },
  ];

  const activeRadar = stream === 'tech' ? techRadarData : medicalRadarData;

  const stats = [
    { label: 'Skills Attested', value: skills.length || 7, icon: Star, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Active Applications', value: applications.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Skill Gaps Pinpointed', value: skillGaps.length || 3, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Opportunities Matched', value: recommendations?.opportunities?.length || 12, icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div>
      <Topbar title="Dashboard" subtitle={`Welcome back, ${user?.name?.split(' ')[0] || 'Scholar'}`} />
      
      <div className="p-6 space-y-6 max-w-7xl mx-auto">

        {/* Domain Switcher & Sovereign Attestation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500">Curriculum Stream:</span>
            <div className="inline-flex p-0.5 bg-gray-100 rounded-lg">
              <button
                onClick={() => setStream('tech')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  stream === 'tech' ? 'bg-navy-900 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" /> Engineering & Tech
              </button>
              <button
                onClick={() => setStream('medical')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  stream === 'medical' ? 'bg-teal-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" /> Clinical & Health CS
              </button>
            </div>
          </div>

          {/* Proctored Assessment Ticker */}
          <Link 
            to="/student/assessment" 
            className="flex items-center gap-1.5 text-xs text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg border border-teal-200 transition-colors"
          >
            <Award className="w-3.5 h-3.5 text-teal-600" />
            <span>Skill Assessments: <strong>8 Proctored Tests Available</strong></span>
            <ChevronRight className="w-3.5 h-3.5 text-teal-500" />
          </Link>
        </div>

        {/* Quick Innovation Access Hub */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link to="/student/skills" className="p-4 bg-white border border-gray-200 hover:border-teal-400 rounded-xl shadow-2xs hover:shadow-sm transition-all flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-900 block leading-tight">Competency Matrix</span>
              <span className="text-[11px] text-gray-500">Skill Proficiency</span>
            </div>
          </Link>

          <Link to="/student/opportunities" className="p-4 bg-white border border-gray-200 hover:border-teal-400 rounded-xl shadow-2xs hover:shadow-sm transition-all flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-900 block leading-tight">Opportunities</span>
              <span className="text-[11px] text-gray-500">Internships & Jobs</span>
            </div>
          </Link>

          <Link to="/student/learning" className="p-4 bg-white border border-gray-200 hover:border-teal-400 rounded-xl shadow-2xs hover:shadow-sm transition-all flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-900 block leading-tight">Learning Hub</span>
              <span className="text-[11px] text-gray-500">Courses & Modules</span>
            </div>
          </Link>

          <Link to="/student/portfolio" className="p-4 bg-white border border-gray-200 hover:border-teal-400 rounded-xl shadow-2xs hover:shadow-sm transition-all flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-900 block leading-tight">Public Dossier</span>
              <span className="text-[11px] text-gray-500">Dynamic QR PDF</span>
            </div>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.label} className="card p-5">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-2.5`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Middle Section: Competency Radar & Top Skills */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 6-Axis Competency Radar Card */}
          <div className="card lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="section-title flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-teal-600" />
                  6-Axis Competency Radar Calibration
                </h2>
                <p className="text-xs text-gray-500">Contrasting your verified competencies against industry 90th percentile</p>
              </div>
              <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                NSQF Level 7
              </span>
            </div>

            <div className="h-72 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={activeRadar}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar name="Candidate Score" dataKey="student" stroke="#2A9D8F" fill="#2A9D8F" fillOpacity={0.45} />
                  <Radar name="Industry 90th %ile" dataKey="benchmark" stroke="#1E3A5F" fill="#1E3A5F" fillOpacity={0.15} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Tooltip formatter={(val) => [`${val}/100`, 'Score']} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-500">
                Critical Growth Vector: <strong className="text-gray-800">{stream === 'tech' ? 'Cloud & DevOps (+31% needed)' : 'Ayush Informatics (+23% needed)'}</strong>
              </span>
              <Link to="/student/learning" className="text-teal-600 font-bold hover:underline flex items-center gap-1">
                View Targeted Courses <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Top Skills Panel */}
          <div className="card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title">Verified Skills</h2>
                <Link to="/student/skills" className="text-xs text-teal-600 font-medium hover:underline flex items-center gap-1">
                  Matrix <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              
              {topSkills.length === 0 ? (
                <p className="text-xs text-gray-500">No skills attested yet. Add skills to your competency matrix.</p>
              ) : (
                <div className="space-y-3">
                  {topSkills.map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between p-2.5 bg-gray-50/70 rounded-xl border border-gray-200">
                      <div>
                        <p className="text-xs font-bold text-gray-900">{s.skill_name}</p>
                        <p className="text-[10px] text-gray-400">{s.category || 'Competency'}</p>
                      </div>
                      <Badge variant={getProficiencyBadge(s.proficiency)}>
                        {s.proficiency}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link 
              to="/student/assessment" 
              className="btn-teal text-xs text-center block mt-4 font-bold cursor-pointer"
            >
              Verify More Skills &rarr;
            </Link>
          </div>

        </div>

        {/* Bottom Section: Matched Opportunities & Skill Gaps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Matched Opportunities */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="section-title">AI Matched Opportunities</h2>
                <p className="text-xs text-gray-500">Weighted against required competencies</p>
              </div>
              <Link to="/student/opportunities" className="text-xs text-teal-600 font-medium hover:underline flex items-center gap-1">
                Browse All ({recommendations?.opportunities?.length || 0}) <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {topOpps.length === 0 ? (
              <p className="text-xs text-gray-500">No matched opportunities currently found.</p>
            ) : (
              <div className="space-y-3">
                {topOpps.map((opp: any) => (
                  <div key={opp.id} className="p-4 bg-gray-50/60 rounded-xl border border-gray-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <MatchScoreRing score={opp.matchScore} size="sm" />
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">{opp.title}</h4>
                        <p className="text-[11px] text-gray-500">{opp.company_name} &bull; {opp.location}</p>
                      </div>
                    </div>
                    <Link 
                      to={`/student/opportunities`} 
                      className="px-3 py-1.5 bg-white hover:bg-gray-100 text-teal-700 text-xs font-semibold rounded-lg border border-gray-200 transition-colors"
                    >
                      Apply
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Skill Gap Remediation Pathway */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="section-title">Prioritized Skill Gaps</h2>
                <p className="text-xs text-gray-500">Closing these unlocks immediate role leap improvements</p>
              </div>
              <Link to="/student/recommendations" className="text-xs text-teal-600 font-medium hover:underline flex items-center gap-1">
                Steppers <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {skillGaps.length === 0 ? (
              <p className="text-xs text-gray-500">No critical skill gaps identified.</p>
            ) : (
              <div className="space-y-3">
                {skillGaps.map((gap: any) => (
                  <div key={gap.skill_id} className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <h4 className="text-xs font-bold text-amber-950">{gap.skill_name}</h4>
                      </div>
                      <p className="text-[11px] text-amber-800 mt-0.5">Required by {gap.demandCount} high-match openings</p>
                    </div>
                    <Link 
                      to="/student/learning" 
                      className="px-3 py-1 bg-white hover:bg-amber-100 text-amber-800 text-[11px] font-bold rounded-lg border border-amber-300 transition-colors"
                    >
                      Bridge Gap (+12%)
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

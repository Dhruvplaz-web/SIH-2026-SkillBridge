import axios from 'axios';

const getBaseUrl = () => {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (!envUrl) return '/api';
  const cleanUrl = envUrl.replace(/\/+$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
});



// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sb_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sb_token');
      localStorage.removeItem('sb_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Auth ──────────────────────────────────────────────
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// ── Users ─────────────────────────────────────────────
export const usersAPI = {
  getAll: (params?: any) => api.get('/users', { params }),
  getById: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  updateStudentProfile: (id: string, data: any) => api.put(`/users/${id}/student-profile`, data),
  updateRecruiterProfile: (id: string, data: any) => api.put(`/users/${id}/recruiter-profile`, data),
  updateAcademicianProfile: (id: string, data: any) => api.put(`/users/${id}/academician-profile`, data),
  addProject: (data: any) => api.post('/users/portfolio/projects', data),
  updateProject: (id: string, data: any) => api.put(`/users/portfolio/projects/${id}`, data),
  deleteProject: (id: string) => api.delete(`/users/portfolio/projects/${id}`),
  addCertification: (data: any) => api.post('/users/portfolio/certifications', data),
  deleteCertification: (id: string) => api.delete(`/users/portfolio/certifications/${id}`),
};

// ── Skills ────────────────────────────────────────────
export const skillsAPI = {
  getAll: (params?: any) => api.get('/skills', { params }),
  getUserSkills: (userId?: string) => userId ? api.get(`/skills/user/${userId}`) : api.get('/skills/user'),
  addUserSkill: (data: any) => api.post('/skills/user', data),
  updateUserSkill: (skillId: string, data: any) => api.put(`/skills/user/${skillId}`, data),
  deleteUserSkill: (skillId: string) => api.delete(`/skills/user/${skillId}`),
};

// ── Assessments & Practical Coding Arena ───────────────────
export const assessmentsAPI = {
  getAll: () => api.get('/assessments'),
  getById: (id: string) => api.get(`/assessments/${id}`),
  submit: (id: string, answers: any, proctorData?: { tabSwitches?: number; integrityScore?: number; proctorStatus?: string }) => 
    api.post(`/assessments/${id}/submit`, { answers, ...proctorData }),
  getHistory: () => api.get('/assessments/history'),
  getBadges: (userId?: string) => api.get('/assessments/badges', { params: userId ? { userId } : undefined }),
  getCodingChallenges: () => api.get('/assessments/coding-challenges'),
  runCodingChallenge: (challengeId: string, code: string, language: string) =>
    api.post('/assessments/coding-challenges/run', { challengeId, code, language }),
  submitCodingChallenge: (challengeId: string, code: string, language: string, tabSwitches: number = 0) =>
    api.post('/assessments/coding-challenges/submit', { challengeId, code, language, tabSwitches }),
  getHint: (challengeId: string, hintLevel: number = 1) =>
    api.post('/assessments/coding-challenges/hint', { challengeId, hintLevel }),
};

// ── Opportunities ─────────────────────────────────────
export const opportunitiesAPI = {
  getAll: (params?: any) => api.get('/opportunities', { params }),
  getMy: () => api.get('/opportunities/my'),
  getById: (id: string) => api.get(`/opportunities/${id}`),
  create: (data: any) => api.post('/opportunities', data),
  update: (id: string, data: any) => api.put(`/opportunities/${id}`, data),
  delete: (id: string) => api.delete(`/opportunities/${id}`),
};

// ── Applications ──────────────────────────────────────
export const applicationsAPI = {
  getAll: () => api.get('/applications'),
  getMy: () => api.get('/applications/my'),
  getByOpportunity: (opportunityId: string, blind?: boolean) => api.get(`/applications/opportunity/${opportunityId}`, { params: blind ? { blind: 'true' } : undefined }),
  apply: (data: any) => api.post('/applications', data),
  updateStatus: (id: string, data: any) => api.put(`/applications/${id}/status`, data),
};

// ── Recommendations ───────────────────────────────────
export const recommendationsAPI = {
  get: () => api.get('/recommendations'),
  getSkillGaps: () => api.get('/recommendations/skill-gaps'),
  matchSkills: (data: any) => api.post('/recommendations/match-skills', data),
  getMatchedStudents: (opportunityId: string) => api.get(`/recommendations/matched-students/${opportunityId}`),
};

// ── Training ──────────────────────────────────────────
export const trainingAPI = {
  getAll: (params?: any) => api.get('/training-programs', { params }),
  getById: (id: string) => api.get(`/training-programs/${id}`),
  create: (data: any) => api.post('/training-programs', data),
  update: (id: string, data: any) => api.put(`/training-programs/${id}`, data),
  enroll: (id: string) => api.post(`/training-programs/${id}/enroll`),
  updateProgress: (enrollmentId: string, progress: number) => api.put(`/training-programs/enrollments/${enrollmentId}/progress`, { progress }),
  getEnrollments: () => api.get('/training-programs/enrollments'),
};

// ── Notifications ─────────────────────────────────────
export const notificationsAPI = {
  get: (unread?: boolean) => api.get('/notifications', { params: unread ? { unread: 'true' } : undefined }),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// ── Mentorship ────────────────────────────────────────
export const mentorshipAPI = {
  getMentors: () => api.get('/mentorship/mentors'),
  getRequests: () => api.get('/mentorship/requests'),
  request: (data: any) => api.post('/mentorship/request', data),
  updateStatus: (id: string, status: string) => api.put(`/mentorship/requests/${id}/status`, { status }),
  getCollaborations: () => api.get('/mentorship/collaborations'),
  createCollaboration: (data: any) => api.post('/mentorship/collaborations', data),
  // Chat
  getMessages: (requestId: string) => api.get(`/mentorship/requests/${requestId}/messages`),
  sendMessage: (requestId: string, message: string) => api.post(`/mentorship/requests/${requestId}/messages`, { message }),
};

// ── Analytics ─────────────────────────────────────────
export const analyticsAPI = {
  admin: () => api.get('/analytics/admin'),
  student: () => api.get('/analytics/student'),
  recruiter: () => api.get('/analytics/recruiter'),
  academician: () => api.get('/analytics/academician'),
};

// ── Blueprint Student Features API ─────────────────────
export const studentFeaturesAPI = {
  parseResume: (data: { 
    resumeText?: string; 
    fileBase64?: string;
    fileName?: string;
    mimeType?: string;
    redactPii?: boolean; 
    education?: string; 
    branch?: string; 
    institution?: string; 
    githubUrl?: string;
    candidateName?: string;
    confirmedSkills?: Array<{ name: string; category?: string; level?: string }>;
  }) => api.post('/student/onboard/parse-resume', data),
  verifyCertificate: (data: { title: string; issuer: string; issueDate?: string; credentialId?: string; fileUrl?: string }) =>
    api.post('/student/certificates/verify', data),
  getTrustLedger: (search?: string) =>
    api.get('/student/ledger', { params: search ? { search } : {} }),
  scoreAtsResume: (opportunityId: string) =>
    api.post('/student/ats-score', { opportunityId }),
  evaluateMockInterview: (data: { targetRole: string; transcript: string }) =>
    api.post('/student/mock-interview/evaluate', data),
  getTeammates: (skill?: string) =>
    api.get('/student/teams', { params: skill ? { skill } : {} }),
  createTeammateRequest: (data: { hackathonName: string; projectTitle: string; description: string; neededSkills: string }) =>
    api.post('/student/teams', data),
  getBounties: (stream?: string) =>
    api.get('/student/bounties', { params: stream ? { stream } : {} }),
};

// ── Blueprint Recruiter Features API ───────────────────
export const recruiterFeaturesAPI = {
  getSandboxes: (language?: string) =>
    api.get('/recruiter/sandboxes', { params: language ? { language } : {} }),
  runSandbox: (data: { sandboxId: string; code: string; language?: string; tabSwitches?: number; proctorScore?: number }) =>
    api.post('/recruiter/sandboxes/run', data),
  predictOffer: (data: { candidateId: string; opportunityId?: string; customStipend?: string }) =>
    api.post('/recruiter/candidates/predict-offer', data),
  mintLOI: (data: { candidateId: string; roleTitle: string; stipend: string; startDate?: string; opportunityId?: string }) =>
    api.post('/recruiter/loi/mint', data),
  getLOIs: () =>
    api.get('/recruiter/loi'),
  scheduleInterview: (data: { candidateId: string; collegeName?: string; roleTitle: string; roundType?: string; scheduledTime?: string }) =>
    api.post('/recruiter/interviews/schedule', data),
  getInterviews: () =>
    api.get('/recruiter/interviews'),
  getCodingSubmissions: (params?: any) =>
    api.get('/recruiter/coding-submissions', { params }),
  assignCodingChallenge: (data: { candidateId: string; challengeId: string; deadline?: string; message?: string }) =>
    api.post('/recruiter/coding-invites', data),
};

// ── Blueprint Academician Features API ─────────────────
export const academicianFeaturesAPI = {
  analyzeCurriculumDiff: (data: { courseTitle: string; syllabusText: string; domain?: string }) =>
    api.post('/academician/curriculum/diff', data),
  generateBoSProposal: (data: { courseTitle: string; domain?: string; department?: string; meetingRef?: string }) =>
    api.post('/academician/curriculum/bos-proposal', data),
  getCurriculumAudits: () =>
    api.get('/academician/curriculum/history'),
  getConsultancies: () =>
    api.get('/academician/consultancies'),
  submitConsultancyBid: (data: { consultancyId: string; proposalSummary: string; quotedBudget: string; durationWeeks?: number; studentSlots?: number }) =>
    api.post('/academician/consultancies/bid', data),
  getAccreditationDossier: () =>
    api.get('/academician/accreditation/dossier'),
  getGuestLectures: () =>
    api.get('/academician/guest-lectures'),
  requestGuestLecture: (data: { topic: string; speakerName: string; speakerCompany: string; speakerDesignation?: string; scheduledDate: string }) =>
    api.post('/academician/guest-lectures/request', data),
  getCapstones: () =>
    api.get('/academician/capstones'),
  registerCapstone: (data: { title: string; studentTeam: string; academicAdvisor?: string; industryMentor: string; company: string; domain?: string; repoUrl?: string }) =>
    api.post('/academician/capstones/register', data),
  endorseCapstone: (data: { capstoneId: string; facultyNotes?: string }) =>
    api.post('/academician/capstones/endorse', data),
};

// ── Blueprint Admin & Regulatory Features API ──────────
export const adminFeaturesAPI = {
  getSkillShortageForecasts: () =>
    api.get('/admin/skill-shortage/forecasts'),
  generateSkillShortageForecast: (domain: string) =>
    api.post('/admin/skill-shortage/generate', { domain }),
  getWorkforceHeatmap: () =>
    api.get('/admin/workforce/heatmap'),
  syncDigiLockerABC: (studentId?: string) =>
    api.post('/admin/digilocker/sync', { studentId }),
  getFraudAudits: () =>
    api.get('/admin/fraud/audits'),
  blacklistJob: (opportunityId: string) =>
    api.post('/admin/fraud/blacklist', { opportunityId }),
  getNodeStatus: () =>
    api.get('/admin/ledger/node-status'),
};



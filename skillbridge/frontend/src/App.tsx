import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MobileNavProvider } from './context/MobileNavContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { PageLoader } from './components/ui/Spinner';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student
import StudentDashboard from './pages/student/StudentDashboard';
import MySkills from './pages/student/MySkills';
import Recommendations from './pages/student/Recommendations';
import Opportunities from './pages/student/Opportunities';
import Applications from './pages/student/Applications';
import Learning from './pages/student/Learning';
import Portfolio from './pages/student/Portfolio';
import StudentMentorship from './pages/student/Mentorship';
import StudentAnalytics from './pages/student/StudentAnalytics';
import OnboardingWizard from './pages/student/OnboardingWizard';
import SkillAssessment from './pages/student/SkillAssessment';
import MockInterview from './pages/student/MockInterview';
import Teammates from './pages/student/Teammates';
import TrustLedger from './pages/student/TrustLedger';

// Recruiter
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import PostOpportunity from './pages/recruiter/PostOpportunity';
import RecruiterOpportunities from './pages/recruiter/RecruiterOpportunities';
import InterviewScheduler from './pages/recruiter/InterviewScheduler';
import CodingSandbox from './pages/recruiter/CodingSandbox';

// Academician
import AcademicianDashboard from './pages/academician/AcademicianDashboard';
import AcademicianMentorship from './pages/academician/AcademicianMentorship';
import AcademicianTraining from './pages/academician/AcademicianTraining';
import CorporateExchange from './pages/academician/CorporateExchange';
import CurriculumHarmonizer from './pages/academician/CurriculumHarmonizer';
import AccreditationDossier from './pages/academician/AccreditationDossier';
import CapstoneHub from './pages/academician/CapstoneHub';
import GuestLectures from './pages/academician/GuestLectures';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import WorkforceHeatmap from './pages/admin/WorkforceHeatmap';
import SkillShortageWarning from './pages/admin/SkillShortageWarning';
import FraudDetector from './pages/admin/FraudDetector';
import DigiLockerGateway from './pages/admin/DigiLockerGateway';
import LedgerMonitor from './pages/admin/LedgerMonitor';


// Public
import LandingPage from './pages/public/LandingPage';

// Shared
import Notifications from './pages/shared/Notifications';
import NotFound from './pages/shared/NotFound';
import { PageMetaTracker } from './hooks/usePageMeta';

function RootRedirect() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  const paths: Record<string, string> = {
    STUDENT: '/student', RECRUITER: '/recruiter', ACADEMICIAN: '/academician', ADMIN: '/admin',
  };
  return <Navigate to={paths[user.role] || '/login'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <MobileNavProvider>
        <BrowserRouter>
          <PageMetaTracker />
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<LandingPage />} />
          <Route path="/portal" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/portfolio/:id" element={<Portfolio />} />

          {/* Student routes */}
          <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
            <Route element={<AppLayout />}>
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/student/skills" element={<MySkills />} />
              <Route path="/student/recommendations" element={<Recommendations />} />
              <Route path="/student/opportunities" element={<Opportunities />} />
              <Route path="/student/applications" element={<Applications />} />
              <Route path="/student/learning" element={<Learning />} />
              <Route path="/student/assessment" element={<SkillAssessment />} />
              <Route path="/student/interview" element={<MockInterview />} />
              <Route path="/student/teammates" element={<Teammates />} />
              <Route path="/student/ledger" element={<TrustLedger />} />
              <Route path="/student/portfolio" element={<Portfolio />} />
              <Route path="/student/onboarding" element={<OnboardingWizard />} />
              <Route path="/student/mentorship" element={<StudentMentorship />} />
              <Route path="/student/analytics" element={<StudentAnalytics />} />
              <Route path="/student/notifications" element={<Notifications />} />
            </Route>
          </Route>

          {/* Recruiter routes */}
          <Route element={<ProtectedRoute allowedRoles={['RECRUITER']} />}>
            <Route element={<AppLayout />}>
              <Route path="/recruiter" element={<RecruiterDashboard />} />
              <Route path="/recruiter/applications" element={<RecruiterOpportunities />} />
              <Route path="/recruiter/sandbox" element={<CodingSandbox />} />
              <Route path="/recruiter/interviews" element={<InterviewScheduler />} />
              <Route path="/recruiter/post" element={<PostOpportunity />} />
              <Route path="/recruiter/opportunities" element={<Navigate to="/recruiter/applications" replace />} />
              <Route path="/recruiter/candidates" element={<Navigate to="/recruiter/applications" replace />} />
              <Route path="/recruiter/mentorship" element={<AcademicianMentorship />} />
              <Route path="/recruiter/analytics" element={<StudentAnalytics />} />
              <Route path="/recruiter/notifications" element={<Notifications />} />
            </Route>
          </Route>

          {/* Academician routes */}
          <Route element={<ProtectedRoute allowedRoles={['ACADEMICIAN']} />}>
            <Route element={<AppLayout />}>
              <Route path="/academician" element={<AcademicianDashboard />} />
              <Route path="/academician/harmonizer" element={<CurriculumHarmonizer />} />
              <Route path="/academician/accreditation" element={<AccreditationDossier />} />
              <Route path="/academician/capstone" element={<CapstoneHub />} />
              <Route path="/academician/guest-lectures" element={<GuestLectures />} />
              <Route path="/academician/consultancies" element={<CorporateExchange />} />
              <Route path="/academician/students" element={<AdminUsers />} />
              <Route path="/academician/training" element={<AcademicianTraining />} />
              <Route path="/academician/mentorship" element={<AcademicianMentorship />} />
              <Route path="/academician/collaborations" element={<AcademicianMentorship />} />
              <Route path="/academician/analytics" element={<StudentAnalytics />} />
              <Route path="/academician/notifications" element={<Notifications />} />
            </Route>
          </Route>

          {/* Admin routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route element={<AppLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/heatmap" element={<WorkforceHeatmap />} />
              <Route path="/admin/shortages" element={<SkillShortageWarning />} />
              <Route path="/admin/fraud" element={<FraudDetector />} />
              <Route path="/admin/digilocker" element={<DigiLockerGateway />} />
              <Route path="/admin/ledger" element={<LedgerMonitor />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/opportunities" element={<RecruiterOpportunities />} />
              <Route path="/admin/applications" element={<Applications />} />
              <Route path="/admin/training" element={<AcademicianTraining />} />
              <Route path="/admin/skills" element={<MySkills />} />
              <Route path="/admin/analytics" element={<AdminDashboard />} />
              <Route path="/admin/notifications" element={<Notifications />} />
            </Route>
          </Route>

          {/* Catch all / 404 */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </MobileNavProvider>
    </AuthProvider>
  );
}

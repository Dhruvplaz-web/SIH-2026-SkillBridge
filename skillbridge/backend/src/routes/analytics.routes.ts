import { Router } from 'express';
import { getAdminAnalytics, getStudentAnalytics, getRecruiterAnalytics, getAcademicianAnalytics } from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/admin', authenticate, authorize('ADMIN'), getAdminAnalytics);
router.get('/student', authenticate, authorize('STUDENT'), getStudentAnalytics);
router.get('/recruiter', authenticate, authorize('RECRUITER'), getRecruiterAnalytics);
router.get('/academician', authenticate, authorize('ACADEMICIAN'), getAcademicianAnalytics);

export default router;

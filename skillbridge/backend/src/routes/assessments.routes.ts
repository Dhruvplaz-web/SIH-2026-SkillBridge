import { Router } from 'express';
import { getAssessments, getAssessmentById, submitAssessment, getAssessmentHistory } from '../controllers/assessments.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAssessments);
router.get('/history', authenticate, authorize('STUDENT'), getAssessmentHistory);
router.get('/:id', authenticate, getAssessmentById);
router.post('/:id/submit', authenticate, authorize('STUDENT'), submitAssessment);

export default router;

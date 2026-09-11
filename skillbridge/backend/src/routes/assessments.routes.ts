import { Router } from 'express';
import {
  getAssessments,
  getAssessmentById,
  submitAssessment,
  getAssessmentHistory,
  getUserBadges,
  getCodingChallenges,
  runCodingChallenge,
  submitCodingChallenge,
  getCodingChallengeHint,
} from '../controllers/assessments.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAssessments);
router.get('/history', authenticate, authorize('STUDENT'), getAssessmentHistory);
router.get('/badges', authenticate, getUserBadges);
router.get('/coding-challenges', authenticate, getCodingChallenges);
router.post('/coding-challenges/run', authenticate, runCodingChallenge);
router.post('/coding-challenges/submit', authenticate, authorize('STUDENT'), submitCodingChallenge);
router.post('/coding-challenges/hint', authenticate, getCodingChallengeHint);
router.get('/:id', authenticate, getAssessmentById);
router.post('/:id/submit', authenticate, authorize('STUDENT'), submitAssessment);

export default router;

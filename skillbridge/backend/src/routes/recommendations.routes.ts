import { Router } from 'express';
import { getRecommendations, getSkillGaps, matchSkills, getMatchedStudents } from '../controllers/recommendations.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize('STUDENT'), getRecommendations);
router.get('/skill-gaps', authenticate, authorize('STUDENT'), getSkillGaps);
router.post('/match-skills', authenticate, matchSkills);
router.get('/matched-students/:opportunityId', authenticate, authorize('RECRUITER', 'ADMIN'), getMatchedStudents);

export default router;

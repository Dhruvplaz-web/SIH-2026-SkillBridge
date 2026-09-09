import { Router } from 'express';
import { getOpportunities, getOpportunityById, createOpportunity, updateOpportunity, deleteOpportunity, getRecruiterOpportunities } from '../controllers/opportunities.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', getOpportunities);
router.get('/my', authenticate, authorize('RECRUITER'), getRecruiterOpportunities);
router.get('/:id', getOpportunityById);
router.post('/', authenticate, authorize('RECRUITER', 'ADMIN'), createOpportunity);
router.put('/:id', authenticate, authorize('RECRUITER', 'ADMIN'), updateOpportunity);
router.delete('/:id', authenticate, authorize('RECRUITER', 'ADMIN'), deleteOpportunity);

export default router;

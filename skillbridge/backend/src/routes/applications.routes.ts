import { Router } from 'express';
import { applyForOpportunity, getStudentApplications, getOpportunityApplications, updateApplicationStatus, getAllApplications } from '../controllers/applications.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize('ADMIN'), getAllApplications);
router.get('/my', authenticate, authorize('STUDENT'), getStudentApplications);
router.get('/opportunity/:opportunityId', authenticate, authorize('RECRUITER', 'ADMIN'), getOpportunityApplications);
router.post('/', authenticate, authorize('STUDENT'), applyForOpportunity);
router.put('/:id/status', authenticate, authorize('RECRUITER', 'ADMIN'), updateApplicationStatus);

export default router;

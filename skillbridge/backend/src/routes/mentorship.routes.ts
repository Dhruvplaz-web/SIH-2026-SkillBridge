import { Router } from 'express';
import {
  requestMentorship,
  getMyMentorshipRequests,
  updateMentorshipStatus,
  getMentors,
  getCollaborations,
  createCollaboration,
  getMessages,
  sendMessage,
} from '../controllers/mentorship.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/mentors', authenticate, getMentors);
router.get('/requests', authenticate, getMyMentorshipRequests);
router.post('/request', authenticate, authorize('STUDENT'), requestMentorship);
router.put('/requests/:id/status', authenticate, updateMentorshipStatus);
router.get('/collaborations', authenticate, getCollaborations);
router.post('/collaborations', authenticate, authorize('ACADEMICIAN', 'RECRUITER', 'ADMIN'), createCollaboration);

// Two-way chat
router.get('/requests/:requestId/messages', authenticate, getMessages);
router.post('/requests/:requestId/messages', authenticate, sendMessage);

export default router;

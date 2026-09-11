import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getCodingSandboxes,
  runCodingSandbox,
  predictCandidateOffer,
  mintLetterOfIntent,
  getLettersOfIntent,
  scheduleCampusInterview,
  getCampusInterviews,
  getCandidateCodingSubmissions,
  assignCodingChallengeToCandidate,
} from '../controllers/recruiterFeatures.controller';

const router = Router();
router.use(authenticate);

// 1. In-Browser Coding Sandbox
router.get('/sandboxes', getCodingSandboxes);
router.post('/sandboxes/run', runCodingSandbox);

// 2. Predictive Candidate Offer Acceptance & Retention Index
router.post('/candidates/predict-offer', predictCandidateOffer);

// 3. Tamperproof Smart-Contract LOI Minting
router.post('/loi/mint', mintLetterOfIntent);
router.get('/loi', getLettersOfIntent);

// 4. Automated Campus Interview Auto-Scheduler
router.post('/interviews/schedule', scheduleCampusInterview);
router.get('/interviews', getCampusInterviews);

// 5. Candidate Coding Submissions & Assessment Assignments
router.get('/coding-submissions', getCandidateCodingSubmissions);
router.post('/coding-invites', assignCodingChallengeToCandidate);

export default router;

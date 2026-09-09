import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { aiRateLimiter } from '../middleware/security';
import {
  parseResumeAndSynthesize,
  verifyCertificate,
  getTrustLedger,
  scoreAtsResume,
  evaluateMockInterview,
  getTeammates,
  createTeammateRequest,
  getBounties
} from '../controllers/studentFeatures.controller';

const router = Router();

// All student feature routes require authentication
router.use(authenticate);

// 1. Resume Ingestion & Synthesis Wizard (AI-backed)
router.post('/onboard/parse-resume', aiRateLimiter, parseResumeAndSynthesize);

// 2. Certificate Credibility & Verification (AI-backed)
router.post('/certificates/verify', aiRateLimiter, verifyCertificate);

// 3. Sovereign TrustLedger Block Explorer
router.get('/ledger', getTrustLedger);

// 4. Dynamic ATS Resume Scorer (AI-backed)
router.post('/ats-score', aiRateLimiter, scoreAtsResume);

// 5. AI Voice Mock Technical Interview Evaluator (AI-backed)
router.post('/mock-interview/evaluate', aiRateLimiter, evaluateMockInterview);

// 6. Hackathon Teammate Matcher
router.get('/teams', getTeammates);
router.post('/teams', createTeammateRequest);

// 7. Micro-Internship Bounties
router.get('/bounties', getBounties);

export default router;

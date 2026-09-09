import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getSkillShortageForecasts,
  generateSkillShortageForecast,
  getWorkforceHeatmap,
  syncDigiLockerABC,
  getJobFraudAudits,
  blacklistJobPosting,
  getTrustLedgerNodeStatus
} from '../controllers/adminFeatures.controller';

const router = Router();
router.use(authenticate);

// 1. Predictive National Skill-Shortage Early Warning System
router.get('/skill-shortage/forecasts', getSkillShortageForecasts);
router.post('/skill-shortage/generate', generateSkillShortageForecast);

// 2. National Workforce Heatmap & Skilling Grants
router.get('/workforce/heatmap', getWorkforceHeatmap);

// 3. Academic Bank of Credits (ABC) & DigiLocker Gateway
router.post('/digilocker/sync', syncDigiLockerABC);

// 4. Fraudulent Job Posting & Scam Recruiter Detector
router.get('/fraud/audits', getJobFraudAudits);
router.post('/fraud/blacklist', blacklistJobPosting);

// 5. TrustLedger Node Monitor & Regulatory Telemetry
router.get('/ledger/node-status', getTrustLedgerNodeStatus);

export default router;

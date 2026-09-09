import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  analyzeCurriculumDiff,
  getCurriculumAudits,
  getCorporateConsultancies,
  submitConsultancyBid,
  getAccreditationDossier,
  getGuestLectures,
  requestGuestLecture,
  getCapstoneProjects,
  endorseCapstoneProject
} from '../controllers/academicianFeatures.controller';

const router = Router();
router.use(authenticate);

// 1. AI Curriculum Diff Engine (Syllabus Re-Harmonizer)
router.post('/curriculum/diff', analyzeCurriculumDiff);
router.get('/curriculum/history', getCurriculumAudits);

// 2. Corporate Consultancy & Sponsored R&D Exchange
router.get('/consultancies', getCorporateConsultancies);
router.post('/consultancies/bid', submitConsultancyBid);

// 3. One-Click NAAC / NBA Accreditation Dossier Generator
router.get('/accreditation/dossier', getAccreditationDossier);

// 4. Industry Guest Lecture & Workshop Scheduling Portal
router.get('/guest-lectures', getGuestLectures);
router.post('/guest-lectures/request', requestGuestLecture);

// 5. Collaborative Capstone Co-Mentorship Hub
router.get('/capstones', getCapstoneProjects);
router.post('/capstones/endorse', endorseCapstoneProject);

export default router;

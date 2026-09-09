import { Router } from 'express';
import { uploadResume } from '../controllers/upload.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/resume', authenticate, authorize('STUDENT'), uploadResume);

export default router;

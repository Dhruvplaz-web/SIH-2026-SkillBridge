import { Router } from 'express';
import { getTrainingPrograms, getTrainingProgramById, createTrainingProgram, updateTrainingProgram, enrollInProgram, updateEnrollmentProgress, getStudentEnrollments } from '../controllers/training.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', getTrainingPrograms);
router.get('/enrollments', authenticate, authorize('STUDENT'), getStudentEnrollments);
router.get('/:id', getTrainingProgramById);
router.post('/', authenticate, authorize('ACADEMICIAN', 'ADMIN'), createTrainingProgram);
router.put('/:id', authenticate, authorize('ACADEMICIAN', 'ADMIN'), updateTrainingProgram);
router.post('/:id/enroll', authenticate, authorize('STUDENT'), enrollInProgram);
router.put('/enrollments/:id/progress', authenticate, authorize('STUDENT'), updateEnrollmentProgress);

export default router;

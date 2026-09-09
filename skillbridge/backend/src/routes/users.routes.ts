import { Router } from 'express';
import { getUsers, getUserById, updateUser, updateStudentProfile, updateRecruiterProfile, updateAcademicianProfile, addProject, updateProject, deleteProject, addCertification, deleteCertification } from '../controllers/users.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize('ADMIN', 'ACADEMICIAN'), getUsers);
router.get('/:id', authenticate, getUserById);
router.put('/:id', authenticate, updateUser);
router.put('/:id/student-profile', authenticate, authorize('STUDENT'), updateStudentProfile);
router.put('/:id/recruiter-profile', authenticate, authorize('RECRUITER'), updateRecruiterProfile);
router.put('/:id/academician-profile', authenticate, authorize('ACADEMICIAN'), updateAcademicianProfile);

// Portfolio
router.post('/portfolio/projects', authenticate, authorize('STUDENT'), addProject);
router.put('/portfolio/projects/:projectId', authenticate, authorize('STUDENT'), updateProject);
router.delete('/portfolio/projects/:projectId', authenticate, authorize('STUDENT'), deleteProject);
router.post('/portfolio/certifications', authenticate, authorize('STUDENT'), addCertification);
router.delete('/portfolio/certifications/:certId', authenticate, authorize('STUDENT'), deleteCertification);

export default router;

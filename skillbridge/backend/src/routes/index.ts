import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './users.routes';
import skillRoutes from './skills.routes';
import assessmentRoutes from './assessments.routes';
import opportunityRoutes from './opportunities.routes';
import applicationRoutes from './applications.routes';
import recommendationRoutes from './recommendations.routes';
import trainingRoutes from './training.routes';
import notificationRoutes from './notifications.routes';
import mentorshipRoutes from './mentorship.routes';
import analyticsRoutes from './analytics.routes';
import uploadRoutes from './upload.routes';
import studentRoutes from './student.routes';
import recruiterRoutes from './recruiter.routes';
import academicianRoutes from './academician.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/skills', skillRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/opportunities', opportunityRoutes);
router.use('/applications', applicationRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/training-programs', trainingRoutes);
router.use('/notifications', notificationRoutes);
router.use('/mentorship', mentorshipRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/upload', uploadRoutes);
router.use('/student', studentRoutes);
router.use('/recruiter', recruiterRoutes);
router.use('/academician', academicianRoutes);
router.use('/admin', adminRoutes);

export default router;

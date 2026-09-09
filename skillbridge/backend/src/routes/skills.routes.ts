import { Router } from 'express';
import { getSkills, getUserSkills, addUserSkill, updateUserSkill, deleteUserSkill, createSkill } from '../controllers/skills.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', getSkills);
router.post('/', authenticate, authorize('ADMIN'), createSkill);
router.get('/user', authenticate, getUserSkills);
router.get('/user/:userId', authenticate, getUserSkills);
router.post('/user', authenticate, addUserSkill);
router.put('/user/:skillId', authenticate, updateUserSkill);
router.delete('/user/:skillId', authenticate, deleteUserSkill);

export default router;

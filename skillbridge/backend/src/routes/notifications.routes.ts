import { Router } from 'express';
import { getNotifications, markNotificationRead, markAllRead } from '../controllers/notifications.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getNotifications);
router.put('/read-all', authenticate, markAllRead);
router.put('/:id/read', authenticate, markNotificationRead);

export default router;

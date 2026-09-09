import { Response } from 'express';
import { db } from '../database/db';
import { AuthRequest } from '../middleware/auth';
import { cuid } from '../utils/helpers';

export async function getNotifications(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { unread } = req.query;

    let sql = 'SELECT * FROM notifications WHERE user_id = ?';
    const args: any[] = [userId];

    if (unread === 'true') {
      sql += ' AND is_read = 0';
    }

    sql += ' ORDER BY created_at DESC LIMIT 50';

    const result = await db.execute({ sql, args });
    const unreadCount = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      args: [userId],
    });

    return res.json({
      notifications: result.rows,
      unreadCount: (unreadCount.rows[0] as any).count,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get notifications' });
  }
}

export async function markNotificationRead(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    await db.execute({
      sql: 'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      args: [id, userId],
    });

    return res.json({ message: 'Notification marked as read' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update notification' });
  }
}

export async function markAllRead(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;

    await db.execute({
      sql: 'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
      args: [userId],
    });

    return res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update notifications' });
  }
}

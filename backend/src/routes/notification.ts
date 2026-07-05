import { Router, Response } from 'express';
import { db } from '../db';
import { notifications } from '../db/schema';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';
import { eq, desc, and } from 'drizzle-orm';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const list = await db.select().from(notifications)
      .where(eq(notifications.userId, req.user!.userId))
      .orderBy(desc(notifications.createdAt)).limit(50);
    res.json({ success: true, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/mark-read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { notificationIds } = req.body;
    if (notificationIds?.length) {
      for (const id of notificationIds) {
        await db.update(notifications).set({ isRead: true })
          .where(and(eq(notifications.id, id), eq(notifications.userId, req.user!.userId)));
      }
    } else {
      await db.update(notifications).set({ isRead: true })
        .where(eq(notifications.userId, req.user!.userId));
    }
    res.json({ success: true, message: 'Notifications marked as read' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

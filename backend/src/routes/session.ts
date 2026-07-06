import { Router, Response } from 'express';
import { db } from '../db';
import { sessions } from '../db/schema';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';
import { eq, and, desc } from 'drizzle-orm';

const router = Router();

router.get('/list', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userSessions = await db.select().from(sessions)
      .where(eq(sessions.userId, req.user!.userId))
      .orderBy(desc(sessions.createdAt));
    res.json({ success: true, data: userSessions });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/revoke', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.body;
    await db.delete(sessions).where(and(eq(sessions.id, sessionId), eq(sessions.userId, req.user!.userId)));
    res.json({ success: true, message: 'Session revoked' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/revoke-all', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await db.delete(sessions).where(eq(sessions.userId, req.user!.userId));
    res.json({ success: true, message: 'All sessions revoked' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

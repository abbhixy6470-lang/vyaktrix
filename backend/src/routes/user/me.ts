import { Router, Response } from 'express';
import { db } from '../../db';
import { users } from '../../db/schema';
import { authenticate } from '../../middleware/auth';
import { AuthRequest } from '../../types';
import { eq } from 'drizzle-orm';

const router = Router();

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.user!.userId)).limit(1);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    const { passwordHash, ...safeUser } = user;
    res.json({ success: true, data: safeUser });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

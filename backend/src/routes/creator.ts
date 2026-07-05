import { Router, Response } from 'express';
import { db } from '../db';
import { creatorSubscriptions, tips } from '../db/schema';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';
import { eq, and, desc } from 'drizzle-orm';

const router = Router();

router.post('/subscribe', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { creatorId, tier, price } = req.body;
    const existing = await db.select().from(creatorSubscriptions)
      .where(and(eq(creatorSubscriptions.subscriberId, req.user!.userId), eq(creatorSubscriptions.creatorId, creatorId))).limit(1);
    if (existing.length) {
      await db.update(creatorSubscriptions).set({ tier, price, isActive: true })
        .where(eq(creatorSubscriptions.id, existing[0].id));
      res.json({ success: true, message: 'Subscription updated' });
    } else {
      const expiresAt = new Date(Date.now() + 30 * 24 * 3600000);
      await db.insert(creatorSubscriptions).values({
        subscriberId: req.user!.userId, creatorId, tier, price, expiresAt,
      });
      res.status(201).json({ success: true, message: 'Subscribed' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/unsubscribe/:creatorId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await db.update(creatorSubscriptions).set({ isActive: false })
      .where(and(eq(creatorSubscriptions.subscriberId, req.user!.userId), eq(creatorSubscriptions.creatorId, req.params.creatorId)));
    res.json({ success: true, message: 'Unsubscribed' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/subscribers', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const subscribers = await db.select().from(creatorSubscriptions)
      .where(and(eq(creatorSubscriptions.creatorId, req.user!.userId), eq(creatorSubscriptions.isActive, true)));
    res.json({ success: true, data: subscribers });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/subscriptions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const subscriptions = await db.select().from(creatorSubscriptions)
      .where(and(eq(creatorSubscriptions.subscriberId, req.user!.userId), eq(creatorSubscriptions.isActive, true)));
    res.json({ success: true, data: subscriptions });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/tip', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { receiverId, amount, currency, message } = req.body;
    const [tip] = await db.insert(tips).values({
      senderId: req.user!.userId, receiverId, amount, currency: currency || 'USD', message,
    }).returning();
    res.status(201).json({ success: true, data: tip });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

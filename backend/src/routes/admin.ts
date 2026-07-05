import { Router, Response } from 'express';
import { db } from '../db';
import { users, tweets, reports, contentClassification, userReputation } from '../db/schema';
import { authenticate, requireAdmin } from '../middleware/auth';
import { AuthRequest } from '../types';
import { eq, desc, and, sql } from 'drizzle-orm';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/reports', async (req: AuthRequest, res: Response) => {
  try {
    const allReports = await db.select().from(reports)
      .where(eq(reports.status, 'pending'))
      .orderBy(desc(reports.createdAt)).limit(50);
    res.json({ success: true, data: allReports });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/action', async (req: AuthRequest, res: Response) => {
  try {
    const { reportId, action, targetUserId, targetTweetId, reason } = req.body;
    if (reportId) {
      await db.update(reports).set({ status: action === 'dismiss' ? 'dismissed' : 'resolved', resolvedBy: req.user!.userId, resolvedAt: new Date() })
        .where(eq(reports.id, reportId));
    }
    if (action === 'suspend' && targetUserId) {
      await db.update(users).set({ deactivated: true }).where(eq(users.id, targetUserId));
    }
    if (action === 'delete_tweet' && targetTweetId) {
      await db.update(tweets).set({ isDeleted: true }).where(eq(tweets.id, targetTweetId));
    }
    if (action === 'shadowban' && targetUserId) {
      await db.update(users).set({ role: 'shadowbanned' }).where(eq(users.id, targetUserId));
    }
    res.json({ success: true, message: `Action '${action}' completed` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/analytics', async (req: AuthRequest, res: Response) => {
  try {
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [tweetCount] = await db.select({ count: sql<number>`count(*)` }).from(tweets).where(eq(tweets.isDeleted, false));
    const [reportCount] = await db.select({ count: sql<number>`count(*)` }).from(reports).where(eq(reports.status, 'pending'));
    const [activeUsers] = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.deactivated, false));
    res.json({ success: true, data: { users: userCount.count, tweets: tweetCount.count, pendingReports: reportCount.count, activeUsers: activeUsers.count } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt)).limit(50);
    res.json({ success: true, data: allUsers });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/tweets', async (req: AuthRequest, res: Response) => {
  try {
    const allTweets = await db.select().from(tweets).orderBy(desc(tweets.createdAt)).limit(50);
    res.json({ success: true, data: allTweets });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/content-flags', async (req: AuthRequest, res: Response) => {
  try {
    const flags = await db.select().from(contentClassification)
      .orderBy(desc(contentClassification.createdAt)).limit(50);
    res.json({ success: true, data: flags });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/spam', async (req: AuthRequest, res: Response) => {
  try {
    const spamUsers = await db.select().from(userReputation)
      .orderBy(desc(userReputation.spamScore)).limit(20);
    res.json({ success: true, data: spamUsers });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

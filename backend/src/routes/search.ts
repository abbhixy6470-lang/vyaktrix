import { Router, Response } from 'express';
import { db } from '../db';
import { users, tweets, trends } from '../db/schema';
import { optionalAuth } from '../middleware/auth';
import { AuthRequest } from '../types';
import { eq, and, like, or, desc, sql } from 'drizzle-orm';

const router = Router();

router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const q = req.query.q as string;
    if (!q) {
      res.json({ success: true, data: [] });
      return;
    }
    const results = await db.select({
      id: users.id, username: users.username, displayName: users.displayName,
      avatar: users.avatar, bio: users.bio, verified: users.verified,
    }).from(users).where(and(
      or(like(users.username, `%${q}%`), like(users.displayName, `%${q}%`)),
      eq(users.deactivated, false),
    )).limit(20);
    res.json({ success: true, data: results });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/tweets', async (req: AuthRequest, res: Response) => {
  try {
    const q = req.query.q as string;
    if (!q) {
      res.json({ success: true, data: [] });
      return;
    }
    const results = await db.select().from(tweets)
      .where(and(like(tweets.content, `%${q}%`), eq(tweets.isDeleted, false)))
      .orderBy(desc(tweets.createdAt)).limit(20);
    res.json({ success: true, data: results });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/hashtags', async (req: AuthRequest, res: Response) => {
  try {
    const q = req.query.q as string;
    if (!q) {
      const top = await db.select().from(trends).orderBy(desc(trends.tweetCount)).limit(10);
      res.json({ success: true, data: top });
      return;
    }
    const results = await db.select().from(trends)
      .where(like(trends.hashtag, `%${q}%`))
      .orderBy(desc(trends.tweetCount)).limit(10);
    res.json({ success: true, data: results });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/trends', async (req: AuthRequest, res: Response) => {
  try {
    const top = await db.select().from(trends).orderBy(desc(trends.tweetCount)).limit(20);
    res.json({ success: true, data: top });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/autocomplete', async (req: AuthRequest, res: Response) => {
  try {
    const q = req.query.q as string;
    if (!q || q.length < 1) {
      res.json({ success: true, data: [] });
      return;
    }
    const userResults = await db.select({ id: users.id, username: users.username, displayName: users.displayName, avatar: users.avatar })
      .from(users).where(and(like(users.username, `%${q}%`), eq(users.deactivated, false))).limit(5);
    const hashtagResults = await db.select({ hashtag: trends.hashtag, tweetCount: trends.tweetCount })
      .from(trends).where(like(trends.hashtag, `%${q}%`)).limit(5);
    res.json({ success: true, data: { users: userResults, hashtags: hashtagResults } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

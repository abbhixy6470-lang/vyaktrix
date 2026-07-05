import { Router, Response } from 'express';
import { db } from '../db';
import { geoTags, tweets } from '../db/schema';
import { authenticate, optionalAuth } from '../middleware/auth';
import { AuthRequest } from '../types';
import { eq, and, desc, sql } from 'drizzle-orm';

const router = Router();

router.post('/tag', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { tweetId, latitude, longitude, placeName, country } = req.body;
    const [tag] = await db.insert(geoTags).values({
      tweetId, latitude, longitude, placeName, country,
    }).returning();
    res.status(201).json({ success: true, data: tag });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/trends/:location', async (req: AuthRequest, res: Response) => {
  try {
    const localTweets = await db.select()
      .from(geoTags)
      .where(sql`LOWER(${geoTags.placeName}) LIKE ${`%${req.params.location.toLowerCase()}%`}`)
      .innerJoin(tweets, eq(tweets.id, geoTags.tweetId))
      .orderBy(desc(tweets.likeCount))
      .limit(20);
    res.json({ success: true, data: localTweets });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/nearby', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { lat, lng, radius = '10' } = req.query;
    const nearby = await db.select()
      .from(geoTags)
      .where(sql`ABS(CAST(${geoTags.latitude} AS FLOAT) - ${parseFloat(lat as string)}) < ${parseFloat(radius as string) / 111.32}`)
      .innerJoin(tweets, eq(tweets.id, geoTags.tweetId))
      .orderBy(desc(tweets.createdAt))
      .limit(20);
    res.json({ success: true, data: nearby });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

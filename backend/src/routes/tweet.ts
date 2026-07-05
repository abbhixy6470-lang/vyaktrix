import { Router, Response } from 'express';
import { db } from '../db';
import { tweets, tweetMedia, likes, bookmarks, retweets, polls, pollVotes, notifications, trends, geoTags, contentClassification } from '../db/schema';
import { authenticate, optionalAuth } from '../middleware/auth';
import { AuthRequest } from '../types';
import { eq, and, or, desc, sql, inArray, lt, gte, isNull } from 'drizzle-orm';
import { extractHashtags, extractMentions } from '../utils/helpers';

const router = Router();

router.post('/create', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { content, replyToId, isDraft, sensitive, media, poll, geo } = req.body;
    const hashtags = content ? extractHashtags(content) : [];
    const mentions = content ? extractMentions(content) : [];
    const [tweet] = await db.insert(tweets).values({
      authorId: req.user!.userId, content, replyToId, isDraft: isDraft || false,
      sensitive: sensitive || false, hashtags, mentions,
    }).returning();
    if (media?.length) {
      await db.insert(tweetMedia).values(media.map((m: any) => ({ ...m, tweetId: tweet.id })));
    }
    if (poll) {
      await db.insert(polls).values({
        tweetId: tweet.id, options: poll.options,
        expiresAt: new Date(Date.now() + (poll.durationHours || 24) * 3600000),
      });
    }
    if (geo) {
      await db.insert(geoTags).values({ tweetId: tweet.id, ...geo });
    }
    for (const tag of hashtags) {
      const existing = await db.select().from(trends).where(eq(trends.hashtag, tag.slice(1))).limit(1);
      if (existing.length) {
        await db.update(trends).set({ tweetCount: sql`${trends.tweetCount} + 1`, lastUsed: new Date() })
          .where(eq(trends.id, existing[0].id));
      } else {
        await db.insert(trends).values({ hashtag: tag.slice(1), tweetCount: 1 });
      }
    }
    await db.update(users).set({ tweetCount: sql`${users.tweetCount} + 1` }).where(eq(users.id, req.user!.userId));
    res.status(201).json({ success: true, data: tweet });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/edit/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { content, sensitive } = req.body;
    const [tweet] = await db.select().from(tweets).where(eq(tweets.id, req.params.id)).limit(1);
    if (!tweet || tweet.authorId !== req.user!.userId) {
      res.status(403).json({ success: false, error: 'Not authorized' });
      return;
    }
    const hashtags = content ? extractHashtags(content) : [];
    const mentions = content ? extractMentions(content) : [];
    const [updated] = await db.update(tweets).set({
      content, hashtags, mentions, sensitive, isEdited: true, updatedAt: new Date(),
    }).where(eq(tweets.id, req.params.id)).returning();
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/delete/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const [tweet] = await db.select().from(tweets).where(eq(tweets.id, req.params.id)).limit(1);
    if (!tweet || (tweet.authorId !== req.user!.userId && req.user!.role !== 'admin')) {
      res.status(403).json({ success: false, error: 'Not authorized' });
      return;
    }
    await db.update(tweets).set({ isDeleted: true }).where(eq(tweets.id, req.params.id));
    res.json({ success: true, message: 'Tweet deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/like/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tweetId = req.params.id;
    const existing = await db.select().from(likes).where(and(eq(likes.userId, req.user!.userId), eq(likes.tweetId, tweetId))).limit(1);
    if (existing.length) {
      await db.delete(likes).where(eq(likes.id, existing[0].id));
      await db.update(tweets).set({ likeCount: sql`${tweets.likeCount} - 1` }).where(eq(tweets.id, tweetId));
      res.json({ success: true, message: 'Unliked' });
    } else {
      await db.insert(likes).values({ userId: req.user!.userId, tweetId });
      await db.update(tweets).set({ likeCount: sql`${tweets.likeCount} + 1` }).where(eq(tweets.id, tweetId));
      const [tweet] = await db.select().from(tweets).where(eq(tweets.id, tweetId)).limit(1);
      if (tweet.authorId !== req.user!.userId) {
        await db.insert(notifications).values({
          userId: tweet.authorId, type: 'like', actorId: req.user!.userId, tweetId,
        });
      }
      res.json({ success: true, message: 'Liked' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/bookmark/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tweetId = req.params.id;
    const existing = await db.select().from(bookmarks).where(and(eq(bookmarks.userId, req.user!.userId), eq(bookmarks.tweetId, tweetId))).limit(1);
    if (existing.length) {
      await db.delete(bookmarks).where(eq(bookmarks.id, existing[0].id));
      await db.update(tweets).set({ bookmarkCount: sql`${tweets.bookmarkCount} - 1` }).where(eq(tweets.id, tweetId));
      res.json({ success: true, message: 'Bookmark removed' });
    } else {
      await db.insert(bookmarks).values({ userId: req.user!.userId, tweetId });
      await db.update(tweets).set({ bookmarkCount: sql`${tweets.bookmarkCount} + 1` }).where(eq(tweets.id, tweetId));
      res.json({ success: true, message: 'Bookmarked' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/retweet/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tweetId = req.params.id;
    const [tweet] = await db.select().from(tweets).where(eq(tweets.id, tweetId)).limit(1);
    if (!tweet) {
      res.status(404).json({ success: false, error: 'Tweet not found' });
      return;
    }
    const existing = await db.select().from(retweets).where(and(eq(retweets.userId, req.user!.userId), eq(retweets.tweetId, tweetId))).limit(1);
    if (existing.length) {
      await db.delete(retweets).where(eq(retweets.id, existing[0].id));
      await db.update(tweets).set({ retweetCount: sql`${tweets.retweetCount} - 1` }).where(eq(tweets.id, tweetId));
      res.json({ success: true, message: 'Retweet removed' });
    } else {
      await db.insert(retweets).values({ userId: req.user!.userId, tweetId });
      await db.update(tweets).set({ retweetCount: sql`${tweets.retweetCount} + 1` }).where(eq(tweets.id, tweetId));
      if (tweet.authorId !== req.user!.userId) {
        await db.insert(notifications).values({
          userId: tweet.authorId, type: 'retweet', actorId: req.user!.userId, tweetId,
        });
      }
      res.json({ success: true, message: 'Retweeted' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/quote/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body;
    const [tweet] = await db.select().from(tweets).where(eq(tweets.id, req.params.id)).limit(1);
    if (!tweet) {
      res.status(404).json({ success: false, error: 'Tweet not found' });
      return;
    }
    const hashtags = content ? extractHashtags(content) : [];
    const mentions = content ? extractMentions(content) : [];
    const [quoted] = await db.insert(tweets).values({
      authorId: req.user!.userId, content, quoteOfId: req.params.id,
      hashtags, mentions,
    }).returning();
    await db.update(tweets).set({ retweetCount: sql`${tweets.retweetCount} + 1` }).where(eq(tweets.id, req.params.id));
    res.status(201).json({ success: true, data: quoted });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const [tweet] = await db.select().from(tweets).where(and(eq(tweets.id, req.params.id), eq(tweets.isDeleted, false))).limit(1);
    if (!tweet) {
      res.status(404).json({ success: false, error: 'Tweet not found' });
      return;
    }
    const media = await db.select().from(tweetMedia).where(eq(tweetMedia.tweetId, tweet.id));
    const pollData = await db.select().from(polls).where(eq(polls.tweetId, tweet.id)).limit(1);
    const geoData = await db.select().from(geoTags).where(eq(geoTags.tweetId, tweet.id)).limit(1);
    await db.update(tweets).set({ views: sql`${tweets.views} + 1` }).where(eq(tweets.id, tweet.id));
    res.json({ success: true, data: { ...tweet, media, poll: pollData[0], geo: geoData[0] } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/feed/home', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const cursor = req.query.cursor as string;
    let feed;
    if (req.user) {
      const following = await db.select({ followingId: followers.followingId })
        .from(followers).where(eq(followers.followerId, req.user.userId));
      const ids = following.map(f => f.followingId);
      ids.push(req.user.userId);
      feed = await db.select().from(tweets)
        .where(and(inArray(tweets.authorId, ids), eq(tweets.isDeleted, false), eq(tweets.isDraft, false), isNull(tweets.retweetOfId)))
        .orderBy(desc(tweets.createdAt)).limit(limit);
    } else {
      feed = await db.select().from(tweets)
        .where(and(eq(tweets.isDeleted, false), eq(tweets.isDraft, false)))
        .orderBy(desc(tweets.createdAt)).limit(limit);
    }
    res.json({ success: true, data: feed, meta: { hasMore: feed.length === limit } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/feed/following', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const following = await db.select({ followingId: followers.followingId })
      .from(followers).where(eq(followers.followerId, req.user!.userId));
    const ids = following.map(f => f.followingId);
    ids.push(req.user!.userId);
    const feed = await db.select().from(tweets)
      .where(and(inArray(tweets.authorId, ids), eq(tweets.isDeleted, false), eq(tweets.isDraft, false)))
      .orderBy(desc(tweets.createdAt)).limit(20);
    res.json({ success: true, data: feed });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/feed/trending', async (req: AuthRequest, res: Response) => {
  try {
    const feed = await db.select().from(tweets)
      .where(and(eq(tweets.isDeleted, false), eq(tweets.isDraft, false)))
      .orderBy(desc(tweets.likeCount), desc(tweets.retweetCount), desc(tweets.createdAt)).limit(20);
    res.json({ success: true, data: feed });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/feed/hashtag/:tag', async (req: AuthRequest, res: Response) => {
  try {
    const tag = `#${req.params.tag.toLowerCase()}`;
    const feed = await db.select().from(tweets)
      .where(and(eq(tweets.isDeleted, false), sql`${tag} = ANY(${tweets.hashtags})`))
      .orderBy(desc(tweets.createdAt)).limit(20);
    res.json({ success: true, data: feed });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/user/:userId', async (req: AuthRequest, res: Response) => {
  try {
    const feed = await db.select().from(tweets)
      .where(and(eq(tweets.authorId, req.params.userId), eq(tweets.isDeleted, false), eq(tweets.isDraft, false)))
      .orderBy(desc(tweets.createdAt)).limit(20);
    res.json({ success: true, data: feed });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/user/:userId/media', async (req: AuthRequest, res: Response) => {
  try {
    const mediaTweets = await db.select().from(tweets)
      .where(and(eq(tweets.authorId, req.params.userId), eq(tweets.isDeleted, false)))
      .innerJoin(tweetMedia, eq(tweetMedia.tweetId, tweets.id))
      .orderBy(desc(tweets.createdAt)).limit(20);
    res.json({ success: true, data: mediaTweets });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/bookmarks/all', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const bookmarkList = await db.select().from(bookmarks)
      .where(eq(bookmarks.userId, req.user!.userId))
      .innerJoin(tweets, eq(tweets.id, bookmarks.tweetId))
      .orderBy(desc(bookmarks.createdAt)).limit(20);
    res.json({ success: true, data: bookmarkList });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/likes/:userId', async (req: AuthRequest, res: Response) => {
  try {
    const likedTweets = await db.select().from(likes)
      .where(eq(likes.userId, req.params.userId))
      .innerJoin(tweets, eq(tweets.id, likes.tweetId))
      .orderBy(desc(likes.createdAt)).limit(20);
    res.json({ success: true, data: likedTweets });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

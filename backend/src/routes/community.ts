import { Router, Response } from 'express';
import { db } from '../db';
import { communities, communityMembers, communityPinnedPosts } from '../db/schema';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';
import { eq, and, desc, sql } from 'drizzle-orm';

const router = Router();

router.post('/create', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, avatar, banner, rules, isPrivate } = req.body;
    const [community] = await db.insert(communities).values({
      name, description, avatar, banner, rules, isPrivate: isPrivate || false, ownerId: req.user!.userId,
    }).returning();
    await db.insert(communityMembers).values({ communityId: community.id, userId: req.user!.userId, role: 'owner' });
    await db.update(communities).set({ memberCount: 1 }).where(eq(communities.id, community.id));
    res.status(201).json({ success: true, data: community });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/join/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const existing = await db.select().from(communityMembers)
      .where(and(eq(communityMembers.communityId, req.params.id), eq(communityMembers.userId, req.user!.userId))).limit(1);
    if (existing.length) {
      res.status(400).json({ success: false, error: 'Already a member' });
      return;
    }
    await db.insert(communityMembers).values({ communityId: req.params.id, userId: req.user!.userId, role: 'member' });
    await db.update(communities).set({ memberCount: sql`${communities.memberCount} + 1` }).where(eq(communities.id, req.params.id));
    res.json({ success: true, message: 'Joined community' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/leave/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await db.delete(communityMembers)
      .where(and(eq(communityMembers.communityId, req.params.id), eq(communityMembers.userId, req.user!.userId)));
    await db.update(communities).set({ memberCount: sql`GREATEST(${communities.memberCount} - 1, 0)` }).where(eq(communities.id, req.params.id));
    res.json({ success: true, message: 'Left community' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/pin', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { communityId, tweetId } = req.body;
    const [membership] = await db.select().from(communityMembers)
      .where(and(eq(communityMembers.communityId, communityId), eq(communityMembers.userId, req.user!.userId))).limit(1);
    if (!membership || !['owner', 'admin', 'moderator'].includes(membership.role)) {
      res.status(403).json({ success: false, error: 'Not authorized to pin posts' });
      return;
    }
    await db.insert(communityPinnedPosts).values({ communityId, tweetId, pinnedBy: req.user!.userId });
    res.json({ success: true, message: 'Post pinned' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const list = await db.select().from(communities).orderBy(desc(communities.memberCount)).limit(20);
    res.json({ success: true, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const [community] = await db.select().from(communities).where(eq(communities.id, req.params.id)).limit(1);
    if (!community) {
      res.status(404).json({ success: false, error: 'Community not found' });
      return;
    }
    const members = await db.select().from(communityMembers).where(eq(communityMembers.communityId, community.id));
    const pinned = await db.select().from(communityPinnedPosts).where(eq(communityPinnedPosts.communityId, community.id));
    res.json({ success: true, data: { ...community, members, pinnedPosts: pinned } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

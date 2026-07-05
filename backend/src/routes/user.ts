import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { users, followers, blocks, reports, userReputation } from '../db/schema';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';
import { eq, and, or, not, sql, desc } from 'drizzle-orm';

const router = Router();

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.params.id)).limit(1);
    if (!user || user.deactivated) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    const { passwordHash, ...safeUser } = user;
    res.json({ success: true, data: safeUser });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/update', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { displayName, bio, avatar, banner, website, location } = req.body;
    const [updated] = await db.update(users).set({
      displayName, bio, avatar, banner, website, location, updatedAt: new Date(),
    }).where(eq(users.id, req.user!.userId)).returning();
    const { passwordHash, ...safeUser } = updated;
    res.json({ success: true, data: safeUser });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/change-password', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const [user] = await db.select().from(users).where(eq(users.id, req.user!.userId)).limit(1);
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      res.status(400).json({ success: false, error: 'Current password is incorrect' });
      return;
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, req.user!.userId));
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/deactivate', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await db.update(users).set({ deactivated: true, updatedAt: new Date() }).where(eq(users.id, req.user!.userId));
    res.json({ success: true, message: 'Account deactivated' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/follow/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const targetId = req.params.id;
    if (targetId === req.user!.userId) {
      res.status(400).json({ success: false, error: 'Cannot follow yourself' });
      return;
    }
    const existing = await db.select().from(followers)
      .where(and(eq(followers.followerId, req.user!.userId), eq(followers.followingId, targetId))).limit(1);
    if (existing.length) {
      await db.delete(followers).where(eq(followers.id, existing[0].id));
      await db.update(users).set({ followerCount: sql`${users.followerCount} - 1` }).where(eq(users.id, targetId));
      await db.update(users).set({ followingCount: sql`${users.followingCount} - 1` }).where(eq(users.id, req.user!.userId));
      res.json({ success: true, message: 'Unfollowed' });
    } else {
      await db.insert(followers).values({ followerId: req.user!.userId, followingId: targetId });
      await db.update(users).set({ followerCount: sql`${users.followerCount} + 1` }).where(eq(users.id, targetId));
      await db.update(users).set({ followingCount: sql`${users.followingCount} + 1` }).where(eq(users.id, req.user!.userId));
      res.json({ success: true, message: 'Followed' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id/followers', async (req: AuthRequest, res: Response) => {
  try {
    const followerList = await db.select({
      id: users.id, username: users.username, displayName: users.displayName, avatar: users.avatar, bio: users.bio,
    }).from(followers).where(eq(followers.followingId, req.params.id))
      .innerJoin(users, eq(followers.followerId, users.id)).limit(50);
    res.json({ success: true, data: followerList });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id/following', async (req: AuthRequest, res: Response) => {
  try {
    const followingList = await db.select({
      id: users.id, username: users.username, displayName: users.displayName, avatar: users.avatar, bio: users.bio,
    }).from(followers).where(eq(followers.followerId, req.params.id))
      .innerJoin(users, eq(followers.followingId, users.id)).limit(50);
    res.json({ success: true, data: followingList });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/block/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const [blocked] = await db.insert(blocks).values({
      blockerId: req.user!.userId, blockedId: req.params.id,
    }).returning();
    await db.delete(followers).where(and(
      or(eq(followers.followerId, req.user!.userId), eq(followers.followingId, req.user!.userId)),
      or(eq(followers.followerId, req.params.id), eq(followers.followingId, req.params.id)),
    ));
    res.json({ success: true, data: blocked });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/unblock/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await db.delete(blocks).where(and(
      eq(blocks.blockerId, req.user!.userId), eq(blocks.blockedId, req.params.id),
    ));
    res.json({ success: true, message: 'Unblocked' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/report', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { reportedUserId, reportedTweetId, reason } = req.body;
    const [report] = await db.insert(reports).values({
      reporterId: req.user!.userId, reportedUserId, reportedTweetId, reason,
    }).returning();
    res.json({ success: true, data: report });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/suggestions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const suggestions = await db.select({
      id: users.id, username: users.username, displayName: users.displayName,
      avatar: users.avatar, bio: users.bio, verified: users.verified,
    }).from(users)
      .where(and(not(eq(users.id, req.user!.userId)), eq(users.deactivated, false)))
      .orderBy(desc(users.followerCount)).limit(10);
    res.json({ success: true, data: suggestions });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

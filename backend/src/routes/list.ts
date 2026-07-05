import { Router, Response } from 'express';
import { db } from '../db';
import { lists, listMembers } from '../db/schema';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';
import { eq, and, desc, sql } from 'drizzle-orm';

const router = Router();

router.post('/create', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, isPrivate } = req.body;
    const [list] = await db.insert(lists).values({
      name, description, isPrivate: isPrivate || false, ownerId: req.user!.userId,
    }).returning();
    res.status(201).json({ success: true, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/add', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { listId, userId } = req.body;
    const [list] = await db.select().from(lists).where(eq(lists.id, listId)).limit(1);
    if (!list || list.ownerId !== req.user!.userId) {
      res.status(403).json({ success: false, error: 'Not authorized' });
      return;
    }
    const existing = await db.select().from(listMembers)
      .where(and(eq(listMembers.listId, listId), eq(listMembers.userId, userId))).limit(1);
    if (existing.length) {
      res.status(400).json({ success: false, error: 'User already in list' });
      return;
    }
    await db.insert(listMembers).values({ listId, userId, addedBy: req.user!.userId });
    await db.update(lists).set({ memberCount: sql`${lists.memberCount} + 1` }).where(eq(lists.id, listId));
    res.json({ success: true, message: 'User added to list' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/remove', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { listId, userId } = req.body;
    await db.delete(listMembers).where(and(eq(listMembers.listId, listId), eq(listMembers.userId, userId)));
    await db.update(lists).set({ memberCount: sql`GREATEST(${lists.memberCount} - 1, 0)` }).where(eq(lists.id, listId));
    res.json({ success: true, message: 'User removed from list' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/my', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const myLists = await db.select().from(lists).where(eq(lists.ownerId, req.user!.userId)).orderBy(desc(lists.createdAt));
    res.json({ success: true, data: myLists });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const [list] = await db.select().from(lists).where(eq(lists.id, req.params.id)).limit(1);
    if (!list) {
      res.status(404).json({ success: false, error: 'List not found' });
      return;
    }
    const members = await db.select().from(listMembers).where(eq(listMembers.listId, list.id));
    res.json({ success: true, data: { ...list, members } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

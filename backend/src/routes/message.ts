import { Router, Response } from 'express';
import { db } from '../db';
import { messages, blocks } from '../db/schema';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';
import { eq, and, or, desc, sql } from 'drizzle-orm';

const router = Router();

router.post('/send', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { receiverId, content, mediaUrl, mediaType, replyToId } = req.body;
    const blocked = await db.select().from(blocks)
      .where(or(
        and(eq(blocks.blockerId, receiverId), eq(blocks.blockedId, req.user!.userId)),
        and(eq(blocks.blockerId, req.user!.userId), eq(blocks.blockedId, receiverId)),
      )).limit(1);
    if (blocked.length) {
      res.status(403).json({ success: false, error: 'Cannot message this user' });
      return;
    }
    const [msg] = await db.insert(messages).values({
      senderId: req.user!.userId, receiverId, content, mediaUrl, mediaType, replyToId,
    }).returning();
    const io = req.app.get('io');
    io.to(`user:${receiverId}`).emit('message:new', msg);
    res.status(201).json({ success: true, data: msg });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/thread/:userId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const thread = await db.select().from(messages)
      .where(or(
        and(eq(messages.senderId, req.user!.userId), eq(messages.receiverId, req.params.userId)),
        and(eq(messages.senderId, req.params.userId), eq(messages.receiverId, req.user!.userId)),
      ))
      .orderBy(desc(messages.createdAt)).limit(50);
    res.json({ success: true, data: thread.reverse() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/conversations', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const sent = await db.select({ userId: messages.receiverId, lastMessage: messages.content, lastAt: messages.createdAt })
      .from(messages).where(eq(messages.senderId, req.user!.userId))
      .orderBy(desc(messages.createdAt)).limit(30);
    const received = await db.select({ userId: messages.senderId, lastMessage: messages.content, lastAt: messages.createdAt })
      .from(messages).where(eq(messages.receiverId, req.user!.userId))
      .orderBy(desc(messages.createdAt)).limit(30);
    res.json({ success: true, data: { sent, received } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/seen', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { messageIds } = req.body;
    if (messageIds?.length) {
      for (const id of messageIds) {
        await db.update(messages).set({ isRead: true })
          .where(and(eq(messages.id, id), eq(messages.receiverId, req.user!.userId)));
      }
    }
    res.json({ success: true, message: 'Messages marked as seen' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await db.update(messages).set({ isDeleted: true })
      .where(and(eq(messages.id, req.params.id), eq(messages.senderId, req.user!.userId)));
    res.json({ success: true, message: 'Message deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

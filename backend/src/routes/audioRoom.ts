import { Router, Response } from 'express';
import { db } from '../db';
import { audioRooms, audioRoomParticipants } from '../db/schema';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';
import { eq, and, desc, sql } from 'drizzle-orm';

const router = Router();

router.post('/create', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, isRecording, scheduledAt } = req.body;
    const [room] = await db.insert(audioRooms).values({
      hostId: req.user!.userId, title, description, isRecording: isRecording || false, scheduledAt, isLive: !scheduledAt,
    }).returning();
    await db.insert(audioRoomParticipants).values({ roomId: room.id, userId: req.user!.userId, role: 'host' });
    res.status(201).json({ success: true, data: room });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/join/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const roomId = req.params.id;
    const existing = await db.select().from(audioRoomParticipants)
      .where(and(eq(audioRoomParticipants.roomId, roomId), eq(audioRoomParticipants.userId, req.user!.userId))).limit(1);
    if (!existing.length) {
      await db.insert(audioRoomParticipants).values({ roomId, userId: req.user!.userId, role: 'listener' });
      await db.update(audioRooms).set({ listenerCount: sql`${audioRooms.listenerCount} + 1` }).where(eq(audioRooms.id, roomId));
    }
    res.json({ success: true, message: 'Joined room' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/leave/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const roomId = req.params.id;
    await db.update(audioRoomParticipants).set({ leftAt: new Date() })
      .where(and(eq(audioRoomParticipants.roomId, roomId), eq(audioRoomParticipants.userId, req.user!.userId)));
    await db.update(audioRooms).set({ listenerCount: sql`GREATEST(${audioRooms.listenerCount} - 1, 0)` }).where(eq(audioRooms.id, roomId));
    res.json({ success: true, message: 'Left room' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/live', async (req: AuthRequest, res: Response) => {
  try {
    const rooms = await db.select().from(audioRooms).where(eq(audioRooms.isLive, true)).orderBy(desc(audioRooms.listenerCount));
    res.json({ success: true, data: rooms });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const [room] = await db.select().from(audioRooms).where(eq(audioRooms.id, req.params.id)).limit(1);
    if (!room) {
      res.status(404).json({ success: false, error: 'Room not found' });
      return;
    }
    const participants = await db.select().from(audioRoomParticipants)
      .where(and(eq(audioRoomParticipants.roomId, room.id), sql`${audioRoomParticipants.leftAt} IS NULL`));
    res.json({ success: true, data: { ...room, participants } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/end/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const [room] = await db.select().from(audioRooms).where(eq(audioRooms.id, req.params.id)).limit(1);
    if (!room || room.hostId !== req.user!.userId) {
      res.status(403).json({ success: false, error: 'Only host can end the room' });
      return;
    }
    await db.update(audioRooms).set({ isLive: false, endedAt: new Date() }).where(eq(audioRooms.id, room.id));
    res.json({ success: true, message: 'Room ended' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

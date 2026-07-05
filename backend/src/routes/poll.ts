import { Router, Response } from 'express';
import { db } from '../db';
import { polls, pollVotes } from '../db/schema';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';
import { eq, and } from 'drizzle-orm';

const router = Router();

router.post('/vote', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { pollId, optionIndex } = req.body;
    const [poll] = await db.select().from(polls).where(eq(polls.id, pollId)).limit(1);
    if (!poll || poll.expiresAt < new Date()) {
      res.status(400).json({ success: false, error: 'Poll expired or not found' });
      return;
    }
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      res.status(400).json({ success: false, error: 'Invalid option' });
      return;
    }
    const existing = await db.select().from(pollVotes)
      .where(and(eq(pollVotes.pollId, pollId), eq(pollVotes.userId, req.user!.userId))).limit(1);
    if (existing.length) {
      await db.update(pollVotes).set({ optionIndex }).where(eq(pollVotes.id, existing[0].id));
    } else {
      await db.insert(pollVotes).values({ pollId, userId: req.user!.userId, optionIndex });
    }
    res.json({ success: true, message: 'Vote recorded' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id/results', async (req: AuthRequest, res: Response) => {
  try {
    const [poll] = await db.select().from(polls).where(eq(polls.id, req.params.id)).limit(1);
    if (!poll) {
      res.status(404).json({ success: false, error: 'Poll not found' });
      return;
    }
    const votes = await db.select().from(pollVotes).where(eq(pollVotes.pollId, poll.id));
    const results = poll.options.map((option, idx) => ({
      option,
      count: votes.filter(v => v.optionIndex === idx).length,
    }));
    res.json({ success: true, data: { poll, results, totalVotes: votes.length } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { db } from '../db';
import { users, sessions } from '../db/schema';
import { config } from '../config';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import { AuthRequest } from '../types';
import { eq, and } from 'drizzle-orm';

const router = Router();

const generateTokens = (payload: { userId: string; username: string; role: string }) => {
  const accessToken = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn as any });
  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn as any });
  return { accessToken, refreshToken };
};

router.post('/register', authLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const { username, email, password, displayName, dateOfBirth, termsAccepted } = req.body;
    if (!username || !email || !password) {
      res.status(400).json({ success: false, error: 'Username, email, and password required' });
      return;
    }
    if (!termsAccepted) {
      res.status(400).json({ success: false, error: 'You must accept the terms of service' });
      return;
    }
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length) {
      res.status(409).json({ success: false, error: 'Email already registered' });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const [newUser] = await db.insert(users).values({
      username, email, passwordHash, displayName: displayName || username,
      dateOfBirth, termsAccepted,
    }).returning();
    const payload = { userId: newUser.id, username: newUser.username, role: newUser.role || 'user' };
    const tokens = generateTokens(payload);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.insert(sessions).values({
      userId: newUser.id, refreshToken: tokens.refreshToken, expiresAt,
    });
    res.status(201).json({
      success: true, data: { user: newUser, ...tokens },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/login', authLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password required' });
      return;
    }
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user || user.deactivated) {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
      return;
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
      return;
    }
    const payload = { userId: user.id, username: user.username, role: user.role || 'user' };
    const tokens = generateTokens(payload);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.insert(sessions).values({
      userId: user.id, refreshToken: tokens.refreshToken, expiresAt,
    });
    res.json({ success: true, data: { user, ...tokens } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/refresh', async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ success: false, error: 'Refresh token required' });
      return;
    }
    const [session] = await db.select().from(sessions).where(eq(sessions.refreshToken, refreshToken)).limit(1);
    if (!session || session.expiresAt < new Date()) {
      res.status(401).json({ success: false, error: 'Invalid or expired refresh token' });
      return;
    }
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as any;
    const payload = { userId: decoded.userId, username: decoded.username, role: decoded.role };
    const tokens = generateTokens(payload);
    await db.update(sessions).set({ refreshToken: tokens.refreshToken, lastActive: new Date() })
      .where(eq(sessions.id, session.id));
    res.json({ success: true, data: tokens });
  } catch {
    res.status(401).json({ success: false, error: 'Invalid refresh token' });
  }
});

router.post('/logout', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await db.delete(sessions).where(eq(sessions.refreshToken, refreshToken));
    } else {
      await db.delete(sessions).where(eq(sessions.userId, req.user!.userId));
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

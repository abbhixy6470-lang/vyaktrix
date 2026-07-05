import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many auth attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: { success: false, error: 'Rate limit exceeded' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const ipThrottle = (maxPerMinute = 30) => rateLimit({
  windowMs: 60 * 1000,
  max: maxPerMinute,
  keyGenerator: (req: Request) => req.ip || req.socket.remoteAddress || 'unknown',
  message: { success: false, error: 'IP throttled' },
});

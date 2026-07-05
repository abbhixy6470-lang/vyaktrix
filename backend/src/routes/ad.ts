import { Router, Response } from 'express';
import { db } from '../db';
import { ads, adCampaigns } from '../db/schema';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';
import { eq, desc } from 'drizzle-orm';

const router = Router();

router.post('/create', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { content, mediaUrl, targetUrl, budget } = req.body;
    const [ad] = await db.insert(ads).values({
      advertiserId: req.user!.userId, content, mediaUrl, targetUrl, budget,
    }).returning();
    res.status(201).json({ success: true, data: ad });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/campaign', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { adId, startDate, endDate, targetGender, targetAgeMin, targetAgeMax, targetLocation, targetInterests, dailyBudget } = req.body;
    const [campaign] = await db.insert(adCampaigns).values({
      adId, startDate, endDate, targetGender, targetAgeMin, targetAgeMax, targetLocation, targetInterests, dailyBudget,
    }).returning();
    res.status(201).json({ success: true, data: campaign });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/my', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const myAds = await db.select().from(ads).where(eq(ads.advertiserId, req.user!.userId)).orderBy(desc(ads.createdAt));
    res.json({ success: true, data: myAds });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const [ad] = await db.select().from(ads).where(eq(ads.id, req.params.id)).limit(1);
    if (!ad) {
      res.status(404).json({ success: false, error: 'Ad not found' });
      return;
    }
    const campaigns = await db.select().from(adCampaigns).where(eq(adCampaigns.adId, ad.id));
    res.json({ success: true, data: { ...ad, campaigns } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

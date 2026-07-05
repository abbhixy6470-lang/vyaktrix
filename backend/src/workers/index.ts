import { Worker, Queue } from 'bullmq';
import { config } from '../config';

const connection = { url: config.redis.url };

// Define queues
export const queues = {
  feedFanout: new Queue('feed-fanout', { connection }),
  mediaProcessing: new Queue('media-processing', { connection }),
  pollExpiration: new Queue('poll-expiration', { connection }),
  trendCalculation: new Queue('trend-calculation', { connection }),
  notificationDispatch: new Queue('notification-dispatch', { connection }),
  aiScoring: new Queue('ai-scoring', { connection }),
  spamDetection: new Queue('spam-detection', { connection }),
};

// Worker: Feed fan-out
new Worker('feed-fanout', async (job) => {
  console.log('Fanning out tweet:', job.data.tweetId);
}, { connection });

// Worker: Media compression
new Worker('media-processing', async (job) => {
  console.log('Processing media:', job.data.mediaId);
}, { connection });

// Worker: Poll expiration
new Worker('poll-expiration', async (job) => {
  console.log('Expiring poll:', job.data.pollId);
}, { connection });

// Worker: Trend calculation
new Worker('trend-calculation', async () => {
  console.log('Recalculating trends...');
}, { connection });

// Worker: AI scoring
new Worker('ai-scoring', async (job) => {
  console.log('Scoring tweet:', job.data.tweetId);
}, { connection });

// Worker: Spam detection
new Worker('spam-detection', async (job) => {
  console.log('Checking spam for:', job.data.contentId);
}, { connection });

console.log('Vyaktrix Workers running...');

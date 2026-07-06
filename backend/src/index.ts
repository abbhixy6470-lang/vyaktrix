import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { config } from './config';
import { pool } from './db';
import { setupDatabase } from './db/setup';

// Route imports
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import userMeRoutes from './routes/user/me';
import tweetRoutes from './routes/tweet';
import notificationRoutes from './routes/notification';
import messageRoutes from './routes/message';
import searchRoutes from './routes/search';
import adminRoutes from './routes/admin';
import pollRoutes from './routes/poll';
import audioRoomRoutes from './routes/audioRoom';
import communityRoutes from './routes/community';
import listRoutes from './routes/list';
import creatorRoutes from './routes/creator';
import adRoutes from './routes/ad';
import geoRoutes from './routes/geo';
import sessionRoutes from './routes/session';

const app = express();
const httpServer = createServer(app);

const corsOptions = {
  origin: true,
  credentials: true,
};

const io = new SocketServer(httpServer, {
  cors: corsOptions,
});

app.set('io', io);

app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/user', userMeRoutes);
app.use('/api/tweet', tweetRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/poll', pollRoutes);
app.use('/api/audio', audioRoomRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/list', listRoutes);
app.use('/api/creator', creatorRoutes);
app.use('/api/ad', adRoutes);
app.use('/api/geo', geoRoutes);
app.use('/api/session', sessionRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join:user', (userId: string) => {
    socket.join(`user:${userId}`);
  });

  socket.on('join:room', (roomId: string) => {
    socket.join(`audio:${roomId}`);
  });

  socket.on('typing:start', ({ senderId, receiverId }) => {
    io.to(`user:${receiverId}`).emit('typing:start', { senderId });
  });

  socket.on('typing:stop', ({ senderId, receiverId }) => {
    io.to(`user:${receiverId}`).emit('typing:stop', { senderId });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

if (config.nodeEnv === 'production') {
  setupDatabase().then(() => {
    httpServer.listen(config.port, '0.0.0.0', () => {
      console.log(`Vyaktrix 2.0 server running on port ${config.port} (${config.nodeEnv})`);
    });
  }).catch((err) => {
    console.error('Database setup failed, starting server anyway:', err);
    httpServer.listen(config.port, '0.0.0.0', () => {
      console.log(`Vyaktrix 2.0 server running on port ${config.port} (${config.nodeEnv})`);
    });
  });
} else {
  httpServer.listen(config.port, '0.0.0.0', () => {
    console.log(`Vyaktrix 2.0 server running on port ${config.port} (${config.nodeEnv})`);
  });
}

httpServer.on('error', (err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});

process.on('SIGTERM', async () => {
  await pool.end();
  process.exit(0);
});

export { app, io };

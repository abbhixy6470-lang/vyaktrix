# Vyaktrix 2.0

A modern social network platform built with Node.js, Express, Next.js, PostgreSQL, and Redis.

## Features

- **User System** — Register, login, profiles, follow/unfollow, block, report
- **Tweet Engine** — Create, edit, delete, reply, retweet, quote, like, bookmark, polls
- **Feed Timeline** — Home, following, trending, hashtag, media-only feeds
- **Notifications** — Real-time alerts for likes, retweets, replies, follows, messages
- **Messaging** — One-to-one DMs with read receipts and typing indicators
- **Search** — Users, tweets, hashtags, trends, autocomplete
- **Admin Panel** — User/tweet moderation, reports queue, analytics dashboard
- **Audio Rooms** — Live audio conversations with host/speaker/listener roles
- **Communities** — Topic-based groups with admins, rules, pinned posts
- **Lists** — Curated timelines, public/private
- **Creator Monetization** — Paid subscriptions, tips
- **Ad Engine** — Promoted content with campaign management
- **Geo-Tagging** — Location-tagged tweets, local trends, nearby posts
- **Content Classification** — NSFW, violence, hate speech detection
- **User Reputation** — Spam, abuse, engagement, influence scoring

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL (via Drizzle ORM) |
| Cache | Redis |
| Search | Meilisearch |
| Real-time | Socket.io |
| Auth | JWT + Refresh Tokens |
| Background Jobs | BullMQ |
| Storage | Local / AWS S3 |

## Project Structure

```
vyaktrix/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── config/       # Environment variables
│   │   ├── db/           # Database schema & connection
│   │   ├── middleware/    # Auth, rate limiting
│   │   ├── routes/       # API route handlers
│   │   ├── types/        # TypeScript types
│   │   ├── utils/        # Helpers, Redis cache
│   │   └── workers/      # Background job workers
│   └── package.json
├── frontend/             # Next.js client
│   └── src/app/          # Pages & components
├── docker/               # Docker & Nginx configs
├── docker-compose.yml    # Full stack deployment
├── deploy.sh             # Hostinger deployment script
├── FREE_DEPLOY.md        # Free hosting guide
└── HOSTINGER_SETUP.md    # VPS deployment guide
```

## Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Redis (optional, for caching)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/vyaktrix.git
cd vyaktrix

# 2. Install backend dependencies
cd backend
npm install
cp .env .env.local  # Edit .env.local with your DB credentials

# 3. Run database migrations
npm run db:push

# 4. Start the backend
npm run dev

# 5. Open a new terminal, install & start frontend
cd ../frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to see the app. The API runs on `http://localhost:3001`.

## API Endpoints

### Auth
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Sign in
- `POST /api/auth/logout` — Sign out
- `POST /api/auth/refresh` — Refresh tokens

### User
- `GET /api/user/:id` — Get user profile
- `PUT /api/user/update` — Update profile
- `GET /api/user/me` — Get current user
- `POST /api/user/follow/:id` — Follow/unfollow
- `POST /api/user/block/:id` — Block user
- `POST /api/user/report` — Report user/tweet
- `GET /api/user/suggestions` — Suggested users

### Tweet
- `POST /api/tweet/create` — Create tweet
- `PUT /api/tweet/edit/:id` — Edit tweet
- `DELETE /api/tweet/delete/:id` — Delete tweet
- `POST /api/tweet/like/:id` — Like/unlike
- `POST /api/tweet/bookmark/:id` — Bookmark
- `POST /api/tweet/retweet/:id` — Retweet
- `POST /api/tweet/quote/:id` — Quote tweet
- `GET /api/tweet/:id` — Get tweet detail
- `GET /api/tweet/feed/home` — Home feed
- `GET /api/tweet/feed/trending` — Trending feed

### Polls
- `POST /api/poll/vote` — Vote on poll
- `GET /api/poll/:id/results` — Poll results

### Messages
- `POST /api/message/send` — Send DM
- `GET /api/message/thread/:userId` — Get conversation
- `GET /api/message/conversations` — List conversations

### Audio Rooms
- `POST /api/audio/create` — Create space
- `POST /api/audio/join/:id` — Join space
- `POST /api/audio/leave/:id` — Leave space
- `GET /api/audio/live` — List live spaces

### Communities
- `POST /api/community/create` — Create community
- `POST /api/community/join/:id` — Join community
- `POST /api/community/leave/:id` — Leave community

### Creator Monetization
- `POST /api/creator/subscribe` — Subscribe to creator
- `POST /api/creator/tip` — Send tip
- `GET /api/creator/subscribers` — Your subscribers

### Admin
- `GET /api/admin/reports` — View reports (admin only)
- `POST /api/admin/action` — Moderate content
- `GET /api/admin/analytics` — Dashboard analytics

## Deployment

### Free (Recommended for beginners)
1. **Database**: Create free PostgreSQL at [Neon](https://neon.tech)
2. **Backend**: Deploy on [Render](https://render.com) (free tier)
3. **Frontend**: Deploy on [Vercel](https://vercel.com) (free tier)
4. **Domain**: Point your domain via Hostinger DNS

See `FREE_DEPLOY.md` for step-by-step instructions.

### VPS (Hostinger)
```bash
ssh root@your-vps-ip
bash /var/www/vyaktrix/deploy.sh
```

See `HOSTINGER_SETUP.md` for detailed guide.

## License

MIT

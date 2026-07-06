import { pool } from './index';

const createTables = `
CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  username varchar(50) NOT NULL UNIQUE,
  email varchar(255) NOT NULL UNIQUE,
  password_hash text NOT NULL,
  display_name varchar(100),
  bio text,
  avatar text,
  banner text,
  website text,
  location text,
  date_of_birth date,
  terms_accepted boolean DEFAULT false,
  verified boolean DEFAULT false,
  private boolean DEFAULT false,
  deactivated boolean DEFAULT false,
  role varchar(20) DEFAULT 'user',
  reputation_score integer DEFAULT 0,
  follower_count integer DEFAULT 0,
  following_count integer DEFAULT 0,
  tweet_count integer DEFAULT 0,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token text NOT NULL,
  device_info jsonb,
  ip_address varchar(45),
  last_active timestamp DEFAULT now(),
  expires_at timestamp NOT NULL,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tweets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text,
  reply_to_id uuid REFERENCES tweets(id) ON DELETE SET NULL,
  retweet_of_id uuid REFERENCES tweets(id) ON DELETE SET NULL,
  quote_of_id uuid REFERENCES tweets(id) ON DELETE SET NULL,
  is_edited boolean DEFAULT false,
  is_draft boolean DEFAULT false,
  is_deleted boolean DEFAULT false,
  sensitive boolean DEFAULT false,
  views integer DEFAULT 0,
  impressions integer DEFAULT 0,
  like_count integer DEFAULT 0,
  retweet_count integer DEFAULT 0,
  reply_count integer DEFAULT 0,
  bookmark_count integer DEFAULT 0,
  hashtags jsonb DEFAULT '[]',
  mentions jsonb DEFAULT '[]',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tweet_media (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tweet_id uuid NOT NULL REFERENCES tweets(id) ON DELETE CASCADE,
  url text NOT NULL,
  type varchar(10) DEFAULT 'image',
  width integer,
  height integer,
  duration integer,
  thumbnail text,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS polls (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tweet_id uuid NOT NULL REFERENCES tweets(id) ON DELETE CASCADE,
  options jsonb DEFAULT '[]',
  expires_at timestamp NOT NULL,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS poll_votes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id uuid NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  option_index integer NOT NULL,
  created_at timestamp DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tweet_id uuid NOT NULL REFERENCES tweets(id) ON DELETE CASCADE,
  created_at timestamp DEFAULT now(),
  UNIQUE(user_id, tweet_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type varchar(50) NOT NULL,
  actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  tweet_id uuid REFERENCES tweets(id) ON DELETE SET NULL,
  content text,
  is_read boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text,
  media_url text,
  media_type varchar(10),
  is_read boolean DEFAULT false,
  is_deleted boolean DEFAULT false,
  reply_to_id uuid REFERENCES messages(id) ON DELETE SET NULL,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS follows (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamp DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

CREATE TABLE IF NOT EXISTS likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tweet_id uuid NOT NULL REFERENCES tweets(id) ON DELETE CASCADE,
  created_at timestamp DEFAULT now(),
  UNIQUE(user_id, tweet_id)
);

CREATE TABLE IF NOT EXISTS retweets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tweet_id uuid NOT NULL REFERENCES tweets(id) ON DELETE CASCADE,
  created_at timestamp DEFAULT now(),
  UNIQUE(user_id, tweet_id)
);

CREATE TABLE IF NOT EXISTS blocks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamp DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

CREATE TABLE IF NOT EXISTS reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  reported_tweet_id uuid REFERENCES tweets(id) ON DELETE CASCADE,
  reason text NOT NULL,
  status varchar(20) DEFAULT 'pending',
  resolved_by uuid REFERENCES users(id),
  created_at timestamp DEFAULT now(),
  resolved_at timestamp
);

CREATE TABLE IF NOT EXISTS audio_rooms (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title varchar(200) NOT NULL,
  description text,
  is_recording boolean DEFAULT false,
  is_live boolean DEFAULT false,
  scheduled_at timestamp,
  listener_count integer DEFAULT 0,
  created_at timestamp DEFAULT now(),
  ended_at timestamp
);

CREATE TABLE IF NOT EXISTS audio_room_participants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid NOT NULL REFERENCES audio_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role varchar(20) DEFAULT 'listener',
  is_speaking boolean DEFAULT false,
  is_muted boolean DEFAULT false,
  joined_at timestamp DEFAULT now(),
  UNIQUE(room_id, user_id)
);

CREATE TABLE IF NOT EXISTS communities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar(100) NOT NULL,
  description text,
  avatar text,
  banner text,
  rules text,
  is_private boolean DEFAULT false,
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  member_count integer DEFAULT 0,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS community_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role varchar(20) DEFAULT 'member',
  joined_at timestamp DEFAULT now(),
  UNIQUE(community_id, user_id)
);

CREATE TABLE IF NOT EXISTS lists (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar(100) NOT NULL,
  description text,
  is_private boolean DEFAULT false,
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  member_count integer DEFAULT 0,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS list_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id uuid NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  added_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamp DEFAULT now(),
  UNIQUE(list_id, user_id)
);

CREATE TABLE IF NOT EXISTS creator_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier varchar(20) DEFAULT 'basic',
  price integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  expires_at timestamp,
  UNIQUE(subscriber_id, creator_id)
);

CREATE TABLE IF NOT EXISTS creator_tips (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  message text,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  advertiser_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title varchar(200) NOT NULL,
  content text,
  image_url text,
  target_url text,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  budget integer DEFAULT 0,
  is_active boolean DEFAULT true,
  starts_at timestamp,
  ends_at timestamp,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS geotags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tweet_id uuid NOT NULL REFERENCES tweets(id) ON DELETE CASCADE,
  latitude varchar(20) NOT NULL,
  longitude varchar(20) NOT NULL,
  place_name text,
  country varchar(100),
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hashtags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  hashtag varchar(200) NOT NULL UNIQUE,
  tweet_count integer DEFAULT 0,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tweet_hashtags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tweet_id uuid NOT NULL REFERENCES tweets(id) ON DELETE CASCADE,
  hashtag_id uuid NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
  UNIQUE(tweet_id, hashtag_id)
);
`;

export async function setupDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(createTables);
    console.log('Database tables created successfully');
  } catch (err) {
    console.error('Failed to create database tables:', err);
    throw err;
  } finally {
    client.release();
  }
}

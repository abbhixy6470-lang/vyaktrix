import { pgTable, serial, text, varchar, timestamp, boolean, integer, jsonb, uuid, primaryKey, uniqueIndex, index } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayName: varchar('display_name', { length: 100 }),
  bio: text('bio'),
  avatar: text('avatar'),
  banner: text('banner'),
  website: text('website'),
  location: text('location'),
  dateOfBirth: varchar('date_of_birth', { length: 10 }),
  termsAccepted: boolean('terms_accepted').default(false),
  verified: boolean('verified').default(false),
  private: boolean('private').default(false),
  deactivated: boolean('deactivated').default(false),
  role: varchar('role', { length: 20 }).default('user'),
  reputationScore: integer('reputation_score').default(0),
  followerCount: integer('follower_count').default(0),
  followingCount: integer('following_count').default(0),
  tweetCount: integer('tweet_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  usernameIdx: uniqueIndex('username_idx').on(table.username),
  emailIdx: uniqueIndex('email_idx').on(table.email),
}));

export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  refreshToken: text('refresh_token').notNull(),
  deviceInfo: jsonb('device_info'),
  ipAddress: varchar('ip_address', { length: 45 }),
  lastActive: timestamp('last_active').defaultNow(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const blocks = pgTable('blocks', {
  id: uuid('id').defaultRandom().primaryKey(),
  blockerId: uuid('blocker_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  blockedId: uuid('blocked_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  blockerBlockedIdx: uniqueIndex('blocker_blocked_idx').on(table.blockerId, table.blockedId),
}));

export const reports = pgTable('reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  reporterId: uuid('reporter_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  reportedUserId: uuid('reported_user_id').references(() => users.id, { onDelete: 'cascade' }),
  reportedTweetId: uuid('reported_tweet_id').references(() => tweets.id, { onDelete: 'cascade' }),
  reason: text('reason').notNull(),
  status: varchar('status', { length: 20 }).default('pending'),
  resolvedBy: uuid('resolved_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  resolvedAt: timestamp('resolved_at'),
});

export const tweets = pgTable('tweets', {
  id: uuid('id').defaultRandom().primaryKey(),
  authorId: uuid('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content'),
  replyToId: uuid('reply_to_id').references(() => tweets.id, { onDelete: 'set null' }),
  retweetOfId: uuid('retweet_of_id').references(() => tweets.id, { onDelete: 'set null' }),
  quoteOfId: uuid('quote_of_id').references(() => tweets.id, { onDelete: 'set null' }),
  isEdited: boolean('is_edited').default(false),
  isDraft: boolean('is_draft').default(false),
  isDeleted: boolean('is_deleted').default(false),
  sensitive: boolean('sensitive').default(false),
  views: integer('views').default(0),
  impressions: integer('impressions').default(0),
  likeCount: integer('like_count').default(0),
  retweetCount: integer('retweet_count').default(0),
  replyCount: integer('reply_count').default(0),
  bookmarkCount: integer('bookmark_count').default(0),
  hashtags: text('hashtags').array(),
  mentions: text('mentions').array(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  authorIdx: index('tweet_author_idx').on(table.authorId),
  createdAtIdx: index('tweet_created_at_idx').on(table.createdAt),
  replyToIdx: index('tweet_reply_to_idx').on(table.replyToId),
}));

export const tweetMedia = pgTable('tweet_media', {
  id: uuid('id').defaultRandom().primaryKey(),
  tweetId: uuid('tweet_id').notNull().references(() => tweets.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  type: varchar('type', { length: 20 }).notNull(),
  width: integer('width'),
  height: integer('height'),
  duration: integer('duration'),
  thumbnail: text('thumbnail'),
  size: integer('size'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const polls = pgTable('polls', {
  id: uuid('id').defaultRandom().primaryKey(),
  tweetId: uuid('tweet_id').notNull().references(() => tweets.id, { onDelete: 'cascade' }).unique(),
  options: text('options').array().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const pollVotes = pgTable('poll_votes', {
  id: uuid('id').defaultRandom().primaryKey(),
  pollId: uuid('poll_id').notNull().references(() => polls.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  optionIndex: integer('option_index').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  pollUserIdx: uniqueIndex('poll_user_idx').on(table.pollId, table.userId),
}));

export const likes = pgTable('likes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tweetId: uuid('tweet_id').notNull().references(() => tweets.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userTweetLikeIdx: uniqueIndex('user_tweet_like_idx').on(table.userId, table.tweetId),
}));

export const bookmarks = pgTable('bookmarks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tweetId: uuid('tweet_id').notNull().references(() => tweets.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userTweetBookmarkIdx: uniqueIndex('user_tweet_bookmark_idx').on(table.userId, table.tweetId),
}));

export const retweets = pgTable('retweets', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tweetId: uuid('tweet_id').notNull().references(() => tweets.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userTweetRetweetIdx: uniqueIndex('user_tweet_retweet_idx').on(table.userId, table.tweetId),
}));

export const followers = pgTable('followers', {
  id: uuid('id').defaultRandom().primaryKey(),
  followerId: uuid('follower_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  followingId: uuid('following_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  followerFollowingIdx: uniqueIndex('follower_following_idx').on(table.followerId, table.followingId),
}));

export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  senderId: uuid('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  receiverId: uuid('receiver_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content'),
  mediaUrl: text('media_url'),
  mediaType: varchar('media_type', { length: 20 }),
  isRead: boolean('is_read').default(false),
  isDeleted: boolean('is_deleted').default(false),
  replyToId: uuid('reply_to_id').references(() => messages.id),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  senderReceiverIdx: index('sender_receiver_idx').on(table.senderId, table.receiverId),
}));

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(),
  actorId: uuid('actor_id').references(() => users.id, { onDelete: 'cascade' }),
  tweetId: uuid('tweet_id').references(() => tweets.id, { onDelete: 'cascade' }),
  content: text('content'),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userNotificationIdx: index('user_notification_idx').on(table.userId, table.createdAt),
}));

export const trends = pgTable('trends', {
  id: uuid('id').defaultRandom().primaryKey(),
  hashtag: varchar('hashtag', { length: 100 }).notNull().unique(),
  tweetCount: integer('tweet_count').default(0),
  lastUsed: timestamp('last_used').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const audioRooms = pgTable('audio_rooms', {
  id: uuid('id').defaultRandom().primaryKey(),
  hostId: uuid('host_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  isRecording: boolean('is_recording').default(false),
  isLive: boolean('is_live').default(false),
  scheduledAt: timestamp('scheduled_at'),
 endedAt: timestamp('ended_at'),
  listenerCount: integer('listener_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const audioRoomParticipants = pgTable('audio_room_participants', {
  id: uuid('id').defaultRandom().primaryKey(),
  roomId: uuid('room_id').notNull().references(() => audioRooms.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).default('listener'),
  joinedAt: timestamp('joined_at').defaultNow(),
  leftAt: timestamp('left_at'),
}, (table) => ({
  roomUserIdx: uniqueIndex('room_user_idx').on(table.roomId, table.userId),
}));

export const communities = pgTable('communities', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  avatar: text('avatar'),
  banner: text('banner'),
  rules: text('rules'),
  isPrivate: boolean('is_private').default(false),
  ownerId: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  memberCount: integer('member_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const communityMembers = pgTable('community_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  communityId: uuid('community_id').notNull().references(() => communities.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).default('member'),
  joinedAt: timestamp('joined_at').defaultNow(),
}, (table) => ({
  communityUserIdx: uniqueIndex('community_user_idx').on(table.communityId, table.userId),
}));

export const communityPinnedPosts = pgTable('community_pinned_posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  communityId: uuid('community_id').notNull().references(() => communities.id, { onDelete: 'cascade' }),
  tweetId: uuid('tweet_id').notNull().references(() => tweets.id, { onDelete: 'cascade' }),
  pinnedBy: uuid('pinned_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

export const lists = pgTable('lists', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  isPrivate: boolean('is_private').default(false),
  ownerId: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  memberCount: integer('member_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const listMembers = pgTable('list_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  listId: uuid('list_id').notNull().references(() => lists.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  addedBy: uuid('added_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  listUserIdx: uniqueIndex('list_user_idx').on(table.listId, table.userId),
}));

export const creatorSubscriptions = pgTable('creator_subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  subscriberId: uuid('subscriber_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  creatorId: uuid('creator_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tier: varchar('tier', { length: 20 }).default('basic'),
  price: integer('price').notNull(),
  isActive: boolean('is_active').default(true),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  subscriberCreatorIdx: uniqueIndex('subscriber_creator_idx').on(table.subscriberId, table.creatorId),
}));

export const tips = pgTable('tips', {
  id: uuid('id').defaultRandom().primaryKey(),
  senderId: uuid('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  receiverId: uuid('receiver_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(),
  currency: varchar('currency', { length: 10 }).default('USD'),
  message: text('message'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const ads = pgTable('ads', {
  id: uuid('id').defaultRandom().primaryKey(),
  advertiserId: uuid('advertiser_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  mediaUrl: text('media_url'),
  targetUrl: text('target_url'),
  impressions: integer('impressions').default(0),
  clicks: integer('clicks').default(0),
  budget: integer('budget'),
  spent: integer('spent').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const adCampaigns = pgTable('ad_campaigns', {
  id: uuid('id').defaultRandom().primaryKey(),
  adId: uuid('ad_id').notNull().references(() => ads.id, { onDelete: 'cascade' }),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  targetGender: varchar('target_gender', { length: 10 }),
  targetAgeMin: integer('target_age_min'),
  targetAgeMax: integer('target_age_max'),
  targetLocation: text('target_location'),
  targetInterests: text('target_interests').array(),
  dailyBudget: integer('daily_budget'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const userReputation = pgTable('user_reputation', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  spamScore: integer('spam_score').default(0),
  abuseScore: integer('abuse_score').default(0),
  engagementScore: integer('engagement_score').default(0),
  influenceScore: integer('influence_score').default(0),
  overallScore: integer('overall_score').default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const geoTags = pgTable('geo_tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  tweetId: uuid('tweet_id').notNull().references(() => tweets.id, { onDelete: 'cascade' }).unique(),
  latitude: varchar('latitude', { length: 20 }).notNull(),
  longitude: varchar('longitude', { length: 20 }).notNull(),
  placeName: text('place_name'),
  country: varchar('country', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const contentClassification = pgTable('content_classification', {
  id: uuid('id').defaultRandom().primaryKey(),
  tweetId: uuid('tweet_id').notNull().references(() => tweets.id, { onDelete: 'cascade' }).unique(),
  isNSFW: boolean('is_nsfw').default(false),
  isViolent: boolean('is_violent').default(false),
  isHateSpeech: boolean('is_hate_speech').default(false),
  isSpam: boolean('is_spam').default(false),
  confidence: integer('confidence').default(0),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

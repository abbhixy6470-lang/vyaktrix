export interface User {
  id: string;
  username: string;
  email?: string;
  displayName: string | null;
  bio: string | null;
  avatar: string | null;
  banner: string | null;
  website: string | null;
  location: string | null;
  verified: boolean;
  private: boolean;
  deactivated: boolean;
  role: string;
  followerCount: number;
  followingCount: number;
  tweetCount: number;
  createdAt: string;
}

export interface Tweet {
  id: string;
  authorId: string;
  content: string | null;
  replyToId: string | null;
  retweetOfId: string | null;
  quoteOfId: string | null;
  isEdited: boolean;
  isDraft: boolean;
  isDeleted: boolean;
  sensitive: boolean;
  views: number;
  impressions: number;
  likeCount: number;
  retweetCount: number;
  replyCount: number;
  bookmarkCount: number;
  hashtags: string[];
  mentions: string[];
  createdAt: string;
  media?: TweetMedia[];
  poll?: Poll;
  geo?: Geotag;
}

export interface TweetMedia {
  id: string;
  tweetId: string;
  url: string;
  type: 'image' | 'gif' | 'video';
  width: number | null;
  height: number | null;
  duration: number | null;
  thumbnail: string | null;
}

export interface Poll {
  id: string;
  tweetId: string;
  options: string[];
  expiresAt: string;
}

export interface PollVote {
  id: string;
  pollId: string;
  userId: string;
  optionIndex: number;
}

export interface Geotag {
  id: string;
  tweetId: string;
  latitude: string;
  longitude: string;
  placeName: string | null;
  country: string | null;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  actorId: string | null;
  tweetId: string | null;
  content: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  isRead: boolean;
  isDeleted: boolean;
  replyToId: string | null;
  createdAt: string;
}

export interface AudioRoom {
  id: string;
  hostId: string;
  title: string;
  description: string | null;
  isRecording: boolean;
  isLive: boolean;
  scheduledAt: string | null;
  listenerCount: number;
  participants?: AudioRoomParticipant[];
}

export interface AudioRoomParticipant {
  id: string;
  roomId: string;
  userId: string;
  role: 'host' | 'co_host' | 'speaker' | 'listener';
  joinedAt: string;
}

export interface Community {
  id: string;
  name: string;
  description: string | null;
  avatar: string | null;
  banner: string | null;
  rules: string | null;
  isPrivate: boolean;
  ownerId: string;
  memberCount: number;
  members?: CommunityMember[];
}

export interface CommunityMember {
  id: string;
  communityId: string;
  userId: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
}

export interface List {
  id: string;
  name: string;
  description: string | null;
  isPrivate: boolean;
  ownerId: string;
  memberCount: number;
  members?: ListMember[];
}

export interface ListMember {
  id: string;
  listId: string;
  userId: string;
  addedBy: string;
}

export interface Trend {
  id: string;
  hashtag: string;
  tweetCount: number;
}

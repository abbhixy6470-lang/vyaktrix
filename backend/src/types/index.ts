export interface AuthPayload {
  userId: string;
  username: string;
  role: string;
}

export interface AuthRequest {
  user?: AuthPayload;
  body: any;
  params: Record<string, string>;
  query: Record<string, string | string[] | undefined>;
  headers: Record<string, string | undefined>;
  app: any;
  ip?: string;
  socket: any;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  cursor?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    cursor?: string;
    hasMore?: boolean;
  };
}

export type NotificationType =
  | 'like'
  | 'retweet'
  | 'reply'
  | 'mention'
  | 'follow'
  | 'message'
  | 'poll_result'
  | 'system_alert';

export type AudioRoomRole = 'host' | 'co_host' | 'speaker' | 'listener';

export type CommunityRole = 'owner' | 'admin' | 'moderator' | 'member';

export type ListVisibility = 'public' | 'private';

export type SubscriptionTier = 'basic' | 'premium' | 'vip';

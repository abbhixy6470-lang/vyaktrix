import { Request } from 'express';

export interface AuthPayload {
  userId: string;
  username: string;
  role: string;
}

export interface AuthRequest extends Request<any, any, any, any, any> {
  user?: AuthPayload;
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

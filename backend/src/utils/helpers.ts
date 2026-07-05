import { v4 as uuid } from 'uuid';
import { ApiResponse } from '../types';

export const generateId = (): string => uuid();

export const successResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
  success: true,
  data,
  message,
});

export const errorResponse = (error: string): ApiResponse => ({
  success: false,
  error,
});

export const parsePagination = (query: { page?: string; limit?: string }) => {
  const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10) || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

export const extractHashtags = (content: string): string[] => {
  const matches = content.match(/#\w+/g);
  return matches ? [...new Set(matches.map((tag) => tag.toLowerCase()))] : [];
};

export const extractMentions = (content: string): string[] => {
  const matches = content.match(/@\w+/g);
  return matches ? [...new Set(matches.map((m) => m.slice(1)))] : [];
};

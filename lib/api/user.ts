/**
 * User API
 * User profile, wishlist, recently viewed, search history, notifications
 */

import { api } from './client';
import type { ApiProduct } from './products';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  is_verified: boolean;
  role: 'user' | 'admin' | 'moderator';
  preferences: UserPreferences;
  stats: UserStats;
  created_at: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  notifications: {
    email: boolean;
    price_drops: boolean;
    new_arrivals: boolean;
    trending: boolean;
    weekly_digest: boolean;
  };
}

export interface UserStats {
  products_researched: number;
  wishlist_count: number;
  comparisons_made: number;
  searches_made: number;
  reviews_written: number;
}

export interface Notification {
  id: string;
  type: 'price_drop' | 'trending' | 'new_product' | 'system' | 'recommendation';
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  result_count: number;
  clicked_product_id?: string;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  product: ApiProduct;
  added_at: string;
}

export interface RecentlyViewedItem {
  id: string;
  product: ApiProduct;
  viewed_at: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/** Get current user profile */
export async function getProfile(): Promise<UserProfile> {
  return api.get<UserProfile>('/me');
}

/** Update user profile */
export async function updateProfile(
  data: Partial<Pick<UserProfile, 'full_name' | 'bio' | 'location' | 'preferences'>>
): Promise<UserProfile> {
  return api.put<UserProfile>('/me', data);
}

/** Upload avatar */
export async function uploadAvatar(file: File): Promise<{ avatar_url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(
    `${process.env.API_URL || 'https://api.vyzo.in/api/v1'}/me/avatar`,
    {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('vyzo_access_token') : ''}`,
      },
    }
  );
  return res.json();
}

/** Get user's wishlist */
export async function getWishlist(): Promise<WishlistItem[]> {
  return api.get<WishlistItem[]>('/me/wishlist');
}

/** Add product to wishlist */
export async function addToWishlist(productId: string): Promise<void> {
  await api.post(`/me/wishlist/${productId}`);
}

/** Remove product from wishlist */
export async function removeFromWishlist(productId: string): Promise<void> {
  await api.delete(`/me/wishlist/${productId}`);
}

/** Get recently viewed products */
export async function getRecentlyViewed(
  limit = 20
): Promise<RecentlyViewedItem[]> {
  return api.get<RecentlyViewedItem[]>('/me/recently-viewed', { limit });
}

/** Get search history */
export async function getSearchHistory(
  limit = 20
): Promise<SearchHistoryItem[]> {
  return api.get<SearchHistoryItem[]>('/me/search-history', { limit });
}

/** Delete a search history item */
export async function deleteSearchHistoryItem(id: string): Promise<void> {
  await api.delete(`/me/search-history/${id}`);
}

/** Clear all search history */
export async function clearSearchHistory(): Promise<void> {
  await api.delete('/me/search-history');
}

/** Get user notifications */
export async function getNotifications(
  page = 1,
  per_page = 20
): Promise<{ items: Notification[]; unread_count: number }> {
  return api.get('/me/notifications', { page, per_page });
}

/** Mark notification as read */
export async function markNotificationRead(id: string): Promise<void> {
  await api.put(`/me/notifications/${id}/read`);
}

/** Mark all notifications as read */
export async function markAllNotificationsRead(): Promise<void> {
  await api.put('/me/notifications/read-all');
}

/** Get personalized recommendations */
export async function getRecommendations(
  limit = 8
): Promise<{ product: ApiProduct; score: number; reason: string }[]> {
  return api.get('/me/recommendations', { limit });
}

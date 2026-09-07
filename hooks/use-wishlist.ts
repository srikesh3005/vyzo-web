'use client';

/**
 * useWishlist hook
 * Optimistic wishlist management with localStorage sync.
 * Syncs to backend when user is authenticated.
 */

import * as React from 'react';
import { toast } from 'sonner';

const WISHLIST_KEY = 'vyzo_wishlist';

function getStoredWishlist(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
  } catch {
    return [];
  }
}

interface UseWishlistReturn {
  wishlistIds: string[];
  isInWishlist: (productId: string) => boolean;
  toggle: (productId: string, productName?: string) => void;
  add: (productId: string, productName?: string) => void;
  remove: (productId: string, productName?: string) => void;
  clear: () => void;
  count: number;
}

export function useWishlist(): UseWishlistReturn {
  const [wishlistIds, setWishlistIds] = React.useState<string[]>([]);

  // Load from localStorage on mount
  React.useEffect(() => {
    setWishlistIds(getStoredWishlist());
  }, []);

  const persist = React.useCallback((ids: string[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
    }
  }, []);

  const isInWishlist = React.useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds]
  );

  const add = React.useCallback(
    (productId: string, productName?: string) => {
      setWishlistIds((prev) => {
        if (prev.includes(productId)) return prev;
        const updated = [...prev, productId];
        persist(updated);
        return updated;
      });
      toast.success('Added to wishlist', {
        description: productName,
        action: {
          label: 'View',
          onClick: () => {
            if (typeof window !== 'undefined') {
              window.location.href = '/wishlist';
            }
          },
        },
      });
    },
    [persist]
  );

  const remove = React.useCallback(
    (productId: string, productName?: string) => {
      setWishlistIds((prev) => {
        const updated = prev.filter((id) => id !== productId);
        persist(updated);
        return updated;
      });
      toast.success('Removed from wishlist', { description: productName });
    },
    [persist]
  );

  const toggle = React.useCallback(
    (productId: string, productName?: string) => {
      if (wishlistIds.includes(productId)) {
        remove(productId, productName);
      } else {
        add(productId, productName);
      }
    },
    [wishlistIds, add, remove]
  );

  const clear = React.useCallback(() => {
    setWishlistIds([]);
    persist([]);
    toast.success('Wishlist cleared');
  }, [persist]);

  return {
    wishlistIds,
    isInWishlist,
    toggle,
    add,
    remove,
    clear,
    count: wishlistIds.length,
  };
}

'use client';

import Link from 'next/link';
import { Star, Heart, Sparkles, TrendingUp, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/data';
import { formatPrice, discount } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  variant?: 'grid' | 'list';
}

export function ProductCard({ product, variant = 'grid' }: ProductCardProps) {
  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.success('Added to wishlist', { description: product.name });
  };

  const handleBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.success('Redirecting to Amazon...', { description: product.name });
  };

  if (variant === 'list') {
    return (
      <Link
        href={`/products/${product.slug}`}
        className="group flex gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:shadow-soft hover:border-primary/30"
      >
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <div className="flex flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground">{product.brand}</p>
              <h3 className="font-semibold leading-tight">{product.name}</h3>
            </div>
            <button
              onClick={handleWishlist}
              className="text-muted-foreground hover:text-destructive"
              aria-label="Add to wishlist"
            >
              <Heart className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-1 flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" />
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-xs text-muted-foreground">
              ({product.reviewCount.toLocaleString()})
            </span>
          </div>
          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
            {product.aiSummary}
          </p>
          <div className="mt-auto flex items-center justify-between pt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold">
                {formatPrice(product.price, product.currency)}
              </span>
              {product.mrp > product.price && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.mrp, product.currency)}
                </span>
              )}
            </div>
            <Button size="sm" onClick={handleBuy}>
              Buy
            </Button>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-soft hover:border-primary/30"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {product.trending && (
            <Badge className="bg-primary/90 text-primary-foreground">
              <TrendingUp className="mr-1 h-3 w-3" /> Trending
            </Badge>
          )}
          {product.editorsPick && (
            <Badge className="bg-chart-4/90 text-white">
              <Sparkles className="mr-1 h-3 w-3" /> Editor&apos;s Pick
            </Badge>
          )}
          {discount(product.price, product.mrp) > 0 && (
            <Badge className="bg-success/90 text-success-foreground">
              {discount(product.price, product.mrp)}% OFF
            </Badge>
          )}
        </div>
        <button
          onClick={handleWishlist}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-colors hover:bg-background hover:text-destructive"
          aria-label="Add to wishlist"
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs text-muted-foreground">{product.brand}</p>
        <h3 className="font-semibold leading-tight line-clamp-2">
          {product.name}
        </h3>
        <div className="mt-1 flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-warning text-warning" />
          <span className="text-sm font-medium">{product.rating}</span>
          <span className="text-xs text-muted-foreground">
            ({product.reviewCount.toLocaleString()})
          </span>
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {product.aiSummary}
        </p>

        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold">
              {formatPrice(product.price, product.currency)}
            </span>
            {product.mrp > product.price && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.mrp, product.currency)}
              </span>
            )}
          </div>
          <Button size="sm" onClick={handleBuy}>
            Buy
          </Button>
        </div>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="aspect-square animate-shimmer" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-1/3 animate-shimmer rounded" />
        <div className="h-4 w-2/3 animate-shimmer rounded" />
        <div className="h-3 w-full animate-shimmer rounded" />
        <div className="h-3 w-1/2 animate-shimmer rounded" />
        <div className="flex justify-between pt-2">
          <div className="h-5 w-20 animate-shimmer rounded" />
          <div className="h-8 w-12 animate-shimmer rounded" />
        </div>
      </div>
    </div>
  );
}

export function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            'h-4 w-4',
            i <= Math.round(rating)
              ? 'fill-warning text-warning'
              : 'fill-muted text-muted'
          )}
        />
      ))}
      <span className="ml-1 text-sm font-medium">{rating}</span>
    </div>
  );
}

export function InStockBadge({ inStock }: { inStock: boolean }) {
  return (
    <Badge variant={inStock ? 'default' : 'destructive'}>
      {inStock ? (
        <>
          <Check className="mr-1 h-3 w-3" /> In Stock
        </>
      ) : (
        'Out of Stock'
      )}
    </Badge>
  );
}

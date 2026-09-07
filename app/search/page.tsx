'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  TrendingUp,
  Clock,
  X,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { PageShell, Container } from '@/components/page-shell';
import { ProductCard, ProductCardSkeleton } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { searchProducts, getAutocomplete, getTrendingSearches } from '@/lib/api/search';
import { getTrendingProducts } from '@/lib/api/products';
import type { TrendingSearchResult } from '@/lib/api/search';
import type { Product } from '@/lib/data';
import { isAmazonUrl } from '@/lib/amazon/asin';

const recentSearches = ['MacBook Air', 'Sony headphones', 'iPhone 15']; // Can be stored in localStorage later

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [searched, setSearched] = React.useState(false);

  // Data states
  const [trending, setTrending] = React.useState<Product[]>([]);
  const [popularSearches, setPopularSearches] = React.useState<string[]>([
    'Best laptop under ₹80k',
    'Noise cancelling headphones',
    'Gaming phone',
  ]);
  const [suggestions, setSuggestions] = React.useState<any[]>([]);
  const [results, setResults] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [importLoading, setImportLoading] = React.useState(false);
  const [importError, setImportError] = React.useState<string | null>(null);

  // Load initial data
  React.useEffect(() => {
    getTrendingProducts(4).then(res => {
      setTrending(res.map(p => ({
        id: p.id, slug: p.slug, name: p.name, brand: p.brand, category: p.category,
        price: p.price, mrp: p.mrp, currency: p.currency, rating: p.rating, reviewCount: p.review_count,
        image: p.image, gallery: [], inStock: p.in_stock, trending: p.is_trending, featured: p.is_featured,
        editorsPick: false, bestSeller: false, aiSummary: p.ai_summary?.summary || '', pros: [], cons: [], specs: {}, description: ''
      })));
    }).catch(() => {});

    getTrendingSearches(6).then(res => {
      if (res.length > 0) setPopularSearches(res.map(r => r.query));
    }).catch(() => {});
  }, []);

  // Autocomplete debounce
  React.useEffect(() => {
    if (!query || searched || query.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      getAutocomplete(query).then(setSuggestions).catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [query, searched]);

  // Execute full search
  const executeSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    setSearched(true);
    setImportError(null);
    setResults([]);

    if (isAmazonUrl(searchQuery)) {
      setImportLoading(true);
      try {
        const response = await fetch('/api/v1/products/import-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: searchQuery }),
        });
        
        const data = await response.json();
        
        if (data.success && data.data) {
          router.push(`/products/${data.data.slug}`);
        } else {
          setImportError(data.error?.message || "We couldn't identify this Amazon product. Please try another Amazon link.");
        }
      } catch (err) {
        setImportError("Something went wrong. Please try again.");
      } finally {
        setImportLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const res = await searchProducts({ q: searchQuery, per_page: 20 });
      setResults(res.items.map((p: any) => ({
        id: p.id, slug: p.slug, name: p.name, brand: p.brand, category: p.category,
        price: p.price, mrp: p.mrp, currency: p.currency, rating: p.rating, reviewCount: p.review_count,
        image: p.image, gallery: [], inStock: p.in_stock, trending: p.is_trending, featured: p.is_featured,
        editorsPick: false, bestSeller: false, aiSummary: p.ai_summary?.summary || '', pros: [], cons: [], specs: {}, description: ''
      })));
    } catch (err) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <Container className="py-10">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-bold">Search</h1>
          <p className="mt-1 text-muted-foreground">
            Find the perfect product with Vyzo AI-powered search
          </p>

          {/* Search bar */}
          <div className="relative mt-6">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearched(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  executeSearch(query);
                }
              }}
              placeholder="Search for products, brands, or categories..."
              className="w-full rounded-xl border border-border bg-card py-3.5 pl-12 pr-12 text-sm outline-none transition-all focus:border-primary/40 focus:shadow-glow"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setSearched(false);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Autocomplete */}
          {query && !searched && suggestions.length > 0 && (
            <div className="mt-2 overflow-hidden rounded-xl border border-border bg-card shadow-soft">
              {suggestions.map((p) => (
                <Link
                  key={`${p.type}-${p.text}`}
                  href={p.slug ? `/products/${p.slug}` : `/search?q=${encodeURIComponent(p.text)}`}
                  className="flex items-center gap-3 p-3 transition-colors hover:bg-accent"
                >
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.text}
                      className="h-10 w-10 rounded-md object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                      <Search className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium capitalize">{p.text}</p>
                    <p className="text-xs text-muted-foreground capitalize">{p.type}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}

          {/* Default state */}
          {!query && (
            <div className="mt-8 space-y-8">
              <div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold">Recent Searches</h2>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {recentSearches.map((s) => (
                    <button
                      key={s}
                      onClick={() => executeSearch(s)}
                      className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Clock className="h-3 w-3" /> {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold">Popular Searches</h2>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {popularSearches.map((s) => (
                    <button
                      key={s}
                      onClick={() => executeSearch(s)}
                      className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold">Trending Products</h2>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {trending.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {query && searched && (
            <div className="mt-8">
              {importLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
                  <p className="text-lg font-semibold">Finding product...</p>
                  <p className="text-sm text-muted-foreground mt-2">Extracting details from Amazon</p>
                </div>
              ) : importError ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-red-500/50 bg-red-500/10 py-20 text-center text-red-500">
                  <X className="h-12 w-12 mb-4" />
                  <p className="text-lg font-semibold">{importError}</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    {results.length} results for &ldquo;{query}&rdquo;
                  </p>
                  {loading ? (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <ProductCardSkeleton key={i} />
                      ))}
                    </div>
                  ) : results.length === 0 ? (
                    <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
                      <Search className="h-12 w-12 text-muted-foreground/50" />
                      <p className="mt-4 text-lg font-semibold">No results found</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Try a different search term or browse our categories
                      </p>
                      <Link href="/categories">
                        <Button variant="outline" className="mt-4">
                          Browse Categories
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      {results.map((p) => (
                        <ProductCard key={p.id} product={p} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </Container>
    </PageShell>
  );
}

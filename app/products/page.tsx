'use client';

import * as React from 'react';
import { LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react';
import { PageShell, PageHeader, Container } from '@/components/page-shell';
import { ProductCard, ProductCardSkeleton } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { brands, categories } from '@/lib/data';
import type { Product } from '@/lib/data';
import { getProducts } from '@/lib/api';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export default function ProductsPage() {
  const [view, setView] = React.useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = React.useState(true);
  const [selectedBrands, setSelectedBrands] = React.useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(
    []
  );
  const [priceRange, setPriceRange] = React.useState<number[]>([0, 250000]);
  const [minRating, setMinRating] = React.useState(0);
  const [inStockOnly, setInStockOnly] = React.useState(false);
  const [sortBy, setSortBy] = React.useState('featured');

  const [allProducts, setAllProducts] = React.useState<Product[]>([]);

  React.useEffect(() => {
    setLoading(true);
    getProducts({ per_page: 100 }).then((res) => {
      const mapped = res.items.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        brand: p.brand,
        category: p.category,
        price: p.price ?? 0,
        mrp: p.mrp ?? 0,
        currency: p.currency,
        rating: p.rating ?? 0,
        reviewCount: p.review_count ?? 0,
        image: p.image,
        gallery: [],
        inStock: p.in_stock,
        trending: p.is_trending,
        featured: p.is_featured,
        editorsPick: false,
        bestSeller: false,
        aiSummary: p.ai_summary?.summary ?? '',
        pros: [],
        cons: [],
        specs: {},
        description: '',
      }));
      setAllProducts(mapped);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const toggle = (arr: string[], val: string, setter: (v: string[]) => void) =>
    setter(
      arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]
    );

  const filtered = allProducts.filter((p) => {
    if (selectedBrands.length && !selectedBrands.includes(p.brand))
      return false;
    if (selectedCategories.length && !selectedCategories.includes(p.category))
      return false;
    if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
    if (p.rating < minRating) return false;
    if (inStockOnly && !p.inStock) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'reviews':
        return b.reviewCount - a.reviewCount;
      default:
        return Number(b.featured) - Number(a.featured);
    }
  });

  const activeFilters =
    selectedBrands.length +
    selectedCategories.length +
    (minRating > 0 ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  const clearAll = () => {
    setSelectedBrands([]);
    setSelectedCategories([]);
    setMinRating(0);
    setInStockOnly(false);
    setPriceRange([0, 250000]);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold">Categories</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label
              key={cat.slug}
              className="flex items-center gap-2 text-sm cursor-pointer"
            >
              <Checkbox
                checked={selectedCategories.includes(cat.slug)}
                onCheckedChange={() =>
                  toggle(selectedCategories, cat.slug, setSelectedCategories)
                }
              />
              <span className="capitalize">{cat.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {cat.count}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold">Brands</h3>
        <div className="space-y-2">
          {brands.slice(0, 8).map((brand) => (
            <label
              key={brand}
              className="flex items-center gap-2 text-sm cursor-pointer"
            >
              <Checkbox
                checked={selectedBrands.includes(brand)}
                onCheckedChange={() =>
                  toggle(selectedBrands, brand, setSelectedBrands)
                }
              />
              {brand}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold">Price Range</h3>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            min={0}
            max={250000}
            step={5000}
          />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>₹{priceRange[0].toLocaleString()}</span>
            <span>₹{priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold">Minimum Rating</h3>
        <div className="flex gap-2">
          {[0, 3, 4, 4.5].map((r) => (
            <button
              key={r}
              onClick={() => setMinRating(r)}
              className={cn(
                'rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                minRating === r
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:bg-accent'
              )}
            >
              {r === 0 ? 'Any' : `${r}+ ★`}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Checkbox
            checked={inStockOnly}
            onCheckedChange={(v) => setInStockOnly(!!v)}
          />
          In stock only
        </label>
      </div>

      {activeFilters > 0 && (
        <Button variant="outline" size="sm" onClick={clearAll} className="w-full">
          Clear all filters ({activeFilters})
        </Button>
      )}
    </div>
  );

  return (
    <PageShell>
      <PageHeader
        title="All Products"
        description="Browse our complete catalog of AI-researched products"
      />

      <Container className="py-8">
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">Filters</h2>
                {activeFilters > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                    className="h-7 text-xs"
                  >
                    Clear all
                  </Button>
                )}
              </div>
              <FilterContent />
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
                      Filters
                      {activeFilters > 0 && (
                        <Badge className="ml-1">{activeFilters}</Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 overflow-y-auto">
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon" className="absolute right-4 top-4">
                        <X className="h-4 w-4" />
                      </Button>
                    </SheetClose>
                    <h2 className="mb-4 text-lg font-semibold">Filters</h2>
                    <FilterContent />
                  </SheetContent>
                </Sheet>
                <p className="text-sm text-muted-foreground">
                  {loading ? 'Loading...' : `${sorted.length} products`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="reviews">Most Reviewed</option>
                </select>
                <div className="flex items-center rounded-md border border-border">
                  <Button
                    variant={view === 'grid' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-9 w-9 rounded-r-none"
                    onClick={() => setView('grid')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={view === 'list' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-9 w-9 rounded-l-none"
                    onClick={() => setView('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div
                className={cn(
                  'grid gap-4',
                  view === 'grid'
                    ? 'grid-cols-2 sm:grid-cols-3'
                    : 'grid-cols-1'
                )}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
                <p className="text-lg font-semibold">No products found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try adjusting your filters
                </p>
                <Button variant="outline" onClick={clearAll} className="mt-4">
                  Clear filters
                </Button>
              </div>
            ) : (
              <div
                className={cn(
                  'grid gap-4',
                  view === 'grid'
                    ? 'grid-cols-2 sm:grid-cols-3'
                    : 'grid-cols-1'
                )}
              >
                {sorted.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant={view}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
    </PageShell>
  );
}

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PageShell, Container } from '@/components/page-shell';
import { categories, getProductsByCategory, brands } from '@/lib/data';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { ChevronRight, Filter, SlidersHorizontal } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

export function generateStaticParams() {
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const category = categories.find((c) => c.slug === params.slug);
  
  if (!category) {
    notFound();
  }

  const products = getProductsByCategory(category.slug);
  const Icon = (LucideIcons as any)[category.icon] || LucideIcons.LayoutGrid;

  return (
    <PageShell>
      {/* Category Hero */}
      <div className="relative overflow-hidden bg-card/30 border-b border-border">
        <div className="absolute inset-0 z-0">
          <img src={category.image} alt={category.name} className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
        </div>
        <Container className="relative z-10 py-12 md:py-16">
          <div className="flex items-center text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link href="/categories" className="hover:text-primary transition-colors">Categories</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-foreground font-medium">{category.name}</span>
          </div>
          
          <div className="flex items-start gap-6">
            <div className="hidden sm:flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
              <Icon className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">{category.name}</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mb-4">{category.description}</p>
              <Badge variant="secondary" className="text-sm">
                {products.length} Products Available
              </Badge>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Products</h2>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" /> Filters
            </Button>
          </div>

          {/* Filter Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-8 pr-6 border-r border-border">
            <div className="flex items-center gap-2 font-semibold text-lg pb-4 border-b border-border">
              <SlidersHorizontal className="h-5 w-5" /> Filters
            </div>

            {/* Price Range */}
            <div className="space-y-4">
              <h3 className="font-medium">Price Range</h3>
              <Slider defaultValue={[100000]} max={250000} step={1000} className="my-6" />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>₹0</span>
                <span>₹2,50,000+</span>
              </div>
            </div>

            {/* Brands */}
            <div className="space-y-4">
              <h3 className="font-medium">Brands</h3>
              <div className="space-y-3">
                {brands.slice(0, 6).map(brand => (
                  <div key={brand} className="flex items-center space-x-2">
                    <Checkbox id={`brand-${brand}`} />
                    <label htmlFor={`brand-${brand}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {brand}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div className="space-y-4">
              <h3 className="font-medium">Rating</h3>
              <div className="space-y-3">
                {[4, 3, 2, 1].map(rating => (
                  <div key={rating} className="flex items-center space-x-2">
                    <Checkbox id={`rating-${rating}`} />
                    <label htmlFor={`rating-${rating}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1">
                      {rating} Stars & Up
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-4">
              <h3 className="font-medium">Availability</h3>
              <div className="flex items-center space-x-2">
                <Checkbox id="in-stock" defaultChecked />
                <label htmlFor="in-stock" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  In Stock Only
                </label>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-2xl bg-card/50">
                <Icon className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-6 max-w-sm text-balance">
                  We couldn't find any products in the {category.name} category matching your criteria.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/categories">Browse other categories</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} variant="grid" />
                ))}
              </div>
            )}
          </main>
        </div>
      </Container>
    </PageShell>
  );
}

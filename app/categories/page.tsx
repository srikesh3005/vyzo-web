import React from 'react';
import Link from 'next/link';
import { PageShell, Container } from '@/components/page-shell';
import { categories, brands } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import * as LucideIcons from 'lucide-react';

export default function CategoriesPage() {
  return (
    <PageShell>
      <div className="relative overflow-hidden bg-muted/30 py-20 border-b border-border">
        <div className="absolute inset-0 bg-grid-bg bg-[size:32px_32px] opacity-[0.03]"></div>
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 blur-3xl opacity-20 bg-primary w-[500px] h-[500px] rounded-full mix-blend-screen pointer-events-none"></div>
        <Container className="relative z-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-4">
            Browse Categories
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Explore our curated selection of top-tier products across all major tech categories.
          </p>
        </Container>
      </div>

      <Container className="py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const Icon = (LucideIcons as any)[category.icon] || LucideIcons.LayoutGrid;
            
            return (
              <Link 
                key={category.id} 
                href={`/categories/${category.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:shadow-glow hover:-translate-y-1 block h-[280px]"
              >
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30 group-hover:from-black/80 transition-colors duration-300" />
                </div>
                
                {/* Content */}
                <div className="relative z-10 flex flex-col h-full p-6 text-white">
                  <div className="mb-auto">
                    <div className="bg-white/20 p-3 rounded-xl inline-block backdrop-blur-md mb-4 border border-white/20">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold mb-2 group-hover:text-primary-foreground transition-colors">
                      {category.name}
                    </h2>
                    <p className="text-sm text-white/70 line-clamp-2 mb-4">
                      {category.description}
                    </p>
                    <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-white/10 backdrop-blur-sm">
                      {category.count} Products
                    </Badge>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Popular Brands */}
        <div className="mt-24 text-center">
          <h2 className="text-2xl font-bold mb-8">Popular Brands</h2>
          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {brands.map((brand) => (
              <div 
                key={brand}
                className="px-6 py-3 rounded-xl border border-border bg-card hover:bg-muted transition-colors cursor-pointer text-lg font-medium shadow-sm hover:shadow-soft"
              >
                {brand}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </PageShell>
  );
}

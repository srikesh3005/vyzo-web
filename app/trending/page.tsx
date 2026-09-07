'use client';

import React, { useState, useEffect } from 'react';
import { PageShell, Container } from '@/components/page-shell';
import { products, categories, type Product } from '@/lib/data';
import { ProductCard } from '@/components/product-card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Flame, Search, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function TrendingPage() {
  const [statsNumber, setStatsNumber] = useState(12045);
  const trendingProducts = products.filter(p => p.trending);
  const hotRightNow = trendingProducts.slice(0, 4);

  const trendingSearches = [
    'best noise cancelling headphones',
    'iphone 15 pro max',
    'oled tvs 2024',
    'gaming laptops under 100k',
    'macbook air m3',
    'smartwatches for android'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStatsNumber(prev => prev + Math.floor(Math.random() * 5));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <PageShell>
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border bg-card/30">
        <div className="absolute inset-0 bg-grid-bg bg-[size:32px_32px] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
        
        <Container className="relative py-16 md:py-24 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <Badge variant="secondary" className="mb-6 border-primary/20 bg-primary/10 text-primary px-4 py-1.5 text-sm">
              <Flame className="mr-2 h-4 w-4 text-orange-500 animate-pulse" /> Updated Hourly
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl mb-4 flex items-center justify-center gap-4">
              Trending Now <TrendingUp className="h-10 w-10 sm:h-14 sm:w-14 text-primary" />
            </h1>
            <p className="max-w-2xl text-lg sm:text-xl text-muted-foreground text-balance">
              The most researched and compared products this week by our community.
            </p>

            <div className="mt-8 flex items-center gap-3 glass-card px-6 py-3 rounded-full border-primary/20">
              <div className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
              </div>
              <p className="text-sm font-medium">
                <span className="text-foreground text-base tabular-nums font-bold">
                  {statsNumber.toLocaleString()}
                </span> products researched today
              </p>
            </div>
          </motion.div>
        </Container>
      </div>

      <Container className="py-12">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-500" /> Hot Right Now
          </h2>
          <Tabs defaultValue="week" className="w-[300px]">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
              <TabsTrigger value="month">This Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Hot Right Now Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hotRightNow.map((product, index) => (
            <div key={product.id} className="relative group">
              <div className="absolute -left-4 -top-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shadow-lg text-lg transform transition-transform group-hover:scale-110 group-hover:rotate-12">
                #{index + 1}
              </div>
              <div className="h-full transform transition-all duration-300 hover:-translate-y-1">
                <ProductCard product={product} variant="list" />
              </div>
            </div>
          ))}
        </div>

        {/* Trending Searches */}
        <div className="mt-16 mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" /> Trending Searches
          </h3>
          <div className="flex flex-wrap gap-2">
            {trendingSearches.map((search) => (
              <Badge key={search} variant="secondary" className="px-4 py-2 text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer glass-card">
                <TrendingUp className="mr-2 h-3 w-3 text-muted-foreground" />
                {search}
              </Badge>
            ))}
          </div>
        </div>

        {/* Trending by Category */}
        <div className="mt-16 space-y-12">
          {categories.filter(c => c.slug === 'smartphones' || c.slug === 'laptops' || c.slug === 'headphones').map((category) => {
            const catProducts = products.filter(p => p.category === category.slug).slice(0, 4);
            if (catProducts.length === 0) return null;

            return (
              <div key={category.id} className="pt-8 border-t border-border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold">Trending in {category.name}</h3>
                  <Link href={`/categories/${category.slug}`} className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                    View all <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                
                <div className="flex overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x">
                  <div className="flex gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 min-w-max sm:min-w-0 w-full">
                    {catProducts.map((product) => (
                      <div key={product.id} className="w-[280px] sm:w-auto snap-start shrink-0">
                        <ProductCard product={product} variant="grid" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </PageShell>
  );
}

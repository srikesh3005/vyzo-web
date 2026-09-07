'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { History, Trash2 } from 'lucide-react';
import { PageShell, PageHeader, Container } from '@/components/page-shell';
import { ProductCard } from '@/components/product-card';
import { products } from '@/lib/data';
import { Button } from '@/components/ui/button';

export default function RecentlyViewedPage() {
  const [history, setHistory] = useState([
    { group: 'Today', items: products.slice(0, 4) },
    { group: 'Yesterday', items: products.slice(4, 7) },
    { group: 'Last 7 days', items: products.slice(7, 10) },
  ]);

  const clearHistory = () => setHistory([]);

  const hasItems = history.some(g => g.items.length > 0);

  return (
    <PageShell>
      <PageHeader 
        title="Recently Viewed" 
        description="Products you've looked at recently."
      >
        {hasItems && (
          <Button variant="outline" onClick={clearHistory} className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10">
            <Trash2 className="h-4 w-4" /> Clear History
          </Button>
        )}
      </PageHeader>

      <Container className="pb-12">
        {!hasItems ? (
           <div className="flex flex-col items-center justify-center py-20 text-center glass-card rounded-2xl">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-full bg-muted p-6 mb-4"
            >
              <History className="h-12 w-12 text-muted-foreground" />
            </motion.div>
            <h2 className="text-xl font-bold mb-2">No browsing history</h2>
            <p className="text-muted-foreground mb-6">You haven&apos;t viewed any products yet.</p>
            <Button asChild>
              <a href="/">Browse Products</a>
            </Button>
          </div>
        ) : (
          <div className="space-y-12">
            {history.map((group, groupIdx) => group.items.length > 0 && (
              <motion.div 
                key={group.group}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIdx * 0.1 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <h3 className="text-lg font-bold">{group.group}</h3>
                  <div className="h-px bg-border flex-1" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {group.items.map((product, idx) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (groupIdx * 0.1) + (idx * 0.05) }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Container>
    </PageShell>
  );
}

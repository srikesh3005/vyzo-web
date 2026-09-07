'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { HeartCrack, Trash2, ChevronDown, Clock, Tag, Type } from 'lucide-react';
import { PageShell, PageHeader, Container } from '@/components/page-shell';
import { ProductCard } from '@/components/product-card';
import { products } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState(products.slice(0, 6));
  const [sortBy, setSortBy] = useState('date');

  const removeProduct = (id: string) => {
    setWishlist(wishlist.filter(p => p.id !== id));
  };

  const removeAll = () => {
    setWishlist([]);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <PageShell>
      <PageHeader 
        title="My Wishlist" 
        description="Items you've saved for later."
        badge={wishlist.length > 0 ? `${wishlist.length} Items` : undefined}
      >
        {wishlist.length > 0 && (
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  Sort By <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy('date')}>
                  <Clock className="mr-2 h-4 w-4" /> Date Added
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('price')}>
                  <Tag className="mr-2 h-4 w-4" /> Price
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('name')}>
                  <Type className="mr-2 h-4 w-4" /> Name
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="destructive" onClick={removeAll} className="gap-2">
              <Trash2 className="h-4 w-4" /> Remove All
            </Button>
          </div>
        )}
      </PageHeader>

      <Container>
        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-full bg-muted p-6 mb-4"
            >
              <HeartCrack className="h-12 w-12 text-muted-foreground" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6 max-w-sm">
              You haven&apos;t saved any items yet. Start browsing and click the heart icon to save items you love.
            </p>
            <Button size="lg" asChild>
              <a href="/">Browse Products</a>
            </Button>
          </div>
        ) : (
          <div>
            <div className="mb-6 text-sm text-muted-foreground">
              {wishlist.length} products saved
            </div>
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {wishlist.map((product) => (
                <motion.div key={product.id} variants={item} className="relative group">
                  <ProductCard product={product} />
                  <button 
                    onClick={() => removeProduct(product.id)}
                    className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </Container>
    </PageShell>
  );
}

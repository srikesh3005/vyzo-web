'use client';

import React, { useState, useMemo } from 'react';
import { PageShell, PageHeader, Container } from '@/components/page-shell';
import { products, type Product, formatPrice } from '@/lib/data';
import { ProductCard, RatingStars, InStockBadge } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, X, Check, Search, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function ComparePage() {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([
    products[0],
    products[1],
    products[3],
  ].filter(Boolean) as Product[]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleRemoveProduct = (id: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleAddProduct = (product: Product) => {
    if (selectedProducts.length >= 4) {
      toast.error('You can only compare up to 4 products at once.');
      return;
    }
    if (selectedProducts.find(p => p.id === product.id)) {
      toast.error('Product is already in the comparison list.');
      return;
    }
    setSelectedProducts(prev => [...prev, product]);
    setIsDialogOpen(false);
    setSearchQuery('');
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const allSpecKeys = useMemo(() => {
    const keys = new Set<string>();
    selectedProducts.forEach(p => {
      Object.keys(p.specs || {}).forEach(k => keys.add(k));
    });
    return Array.from(keys);
  }, [selectedProducts]);

  const lowestPrice = useMemo(() => {
    if (selectedProducts.length === 0) return null;
    return Math.min(...selectedProducts.map(p => p.price));
  }, [selectedProducts]);

  const highestRating = useMemo(() => {
    if (selectedProducts.length === 0) return null;
    return Math.max(...selectedProducts.map(p => p.rating));
  }, [selectedProducts]);

  const handleShare = () => {
    toast.success('Comparison link copied to clipboard!');
  };

  return (
    <PageShell>
      <PageHeader 
        title="Compare Products" 
        description="Evaluate features, specs, and prices side-by-side to make the best choice."
      >
        <div className="mt-4 flex items-center gap-4">
          <Badge variant="secondary" className="text-sm">
            {selectedProducts.length} / 4 Products
          </Badge>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" /> Share Comparison
          </Button>
        </div>
      </PageHeader>
      
      <Container className="py-12">
        {selectedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 text-center">
            <h3 className="mb-2 text-xl font-semibold">No products selected</h3>
            <p className="mb-6 text-muted-foreground">Add some products to start comparing.</p>
            <AddProductDialog 
              isOpen={isDialogOpen} 
              setIsOpen={setIsDialogOpen} 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery}
              filteredProducts={filteredProducts}
              onAddProduct={handleAddProduct}
              selectedCount={selectedProducts.length}
            />
          </div>
        ) : (
          <div className="relative w-full overflow-x-auto rounded-2xl border border-border shadow-soft glass">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 z-20 w-48 min-w-[200px] bg-card/95 p-6 backdrop-blur-sm border-r border-b border-border shadow-[4px_0_12px_rgba(0,0,0,0.05)] align-bottom">
                    {selectedProducts.length < 4 && (
                      <AddProductDialog 
                        isOpen={isDialogOpen} 
                        setIsOpen={setIsDialogOpen} 
                        searchQuery={searchQuery} 
                        setSearchQuery={setSearchQuery}
                        filteredProducts={filteredProducts}
                        onAddProduct={handleAddProduct}
                        selectedCount={selectedProducts.length}
                      />
                    )}
                  </th>
                  {selectedProducts.map(product => (
                    <th key={product.id} className="relative min-w-[280px] w-[300px] p-6 border-b border-border align-top">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-2 top-2 h-8 w-8 rounded-full text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveProduct(product.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <div className="flex flex-col items-center text-center">
                        <div className="relative mb-4 h-32 w-32 overflow-hidden rounded-xl bg-muted">
                          <img src={product.image} alt={product.name} className="h-full w-full object-cover mix-blend-multiply" />
                        </div>
                        <p className="mb-1 text-xs text-muted-foreground">{product.brand}</p>
                        <h3 className="font-semibold text-base line-clamp-2">{product.name}</h3>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {/* Price Row */}
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="sticky left-0 z-10 bg-card/95 p-4 font-medium backdrop-blur-sm border-r border-border shadow-[4px_0_12px_rgba(0,0,0,0.05)]">
                    Price
                  </td>
                  {selectedProducts.map(product => {
                    const isLowest = product.price === lowestPrice;
                    return (
                      <td key={product.id} className="p-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={cn("text-xl font-bold", isLowest && "text-success")}>
                            {formatPrice(product.price, product.currency)}
                          </span>
                          {isLowest && (
                            <Badge className="bg-success/20 text-success hover:bg-success/30 border-none">
                              Best Price
                            </Badge>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Rating Row */}
                <tr className="bg-muted/10 hover:bg-muted/30 transition-colors">
                  <td className="sticky left-0 z-10 bg-card/95 p-4 font-medium backdrop-blur-sm border-r border-border shadow-[4px_0_12px_rgba(0,0,0,0.05)]">
                    Rating
                  </td>
                  {selectedProducts.map(product => {
                    const isHighest = product.rating === highestRating;
                    return (
                      <td key={product.id} className="p-4">
                        <div className="flex flex-col items-center gap-2">
                          <RatingStars rating={product.rating} />
                          <span className="text-xs text-muted-foreground">({product.reviewCount.toLocaleString()} reviews)</span>
                          {isHighest && (
                            <Badge variant="secondary" className="border-warning/50 text-warning bg-warning/10">
                              Top Rated
                            </Badge>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* In Stock Row */}
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="sticky left-0 z-10 bg-card/95 p-4 font-medium backdrop-blur-sm border-r border-border shadow-[4px_0_12px_rgba(0,0,0,0.05)]">
                    Availability
                  </td>
                  {selectedProducts.map(product => (
                    <td key={product.id} className="p-4 text-center">
                      <InStockBadge inStock={product.inStock} />
                    </td>
                  ))}
                </tr>

                {/* AI Summary Row */}
                <tr className="bg-muted/10 hover:bg-muted/30 transition-colors">
                  <td className="sticky left-0 z-10 bg-card/95 p-4 font-medium backdrop-blur-sm border-r border-border shadow-[4px_0_12px_rgba(0,0,0,0.05)]">
                    AI Summary
                  </td>
                  {selectedProducts.map(product => (
                    <td key={product.id} className="p-4 text-sm text-muted-foreground leading-relaxed">
                      {product.aiSummary}
                    </td>
                  ))}
                </tr>

                {/* Specs Rows */}
                {allSpecKeys.map((key, i) => (
                  <tr key={key} className={cn("hover:bg-muted/30 transition-colors", i % 2 !== 0 ? 'bg-muted/10' : '')}>
                    <td className="sticky left-0 z-10 bg-card/95 p-4 font-medium backdrop-blur-sm border-r border-border shadow-[4px_0_12px_rgba(0,0,0,0.05)]">
                      {key}
                    </td>
                    {selectedProducts.map(product => (
                      <td key={product.id} className="p-4 text-center text-muted-foreground">
                        {product.specs?.[key] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Pros Row */}
                <tr className="bg-muted/10 hover:bg-muted/30 transition-colors">
                  <td className="sticky left-0 z-10 bg-card/95 p-4 font-medium backdrop-blur-sm border-r border-border shadow-[4px_0_12px_rgba(0,0,0,0.05)] align-top">
                    Pros
                  </td>
                  {selectedProducts.map(product => (
                    <td key={product.id} className="p-4 align-top">
                      <ul className="space-y-1.5 text-sm">
                        {product.pros.map((pro, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-success">
                            <Check className="mt-0.5 h-4 w-4 shrink-0" />
                            <span className="text-muted-foreground">{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>

                {/* Cons Row */}
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="sticky left-0 z-10 bg-card/95 p-4 font-medium backdrop-blur-sm border-r border-border shadow-[4px_0_12px_rgba(0,0,0,0.05)] align-top">
                    Cons
                  </td>
                  {selectedProducts.map(product => (
                    <td key={product.id} className="p-4 align-top">
                      <ul className="space-y-1.5 text-sm">
                        {product.cons.map((con, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-destructive">
                            <X className="mt-0.5 h-4 w-4 shrink-0" />
                            <span className="text-muted-foreground">{con}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>

                {/* Actions Row */}
                <tr>
                  <td className="sticky left-0 z-10 bg-card/95 p-4 backdrop-blur-sm border-r border-border shadow-[4px_0_12px_rgba(0,0,0,0.05)]"></td>
                  {selectedProducts.map(product => (
                    <td key={product.id} className="p-6 text-center">
                      <Button className="w-full" size="lg" onClick={() => toast.success('Redirecting to Amazon...', { description: product.name })}>
                        Buy Now
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </Container>
    </PageShell>
  );
}

function AddProductDialog({ 
  isOpen, 
  setIsOpen, 
  searchQuery, 
  setSearchQuery, 
  filteredProducts,
  onAddProduct,
  selectedCount
}: {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filteredProducts: Product[];
  onAddProduct: (p: Product) => void;
  selectedCount: number;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-full w-full min-h-[120px] flex-col gap-2 border-dashed bg-transparent hover:bg-muted/50">
          <Plus className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm font-medium">Add Product ({selectedCount}/4)</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a product to compare</DialogTitle>
        </DialogHeader>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search products..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <ScrollArea className="mt-4 h-[300px] pr-4">
          <div className="space-y-2">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <div 
                  key={product.id} 
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-transparent p-2 hover:bg-muted hover:border-border transition-colors"
                  onClick={() => onAddProduct(product)}
                >
                  <img src={product.image} alt={product.name} className="h-12 w-12 rounded-md object-cover" />
                  <div>
                    <h4 className="font-medium text-sm">{product.name}</h4>
                    <p className="text-xs text-muted-foreground">{product.brand}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No products found.</p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Star,
  Heart,
  GitCompare,
  Check,
  X,
  Sparkles,
  ShoppingBag,
  Clock,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { PageShell, Container } from '@/components/page-shell';
import { ProductCard } from '@/components/product-card';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  getProduct,
  getRelated,
  recordProductView,
  recordAffiliateClick
} from '@/lib/api/products';
import type { ApiProduct } from '@/lib/api/products';
import { getProducts } from '@/lib/api/products';
import { formatPrice } from '@/lib/data';

export default function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const router = useRouter();
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [related, setRelated] = useState<ApiProduct[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState<string>('');
  const [debugError, setDebugError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getProduct(params.slug)
      .then((data) => {
        setProduct(data);
        setMainImage(data.image || '');
        // Record view
        recordProductView(data.id);
        
        // Load related
        getRelated(data.slug).then(setRelated).catch(() => {});
        // Mock recently viewed for now since we don't have a direct endpoint for full products
        getProducts({ per_page: 4 }).then(res => setRecentlyViewed(res.items.filter(p => p.id !== data.id))).catch(() => {});
      })
      .catch(() => {
        router.replace('/404');
      })
      .finally(() => setLoading(false));
  }, [params.slug, router]);

  if (loading) {
    return (
      <PageShell>
        <Container className="py-20 flex items-center justify-center">
          <p className="text-muted-foreground animate-pulse">Loading product details...</p>
        </Container>
      </PageShell>
    );
  }

  if (!product) return null;

  const faqs = product.ai_summary?.faqs || [
    {
      question: `Is the ${product.name} worth buying?`,
      answer: product.ai_summary?.summary || 'Based on our AI analysis of features and reviews, this product offers good value.',
    },
    {
      question: 'Does Vyzo earn commission on this product?',
      answer: 'Yes, we earn an affiliate commission at no extra cost to you if you purchase through our links. This helps us maintain our AI research engine.',
    },
    {
      question: 'How accurate is the Vyzo AI Score?',
      answer: 'Our AI analyzes thousands of data points including reviews, specs, brand reliability, and price history to generate an objective score out of 10.',
    },
  ];

  const mockReviews = [
    { name: 'Alex Johnson', rating: 5, date: '2 weeks ago', text: 'Absolutely incredible product. Exceeded my expectations in every way. Highly recommended!', helpful: 42 },
    { name: 'Sarah Williams', rating: 4, date: '1 month ago', text: 'Great quality and features. The only downside is the price, but it feels very premium.', helpful: 18 },
    { name: 'Michael Chen', rating: 5, date: '3 months ago', text: 'Best in class. I have tried many alternatives but this one stands out due to its build quality.', helpful: 89 },
  ];

  const hasDiscount = product.mrp ? product.price < product.mrp : false;

  return (
    <PageShell>
      <Container className="py-6">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
            { label: typeof product.category === 'string' ? product.category : 'Uncategorized', href: `/categories/${product.category_slug || product.category}` },
            { label: product.name },
          ]}
        />
      </Container>

      <Container className="py-6 lg:py-12">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Gallery (Left) */}
          <div className="relative">
            <div className="lg:sticky lg:top-24 flex flex-col gap-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative aspect-square overflow-hidden rounded-3xl border border-border bg-muted/20"
              >
                <img
                  src={mainImage}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                />
                {product.mrp && product.price !== null && product.price < product.mrp && (
                  <Badge variant="destructive" className="mt-1">
                    Save {Math.round(((product.mrp - product.price) / product.mrp) * 100)}%
                  </Badge>
                )}
              </motion.div>
              <div className="grid grid-cols-4 gap-4">
                {[product.image, ...(product.images?.map(i => i.url) || [])].slice(0, 4).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImage(img)}
                    className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                      mainImage === img ? 'border-primary shadow-md' : 'border-transparent hover:border-primary/50'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${i + 1}`}
                      className="h-full w-full object-cover bg-muted/20"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Info (Right) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{product.brand}</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight lg:text-4xl xl:text-5xl">
              {product.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              {product.rating && (
              <div className="flex items-center gap-1.5 rounded-full bg-warning/10 px-3 py-1">
                <Star className="h-4 w-4 fill-warning text-warning" />
                <span className="font-bold text-warning-foreground">{product.rating}</span>
                {typeof product.review_count === 'number' && (
                  <span className="text-sm font-medium text-warning-foreground/80">
                    ({product.review_count.toLocaleString()} reviews)
                  </span>
                )}
              </div>
            )}
              <Badge variant="outline" className="gap-1.5 px-3 py-1">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="font-medium text-foreground">In Stock</span>
              </Badge>
            </div>

            <div className="mt-8 flex items-end gap-4">
              <span className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                {formatPrice(product.price, product.currency)}
              </span>
              {product.mrp && product.price !== null && product.price < product.mrp && (
                <div className="flex flex-col mb-1">
                  <span className="text-xl font-semibold text-muted-foreground line-through">
                    {formatPrice(product.mrp, product.currency)}
                  </span>
                  <span className="text-sm font-bold text-success">
                    Save {formatPrice(product.mrp - product.price, product.currency)}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={`/api/v1/go/amazon/${product.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex"
              >
                <Button size="lg" className="w-full gap-2 text-base h-14 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]" onClick={() => recordAffiliateClick(product.id)}>
                  Buy on Amazon <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
              <div className="flex gap-3">
                <Button size="lg" variant="outline" className="h-14 w-14 p-0 shrink-0">
                  <Heart className="h-5 w-5 text-muted-foreground hover:text-destructive transition-colors" />
                </Button>
                <Button size="lg" variant="outline" className="h-14 w-14 p-0 shrink-0">
                  <GitCompare className="h-5 w-5 text-muted-foreground" />
                </Button>
              </div>
            </div>
            <p className="mt-3 text-center sm:text-left text-[11px] text-muted-foreground">
              *We may earn commission at no extra cost to you
            </p>

            <Separator className="my-10" />

            {/* AI Summary Section */}
            {product.ai_summary && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center gap-2 border-b border-primary/10 pb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-primary">
                    Vyzo AI Verdict
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {product.ai_summary.summary}
                </p>
                
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {product.ai_summary.pros.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold text-success flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" /> Pros
                      </p>
                      <ul className="space-y-1">
                        {product.ai_summary.pros.slice(0, 3).map((pro, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className="text-success mt-0.5">•</span> {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {product.ai_summary.cons.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold text-destructive flex items-center gap-1">
                        <ThumbsDown className="h-3 w-3" /> Cons
                      </p>
                      <ul className="space-y-1">
                        {product.ai_summary.cons.slice(0, 3).map((con, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className="text-destructive mt-0.5">•</span> {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pros & Cons */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-success/20 bg-success/5 p-6 transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/20 text-success">
                    <ThumbsUp className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-success text-lg">Pros</h3>
                </div>
                <ul className="space-y-3">
                  {(product.ai_summary?.pros || []).map((pro) => (
                    <li key={pro} className="flex items-start gap-3 text-sm font-medium">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <span className="text-foreground/80">{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/20 text-destructive">
                    <ThumbsDown className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-destructive text-lg">Cons</h3>
                </div>
                <ul className="space-y-3">
                  {(product.ai_summary?.cons || []).map((con, i) => (
                    <li key={con} className="flex items-start gap-3 text-sm font-medium">
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                      <span className="text-foreground/80">{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </motion.div>
        </div>

        {/* Tabs Section */}
        <div className="mt-20">
          <Tabs defaultValue="specs" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 mb-8 overflow-x-auto overflow-y-hidden">
              <TabsTrigger value="specs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-base font-semibold">Specifications</TabsTrigger>
              <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-base font-semibold">Overview</TabsTrigger>
              <TabsTrigger value="faqs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-base font-semibold">FAQs</TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-base font-semibold">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="specs" className="mt-0 animate-in fade-in-50 duration-500">
              <div className="max-w-3xl rounded-2xl border border-border overflow-hidden">
                <table className="w-full text-left">
                  <tbody>
                    {Object.entries(product.specs).map(([key, val], i) => (
                      <tr key={key} className={`border-b border-border/50 last:border-0 ${i % 2 === 0 ? 'bg-muted/30' : 'bg-background'}`}>
                        <th className="w-1/3 p-4 text-sm font-semibold text-foreground">{key}</th>
                        <td className="p-4 text-sm text-muted-foreground">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="overview" className="mt-0 animate-in fade-in-50 duration-500">
              <div className="prose prose-lg dark:prose-invert max-w-3xl">
                <p className="leading-relaxed text-muted-foreground font-medium text-lg">
                  {product.description}
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="faqs" className="mt-0 animate-in fade-in-50 duration-500">
              <div className="max-w-3xl">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, i) => (
                    <AccordionItem key={i} value={`item-${i}`} className="border-border/50 py-2">
                      <AccordionTrigger className="text-left font-semibold hover:no-underline hover:text-primary transition-colors">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-0 animate-in fade-in-50 duration-500">
              <div className="max-w-3xl space-y-6">
                {mockReviews.map((review, i) => (
                  <div key={i} className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-foreground">{review.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, j) => (
                              <Star key={j} className={`h-3 w-3 ${j < review.rating ? 'fill-warning text-warning' : 'text-muted'}`} />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-foreground/80 leading-relaxed">
                      "{review.text}"
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 rounded-full">
                        <ThumbsUp className="h-3 w-3" /> Helpful ({review.helpful})
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="mb-6 text-2xl font-bold">Similar Products</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p as any} />
              ))}
            </div>
          </div>
        )}

        {/* Recently viewed */}
        {recentlyViewed.length > 0 && (
          <div className="mt-20 mb-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Clock className="h-5 w-5 text-foreground" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Recently Viewed</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {recentlyViewed.map((p) => (
                <ProductCard key={p.id} product={p as any} />
              ))}
            </div>
          </div>
        )}
      </Container>

      {/* Sticky buy box for mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-4 border-t border-border bg-background/80 px-4 py-4 backdrop-blur-xl lg:hidden shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{product.brand}</p>
          <div className="flex items-center gap-2">
            <p className="text-lg font-extrabold">{formatPrice(product.price, product.currency)}</p>
          </div>
        </div>
        <Link href={`/api/v1/go/amazon/${product.id}`} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button size="lg" className="w-full gap-2 rounded-xl text-base font-semibold shadow-glow" onClick={() => recordAffiliateClick(product.id)}>
            <ShoppingBag className="h-4 w-4" /> Buy Now
          </Button>
        </Link>
      </div>
    </PageShell>
  );
}

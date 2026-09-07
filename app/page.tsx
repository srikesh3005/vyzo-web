import Link from 'next/link';
import {
  Sparkles,
  Search,
  ShieldCheck,
  Zap,
  Brain,
  TrendingUp,
  GitCompare,
  ArrowRight,
  Star,
  Quote,
  Check,
} from 'lucide-react';
import { PageShell, Container } from '@/components/page-shell';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/db/client';
import { formatPrice } from '@/lib/data'; // Keep only simple utilities from data.ts, we'll replace the mocks

export const revalidate = 3600; // Revalidate static page every hour

// Fetch data directly in the RSC
async function getHomePageData() {
  const [trendingRes, categoriesRes] = await Promise.all([
    db.from('products')
      .select('id, slug, title, brand_name, category_id, price_paise, original_price_paise, currency, rating, review_count, availability, is_trending, is_featured, ai_summary, images:product_images(url, is_primary)')
      .eq('status', 'published')
      .eq('is_trending', true)
      .limit(8),
    db.from('categories')
      .select('id, slug, name, description, product_count')
      .order('product_count', { ascending: false })
      .limit(8)
  ]);

  const trending = (trendingRes.data ?? []).map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.title,
    brand: p.brand_name,
    category: p.category_id,
    price: p.price_paise ? p.price_paise / 100 : 0,
    mrp: p.original_price_paise ? p.original_price_paise / 100 : 0,
    currency: p.currency || 'INR',
    rating: p.rating || 0,
    reviewCount: p.review_count || 0,
    image: Array.isArray(p.images) ? p.images.find(i => (i as any).is_primary)?.url || p.images[0]?.url || '' : '',
    gallery: [],
    inStock: p.availability === 'in_stock',
    trending: p.is_trending,
    featured: p.is_featured,
    editorsPick: false,
    bestSeller: false,
    aiSummary: p.ai_summary || '',
    pros: [],
    cons: [],
    specs: {},
    description: '',
  }));

  const categories = (categoriesRes.data ?? []).map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    icon: '',
    count: c.product_count || 0,
    image: '',
    description: c.description || '',
  }));

  return { trending, categories };
}

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Summaries',
    description:
      'Get instant, unbiased AI summaries of every product. We analyze thousands of reviews so you don’t have to.',
  },
  {
    icon: GitCompare,
    title: 'Smart Comparisons',
    description:
      'Compare products side-by-side with detailed specs, pros, cons, and ratings to make the right choice.',
  },
  {
    icon: ShieldCheck,
    title: 'Trusted & Transparent',
    description:
      'No sponsored rankings. No fake reviews. Just honest, data-driven research you can rely on.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description:
      'Find what you need in seconds with intelligent search, filters, and personalized recommendations.',
  },
];

const stats = [
  { value: '50K+', label: 'Products Researched' },
  { value: '2M+', label: 'AI Summaries Generated' },
  { value: '180+', label: 'Countries Served' },
  { value: '4.9/5', label: 'User Rating' },
];

const testimonials = [
  {
    name: 'Aarav Sharma',
    role: 'Software Engineer',
    content:
      'Vyzo saved me hours of research before buying my laptop. The AI summary told me exactly what I needed to know in seconds.',
    rating: 5,
  },
  {
    name: 'Priya Patel',
    role: 'Product Designer',
    content:
      'The comparison feature is a game-changer. I compared three phones side-by-side and made my decision with confidence.',
    rating: 5,
  },
  {
    name: 'Rohan Mehta',
    role: 'Student',
    content:
      'Finally, a shopping platform that doesn’t feel like a scam. The pros and cons are honest and the reviews are real.',
    rating: 5,
  },
];

export default async function Home() {
  const { trending, categories } = await getHomePageData();

  return (
    <PageShell>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute left-1/2 top-0 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <Container className="relative py-20 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="secondary"
              className="mb-6 gap-1.5 px-3 py-1.5 text-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI-Powered Product Research
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-6xl">
              Shop Smarter.{' '}
              <span className="gradient-text">Buy Better.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-balance">
              Vyzo uses AI to research, summarize, and compare products so you
              always make the right buying decision. Trusted by millions of
              smart shoppers.
            </p>

            {/* Search */}
            <div className="mx-auto mt-10 max-w-xl">
              <Link href="/search">
                <div className="group relative flex items-center rounded-xl border border-border bg-card p-1.5 shadow-soft transition-all hover:border-primary/40 hover:shadow-glow">
                  <Search className="pointer-events-none absolute left-4 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search for laptops, phones, headphones..."
                    className="w-full bg-transparent py-2.5 pl-12 pr-3 text-sm outline-none placeholder:text-muted-foreground"
                    readOnly
                  />
                  <Button className="shrink-0" size="sm">
                    Search
                  </Button>
                </div>
              </Link>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
                <span className="text-muted-foreground">Trending:</span>
                {['MacBook Air M3', 'iPhone 15 Pro', 'Sony WH-1000XM5'].map(
                  (term) => (
                    <Link
                      key={term}
                      href="/search"
                      className="rounded-full border border-border px-3 py-1 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                    >
                      {term}
                    </Link>
                  )
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Trending Products */}
      <section className="py-16">
        <Container>
          <div className="mb-8 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">Trending Now</h2>
              </div>
              <p className="mt-1 text-muted-foreground">
                The most researched products this week
              </p>
            </div>
            <Link href="/trending">
              <Button variant="ghost" className="gap-1">
                View all <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {trending.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Container>
      </section>

      {/* Categories */}
      <section className="border-y border-border bg-card/30 py-16">
        <Container>
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold">Browse by Category</h2>
            <p className="mt-1 text-muted-foreground">
              Explore our curated product categories
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:shadow-soft hover:border-primary/30"
              >
                <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-primary/5 transition-transform group-hover:scale-150" />
                <div className="relative">
                  <h3 className="font-semibold">{cat.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                    {cat.description}
                  </p>
                  <p className="mt-3 text-xs font-medium text-primary">
                    {cat.count} products
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Why Vyzo */}
      <section className="py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">
              Why Vyzo
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              The smartest way to research products
            </h2>
            <p className="mt-3 text-muted-foreground text-balance">
              We combine AI intelligence with trusted data to give you the
              confidence to buy right.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-border bg-card p-6 transition-all hover:shadow-soft hover:border-primary/30"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* AI Features showcase */}
      <section className="relative overflow-hidden border-y border-border bg-card/30 py-20">
        <div className="absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-chart-4/10 blur-[120px]" />
        <Container className="relative">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Badge className="mb-4 gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> AI Features
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Your AI research assistant for every purchase
              </h2>
              <p className="mt-4 text-muted-foreground text-balance">
                Vyzo AI reads thousands of reviews, specs, and expert opinions
                to give you clear, honest summaries. No more endless tabs and
                confusing comparisons.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Instant AI summaries of any product',
                  'Personalized recommendations for your needs',
                  'Side-by-side intelligent comparisons',
                  'Real-time price tracking and alerts',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success/15 text-success">
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/ai-picks">
                <Button className="mt-8 gap-2">
                  Explore AI Picks <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="animate-float rounded-2xl border border-border bg-background p-6 shadow-soft">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="font-semibold">Vyzo AI Summary</span>
                </div>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Product
                    </p>
                    <p className="font-semibold">MacBook Air M3 13&quot;</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      AI Verdict
                    </p>
                    <p className="text-sm leading-relaxed">
                      The MacBook Air M3 delivers exceptional performance for
                      everyday tasks and light creative work. Its fanless design
                      stays silent, battery life is class-leading at 18 hours.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-success/30 bg-success/5 p-3">
                      <p className="text-xs font-semibold text-success">
                        Top Pro
                      </p>
                      <p className="mt-1 text-xs">18-hour battery life</p>
                    </div>
                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                      <p className="text-xs font-semibold text-destructive">
                        Top Con
                      </p>
                      <p className="mt-1 text-xs">Only 8GB RAM base</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="font-semibold">4.8</span>
                    </div>
                    <span className="text-lg font-bold">
                      {formatPrice(89990)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Stats */}
      <section className="py-16">
        <Container>
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold gradient-text sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Testimonials */}
      <section className="border-t border-border bg-card/30 py-20">
        <Container>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Loved by smart shoppers
            </h2>
            <p className="mt-2 text-muted-foreground">
              Join millions who research smarter with Vyzo
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-xl border border-border bg-card p-6"
              >
                <Quote className="h-8 w-8 text-primary/20" />
                <div className="mt-4 flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-warning text-warning"
                    />
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed">{t.content}</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-20">
        <Container>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-chart-4/10 p-10 text-center sm:p-16">
            <div className="absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[100px]" />
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Start researching smarter today
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground text-balance">
                Join Vyzo and get personalized AI recommendations, price alerts,
                and exclusive research tools.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/register">
                  <Button size="lg" className="gap-2">
                    Get Started Free <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/products">
                  <Button size="lg" variant="outline">
                    Browse Products
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </PageShell>
  );
}

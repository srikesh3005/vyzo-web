import Link from 'next/link';
import { BookOpen, ArrowRight, Clock } from 'lucide-react';
import { PageShell, PageHeader, Container } from '@/components/page-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const articles = [
  {
    slug: 'best-laptops-2024',
    title: 'Best Laptops Under ₹80,000 in 2024: A Complete Buying Guide',
    excerpt: 'We tested and compared the top laptops in this budget range. Here\'s what we found.',
    category: 'Buying Guide',
    date: 'Jul 15, 2024',
    readTime: '8 min read',
    image: 'https://images.pexels.com/photos/18105/pexels-photo-18105.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  },
  {
    slug: 'iphone-vs-android',
    title: 'iPhone vs Android in 2024: Which Is Right For You?',
    excerpt: 'The eternal debate, settled with data. We compare performance, cameras, and value.',
    category: 'Review',
    date: 'Jul 10, 2024',
    readTime: '6 min read',
    image: 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  },
  {
    slug: 'ai-shopping-tips',
    title: '5 Ways AI Can Help You Shop Smarter',
    excerpt: 'AI isn\'t just for chatbots. Here\'s how it can transform your shopping experience.',
    category: 'AI Tips',
    date: 'Jul 5, 2024',
    readTime: '5 min read',
    image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  },
  {
    slug: 'headphones-buying-guide',
    title: 'Noise-Cancelling Headphones: Everything You Need to Know',
    excerpt: 'From ANC technology to battery life, here\'s what matters when choosing headphones.',
    category: 'Buying Guide',
    date: 'Jun 28, 2024',
    readTime: '7 min read',
    image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  },
  {
    slug: 'macbook-vs-windows',
    title: 'MacBook vs Windows: The 2024 Showdown',
    excerpt: 'Both platforms are great, but which one fits your needs? We break it down.',
    category: 'Review',
    date: 'Jun 20, 2024',
    readTime: '10 min read',
    image: 'https://images.pexels.com/photos/205426/pexels-photo-205426.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  },
  {
    slug: 'best-monitors-2024',
    title: 'Best Monitors for Productivity in 2024',
    excerpt: 'From ultrawide to 4K, here are the monitors that will boost your workflow.',
    category: 'Buying Guide',
    date: 'Jun 15, 2024',
    readTime: '6 min read',
    image: 'https://images.pexels.com/photos/777001/pexels-photo-777001.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  },
];

const categories = ['All', 'Buying Guide', 'Review', 'AI Tips'];

export default function BlogPage() {
  return (
    <PageShell>
      <PageHeader
        title="Vyzo Blog"
        description="Buying guides, reviews, and AI tips to help you shop smarter"
      />
      <Container className="py-10">
        {/* Category filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat, i) => (
            <Button
              key={cat}
              variant={i === 0 ? 'default' : 'outline'}
              size="sm"
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Featured article */}
        <Link
          href={`/blog/${articles[0].slug}`}
          className="group mb-10 block overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-soft"
        >
          <div className="grid lg:grid-cols-2">
            <div className="aspect-video overflow-hidden bg-muted lg:aspect-auto">
              <img
                src={articles[0].image}
                alt={articles[0].title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col justify-center p-8">
              <Badge className="w-fit">{articles[0].category}</Badge>
              <h2 className="mt-3 text-2xl font-bold tracking-tight">
                {articles[0].title}
              </h2>
              <p className="mt-3 text-muted-foreground">{articles[0].excerpt}</p>
              <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <span>{articles[0].date}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {articles[0].readTime}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
                Read more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </Link>

        {/* Article grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.slice(1).map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-soft hover:border-primary/30"
            >
              <div className="aspect-video overflow-hidden bg-muted">
                <img
                  src={article.image}
                  alt={article.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <Badge variant="secondary">{article.category}</Badge>
                <h3 className="mt-3 font-semibold leading-tight line-clamp-2">
                  {article.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {article.excerpt}
                </p>
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{article.date}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {article.readTime}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </PageShell>
  );
}

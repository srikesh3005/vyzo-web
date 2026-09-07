import { Sparkles, Brain, TrendingUp, Wallet, GraduationCap, Briefcase } from 'lucide-react';
import { PageShell, PageHeader, Container } from '@/components/page-shell';
import { ProductCard } from '@/components/product-card';
import { Badge } from '@/components/ui/badge';
import { products } from '@/lib/data';

const sections = [
  {
    icon: Brain,
    title: 'Recommended For You',
    description: 'Based on your browsing history and preferences',
    items: products.slice(0, 4),
    badge: 'Personalized',
  },
  {
    icon: TrendingUp,
    title: 'Top Picks',
    description: 'The highest-rated products across all categories',
    items: products.filter((p) => p.rating >= 4.7).slice(0, 4),
    badge: 'Top Rated',
  },
  {
    icon: Wallet,
    title: 'Budget Picks',
    description: 'Best value products under ₹50,000',
    items: products.filter((p) => p.price < 50000).slice(0, 4),
    badge: 'Value',
  },
  {
    icon: Sparkles,
    title: 'Premium Picks',
    description: 'Top-tier products for those who want the best',
    items: products.filter((p) => p.price > 100000).slice(0, 4),
    badge: 'Premium',
  },
  {
    icon: GraduationCap,
    title: 'Student Picks',
    description: 'Portable, affordable, and powerful for students',
    items: products.filter((p) => p.price < 100000).slice(0, 4),
    badge: 'Student',
  },
  {
    icon: Briefcase,
    title: 'Professional Picks',
    description: 'Workstation-grade tools for professionals',
    items: products.filter((p) => p.category === 'laptops').slice(0, 4),
    badge: 'Pro',
  },
];

export default function AIPicksPage() {
  return (
    <PageShell>
      <PageHeader
        title="AI Recommendations"
        description="Personalized picks powered by Vyzo AI — tailored to your needs"
      >
        <Badge className="mt-4 gap-1.5">
          <Sparkles className="h-3.5 w-3.5" /> Powered by Vyzo AI
        </Badge>
      </PageHeader>

      <Container className="py-10">
        <div className="space-y-16">
          {sections.map((section) => (
            <section key={section.title}>
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <section.icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-bold">{section.title}</h2>
                    <Badge variant="secondary">{section.badge}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {section.description}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {section.items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </Container>
    </PageShell>
  );
}

import Link from 'next/link';
import { Sparkles, Target, Eye, Rocket, Users, Briefcase, ArrowRight } from 'lucide-react';
import { PageShell, Container } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const team = [
  { name: 'Aarav Sharma', role: 'CEO & Founder', initial: 'A' },
  { name: 'Priya Patel', role: 'CTO', initial: 'P' },
  { name: 'Rohan Mehta', role: 'Head of AI', initial: 'R' },
  { name: 'Sara Khan', role: 'Head of Design', initial: 'S' },
];

const roadmap = [
  { phase: 'Q1 2024', title: 'Launch', desc: 'Vyzo goes live with core product research features', done: true },
  { phase: 'Q3 2024', title: 'AI Chat', desc: 'Conversational AI assistant for product queries', done: true },
  { phase: 'Q1 2025', title: 'Price Tracking', desc: 'Real-time price alerts and tracking across stores', done: false },
  { phase: 'Q3 2025', title: 'Community', desc: 'User reviews, discussions, and verified purchases', done: false },
];

const values = [
  { icon: Target, title: 'Mission', desc: 'Empower every shopper with AI-driven research to make confident buying decisions.' },
  { icon: Eye, title: 'Vision', desc: 'A world where no one regrets a purchase because they had the right information.' },
  { icon: Sparkles, title: 'Values', desc: 'Trust, transparency, and intelligence guide everything we build.' },
];

export default function AboutPage() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <Container className="relative py-20 text-center">
          <Badge className="mb-4 gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> About Vyzo
          </Badge>
          <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            We&apos;re building the future of <span className="gradient-text">smart shopping</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground text-balance">
            Vyzo was born from a simple idea: shopping should be informed, not overwhelming. We use AI to cut through the noise.
          </p>
        </Container>
      </section>

      {/* Mission/Vision/Values */}
      <section className="py-16">
        <Container>
          <div className="grid gap-6 md:grid-cols-3">
            {values.map((v) => (
              <div key={v.title} className="rounded-xl border border-border bg-card p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <v.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Roadmap */}
      <section className="border-y border-border bg-card/30 py-16">
        <Container>
          <h2 className="text-2xl font-bold text-center">Product Roadmap</h2>
          <p className="mt-2 text-center text-muted-foreground">Where we&apos;ve been and where we&apos;re going</p>
          <div className="mt-10 space-y-4">
            {roadmap.map((item, i) => (
              <div key={i} className="flex items-start gap-4 rounded-xl border border-border bg-card p-5">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${item.done ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                  {item.done ? '✓' : <Rocket className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-primary">{item.phase}</span>
                    {item.done && <Badge variant="secondary">Shipped</Badge>}
                  </div>
                  <h3 className="mt-1 font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Team */}
      <section className="py-16">
        <Container>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Our Team</h2>
            </div>
            <p className="mt-2 text-muted-foreground">The people behind Vyzo</p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <div key={member.name} className="rounded-xl border border-border bg-card p-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                  {member.initial}
                </div>
                <h3 className="mt-3 font-semibold">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Careers CTA */}
      <section className="py-16">
        <Container>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-chart-4/10 p-10 text-center">
            <Briefcase className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-4 text-2xl font-bold">Join the team</h2>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              We&apos;re always looking for talented people who share our vision.
            </p>
            <Link href="/contact">
              <Button className="mt-6 gap-2">
                View Open Roles <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </PageShell>
  );
}

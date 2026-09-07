import Link from 'next/link';
import { Search, Home, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute left-1/2 top-1/3 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />

      <div className="relative text-center">
        {/* Illustration */}
        <div className="relative mx-auto mb-8 h-40 w-40">
          <div className="absolute inset-0 animate-float">
            <Compass className="h-full w-full text-primary/30" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-7xl font-bold gradient-text">404</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold tracking-tight">Page not found</h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground text-balance">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Link href="/">
            <Button size="lg" className="gap-2">
              <Home className="h-4 w-4" /> Back to Home
            </Button>
          </Link>
          <Link href="/search">
            <Button size="lg" variant="outline" className="gap-2">
              <Search className="h-4 w-4" /> Search Products
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

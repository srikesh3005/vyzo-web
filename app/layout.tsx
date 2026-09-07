import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/lib/auth/context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://vyzo.in'),
  title: {
    default: 'Vyzo — Shop Smarter. Buy Better.',
    template: '%s | Vyzo',
  },
  description:
    'Vyzo is a premium AI-powered product research and shopping platform. Research products before buying with AI summaries, comparisons, and trusted reviews.',
  keywords: ['product research', 'AI shopping', 'product comparison', 'buy guide', 'Amazon affiliate'],
  authors: [{ name: 'Vyzo' }],
  creator: 'Vyzo',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://vyzo.in',
    siteName: 'Vyzo',
    title: 'Vyzo — Shop Smarter. Buy Better.',
    description:
      'Premium AI-powered product research and shopping platform.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vyzo — Shop Smarter. Buy Better.',
    description: 'Premium AI-powered product research and shopping platform.',
    creator: '@vyzo_in',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster position="bottom-right" />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

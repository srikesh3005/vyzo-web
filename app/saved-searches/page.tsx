'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trash2, ExternalLink, Calendar, SearchX } from 'lucide-react';
import { PageShell, PageHeader, Container } from '@/components/page-shell';
import { Button } from '@/components/ui/button';

const mockSearches = [
  { id: 1, query: 'best noise cancelling headphones under $300', count: 124, date: 'Oct 12, 2023' },
  { id: 2, query: 'OLED TV 65 inch', count: 45, date: 'Oct 10, 2023' },
  { id: 3, query: 'mechanical keyboard tactile switches', count: 312, date: 'Sep 28, 2023' },
  { id: 4, query: 'budget gaming mouse', count: 89, date: 'Sep 15, 2023' },
  { id: 5, query: 'ergonomic office chair', count: 210, date: 'Sep 01, 2023' },
];

export default function SavedSearchesPage() {
  const [searches, setSearches] = useState(mockSearches);

  const removeSearch = (id: number) => {
    setSearches(searches.filter(s => s.id !== id));
  };

  return (
    <PageShell>
      <PageHeader 
        title="Saved Searches" 
        description="Quickly access your frequent search queries."
        badge={searches.length > 0 ? `${searches.length} Searches` : undefined}
      />

      <Container className="max-w-3xl pb-12">
        {searches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center glass-card rounded-2xl">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-full bg-muted p-6 mb-4"
            >
              <SearchX className="h-12 w-12 text-muted-foreground" />
            </motion.div>
            <h2 className="text-xl font-bold mb-2">No saved searches</h2>
            <p className="text-muted-foreground mb-6">Save your complex queries to run them again easily.</p>
            <Button asChild>
              <a href="/">Go to Search</a>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {searches.map((search, idx) => (
                <motion.div
                  key={search.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-card p-4 sm:p-6 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1 p-2.5 rounded-full bg-primary/10 text-primary shrink-0">
                      <Search className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-1">{search.query}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-success/80"></span>
                          {search.count} results
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {search.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-border">
                    <Button variant="outline" className="flex-1 sm:flex-none gap-2" asChild>
                      <a href={`/search?q=${encodeURIComponent(search.query)}`}>
                        Search again <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => removeSearch(search.id)}
                      aria-label="Delete saved search"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </Container>
    </PageShell>
  );
}

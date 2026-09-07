'use client';

import { motion } from 'framer-motion';
import { MapPin, Calendar, Edit, Activity, BarChart2, Bell } from 'lucide-react';
import { PageShell, Container } from '@/components/page-shell';
import { ProductCard } from '@/components/product-card';
import { products } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProfilePage() {
  const user = {
    name: 'Aarav Sharma',
    email: 'aarav@example.com',
    joinDate: 'January 2024',
    location: 'Mumbai, India',
    initials: 'AS'
  };

  const recentlyViewed = products.slice(2, 6);

  return (
    <PageShell>
      <Container className="py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Profile Card */}
          <div className="w-full lg:w-1/3 xl:w-1/4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-6 text-center shadow-soft sticky top-24"
            >
              <div className="mx-auto w-32 h-32 rounded-full bg-gradient-to-tr from-primary to-primary/50 flex items-center justify-center text-primary-foreground text-4xl font-bold mb-4 shadow-glow">
                {user.initials}
              </div>
              <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
              <p className="text-muted-foreground mb-4">{user.email}</p>
              
              <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
                Member since {user.joinDate}
              </div>

              <div className="flex flex-col gap-3 text-sm text-left mb-6">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{user.location}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {user.joinDate}</span>
                </div>
              </div>

              <Button className="w-full gap-2">
                <Edit className="h-4 w-4" /> Edit Profile
              </Button>
            </motion.div>
          </div>

          {/* Right Column: Content Tabs */}
          <div className="w-full lg:w-2/3 xl:w-3/4">
            <Tabs defaultValue="activity" className="w-full">
              <TabsList className="mb-6 grid grid-cols-3 w-full max-w-md">
                <TabsTrigger value="activity" className="gap-2">
                  <Activity className="h-4 w-4" /> Activity
                </TabsTrigger>
                <TabsTrigger value="stats" className="gap-2">
                  <BarChart2 className="h-4 w-4" /> Stats
                </TabsTrigger>
                <TabsTrigger value="preferences" className="gap-2">
                  <Bell className="h-4 w-4" /> Preferences
                </TabsTrigger>
              </TabsList>

              <TabsContent value="activity">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="text-xl font-bold">Recently Viewed</h3>
                      <p className="text-muted-foreground text-sm">Your recent browsing history</p>
                    </div>
                    <Button variant="link" asChild>
                      <a href="/recently-viewed">View all</a>
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {recentlyViewed.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                     <div className="glass-card p-6 rounded-xl flex items-center justify-between">
                       <div>
                         <p className="text-muted-foreground font-medium mb-1">Wishlist</p>
                         <h4 className="text-2xl font-bold">12 items</h4>
                       </div>
                       <Button variant="outline" asChild>
                         <a href="/wishlist">View Wishlist</a>
                       </Button>
                     </div>
                     <div className="glass-card p-6 rounded-xl flex items-center justify-between">
                       <div>
                         <p className="text-muted-foreground font-medium mb-1">Saved Searches</p>
                         <h4 className="text-2xl font-bold">5 queries</h4>
                       </div>
                       <Button variant="outline" asChild>
                         <a href="/saved-searches">View Searches</a>
                       </Button>
                     </div>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="stats">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                >
                  {[
                    { label: 'Products Researched', value: '142' },
                    { label: 'Items Wishlisted', value: '28' },
                    { label: 'Comparisons Made', value: '45' },
                    { label: 'Searches Made', value: '89' },
                  ].map((stat, i) => (
                    <div key={i} className="glass-card p-8 rounded-2xl text-center">
                      <div className="text-5xl font-black gradient-text mb-2">{stat.value}</div>
                      <div className="text-muted-foreground font-medium">{stat.label}</div>
                    </div>
                  ))}
                </motion.div>
              </TabsContent>

              <TabsContent value="preferences">
                 <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-card p-8 rounded-2xl text-center flex flex-col items-center justify-center min-h-[300px]"
                >
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-bold mb-2">Notification Preferences</h3>
                  <p className="text-muted-foreground mb-6">Manage how and when you receive updates.</p>
                  <Button asChild>
                    <a href="/settings">Go to Settings</a>
                  </Button>
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Container>
    </PageShell>
  );
}

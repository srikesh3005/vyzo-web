'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingDown, TrendingUp, Package, Bell, CheckCheck, Inbox } from 'lucide-react';
import { PageShell, PageHeader, Container } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const mockNotifications = [
  { id: 1, type: 'price_drop', title: 'Price drop alert!', body: 'Sony WH-1000XM5 is now 15% cheaper.', time: '2 hours ago', read: false },
  { id: 2, type: 'trending', title: 'Trending now', body: 'Mechanical keyboards are trending this week.', time: '5 hours ago', read: false },
  { id: 3, type: 'new_product', title: 'New Arrival', body: 'Apple MacBook Pro M3 is now available for review.', time: 'Yesterday', read: true },
  { id: 4, type: 'system', title: 'Account updated', body: 'Your password was changed successfully.', time: '2 days ago', read: true },
  { id: 5, type: 'price_drop', title: 'Deal ending soon', body: 'LG C3 OLED TV sale ends in 2 hours.', time: '2 days ago', read: true },
  { id: 6, type: 'trending', title: 'Weekly Insights', body: 'Smart home devices saw a 40% search increase.', time: '3 days ago', read: true },
  { id: 7, type: 'system', title: 'Welcome to Vyzo!', body: 'Thanks for joining us. Start exploring products.', time: '1 week ago', read: true },
  { id: 8, type: 'new_product', title: 'Recommendation', body: 'Based on your searches, check out these monitors.', time: '1 week ago', read: true },
];

const getIcon = (type: string) => {
  switch (type) {
    case 'price_drop': return <TrendingDown className="h-5 w-5 text-success" />;
    case 'trending': return <TrendingUp className="h-5 w-5 text-primary" />;
    case 'new_product': return <Package className="h-5 w-5 text-purple-500" />;
    case 'system': default: return <Bell className="h-5 w-5 text-muted-foreground" />;
  }
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState('all');

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const filtered = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    if (filter === 'price_drops') return n.type === 'price_drop';
    if (filter === 'system') return n.type === 'system';
    return true;
  });

  return (
    <PageShell>
      <PageHeader 
        title="Notifications" 
        description="Stay updated with your latest alerts."
      >
        <Button variant="outline" onClick={markAllRead} className="gap-2">
          <CheckCheck className="h-4 w-4" /> Mark all as read
        </Button>
      </PageHeader>

      <Container className="max-w-4xl pb-12">
        <Tabs defaultValue="all" onValueChange={setFilter} className="mb-8">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread {notifications.filter(n => !n.read).length > 0 && `(${notifications.filter(n => !n.read).length})`}
            </TabsTrigger>
            <TabsTrigger value="price_drops">Price Drops</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>
        </Tabs>

        {filtered.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 text-center glass-card rounded-2xl">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-full bg-muted p-6 mb-4"
            >
              <Inbox className="h-12 w-12 text-muted-foreground" />
            </motion.div>
            <h2 className="text-xl font-bold mb-2">No notifications found</h2>
            <p className="text-muted-foreground">You&apos;re all caught up!</p>
          </div>
        ) : (
          <motion.div className="space-y-3">
            <AnimatePresence>
              {filtered.map((notification, idx) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => markRead(notification.id)}
                  className={`p-4 md:p-6 rounded-xl flex items-start gap-4 cursor-pointer transition-all ${
                    notification.read 
                      ? 'bg-card border border-border shadow-sm hover:bg-muted/50' 
                      : 'glass-card border-l-4 border-l-primary shadow-soft relative'
                  }`}
                >
                  {!notification.read && (
                    <span className="absolute top-6 right-6 w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                  )}
                  
                  <div className={`p-3 rounded-full shrink-0 ${notification.read ? 'bg-muted' : 'bg-background shadow-sm'}`}>
                    {getIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 pr-6">
                    <h4 className={`font-semibold mb-1 ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {notification.title}
                    </h4>
                    <p className={`text-sm mb-2 ${!notification.read ? 'text-foreground/80' : 'text-muted-foreground'}`}>
                      {notification.body}
                    </p>
                    <span className="text-xs font-medium text-muted-foreground">{notification.time}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </Container>
    </PageShell>
  );
}

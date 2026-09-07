'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Palette, Shield, Lock, Laptop } from 'lucide-react';
import { PageShell, PageHeader, Container } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const navItems = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <PageShell>
      <PageHeader 
        title="Settings" 
        description="Manage your account settings and preferences."
      />
      <Container className="pb-12">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Nav */}
          <div className="w-full md:w-64 shrink-0">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-left ${
                    activeTab === item.id 
                      ? 'bg-primary text-primary-foreground shadow-glow' 
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 glass-card p-6 md:p-8 rounded-2xl">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'account' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-bold mb-1">Account Information</h3>
                    <p className="text-muted-foreground text-sm">Update your personal details here.</p>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-primary to-primary/50 flex items-center justify-center text-primary-foreground text-2xl font-bold shrink-0">
                      AS
                    </div>
                    <div>
                      <Button variant="outline" className="mb-2">Change Photo</Button>
                      <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size 2MB.</p>
                    </div>
                  </div>

                  <div className="grid gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" defaultValue="Aarav Sharma" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" defaultValue="aarav@example.com" />
                    </div>
                  </div>

                  <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-bold mb-1">Notifications</h3>
                    <p className="text-muted-foreground text-sm">Choose what you want to be notified about.</p>
                  </div>

                  <div className="space-y-6">
                    {[
                      { id: 'email', label: 'Email Notifications', desc: 'Receive daily summary emails' },
                      { id: 'price', label: 'Price Drop Alerts', desc: 'Get notified when wishlisted items drop in price' },
                      { id: 'new', label: 'New Arrivals', desc: 'Alerts for new products in your favorite categories' },
                      { id: 'trending', label: 'Trending', desc: 'Weekly trending products and insights' },
                      { id: 'digest', label: 'Weekly Digest', desc: 'A summary of your activity' },
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-4">
                        <div className="space-y-0.5">
                          <Label htmlFor={item.id} className="text-base">{item.label}</Label>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                        <Switch id={item.id} defaultChecked={['price', 'new', 'email'].includes(item.id)} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-8">
                   <div>
                    <h3 className="text-xl font-bold mb-1">Appearance</h3>
                    <p className="text-muted-foreground text-sm">Customize how the app looks for you.</p>
                  </div>

                  <div className="space-y-4">
                    <Label>Theme</Label>
                    <div className="grid grid-cols-3 gap-4">
                      {['Light', 'Dark', 'System'].map((theme) => (
                        <div key={theme} className="border rounded-xl p-4 text-center cursor-pointer hover:border-primary transition-colors hover:bg-primary/5">
                          <Laptop className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                          <div className="font-medium">{theme}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Language</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                      <option>English (US)</option>
                      <option>Hindi (भारत)</option>
                      <option>Spanish (ES)</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-8">
                   <div>
                    <h3 className="text-xl font-bold mb-1">Security</h3>
                    <p className="text-muted-foreground text-sm">Protect your account and privacy.</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Change Password</h4>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label>Current Password</Label>
                        <Input type="password" />
                      </div>
                      <div className="grid gap-2">
                        <Label>New Password</Label>
                        <Input type="password" />
                      </div>
                      <div className="grid gap-2">
                        <Label>Confirm New Password</Label>
                        <Input type="password" />
                      </div>
                      <Button className="w-fit">Update Password</Button>
                    </div>
                  </div>

                  <hr className="border-border" />

                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-base flex items-center gap-2">
                        Two-Factor Authentication <Lock className="h-4 w-4 text-success" />
                      </Label>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <hr className="border-border" />

                  <div className="space-y-4 pt-4">
                    <h4 className="font-semibold text-destructive">Danger Zone</h4>
                    <Button variant="destructive">Sign out of all devices</Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

        </div>
      </Container>
    </PageShell>
  );
}

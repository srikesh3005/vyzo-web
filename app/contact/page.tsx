'use client';

import * as React from 'react';
import {
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  Send,
  ChevronDown,
} from 'lucide-react';
import { PageShell, PageHeader, Container } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { toast } from 'sonner';

const faqs = [
  {
    q: 'How does Vyzo make money?',
    a: 'We earn a small commission through affiliate links when you purchase products. This never affects our ratings or AI summaries — our recommendations are always unbiased.',
  },
  {
    q: 'Are the AI summaries accurate?',
    a: 'Yes. Our AI analyzes thousands of verified reviews, expert opinions, and specifications to generate summaries. We update them regularly as new information becomes available.',
  },
  {
    q: 'Is Vyzo free to use?',
    a: 'Yes, Vyzo is completely free. You can research products, read AI summaries, and compare products without an account. Creating an account unlocks personalized recommendations and price alerts.',
  },
  {
    q: 'How do I set up price alerts?',
    a: 'Sign in, find a product you\'re interested in, and click the bell icon. We\'ll notify you when the price drops.',
  },
  {
    q: 'Can I suggest a product to add?',
    a: 'Absolutely! Use the feedback form below to suggest products you\'d like us to research and add to our catalog.',
  },
];

export default function ContactPage() {
  const [sent, setSent] = React.useState(false);

  return (
    <PageShell>
      <PageHeader
        title="Contact Us"
        description="We're here to help. Reach out with questions, feedback, or suggestions."
      />
      <Container className="py-10">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Contact form */}
          <div>
            <h2 className="text-xl font-bold">Send us a message</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Fill out the form and we&apos;ll get back to you within 24 hours.
            </p>
            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
                toast.success('Message sent! We\'ll get back to you soon.');
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input className="mt-1" placeholder="Your name" />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input className="mt-1" type="email" placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input className="mt-1" placeholder="How can we help?" />
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea className="mt-1" rows={5} placeholder="Tell us more..." />
              </div>
              <Button type="submit" className="gap-2">
                <Send className="h-4 w-4" /> Send Message
              </Button>
            </form>
          </div>

          {/* Contact info + FAQ */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold">Other ways to reach us</h2>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">support@vyzo.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Live Chat</p>
                    <p className="text-sm text-muted-foreground">Available 9am-6pm IST</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Office</p>
                    <p className="text-sm text-muted-foreground">Bengaluru, India</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold">Frequently Asked Questions</h2>
              <Accordion type="single" collapsible className="mt-4">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`item-${i}`}>
                    <AccordionTrigger>{faq.q}</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">{faq.a}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </Container>
    </PageShell>
  );
}

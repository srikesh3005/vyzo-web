import { PageShell, PageHeader, Container } from '@/components/page-shell';

const sections = [
  {
    title: '1. Introduction',
    content:
      'Vyzo ("we", "us", "our") provides an AI-powered product research platform. By using our services, you agree to this Privacy Policy. We are committed to protecting your privacy and being transparent about how we use your data.',
  },
  {
    title: '2. Information We Collect',
    content:
      'We collect information you provide directly (name, email, preferences), information from your use of our services (browsing history, search queries, wishlist items), and technical data (IP address, browser type, device information).',
  },
  {
    title: '3. How We Use Your Information',
    content:
      'We use your data to: provide and improve our services, personalize recommendations and search results, send price alerts and notifications, analyze usage patterns, and prevent fraud and abuse.',
  },
  {
    title: '4. Data Sharing',
    content:
      'We do not sell your personal data. We may share data with: affiliate partners (product links), service providers (analytics, hosting), and legal authorities when required by law. All sharing is done in accordance with applicable data protection laws.',
  },
  {
    title: '5. Cookies',
    content:
      'We use cookies and similar technologies to remember your preferences, analyze traffic, and improve your experience. You can control cookies through your browser settings.',
  },
  {
    title: '6. Data Security',
    content:
      'We implement industry-standard security measures including encryption, access controls, and regular security audits. However, no method of transmission over the internet is 100% secure.',
  },
  {
    title: '7. Your Rights',
    content:
      'You have the right to: access your data, correct inaccuracies, request deletion, export your data, and opt out of marketing communications. Contact us at privacy@vyzo.com to exercise these rights.',
  },
  {
    title: '8. Children\'s Privacy',
    content:
      'Our services are not directed to children under 13. We do not knowingly collect data from children under 13. If you believe we have, please contact us immediately.',
  },
  {
    title: '9. Changes to This Policy',
    content:
      'We may update this Privacy Policy from time to time. We will notify you of significant changes via email or in-app notification. Continued use after changes constitutes acceptance.',
  },
  {
    title: '10. Contact Us',
    content:
      'If you have questions about this Privacy Policy, contact us at privacy@vyzo.com or through our contact page.',
  },
];

export default function PrivacyPage() {
  return (
    <PageShell>
      <PageHeader
        title="Privacy Policy"
        description="Last updated: July 2024 — Your privacy matters to us"
      />
      <Container className="py-10">
        <div className="mx-auto max-w-3xl space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {section.content}
              </p>
            </section>
          ))}
        </div>
      </Container>
    </PageShell>
  );
}

import { PageShell, PageHeader, Container } from '@/components/page-shell';

const sections = [
  {
    title: '1. Acceptance of Terms',
    content:
      'By accessing or using Vyzo, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.',
  },
  {
    title: '2. Description of Service',
    content:
      'Vyzo provides AI-powered product research, summaries, comparisons, and recommendations. We may modify or discontinue any feature at any time without notice.',
  },
  {
    title: '3. User Accounts',
    content:
      'You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must be 13+ to create an account.',
  },
  {
    title: '4. Acceptable Use',
    content:
      'You agree not to: misuse the service, attempt unauthorized access, scrape or spam, upload malicious content, or violate any laws. Violations may result in account termination.',
  },
  {
    title: '5. Intellectual Property',
    content:
      'All content on Vyzo — including AI summaries, reviews, design, and software — is owned by us or our licensors. You may not copy, modify, or distribute our content without permission.',
  },
  {
    title: '6. Affiliate Disclosure',
    content:
      'Vyzo earns commissions through affiliate links. This does not influence our ratings or AI summaries. Prices and availability are subject to change by the retailer.',
  },
  {
    title: '7. Disclaimers',
    content:
      'Vyzo is provided "as is" without warranties of any kind. We do not guarantee the accuracy of AI summaries, prices, or product information. Always verify before purchasing.',
  },
  {
    title: '8. Limitation of Liability',
    content:
      'Vyzo is not liable for any indirect, incidental, or consequential damages arising from your use of the service. Our total liability is limited to the amount you paid us (if any).',
  },
  {
    title: '9. Termination',
    content:
      'We may terminate or suspend your account at any time for violations of these terms. You may delete your account at any time from your profile settings.',
  },
  {
    title: '10. Changes to Terms',
    content:
      'We may update these Terms from time to time. We will notify you of significant changes. Continued use after changes constitutes acceptance.',
  },
  {
    title: '11. Contact',
    content:
      'Questions about these Terms? Contact us at legal@vyzo.com.',
  },
];

export default function TermsPage() {
  return (
    <PageShell>
      <PageHeader
        title="Terms of Service"
        description="Last updated: July 2024 — The rules of using Vyzo"
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

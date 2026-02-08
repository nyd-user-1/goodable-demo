import { ChatHeader } from '@/components/ChatHeader';
import FooterSimple from '@/components/marketing/FooterSimple';

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col">
      <ChatHeader />
      <div className="container mx-auto px-4 py-16 md:px-6 lg:py-24 2xl:max-w-[1400px] flex-1">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold sm:text-4xl">Privacy Policy</h1>
          <p className="text-muted-foreground mt-2 text-sm">Last updated: February 8, 2026</p>

          <div className="mt-10 space-y-8 text-sm leading-relaxed text-foreground">
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">1. Introduction</h2>
              <p>
                NYSgpt ("we," "our," or "the Platform") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">2. Information We Collect</h2>
              <p><strong>Information you provide:</strong></p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Account information (name, email address)</li>
                <li>Profile details (role, policy interests)</li>
                <li>Content you create (chats, notes, excerpts, saved prompts)</li>
                <li>Contact form submissions</li>
              </ul>
              <p className="mt-3"><strong>Information collected automatically:</strong></p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Device and browser information</li>
                <li>Usage data and interaction patterns</li>
                <li>IP address and approximate location</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">3. How We Use Your Information</h2>
              <p>We use collected information to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide, maintain, and improve the Platform</li>
                <li>Personalize your experience and content recommendations</li>
                <li>Process your requests and respond to inquiries</li>
                <li>Send updates about legislation and policy you follow</li>
                <li>Analyze usage patterns to improve our services</li>
                <li>Protect against fraud and unauthorized access</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">4. AI Processing</h2>
              <p>
                When you use our AI-powered features, your queries and conversations are processed to generate responses. We may use anonymized and aggregated conversation data to improve our AI models and service quality. We do not sell your personal conversations to third parties.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">5. Data Sharing</h2>
              <p>We may share your information with:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Service providers:</strong> Third-party services that help us operate the Platform (e.g., hosting, analytics, AI processing)</li>
                <li><strong>Legal requirements:</strong> When required by law, regulation, or legal process</li>
                <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              </ul>
              <p className="mt-2">We do not sell your personal information to advertisers or data brokers.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">6. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your information, including encryption in transit and at rest, secure authentication, and regular security assessments. However, no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">7. Data Retention</h2>
              <p>
                We retain your information for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data at any time by contacting us.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">8. Your Rights</h2>
              <p>Depending on your jurisdiction, you may have the right to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Object to or restrict processing of your information</li>
                <li>Request a portable copy of your data</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">9. Cookies</h2>
              <p>
                We use cookies and similar technologies to maintain your session, remember your preferences, and analyze Platform usage. You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">10. Children's Privacy</h2>
              <p>
                The Platform is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we learn that we have collected such information, we will take steps to delete it.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">11. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on the Platform. Your continued use after changes are posted constitutes acceptance of the updated policy.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">12. Contact</h2>
              <p>
                If you have questions about this Privacy Policy, please contact us at{' '}
                <a href="/contact" className="text-primary font-medium hover:underline">our contact page</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
      <FooterSimple />
    </div>
  );
}

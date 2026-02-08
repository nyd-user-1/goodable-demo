import { ChatHeader } from '@/components/ChatHeader';
import FooterSimple from '@/components/marketing/FooterSimple';

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col">
      <ChatHeader />
      <div className="container mx-auto px-4 py-16 md:px-6 lg:py-24 2xl:max-w-[1400px] flex-1">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold sm:text-4xl">Terms of Service</h1>
          <p className="text-muted-foreground mt-2 text-sm">Last updated: February 8, 2026</p>

          <div className="mt-10 space-y-8 text-sm leading-relaxed text-foreground">
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">1. Acceptance of Terms</h2>
              <p>
                By accessing or using NYSgpt ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">2. Description of Service</h2>
              <p>
                NYSgpt is an AI-powered civic engagement platform that provides tools for tracking New York State legislation, analyzing policy, and connecting with government representatives. The Platform is currently in early development.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">3. User Accounts</h2>
              <p>
                You may be required to create an account to access certain features. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate information and to update it as necessary.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">4. Acceptable Use</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Use the Platform for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to the Platform or its systems</li>
                <li>Interfere with or disrupt the Platform's functionality</li>
                <li>Transmit harmful code, malware, or other malicious content</li>
                <li>Scrape, harvest, or collect data from the Platform without authorization</li>
                <li>Impersonate any person or entity</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">5. AI-Generated Content</h2>
              <p>
                The Platform uses artificial intelligence to generate analysis and responses. AI-generated content is provided for informational purposes only and should not be considered legal, professional, or official government advice. You should independently verify any information before relying on it for decision-making.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">6. Intellectual Property</h2>
              <p>
                The Platform and its original content, features, and functionality are owned by NYSgpt and are protected by applicable intellectual property laws. Your use of the Platform does not grant you any ownership rights to its content or technology.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">7. User Content</h2>
              <p>
                You retain ownership of content you create on the Platform, including notes, chats, and excerpts. By using the Platform, you grant us a limited license to store and process your content as necessary to provide the service.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">8. Disclaimer of Warranties</h2>
              <p>
                The Platform is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee the accuracy, completeness, or timeliness of any information provided through the Platform.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">9. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, NYSgpt shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">10. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. We will notify users of significant changes by posting a notice on the Platform. Your continued use of the Platform after changes are posted constitutes acceptance of the modified terms.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">11. Contact</h2>
              <p>
                If you have questions about these Terms of Service, please contact us at{' '}
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

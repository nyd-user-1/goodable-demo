import { ChatHeader } from '@/components/ChatHeader';
import FooterSimple from '@/components/marketing/FooterSimple';
import { SubscriptionPlans } from '@/components/shared/SubscriptionPlans';

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header Navigation */}
      <ChatHeader />

      {/* Main Content */}
      <main className="flex-1 pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Hero Section */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Pricing
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Tools for every level of civic engagement, from curious citizens to professional advocates.
            </p>
          </div>

          {/* Pricing Philosophy */}
          <article className="prose prose-lg dark:prose-invert max-w-none mb-16">
            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Our Pricing Philosophy</h2>
              <p>
                We believe that access to legislative information should be a right, not a privilege. That's why NYSgpt offers a robust free tier that gives everyone the ability to explore bills, track legislation, and understand what their government is doing. Democracy works better when citizens are informed, and we're committed to keeping that foundation accessible to all.
              </p>
              <p>
                For those who want to go deeper—whether you're advocating for causes you care about, working in government, conducting research, or advising clients on policy matters—our paid tiers unlock increasingly powerful tools. Each tier is designed for a specific type of user, with features that match how you actually engage with the legislative process.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Built for How You Work</h2>
              <p>
                The <strong>Citizen</strong> tier is perfect for engaged community members who want unlimited access to our AI-powered analysis, the ability to draft legislative proposals, and tools to communicate effectively with their representatives. At just $5 per month, it's less than a cup of coffee for a complete civic engagement toolkit.
              </p>
              <p>
                Our <strong>Staffer</strong> tier is built specifically for the people who make government work—legislative aides, committee staff, and policy analysts who need to track dozens of bills, collaborate with colleagues, and stay on top of committee agendas. The <strong>Researcher</strong> tier adds historical data access, advanced analytics, and export capabilities for academics, journalists, and think tank analysts who need to dig deeper into policy trends.
              </p>
              <p>
                For <strong>Professional</strong> advocates, lobbyists, and consultants, we offer full API access, custom integrations, and white-label options that let you build NYSgpt's intelligence into your own workflows. And for organizations that need multi-user management, custom workflows, and dedicated support, our <strong>Enterprise</strong> tier provides everything you need to equip your entire team.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">No Surprises, No Lock-In</h2>
              <p>
                We keep our pricing simple and transparent. Pay monthly or save 20% with annual billing. Upgrade, downgrade, or cancel anytime—your data is always yours, and we make it easy to export everything if you ever decide to leave. We earn your business every month by providing genuine value, not by making it hard to switch.
              </p>
              <p>
                If you're a nonprofit, educational institution, or community organization doing important civic work, reach out to us. We offer significant discounts for organizations that are strengthening democracy in their communities. We're here to help you succeed, and we'll work with you to find a plan that fits your budget and your mission.
              </p>
            </section>
          </article>
        </div>

        {/* Subscription Plans Component */}
        <div className="container mx-auto px-4 max-w-6xl">
          <SubscriptionPlans />
        </div>
      </main>

      {/* Footer */}
      <FooterSimple />
    </div>
  );
};

export default Pricing;

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

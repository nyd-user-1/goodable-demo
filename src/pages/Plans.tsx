import { ChatHeader } from '@/components/ChatHeader';
import FooterSimple from '@/components/marketing/FooterSimple';
import { SubscriptionPlans } from '@/components/shared/SubscriptionPlans';

export default function Plans() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ChatHeader />

      <main className="flex-1 pt-16">
        <div className="mx-auto max-w-[1300px] px-6 sm:px-8 py-12">
          <SubscriptionPlans />
        </div>
      </main>

      <FooterSimple />
    </div>
  );
}

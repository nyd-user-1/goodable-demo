import { ChatHeader } from '@/components/ChatHeader';
import MultiStepCTAHero from '@/components/marketing/MultiStepCTAHero';

export default function Auth4() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <ChatHeader />

      {/* Multi-Step CTA Hero - Sign Up Form */}
      <MultiStepCTAHero />
    </div>
  );
}

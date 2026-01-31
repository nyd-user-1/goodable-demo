import { ChatHeader } from '@/components/ChatHeader';
import HeroSectionWithContentTabs from '@/components/marketing/HeroSectionWithContentTabs';
import FooterSimple from '@/components/marketing/FooterSimple';

export default function FreeTrial() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <ChatHeader />

      {/* Block 1: Hero Section with Content Tabs */}
      <div className="pt-14">
        <HeroSectionWithContentTabs />
      </div>

      {/* Footer */}
      <FooterSimple />
    </div>
  );
}

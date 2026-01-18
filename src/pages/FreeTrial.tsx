import { ChatHeader } from '@/components/ChatHeader';
import MultiStepCTAHero from '@/components/marketing/MultiStepCTAHero';
import HeroSectionWithContentTabs from '@/components/marketing/HeroSectionWithContentTabs';
import CompactMetricList from '@/components/CompactMetricList';
import HeroSectionWithFeatureTimeline from '@/components/marketing/HeroSectionWithFeatureTimeline';
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

      {/* Block 2: Compact Metric List */}
      <CompactMetricList />

      {/* Block 3: Hero Section with Feature Timeline */}
      <HeroSectionWithFeatureTimeline />

      {/* Block 4: Multi-Step CTA Hero */}
      <MultiStepCTAHero />

      {/* Block 5: Simple Footer */}
      <FooterSimple />
    </div>
  );
}

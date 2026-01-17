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

      {/* Block 1: Multi-Step CTA Hero */}
      <div className="pt-14">
        <MultiStepCTAHero />
      </div>

      {/* Block 2: Hero Section with Content Tabs */}
      <HeroSectionWithContentTabs />

      {/* Block 3: Compact Metric List */}
      <CompactMetricList />

      {/* Block 4: Hero Section with Feature Timeline */}
      <HeroSectionWithFeatureTimeline />

      {/* Block 5: Simple Footer */}
      <FooterSimple />
    </div>
  );
}

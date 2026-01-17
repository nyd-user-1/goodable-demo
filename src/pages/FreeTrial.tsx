import MultiStepCTAHero from '@/components/marketing/MultiStepCTAHero';
import HeroSectionWithContentTabs from '@/components/marketing/HeroSectionWithContentTabs';
import HeroSectionWithFeatureTimeline from '@/components/marketing/HeroSectionWithFeatureTimeline';
import FooterSimple from '@/components/marketing/FooterSimple';

export default function FreeTrial() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Block 1: Multi-Step CTA Hero */}
      <MultiStepCTAHero />

      {/* Block 2: Hero Section with Content Tabs */}
      <HeroSectionWithContentTabs />

      {/* Block 3: Hero Section with Feature Timeline */}
      <HeroSectionWithFeatureTimeline />

      {/* Block 4: Simple Footer */}
      <FooterSimple />
    </div>
  );
}

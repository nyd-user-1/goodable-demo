import { ChatHeader } from '@/components/ChatHeader';
import CompactMetricList from '@/components/CompactMetricList';
import FooterSimple from '@/components/marketing/FooterSimple';

export default function LiveFeed() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <ChatHeader />

      {/* Live Feed Content */}
      <div className="pt-14 flex-1">
        <CompactMetricList />
      </div>

      {/* Footer */}
      <FooterSimple />
    </div>
  );
}

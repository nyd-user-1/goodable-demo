import { useState } from 'react';
import { ChatHeader } from '@/components/ChatHeader';
import FooterSimple from '@/components/marketing/FooterSimple';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Quote,
  FileSpreadsheet,
  Bookmark,
  Mail,
  Radio,
  MessageSquare,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

type Feature = {
  title: string;
  icon: React.ElementType;
  shortDescription: string;
  expandedDescription: string;
  image: string;
  imageAlt: string;
  reverse: boolean;
  imagePosition?: string;
  zoomImage?: string;
  zoomSize?: { width: number; height: number };
  category: 'research' | 'ai' | 'documentation';
};

const features: Feature[] = [
  // Research & Tracking
  {
    title: 'Bill Tracking',
    icon: FileText,
    shortDescription:
      'Stay informed on the legislation that matters most to you. Our comprehensive bill tracking system monitors thousands of bills across the New York State Legislature, providing real-time status updates, committee assignments, and voting records. Set up personalized alerts to receive notifications when bills you care about move through the legislative process.',
    expandedDescription:
      'Each bill in our database includes plain-English summaries, sponsor information, committee assignments, and complete legislative history. Filter by topic, sponsor, committee, or status to find exactly what you\'re looking for. Whether you\'re tracking a single bill or monitoring an entire policy area, our bill tracking tools give you the visibility you need.',
    image: '/bill-tracking.png',
    imageAlt: 'Bill tracking dashboard screenshot',
    reverse: false,
    imagePosition: 'object-top',
    zoomImage: '/bill-tracking-zoom.png',
    zoomSize: { width: 320, height: 196 },
    category: 'research',
  },
  {
    title: 'Live Feed',
    icon: Radio,
    shortDescription:
      'Stay current with real-time legislative activity. Our live feed provides instant updates on bill movements, votes, committee actions, and other legislative events as they happen. Never miss an important development again.',
    expandedDescription:
      'Customize your feed to focus on the issues, committees, or legislators you care about most. Get instant notifications for time-sensitive actions like upcoming votes or public comment deadlines. The live feed keeps you connected to the legislative process in real-time.',
    image: '/live-feed-table-2.png',
    imageAlt: 'Live feed screenshot',
    reverse: true,
    zoomImage: '/live-feed-zoom-2.png',
    zoomSize: { width: 380, height: 130 },
    category: 'research',
  },
  {
    title: 'Contracts',
    icon: FileSpreadsheet,
    shortDescription:
      'Access and analyze government contracts with unprecedented transparency. Our contracts database provides detailed information on public spending, vendor relationships, and procurement patterns. Understand how tax dollars are being allocated and hold government accountable for spending decisions.',
    expandedDescription:
      'Search contracts by agency, vendor, amount, or category. Track spending trends over time and identify patterns that might otherwise go unnoticed. Whether you\'re a journalist investigating public spending or a citizen interested in how your community\'s resources are being used, our contracts tools provide the transparency you need.',
    image: '/contracts-1.png',
    imageAlt: 'Contracts database screenshot',
    reverse: false,
    imagePosition: 'object-top',
    zoomImage: '/contracts-zoom.png',
    zoomSize: { width: 320, height: 235 },
    category: 'research',
  },
  // AI-Powered Tools
  {
    title: 'Multi-Engine Chat',
    icon: MessageSquare,
    shortDescription:
      'Get intelligent answers to your legislative questions. Our multi-engine chat system combines advanced AI models to provide accurate, comprehensive responses about bills, policies, and the legislative process. Ask questions in plain English and receive clear, well-sourced answers.',
    expandedDescription:
      'Choose from multiple AI engines optimized for different types of queries. Whether you need a quick summary, detailed analysis, or help understanding complex legal language, our chat system adapts to your needs. All responses include citations so you can verify information and dig deeper.',
    image: '/multi-engine-chat-main-2.png',
    imageAlt: 'Multi-engine chat interface screenshot',
    reverse: true,
    imagePosition: 'object-top',
    zoomImage: '/multi-engine-chat-zoom-2.png',
    zoomSize: { width: 240, height: 365 },
    category: 'ai',
  },
  {
    title: 'Prompt Library',
    icon: Sparkles,
    shortDescription:
      'Accelerate your research with pre-built query templates. Our prompt library contains carefully crafted prompts for common legislative research tasks. Whether you\'re analyzing a bill\'s potential impact, comparing legislation across sessions, or researching a legislator\'s voting history, our prompt library gives you a head start.',
    expandedDescription:
      'Browse prompts by category or search for specific topics. Customize prompts to fit your exact needs, then save your favorites for future use. The prompt library is continuously updated based on user feedback and emerging research needs.',
    image: '/bill-prompts.png',
    imageAlt: 'Prompt library interface showing legislative research topics',
    reverse: false,
    zoomImage: '/bill-prompts-zoom.png',
    zoomSize: { width: 340, height: 191 },
    category: 'ai',
  },
  // Documentation & Communication
  {
    title: 'Citations',
    icon: Quote,
    shortDescription:
      'Build credible arguments with properly sourced information. Our citation system automatically generates accurate references for bills, legislative actions, and official documents. When you\'re writing to your representative, preparing testimony, or creating advocacy materials, our citation tools ensure your work is backed by authoritative sources.',
    expandedDescription:
      'Citations include direct links to official legislative documents, making it easy for others to verify your sources. Export citations in multiple formats for use in reports, letters, or academic research. Never worry about finding the right reference again.',
    image: '/citations.png',
    imageAlt: 'Citations interface screenshot',
    reverse: true,
    imagePosition: 'object-bottom',
    zoomImage: '/citations-zoom.png',
    zoomSize: { width: 380, height: 134 },
    category: 'documentation',
  },
  {
    title: 'Excerpts',
    icon: Bookmark,
    shortDescription:
      'Save and organize the most important parts of your research. Our excerpts feature lets you highlight and store key passages from bills, analyses, and documents. Build a personal library of legislative insights that you can reference, share, and use in your advocacy work.',
    expandedDescription:
      'Excerpts automatically maintain links to their source documents, so you always know where information came from. Organize excerpts by topic, bill, or project. Share collections with colleagues or coalition partners to keep everyone on the same page.',
    image: '/excerpts.png',
    imageAlt: 'Excerpts feature screenshot',
    reverse: false,
    imagePosition: 'object-top',
    zoomImage: '/excerpts-zoom.png',
    zoomSize: { width: 280, height: 246 },
    category: 'documentation',
  },
  {
    title: 'Letter Generation',
    icon: Mail,
    shortDescription:
      'Make your voice heard with professionally crafted correspondence. Our AI-powered letter generation tools help you write effective communications to your elected representatives. Whether you\'re expressing support, opposition, or requesting a meeting, our templates and writing assistance ensure your message is clear, professional, and impactful.',
    expandedDescription:
      'Choose from multiple letter formats including formal correspondence, email templates, and public comment submissions. Our AI can help you articulate your position while maintaining your authentic voice. Letters automatically include relevant bill numbers, committee information, and other details that show you\'ve done your homework.',
    image: '/letter-generation.png',
    imageAlt: 'Letter generation interface screenshot',
    reverse: true,
    imagePosition: 'object-top',
    zoomImage: '/letter-generation-zoom.png',
    zoomSize: { width: 280, height: 292 },
    category: 'documentation',
  },
];

const categories = [
  { id: 'research', name: 'Research & Tracking', description: 'Monitor legislation and government activity' },
  { id: 'ai', name: 'AI-Powered Tools', description: 'Intelligent assistance for your research' },
  { id: 'documentation', name: 'Documentation & Communication', description: 'Create and share your work' },
] as const;

const FeatureCard = ({ feature }: { feature: Feature }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = feature.icon;

  return (
    <div
      className={`grid grid-cols-1 items-center gap-8 lg:grid-cols-2 ${
        feature.reverse ? 'lg:grid-cols-[1fr,1fr]' : 'lg:grid-cols-[1fr,1fr]'
      }`}
    >
      <div className={feature.reverse ? 'lg:order-last' : ''}>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">{feature.title}</h3>
          </div>
          <p className="text-muted-foreground">{feature.shortDescription}</p>

          {/* Expandable content */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <p className="text-muted-foreground pt-2">{feature.expandedDescription}</p>
          </div>

          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground hover:bg-muted px-3 h-9 gap-1"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                Show less
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Learn more
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
      <div className="relative">
        {/* Main image container */}
        <div className="relative aspect-video overflow-hidden md:rounded-2xl md:border border-gray-200 shadow-lg">
          <img
            src={feature.image}
            alt={feature.imageAlt}
            className={`object-cover ${feature.imagePosition || 'object-center'} w-full h-full`}
          />
        </div>
        {/* Zoom overlay image - hidden on mobile */}
        {feature.zoomImage && (
          <div
            className="absolute -bottom-4 -right-4 rounded-xl border border-gray-200 shadow-lg overflow-hidden bg-white hidden md:block"
            style={{
              width: feature.zoomSize?.width || 380,
              height: feature.zoomSize?.height || 134,
            }}
          >
            <img
              src={feature.zoomImage}
              alt={`${feature.title} detail view`}
              className="object-cover w-full h-full"
            />
          </div>
        )}
      </div>
    </div>
  );
};

const Features2 = () => {
  const scrollToCategory = (categoryId: string) => {
    const element = document.getElementById(categoryId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header Navigation */}
      <ChatHeader />

      {/* Main Content */}
      <main className="flex-1 pt-16">
        <section className="container mx-auto space-y-24 px-4 py-12 md:px-6 2xl:max-w-[1400px]">
          {/* Enhanced Hero Section */}
          <div className="space-y-6 text-center">
            {/* Feature count badge */}
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              8 Powerful Features
            </div>

            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Platform Features
            </h1>
            <p className="text-muted-foreground mx-auto max-w-[700px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Everything you need to engage with the legislative process, from tracking bills to taking action.
            </p>

            {/* Subtle stat */}
            <p className="text-sm text-muted-foreground/70">
              Tracking thousands of bills across NYS
            </p>

            {/* Category navigation pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => scrollToCategory(category.id)}
                  className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Features grouped by category */}
          <div className="space-y-32">
            {categories.map((category) => {
              const categoryFeatures = features.filter((f) => f.category === category.id);
              return (
                <div key={category.id} id={category.id} className="scroll-mt-24">
                  {/* Category header */}
                  <div className="mb-16 rounded-xl bg-muted/50 p-6 text-center">
                    <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                      {category.name}
                    </h2>
                    <p className="mt-2 text-muted-foreground">{category.description}</p>
                  </div>

                  {/* Features in this category */}
                  <div className="space-y-24">
                    {categoryFeatures.map((feature) => (
                      <FeatureCard key={feature.title} feature={feature} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t bg-muted/30">
          <div className="container mx-auto px-4 py-16 md:px-6 2xl:max-w-[1400px]">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                Ready to engage with democracy?
              </h2>
              <p className="max-w-[600px] text-muted-foreground">
                Join thousands of citizens, advocates, and professionals using our platform to make their voices heard.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button asChild size="lg">
                  <Link to="/auth">Start Free Trial</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/plans">See Pricing</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <FooterSimple />
    </div>
  );
};

export default Features2;

import { ChatHeader } from '@/components/ChatHeader';
import FooterSimple from '@/components/marketing/FooterSimple';
import { Button } from '@/components/ui/button';

const features = [
  {
    title: 'Bill Tracking',
    description:
      'Stay informed on the legislation that matters most to you. Our comprehensive bill tracking system monitors thousands of bills across the New York State Legislature, providing real-time status updates, committee assignments, and voting records. Set up personalized alerts to receive notifications when bills you care about move through the legislative process.',
    image: '/bill-tracking.png',
    imageAlt: 'Bill tracking dashboard screenshot',
    reverse: false,
    imagePosition: 'object-top',
    zoomImage: '/bill-tracking-zoom.png',
  },
  {
    title: 'Citations',
    description:
      'Build credible arguments with properly sourced information. Our citation system automatically generates accurate references for bills, legislative actions, and official documents. Citations include direct links to official legislative documents, making it easy for others to verify your sources.',
    image: '/citations.png',
    imageAlt: 'Citations interface screenshot',
    reverse: true,
    imagePosition: 'object-bottom',
    zoomImage: '/citations-zoom.png',
  },
  {
    title: 'Contracts',
    description:
      'Access and analyze government contracts with unprecedented transparency. Our contracts database provides detailed information on public spending, vendor relationships, and procurement patterns. Understand how tax dollars are being allocated and hold government accountable for spending decisions.',
    image: '/contracts-1.png',
    imageAlt: 'Contracts database screenshot',
    reverse: false,
    imagePosition: 'object-top',
    zoomImage: '/contracts-zoom.png',
  },
  {
    title: 'Excerpts',
    description:
      'Save and organize the most important parts of your research. Our excerpts feature lets you highlight and store key passages from bills, analyses, and documents. Build a personal library of legislative insights that you can reference, share, and use in your advocacy work.',
    image: '/excerpts.png',
    imageAlt: 'Excerpts feature screenshot',
    reverse: true,
    imagePosition: 'object-top',
    zoomImage: '/excerpts-zoom.png',
  },
  {
    title: 'Letter Generation',
    description:
      'Make your voice heard with professionally crafted correspondence. Our AI-powered letter generation tools help you write effective communications to your elected representatives. Choose from multiple letter formats including formal correspondence, email templates, and public comment submissions.',
    image: '/letter-generation.png',
    imageAlt: 'Letter generation interface screenshot',
    reverse: false,
    imagePosition: 'object-top',
    zoomImage: '/letter-generation-zoom.png',
  },
  {
    title: 'Live Feed',
    description:
      'Stay current with real-time legislative activity. Our live feed provides instant updates on bill movements, votes, committee actions, and other legislative events as they happen. Customize your feed to focus on the issues, committees, or legislators you care about most.',
    image: '/live-feed-6.png',
    imageAlt: 'Live feed screenshot',
    reverse: true,
    zoomImage: '/live-feed-zoom.png',
  },
  {
    title: 'Multi-Engine Chat',
    description:
      'Get intelligent answers to your legislative questions. Our multi-engine chat system combines advanced AI models to provide accurate, comprehensive responses about bills, policies, and the legislative process. Ask questions in plain English and receive clear, well-sourced answers.',
    image: '/multi-engine-chat.png',
    imageAlt: 'Multi-engine chat interface screenshot',
    reverse: false,
    imagePosition: 'object-top',
    zoomImage: '/multi-engine-chat-zoom.png',
  },
  {
    title: 'Bill Prompts',
    description:
      'Jump-start your legislative research with ready-made prompts based on active Senate and Assembly legislation. Explore topics like AI consumer protection, school safety, transportation funding, childcare affordability, rental assistance, and dozens more. Each prompt is designed to help you quickly understand pending legislation and its potential impact.',
    image: '/bill-prompts.png',
    imageAlt: 'Bill prompts interface showing legislative research topics',
    reverse: true,
    zoomImage: '/bill-prompts-zoom.png',
  },
  {
    title: 'Committee Prompts',
    description:
      'Understand what each legislative committee does and what issues they\'re currently tackling. Our committee prompts help you explore the focus areas of committees like Labor, Children and Families, Consumer Protection, Education, Transportation, Mental Health, and many more. Get instant clarity on committee responsibilities and active legislation.',
    image: '/committe-prompts.png',
    imageAlt: 'Committee prompts interface showing committee research topics',
    reverse: false,
    zoomImage: '/committee-prompts-zoom.png',
  },
  {
    title: 'Member Prompts',
    description:
      'Research legislators and their priorities with targeted prompts. Find your representative, discover which legislators champion specific causes like housing, environment, or small business, and explore leadership roles across the Assembly and Senate. Whether you\'re interested in regional representation or issue-based advocacy, these prompts help you understand who\'s who in Albany.',
    image: '/member-prompts.png',
    imageAlt: 'Member prompts interface showing legislator research topics',
    reverse: true,
    zoomImage: '/member-prompts-zoom.png',
  },
  {
    title: 'Policy Prompts',
    description:
      'Tap into the expertise of seasoned policy professionals with prompts designed for policy development. Analyze potential impacts, anticipate unintended consequences, assess fiscal implications, map stakeholders, and build coalition support. These prompts bring professional policy analysis frameworks to your fingertips.',
    image: '/policy-prompts.png',
    imageAlt: 'Policy prompts interface showing policy development topics',
    reverse: false,
    zoomImage: '/policy-prompts-zoom.png',
  },
];

const Features = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header Navigation */}
      <ChatHeader />

      {/* Main Content */}
      <main className="flex-1 pt-16">
        <section className="container mx-auto space-y-24 px-4 py-12 md:px-6 2xl:max-w-[1400px]">
          <div className="space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Platform Features
            </h1>
            <p className="text-muted-foreground mx-auto max-w-[700px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Everything you need to engage with the legislative process, from tracking bills to taking action.
            </p>
          </div>

          <div className="space-y-24">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`grid grid-cols-1 items-center gap-8 lg:grid-cols-2 ${
                  feature.reverse
                    ? 'lg:grid-cols-[1fr,1fr]'
                    : 'lg:grid-cols-[1fr,1fr]'
                }`}
              >
                <div className={feature.reverse ? 'lg:order-last' : ''}>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-muted px-3 h-9">Learn more</Button>
                  </div>
                </div>
                <div className="relative">
                  {/* Main image container */}
                  <div className="relative aspect-video overflow-hidden rounded-2xl border border-gray-200 shadow-lg">
                    <img
                      src={feature.image}
                      alt={feature.imageAlt}
                      className={`object-cover ${feature.imagePosition || 'object-center'} w-full h-full`}
                    />
                  </div>
                  {/* Zoom overlay image */}
                  {feature.zoomImage && (
                    <div className="absolute -bottom-4 -right-4 w-[33%] aspect-[3/4] rounded-xl border border-gray-200 shadow-lg overflow-hidden bg-white">
                      <img
                        src={feature.zoomImage}
                        alt={`${feature.title} detail view`}
                        className="object-cover object-top w-full h-full"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <FooterSimple />
    </div>
  );
};

export default Features;

import { ChatHeader } from '@/components/ChatHeader';
import FooterSimple from '@/components/marketing/FooterSimple';
import { Button } from '@/components/ui/button';

const features = [
  {
    title: 'Bill Tracking',
    description:
      'Stay informed on the legislation that matters most to you. Our comprehensive bill tracking system monitors thousands of bills across the New York State Legislature, providing real-time status updates, committee assignments, and voting records. Set up personalized alerts to receive notifications when bills you care about move through the legislative process.',
    image: 'https://placehold.co/1024x768/f8f9fa/6c757d?text=Bill+Tracking',
    imageAlt: 'Bill tracking dashboard screenshot',
    reverse: false,
  },
  {
    title: 'Citations',
    description:
      'Build credible arguments with properly sourced information. Our citation system automatically generates accurate references for bills, legislative actions, and official documents. Citations include direct links to official legislative documents, making it easy for others to verify your sources.',
    image: 'https://placehold.co/1024x768/f8f9fa/6c757d?text=Citations',
    imageAlt: 'Citations interface screenshot',
    reverse: true,
  },
  {
    title: 'Contracts',
    description:
      'Access and analyze government contracts with unprecedented transparency. Our contracts database provides detailed information on public spending, vendor relationships, and procurement patterns. Understand how tax dollars are being allocated and hold government accountable for spending decisions.',
    image: 'https://placehold.co/1024x768/f8f9fa/6c757d?text=Contracts',
    imageAlt: 'Contracts database screenshot',
    reverse: false,
  },
  {
    title: 'Excerpts',
    description:
      'Save and organize the most important parts of your research. Our excerpts feature lets you highlight and store key passages from bills, analyses, and documents. Build a personal library of legislative insights that you can reference, share, and use in your advocacy work.',
    image: 'https://placehold.co/1024x768/f8f9fa/6c757d?text=Excerpts',
    imageAlt: 'Excerpts feature screenshot',
    reverse: true,
  },
  {
    title: 'Letter Generation',
    description:
      'Make your voice heard with professionally crafted correspondence. Our AI-powered letter generation tools help you write effective communications to your elected representatives. Choose from multiple letter formats including formal correspondence, email templates, and public comment submissions.',
    image: 'https://placehold.co/1024x768/f8f9fa/6c757d?text=Letter+Generation',
    imageAlt: 'Letter generation interface screenshot',
    reverse: false,
  },
  {
    title: 'Live Feed',
    description:
      'Stay current with real-time legislative activity. Our live feed provides instant updates on bill movements, votes, committee actions, and other legislative events as they happen. Customize your feed to focus on the issues, committees, or legislators you care about most.',
    image: 'https://placehold.co/1024x768/f8f9fa/6c757d?text=Live+Feed',
    imageAlt: 'Live feed screenshot',
    reverse: true,
  },
  {
    title: 'Multi-Engine Chat',
    description:
      'Get intelligent answers to your legislative questions. Our multi-engine chat system combines advanced AI models to provide accurate, comprehensive responses about bills, policies, and the legislative process. Ask questions in plain English and receive clear, well-sourced answers.',
    image: 'https://placehold.co/1024x768/f8f9fa/6c757d?text=Multi-Engine+Chat',
    imageAlt: 'Multi-engine chat interface screenshot',
    reverse: false,
  },
  {
    title: 'Prompt Library',
    description:
      'Accelerate your research with pre-built query templates. Our prompt library contains carefully crafted prompts for common legislative research tasks. Whether you\'re analyzing a bill\'s potential impact or researching a legislator\'s voting history, our prompt library gives you a head start.',
    image: 'https://placehold.co/1024x768/f8f9fa/6c757d?text=Prompt+Library',
    imageAlt: 'Prompt library screenshot',
    reverse: true,
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
                <div className="relative aspect-video overflow-hidden rounded-xl">
                  <img
                    src={feature.image}
                    alt={feature.imageAlt}
                    className="object-cover object-center w-full h-full"
                  />
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

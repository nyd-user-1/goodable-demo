import { ChatHeader } from '@/components/ChatHeader';
import FooterSimple from '@/components/marketing/FooterSimple';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const features = [
  {
    title: 'Bill Tracking',
    description:
      'Stay informed on the legislation that matters most to you. Our comprehensive bill tracking system monitors thousands of bills across the New York State Legislature, providing real-time status updates, committee assignments, and voting records. Set up personalized alerts to receive notifications when bills you care about move through the legislative process.',
    image: '/bill-tracking.png',
    imageAlt: 'Bill tracking dashboard screenshot',
    zoomImage: '/bill-tracking-zoom.png',
    zoomSize: { width: 320, height: 196 },
    gradient: 'from-blue-400 to-cyan-300',
  },
  {
    title: 'Citations',
    description:
      'Build credible arguments with properly sourced information. Our citation system automatically generates accurate references for bills, legislative actions, and official documents. Citations include direct links to official legislative documents, making it easy for others to verify your sources.',
    image: '/citations.png',
    imageAlt: 'Citations interface screenshot',
    zoomImage: '/citations-zoom.png',
    zoomSize: { width: 380, height: 134 },
    gradient: 'from-emerald-400 to-teal-300',
  },
  {
    title: 'Contracts',
    description:
      'Access and analyze government contracts with unprecedented transparency. Our contracts database provides detailed information on public spending, vendor relationships, and procurement patterns. Understand how tax dollars are being allocated and hold government accountable for spending decisions.',
    image: '/contracts-1.png',
    imageAlt: 'Contracts database screenshot',
    zoomImage: '/contracts-zoom.png',
    zoomSize: { width: 320, height: 235 },
    gradient: 'from-purple-400 to-pink-300',
  },
  {
    title: 'Excerpts',
    description:
      'Save and organize the most important parts of your research. Our excerpts feature lets you highlight and store key passages from bills, analyses, and documents. Build a personal library of legislative insights that you can reference, share, and use in your advocacy work.',
    image: '/excerpts.png',
    imageAlt: 'Excerpts feature screenshot',
    zoomImage: '/excerpts-zoom.png',
    zoomSize: { width: 280, height: 246 },
    gradient: 'from-sky-300 via-sky-400 to-sky-600',
  },
  {
    title: 'Letter Generation',
    description:
      'Make your voice heard with professionally crafted correspondence. Our AI-powered letter generation tools help you write effective communications to your elected representatives. Choose from multiple letter formats including formal correspondence, email templates, and public comment submissions.',
    image: '/letter-generation.png',
    imageAlt: 'Letter generation interface screenshot',
    zoomImage: '/letter-generation-zoom.png',
    zoomSize: { width: 280, height: 292 },
    gradient: 'from-yellow-300 via-amber-400 to-amber-600',
  },
  {
    title: 'Live Feed',
    description:
      'Stay current with real-time legislative activity. Our live feed provides instant updates on bill movements, votes, committee actions, and other legislative events as they happen. Customize your feed to focus on the issues, committees, or legislators you care about most.',
    image: '/live-feed-table-2.png',
    imageAlt: 'Live feed screenshot',
    zoomImage: '/live-feed-zoom-2.png',
    zoomSize: { width: 380, height: 130 },
    gradient: 'from-pink-200 via-fuchsia-300 to-purple-500',
  },
  {
    title: 'Multi-Engine Chat',
    description:
      'Get intelligent answers to your legislative questions. Our multi-engine chat system combines advanced AI models to provide accurate, comprehensive responses about bills, policies, and the legislative process. Ask questions in plain English and receive clear, well-sourced answers.',
    image: '/multi-engine-chat-main-2.png',
    imageAlt: 'Multi-engine chat interface screenshot',
    zoomImage: '/multi-engine-chat-zoom-2.png',
    zoomSize: { width: 240, height: 365 },
    gradient: 'from-emerald-300 via-emerald-400 to-teal-600',
  },
  {
    title: 'Bill Prompts',
    description:
      'Jump-start your legislative research with ready-made prompts based on active Senate and Assembly legislation. Explore topics like AI consumer protection, school safety, transportation funding, childcare affordability, rental assistance, and dozens more.',
    image: '/bill-prompts.png',
    imageAlt: 'Bill prompts interface showing legislative research topics',
    zoomImage: '/bill-prompts-zoom.png',
    zoomSize: { width: 340, height: 191 },
    gradient: 'from-blue-400 to-cyan-300',
  },
  {
    title: 'Committee Prompts',
    description:
      'Understand what each legislative committee does and what issues they\'re currently tackling. Our committee prompts help you explore the focus areas of committees like Labor, Children and Families, Consumer Protection, Education, Transportation, Mental Health, and many more.',
    image: '/committe-prompts.png',
    imageAlt: 'Committee prompts interface showing committee research topics',
    zoomImage: '/committee-prompts-zoom.png',
    zoomSize: { width: 340, height: 169 },
    gradient: 'from-purple-400 to-pink-300',
  },
  {
    title: 'Member Prompts',
    description:
      'Research legislators and their priorities with targeted prompts. Find your representative, discover which legislators champion specific causes like housing, environment, or small business, and explore leadership roles across the Assembly and Senate.',
    image: '/member-prompts.png',
    imageAlt: 'Member prompts interface showing legislator research topics',
    zoomImage: '/member-prompts-zoom.png',
    zoomSize: { width: 340, height: 170 },
    gradient: 'from-sky-300 via-sky-400 to-sky-600',
  },
  {
    title: 'Policy Prompts',
    description:
      'Tap into the expertise of seasoned policy professionals with prompts designed for policy development. Analyze potential impacts, anticipate unintended consequences, assess fiscal implications, map stakeholders, and build coalition support.',
    image: '/policy-prompts.png',
    imageAlt: 'Policy prompts interface showing policy development topics',
    zoomImage: '/policy-prompts-zoom.png',
    zoomSize: { width: 340, height: 193 },
    gradient: 'from-yellow-300 via-amber-400 to-amber-600',
  },
];

const Features = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % features.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + features.length) % features.length);
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ChatHeader />

      <main className="flex-1 pt-16">
        <section className="container mx-auto px-4 py-12 md:px-6 max-w-[1300px]">
          <div className="space-y-4 text-center mb-12">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Platform Features
            </h1>
            <p className="text-muted-foreground mx-auto max-w-[700px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Everything you need to engage with the legislative process, from tracking bills to taking action.
            </p>
          </div>

          {/* Carousel */}
          <div className="relative overflow-hidden rounded-2xl">
            {/* Sliding track */}
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className={`min-w-full bg-gradient-to-br ${feature.gradient}`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 sm:p-8 md:p-12 min-h-[420px] md:min-h-[480px]">
                    {/* Text content */}
                    <div className="flex flex-col justify-center">
                      <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">{feature.title}</h3>
                      <p className="text-white/90 text-sm sm:text-base leading-relaxed">{feature.description}</p>
                    </div>

                    {/* Stacked images */}
                    <div className="hidden md:flex relative items-center justify-center">
                      <div className="relative w-full max-w-[500px]">
                        {/* Main image */}
                        <div className="relative aspect-video overflow-hidden rounded-xl border border-white/20 shadow-lg shadow-black/20">
                          <img
                            src={feature.image}
                            alt={feature.imageAlt}
                            className="object-cover object-top w-full h-full"
                          />
                        </div>
                        {/* Zoom overlay image — uses original dimensions to avoid cropping */}
                        {feature.zoomImage && (
                          <div
                            className="absolute -bottom-4 -right-4 rounded-xl border border-white/30 shadow-lg shadow-black/20 overflow-hidden bg-white"
                            style={{
                              width: feature.zoomSize.width,
                              height: feature.zoomSize.height,
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
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation arrows */}
            <button
              onClick={(e) => { e.stopPropagation(); prevSlide(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur hover:bg-white/30 flex items-center justify-center transition-colors"
              aria-label="Previous feature"
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextSlide(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur hover:bg-white/30 flex items-center justify-center transition-colors"
              aria-label="Next feature"
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>

            {/* Dot indicators inside carousel */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.stopPropagation(); setCurrentSlide(index); }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentSlide
                      ? 'bg-white'
                      : 'bg-white/40'
                  }`}
                  aria-label={`Go to feature ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button size="lg" variant="outline" asChild>
              <Link to="/">Get Started with NYSgpt</Link>
            </Button>
          </div>
        </section>
      </main>

      <FooterSimple />
    </div>
  );
};

export default Features;

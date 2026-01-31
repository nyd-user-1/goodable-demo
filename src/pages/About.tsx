import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChatHeader } from '@/components/ChatHeader';
import FooterSimple from '@/components/marketing/FooterSimple';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const aboutPages = [
  {
    title: 'From learning to leading',
    subtitle: 'Civic Education',
    href: '/academy',
    image: '/bill-analysis-actions.png',
    tags: ['Platform Training', 'Legislative Process', 'Advocacy Skills', 'Guest Speakers'],
    date: 'Jan 15, 2025',
  },
  {
    title: 'Practical principles for responsible AI',
    subtitle: 'AI Fluency',
    href: '/ai-fluency',
    image: '/multi-engine-chat-main-2.png',
    tags: ['Choice', 'Clarity', 'Critical Thinking', 'Coherence'],
    date: 'Feb 3, 2025',
  },
  {
    title: 'Transparent values for democratic technology',
    subtitle: 'Constitutional AI',
    href: '/constitution',
    image: '/live-feed-table-2.png',
    tags: ['Civic AI', 'Digital Ethics', 'Balanced Discourse', 'Accountability'],
    date: 'Mar 12, 2025',
  },
  {
    title: 'Protecting human dignity in the digital age',
    subtitle: 'Digital Rights',
    href: '/digital-bill-of-rights',
    image: '/bills-image-2.png',
    tags: ['Privacy', 'Well-Being', 'Security', '+7 more'],
    date: 'Apr 8, 2025',
  },
  {
    title: 'Closing the gap between citizens and government',
    subtitle: 'NYS Legislative Intelligence',
    href: '/history',
    image: '/live-feed-2.png',
    tags: ['Bill Tracking', 'AI Analysis', 'Civic Tools', '+5 more'],
    date: 'May 1, 2025',
  },
];

const About = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % aboutPages.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + aboutPages.length) % aboutPages.length);
  }, []);

  // Auto-rotate every 6 seconds
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
        <div className="mx-auto max-w-[1100px] px-4 py-12 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mx-auto max-w-2xl text-center lg:max-w-4xl">
            <h1 className="text-foreground text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              About NYSgpt
            </h1>
            <p className="text-muted-foreground mt-4 text-lg">
              Empowering citizens to shape the policies that shape their lives. Explore our mission, principles, and the ideas behind the platform.
            </p>
          </div>

          {/* Carousel */}
          <div className="relative mt-12 overflow-hidden rounded-xl">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {aboutPages.map((page) => (
                <Link
                  key={page.title}
                  to={page.href}
                  className="min-w-full block"
                >
                  <div className="relative h-64 sm:h-80 md:h-[500px] w-full overflow-hidden">
                    {/* Background Image */}
                    <img
                      src={page.image}
                      alt={page.title}
                      className="object-cover object-top w-full h-full"
                    />
                    {/* Gradient overlay from bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
                    {/* Content at bottom */}
                    <div className="absolute bottom-0 left-0 p-6 sm:p-8 md:max-w-[60%]">
                      <p className="mb-2 text-sm font-medium text-white/80">
                        {page.subtitle}
                      </p>
                      <h3 className="mb-4 text-2xl font-bold text-white sm:text-3xl md:text-4xl">
                        {page.title}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {page.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Dot indicators - bottom left */}
            <div className="absolute bottom-6 left-6 flex items-center gap-2">
              {aboutPages.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentSlide(index); }}
                  className={`h-2 rounded-full transition-all ${
                    index === currentSlide
                      ? 'bg-primary w-6'
                      : 'bg-primary/30 hover:bg-primary/50 w-2'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Navigation arrows - bottom right */}
            <div className="absolute right-6 bottom-6 flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); prevSlide(); }}
                className="bg-background/50 hover:bg-background/80 backdrop-blur-sm"
                aria-label="Previous slide"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); nextSlide(); }}
                className="bg-background/50 hover:bg-background/80 backdrop-blur-sm"
                aria-label="Next slide"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Block 2: Article List */}
          <div className="mt-12">
            <div className="divide-y divide-border rounded-xl border">
              {aboutPages.map((page, index) => (
                <Link
                  key={page.title}
                  to={page.href}
                  className={cn(
                    "flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/50",
                    index === 0 && "rounded-t-xl",
                    index === aboutPages.length - 1 && "rounded-b-xl"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{page.title}</p>
                    <div className="mt-1 flex items-center gap-3">
                      <span className="text-xs font-medium text-muted-foreground">{page.subtitle}</span>
                      <span className="text-xs text-muted-foreground/60">{page.date}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <Button size="lg" variant="outline" asChild>
              <Link to="/">Get Started with NYSgpt</Link>
            </Button>
          </div>
        </div>
      </main>

      <FooterSimple />
    </div>
  );
};

export default About;

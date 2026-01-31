import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChatHeader } from '@/components/ChatHeader';
import FooterSimple from '@/components/marketing/FooterSimple';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const aboutPages = [
  {
    title: 'Academy',
    subtitle: 'Civic Education',
    description: 'Learn the tools of modern civic engagement and become an effective advocate for your community.',
    href: '/academy',
    gradient: 'from-sky-400 to-cyan-300',
    image: '/excerpts-zoom.png',
    tags: ['Platform Training', 'Legislative Process', 'Advocacy Skills'],
  },
  {
    title: 'AI Fluency',
    subtitle: 'The 4C Framework',
    description: 'Practical principles for responsible AI. Choice, Clarity, Critical Thinking, and Coherence.',
    href: '/ai-fluency',
    gradient: 'from-emerald-400 to-teal-300',
    image: '/citations-zoom.png',
    tags: ['Choice', 'Clarity', 'Critical Thinking', 'Coherence'],
  },
  {
    title: 'Constitution',
    subtitle: 'Constitutional AI',
    description: 'Transparent values for democratic technology. The principles that govern our AI systems.',
    href: '/constitution',
    gradient: 'from-fuchsia-400 to-purple-300',
    image: '/dashboard-analytics.png',
    tags: ['Civic AI', 'Digital Ethics', 'Balanced Discourse'],
  },
  {
    title: 'Digital Bill of Rights',
    subtitle: 'Digital Rights',
    description: 'Protecting human dignity in the digital age. Fundamental rights and freedoms for all.',
    href: '/digital-bill-of-rights',
    gradient: 'from-rose-400 to-orange-300',
    image: '/letter-generation-zoom.png',
    tags: ['Privacy', 'Well-Being', 'Security'],
  },
  {
    title: 'History',
    subtitle: 'Our Story',
    description: 'How NYSgpt began and where we\'re headed. Closing the gap between citizens and government.',
    href: '/history',
    gradient: 'from-amber-400 to-yellow-300',
    image: '/contracts-zoom.png',
    tags: ['Bill Tracking', 'AI Analysis', 'Civic Tools'],
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
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
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
          <div className="relative mt-12 overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {aboutPages.map((page) => (
                <Link
                  key={page.title}
                  to={page.href}
                  className={`min-w-full bg-gradient-to-br ${page.gradient} block`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 sm:p-8 md:p-12 min-h-[420px] md:min-h-[480px]">
                    {/* Text content */}
                    <div className="flex flex-col justify-center">
                      <p className="text-sm font-medium text-white/70 mb-1">
                        {page.subtitle}
                      </p>
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                        {page.title}
                      </h2>
                      <p className="text-white/90 text-sm sm:text-base leading-relaxed mb-6">
                        {page.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {page.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Floating image */}
                    <div className="hidden md:flex relative items-center justify-center">
                      <div className="relative w-full max-w-[500px]">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/20 shadow-lg shadow-black/20">
                          <img
                            src={page.image}
                            alt={page.title}
                            className="object-cover object-top w-full h-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Navigation arrows */}
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); prevSlide(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur hover:bg-white/30 flex items-center justify-center transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); nextSlide(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur hover:bg-white/30 flex items-center justify-center transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {aboutPages.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentSlide(index); }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-white' : 'bg-white/40'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
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

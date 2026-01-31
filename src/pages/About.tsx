import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChatHeader } from '@/components/ChatHeader';
import FooterSimple from '@/components/marketing/FooterSimple';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const aboutPages = [
  {
    title: 'Academy',
    description: 'Learn the tools of modern civic engagement and become an effective advocate for your community.',
    href: '/academy',
    gradient: 'from-sky-400/80 to-sky-600/90',
    image: '/excerpts-zoom.png',
  },
  {
    title: 'AI Fluency',
    description: 'Practical principles for responsible AI grounded in the 4C Framework.',
    href: '/ai-fluency',
    gradient: 'from-emerald-400/80 to-teal-600/90',
    image: '/citations-zoom.png',
  },
  {
    title: 'Constitution',
    description: 'Transparent values for democratic technology. The principles that govern our AI systems.',
    href: '/constitution',
    gradient: 'from-fuchsia-400/80 to-purple-600/90',
    image: '/dashboard-analytics.png',
  },
  {
    title: 'Digital Bill of Rights',
    description: 'Protecting human dignity in the digital age. Fundamental rights and freedoms for all.',
    href: '/digital-bill-of-rights',
    gradient: 'from-rose-400/80 to-rose-600/90',
    image: '/letter-generation-zoom.png',
  },
  {
    title: 'History',
    description: 'How NYSgpt began and where we\'re headed. Closing the gap between citizens and government.',
    href: '/history',
    gradient: 'from-amber-400/80 to-amber-600/90',
    image: '/contracts-zoom.png',
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
          <div className="relative mt-12">
            <div className="overflow-hidden rounded-2xl">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {aboutPages.map((page) => (
                  <Link
                    key={page.title}
                    to={page.href}
                    className="w-full flex-shrink-0 block"
                  >
                    <div className="relative rounded-2xl overflow-hidden min-h-[320px] sm:min-h-[400px] md:min-h-[500px]">
                      {/* Background Image */}
                      <img
                        src={page.image}
                        alt={page.title}
                        className="absolute inset-0 w-full h-full object-cover object-top"
                      />
                      {/* Gradient Overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-t ${page.gradient}`} />
                      {/* Content */}
                      <div className="absolute bottom-0 left-0 p-6 sm:p-8 md:p-12 md:max-w-[60%]">
                        <p className="text-sm font-medium text-white/70 mb-2">
                          About NYSgpt
                        </p>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">
                          {page.title}
                        </h2>
                        <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                          {page.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Carousel Controls */}
            <button
              onClick={(e) => { e.preventDefault(); prevSlide(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur hover:bg-white/30 text-white rounded-full p-2 transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); nextSlide(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur hover:bg-white/30 text-white rounded-full p-2 transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Dot Indicators */}
            <div className="flex justify-center gap-2 mt-4">
              {aboutPages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'w-6 bg-foreground'
                      : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
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

import { ChatHeader } from '@/components/ChatHeader';
import FooterSimple from '@/components/marketing/FooterSimple';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const slides = [
  {
    title: 'Every bill at your fingertips',
    description:
      'Access the full NYS legislative database with live updates. Browse bills by session, view full texts, track status changes, and see committee assignments—all in one place.',
    image: '/bills-image-2.png',
    imageAlt: 'Bills database interface',
    stats: [
      { label: 'Active Bills', value: '15K+' },
      { label: 'Sessions', value: '10+' },
      { label: 'Live Updates', value: '24/7' },
    ],
    gradient: 'from-blue-400 to-cyan-300',
  },
  {
    title: 'Know your representatives',
    description:
      'Detailed profiles for every legislator including party affiliations, districts, voting patterns, and committee memberships. Plus comprehensive committee data with leadership roles and jurisdictions.',
    image: '/live-feed-2.png',
    imageAlt: 'Legislative activity feed',
    stats: [
      { label: 'Legislators', value: '213' },
      { label: 'Committees', value: '70+' },
      { label: 'Vote Records', value: '100K+' },
    ],
    gradient: 'from-emerald-400 to-teal-300',
  },
  {
    title: 'Turn insight into action',
    description:
      'Every bill analysis includes tools to email sponsors directly, generate personalized letters, view official documents, and track your positions. Make your voice heard with one click.',
    image: '/bill-analysis-actions.png',
    imageAlt: 'Bill analysis and action tools',
    stats: [
      { label: 'Email Templates', value: '50+' },
      { label: 'Letter Formats', value: '12' },
      { label: 'Doc Types', value: '8' },
    ],
    gradient: 'from-purple-400 to-pink-300',
  },
];

export default function FreeTrial() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <div className="min-h-screen flex flex-col">
      <ChatHeader />

      <main className="flex-1 pt-16">
        <section className="container mx-auto px-4 py-12 md:px-6 2xl:max-w-[1400px]">
          <div className="space-y-4 text-center mb-12">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Comprehensive legislative intelligence
            </h1>
            <p className="text-muted-foreground mx-auto max-w-[700px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Access the complete NYS legislative database with live updates. Translate complex policy into actionable insights.
            </p>
          </div>

          {/* Carousel */}
          <div className="relative overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide) => (
                <div
                  key={slide.title}
                  className={`min-w-full bg-gradient-to-br ${slide.gradient}`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 sm:p-8 md:p-12 min-h-[420px] md:min-h-[480px]">
                    {/* Text content */}
                    <div className="flex flex-col justify-center">
                      <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">{slide.title}</h3>
                      <p className="text-white/90 text-sm sm:text-base leading-relaxed mb-8">{slide.description}</p>
                      <div className="grid grid-cols-3 gap-4">
                        {slide.stats.map((stat) => (
                          <div key={stat.label}>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                            <p className="text-white/70 text-sm">{stat.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Image */}
                    <div className="hidden md:flex relative items-center justify-center">
                      <div className="relative w-full max-w-[500px]">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/20 shadow-lg shadow-black/20">
                          <img
                            src={slide.image}
                            alt={slide.imageAlt}
                            className="object-cover object-top w-full h-full"
                          />
                        </div>
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
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextSlide(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur hover:bg-white/30 flex items-center justify-center transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.stopPropagation(); setCurrentSlide(index); }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-white' : 'bg-white/40'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
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
}

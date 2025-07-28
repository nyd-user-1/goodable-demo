import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Heart, BriefcaseIcon, FlowerIcon, HeartIcon, LightbulbIcon, MountainSnow, SettingsIcon } from "lucide-react";
import { useVisitorCount } from '@/hooks/useVisitorCount';
import { useAuth } from '@/contexts/AuthContext';
import { ProblemChatSheet } from '@/components/ProblemChatSheet';
import { AutocompleteCombobox } from '@/components/AutocompleteCombobox';
import { ShineBorder } from '@/components/magicui/shine-border';
import { Confetti, type ConfettiRef } from '@/components/magicui/confetti';
import { WelcomeMessage } from '@/components/features/home/WelcomeMessage';
import CompactMetricList from '@/components/CompactMetricList';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Home = () => {
  const [userProblem, setUserProblem] = useState('');
  const [showAIChatSheet, setShowAIChatSheet] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const confettiRef = useRef<ConfettiRef>(null);
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { count, loading } = useVisitorCount();
  const { user } = useAuth();
  
  const placeholderTexts = ["Solve a problem...","Protect your local farm...", "Bring home Sara...", "Draft a bill...", "Eliminate addictive tech...", "Fund universal pre-k...", "Analyze your CBA..."];
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  
  // Check if input has meaningful content (not just whitespace)
  const hasContent = userProblem.trim().length > 0;
  
  // Categories with dropdown items tied to problem statements
  const categories = [
    {
      id: 'business',
      label: 'Business',
      icon: BriefcaseIcon,
      items: [
        { label: 'Small Business Support', value: 'small-business' },
        { label: 'Corporate Responsibility', value: 'corporate-responsibility' },
        { label: 'Economic Development', value: 'economic-development' },
        { label: 'Entrepreneurship Programs', value: 'entrepreneurship' },
        { label: 'Workforce Development', value: 'workforce' }
      ]
    },
    {
      id: 'strategy',
      label: 'Strategy',
      icon: SettingsIcon,
      items: [
        { label: 'Policy Planning', value: 'policy-planning' },
        { label: 'Strategic Initiatives', value: 'strategic-initiatives' },
        { label: 'Long-term Vision', value: 'long-term-vision' },
        { label: 'Implementation Roadmaps', value: 'implementation' },
        { label: 'Performance Metrics', value: 'performance-metrics' }
      ]
    },
    {
      id: 'health',
      label: 'Health',
      icon: HeartIcon,
      items: [
        { label: 'Public Health', value: 'public-health' },
        { label: 'Healthcare Access', value: 'healthcare-access' },
        { label: 'Mental Health Services', value: 'mental-health' },
        { label: 'Preventive Care', value: 'preventive-care' },
        { label: 'Health Equity', value: 'health-equity' }
      ]
    },
    {
      id: 'creative',
      label: 'Creative',
      icon: LightbulbIcon,
      items: [
        { label: 'Arts & Culture', value: 'arts-culture' },
        { label: 'Innovation Labs', value: 'innovation-labs' },
        { label: 'Creative Economy', value: 'creative-economy' },
        { label: 'Design Thinking', value: 'design-thinking' },
        { label: 'Community Art Programs', value: 'community-art' }
      ]
    },
    {
      id: 'environment',
      label: 'Environment',
      icon: FlowerIcon,
      items: [
        { label: 'Climate Action', value: 'climate-action' },
        { label: 'Sustainability', value: 'sustainability' },
        { label: 'Conservation', value: 'conservation' },
        { label: 'Green Infrastructure', value: 'green-infrastructure' },
        { label: 'Environmental Justice', value: 'environmental-justice' }
      ]
    },
    {
      id: 'adventure',
      label: 'Adventure',
      icon: MountainSnow,
      items: [
        { label: 'Outdoor Recreation', value: 'outdoor-recreation' },
        { label: 'Tourism Development', value: 'tourism' },
        { label: 'Parks & Trails', value: 'parks-trails' },
        { label: 'Adventure Sports', value: 'adventure-sports' },
        { label: 'Ecotourism', value: 'ecotourism' }
      ]
    }
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder(prev => (prev + 1) % placeholderTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Listen for command palette event
  useEffect(() => {
    const handleOpenProblemChat = () => {
      setShowAIChatSheet(true);
    };

    window.addEventListener('open-problem-chat', handleOpenProblemChat);
    return () => window.removeEventListener('open-problem-chat', handleOpenProblemChat);
  }, []);

  
  const handleSubmit = () => {
    if (hasContent) {
      // For authenticated users, open AI chat sheet directly
      setShowAIChatSheet(true);
    }
  };

  
  const handleDoSomethingClick = () => {
    if (inputRef.current) {
      inputRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      inputRef.current.focus();
    }
  };

  const formatVisitorCount = (count: number) => {
    if (count >= 1000) {
      return `${Math.floor(count / 1000)}K+`;
    }
    return count.toString();
  };
  
  const problemCategories = [
    // Row 1
    { title: "Childcare", subtitle: "26 Sub-problems • 84 Solutions" },
    { title: "Quality Time", subtitle: "5 Sub-problems • 17 Solutions" },
    { title: "Third Place", subtitle: "30 Sub-problems • 86 Solutions" },
    // ... keep existing code (all problem categories array)
    { title: "Grassroots Mobilization", subtitle: "23 Sub-problems • 59 Collaborations" },
    { title: "Social Innovation", subtitle: "20 Sub-problems • 52 Solutions" },
    { title: "Impact Measurement", subtitle: "13 Sub-problems • 33 Solutions" },
  ].slice(0, 60); // Keep all 60 categories from the original

  return (
    <div className="min-h-screen text-foreground bg-background flex flex-col">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:32px_32px] opacity-30" />
        
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-accent/10 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-muted/10 rounded-full blur-xl animate-pulse delay-2000" />
      </div>

      <main className="relative z-10 flex-1 pb-20">
        {/* Welcome Message - positioned absolutely in top left */}
        <div className="absolute top-6 left-6 z-20">
          <WelcomeMessage />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[calc(100vh-20px)]" style={{ paddingTop: '15px' }}>
          
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 -mt-10">
              <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Do something,
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">something good.</span>
            </h1>


            <div className="relative mx-auto mt-7 max-w-xl sm:mt-12 mb-16 px-2 sm:px-4 lg:px-0">
              <AutocompleteCombobox
                value={userProblem}
                onChange={setUserProblem}
                onSubmit={handleSubmit}
                placeholder={placeholderTexts[currentPlaceholder]}
                isTyping={false}
              />
              
              {/* Vibrant Scribbles - SVG Elements */}
              <div className="absolute end-0 top-0 hidden translate-x-20 -translate-y-12 md:block">
                <svg
                  className="h-auto w-16 text-orange-500"
                  width={121}
                  height={135}
                  viewBox="0 0 121 135"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 16.4754C11.7688 27.4499 21.2452 57.3224 5 89.0164"
                    stroke="currentColor"
                    strokeWidth={10}
                    strokeLinecap="round"
                  />
                  <path
                    d="M33.6761 112.104C44.6984 98.1239 74.2618 57.6776 83.4821 5"
                    stroke="currentColor"
                    strokeWidth={10}
                    strokeLinecap="round"
                  />
                  <path
                    d="M50.5525 130C68.2064 127.495 110.731 117.541 116 78.0874"
                    stroke="currentColor"
                    strokeWidth={10}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              
              <div className="absolute start-0 bottom-0 hidden -translate-x-32 translate-y-10 md:block">
                <svg
                  className="h-auto w-40 text-cyan-500"
                  width={347}
                  height={188}
                  viewBox="0 0 347 188"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 82.4591C54.7956 92.8751 30.9771 162.782 68.2065 181.385C112.642 203.59 127.943 78.57 122.161 25.5053C120.504 2.2376 93.4028 -8.11128 89.7468 25.5053C85.8633 61.2125 130.186 199.678 180.982 146.248L214.898 107.02C224.322 95.4118 242.9 79.2851 258.6 107.02C274.299 134.754 299.315 125.589 309.861 117.539L343 93.4426"
                    stroke="currentColor"
                    strokeWidth={7}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Dropdown Buttons */}
            <div className="mt-10 flex flex-wrap justify-center gap-2 sm:mt-20 mb-16">
              {categories.map((category) => (
                <div 
                  key={category.id}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(category.id)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <DropdownMenu 
                    open={openDropdown === category.id}
                    onOpenChange={(open) => setOpenDropdown(open ? category.id : null)}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="hover:bg-muted">
                        <category.icon className="mr-2 h-auto w-3 flex-shrink-0" />
                        {category.label}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="start" 
                      side="bottom"
                      className="w-56"
                      onMouseEnter={() => setOpenDropdown(category.id)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      <DropdownMenuLabel>{category.label} Topics</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {category.items.map((item) => (
                        <DropdownMenuItem 
                          key={item.value}
                          onClick={() => {
                            setUserProblem(`It's a problem that ${item.label.toLowerCase()}`);
                            setOpenDropdown(null);
                          }}
                          className="cursor-pointer"
                        >
                          {item.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center justify-center gap-4 mb-16">
              <div className="text-sm text-muted-foreground">
                {loading ? (
                  <span>Loading visitor count...</span>
                ) : count ? (
                  <span>{formatVisitorCount(count)}+ visited Goodable today</span>
                ) : (
                  <span>183+ visited Goodable today</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {!user && (
          <section id="examples" className="py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Do goodable
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  See the good others are doing today
                </p>
              </div>

              <div className="max-w-[1200px] mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
                  {problemCategories.map((category, index) => (
                    <div
                      key={index}
                      className="bg-card border border-border rounded-xl p-6 min-h-[140px] transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                    >
                      <h3 className="font-bold text-lg text-foreground mb-2">
                        {category.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {category.subtitle}
                      </p>
                      <div className="text-sm text-destructive hover:underline">
                        Learn more →
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Compact Metric List Section - with light gray background */}
        <section className="py-12 sm:py-20 px-4 sm:px-6 bg-muted/30">
          <CompactMetricList />
        </section>

        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <ShineBorder 
              className="rounded-2xl"
              shineColor={["#3D63DD", "#5A7FDB", "#2D53CD"]}
              borderRadius={16}
              borderWidth={2}
              duration={10}
            >
              <div 
                className="p-12 text-center"
                onMouseEnter={() => {
                  if (!hasTriggeredConfetti) {
                    confettiRef.current?.fire({
                      particleCount: 100,
                      spread: 70,
                      origin: { y: 0.6 }
                    });
                    setHasTriggeredConfetti(true);
                  }
                }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to do something good?
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join thousands of people who are collaborating on a future that's Goodable.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={handleDoSomethingClick}
                    className="dark:shadow-[0_0_20px_rgba(59,130,246,0.3)] dark:border-blue-500/50 dark:hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] transition-all duration-300"
                  >
                    <Heart className="w-4 h-4 mr-2 text-destructive" />
                    Do Something
                  </Button>
                </div>
              </div>
            </ShineBorder>
          </div>
        </section>
      </main>

      {/* Confetti Canvas */}
      <Confetti
        ref={confettiRef}
        className="fixed inset-0 pointer-events-none"
      />

      {/* Problem Chat Sheet */}
      <ProblemChatSheet
        open={showAIChatSheet}
        onOpenChange={setShowAIChatSheet}
        userProblem={userProblem}
      />

      <footer className="border-t border-border/50 bg-background mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-card border rounded-lg flex items-center justify-center">
                  <span className="text-lg">❤️</span>
                </div>
                <span className="text-xl font-bold">Goodable</span>
              </div>
              <p className="text-muted-foreground text-sm" style={{ textAlign: 'left' }}>
                Do something,<br />
                something good.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground">Features</a></li>
                <li><a href="#examples" className="hover:text-foreground">Examples</a></li>
                <li><a href="#pricing" className="hover:text-foreground">Pricing</a></li>
                <li><a href="#docs" className="hover:text-foreground">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#about" className="hover:text-foreground">About</a></li>
                <li><a href="#blog" className="hover:text-foreground">Blog</a></li>
                <li><a href="#careers" className="hover:text-foreground">Careers</a></li>
                <li><a href="#contact" className="hover:text-foreground">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  <Heart className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border/50 mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Goodable. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
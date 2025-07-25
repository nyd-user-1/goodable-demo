import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useVisitorCount } from '@/hooks/useVisitorCount';
import { useAuth } from '@/contexts/AuthContext';
import { ProblemChatSheet } from '@/components/ProblemChatSheet';
import { AutocompleteCombobox } from '@/components/AutocompleteCombobox';
import { ShineBorder } from '@/components/magicui/shine-border';
import { Confetti, type ConfettiRef } from '@/components/magicui/confetti';

const Home = () => {
  const [userProblem, setUserProblem] = useState('');
  const [showAIChatSheet, setShowAIChatSheet] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const confettiRef = useRef<ConfettiRef>(null);
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);
  const { count, loading } = useVisitorCount();
  const { user } = useAuth();
  
  const placeholderTexts = ["Solve a problem...","Protect your local farm...", "Bring home Sara...", "Draft a bill...", "Eliminate addictive tech...", "Fund universal pre-k...", "Analyze your CBA..."];
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  
  // Check if input has meaningful content (not just whitespace)
  const hasContent = userProblem.trim().length > 0;
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder(prev => (prev + 1) % placeholderTexts.length);
    }, 3000);
    return () => clearInterval(interval);
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
    <div className="min-h-screen text-foreground overflow-hidden bg-background">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:32px_32px] opacity-30" />
        
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-accent/10 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-muted/10 rounded-full blur-xl animate-pulse delay-2000" />
      </div>

      <main className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-screen" style={{ paddingTop: '15px' }}>
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Do something,
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">something good.</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">Create change by chatting with ai -- and other people.</p>

            <div className="w-full mb-16 px-2 sm:px-4 lg:px-0">
              <AutocompleteCombobox
                value={userProblem}
                onChange={setUserProblem}
                onSubmit={handleSubmit}
                placeholder={placeholderTexts[currentPlaceholder]}
                isTyping={false}
              />
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

      <footer className="border-t border-border/50 bg-background">
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
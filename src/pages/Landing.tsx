import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles, Zap, Code, Palette, Users, Star, Heart, Twitter, Image, Share2, ChevronDown, ArrowUp } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate, Link } from 'react-router-dom';
import { StarRating, VoteStats } from '@/components/StarRating';
import { problems } from '@/data/problems';
import { useVisitorCount } from '@/hooks/useVisitorCount';
import { useAuth } from '@/contexts/AuthContext';
import { ProblemChatSheet } from '@/components/ProblemChatSheet';
import { supabase } from '@/integrations/supabase/client';
import { ThemeToggle } from '@/components/ThemeToggle';

const Landing = () => {
  const [userProblem, setUserProblem] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showAIChatSheet, setShowAIChatSheet] = useState(false);
  const [sampleProblems, setSampleProblems] = useState<Array<{text: string}>>([]);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
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

  useEffect(() => {
    const fetchSampleProblems = async () => {
      try {
        const { data, error } = await supabase
          .from('Sample Problems')
          .select('"Sample Problems"')
          .order('"Sample Problems"');
        
        if (error) {
          return;
        }
        
        if (data) {
          const processedData = data.map(item => ({
            text: item['Sample Problems']
          }));
          setSampleProblems(processedData);
        }
      } catch (error) {
      }
    };

    fetchSampleProblems();
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasContent && !isTyping) {
      if (!user) {
        setShowAuthDialog(true);
      } else {
        // For authenticated users, open AI chat sheet directly
        setShowAIChatSheet(true);
      }
    }
  };

  const handleDropdownSelect = (text: string) => {
    setUserProblem(`It's a problem that ${text.toLowerCase()}`);
    if (inputRef.current) {
      inputRef.current.focus();
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
    // Row 2
    { title: "Income Stagnation", subtitle: "16 Sub-problems • 32 Solutions" },
    { title: "End Stage Capitalism", subtitle: "2 Sub-problems • 2 Solutions" },
    { title: "Cultural Divisions", subtitle: "1 Sub-problems • 1 Solutions" },
    // Row 3
    { title: "Addictive Technology", subtitle: "5 Sub-problems • 8 Solutions" },
    { title: "Fake News", subtitle: "1 Sub-problems • 3 Solutions" },
    { title: "Free Time", subtitle: "11 Sub-problems • 20 Solutions" },
    // Row 4
    { title: "Climate Change", subtitle: "23 Sub-problems • 67 Solutions" },
    { title: "Housing Crisis", subtitle: "18 Sub-problems • 45 Solutions" },
    { title: "Mental Health Support", subtitle: "12 Sub-problems • 38 Solutions" },
    // Row 5
    { title: "Food Security", subtitle: "9 Sub-problems • 24 Solutions" },
    { title: "Digital Divide", subtitle: "14 Sub-problems • 41 Solutions" },
    { title: "Elder Care", subtitle: "7 Sub-problems • 19 Solutions" },
    // Row 6
    { title: "Education Access", subtitle: "31 Sub-problems • 78 Solutions" },
    { title: "Workplace Burnout", subtitle: "6 Sub-problems • 15 Solutions" },
    { title: "Social Isolation", subtitle: "11 Sub-problems • 29 Solutions" },
    // Row 7
    { title: "Healthcare Access", subtitle: "22 Sub-problems • 56 Solutions" },
    { title: "Financial Literacy", subtitle: "8 Sub-problems • 22 Solutions" },
    { title: "Community Safety", subtitle: "13 Sub-problems • 34 Solutions" },
    // Row 8
    { title: "Environmental Justice", subtitle: "17 Sub-problems • 43 Solutions" },
    { title: "Youth Development", subtitle: "21 Sub-problems • 51 Solutions" },
    { title: "Disability Rights", subtitle: "5 Sub-problems • 12 Solutions" },
    // Row 9
    { title: "Immigration Support", subtitle: "19 Sub-problems • 47 Solutions" },
    { title: "Gender Equality", subtitle: "24 Sub-problems • 62 Solutions" },
    { title: "Veteran Services", subtitle: "10 Sub-problems • 26 Solutions" },
    // Row 10
    { title: "Rural Development", subtitle: "15 Sub-problems • 39 Solutions" },
    { title: "Urban Planning", subtitle: "28 Sub-problems • 71 Solutions" },
    { title: "Transportation Equity", subtitle: "12 Sub-problems • 31 Solutions" },
    // Row 11
    { title: "Criminal Justice Reform", subtitle: "20 Sub-problems • 54 Solutions" },
    { title: "Substance Abuse", subtitle: "9 Sub-problems • 23 Solutions" },
    { title: "Homelessness", subtitle: "16 Sub-problems • 42 Solutions" },
    // Row 12
    { title: "Digital Privacy", subtitle: "11 Sub-problems • 28 Solutions" },
    { title: "Renewable Energy", subtitle: "25 Sub-problems • 65 Solutions" },
    { title: "Water Conservation", subtitle: "7 Sub-problems • 18 Solutions" },
    // Row 13
    { title: "Food Waste Reduction", subtitle: "13 Sub-problems • 35 Solutions" },
    { title: "Civic Engagement", subtitle: "18 Sub-problems • 46 Solutions" },
    { title: "Small Business Support", subtitle: "22 Sub-problems • 58 Solutions" },
    // Row 14
    { title: "Disaster Relief", subtitle: "8 Sub-problems • 21 Solutions" },
    { title: "Cultural Preservation", subtitle: "14 Sub-problems • 37 Solutions" },
    { title: "Scientific Research", subtitle: "27 Sub-problems • 69 Solutions" },
    // Row 15
    { title: "Public Health", subtitle: "32 Sub-problems • 81 Solutions" },
    { title: "Economic Development", subtitle: "19 Sub-problems • 49 Solutions" },
    { title: "Infrastructure", subtitle: "24 Sub-problems • 61 Solutions" },
    // Row 16
    { title: "Racial Justice", subtitle: "17 Sub-problems • 44 Solutions" },
    { title: "Worker Rights", subtitle: "15 Sub-problems • 40 Solutions" },
    { title: "Consumer Protection", subtitle: "10 Sub-problems • 27 Solutions" },
    // Row 17
    { title: "Animal Welfare", subtitle: "12 Sub-problems • 32 Solutions" },
    { title: "Media Literacy", subtitle: "9 Sub-problems • 25 Solutions" },
    { title: "Government Transparency", subtitle: "21 Sub-problems • 53 Solutions" },
    // Row 18
    { title: "Nonprofit Management", subtitle: "26 Sub-problems • 66 Solutions" },
    { title: "Community Organizing", subtitle: "14 Sub-problems • 36 Solutions" },
    { title: "Volunteer Coordination", subtitle: "8 Sub-problems • 20 Solutions" },
    // Row 19
    { title: "Policy Analysis", subtitle: "18 Sub-problems • 47 Solutions" },
    { title: "Data Advocacy", subtitle: "16 Sub-problems • 41 Solutions" },
    { title: "Legal Aid", subtitle: "11 Sub-problems • 30 Solutions" },
    // Row 20
    { title: "Grassroots Mobilization", subtitle: "23 Sub-problems • 59 Collaborations" },
    { title: "Social Innovation", subtitle: "20 Sub-problems • 52 Solutions" },
    { title: "Impact Measurement", subtitle: "13 Sub-problems • 33 Solutions" },
  ];

  return <div className="min-h-screen text-foreground overflow-hidden bg-background">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:32px_32px] opacity-30" />
        
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-accent/10 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-muted/10 rounded-full blur-xl animate-pulse delay-2000" />
      </div>

      <header className="relative z-10 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-card border rounded-lg flex items-center justify-center">
                <span className="text-lg">❤️</span>
              </div>
              <span className="text-xl font-bold">Goodable</span>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button 
                variant="outline" 
                onClick={() => navigate('/auth')}
                className="bg-card/80 hover:bg-card"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-screen" style={{ paddingTop: '175px' }}>
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Do something,
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                something good.
              </span>
            </h1>

            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">Create legislation by chatting with ai</p>

            <div className="w-full max-w-[900px] sm:w-[calc(100vw-32px)] mx-auto mb-16 px-4 sm:px-0">
              <form onSubmit={handleSubmit} className="relative">
                <div className="relative bg-card backdrop-blur-sm border border-border rounded-2xl pl-3 pr-6 py-3 focus-within:border-primary/50 transition-all duration-300 shadow-md">
                  <div className="relative">
                    <Input 
                      ref={inputRef} 
                      type="text" 
                      value={userProblem} 
                      onChange={e => setUserProblem(e.target.value)} 
                      placeholder={placeholderTexts[currentPlaceholder]} 
                      className="h-10 pr-16 bg-transparent border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground overflow-hidden text-ellipsis" 
                      style={{ fontSize: '16px' }}
                      disabled={isTyping} 
                    />
                    {hasContent && (
                      <Button 
                        type="submit" 
                        className={`absolute right-1 top-1 h-8 w-8 p-0 rounded-lg transition-all duration-300 ${
                          hasContent && !isTyping 
                            ? 'opacity-100 bg-primary hover:bg-primary/90' 
                            : 'opacity-40 bg-muted-foreground cursor-not-allowed'
                        }`}
                        disabled={!hasContent || isTyping}
                      >
                        {isTyping ? (
                          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <ArrowUp className="w-3 h-3" />
                        )}
                      </Button>
                    )}
                  </div>
                  
                  <div className="absolute left-0 right-0 h-px bg-border/30 mt-8 mb-4" />
                  
                  <div className="flex items-center justify-between mt-12">
                    <div className="flex items-center gap-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button type="button" className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 px-3 py-2 rounded-[128px] border border-border/30 hover:border-border/50">
                            <span className="text-xs">Problems</span>
                            <ChevronDown className="w-2 h-2" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-auto min-w-0" sideOffset={8}>
                          {sampleProblems.length === 0 ? (
                            <DropdownMenuItem className="text-muted-foreground">
                              Loading problems...
                            </DropdownMenuItem>
                          ) : (
                            sampleProblems.map((problem, index) => {
                              return (
                                <DropdownMenuItem 
                                  key={index}
                                  onClick={() => handleDropdownSelect(problem.text)}
                                  className="whitespace-nowrap cursor-pointer"
                                >
                                  {problem.text}
                                </DropdownMenuItem>
                              );
                            })
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </form>
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
                {problemCategories.map((category, index) => {
                  // Find matching problem data for this category
                  const problemData = problems.find(p => p.title === category.title);
                  const problemSlug = problemData ? problemData.slug : category.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
                  
                  return (
                    <div
                      key={index}
                      className="bg-card border border-border rounded-xl p-6 min-h-[140px] transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer relative group"
                    >
                      <Link 
                        to={`/problems/${problemSlug}`}
                        className="block mb-4"
                      >
                        <h3 className="font-bold text-lg text-foreground mb-2">
                          {category.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {category.subtitle}
                        </p>
                        
                        {/* Vote statistics positioned below subtitle */}
                        <div className="mb-4">
                          <VoteStats 
                            problemId={problemData?.id || problemSlug}
                            className="text-muted-foreground"
                          />
                        </div>
                        
                        <div className="text-sm text-destructive hover:underline">
                          Learn more →
                        </div>
                      </Link>
                      
                      {/* Interactive star rating positioned below Learn more link */}
                      <div 
                        className="w-full mt-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <StarRating 
                          problemId={problemData?.id || problemSlug}
                          className="w-full"
                          showVoteCount={false}
                          showStars={true}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-card border border-border rounded-2xl p-12">
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
          </div>
        </section>
      </main>

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
                <li><Link to="/features" className="hover:text-foreground">Features</Link></li>
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
                  <Twitter className="w-5 h-5" />
                </a>
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

      {/* Authentication Dialog */}
      {showAuthDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-card rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-card border rounded-lg flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-xl font-bold mb-2">Welcome to Goodable</h2>
              <p className="text-muted-foreground">Sign in to continue with your problem statement</p>
            </div>
            <div className="space-y-3">
              <Button 
                className="w-full" 
                onClick={() => {
                  setShowAuthDialog(false);
                  navigate('/auth');
                }}
              >
                Sign In
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setShowAuthDialog(false);
                  navigate('/auth');
                }}
              >
                Create Account
              </Button>
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => setShowAuthDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>;
};

export default Landing;
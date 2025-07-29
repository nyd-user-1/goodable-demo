import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowRight, 
  Sparkles, 
  Check,
  Star,
  FileText,
  Vote,
  Building2,
  Scale,
  Brain,
  Heart,
  Twitter,
  Users,
  Play,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Command
} from "lucide-react";
import { useNavigate, Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ShineBorder } from '@/components/magicui/shine-border';
import { ScrollProgress } from '@/components/magicui/scroll-progress';
import { Marquee } from '@/components/magicui/marquee';
import { BetaAccessModal } from '@/components/BetaAccessModal';
import HeroVideoDialog from '@/components/magicui/hero-video-dialog';
import { Confetti, type ConfettiRef } from '@/components/magicui/confetti';
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { problems } from '@/data/problems';
import { supabase } from '@/integrations/supabase/client';
import { ChartAreaInteractive } from '@/components/charts/ChartAreaInteractive';
import { ChartBarEngagement } from '@/components/charts/ChartBarEngagement';
import { ChartPieBillStatus } from '@/components/charts/ChartPieBillStatus';
import { ChartLinePolicyImpact } from '@/components/charts/ChartLinePolicyImpact';
import { ProblemsBentoGrid } from '@/components/features/problems';
import FAQ from '@/components/FAQ';
import HorizontalBlogCarousel from '@/components/HorizontalBlogCarousel';
import FeatureChat from '@/components/blocks/feature-sections/paid/feature-chat';
import HeroFormContactWithBackground from '@/components/blocks/hero-forms/paid/contact-form-with-background';
import '@/components/magicui/animated-background.css';

interface Member {
  people_id: number;
  name: string;
  first_name: string;
  last_name: string;
  photo_url: string;
  party: string;
  chamber: string;
  district: string;
  role: string;
  bills?: number;
}

const Landing2 = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const featuresRef = useRef<HTMLDivElement>(null);
  const confettiRef = useRef<ConfettiRef>(null);
  const [userProblem, setUserProblem] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [featuredPosts, setFeaturedPosts] = useState<any[]>([]);

  const handleDoSomethingClick = () => {
    // Scroll to search or do something
  };

  const handleWaitlistSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // First check if email already exists
      const { data: existingEmail, error: checkError } = await (supabase as any)
        .from('waitlist')
        .select('email')
        .eq('email', email)
        .single();

      if (existingEmail) {
        toast({
          title: "Already Signed Up",
          description: "You're already on the waitlist! We'll notify you when we launch.",
        });
        setEmail('');
        setIsSubmitting(false);
        return;
      }

      // Add to waitlist
      const { error } = await (supabase as any)
        .from('waitlist')
        .insert({
          email: email,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "You're on the waitlist! We'll notify you when we launch.",
      });
      
      setEmail('');
      
      // Trigger confetti
      if (confettiRef.current && !hasTriggeredConfetti) {
        confettiRef.current.fire({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.8 }
        });
        setHasTriggeredConfetti(true);
      }
    } catch (error) {
      console.error('Waitlist signup error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch featured blog posts from Supabase
  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      try {
        // Try to fetch from the view first
        let { data, error } = await (supabase as any)
          .from('blog_proposal_stats')
          .select('*')
          .eq('is_featured', true)
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(9);

        // If view doesn't exist, use the table directly
        if (error && error.code === '42P01') {
          const result = await (supabase as any)
            .from('blog_proposals')
            .select(`
              *,
              profiles!blog_proposals_author_id_fkey (
                display_name,
                username,
                avatar_url
              )
            `)
            .eq('is_featured', true)
            .eq('status', 'published')
            .order('published_at', { ascending: false })
            .limit(9);
          
          data = result.data;
          error = result.error;
          
          // Transform the data to match expected format
          if (data) {
            data = data.map((post: any) => ({
              ...post,
              author: {
                name: post.profiles?.display_name || post.profiles?.username || 'Unknown Author',
                avatar: post.profiles?.avatar_url
              },
              votes: {
                up: 0
              },
              comments: []
            }));
          }
        } else if (data) {
          // Transform data from view to match expected format
          data = data.map((post: any) => ({
            ...post,
            author: {
              name: post.author_name || 'Unknown Author',
              avatar: post.author_avatar
            },
            votes: {
              up: post.up_votes || 0
            },
            comments: new Array(post.comment_count || 0)
          }));
        }

        if (!error && data) {
          setFeaturedPosts(data);
        }
      } catch (error) {
        console.error('Error fetching featured posts:', error);
      }
    };

    fetchFeaturedPosts();
  }, []);

  // Fetch real people data from Supabase
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data, error } = await supabase
          .from("People")
          .select(`
            people_id,
            name,
            first_name,
            last_name,
            photo_url,
            party,
            chamber,
            district,
            role
          `)
          .not("chamber", "is", null)
          .not("name", "is", null)
          .not("photo_url", "is", null)
          .order("last_name", { ascending: true })
          .limit(12);

        if (error) {
          console.error('Error fetching members:', error);
          return;
        }

        if (data) {
          // Add mock bill counts for display
          const membersWithBills = data.map((member, index) => ({
            ...member,
            bills: Math.floor(Math.random() * 60) + 20 // Random between 20-80
          }));
          setMembers(membersWithBills);
        }
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const features = [
    {
      icon: <FileText className="w-5 h-5" />,
      title: "Legislative Intelligence",
      description: "Track and analyze bills with AI-powered insights across all committees and chambers",
      gradient: "from-[#3D63DD] to-[#5A7FDB]",
      path: "/dashboard"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Member Profiles",
      description: "Comprehensive legislator data including voting history, sponsorships, and committee memberships",
      gradient: "from-[#3D63DD] to-[#6B8CE8]",
      path: "/members"
    },
    {
      icon: <Brain className="w-5 h-5" />,
      title: "AI Policy Assistant",
      description: "Draft legislation, analyze impacts, and get expert guidance with advanced AI models",
      gradient: "from-[#3D63DD] to-[#4A70E0]",
      path: "/playground"
    },
    {
      icon: <Building2 className="w-5 h-5" />,
      title: "Committee Tracking",
      description: "Monitor committee activities, agendas, and member compositions in real-time",
      gradient: "from-[#3D63DD] to-[#5577E5]",
      path: "/committees"
    },
    {
      icon: <Scale className="w-5 h-5" />,
      title: "Bills and Resolutions",
      description: "Collaborative workspace for drafting, reviewing, and refining policy proposals",
      gradient: "from-[#3D63DD] to-[#4D73E2]",
      path: "/bills"
    },
    {
      icon: <Vote className="w-5 h-5" />,
      title: "Community Solutions",
      description: "Crowdsource ideas and vote on solutions to pressing societal challenges",
      gradient: "from-[#3D63DD] to-[#5A7FDB]",
      path: "/public-policy"
    }
  ];


  const problemCards = problems.slice(0, 6);

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for getting started",
      features: [
        "View public bills and legislation",
        "Basic search functionality",
        "Read-only access to committee information",
        "Limited chat sessions (5 per month)"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Staffer",
      price: "$99",
      description: "Built for legislative staff",
      features: [
        "All Free features",
        "Unlimited legislative drafts",
        "Co-authoring capabilities",
        "Advanced bill tracking",
        "Committee agenda access",
        "Priority email support"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Professional",
      price: "$299",
      description: "For professional advocates and consultants",
      features: [
        "All Staffer features",
        "Full API access",
        "Custom integrations",
        "White-label options",
        "Priority support",
        "Advanced collaboration tools"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const MemberCard = ({ member }: { member: Member }) => (
    <figure 
      className={cn(
        "relative h-full w-56 sm:w-64 cursor-pointer overflow-hidden rounded-xl border p-3 sm:p-4 transition-all hover:scale-105",
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
      )}
      onClick={() => navigate('/members')}
    >
      <div className="flex flex-row items-center gap-2">
        <img 
          className="w-7 h-7 rounded-full object-cover flex-shrink-0" 
          alt={member.name || 'Member photo'} 
          src={member.photo_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=28&h=28&fit=crop&crop=face'} 
        />
        <div className="flex flex-col">
          <figcaption className="text-xs sm:text-sm font-medium dark:text-white">
            {member.name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">{member.role || `${member.chamber} Member`}</p>
        </div>
      </div>
      <div className="mt-2 text-xs sm:text-sm">
        <span className="text-[#3D63DD] font-medium">{member.bills} bills sponsored</span>
        <span className="ml-2 text-xs text-muted-foreground">• {member.party}</span>
      </div>
    </figure>
  );

  const ProblemCard = ({ problem }: { problem: typeof problemCards[0] }) => (
    <figure 
      className={cn(
        "relative h-full w-56 sm:w-64 cursor-pointer overflow-hidden rounded-xl border p-3 sm:p-4 transition-all hover:scale-105",
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
      )}
      onClick={() => navigate(`/problems/${problem.slug}`)}
    >
      <div className="flex flex-col">
        <figcaption className="text-xs sm:text-sm font-medium dark:text-white mb-1">
          {problem.title}
        </figcaption>
        <p className="text-xs text-muted-foreground mb-2">{problem.category}</p>
        <div className="text-xs sm:text-sm">
          <span className="text-[#3D63DD] font-medium">{problem.subProblems} sub-problems</span>
          <span className="ml-2 text-xs text-muted-foreground">• {problem.solutions} solutions</span>
        </div>
      </div>
    </figure>
  );

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <ScrollProgress className="top-0" />
      <BetaAccessModal />
      {/* Enhanced background with visual effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:32px_32px] opacity-30" />
        
        {/* Animated blur orbs */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-accent/10 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-muted/10 rounded-full blur-xl animate-pulse delay-2000" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 px-4 sm:px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
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
              size="sm"
              className="hidden md:inline-flex items-center justify-center"
              onClick={() => {
                const event = new KeyboardEvent('keydown', {
                  key: 'k',
                  metaKey: true,
                  ctrlKey: true,
                  bubbles: true
                });
                document.dispatchEvent(event);
              }}
            >
              <Command className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/auth')}
            >
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Completely Redesigned */}
      <section className="relative min-h-[70vh] sm:min-h-[80vh] flex items-center justify-center px-4 sm:px-6 py-12 sm:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Do something,
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              something good.
            </span>
          </h1>
              
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 px-4">
            The only comprehensive platform for tracking legislation, analyzing policy impacts, 
            and crowd sourced policy solutions. Powered by advanced AI and driven by collaboration.
          </p>
              
          <div className="flex justify-center mb-8 sm:mb-12 px-4">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-[#3D63DD] text-white hover:bg-[#2D53CD] w-full sm:w-auto"
            >
              Try for Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
              
          {/* Hero Video */}
          <div className="relative max-w-4xl mx-auto mb-8 sm:mb-16 px-4">
            <HeroVideoDialog
              className="block dark:hidden"
              animationStyle="from-center"
              videoSrc="https://www.loom.com/embed/ae7a56105d3e44529caee8593c1a3ffe"
              thumbnailSrc="/goodable-analytics-demo.png"
              thumbnailAlt="Goodable Analytics Dashboard Demo"
            />
            <HeroVideoDialog
              className="hidden dark:block"
              animationStyle="from-center"
              videoSrc="https://www.loom.com/embed/ae7a56105d3e44529caee8593c1a3ffe"
              thumbnailSrc="/goodable-analytics-demo.png"
              thumbnailAlt="Goodable Analytics Dashboard Demo"
            />
          </div>
        </div>
      </section>

      {/* Marquee Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Public Policy, But Different
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground px-4">
              We think that's a good thing.
            </p>
          </div>
              
          <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
            <Marquee pauseOnHover className="[--duration:20s]">
              {members.map((member, index) => (
                <MemberCard key={index} member={member} />
              ))}
            </Marquee>
            <Marquee reverse pauseOnHover className="[--duration:20s]">
              {problemCards.map((problem) => (
                <ProblemCard key={problem.id} problem={problem} />
              ))}
            </Marquee>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section ref={featuresRef} className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Everything You Need To
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Start something; do something.
            </p>
          </div>
              
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="group relative overflow-hidden border-muted/50 bg-gradient-to-br from-background to-muted/10 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onClick={() => navigate(feature.path)}
              >
                <div className="p-4 sm:p-6">
                  <div className={cn(
                    "w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform",
                    feature.gradient
                  )}>
                    {feature.icon}
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">{feature.description}</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#3D63DD]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              A Common Picture
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              For a common way forward.
            </p>
          </div>
          
          <div className="grid gap-6">
            {/* Top Row - Large Interactive Chart */}
            <div className="grid grid-cols-1 gap-6">
              <ChartAreaInteractive />
            </div>
            
            {/* Bottom Row - Three Smaller Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ChartBarEngagement />
              <ChartPieBillStatus />
              <ChartLinePolicyImpact />
            </div>
          </div>
        </div>
      </section>

      {/* Problems Bento Grid */}
      <ProblemsBentoGrid />

      {/* Public Policy Blog Posts */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Policy Proposals
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              See each other. Support each other. Agree on an approach forward and vote for it.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredPosts.slice(0, 6).map((post, index) => (
              <Card key={post.id} className="cursor-pointer hover:bg-muted/50 transition-colors hover:shadow-md h-full">
                <CardContent className="p-6 h-full flex flex-col">
                  {/* Header with title */}
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg leading-tight">
                      {post.title}
                    </h3>
                  </div>

                  {/* Description - flex-grow to push other content down */}
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed flex-grow mb-6">
                    {post.summary || post.content.substring(0, 200) + '...'}
                  </p>

                  {/* Category badges - moved below content */}
                  <div className="mb-6">
                    {post.tags && post.tags.length > 0 ? (
                      <div className="flex gap-2">
                        {post.tags.slice(0, 2).map((tag, idx) => {
                          const priorityColors = {
                            0: 'bg-primary/10 text-primary border-primary/20',
                            1: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20'
                          };
                          return (
                            <Badge key={idx} className={priorityColors[idx] || priorityColors[0]} variant="secondary">
                              {tag}
                            </Badge>
                          );
                        })}
                      </div>
                    ) : (
                      <Badge className="bg-primary/10 text-primary border-primary/20" variant="secondary">
                        Policy
                      </Badge>
                    )}
                  </div>

                  {/* Voting and Comments - always at bottom */}
                  <div className="flex items-center justify-between pt-6 border-t">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-green-600"
                      >
                        <ArrowUp className="w-4 h-4 mr-1" />
                        {post.vote_up || 0}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-red-600"
                      >
                        <ArrowDown className="w-4 h-4 mr-1" />
                        {post.vote_down || 0}
                      </Button>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MessageSquare className="w-4 h-4" />
                        {post.comment_count || 0}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {featuredPosts.length === 0 && (
              <div className="col-span-full">
                <Card className="p-8 text-center">
                  <div className="w-12 h-12 bg-[#3D63DD] rounded-lg flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No featured policies yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Featured policy proposals will appear here once published by administrators.
                  </p>
                  <Button onClick={() => navigate('/problems')} className="bg-[#3D63DD] hover:bg-[#2D53CD]">
                    Explore Problems
                  </Button>
                </Card>
              </div>
            )}
          </div>
          
          <div className="flex justify-center gap-4 mt-8">
            <Button
              variant="outline"
              onClick={() => navigate('/public-policy')}
              className="hover:bg-muted"
            >
              Load More
            </Button>
            <Button
              onClick={() => navigate('/public-policy')}
              className="bg-[#3D63DD] text-white hover:bg-[#2D53CD]"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Feature Chat - Policy Playground */}
      <FeatureChat />

      {/* Hero Contact Form */}
      <HeroFormContactWithBackground />

      {/* Blog Carousel Section with light gray background */}
      <div className="bg-muted/30">
        <HorizontalBlogCarousel />
      </div>

      {/* FAQ Section */}
      <FAQ />
      
      {/* Pricing */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground px-4">
              Choose the plan that fits your needs
            </p>
          </div>
              
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={cn(
                  "relative overflow-hidden",
                  plan.popular && "border-[#3D63DD] shadow-xl sm:scale-105"
                )}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-[#3D63DD] to-[#5A7FDB] text-white text-xs px-3 py-1 rounded-bl-lg">
                    Popular
                  </div>
                )}
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl sm:text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground mb-6">{plan.description}</p>
                  <Button 
                    className={cn(
                      "w-full mb-6",
                      plan.popular 
                        ? "bg-[#3D63DD] text-white hover:bg-[#2D53CD]" 
                        : "variant-outline"
                    )}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                  <ul className="space-y-2 sm:space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="w-4 h-4 text-[#3D63DD] mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-xs sm:text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
          
          {/* View All Button */}
          <div className="text-center mt-8 sm:mt-12">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/plans')}
              className="bg-card/80 hover:bg-card border-[#3D63DD]/20 hover:border-[#3D63DD]/40 text-[#3D63DD] hover:text-[#2D53CD] transition-all duration-300"
            >
              View All Plans
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="waitlist" className="py-12 sm:py-20 bg-background relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ShineBorder 
            className="rounded-xl sm:rounded-2xl"
            shineColor={["#3D63DD", "#5A7FDB", "#2D53CD"]}
            borderRadius={16}
            borderWidth={2}
            duration={10}
          >
            <div 
              className="p-8 sm:p-12 text-center"
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
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                Good trouble? That's Goodable.
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
                Join thousands collaborating on a new vision for public policy.
              </p>
              <form onSubmit={handleWaitlistSignup} className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full sm:flex-1"
                  disabled={isSubmitting}
                />
                <Button 
                  type="submit"
                  variant="outline" 
                  size="lg" 
                  disabled={isSubmitting}
                  className="dark:shadow-[0_0_20px_rgba(59,130,246,0.3)] dark:border-blue-500/50 dark:hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] transition-all duration-300 w-full sm:w-auto"
                >
                  <Heart className="w-4 h-4 mr-2 text-destructive" />
                  {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                </Button>
              </form>
            </div>
          </ShineBorder>
        </div>
      </section>
      
      {/* Confetti Canvas */}
      <Confetti
        ref={confettiRef}
        className="fixed inset-0 pointer-events-none"
      />

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-2 sm:col-span-1">
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
              <h3 className="font-semibold mb-4 text-sm sm:text-base">Product</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li><Link to="/features" className="hover:text-foreground">Features</Link></li>
                <li><a href="#examples" className="hover:text-foreground">Examples</a></li>
                <li><a href="#pricing" className="hover:text-foreground">Pricing</a></li>
                <li><a href="#docs" className="hover:text-foreground">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-sm sm:text-base">Company</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-foreground">About</Link></li>
                <li><a href="#blog" className="hover:text-foreground">Blog</a></li>
                <li><a href="#careers" className="hover:text-foreground">Careers</a></li>
                <li><a href="#contact" className="hover:text-foreground">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-sm sm:text-base">Connect</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border/50 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-muted-foreground">
            <p>&copy; 2024 Goodable. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing2;
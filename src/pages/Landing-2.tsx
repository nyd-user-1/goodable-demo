import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
  Play
} from "lucide-react";
import { useNavigate, Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ShineBorder } from '@/components/magicui/shine-border';
import { Marquee } from '@/components/magicui/marquee';
import HeroVideoDialog from '@/components/magicui/hero-video-dialog';
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { problems } from '@/data/problems';
import { supabase } from '@/integrations/supabase/client';
import { ChartAreaInteractive } from '@/components/charts/ChartAreaInteractive';
import { ChartBarEngagement } from '@/components/charts/ChartBarEngagement';
import { ChartPieBillStatus } from '@/components/charts/ChartPieBillStatus';
import { ChartLinePolicyImpact } from '@/components/charts/ChartLinePolicyImpact';
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
  const featuresRef = useRef<HTMLDivElement>(null);
  const [userProblem, setUserProblem] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const handleDoSomethingClick = () => {
    // Scroll to search or do something
  };

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
      gradient: "from-[#3D63DD] to-[#5A7FDB]"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Member Profiles",
      description: "Comprehensive legislator data including voting history, sponsorships, and committee memberships",
      gradient: "from-[#3D63DD] to-[#6B8CE8]"
    },
    {
      icon: <Brain className="w-5 h-5" />,
      title: "AI Policy Assistant",
      description: "Draft legislation, analyze impacts, and get expert guidance with advanced AI models",
      gradient: "from-[#3D63DD] to-[#4A70E0]"
    },
    {
      icon: <Building2 className="w-5 h-5" />,
      title: "Committee Tracking",
      description: "Monitor committee activities, agendas, and member compositions in real-time",
      gradient: "from-[#3D63DD] to-[#5577E5]"
    },
    {
      icon: <Scale className="w-5 h-5" />,
      title: "Policy Portal",
      description: "Collaborative workspace for drafting, reviewing, and refining policy proposals",
      gradient: "from-[#3D63DD] to-[#4D73E2]"
    },
    {
      icon: <Vote className="w-5 h-5" />,
      title: "Community Solutions",
      description: "Crowdsource ideas and vote on solutions to pressing societal challenges",
      gradient: "from-[#3D63DD] to-[#5A7FDB]"
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
              onClick={() => navigate('/auth')}
              className="bg-card/80 hover:bg-card"
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
              videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
              thumbnailSrc="https://startup-template-sage.vercel.app/hero-light.png"
              thumbnailAlt="Goodable Demo Video"
            />
            <HeroVideoDialog
              className="hidden dark:block"
              animationStyle="from-center"
              videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
              thumbnailSrc="https://startup-template-sage.vercel.app/hero-dark.png"
              thumbnailAlt="Goodable Demo Video"
            />
          </div>
        </div>
      </section>

      {/* Marquee Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Trusted by Policy Professionals
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground px-4">
              Join legislators and advocates using Goodable to create change
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
              Everything You Need for
              <span className="bg-gradient-to-r from-[#3D63DD] to-[#5A7FDB] bg-clip-text text-transparent"> Legislative Success</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Comprehensive tools and insights to track, analyze, and influence policy at every level
            </p>
          </div>
              
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="group relative overflow-hidden border-muted/50 bg-gradient-to-br from-background to-muted/10 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
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
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-muted/20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Platform Analytics
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Real-time insights into legislative activity, citizen engagement, and policy impact
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
      <section className="py-12 sm:py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ShineBorder 
            className="rounded-xl sm:rounded-2xl"
            shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
            borderRadius={16}
            borderWidth={2}
            duration={10}
          >
            <div className="p-8 sm:p-12 text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                Ready to do something good?
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
                Join thousands of people who are collaborating on a future that's Goodable.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={handleDoSomethingClick}
                  className="dark:shadow-[0_0_20px_rgba(59,130,246,0.3)] dark:border-blue-500/50 dark:hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] transition-all duration-300 w-full sm:w-auto"
                >
                  <Heart className="w-4 h-4 mr-2 text-destructive" />
                  Do Something
                </Button>
              </div>
            </div>
          </ShineBorder>
        </div>
      </section>

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
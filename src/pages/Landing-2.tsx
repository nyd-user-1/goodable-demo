import React, { useRef, useState } from 'react';
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
import '@/components/magicui/animated-background.css';

const Landing2 = () => {
  const navigate = useNavigate();
  const featuresRef = useRef<HTMLDivElement>(null);
  const [userProblem, setUserProblem] = useState('');

  const handleDoSomethingClick = () => {
    // Scroll to search or do something
  };

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

  const members = [
    {
      name: "Sen. Andrea Stewart-Cousins",
      role: "Senate Majority Leader",
      party: "Democrat",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=64&h=64&fit=crop&crop=face",
      bills: 42
    },
    {
      name: "Asm. Carl Heastie",
      role: "Assembly Speaker",
      party: "Democrat", 
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face",
      bills: 38
    },
    {
      name: "Sen. Robert Ortt",
      role: "Senate Minority Leader",
      party: "Republican",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
      bills: 29
    },
    {
      name: "Asm. William Barclay",
      role: "Assembly Minority Leader",
      party: "Republican",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face",
      bills: 31
    },
    {
      name: "Sen. Liz Krueger",
      role: "Finance Committee Chair",
      party: "Democrat",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face",
      bills: 56
    },
    {
      name: "Asm. Helene Weinstein",
      role: "Judiciary Committee Chair",
      party: "Democrat",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
      bills: 44
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

  const MemberCard = ({ member }: { member: typeof members[0] }) => (
    <figure className={cn(
      "relative h-full w-56 sm:w-64 cursor-pointer overflow-hidden rounded-xl border p-3 sm:p-4",
      "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
      "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
    )}>
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full" width="28" height="28" alt="" src={member.image} />
        <div className="flex flex-col">
          <figcaption className="text-xs sm:text-sm font-medium dark:text-white">
            {member.name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">{member.role}</p>
        </div>
      </div>
      <div className="mt-2 text-xs sm:text-sm">
        <span className="text-[#3D63DD] font-medium">{member.bills} bills sponsored</span>
        <span className="ml-2 text-xs text-muted-foreground">• {member.party}</span>
      </div>
    </figure>
  );

  const ProblemCard = ({ problem }: { problem: typeof problemCards[0] }) => (
    <figure className={cn(
      "relative h-full w-56 sm:w-64 cursor-pointer overflow-hidden rounded-xl border p-3 sm:p-4",
      "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
      "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
    )}>
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
      {/* Clean background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900" />
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
              <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-blue-100 dark:from-blue-900 dark:to-blue-900 text-[#3D63DD] dark:text-blue-300 border-0">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered Legislative Intelligence
              </Badge>
              
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-[#3D63DD] to-[#5A7FDB] bg-clip-text text-transparent">
              Transform Policy
            </span>
            <br />
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              With Collective Intelligence
            </span>
          </h1>
              
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 px-4">
            The only comprehensive platform for tracking legislation, analyzing policy impacts, 
            and crowd sourced policy solutions. Powered by advanced AI and driven by collaboration.
          </p>
              
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 sm:mb-12 px-4">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-[#3D63DD] text-white hover:bg-[#2D53CD] w-full sm:w-auto"
            >
              Try for Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/auth')}
              className="w-full sm:w-auto"
            >
              Log in
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
                <li><a href="#about" className="hover:text-foreground">About</a></li>
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
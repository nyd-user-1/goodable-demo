import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Shield, 
  Users, 
  BarChart3, 
  Code2, 
  Layers, 
  Globe,
  ChevronRight,
  Check,
  Star,
  MessageSquare,
  FileText,
  Vote,
  Building2,
  Scale,
  Brain,
  Heart,
  Twitter
} from "lucide-react";
import { useNavigate, Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ShineBorder } from '@/components/magicui/shine-border';
import { cn } from "@/lib/utils";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { HeartSidebarTrigger } from "@/components/HeartSidebarTrigger";
import '@/components/magicui/animated-background.css';

const Landing2 = () => {
  const navigate = useNavigate();
  const featuresRef = useRef<HTMLDivElement>(null);
  const [userProblem, setUserProblem] = useState('');

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  const testimonials = [
    {
      content: "This platform has revolutionized how we track and analyze legislation. The AI insights are invaluable.",
      author: "Sarah Chen",
      role: "Policy Director",
      rating: 5
    },
    {
      content: "The collaborative features make it easy to work with stakeholders across different organizations.",
      author: "Michael Torres", 
      role: "Legislative Analyst",
      rating: 5
    },
    {
      content: "Finally, a tool that makes legislative data accessible and actionable for everyone.",
      author: "Emily Rodriguez",
      role: "Community Organizer",
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      description: "For individuals getting started",
      features: [
        "Basic bill tracking",
        "5 AI queries per month",
        "Public committee data",
        "Community forums"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Pro",
      price: "$29",
      description: "For professionals and advocates",
      features: [
        "Unlimited bill tracking",
        "100 AI queries per month",
        "Advanced analytics",
        "Priority support",
        "Export capabilities",
        "Custom alerts"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Team",
      price: "$99",
      description: "For organizations and teams",
      features: [
        "Everything in Pro",
        "Unlimited AI queries",
        "Team collaboration",
        "API access",
        "Custom integrations",
        "Dedicated support"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const handleDoSomethingClick = () => {
    // Scroll to search or do something
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background overflow-hidden flex">
        <AppSidebar />
        <div className="flex-1">
          {/* Animated background */}
          <div className="fixed inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900" />
            <div className="absolute inset-0">
              <div className="absolute top-0 -left-4 w-72 h-72 bg-[#3D63DD] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob" />
              <div className="absolute top-0 -right-4 w-72 h-72 bg-[#8B8D98] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000" />
              <div className="absolute -bottom-8 left-20 w-72 h-72 bg-[#3D63DD] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000" />
            </div>
          </div>

          {/* Navigation */}
          <nav className="relative z-50 px-6 py-4">
            <div className="mx-auto max-w-7xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartSidebarTrigger />
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-card border rounded-lg flex items-center justify-center">
                    <span className="text-lg">❤️</span>
                  </div>
                  <span className="text-xl font-bold">Goodable</span>
                </div>
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

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <Badge className="mb-4 bg-gradient-to-r from-blue-100 to-blue-100 dark:from-blue-900 dark:to-blue-900 text-[#3D63DD] dark:text-blue-300 border-0">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered Legislative Intelligence
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-[#3D63DD] to-[#5A7FDB] bg-clip-text text-transparent">
                Transform Policy
              </span>
              <br />
              <span className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                With Collective Intelligence
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              The most comprehensive platform for tracking legislation, analyzing policy impacts, 
              and collaborating on solutions that make a difference. Powered by advanced AI and 
              driven by community wisdom.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="bg-[#3D63DD] text-white hover:bg-[#2D53CD]"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={scrollToFeatures}
              >
                View Features
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-[#3D63DD] to-[#5A7FDB] bg-clip-text text-transparent">
                  50K+
                </div>
                <div className="text-sm text-muted-foreground">Bills Tracked</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-[#3D63DD] to-[#4A70E0] bg-clip-text text-transparent">
                  10K+
                </div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-[#3D63DD] to-[#6B8CE8] bg-clip-text text-transparent">
                  500+
                </div>
                <div className="text-sm text-muted-foreground">Organizations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-[#3D63DD] to-[#5577E5] bg-clip-text text-transparent">
                  99.9%
                </div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section ref={featuresRef} className="py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need for
              <span className="bg-gradient-to-r from-[#3D63DD] to-[#5A7FDB] bg-clip-text text-transparent"> Legislative Success</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools and insights to track, analyze, and influence policy at every level
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="group relative overflow-hidden border-muted/50 bg-gradient-to-br from-background to-muted/10 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="p-6">
                  <div className={cn(
                    "w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform",
                    feature.gradient
                  )}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#3D63DD]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by Policy Professionals
            </h2>
            <p className="text-lg text-muted-foreground">
              See what our users are saying about Goodable
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-background/50 backdrop-blur">
                <div className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose the plan that fits your needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={cn(
                  "relative overflow-hidden",
                  plan.popular && "border-[#3D63DD] shadow-xl scale-105"
                )}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-[#3D63DD] to-[#5A7FDB] text-white text-xs px-3 py-1 rounded-bl-lg">
                    Popular
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-muted-foreground mb-6">{plan.description}</p>
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
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="w-4 h-4 text-[#3D63DD] mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
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
          <section className="py-20 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <ShineBorder 
                className="rounded-2xl"
                shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
                borderRadius={16}
                borderWidth={2}
                duration={10}
              >
                <div className="p-12 text-center">
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

          {/* Footer */}
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
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Landing2;

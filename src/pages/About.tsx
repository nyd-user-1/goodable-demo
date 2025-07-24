import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Heart, 
  Users, 
  Target, 
  Globe, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  TrendingUp,
  MessageSquare,
  Lightbulb,
  Scale,
  Building2
} from "lucide-react";
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

  const values = [
    {
      icon: <Heart className="w-5 h-5" />,
      title: "Human-Centered",
      description: "Every policy decision starts with people. We design tools that put human needs at the center of legislative work."
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Collaborative",
      description: "Complex problems require diverse perspectives. We enable lawmakers, advocates, and citizens to work together effectively."
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: "Impact-Driven", 
      description: "We measure success by real-world outcomes, not just activity. Every feature is designed to create meaningful change."
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: "Transparent",
      description: "Democracy thrives on openness. We make legislative processes accessible and understandable to everyone."
    }
  ];

  const features = [
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "AI-Powered Analysis",
      description: "Advanced artificial intelligence helps analyze complex legislation and predict policy impacts."
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: "Real-Time Collaboration",
      description: "Connect with colleagues, stakeholders, and constituents through integrated communication tools."
    },
    {
      icon: <Lightbulb className="w-5 h-5" />,
      title: "Crowdsourced Solutions",
      description: "Harness collective intelligence to identify innovative approaches to policy challenges."
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "Data-Driven Insights",
      description: "Make informed decisions with comprehensive analytics and trend analysis."
    }
  ];

  const stats = [
    { number: "50,000+", label: "Bills Tracked" },
    { number: "10,000+", label: "Active Users" },
    { number: "500+", label: "Organizations" },
    { number: "99.9%", label: "Uptime" }
  ];

  const team = [
    {
      name: "Sarah Chen",
      role: "CEO & Co-Founder",
      background: "Former legislative director with 15+ years in policy development",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=128&h=128&fit=crop&crop=face"
    },
    {
      name: "Michael Rodriguez",
      role: "CTO & Co-Founder", 
      background: "Previously built data platforms at major tech companies",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=face"
    },
    {
      name: "Dr. Emily Watson",
      role: "Head of Policy Research",
      background: "PhD in Public Policy, former Harvard Kennedy School professor",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&h=128&fit=crop&crop=face"
    },
    {
      name: "David Kim",
      role: "Head of Product",
      background: "Product leader focused on civic technology and government innovation",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&crop=face"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-card border rounded-lg flex items-center justify-center">
              <span className="text-2xl">❤️</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-[#3D63DD] to-[#5A7FDB] bg-clip-text text-transparent">
              About Goodable
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            We're building the future of democratic participation through technology that makes 
            legislative processes more transparent, collaborative, and effective.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-[#3D63DD] text-white hover:bg-[#2D53CD]"
            >
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/problems')}
            >
              Explore Problems
            </Button>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg text-muted-foreground">
              Empowering better governance through intelligent collaboration
            </p>
          </div>
          
          <Card className="p-8 sm:p-12">
            <div className="prose prose-lg max-w-none text-center">
              <p className="text-lg leading-relaxed text-muted-foreground">
                Democracy works best when everyone can participate meaningfully in the policy-making process. 
                Goodable bridges the gap between complex legislative work and public engagement, creating a 
                platform where lawmakers, advocates, researchers, and citizens can collaborate effectively 
                to solve our most pressing challenges.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we build and every decision we make
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="p-6 h-full">
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#3D63DD] rounded-lg flex items-center justify-center text-white mx-auto mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What We Build</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Cutting-edge tools designed for the complexities of modern governance
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-[#3D63DD] rounded-lg flex items-center justify-center text-white flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">By the Numbers</h2>
            <p className="text-lg text-muted-foreground">
              The impact we're making together
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#3D63DD] mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experienced leaders from policy, technology, and academia working together 
              to strengthen democratic institutions
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="p-6 text-center">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
                <p className="text-[#3D63DD] font-medium text-sm mb-3">{member.role}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {member.background}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Join the Movement?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Whether you're a policymaker, advocate, researcher, or engaged citizen, 
            there's a place for you in building better governance.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-[#3D63DD] text-white hover:bg-[#2D53CD]"
            >
              Start Collaborating
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/plans')}
            >
              View Pricing
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
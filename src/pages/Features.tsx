import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Brain, Users, Bell, FileEdit, BarChart3, Shield, Zap, CheckCircle, Clock, Star } from "lucide-react";

interface Feature {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  status: "Live" | "Beta" | "Coming Soon";
  tags: string[];
  icon: any;
  details: {
    overview: string;
    benefits: string[];
    technicalDetails?: string[];
  };
}

const features: Feature[] = [
  {
    id: "ai-analysis",
    title: "AI-Powered Legislative Analysis",
    description: "Advanced AI capabilities for analyzing bills, generating insights, and understanding legislative impact.",
    date: "2025-01-15",
    category: "AI & Analytics",
    status: "Live",
    tags: ["AI", "Analysis", "Bills", "Insights"],
    icon: Brain,
    details: {
      overview: "Transform how you understand legislation with our cutting-edge AI analysis tools. Get instant insights, impact assessments, and comprehensive summaries for any bill or legislative document.",
      benefits: [
        "Save 80% of time typically spent on manual bill analysis",
        "Identify key provisions and potential issues instantly",
        "Stay ahead of legislative developments with automated monitoring",
        "Make informed decisions with comprehensive impact assessments"
      ],
      technicalDetails: [
        "Multi-language support for analyzing legislation",
        "Real-time processing with sub-second response times",
        "Custom models trained specifically on legislative data",
        "Integration with existing workflow tools"
      ]
    }
  },
  {
    id: "member-tracking",
    title: "Legislative Member Tracking & Analytics",
    description: "Comprehensive profiles and voting analytics for all legislative members with real-time updates.",
    date: "2025-01-10",
    category: "Data & Analytics",
    status: "Live",
    tags: ["Members", "Voting", "Analytics", "Profiles"],
    icon: Users,
    details: {
      overview: "Stay informed about every legislative member with detailed profiles, voting records, committee assignments, and behavioral patterns.",
      benefits: [
        "Target the right members based on voting history",
        "Identify potential allies and swing votes",
        "Track member statements and public positions",
        "Build effective coalitions with data-driven insights"
      ],
      technicalDetails: [
        "Complete voting history with pattern analysis",
        "Real-time committee assignment updates",
        "Influence mapping and relationship networks",
        "Predictive analytics for voting behavior"
      ]
    }
  },
  {
    id: "real-time-monitoring",
    title: "Real-Time Legislative Monitoring",
    description: "Stay ahead with instant notifications and updates on legislative activities, committee meetings, and bill movements.",
    date: "2025-01-05",
    category: "Monitoring & Alerts",
    status: "Beta",
    tags: ["Real-time", "Notifications", "Monitoring", "Alerts"],
    icon: Bell,
    details: {
      overview: "Never miss a critical legislative development again. Our real-time monitoring system tracks thousands of data points across legislative bodies.",
      benefits: [
        "Instant notifications for bill status changes",
        "Real-time alerts for committee meetings and votes",
        "Automated monitoring of keywords and topics",
        "Customizable alert preferences and delivery methods"
      ],
      technicalDetails: [
        "Multi-channel notification delivery (email, SMS, Slack)",
        "Advanced filtering and priority levels",
        "Geographic and jurisdictional targeting",
        "Integration with calendar and project management tools"
      ]
    }
  },
  {
    id: "collaborative-drafting",
    title: "Collaborative Policy Drafting Suite",
    description: "Advanced collaborative tools for drafting, reviewing, and refining policy documents with AI assistance.",
    date: "2024-12-20",
    category: "Drafting & Collaboration",
    status: "Coming Soon",
    tags: ["Drafting", "Collaboration", "AI", "Policy"],
    icon: FileEdit,
    details: {
      overview: "Transform policy drafting with our comprehensive collaborative suite. Streamline the creation, review, and refinement of legislative documents.",
      benefits: [
        "Real-time collaborative editing with conflict resolution",
        "AI-powered writing assistance and suggestions",
        "Structured review and approval workflows",
        "Integration with legal compliance checking"
      ],
      technicalDetails: [
        "Version control with detailed revision history",
        "Role-based permissions and access control",
        "Template library for common policy types",
        "Export to multiple formats (PDF, Word, HTML)"
      ]
    }
  }
];

const Features = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  
  const categories = ["All", ...Array.from(new Set(features.map(f => f.category)))];
  
  const filteredFeatures = selectedCategory === "All" 
    ? features 
    : features.filter(f => f.category === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Live":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800";
      case "Beta":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800";
      case "Coming Soon":
        return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Live":
        return <CheckCircle className="w-3 h-3" />;
      case "Beta":
        return <Zap className="w-3 h-3" />;
      case "Coming Soon":
        return <Clock className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-4">Product Features</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover our powerful features and capabilities designed to transform how you work with legislative data
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="text-sm"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Features Timeline */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="space-y-8">
          {filteredFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={feature.id} className="relative">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Left sidebar - Date and Status */}
                  <div className="lg:w-64 flex-shrink-0">
                    <div className="lg:sticky lg:top-8">
                      <time className="text-sm font-medium text-muted-foreground block mb-3">
                        {formatDate(feature.date)}
                      </time>
                      
                      <div className={`inline-flex items-center gap-2 h-8 px-3 text-xs font-medium border rounded-lg ${getStatusColor(feature.status)} mb-3`}>
                        {getStatusIcon(feature.status)}
                        {feature.status}
                      </div>
                      
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {feature.category}
                      </div>
                    </div>
                  </div>

                  {/* Main content */}
                  <div className="flex-1 relative">
                    {/* Timeline line (desktop only) */}
                    <div className="hidden lg:block absolute -left-4 top-2 w-px h-full bg-border">
                      <div className="absolute -translate-x-1/2 w-3 h-3 bg-primary rounded-full" />
                    </div>

                    <Card className="relative">
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-2xl mb-2">{feature.title}</CardTitle>
                            <p className="text-muted-foreground mb-4">{feature.description}</p>
                            
                            {/* Tags */}
                            <div className="flex flex-wrap gap-2">
                              {feature.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="prose dark:prose-invert max-w-none">
                          <p className="text-base leading-relaxed mb-6">
                            {feature.details.overview}
                          </p>
                          
                          <Accordion type="multiple" className="w-full">
                            <AccordionItem value="benefits">
                              <AccordionTrigger className="text-left">
                                Key Benefits
                              </AccordionTrigger>
                              <AccordionContent>
                                <ul className="space-y-2">
                                  {feature.details.benefits.map((benefit, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span>{benefit}</span>
                                    </li>
                                  ))}
                                </ul>
                              </AccordionContent>
                            </AccordionItem>
                            
                            {feature.details.technicalDetails && (
                              <AccordionItem value="technical">
                                <AccordionTrigger className="text-left">
                                  Technical Details
                                </AccordionTrigger>
                                <AccordionContent>
                                  <ul className="space-y-2">
                                    {feature.details.technicalDetails.map((detail, idx) => (
                                      <li key={idx} className="flex items-start gap-2">
                                        <Star className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                        <span>{detail}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </AccordionContent>
                              </AccordionItem>
                            )}
                          </Accordion>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Features;
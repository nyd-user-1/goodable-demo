import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MessageSquare, MousePointerClick, Mail, FileText, ThumbsUp, Users, PenTool, Lightbulb, Rss, Quote, Search, Bookmark } from "lucide-react";

export default function HeroSectionWithFeatureTimeline() {
  const features = [
    {
      category: "Research",
      title: "AI-Powered Chat with Streaming",
      description:
        "Get instant analysis of bills, legislators, and committees with word-by-word streaming responses. Context-aware AI that understands legislative nuance.",
      icon: <MessageSquare className="h-5 w-5 text-foreground" />,
    },
    {
      category: "Research",
      title: '"Ask Goodable" Text Selection',
      description:
        "Select any text on the page and instantly ask our AI about it. Removes friction from research by enabling contextual questions without switching screens.",
      icon: <MousePointerClick className="h-5 w-5 text-foreground" />,
    },
    {
      category: "Research",
      title: "Embedded Bill PDF Viewer",
      description:
        "View official NYS Legislature documents in a resizable side panel without leaving the app. Includes Quick Review buttons and direct download options.",
      icon: <FileText className="h-5 w-5 text-foreground" />,
    },
    {
      category: "Research",
      title: "Live Policy Feed",
      description:
        "Real-time legislative activity with source credibility indicators, expandable summaries, and direct links to official NYS Open Legislation pages.",
      icon: <Rss className="h-5 w-5 text-foreground" />,
    },
    {
      category: "Track",
      title: "Quick Review System",
      description:
        "One-click Support, Oppose, or Neutral tracking with personal notes on any bill. Democratizes advocacy tracking by making it frictionless to record positions.",
      icon: <ThumbsUp className="h-5 w-5 text-foreground" />,
    },
    {
      category: "Track",
      title: "Citation Management",
      description:
        "Numbered citations with inline links, expandable accordion views, and organized reference management. Turn research into documented, shareable insights.",
      icon: <Quote className="h-5 w-5 text-foreground" />,
    },
    {
      category: "Track",
      title: "Excerpt Creation",
      description:
        "One-click saving of AI insights as shareable, citable excerpts. Export to PDF or copy to clipboard for easy sharing with colleagues and stakeholders.",
      icon: <Bookmark className="h-5 w-5 text-foreground" />,
    },
    {
      category: "Act",
      title: "Direct Email Advocacy",
      description:
        "Send AI-generated support or opposition letters to bill sponsors with one click. CC all co-sponsors and customize before sending. Research to action, seamlessly.",
      icon: <Mail className="h-5 w-5 text-foreground" />,
    },
    {
      category: "Act",
      title: "Problem-to-Policy Pipeline",
      description:
        "Multi-stage wizard that guides you from real-world problems to structured policy solutions. AI-assisted advocacy strategy development built in.",
      icon: <Lightbulb className="h-5 w-5 text-foreground" />,
    },
    {
      category: "Collaborate",
      title: "Co-Authorship System",
      description:
        "Invite-based multi-user legislative drafting with role-based permissions. Transform individual research into collaborative policy development.",
      icon: <Users className="h-5 w-5 text-foreground" />,
    },
    {
      category: "Collaborate",
      title: "Solutions Whiteboard",
      description:
        "Canvas-based collaborative drawing tool with policy templates including Stakeholder Maps, Policy Frameworks, and Impact Analysis diagrams.",
      icon: <PenTool className="h-5 w-5 text-foreground" />,
    },
    {
      category: "Discover",
      title: "Curated Use Cases",
      description:
        "Expert-sourced prompts from policy practitioners, government administrators, and civic technologists. High-quality starting points for any research need.",
      icon: <Search className="h-5 w-5 text-foreground" />,
    },
  ];

  const categories = ["Research", "Track", "Act", "Collaborate", "Discover"];

  return (
    <>
      <div className="bg-background">
        <div className="container mx-auto px-4 md:px-6 2xl:max-w-[1400px] py-16 lg:py-24">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="outline" className="mb-4">
                Platform Features
              </Badge>
              <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
                Building the future of public policy
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                From research to action, Goodable provides a complete toolkit for understanding legislation, tracking your positions, and making your voice heard.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90">
                  Start Exploring
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-2 h-4 w-4"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Button>
                <Button size="lg" variant="outline">
                  View Use Cases
                </Button>
              </div>
            </div>

            {/* Features by Category */}
            <div className="max-w-5xl mx-auto space-y-12">
              {categories.map((category) => (
                <div key={category}>
                  <div className="flex items-center gap-3 mb-6">
                    <Badge className="bg-foreground text-background hover:bg-foreground/90 px-3 py-1">
                      {category}
                    </Badge>
                    <div className="h-px flex-1 bg-border"></div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                    {features
                      .filter((f) => f.category === category)
                      .map((feature) => (
                        <Card
                          key={feature.title}
                          className="p-6 hover:shadow-lg transition-all duration-300 hover:border-foreground/20"
                        >
                          <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-muted shrink-0">
                              {feature.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold mb-2">
                                {feature.title}
                              </h3>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {feature.description}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Card className="mt-16 p-8 text-center max-w-2xl mx-auto bg-muted/50">
              <h3 className="font-semibold mb-2">Ready to get started?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Join thousands of policy professionals, advocates, and engaged citizens using Goodable to understand and influence legislation.
              </p>
              <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90">
                Try Goodable Free
              </Button>
            </Card>
          </div>
      </div>
    </>
  );
}

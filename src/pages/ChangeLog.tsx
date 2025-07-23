import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useGitChangelog } from "@/hooks/useGitChangelog";
import { 
  GitBranch,
  Calendar,
  Users,
  Activity,
  RefreshCw,
  ChevronDown
} from "lucide-react";
import { useState } from "react";

const ChangeLog = () => {
  const { changelog, isLoading, error, refreshChangelog } = useGitChangelog();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const staticReleases = [
    {
      version: "1.3.0",
      date: "July 23, 2025",
      title: "Enhanced User Experience & Design Polish",
      description: "Tasteful UI enhancements with professional micro-interactions and dark mode improvements.",
      isLatest: true,
      features: [
        {
          title: "Glowing CTA Buttons",
          description: "Subtle glowing borders on call-to-action buttons in dark mode for enhanced visual appeal.",
          category: "UI/UX"
        },
        {
          title: "Professional Micro-Interactions",
          description: "Carefully curated micro-confetti effects and button animations that provide user feedback without clutter.",
          category: "UI/UX"
        },
        {
          title: "Interactive Grid Patterns",
          description: "Subtle background textures on dashboard cards that respond to user interaction.",
          category: "Design"
        },
        {
          title: "Enhanced Changelog",
          description: "Accordion-style changelog with improved organization and automatic Git integration.",
          category: "Features"
        }
      ]
    },
    {
      version: "1.2.0",
      date: "July 20, 2025",
      title: "Advanced Legislative Intelligence",
      description: "Transforming how policy professionals research and engage with legislative data through AI-powered insights.",
      features: [
        {
          title: "AI-Powered Analysis",
          description: "Revolutionary AI chat system that provides instant, contextual insights on bills, members, and committees with natural language processing.",
          category: "AI"
        },
        {
          title: "Dynamic Dashboard",
          description: "Comprehensive dashboard with real-time legislative metrics, trending bills, committee activity, and member performance indicators.",
          category: "Analytics"
        },
        {
          title: "Advanced Search",
          description: "Sophisticated search capabilities across all legislative data with intelligent filters, keyword highlighting, and contextual suggestions.",
          category: "Search"
        },
        {
          title: "Personalized Favorites",
          description: "Smart favorites management allowing users to track bills, members, and committees with priority notifications and updates.",
          category: "Personalization"
        }
      ]
    },
    {
      version: "1.1.0",
      date: "July 12, 2025",
      title: "Advanced Legislative Intelligence",
      description: "Transforming how policy professionals research and engage with legislative data through AI-powered insights.",
      features: [
        {
          title: "Bills Database",
          description: "Full access to New York State legislative database with detailed bill information, sponsor data, committee assignments, and voting records.",
          category: "Data"
        },
        {
          title: "Member Profiles",
          description: "Detailed member profiles with biographical information, committee memberships, sponsored legislation, and voting patterns.",
          category: "Members"
        },
        {
          title: "Committee Management",
          description: "Complete committee information including membership, meeting schedules, active legislation, and jurisdictional details.",
          category: "Committees"
        },
        {
          title: "Interactive Chat",
          description: "Persistent chat sessions with AI assistant specialized in legislative research, policy analysis, and strategic planning.",
          category: "Intelligence"
        }
      ]
    },
    {
      version: "1.0.0",
      date: "July 10, 2025",
      title: "Foundation Platform Launch",
      description: "Initial platform release establishing the core architecture for legislative research and policy analysis.",
      features: [
        {
          title: "Modern Design",
          description: "Comprehensive design system built with Tailwind CSS and Shadcn UI components for consistent, accessible user experience.",
          category: "Design"
        },
        {
          title: "High-Performance",
          description: "React-based architecture with optimized data loading, caching strategies, and responsive design for all devices.",
          category: "Performance"
        },
        {
          title: "NYS API Integration",
          description: "Complete integration with New York State's official legislative API providing comprehensive access to all public legislative data.",
          category: "Integration"
        },
        {
          title: "Responsive Navigation",
          description: "Intuitive sidebar navigation with collapsible design, search integration, and contextual menu organization.",
          category: "Navigation"
        }
      ]
    }
  ];
  
  // Combine static releases with auto-generated ones, sorted by date (newest first)
  const allReleases = [...changelog, ...staticReleases].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getCategoryColor = (category: string) => {
    const colors = {
      "AI": "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
      "Analytics": "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
      "Search": "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
      "Personalization": "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800",
      "Data": "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800",
      "Members": "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800",
      "Committees": "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800",
      "Intelligence": "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-800",
      "Design": "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800",
      "Performance": "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
      "Integration": "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/20 dark:text-slate-300 dark:border-slate-800",
      "Navigation": "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800",
      "Features": "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800",
      "UI/UX": "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800",
      "Bug Fixes": "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
      "Maintenance": "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-900/20 dark:text-zinc-300 dark:border-zinc-800"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800";
  };
  
  const getAllCategories = () => {
    const categories = new Set<string>();
    allReleases.forEach(release => {
      release.features.forEach(feature => {
        categories.add(feature.category);
      });
    });
    return Array.from(categories);
  };
  
  const filteredReleases = selectedCategory 
    ? allReleases.map(release => ({
        ...release,
        features: release.features.filter(feature => feature.category === selectedCategory)
      })).filter(release => release.features.length > 0)
    : allReleases;

  return (
    <div className="page-container min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="content-wrapper max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Change Log
          </h1>
          <p className="text-muted-foreground">
            Continuous innovation and automatic updates from our development workflow
          </p>
        </div>
          
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-8">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{allReleases.length} releases found</span>
            <span>•</span>
            <span>{allReleases.reduce((acc, release) => acc + release.features.length, 0)} features delivered</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={refreshChangelog}
              disabled={isLoading}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh from Git
            </Button>
            
            {/* Category Filter */}
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {getAllCategories().slice(0, 3).map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <GitBranch className="h-8 w-8 text-primary mx-auto animate-pulse" />
            <p className="text-muted-foreground mt-4">Generating changelog from Git history...</p>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="text-center py-12 bg-destructive/10 rounded-lg border border-destructive/20">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={refreshChangelog} variant="outline">
              Try Again
            </Button>
          </div>
        )}
        
        {/* Release Timeline */}
        {!isLoading && !error && (
          <div className="space-y-6">
            {filteredReleases.map((release, releaseIndex) => (
              <Card key={release.version} className="hover:bg-muted/50 transition-colors">
                <Collapsible defaultOpen={releaseIndex === 0}>
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="pb-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-xl font-semibold text-foreground">
                              {release.version.startsWith('v') ? release.version : `Version ${release.version}`}
                            </CardTitle>
                            {release.isLatest && (
                              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full border border-primary/20">
                                Latest
                              </span>
                            )}
                          </div>
                          <CardDescription className="text-muted-foreground text-sm flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Released on {release.date}
                          </CardDescription>
                        </div>
                        <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="border-t border-border/30 pt-6 mb-6">
                        <h3 className="font-semibold text-foreground mb-2 text-lg">{release.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{release.description}</p>
                      </div>
                      
                      <div className="space-y-4">
                        {release.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="border-l-2 border-primary/20 pl-4">
                            <h4 className="font-medium text-foreground text-sm mb-1">
                              {feature.title}
                            </h4>
                            <p className="text-muted-foreground text-sm leading-relaxed mb-2">
                              {feature.description}
                            </p>
                            <span className="text-xs px-2 py-1 bg-muted/50 text-muted-foreground rounded">
                              {feature.category}
                            </span>
                          </div>
                        ))}
                      </div>
                              
                      {/* Git Commits Info */}
                      {release.commits && release.commits.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-border/50">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <GitBranch className="h-3 w-3" />
                            {release.commits.length} commit{release.commits.length !== 1 ? 's' : ''} in this release
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {release.commits.slice(0, 3).map((commit, idx) => (
                              <code key={idx} className="text-xs px-2 py-1 bg-muted rounded font-mono">
                                {commit.hash}
                              </code>
                            ))}
                            {release.commits.length > 3 && (
                              <span className="text-xs text-muted-foreground px-2 py-1">
                                +{release.commits.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>
        )}

        {/* Footer Integration Info */}
        <div className="mt-8 p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <GitBranch className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                Automatic Git Integration
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6 max-w-2xl mx-auto">
              This changelog automatically updates from our Git commit history. Every push to GitHub creates new entries, 
              parsing commit messages and generating structured release notes.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-4 bg-background/50 rounded-lg border border-primary/10">
                <div className="text-xl font-bold text-primary mb-1">Auto</div>
                <div className="text-xs text-muted-foreground">Generated from Git</div>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-lg border border-primary/10">
                <div className="text-xl font-bold text-primary mb-1">Real-time</div>
                <div className="text-xs text-muted-foreground">Updates on Push</div>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-lg border border-primary/10">
                <div className="text-xl font-bold text-primary mb-1">Smart</div>
                <div className="text-xs text-muted-foreground">Commit Parsing</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangeLog;
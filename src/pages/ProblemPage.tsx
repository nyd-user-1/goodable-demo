import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, TrendingUp, Users, Clock, Target, ExternalLink } from 'lucide-react';
import { getProblemBySlug, getRelatedProblems, Problem } from '@/data/problems';
import { StarRating } from '@/components/StarRating';

const ProblemPage: React.FC = () => {
  const { problemSlug } = useParams<{ problemSlug: string }>();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [relatedProblems, setRelatedProblems] = useState<Problem[]>([]);

  useEffect(() => {
    if (problemSlug) {
      const foundProblem = getProblemBySlug(problemSlug);
      if (foundProblem) {
        setProblem(foundProblem);
        setRelatedProblems(getRelatedProblems(foundProblem.id));
        
        // Set page metadata for SEO
        document.title = foundProblem.metadata.title;
        
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', foundProblem.metadata.description);
        }
      } else {
        navigate('/');
      }
    }
  }, [problemSlug, navigate]);

  if (!problem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Problem not found</h2>
          <Button onClick={() => navigate('/')} className="mt-4">
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  const priorityColors = {
    urgent: 'bg-destructive/10 text-destructive border-destructive/20',
    high: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
    normal: 'bg-primary/10 text-primary border-primary/20',
    low: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20'
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Problems</span>
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-card border border-border rounded-lg flex items-center justify-center">
                <span className="text-lg">❤️</span>
              </div>
              <span className="text-xl font-bold text-foreground">Goodable</span>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="text-sm">
            <span 
              className="text-primary hover:text-primary/80 cursor-pointer" 
              onClick={() => navigate('/')}
            >
              Home
            </span>
            <span className="mx-2 text-muted-foreground">/</span>
            <span 
              className="text-primary hover:text-primary/80 cursor-pointer"
              onClick={() => navigate('/')}
            >
              Problems
            </span>
            <span className="mx-2 text-muted-foreground">/</span>
            <span className="text-foreground">{problem.title}</span>
          </nav>
        </div>
      </div>

      {/* Problem Info Card Section */}
      <section className="bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div>
            <Card className="card bg-card rounded-xl shadow-sm border border-border overflow-hidden">
              <CardHeader className="card-header px-6 py-4 border-b border-border">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl font-semibold mb-2">
                      {problem.title}
                    </CardTitle>
                    <Badge className={priorityColors[problem.priority]}>
                      {problem.priority.charAt(0).toUpperCase() + problem.priority.slice(1)} Priority
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <StarRating 
                      problemId={problem.id} 
                      className="w-full"
                      showVoteCount={false}
                      showStars={true}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="card-body p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Category</h4>
                    <p className="text-sm font-medium">
                      {problem.category}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Sub-problems</h4>
                    <p className="text-sm">{problem.subProblems}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Solutions</h4>
                    <p className="text-sm">{problem.solutions}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Priority</h4>
                    <p className="text-sm">{problem.priority.charAt(0).toUpperCase() + problem.priority.slice(1)}</p>
                  </div>
                </div>
                
                {problem.description && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Description</h4>
                    <p className="text-sm leading-relaxed text-foreground">
                      {problem.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="border-b border-border bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {problem.statistics.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="font-medium text-foreground mb-1">
                    {stat.label}
                  </div>
                  {stat.source && (
                    <div className="text-sm text-muted-foreground">
                      Source: {stat.source}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Tabs defaultValue="overview" className="max-w-6xl">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="solutions">Solutions</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
              <TabsTrigger value="related">Related</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Problem Overview</CardTitle>
                  <CardDescription>
                    Understanding the scope and impact of {problem.title.toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground leading-relaxed">
                    {problem.description} This complex issue affects millions of people and requires 
                    comprehensive policy solutions that address both immediate needs and long-term systemic changes.
                  </p>
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <h4 className="font-semibold text-primary mb-2">Key Challenge Areas</h4>
                    <ul className="text-primary/90 space-y-1">
                      <li>• Policy framework development and implementation</li>
                      <li>• Resource allocation and funding mechanisms</li>
                      <li>• Stakeholder coordination and community engagement</li>
                      <li>• Long-term sustainability and impact measurement</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="solutions" className="space-y-6">
              <div className="grid gap-6">
                {problem.solutionsList.map((solution, index) => (
                  <Card key={solution.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {solution.title}
                        <Badge variant="outline">{solution.id}</Badge>
                      </CardTitle>
                      <CardDescription>{solution.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Feasibility</span>
                            <span className="text-sm text-muted-foreground">{solution.feasibility}/10</span>
                          </div>
                          <Progress value={solution.feasibility * 10} className="h-2" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Impact</span>
                            <span className="text-sm text-muted-foreground">{solution.impact}/10</span>
                          </div>
                          <Progress value={solution.impact * 10} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="statistics" className="space-y-6">
              <div className="grid gap-6">
                {problem.statistics.map((stat, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{stat.label}</h3>
                          {stat.source && (
                            <p className="text-sm text-muted-foreground">Source: {stat.source}</p>
                          )}
                        </div>
                        <div className="text-2xl font-bold text-primary">
                          {stat.value}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="related" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Related Problems</CardTitle>
                  <CardDescription>
                    Other challenges in the same category that might interest you
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {relatedProblems.length > 0 ? (
                      relatedProblems.map((relatedProblem) => (
                        <div
                          key={relatedProblem.id}
                          className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                          onClick={() => navigate(`/problems/${relatedProblem.slug}`)}
                        >
                          <div>
                            <h4 className="font-medium">{relatedProblem.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {relatedProblem.subProblems} sub-problems • {relatedProblem.solutions} solutions
                            </p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        No related problems found in this category.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-background border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to make a difference?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join the conversation and help develop solutions for {problem.title.toLowerCase()}.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={() => navigate('/')}>
                Explore More Problems
              </Button>
              <Button variant="outline" size="lg">
                Start a Discussion
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProblemPage;
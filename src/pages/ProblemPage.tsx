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
import { ProblemCollabStream } from '@/components/features/problems/ProblemCollabStream';

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
    <div className="page-container min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="content-wrapper max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Navigation Section */}
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 font-medium py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Problems</span>
            <span className="sm:hidden">Back</span>
          </Button>

          {/* Problem Info Card Section */}
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
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Proposals</h4>
                  <p className="text-sm">{problem.subProblems}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Collaborators</h4>
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

          {/* Statistics Section */}
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

          {/* Problem Tabs Section */}
          <section>
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 h-12 p-1 bg-muted rounded-lg">
                <TabsTrigger value="overview" className="h-10 rounded-md text-sm font-medium">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="solutions" className="h-10 rounded-md text-sm font-medium">
                  Colab
                </TabsTrigger>
                <TabsTrigger value="statistics" className="h-10 rounded-md text-sm font-medium">
                  Statistics
                </TabsTrigger>
                <TabsTrigger value="related" className="h-10 rounded-md text-sm font-medium">
                  Related
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6 space-y-6">
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

              <TabsContent value="solutions" className="mt-6">
                <ProblemCollabStream problem={problem} />
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
          </section>

          {/* Call to Action */}
          <div className="bg-background border-t border-border rounded-lg p-8">
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
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;
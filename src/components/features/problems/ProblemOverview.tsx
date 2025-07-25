import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { TrendingUp, ExternalLink, BookOpen, FileText, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Problem } from '@/data/problems';
import { ProblemAIChatSheet } from './ProblemAIChatSheet';

interface PolicyProblemData {
  Title: string;
  'Why This Matters Now': string;
  "What We're Seeing": string;
  'The Real Challenge': string;
  'The Path Forward': string;
  'Your Role': string;
}

interface ProblemOverviewProps {
  problem: Problem;
}

export const ProblemOverview: React.FC<ProblemOverviewProps> = ({ problem }) => {
  const [policyData, setPolicyData] = useState<PolicyProblemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  useEffect(() => {
    const fetchPolicyData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Map common variations to match the policy data titles
        let searchTitle = problem.title;
        
        // Handle specific known mappings
        const titleMappings: { [key: string]: string } = {
          'Addictive Technology': 'Addictive Tech',
          'Healthcare Access': 'Healthcare Access',
          'Mental Health Support': 'Mental Health',
          'Housing Crisis': 'Housing Crisis',
          'Income Stagnation': 'Income Stagnation',
          'End Stage Capitalism': 'End-Stage Capitalism',
          'Digital Divide': 'Digital Divide',
          'Elder Care': 'Elder Care',
          'Education Access': 'Education Access',
          'Social Isolation': 'Social Isolation',
          'Free Time': 'Free Time',
          'Cultural Divisions': 'Cultural Divisions',
          'Fake News': 'Fake News',
          'Food Security': 'Food Security',
          'Workplace Burnout': 'Workplace Burnout',
          'Tax Fairness': 'Tax Fairness',
          'Small Business Survival': 'Small Business',
          'Digital Privacy': 'Digital Privacy',
          'Digital Rights': 'Digital Rights',
          'Climate Resilience': 'Climate Resilience',
          'Clean Air and Water': 'Clean Air and Water',
          'Aging Infrastructure': 'Aging Infrastructure',
          'Public Transit': 'Public Transit',
          'Transportation Equity': 'Transportation Equity',
          'Criminal Justice Reform': 'Criminal Justice',
          'Community Safety': 'Community Safety',
          'Gun Violence Prevention': 'Gun Violence',
          'Voter Access': 'Voter Access',
          'Civic Engagement': 'Civic Engagement',
          'Youth Opportunity': 'Youth Opportunity',
          'Youth Justice': 'Youth Justice',
          'Financial Literacy': 'Financial Literacy',
          'Homelessness': 'Homelessness',
          'Immigration Reform': 'Immigration Reform',
          'Veterans Affairs': 'Veterans Affairs',
          'Disability Inclusion': 'Disability Inclusion',
          'Arts & Culture': 'Arts & Culture',
          'Neighborhood Revitalization': 'Neighborhood Revitalization',
          'Urban Planning': 'Urban Planning',
          'Rural Development': 'Rural Development',
          'Public Health Preparedness': 'Public Health',
          'Disaster Response': 'Disaster Response',
          'Reproductive Health': 'Reproductive Health',
          'Substance Abuse': 'Substance Abuse',
          'Water Security': 'Water Security',
          'Energy Transition': 'Energy Transition',
          'Science Investment': 'Science and Research Investment'
        };

        // Use mapped title if available
        if (titleMappings[problem.title]) {
          searchTitle = titleMappings[problem.title];
        }

        // Try to find matching data in the Top 50 Public Policy Problems table
        const { data, error } = await supabase
          .from('Top 50 Public Policy Problems')
          .select('*')
          .ilike('Title', `${searchTitle}%`)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        setPolicyData(data);
      } catch (err) {
        console.error('Error fetching policy data:', err);
        setError('Unable to load policy analysis data');
      } finally {
        setLoading(false);
      }
    };

    fetchPolicyData();
  }, [problem.title]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-semibold">Policy Analysis</CardTitle>
              <div className="h-6 w-24 bg-muted animate-pulse rounded" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2 p-4 rounded-lg bg-muted/30 animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !policyData) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-semibold">Problem Analysis</CardTitle>
              <Badge variant="outline" className="border-muted-foreground/30">
                General Framework
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Current Situation */}
              <div className="md:col-span-2 space-y-2 p-4 rounded-lg bg-muted/50 border border-muted-foreground/20">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                  Current Situation
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {problem.description || "This problem represents a significant policy challenge that requires comprehensive analysis and stakeholder engagement to develop effective solutions."}
                </p>
              </div>

              {/* Why This Matters */}
              <div className="space-y-2 p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-orange-700 dark:text-orange-400">
                  Why This Matters Now
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The urgency of addressing this issue has increased due to evolving social, economic, and technological factors that impact communities across the state.
                </p>
              </div>

              {/* Path Forward */}
              <div className="space-y-2 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-green-700 dark:text-green-400">
                  Path Forward
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Effective solutions will require collaborative efforts between policymakers, community organizations, and stakeholders to implement evidence-based approaches.
                </p>
              </div>
            </div>

            {/* Research Footer */}
            <div className="mt-6 flex items-center justify-between p-3 rounded-md bg-muted/50">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Analysis based on policy research frameworks</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs"
                onClick={() => setChatOpen(true)}
              >
                Ask Chat
                <MessageSquare className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* AI Chat Sheet */}
        <ProblemAIChatSheet
          open={chatOpen}
          onOpenChange={setChatOpen}
          problem={problem}
          policyData={null}
          initialPrompt={selectedPrompt || undefined}
        />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Main Content Grid */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold">Policy Analysis</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Why This Matters Now */}
            <div className="space-y-2 p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-red-700 dark:text-red-400">
                Why This Matters Now
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {policyData['Why This Matters Now']}
              </p>
            </div>

            {/* What We're Seeing */}
            <div className="space-y-2 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-blue-700 dark:text-blue-400">
                What We're Seeing
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {policyData["What We're Seeing"]}
              </p>
            </div>

            {/* The Real Challenge */}
            <div className="space-y-2 p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-orange-700 dark:text-orange-400">
                The Real Challenge
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {policyData['The Real Challenge']}
              </p>
            </div>

            {/* The Path Forward */}
            <div className="space-y-2 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-green-700 dark:text-green-400">
                The Path Forward
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {policyData['The Path Forward']}
              </p>
            </div>
          </div>

          {/* Your Role - Full Width */}
          <div className="mt-4 space-y-2 p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-purple-700 dark:text-purple-400">
              Your Role
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {policyData['Your Role']}
            </p>
          </div>

          {/* Citation Footer */}
          <div className="mt-6 flex items-center justify-between p-3 rounded-md bg-muted/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Sourced from policy research database</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs"
              onClick={() => setChatOpen(true)}
            >
              Ask Chat
              <MessageSquare className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* AI Chat Sheet */}
      <ProblemAIChatSheet
        open={chatOpen}
        onOpenChange={setChatOpen}
        problem={problem}
        policyData={policyData}
        initialPrompt={selectedPrompt || undefined}
      />
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { TrendingUp, ExternalLink, BookOpen, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Problem } from '@/data/problems';

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

  useEffect(() => {
    const fetchPolicyData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to find matching data in the Top 50 Public Policy Problems table
        const { data, error } = await supabase
          .from('Top 50 Public Policy Problems')
          .select('*')
          .ilike('Title', `%${problem.title}%`)
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
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="w-5 h-5 text-primary" />
              Policy Overview
            </CardTitle>
            <div className="h-5 w-20 bg-muted animate-pulse rounded" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
                <div className="space-y-2 pl-4">
                  <div className="h-3 bg-muted animate-pulse rounded w-full" />
                  <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !policyData) {
    return (
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="w-5 h-5 text-primary" />
              Problem Analysis
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              General Framework
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Fallback content when no specific data is available */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <h3 className="font-semibold text-foreground">Current Situation</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed pl-4">
                {problem.description || "This problem represents a significant policy challenge that requires comprehensive analysis and stakeholder engagement to develop effective solutions."}
              </p>
            </div>

            <Separator className="my-4" />

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <h3 className="font-semibold text-foreground">Why This Matters Now</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed pl-4">
                The urgency of addressing this issue has increased due to evolving social, economic, and technological factors that impact communities across the state.
              </p>
            </div>

            <Separator className="my-4" />

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <h3 className="font-semibold text-foreground">Path Forward</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed pl-4">
                Effective solutions will require collaborative efforts between policymakers, community organizations, and stakeholders to implement evidence-based approaches.
              </p>
            </div>
          </div>

          {/* Research Footer */}
          <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="w-4 h-4" />
                <span>Analysis based on policy research frameworks</span>
              </div>
              <Button variant="ghost" size="sm" className="text-primary h-auto p-0">
                View Research
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="w-5 h-5 text-primary" />
            Policy Overview
          </CardTitle>
          <Badge variant="default" className="text-xs">
            Research-Backed
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Why This Matters Now */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <h3 className="font-semibold text-foreground">Why This Matters Now</h3>
          </div>
          <p className="text-muted-foreground leading-relaxed pl-4">
            {policyData['Why This Matters Now']}
          </p>
        </div>

        <Separator className="my-4" />

        {/* What We're Seeing */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <h3 className="font-semibold text-foreground">What We're Seeing</h3>
          </div>
          <p className="text-muted-foreground leading-relaxed pl-4">
            {policyData["What We're Seeing"]}
          </p>
        </div>

        <Separator className="my-4" />

        {/* The Real Challenge */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <h3 className="font-semibold text-foreground">The Real Challenge</h3>
          </div>
          <p className="text-muted-foreground leading-relaxed pl-4">
            {policyData['The Real Challenge']}
          </p>
        </div>

        <Separator className="my-4" />

        {/* The Path Forward */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <h3 className="font-semibold text-foreground">The Path Forward</h3>
          </div>
          <p className="text-muted-foreground leading-relaxed pl-4">
            {policyData['The Path Forward']}
          </p>
        </div>

        <Separator className="my-4" />

        {/* Your Role */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <h3 className="font-semibold text-foreground">Your Role</h3>
          </div>
          <p className="text-muted-foreground leading-relaxed pl-4">
            {policyData['Your Role']}
          </p>
        </div>

        {/* Research Citation Footer */}
        <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="w-4 h-4" />
              <span>Sourced from policy research database with citations</span>
            </div>
            <Button variant="ghost" size="sm" className="text-primary h-auto p-0">
              View Citations
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
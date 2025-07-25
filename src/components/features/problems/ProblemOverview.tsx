import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { Problem } from "@/data/problems";
import { supabase } from "@/integrations/supabase/client";

interface ProblemOverviewProps {
  problem: Problem;
}

interface PolicyProblemData {
  id: string;
  problem_name: string;
  description: string;
  impact_statement: string;
  current_status: string;
  key_stakeholders: string;
  legislative_history: string;
  potential_solutions: string;
  evidence_base: string;
}

export const ProblemOverview = ({ problem }: ProblemOverviewProps) => {
  const [policyData, setPolicyData] = useState<PolicyProblemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPolicyProblemData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to fetch from Top 50 Public Policy Problem table
        // Using a flexible query that will work whether the table exists or not
        const { data, error } = await supabase
          .from('Top_50_Public_Policy_Problem')
          .select('*')
          .ilike('problem_name', `%${problem.title}%`)
          .single();

        if (error) {
          // If table doesn't exist or no matching data, use fallback content
          console.log('Using fallback content for problem overview');
          setPolicyData(null);
        } else {
          setPolicyData(data);
        }
      } catch (err) {
        console.error('Error fetching policy problem data:', err);
        setError('Unable to load policy data');
      } finally {
        setLoading(false);
      }
    };

    fetchPolicyProblemData();
  }, [problem.title]);

  // Fallback content structure
  const getFallbackContent = () => {
    return {
      description: problem.description || `${problem.title} represents a critical challenge in contemporary policy-making that requires comprehensive legislative attention and community engagement.`,
      impactStatement: `This issue affects millions of Americans and requires coordinated policy responses at federal, state, and local levels to address its multifaceted nature.`,
      currentStatus: `Current legislative efforts are fragmented, with various bills and proposals addressing different aspects of the problem without a comprehensive framework.`,
      keyStakeholders: `Key stakeholders include affected communities, advocacy organizations, government agencies, private sector partners, and academic institutions working on evidence-based solutions.`,
      legislativeHistory: `Previous legislative attempts have yielded mixed results, highlighting the need for more comprehensive and collaborative approaches to policy development.`,
      potentialSolutions: `Emerging solutions include public-private partnerships, community-based interventions, regulatory reforms, and innovative funding mechanisms.`,
      evidenceBase: `Research from leading institutions demonstrates the urgency of this issue and provides data-driven insights for effective policy interventions.`
    };
  };

  const content = policyData || getFallbackContent();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Problem Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
            <div className="h-4 bg-muted rounded w-4/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Problem Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Description Section */}
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Description</h4>
            <p className="text-sm leading-relaxed">
              {policyData?.description || content.description}
            </p>
          </div>

          {/* Impact Statement */}
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Impact Statement</h4>
            <p className="text-sm leading-relaxed">
              {policyData?.impact_statement || content.impactStatement}
            </p>
          </div>

          {/* Current Status */}
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Current Legislative Status</h4>
            <p className="text-sm leading-relaxed">
              {policyData?.current_status || content.currentStatus}
            </p>
          </div>

          {/* Key Stakeholders */}
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Key Stakeholders</h4>
            <p className="text-sm leading-relaxed">
              {policyData?.key_stakeholders || content.keyStakeholders}
            </p>
          </div>

          {/* Legislative History */}
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Legislative History</h4>
            <p className="text-sm leading-relaxed">
              {policyData?.legislative_history || content.legislativeHistory}
            </p>
          </div>

          {/* Potential Solutions */}
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Potential Solutions</h4>
            <p className="text-sm leading-relaxed">
              {policyData?.potential_solutions || content.potentialSolutions}
            </p>
          </div>

          {/* Evidence Base */}
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Evidence & Research</h4>
            <p className="text-sm leading-relaxed">
              {policyData?.evidence_base || content.evidenceBase}
            </p>
          </div>

          {/* If no data from database, show a note */}
          {!policyData && (
            <div className="text-center py-4 border-t">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                This overview uses general policy framework data. 
                Specific legislative details will be available as our policy database expands.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
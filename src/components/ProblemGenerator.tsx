import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lightbulb, Copy, FileText, Target, RotateCcw, ThumbsUp } from "lucide-react";
import { generateProblemFromScenario } from "@/utils/problemStatementHelpers";
import { supabase } from "@/integrations/supabase/client";
import { useModel } from "@/contexts/ModelContext";
import ReactMarkdown from "react-markdown";

interface ProblemStatement {
  id: string;
  content: string;
  timestamp: Date;
  version: number;
}

interface ProblemGeneratorProps {
  onProblemGenerated?: (problem: string) => void;
  onDraftBill?: (problem: string) => void;
}

export const ProblemGenerator = ({ onProblemGenerated, onDraftBill }: ProblemGeneratorProps) => {
  const [scenarioInput, setScenarioInput] = useState("");
  const [problemStatements, setProblemStatements] = useState<ProblemStatement[]>([]);
  const [isGeneratingProblem, setIsGeneratingProblem] = useState(false);
  const { toast } = useToast();
  const { selectedModel } = useModel();

  const generateProblemStatement = async (retryOriginal = false) => {
    if (!scenarioInput.trim()) {
      toast({
        title: "Please enter a scenario",
        description: "Describe a real-life scenario to generate a problem statement",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingProblem(true);
    
    try {
      const prompt = `Based on this real-life scenario, generate a clear, structured problem statement in memo format that identifies issues requiring legislative action:

Scenario: ${scenarioInput}

Please format the response as a professional legislative memo with the following structure:

**MEMORANDUM**

**TO:** Legislative Team
**FROM:** Policy Analysis Division  
**DATE:** [Current Date]
**RE:** Problem Statement Analysis

**EXECUTIVE SUMMARY**
[Brief 2-3 sentence overview of the core issue]

**PROBLEM DEFINITION**
[Clear definition of the specific problem requiring legislative intervention]

**IMPACT ANALYSIS**
[Detailed explanation of how this problem affects society, individuals, and communities]

**CURRENT LEGISLATIVE GAPS**
[Analysis of why existing laws/solutions are inadequate]

**RECOMMENDATION FOR LEGISLATIVE ACTION**
[Justification for why legislative intervention is necessary and the scope needed]

Format it as a professional problem statement suitable for legislative drafting.`;

      const { data, error } = await supabase.functions.invoke('generate-with-openai', {
        body: { prompt, type: 'problem', model: selectedModel, stream: true }
      });

      if (error) {
        throw new Error('Failed to generate problem statement');
      }

      // Create new problem statement with version control
      const generated = data.generatedText || await generateProblemFromScenario(scenarioInput);
      const newStatement: ProblemStatement = {
        id: Date.now().toString(),
        content: generated,
        timestamp: new Date(),
        version: problemStatements.length + 1
      };

      setProblemStatements(prev => [...prev, newStatement]);
      onProblemGenerated?.(generated);

      toast({
        title: "Problem statement generated!",
        description: `Version ${newStatement.version} created successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error generating problem statement",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingProblem(false);
    }
  };

  const copyProblemStatement = async (content: string) => {
    if (!content) return;
    
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied to clipboard!",
        description: "Problem statement has been copied.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleGoodStart = (content: string) => {
    setScenarioInput(content);
    onProblemGenerated?.(content);
    toast({
      title: "Problem statement added to ideation!",
      description: "You can now edit and refine your idea.",
    });
  };

  const handleTryAgain = () => {
    generateProblemStatement(true);
  };

  return (
    <div className="space-y-6">
      {/* Problem Statement Section */}
      <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Lightbulb className="h-6 w-6 text-blue-600" />
            Problem Memo
          </CardTitle>
          <p className="text-gray-600 text-sm">
            Based on your problem statement, develop a comprehensive legislative idea.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Problem Statements Display - Scrollable Area */}
          {problemStatements.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">Generated Problem Statements</Label>
              <ScrollArea className="h-[400px] w-full border rounded-lg">
                <div className="space-y-4 p-4">
                  {problemStatements.map((statement) => (
                    <div key={statement.id} className="bg-gray-900 text-white p-6 rounded-lg relative">
                      <div className="prose prose-sm prose-invert max-w-none">
                        <ReactMarkdown>{statement.content}</ReactMarkdown>
                      </div>
                      
                      {/* Copy Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyProblemStatement(statement.content)}
                        className="absolute top-4 right-4 h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-4 pt-4 border-t border-white/20">
                        <Badge 
                          variant="secondary" 
                          className="cursor-pointer bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleGoodStart(statement.content)}
                        >
                          <ThumbsUp className="w-3 h-3 mr-1" />
                          Good Start
                        </Badge>
                        <Badge 
                          variant="secondary" 
                          className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={handleTryAgain}
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Try Again
                        </Badge>
                      </div>

                      {/* Version Control */}
                      <div className="mt-3 pt-3 border-t border-white/20 text-xs text-white/60">
                        Version {statement.version} • Generated {statement.timestamp.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Default Problem Statement Display (when no generated statements) */}
          {problemStatements.length === 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">Problem Statement</Label>
              <div className="bg-gray-900 text-white p-6 rounded-lg min-h-[200px] relative">
                <div className="prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown>
                    {"**MEMORANDUM**\n\n**TO:** Legislative Team  \n**FROM:** Policy Analysis Division  \n**DATE:** Sample Date  \n**RE:** Student Debt Crisis Analysis\n\n**EXECUTIVE SUMMARY**  \nThe escalating cost of higher education has created a $1.7 trillion student debt crisis affecting 45 million Americans, requiring comprehensive legislative intervention.\n\n**PROBLEM DEFINITION**  \nStudent loan debt has reached unsustainable levels, creating barriers to economic mobility and homeownership for an entire generation of graduates.\n\n**IMPACT ANALYSIS**  \nThis crisis disproportionately affects low- and middle-income families, reduces consumer spending, and increases reliance on social services, creating broader economic instability.\n\n**CURRENT LEGISLATIVE GAPS**  \nExisting federal and state regulations focus primarily on loan availability rather than addressing root causes of rising tuition costs and institutional accountability.\n\n**RECOMMENDATION FOR LEGISLATIVE ACTION**  \nComprehensive legislation is needed to address both education affordability and loan financing mechanisms to ensure equitable access without crippling debt burden."}
                  </ReactMarkdown>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyProblemStatement("Sample problem statement")}
                  className="absolute bottom-4 right-4 h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Ideation Section */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Ideation</Label>
            <Textarea
              placeholder="Enter your idea for legislation or policy here. Be as detailed as possible and include a problem statement."
              value={scenarioInput}
              onChange={(e) => setScenarioInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  generateProblemStatement();
                }
              }}
              className="min-h-[120px] resize-none border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <Button
            onClick={() => generateProblemStatement()}
            disabled={isGeneratingProblem}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white"
          >
            {isGeneratingProblem ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Lightbulb className="mr-2 h-4 w-4" />
                Generate
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
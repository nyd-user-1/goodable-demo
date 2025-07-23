import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronUp, Target, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateProblemFromScenario } from "@/utils/problemStatementHelpers";
import { supabase } from "@/integrations/supabase/client";
import { useModel } from "@/contexts/ModelContext";

interface ProblemSolverSectionProps {
  onProblemGenerated?: (problem: string) => void;
  onDraftBill?: (problem: string) => void;
}

// Define the tab data
const tabs = [{
  id: "question",
  name: "Question",
  title: "Question",
  subtitle: "What is a problem statement?",
  description: "A problem statement is a concise description of an issue that needs to be addressed. It identifies the problem, explains why it matters, and sets the foundation for developing effective legislative solutions. A well-crafted problem statement clearly defines the scope, impact, and urgency of the issue at hand."
}, {
  id: "policy",
  name: "Policy",
  title: "Policy Development",
  subtitle: "Transform problems into policy solutions",
  description: "Convert your problem statement into actionable policy recommendations. This section helps you develop comprehensive legislative frameworks that address the root causes while considering implementation challenges and stakeholder impacts."
}, {
  id: "promote",
  name: "Promote",
  title: "Promote Your Solution",
  subtitle: "Share and advocate for your legislative ideas",
  description: "Learn how to effectively communicate your policy solutions to stakeholders, build coalitions, and advocate for implementation. Develop strategies for public engagement and legislative advocacy."
}];

export const ProblemSolverSection = ({
  onProblemGenerated,
  onDraftBill
}: ProblemSolverSectionProps) => {
  const [activeTab, setActiveTab] = useState("question");
  const [isQuestionExpanded, setIsQuestionExpanded] = useState(false);
  const [isPolicyExpanded, setIsPolicyExpanded] = useState(false);
  const [isPromoteExpanded, setIsPromoteExpanded] = useState(false);
  const [scenarioInput, setScenarioInput] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [isGeneratingProblem, setIsGeneratingProblem] = useState(false);
  const { toast } = useToast();
  const { selectedModel } = useModel();

  const generateProblemStatement = async () => {
    if (!scenarioInput.trim()) {
      toast({
        title: "Please enter a scenario",
        description: "Describe a real-life scenario to generate a problem statement",
        variant: "destructive"
      });
      return;
    }
    setIsGeneratingProblem(true);
    setProblemStatement("");
    try {
      const prompt = `Based on this real-life scenario, generate a clear, structured problem statement that identifies issues requiring legislative action. Focus on the problem, its impact, and why legislation is needed:

Scenario: ${scenarioInput}

Please create a comprehensive problem statement that:
1. Clearly defines the problem
2. Explains the impact on society/individuals
3. Identifies why current solutions are inadequate
4. Justifies the need for legislative intervention
5. Suggests the scope of legislative action needed

Format it as a professional problem statement suitable for legislative drafting.`;
      const { data, error } = await supabase.functions.invoke('generate-with-openai', {
        body: {
          prompt,
          type: 'problem',
          model: selectedModel,
          stream: true
        }
      });
      if (error) {
        throw new Error('Failed to generate problem statement');
      }

      // For now, handle non-streaming response
      const generated = data.generatedText || (await generateProblemFromScenario(scenarioInput));
      setProblemStatement(generated);
      onProblemGenerated?.(generated);
      toast({
        title: "Problem statement generated!",
        description: "Review the statement to use in your legislative idea."
      });
    } catch (error) {
      toast({
        title: "Error generating problem statement",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingProblem(false);
    }
  };

  const handleQuestionBeginClick = () => {
    setIsQuestionExpanded(!isQuestionExpanded);
  };

  const handlePolicyBeginClick = () => {
    setIsPolicyExpanded(!isPolicyExpanded);
  };

  const handlePromoteBeginClick = () => {
    setIsPromoteExpanded(!isPromoteExpanded);
  };

  const currentTab = tabs.find(tab => tab.id === activeTab);

  return (
    <section className="container mx-auto space-y-16 md:px-6 2xl:max-w-[1400px] px-[19px] py-[25px]">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="mb-8 flex justify-center overflow-x-auto">
          <TabsList className="bg-transparent h-fit w-full max-w-2xl justify-normal gap-4 p-0 md:grid-cols-3">
            {tabs.map(tab => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id} 
                className="flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
              >
                <span className="truncate">{tab.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {tabs.map(tab => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-12">
            {/* Tab Content */}
            <div className="bg-white flex flex-col items-center gap-8 rounded-lg p-6 md:flex-row border border-gray-200">
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-semibold">{tab.title}</h3>
                <p className="text-gray-600 mb-3">{tab.subtitle}</p>
                <p className="mb-4 text-gray-700">A problem statement is a concise description of an issue that needs to be addressed. It identifies the problem, explains why it matters, and sets the foundation for developing effective solutions.</p>

                <div className="flex justify-center gap-3 md:justify-start">
                  {tab.id === "question" && (
                    <Button variant="outline" onClick={handleQuestionBeginClick} className="flex items-center gap-2">
                      Begin
                      {isQuestionExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  )}
                  {tab.id === "policy" && (
                    <Button variant="outline" onClick={handlePolicyBeginClick} className="flex items-center gap-2">
                      Begin
                      {isPolicyExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  )}
                  {tab.id === "promote" && (
                    <Button variant="outline" onClick={handlePromoteBeginClick} className="flex items-center gap-2">
                      Begin
                      {isPromoteExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Expandable Problem Input Section - Only for Question tab */}
            {tab.id === "question" && isQuestionExpanded && (
              <Card className="p-6 space-y-4 border-2 border-primary/20">
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold">Describe Your Problem</h4>
                  <p className="text-sm text-muted-foreground">
                    Describe a real-life situation or scenario that illustrates the problem you want to address with legislation.
                  </p>
                  <Textarea 
                    placeholder="Example: Small businesses in our community are struggling with outdated zoning laws that prevent them from operating food trucks in commercial districts, limiting entrepreneurship and access to affordable food options..." 
                    value={scenarioInput} 
                    onChange={e => setScenarioInput(e.target.value)} 
                    className="min-h-[120px] resize-none" 
                    onKeyDown={e => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        generateProblemStatement();
                      }
                    }} 
                  />
                </div>

                <Button onClick={generateProblemStatement} disabled={isGeneratingProblem || !scenarioInput.trim()} className="w-full">
                  {isGeneratingProblem ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Target className="mr-2 h-4 w-4" />
                      Generate Problem Statement
                    </>
                  )}
                </Button>

                {problemStatement && (
                  <div className="space-y-4 mt-6 p-4 bg-background rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Generated</Badge>
                      <h5 className="font-medium">Problem Statement</h5>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                      {problemStatement}
                    </p>
                    <Button onClick={() => onDraftBill?.(problemStatement)} variant="default" className="w-full">
                      Continue to Draft Generation
                    </Button>
                  </div>
                )}
              </Card>
            )}

            {/* Expandable Policy Section */}
            {tab.id === "policy" && isPolicyExpanded && (
              <Card className="p-6 space-y-4 border-2 border-primary/20">
                <Accordion type="single" collapsible>
                  <AccordionItem value="policy-content" className="border-none">
                    <AccordionTrigger className="hover:no-underline py-2">
                      Policy Development Resources
                    </AccordionTrigger>
                    <AccordionContent>
                      <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <h4 className="text-lg font-semibold">Policy Analysis Tools</h4>
                            <p className="text-sm text-muted-foreground">
                              Comprehensive tools for analyzing policy impacts, stakeholder effects, and implementation challenges.
                            </p>
                          </div>
                          <Separator />
                          <div className="space-y-2">
                            <h4 className="text-lg font-semibold">Legislative Drafting</h4>
                            <p className="text-sm text-muted-foreground">
                              Advanced legislative drafting tools with templates, legal language suggestions, and compliance checking.
                            </p>
                          </div>
                          <Separator />
                          <div className="space-y-2">
                            <h4 className="text-lg font-semibold">Impact Assessment</h4>
                            <p className="text-sm text-muted-foreground">
                              Tools for assessing economic, social, and environmental impacts of proposed legislation.
                            </p>
                          </div>
                        </div>
                      </ScrollArea>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <Button disabled className="w-full">
                  Coming Soon
                </Button>
              </Card>
            )}

            {/* Expandable Promote Section */}
            {tab.id === "promote" && isPromoteExpanded && (
              <Card className="p-6 space-y-4 border-2 border-primary/20">
                <Accordion type="single" collapsible>
                  <AccordionItem value="promote-content" className="border-none">
                    <AccordionTrigger className="hover:no-underline py-2">
                      Promotion & Advocacy Resources
                    </AccordionTrigger>
                    <AccordionContent>
                      <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <h4 className="text-lg font-semibold">Stakeholder Outreach</h4>
                            <p className="text-sm text-muted-foreground">
                              Tools for identifying and engaging with key stakeholders, building coalitions, and managing relationships.
                            </p>
                          </div>
                          <Separator />
                          <div className="space-y-2">
                            <h4 className="text-lg font-semibold">Campaign Management</h4>
                            <p className="text-sm text-muted-foreground">
                              Comprehensive campaign tools for organizing advocacy efforts, tracking progress, and managing communications.
                            </p>
                          </div>
                          <Separator />
                          <div className="space-y-2">
                            <h4 className="text-lg font-semibold">Public Engagement</h4>
                            <p className="text-sm text-muted-foreground">
                              Strategies and tools for public education, community outreach, and building grassroots support.
                            </p>
                          </div>
                          <Separator />
                          <div className="space-y-2">
                            <h4 className="text-lg font-semibold">Media & Communications</h4>
                            <p className="text-sm text-muted-foreground">
                              Media kits, press release templates, social media strategies, and communication planning tools.
                            </p>
                          </div>
                        </div>
                      </ScrollArea>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <Button disabled className="w-full">
                  Coming Soon
                </Button>
              </Card>
            )}

            {/* Placeholder content for other tabs when not expanded */}
            {tab.id !== "question" && 
             ((tab.id === "policy" && !isPolicyExpanded) || (tab.id === "promote" && !isPromoteExpanded)) && (
              <div>
                <div className="mb-6 flex items-center gap-4">
                  <h3 className="text-xl font-semibold whitespace-nowrap">
                    {tab.title} Resources
                  </h3>
                  <Separator className="ml-2 flex-grow" />
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                  <Card className="h-full overflow-hidden p-6">
                    <div className="space-y-4">
                      <Badge className="mb-2">Coming Soon</Badge>
                      <h4 className="text-lg font-semibold">
                        Advanced {tab.title} Tools
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        We're developing comprehensive tools and resources for {tab.title.toLowerCase()}. 
                        Stay tuned for powerful features that will help you {tab.title.toLowerCase()} more effectively.
                      </p>
                    </div>
                  </Card>

                  <Card className="h-full overflow-hidden p-6">
                    <div className="space-y-4">
                      <Badge className="mb-2">Coming Soon</Badge>
                      <h4 className="text-lg font-semibold">
                        {tab.title} Templates
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        Access pre-built templates and frameworks designed specifically for {tab.title.toLowerCase()}. 
                        These will help streamline your workflow and ensure best practices.
                      </p>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
};
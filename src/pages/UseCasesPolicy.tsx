import { ChatHeader } from '@/components/ChatHeader';
import { UseCasesTabs } from '@/components/UseCasesTabs';
import FooterSimple from '@/components/marketing/FooterSimple';
import { useNavigate } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

// Sample prompts for policy use cases - topic-focused for exploration
const policyPrompts = [
  {
    title: "Policy Analysis Framework",
    prompt: "What framework should I use to analyze the potential impact of a proposed policy change?"
  },
  {
    title: "Stakeholder Mapping",
    prompt: "How do I identify and map stakeholders who would be affected by a new housing policy?"
  },
  {
    title: "Evidence-Based Policy",
    prompt: "What does evidence-based policymaking look like and how can I apply it to education reform?"
  },
  {
    title: "Policy Implementation",
    prompt: "What are the key factors that determine whether a policy will be successfully implemented?"
  },
  {
    title: "Regulatory Impact Assessment",
    prompt: "How do I conduct a regulatory impact assessment for a proposed environmental regulation?"
  },
  {
    title: "Cost-Benefit Analysis",
    prompt: "How do I perform a cost-benefit analysis for a proposed public health initiative?"
  },
  {
    title: "Policy Evaluation Methods",
    prompt: "What methods can I use to evaluate whether a policy is achieving its intended outcomes?"
  },
  {
    title: "Unintended Consequences",
    prompt: "How can I anticipate and mitigate unintended consequences when designing new policies?"
  },
  {
    title: "Policy Memo Writing",
    prompt: "What's the best structure for writing a policy memo that will be read by busy decision-makers?"
  },
  {
    title: "Building Coalition Support",
    prompt: "How do I build a coalition of support for a policy initiative across different interest groups?"
  },
  {
    title: "Policy Window Timing",
    prompt: "How do I recognize when a policy window is opening and how to take advantage of it?"
  },
  {
    title: "Comparative Policy Analysis",
    prompt: "How can I learn from how other states have addressed similar policy challenges?"
  },
  {
    title: "Public Comment Strategy",
    prompt: "What's the most effective way to participate in a public comment period for proposed regulations?"
  },
  {
    title: "Legislative Strategy",
    prompt: "What strategies work best for moving a policy idea from concept to introduced legislation?"
  },
  {
    title: "Fiscal Impact Analysis",
    prompt: "How do I estimate the fiscal impact of a proposed policy on state and local budgets?"
  },
  {
    title: "Equity Impact Assessment",
    prompt: "How do I assess whether a policy will have equitable outcomes across different communities?"
  },
  {
    title: "Policy Brief Development",
    prompt: "How do I write a compelling policy brief that translates research into actionable recommendations?"
  },
  {
    title: "Advocacy Campaign Planning",
    prompt: "What are the key elements of an effective policy advocacy campaign?"
  },
  {
    title: "Data-Driven Advocacy",
    prompt: "How can I use data effectively to support my policy arguments and recommendations?"
  },
  {
    title: "Policy Feedback Loops",
    prompt: "How do I design policies with built-in feedback mechanisms for continuous improvement?"
  },
  {
    title: "Intergovernmental Coordination",
    prompt: "How do state policies interact with federal and local policies, and how do I navigate that complexity?"
  }
];

const UseCasesPolicy = () => {
  const navigate = useNavigate();

  const handlePromptClick = (prompt: string) => {
    // Navigate to root with the prompt as a URL parameter
    navigate(`/?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header Navigation */}
      <ChatHeader />

      {/* Main Content */}
      <main className="flex-1 pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Chats for policy development
            </h1>

            {/* Tab Navigation */}
            <UseCasesTabs />

            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-4">
              Seasoned public policy experts shared issues from their own experience.
            </p>
            <p className="text-muted-foreground">
              Tap a chat to get started.
            </p>
          </div>

          {/* Prompt Cards - Masonry-style grid */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {policyPrompts.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handlePromptClick(item.prompt)}
                className="group break-inside-avoid bg-muted/30 hover:bg-muted/50 rounded-2xl p-6 cursor-pointer transition-all duration-200"
              >
                <h3 className="font-semibold text-base mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.prompt}
                </p>

                {/* Chat arrow button - renders on hover, expands card height */}
                <div className="h-0 overflow-hidden group-hover:h-auto group-hover:mt-4 transition-all duration-200">
                  <div className="flex justify-end">
                    <div className="w-10 h-10 bg-foreground text-background rounded-full flex items-center justify-center">
                      <ArrowUp className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Attribution Section */}
          <div className="mt-20 pt-8 border-t">
            <p className="text-sm text-muted-foreground text-center max-w-4xl mx-auto leading-relaxed">
              These chats were sourced from practitioners and educators across public policy, government administration, workforce and economic development, human resources, data analytics, artificial intelligence, product development, civic technology, education, organizational change, and strategic operations. Special thanks for their contributions.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <FooterSimple />
    </div>
  );
};

export default UseCasesPolicy;

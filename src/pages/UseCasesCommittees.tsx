import { ChatHeader } from '@/components/ChatHeader';
import { UseCasesTabs } from '@/components/UseCasesTabs';
import FooterSimple from '@/components/marketing/FooterSimple';
import { useNavigate } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

// Sample prompts for committees use cases - topic-focused for exploration
const committeePrompts = [
  {
    title: "Labor Committee Overview",
    prompt: "What issues does the Labor Committee handle and what major legislation is it currently considering?"
  },
  {
    title: "Education Committee Priorities",
    prompt: "What are the current priorities of the Education Committee in New York?"
  },
  {
    title: "Health Committee Focus Areas",
    prompt: "What healthcare issues is the Health Committee currently focused on?"
  },
  {
    title: "Housing Committee Activity",
    prompt: "What housing-related bills is the Housing Committee reviewing this session?"
  },
  {
    title: "Environmental Conservation",
    prompt: "What role does the Environmental Conservation Committee play in climate policy?"
  },
  {
    title: "Ways and Means",
    prompt: "How does the Ways and Means Committee influence the state budget process?"
  },
  {
    title: "Judiciary Committee",
    prompt: "What types of legislation does the Judiciary Committee typically handle?"
  },
  {
    title: "Children and Families",
    prompt: "What childcare and family support issues is the Children and Families Committee working on?"
  },
  {
    title: "Transportation Committee",
    prompt: "What infrastructure and transit issues is the Transportation Committee addressing?"
  },
  {
    title: "Economic Development",
    prompt: "How is the Economic Development Committee supporting job creation and workforce development?"
  },
  {
    title: "Social Services",
    prompt: "What safety net programs is the Social Services Committee focused on strengthening?"
  },
  {
    title: "Aging Committee",
    prompt: "What issues affecting seniors is the Aging Committee prioritizing?"
  },
  {
    title: "Veterans Affairs",
    prompt: "What support programs is the Veterans Affairs Committee working to expand?"
  },
  {
    title: "Small Business",
    prompt: "How is the Small Business Committee helping entrepreneurs and local businesses?"
  },
  {
    title: "Consumer Protection",
    prompt: "What consumer rights issues is the Consumer Protection Committee addressing?"
  },
  {
    title: "Mental Health",
    prompt: "What mental health initiatives is the Mental Health Committee advancing?"
  },
  {
    title: "Higher Education",
    prompt: "What college affordability issues is the Higher Education Committee working on?"
  },
  {
    title: "Local Government",
    prompt: "How does the Local Government Committee support municipalities and county governments?"
  },
  {
    title: "Insurance Committee",
    prompt: "What insurance reform issues is the Insurance Committee considering?"
  },
  {
    title: "Banks Committee",
    prompt: "What financial regulation issues is the Banks Committee focused on?"
  },
  {
    title: "Ethics and Governance",
    prompt: "What government accountability measures is the Ethics Committee considering?"
  }
];

const UseCasesCommittees = () => {
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
              Chats for committee research
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
            {committeePrompts.map((item, idx) => (
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

export default UseCasesCommittees;

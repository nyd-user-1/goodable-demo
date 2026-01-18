import { ChatHeader } from '@/components/ChatHeader';
import FooterSimple from '@/components/marketing/FooterSimple';
import { useNavigate } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

// Sample prompts for bills use cases - topic-focused for exploration and drafting
const billPrompts = [
  {
    title: "AI Consumer Protection",
    prompt: "What can you tell me about efforts to protect consumers from algorithmic discrimination in New York?"
  },
  {
    title: "Childcare Affordability",
    prompt: "What legislative approaches have been proposed to make childcare more affordable for working families in New York?"
  },
  {
    title: "Paid Family Leave",
    prompt: "What can you tell me about efforts to expand paid family leave in New York?"
  },
  {
    title: "Affordable Housing",
    prompt: "What are legislators doing to address the affordable housing crisis in New York?"
  },
  {
    title: "Volunteer Firefighter Recruitment",
    prompt: "What incentives are being considered to help recruit and retain volunteer firefighters and emergency responders?"
  },
  {
    title: "Medicaid Access",
    prompt: "What efforts are underway to reduce barriers to Medicaid services for patients?"
  },
  {
    title: "Minimum Wage",
    prompt: "What's the current state of minimum wage legislation in New York and what changes are being proposed?"
  },
  {
    title: "School Safety",
    prompt: "What measures are being proposed to improve safety around school zones in New York?"
  },
  {
    title: "Rental Assistance",
    prompt: "What programs exist or are being proposed to help New Yorkers facing housing instability?"
  },
  {
    title: "Disability Benefits",
    prompt: "What efforts are underway to strengthen disability benefits for New York workers?"
  },
  {
    title: "Veteran Services",
    prompt: "What initiatives are being considered to improve services and support for veterans in New York?"
  },
  {
    title: "Clean Energy Incentives",
    prompt: "What tax incentives or programs are being proposed to accelerate clean energy adoption in New York?"
  },
  {
    title: "First Responder Safety",
    prompt: "What measures are being considered to improve safety equipment and protections for first responders?"
  },
  {
    title: "Childcare Regulations",
    prompt: "How are childcare licensing regulations being modernized to expand access while maintaining quality?"
  },
  {
    title: "Transportation Funding",
    prompt: "What changes to transportation taxes and fees are being debated in New York?"
  },
  {
    title: "Prenatal Care Access",
    prompt: "What efforts are being made to improve access to prenatal care and testing information for expectant parents?"
  },
  {
    title: "Public Pension Reform",
    prompt: "What changes to public pension and retirement benefits are being considered in New York?"
  },
  {
    title: "Rural Economic Development",
    prompt: "What initiatives are being proposed to support economic development in rural New York communities?"
  },
  {
    title: "Healthcare Coverage",
    prompt: "What mandates are being considered to expand healthcare coverage requirements for insurers in New York?"
  },
  {
    title: "Youth Tobacco Prevention",
    prompt: "What measures are being proposed to reduce youth access to tobacco and vaping products?"
  },
  {
    title: "Arts and Culture Funding",
    prompt: "What programs or tax incentives are being considered to support artists and cultural organizations in New York?"
  },
];

const UseCasesBills = () => {
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
              Chats for legislative research
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-4">
              Seasoned public policy experts shared issues from their own experience.
            </p>
            <p className="text-muted-foreground">
              Tap a chat to get started.
            </p>
          </div>

          {/* Prompt Cards - Masonry-style grid */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {billPrompts.map((item, idx) => (
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

export default UseCasesBills;

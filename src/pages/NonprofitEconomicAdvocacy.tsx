import { ChatHeader } from '@/components/ChatHeader';
import { NonprofitAdvocacyTabs } from '@/components/NonprofitAdvocacyTabs';
import FooterSimple from '@/components/marketing/FooterSimple';
import { useNavigate } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

// Sample prompts for economic advocacy use cases
const economicAdvocacyPrompts = [
  {
    title: "Minimum Wage Legislation",
    prompt: "What bills are being considered to raise the minimum wage in New York, and what would be their economic impact on workers and businesses?"
  },
  {
    title: "Workforce Development Funding",
    prompt: "What funding opportunities and legislation exist to support workforce development and job training programs in New York?"
  },
  {
    title: "Small Business Tax Relief",
    prompt: "What tax relief measures are being proposed for small businesses in New York, and how can nonprofits advocate for them?"
  },
  {
    title: "Affordable Childcare Access",
    prompt: "What legislation is being considered to expand affordable childcare access for working families in New York?"
  },
  {
    title: "Living Wage Campaigns",
    prompt: "How have other states successfully implemented living wage policies, and what lessons can New York advocates learn?"
  },
  {
    title: "Worker Cooperative Support",
    prompt: "What policies and funding programs exist to support worker cooperatives and employee ownership models in New York?"
  },
  {
    title: "Unemployment Insurance Reform",
    prompt: "What changes to unemployment insurance are being proposed in New York, and how would they affect workers?"
  },
  {
    title: "Paid Sick Leave Expansion",
    prompt: "What efforts are underway to expand paid sick leave requirements for New York employers?"
  },
  {
    title: "Economic Development Zones",
    prompt: "How do economic development zones work in New York, and what legislation affects their creation and benefits?"
  },
  {
    title: "Anti-Poverty Programs",
    prompt: "What state-level anti-poverty programs exist in New York, and what legislation could strengthen them?"
  },
  {
    title: "Gig Worker Protections",
    prompt: "What legislation is being considered to provide protections and benefits for gig economy workers in New York?"
  },
  {
    title: "Community Reinvestment",
    prompt: "What community reinvestment requirements apply to banks in New York, and how can nonprofits advocate for stronger provisions?"
  },
  {
    title: "EITC State Supplement",
    prompt: "What is the status of New York's Earned Income Tax Credit supplement, and are there efforts to expand it?"
  },
  {
    title: "Predatory Lending Prevention",
    prompt: "What legislation exists to protect New Yorkers from predatory lending practices, and what gaps remain?"
  },
  {
    title: "Public Benefits Access",
    prompt: "What barriers exist to accessing public benefits in New York, and what legislation could reduce them?"
  },
  {
    title: "Retirement Security",
    prompt: "What state-level retirement security programs exist for workers without employer-sponsored plans in New York?"
  },
  {
    title: "Fair Scheduling Laws",
    prompt: "What fair scheduling or predictive scheduling legislation is being considered in New York?"
  },
  {
    title: "Youth Employment Programs",
    prompt: "What youth employment and summer jobs programs are funded by New York State, and how can they be expanded?"
  },
  {
    title: "Economic Mobility Research",
    prompt: "What does research tell us about economic mobility in New York, and which policies have the strongest evidence base?"
  },
  {
    title: "Nonprofit Wage Standards",
    prompt: "How do government contracts with nonprofits address wage standards for workers, and what reforms are being proposed?"
  },
  {
    title: "Regional Economic Disparities",
    prompt: "What policies address economic disparities between upstate and downstate New York?"
  }
];

const NonprofitEconomicAdvocacy = () => {
  const navigate = useNavigate();

  const handlePromptClick = (prompt: string) => {
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
              Chats for economic advocacy
            </h1>

            {/* Tab Navigation */}
            <NonprofitAdvocacyTabs />

            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-4">
              Research prompts for nonprofits working on economic justice, workforce development, and financial security.
            </p>
            <p className="text-muted-foreground">
              Tap a chat to get started.
            </p>
          </div>

          {/* Prompt Cards - Masonry-style grid */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {economicAdvocacyPrompts.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handlePromptClick(item.prompt)}
                className="group break-inside-avoid bg-muted/30 hover:bg-muted/50 rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg"
              >
                <h3 className="font-semibold text-base mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.prompt}
                </p>

                {/* Chat arrow button - fixed height, opacity toggles on hover */}
                <div className="flex justify-end mt-4">
                  <div className="w-10 h-10 bg-foreground text-background rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <ArrowUp className="h-5 w-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Attribution Section */}
          <div className="mt-20 pt-8 border-t">
            <p className="text-sm text-muted-foreground text-center max-w-4xl mx-auto leading-relaxed">
              These prompts were developed in collaboration with economic justice organizations, workforce development nonprofits, and policy advocates working to expand economic opportunity across New York State.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <FooterSimple />
    </div>
  );
};

export default NonprofitEconomicAdvocacy;

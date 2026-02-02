import { ChatHeader } from '@/components/ChatHeader';
import { NonprofitAdvocacyTabs } from '@/components/NonprofitAdvocacyTabs';
import FooterSimple from '@/components/marketing/FooterSimple';
import { useNavigate } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

// Sample prompts for legal advocacy use cases
const legalAdvocacyPrompts = [
  {
    title: "Criminal Justice Reform",
    prompt: "What criminal justice reform legislation is being considered in New York, and what has been the impact of recent reforms?"
  },
  {
    title: "Bail Reform",
    prompt: "What is the current state of bail reform in New York, and what changes are being proposed?"
  },
  {
    title: "Immigration Legal Services",
    prompt: "What funding and programs exist to support immigration legal services in New York?"
  },
  {
    title: "Tenant Rights Legislation",
    prompt: "What tenant rights protections exist in New York, and what legislation could strengthen them?"
  },
  {
    title: "Expungement and Record Sealing",
    prompt: "What expungement and record sealing options exist in New York, and what legislation could expand access?"
  },
  {
    title: "Civil Legal Aid Funding",
    prompt: "What funding exists for civil legal aid in New York, and what is the unmet need?"
  },
  {
    title: "Police Accountability",
    prompt: "What police accountability legislation exists in New York, and what reforms are being proposed?"
  },
  {
    title: "Voting Rights Protection",
    prompt: "What voting rights legislation is being considered in New York to expand access and protect voters?"
  },
  {
    title: "Domestic Violence Protections",
    prompt: "What legal protections exist for domestic violence survivors in New York, and what gaps remain?"
  },
  {
    title: "LGBTQ+ Legal Protections",
    prompt: "What legal protections exist for LGBTQ+ New Yorkers, and what legislation could strengthen them?"
  },
  {
    title: "Disability Rights",
    prompt: "What disability rights legislation is being considered in New York to improve access and accommodations?"
  },
  {
    title: "Consumer Protection Laws",
    prompt: "What consumer protection laws exist in New York, and what legislation could address emerging issues?"
  },
  {
    title: "Wage Theft Enforcement",
    prompt: "What enforcement mechanisms exist for wage theft in New York, and how effective are they?"
  },
  {
    title: "Solitary Confinement Reform",
    prompt: "What legislation addresses the use of solitary confinement in New York prisons and jails?"
  },
  {
    title: "Public Defender Funding",
    prompt: "What is the state of public defender funding in New York, and what reforms are needed?"
  },
  {
    title: "Juvenile Justice",
    prompt: "What juvenile justice reforms are being considered in New York to improve outcomes for young people?"
  },
  {
    title: "Reentry Support Programs",
    prompt: "What programs and legislation support reentry for formerly incarcerated individuals in New York?"
  },
  {
    title: "Legal Services for Seniors",
    prompt: "What legal services are available for seniors in New York, and what legislation could expand access?"
  },
  {
    title: "Data Privacy Rights",
    prompt: "What data privacy legislation is being considered in New York to protect consumer information?"
  },
  {
    title: "Access to Justice Technology",
    prompt: "How is technology being used to expand access to legal services in New York courts?"
  },
  {
    title: "Parole and Probation Reform",
    prompt: "What parole and probation reforms are being considered in New York?"
  }
];

const NonprofitLegalAdvocacy = () => {
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
              Chats for legal advocacy
            </h1>

            {/* Tab Navigation */}
            <NonprofitAdvocacyTabs />

            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-4">
              Research prompts for nonprofits working on access to justice, civil rights, and criminal justice reform.
            </p>
            <p className="text-muted-foreground">
              Tap a chat to get started.
            </p>
          </div>

          {/* Prompt Cards - Masonry-style grid */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {legalAdvocacyPrompts.map((item, idx) => (
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
              These prompts were developed in collaboration with legal aid organizations, civil rights advocates, and justice reform groups working to expand access to justice across New York State.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <FooterSimple />
    </div>
  );
};

export default NonprofitLegalAdvocacy;

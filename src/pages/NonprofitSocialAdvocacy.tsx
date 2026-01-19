import { ChatHeader } from '@/components/ChatHeader';
import { NonprofitAdvocacyTabs } from '@/components/NonprofitAdvocacyTabs';
import FooterSimple from '@/components/marketing/FooterSimple';
import { useNavigate } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

// Sample prompts for social advocacy use cases
const socialAdvocacyPrompts = [
  {
    title: "Affordable Housing Development",
    prompt: "What legislation supports the development of affordable housing in New York, and what funding mechanisms exist?"
  },
  {
    title: "Homelessness Prevention",
    prompt: "What homelessness prevention programs and legislation exist in New York, and what approaches have been most effective?"
  },
  {
    title: "Food Security Programs",
    prompt: "What food security programs exist in New York, and what legislation could strengthen access to nutrition assistance?"
  },
  {
    title: "Mental Health Services",
    prompt: "What legislation addresses mental health service access and funding in New York?"
  },
  {
    title: "Childcare Accessibility",
    prompt: "What childcare accessibility legislation is being considered to help working families in New York?"
  },
  {
    title: "Elder Care Services",
    prompt: "What elder care programs and legislation exist to support aging New Yorkers?"
  },
  {
    title: "Substance Abuse Treatment",
    prompt: "What substance abuse treatment funding and legislation exists in New York, and what gaps remain?"
  },
  {
    title: "Foster Care Reform",
    prompt: "What foster care reforms are being considered in New York to improve outcomes for children and families?"
  },
  {
    title: "Education Equity",
    prompt: "What legislation addresses educational equity and school funding disparities in New York?"
  },
  {
    title: "Healthcare Access",
    prompt: "What legislation is being considered to expand healthcare access for uninsured and underinsured New Yorkers?"
  },
  {
    title: "Immigrant Services",
    prompt: "What services and protections exist for immigrant communities in New York, and what legislation could expand them?"
  },
  {
    title: "Domestic Violence Services",
    prompt: "What domestic violence services and funding exist in New York, and what legislation could strengthen support?"
  },
  {
    title: "Youth Development Programs",
    prompt: "What youth development programs receive state funding in New York, and how effective are they?"
  },
  {
    title: "Disability Services",
    prompt: "What disability services and supports exist in New York, and what legislation could improve access?"
  },
  {
    title: "Maternal Health",
    prompt: "What legislation addresses maternal health outcomes and disparities in New York?"
  },
  {
    title: "Community Health Centers",
    prompt: "What funding and legislation supports community health centers in New York?"
  },
  {
    title: "Racial Equity Initiatives",
    prompt: "What racial equity legislation is being considered in New York to address systemic disparities?"
  },
  {
    title: "Veterans Services",
    prompt: "What services and programs exist for veterans in New York, and what legislation could expand support?"
  },
  {
    title: "SNAP and WIC Benefits",
    prompt: "What is the status of SNAP and WIC benefits in New York, and what legislation affects eligibility and access?"
  },
  {
    title: "After-School Programs",
    prompt: "What funding exists for after-school programs in New York, and what legislation could expand access?"
  },
  {
    title: "Nonprofit Capacity Building",
    prompt: "What programs and funding exist to help nonprofits build capacity and sustainability in New York?"
  }
];

const NonprofitSocialAdvocacy = () => {
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
              Chats for social advocacy
            </h1>

            {/* Tab Navigation */}
            <NonprofitAdvocacyTabs />

            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-4">
              Research prompts for nonprofits working on health, housing, education, and human services.
            </p>
            <p className="text-muted-foreground">
              Tap a chat to get started.
            </p>
          </div>

          {/* Prompt Cards - Masonry-style grid */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {socialAdvocacyPrompts.map((item, idx) => (
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
              These prompts were developed in collaboration with social service organizations, community advocates, and human services nonprofits working to strengthen the social safety net across New York State.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <FooterSimple />
    </div>
  );
};

export default NonprofitSocialAdvocacy;

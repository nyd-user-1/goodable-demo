import { ChatHeader } from '@/components/ChatHeader';
import { NonprofitAdvocacyTabs } from '@/components/NonprofitAdvocacyTabs';
import FooterSimple from '@/components/marketing/FooterSimple';
import { useNavigate } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

// Sample prompts for environmental advocacy use cases
const environmentalAdvocacyPrompts = [
  {
    title: "Climate Leadership Act",
    prompt: "What are the key provisions of New York's Climate Leadership and Community Protection Act, and how is implementation progressing?"
  },
  {
    title: "Renewable Energy Mandates",
    prompt: "What renewable energy mandates exist in New York, and what legislation could accelerate the transition to clean energy?"
  },
  {
    title: "Environmental Justice",
    prompt: "What environmental justice legislation is being considered in New York to protect overburdened communities?"
  },
  {
    title: "Clean Water Protections",
    prompt: "What legislation protects New York's waterways and drinking water sources, and what gaps exist in current law?"
  },
  {
    title: "Air Quality Standards",
    prompt: "What air quality regulations apply in New York, and what legislation could strengthen protections for communities near pollution sources?"
  },
  {
    title: "Zero Waste Initiatives",
    prompt: "What legislation supports waste reduction, recycling, and composting programs in New York?"
  },
  {
    title: "Electric Vehicle Adoption",
    prompt: "What incentives and mandates exist to promote electric vehicle adoption in New York?"
  },
  {
    title: "Building Decarbonization",
    prompt: "What legislation addresses building emissions and energy efficiency requirements in New York?"
  },
  {
    title: "Pesticide Regulations",
    prompt: "What pesticide regulations exist in New York, and what legislation could reduce harmful chemical exposures?"
  },
  {
    title: "Urban Tree Canopy",
    prompt: "What legislation and programs support urban tree planting and green infrastructure in New York?"
  },
  {
    title: "Wetlands Protection",
    prompt: "What wetlands protection laws exist in New York, and how effective are they at preventing habitat loss?"
  },
  {
    title: "Plastic Bag and Packaging",
    prompt: "What legislation addresses plastic pollution and single-use packaging in New York?"
  },
  {
    title: "Clean Energy Jobs",
    prompt: "What workforce development programs support clean energy job training in New York?"
  },
  {
    title: "Fossil Fuel Divestment",
    prompt: "What legislation addresses fossil fuel divestment by state pension funds and public institutions?"
  },
  {
    title: "Wildlife Corridor Protection",
    prompt: "What legislation protects wildlife corridors and biodiversity in New York?"
  },
  {
    title: "Sustainable Agriculture",
    prompt: "What programs and legislation support sustainable and organic farming practices in New York?"
  },
  {
    title: "Coastal Resilience",
    prompt: "What legislation addresses coastal resilience and sea level rise adaptation in New York?"
  },
  {
    title: "Environmental Permitting",
    prompt: "How does environmental permitting work in New York, and what reforms are being proposed?"
  },
  {
    title: "Green Building Standards",
    prompt: "What green building standards apply to new construction in New York?"
  },
  {
    title: "Superfund Site Cleanup",
    prompt: "What is the status of Superfund site cleanup in New York, and what legislation affects remediation?"
  },
  {
    title: "Community Solar Programs",
    prompt: "How do community solar programs work in New York, and what legislation supports their expansion?"
  }
];

const NonprofitEnvironmentalAdvocacy = () => {
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
              Chats for environmental advocacy
            </h1>

            {/* Tab Navigation */}
            <NonprofitAdvocacyTabs />

            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-4">
              Research prompts for nonprofits working on climate action, conservation, and environmental justice.
            </p>
            <p className="text-muted-foreground">
              Tap a chat to get started.
            </p>
          </div>

          {/* Prompt Cards - Masonry-style grid */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {environmentalAdvocacyPrompts.map((item, idx) => (
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
              These prompts were developed in collaboration with environmental organizations, climate advocates, and conservation groups working to protect New York's natural resources and communities.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <FooterSimple />
    </div>
  );
};

export default NonprofitEnvironmentalAdvocacy;

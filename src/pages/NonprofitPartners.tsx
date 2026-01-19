import { ChatHeader } from '@/components/ChatHeader';
import { NonprofitAdvocacyTabs } from '@/components/NonprofitAdvocacyTabs';
import FooterSimple from '@/components/marketing/FooterSimple';
import { useNavigate } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Featured nonprofit partners organized by category
const partnerCategories = [
  {
    category: "Economic Advocacy",
    description: "Labor markets, inequality, fiscal policy, housing, consumer protection",
    partners: [
      {
        name: "Economic Policy Institute",
        tagline: "National leader on wages, labor economics, and inequality",
        prompt: "Tell me about the Economic Policy Institute's work on wage policy and labor economics. How can I support their research and advocacy efforts?"
      },
      {
        name: "Fiscal Policy Institute",
        tagline: "NY-focused fiscal policy and tax equity research",
        prompt: "What is the Fiscal Policy Institute and how does their research influence New York State budget and tax policy? How can I get involved?"
      },
      {
        name: "Center for Popular Democracy",
        tagline: "Grassroots organizing meets economic and labor policy",
        prompt: "How does the Center for Popular Democracy combine grassroots organizing with economic policy advocacy? What campaigns are they currently running?"
      },
      {
        name: "NYPIRG",
        tagline: "Consumer protection and higher-ed affordability advocacy",
        prompt: "What is NYPIRG's role in New York consumer protection and higher education advocacy? How can students and citizens get involved?"
      },
      {
        name: "Roosevelt Institute",
        tagline: "Reshaping conversations on antitrust and economic democracy",
        prompt: "Tell me about the Roosevelt Institute's work on antitrust policy and economic democracy. How can I support their mission?"
      },
    ]
  },
  {
    category: "Environmental Advocacy",
    description: "Climate, energy, land use, environmental justice",
    partners: [
      {
        name: "Natural Resources Defense Council (NRDC)",
        tagline: "Climate litigation and environmental regulation",
        prompt: "What is NRDC's current work on climate policy and environmental protection? How can I support their legal and advocacy efforts?"
      },
      {
        name: "Environmental Defense Fund (EDF)",
        tagline: "Market-based climate policy and regulatory design",
        prompt: "How does the Environmental Defense Fund approach climate and environmental policy? What are their current priorities and how can I help?"
      },
      {
        name: "Citizens Campaign for the Environment (CCE)",
        tagline: "Influential in NYS environmental legislation",
        prompt: "Tell me about Citizens Campaign for the Environment and their impact on New York environmental legislation. How can I volunteer or donate?"
      },
      {
        name: "WE ACT for Environmental Justice",
        tagline: "Environmental justice and community-driven climate policy",
        prompt: "What is WE ACT for Environmental Justice and how do they advance environmental justice in New York? How can I support their community-driven work?"
      },
      {
        name: "Open Space Institute",
        tagline: "Conservation and land-use policy across the Northeast",
        prompt: "How does the Open Space Institute work to protect land and open spaces in New York and the Northeast? How can I contribute to their mission?"
      },
    ]
  },
  {
    category: "Social Advocacy",
    description: "Civil rights, housing, healthcare, education, justice",
    partners: [
      {
        name: "New York Civil Liberties Union (NYCLU)",
        tagline: "Shaping policy through litigation and legislation",
        prompt: "What civil liberties issues is the NYCLU currently working on? How can I support their legal and advocacy work in New York?"
      },
      {
        name: "The Century Foundation",
        tagline: "Education, healthcare, immigration, and democracy research",
        prompt: "Tell me about The Century Foundation's research and policy work. What are their current priorities and how can I engage with their mission?"
      },
      {
        name: "Community Service Society of New York (CSS)",
        tagline: "Historic institution in social welfare and poverty policy",
        prompt: "What is the Community Service Society of New York and how do they address poverty and social welfare? How can I support their work?"
      },
      {
        name: "United Way NYC",
        tagline: "Education, health, and economic mobility programs",
        prompt: "How does United Way NYC work to improve education, health, and economic mobility? What volunteer and giving opportunities exist?"
      },
      {
        name: "Vera Institute of Justice",
        tagline: "Criminal justice reform and research",
        prompt: "What criminal justice reforms is the Vera Institute advancing? How can I support their research and advocacy for a more just system?"
      },
    ]
  },
  {
    category: "Democracy & Governance",
    description: "Elections, ethics, administrative capacity, civic systems",
    partners: [
      {
        name: "Brennan Center for Justice",
        tagline: "Leading democracy and election-law think tank",
        prompt: "What is the Brennan Center for Justice working on to protect democracy and voting rights? How can I support their mission?"
      },
      {
        name: "Campaign Legal Center",
        tagline: "Campaign finance and ethics reform",
        prompt: "How does the Campaign Legal Center work to improve campaign finance laws and government ethics? How can I get involved?"
      },
      {
        name: "League of Women Voters of New York State",
        tagline: "Election administration and transparency advocacy",
        prompt: "What is the League of Women Voters doing to improve elections in New York? How can I join or support their civic engagement work?"
      },
      {
        name: "Common Cause New York",
        tagline: "Redistricting, ethics reform, and voter access",
        prompt: "Tell me about Common Cause New York's work on redistricting and voting access. How can I volunteer or support their campaigns?"
      },
      {
        name: "Rockefeller Institute of Government",
        tagline: "Research at the intersection of policy and governance",
        prompt: "What research does the Rockefeller Institute of Government conduct on state policy and governance? How can I access their resources and support their work?"
      },
    ]
  }
];

const NonprofitPartners = () => {
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
              Featured nonprofit partners
            </h1>

            {/* Tab Navigation */}
            <NonprofitAdvocacyTabs />

            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-4">
              Leading organizations shaping policy across New York and the nation. Learn how to support their work.
            </p>
            <p className="text-muted-foreground">
              Tap a card to learn more about each organization.
            </p>
          </div>

          {/* Partner Categories */}
          {partnerCategories.map((category) => (
            <div key={category.category} className="mb-16">
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-foreground text-background hover:bg-foreground/90 px-3 py-1">
                  {category.category}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-6">{category.description}</p>

              {/* Partner Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {category.partners.map((partner) => (
                  <div
                    key={partner.name}
                    onClick={() => handlePromptClick(partner.prompt)}
                    className="group bg-muted/30 hover:bg-muted/50 rounded-2xl p-6 cursor-pointer transition-all duration-200 border border-transparent hover:border-blue-200"
                  >
                    <h3 className="font-semibold text-base mb-2 group-hover:text-blue-600 transition-colors">
                      {partner.name}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {partner.tagline}
                    </p>

                    {/* Chat arrow button - renders on hover */}
                    <div className="h-0 overflow-hidden group-hover:h-auto group-hover:mt-4 transition-all duration-200">
                      <div className="flex justify-end">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center">
                          <ArrowUp className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Attribution Section */}
          <div className="mt-20 pt-8 border-t">
            <p className="text-sm text-muted-foreground text-center max-w-4xl mx-auto leading-relaxed">
              These organizations represent some of the most influential voices in policy advocacy across New York State and the nation. We encourage you to explore their work, support their missions, and engage with the causes that matter to you.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <FooterSimple />
    </div>
  );
};

export default NonprofitPartners;

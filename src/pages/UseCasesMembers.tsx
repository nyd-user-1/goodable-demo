import { ChatHeader } from '@/components/ChatHeader';
import FooterSimple from '@/components/marketing/FooterSimple';
import { useNavigate } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

// Sample prompts for members use cases - topic-focused for exploration
const memberPrompts = [
  {
    title: "Find My Representative",
    prompt: "How can I find out who my state legislators are and how to contact them?"
  },
  {
    title: "Assembly Leadership",
    prompt: "Who are the current leaders of the New York State Assembly?"
  },
  {
    title: "Senate Leadership",
    prompt: "Who are the current leaders of the New York State Senate?"
  },
  {
    title: "Committee Chairs",
    prompt: "Who chairs the major committees in the New York legislature?"
  },
  {
    title: "Labor Advocates",
    prompt: "Which legislators are known for championing workers' rights and labor issues?"
  },
  {
    title: "Education Champions",
    prompt: "Which legislators are most active on education policy and school funding?"
  },
  {
    title: "Healthcare Policy Leaders",
    prompt: "Which legislators are leading on healthcare access and reform?"
  },
  {
    title: "Housing Advocates",
    prompt: "Which legislators are focused on affordable housing and tenant protections?"
  },
  {
    title: "Environmental Leaders",
    prompt: "Which legislators are championing climate and environmental legislation?"
  },
  {
    title: "Small Business Supporters",
    prompt: "Which legislators are focused on supporting small businesses and entrepreneurs?"
  },
  {
    title: "Veterans Advocates",
    prompt: "Which legislators are most active on veterans' issues and military families?"
  },
  {
    title: "Senior Citizen Advocates",
    prompt: "Which legislators focus on issues affecting older New Yorkers?"
  },
  {
    title: "Criminal Justice Reform",
    prompt: "Which legislators are leading on criminal justice reform efforts?"
  },
  {
    title: "Technology and Innovation",
    prompt: "Which legislators are focused on technology policy and AI regulation?"
  },
  {
    title: "Rural Representatives",
    prompt: "Which legislators represent rural communities and focus on rural issues?"
  },
  {
    title: "New York City Delegation",
    prompt: "Who represents New York City in the state legislature?"
  },
  {
    title: "Long Island Representatives",
    prompt: "Who are the state legislators representing Long Island?"
  },
  {
    title: "Upstate Representatives",
    prompt: "Who are the key legislators representing Upstate New York?"
  },
  {
    title: "Freshman Legislators",
    prompt: "Who are the newest members of the New York State Legislature?"
  },
  {
    title: "Bipartisan Leaders",
    prompt: "Which legislators are known for working across party lines?"
  },
  {
    title: "Contacting Legislators",
    prompt: "What's the most effective way to contact my state legislators about an issue I care about?"
  }
];

const UseCasesMembers = () => {
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
              Chats for legislator research
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
            {memberPrompts.map((item, idx) => (
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

export default UseCasesMembers;

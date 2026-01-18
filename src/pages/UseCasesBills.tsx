import { ChatHeader } from '@/components/ChatHeader';
import FooterSimple from '@/components/marketing/FooterSimple';
import { useNavigate } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

// Sample prompts for bills use cases
const billPrompts = [
  {
    title: "AI Consumer Protection",
    prompt: "What protections does the NY Artificial Intelligence Consumer Protection Act establish against algorithmic discrimination?"
  },
  {
    title: "Childcare Affordability",
    prompt: "How would Assemblywoman Solages' bill A00405 improve childcare affordability by providing diaper assistance for families receiving safety net support?"
  },
  {
    title: "Paid Family Leave",
    prompt: "Explain the proposed changes to New York's paid family leave program and how they would affect working parents."
  },
  {
    title: "Affordable Housing",
    prompt: "What does the bill requiring municipalities to include an Affordable Housing Needs Assessment in their comprehensive plans actually require?"
  },
  {
    title: "Volunteer Firefighter Benefits",
    prompt: "How would the tax credit for volunteer firefighters and ambulance workers help recruit and retain emergency responders?"
  },
  {
    title: "Medicaid Prior Authorization",
    prompt: "What impact would prohibiting Medicaid service providers from requiring prior authorization have on patient care?"
  },
  {
    title: "Minimum Wage Increase",
    prompt: "What are the key provisions of the current minimum wage increase proposals in the NY legislature?"
  },
  {
    title: "School Safety",
    prompt: "What does the bill requiring school crossing guards on every corner of intersections within school zones aim to accomplish?"
  },
  {
    title: "Rental Assistance",
    prompt: "How would the metered funding for rental assistance bill help New York City residents facing housing instability?"
  },
  {
    title: "Disability Benefits",
    prompt: "Explain the proposal to increase short-term disability benefits and who would be affected."
  },
  {
    title: "Veterans Programs",
    prompt: "What does the bill establishing a program for sharing veteran contact information aim to achieve for veteran services?"
  },
  {
    title: "Clean Energy Tax Exemptions",
    prompt: "How would the exemption from taxation for energy-related public utilities promote clean energy adoption?"
  },
  {
    title: "Public Safety Equipment",
    prompt: "What requirements does the bill about body armor for NYC emergency services personnel establish?"
  },
  {
    title: "Child Day Care Regulations",
    prompt: "How would exempting certain child day care facilities that serve only dependent children affect childcare availability?"
  },
  {
    title: "Highway Use Tax",
    prompt: "What are the implications of repealing provisions relating to the highway use tax?"
  },
  {
    title: "Prenatal Testing Disclosure",
    prompt: "What information must be disclosed about non-invasive prenatal screening under the proposed legislation?"
  },
  {
    title: "Retirement Stipends",
    prompt: "How would the optional retirement stipend of thirty dollars per month benefit retirees?"
  },
  {
    title: "Economic Development",
    prompt: "Explain the St. Lawrence county economic development initiatives in the current legislative session."
  },
  {
    title: "Insurance Coverage",
    prompt: "What services would insurance policies be required to cover under the new healthcare coverage mandates?"
  },
  {
    title: "Tobacco Restrictions",
    prompt: "How would prohibiting the sale of flavored smokeless tobacco within 500 feet of schools protect young people?"
  },
  {
    title: "Arts Space Act",
    prompt: "What tax benefits does the New York City arts space act provide and how would it support the creative community?"
  },
  {
    title: "Motor Vehicle Transparency",
    prompt: "What disclosures about replacement parts would motor vehicle repair shops be required to make under the proposed bill?"
  }
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
              Citizens and policy professionals shared chats they use for understanding bills and legislation.
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
                className="group break-inside-avoid bg-muted/30 hover:bg-muted/50 rounded-2xl p-6 cursor-pointer transition-all duration-200 relative"
              >
                <h3 className="font-semibold text-base mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.prompt}
                </p>

                {/* Chat arrow button - appears on hover */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-10 h-10 bg-foreground text-background rounded-full flex items-center justify-center">
                    <ArrowUp className="h-5 w-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <FooterSimple />
    </div>
  );
};

export default UseCasesBills;

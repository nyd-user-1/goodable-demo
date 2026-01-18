import { ChatHeader } from '@/components/ChatHeader';
import FooterSimple from '@/components/marketing/FooterSimple';
import { useNavigate } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

// Sample prompts for bills use cases
const billPrompts = [
  {
    title: "AI Consumer Protection",
    billNumber: "A00768",
    prompt: "What protections does A00768, the NY Artificial Intelligence Consumer Protection Act, establish against algorithmic discrimination?"
  },
  {
    title: "Childcare Affordability",
    billNumber: "A00405",
    prompt: "How would A00405 improve childcare affordability by providing diaper assistance for families receiving safety net support?"
  },
  {
    title: "Paid Family Leave",
    billNumber: "S02821",
    prompt: "Explain how S02821 proposes to expand New York's paid family leave program and how it would affect working parents."
  },
  {
    title: "Affordable Housing",
    billNumber: "A00027",
    prompt: "What does A00027 requiring municipalities to include an Affordable Housing Needs Assessment in their comprehensive plans actually require?"
  },
  {
    title: "Volunteer Firefighter Benefits",
    billNumber: "A00028",
    prompt: "How would A00028's tax credit for volunteer firefighters and ambulance workers help recruit and retain emergency responders?"
  },
  {
    title: "Medicaid Prior Authorization",
    billNumber: "A00026",
    prompt: "What impact would A00026 prohibiting Medicaid service providers from requiring prior authorization have on patient care?"
  },
  {
    title: "Minimum Wage Increase",
    billNumber: "S01978",
    prompt: "What are the key provisions of S01978 regarding minimum wage increases in New York?"
  },
  {
    title: "School Safety",
    billNumber: "A00081",
    prompt: "What does A00081 requiring school crossing guards on every corner of intersections within school zones aim to accomplish?"
  },
  {
    title: "Rental Assistance",
    billNumber: "A00085",
    prompt: "How would A00085 on metered funding for rental assistance help New York City residents facing housing instability?"
  },
  {
    title: "Disability Benefits",
    billNumber: "A00084",
    prompt: "Explain A00084's proposal to increase short-term disability benefits and who would be affected."
  },
  {
    title: "Veterans Programs",
    billNumber: "A00080",
    prompt: "What does A00080 establishing a program for sharing veteran contact information aim to achieve for veteran services?"
  },
  {
    title: "Clean Energy Tax Exemptions",
    billNumber: "A00042",
    prompt: "How would A00042's exemption from taxation for energy-related public utilities promote clean energy adoption?"
  },
  {
    title: "Public Safety Equipment",
    billNumber: "A00079",
    prompt: "What requirements does A00079 about body armor for NYC emergency services personnel establish?"
  },
  {
    title: "Child Day Care Regulations",
    billNumber: "A00024",
    prompt: "How would A00024 exempting certain child day care facilities that serve only dependent children affect childcare availability?"
  },
  {
    title: "Highway Use Tax",
    billNumber: "A00025",
    prompt: "What are the implications of A00025 repealing provisions relating to the highway use tax?"
  },
  {
    title: "Prenatal Testing Disclosure",
    billNumber: "A00044",
    prompt: "What information must be disclosed about non-invasive prenatal screening under A00044?"
  },
  {
    title: "Retirement Stipends",
    billNumber: "A00045",
    prompt: "How would A00045's optional retirement stipend of thirty dollars per month benefit retirees?"
  },
  {
    title: "Economic Development",
    billNumber: "A00040",
    prompt: "Explain A00040 regarding St. Lawrence county economic development initiatives."
  },
  {
    title: "Insurance Coverage",
    billNumber: "A00021",
    prompt: "What services would insurance policies be required to cover under A00021's healthcare coverage mandates?"
  },
  {
    title: "Tobacco Restrictions",
    billNumber: "A00077",
    prompt: "How would A00077 prohibiting the sale of flavored smokeless tobacco within 500 feet of schools protect young people?"
  },
  {
    title: "Arts Space Act",
    billNumber: "A00050",
    prompt: "What tax benefits does A00050, the New York City arts space act, provide and how would it support the creative community?"
  },
  {
    title: "Motor Vehicle Transparency",
    billNumber: "A00075",
    prompt: "What disclosures about replacement parts would motor vehicle repair shops be required to make under A00075?"
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
        </div>
      </main>

      {/* Footer */}
      <FooterSimple />
    </div>
  );
};

export default UseCasesBills;

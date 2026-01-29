import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, ChevronLeft, PanelLeft, ArrowUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NoteViewSidebar } from '@/components/NoteViewSidebar';
import { EngineSelection } from '@/components/EngineSelection';

// Departments (sorted alphabetically)
export const departmentPrompts = [
  { title: "Department of Agriculture and Markets", slug: "department-of-agriculture-and-markets", prompt: "What does the NYS Department of Agriculture and Markets do to support farming, food safety, and agricultural markets in New York?" },
  { title: "Department of Civil Service", slug: "department-of-civil-service", prompt: "What is the role of the NYS Department of Civil Service in managing the state workforce and civil service examinations?" },
  { title: "Department of Corrections and Community Supervision", slug: "department-of-corrections-and-community-supervision", prompt: "What does the NYS Department of Corrections and Community Supervision oversee regarding incarceration, parole, and reentry programs?" },
  { title: "Department of Economic Development", slug: "department-of-economic-development", prompt: "What does the NYS Department of Economic Development do to promote business growth and job creation across the state?" },
  { title: "Department of Environmental Conservation", slug: "department-of-environmental-conservation", prompt: "What does the NYS Department of Environmental Conservation do to protect natural resources and the environment?" },
  { title: "Department of Family Assistance", slug: "department-of-family-assistance", prompt: "What does the NYS Department of Family Assistance do, including the Office of Children and Family Services and the Office of Temporary and Disability Assistance?" },
  { title: "Department of Financial Services", slug: "department-of-financial-services", prompt: "What is the role of the NYS Department of Financial Services in regulating banking, insurance, and financial products?" },
  { title: "Department of Health", slug: "department-of-health", prompt: "What are the main responsibilities of the New York State Department of Health and how does it serve residents?" },
  { title: "Department of Labor", slug: "department-of-labor", prompt: "What does the New York State Department of Labor do and what services does it provide to workers and employers?" },
  { title: "Department of Law (Office of the Attorney General)", slug: "department-of-law", prompt: "What does the NYS Department of Law and the Office of the Attorney General do to enforce state laws and protect consumers?" },
  { title: "Department of Mental Hygiene", slug: "department-of-mental-hygiene", prompt: "What does the NYS Department of Mental Hygiene oversee, including the Office of Addiction Services and Supports, Office of Mental Health, and Office for People With Developmental Disabilities?" },
  { title: "Department of Motor Vehicles", slug: "department-of-motor-vehicles", prompt: "What services does the NYS DMV provide and how can residents access them?" },
  { title: "Department of Public Service", slug: "department-of-public-service", prompt: "What does the NYS Department of Public Service do to regulate utilities and ensure reliable energy, water, and telecommunications services?" },
  { title: "Department of State", slug: "department-of-state", prompt: "What are the functions of the New York Department of State and what services does it offer?" },
  { title: "Department of Taxation and Finance", slug: "department-of-taxation-and-finance", prompt: "What does the NYS Department of Taxation and Finance handle and how can residents interact with it?" },
  { title: "Education Department", slug: "education-department", prompt: "What role does the New York State Education Department play in K-12 education, higher education, and professional licensing?" },
  { title: "Executive Department", slug: "executive-department", prompt: "What is the NYS Executive Department and what role does it play in the administration of state government under the Governor?" },
  { title: "Office of General Services", slug: "office-of-general-services", prompt: "What services does the NYS Office of General Services provide to support state government operations and facilities?" },
];

// Agencies (sorted alphabetically)
export const agencyPrompts = [
  { title: "Adirondack Park Agency", slug: "adirondack-park-agency", prompt: "What does the Adirondack Park Agency do to manage and protect the Adirondack Park in New York?" },
  { title: "Division of Consumer Protection", slug: "division-of-consumer-protection", prompt: "What does the NYS Division of Consumer Protection do to safeguard consumers and resolve complaints?" },
  { title: "Division of Military and Naval Affairs", slug: "division-of-military-and-naval-affairs", prompt: "What does the NYS Division of Military and Naval Affairs oversee regarding the National Guard and military operations in New York?" },
  { title: "Division of Veterans' Services", slug: "division-of-veterans-services", prompt: "What services does the NYS Division of Veterans' Services provide to military veterans and their families?" },
  { title: "Insurance Fund", slug: "insurance-fund", prompt: "What does the New York State Insurance Fund do and how does it provide workers' compensation and disability benefits?" },
  { title: "New York State Bridge Authority", slug: "nys-bridge-authority-agency", prompt: "What bridges does the New York State Bridge Authority manage and maintain in the Hudson Valley?" },
  { title: "New York State Canal Corporation", slug: "nys-canal-corporation-agency", prompt: "What does the New York State Canal Corporation do to manage and maintain the state canal system?" },
  { title: "Office for the Aging", slug: "office-for-the-aging", prompt: "What services does the NYS Office for the Aging provide to support older New Yorkers and their caregivers?" },
  { title: "Office of Parks, Recreation and Historic Preservation", slug: "office-of-parks-recreation-and-historic-preservation", prompt: "What does the NYS Office of Parks, Recreation and Historic Preservation do to manage state parks and historic sites?" },
  { title: "State Board of Elections", slug: "state-board-of-elections", prompt: "What does the NYS State Board of Elections do to administer elections and enforce campaign finance laws?" },
];

// Authorities (sorted alphabetically)
export const authorityPrompts = [
  { title: "Battery Park City Authority", slug: "battery-park-city-authority", prompt: "What does the Battery Park City Authority manage in Lower Manhattan and what services does it provide?" },
  { title: "Buffalo and Fort Erie Public Bridge Authority", slug: "buffalo-and-fort-erie-public-bridge-authority", prompt: "What does the Buffalo and Fort Erie Public Bridge Authority manage at the Peace Bridge border crossing?" },
  { title: "Dormitory Authority of the State of New York (DASNY)", slug: "dormitory-authority-dasny", prompt: "What does DASNY do to finance and construct public facilities including hospitals, universities, and courts?" },
  { title: "Empire State Development", slug: "empire-state-development", prompt: "What is Empire State Development and how does it promote economic growth and job creation in New York?" },
  { title: "Environmental Facilities Corporation", slug: "environmental-facilities-corporation", prompt: "What does the NYS Environmental Facilities Corporation do to finance water infrastructure and environmental projects?" },
  { title: "Long Island Power Authority", slug: "long-island-power-authority", prompt: "What does the Long Island Power Authority (LIPA) do to provide electric service to Long Island and the Rockaways?" },
  { title: "Long Island Rail Road Company", slug: "long-island-rail-road", prompt: "What services does the Long Island Rail Road provide and how does it serve commuters in the New York metropolitan area?" },
  { title: "Manhattan and Bronx Surface Transit Operating Authority", slug: "manhattan-bronx-surface-transit", prompt: "What does the Manhattan and Bronx Surface Transit Operating Authority manage regarding bus service in Manhattan and the Bronx?" },
  { title: "Metro-North Commuter Railroad Company", slug: "metro-north-commuter-railroad", prompt: "What services does Metro-North Railroad provide and what regions does it serve in the New York metropolitan area?" },
  { title: "Metropolitan Transportation Authority (MTA)", slug: "metropolitan-transportation-authority", prompt: "What is the MTA, how does it serve New York's public transportation needs, and what agencies fall under it?" },
  { title: "MTA Bridges and Tunnels", slug: "mta-bridges-and-tunnels", prompt: "What bridges and tunnels does MTA Bridges and Tunnels (Triborough Bridge and Tunnel Authority) operate in New York City?" },
  { title: "MTA Capital Construction Company", slug: "mta-capital-construction", prompt: "What does the MTA Capital Construction Company do to manage major infrastructure projects for New York's transit system?" },
  { title: "New York City Transit Authority", slug: "new-york-city-transit-authority", prompt: "What does the New York City Transit Authority manage regarding subway and bus service in New York City?" },
  { title: "New York Local Government Assistance Corporation", slug: "new-york-local-government-assistance-corporation", prompt: "What does the New York Local Government Assistance Corporation do to support local governments with financing?" },
  { title: "New York Power Authority", slug: "new-york-power-authority", prompt: "What is the New York Power Authority and how does it generate and distribute low-cost electricity across the state?" },
  { title: "New York Racing Association (NYRA)", slug: "new-york-racing-association", prompt: "What does the New York Racing Association do to manage thoroughbred horse racing at its three New York tracks?" },
  { title: "New York State Bridge Authority", slug: "nys-bridge-authority", prompt: "What bridges does the New York State Bridge Authority manage in the Hudson Valley region?" },
  { title: "New York State Canal Corporation", slug: "nys-canal-corporation", prompt: "What waterways and canal systems does the NYS Canal Corporation manage as a subsidiary of the Thruway Authority?" },
  { title: "New York State Energy Research and Development Authority (NYSERDA)", slug: "nyserda", prompt: "What is NYSERDA and how does it advance clean energy and sustainability in New York?" },
  { title: "New York State Homes and Community Renewal", slug: "nys-homes-and-community-renewal", prompt: "What does NYS Homes and Community Renewal do as the umbrella agency for affordable housing programs?" },
  { title: "New York State Housing Finance Agency", slug: "nys-housing-finance-agency", prompt: "What does the NYS Housing Finance Agency do to finance affordable housing development in New York?" },
  { title: "New York State Thruway Authority", slug: "nys-thruway-authority", prompt: "What does the NYS Thruway Authority manage and how does it maintain New York's highway and canal systems?" },
  { title: "Roosevelt Island Operating Corporation", slug: "roosevelt-island-operating-corporation", prompt: "What services does the Roosevelt Island Operating Corporation provide to residents of Roosevelt Island?" },
  { title: "Roswell Park Cancer Institute Corporation", slug: "roswell-park-cancer-institute", prompt: "What does the Roswell Park Cancer Institute Corporation do as a comprehensive cancer center in Buffalo, New York?" },
  { title: "State of New York Mortgage Agency (SONYMA)", slug: "state-of-new-york-mortgage-agency", prompt: "What does SONYMA do to help New Yorkers achieve homeownership through affordable mortgage programs?" },
  { title: "Staten Island Rapid Transit Operating Authority", slug: "staten-island-rapid-transit", prompt: "What does the Staten Island Rapid Transit Operating Authority manage regarding rail service on Staten Island?" },
  { title: "United Nations Development Corporation", slug: "united-nations-development-corporation", prompt: "What does the United Nations Development Corporation do to support the United Nations headquarters area in New York City?" },
];

// Featured carousel items
const featuredItems = [
  {
    id: 'departments',
    title: 'Explore Departments',
    subtitle: 'Learn about state agencies',
    gradient: 'from-blue-400 to-cyan-300',
    darkGradient: 'dark:from-blue-600 dark:to-cyan-500',
    images: ['/nys-parks.webp', '/nysdot.jpeg'],
  },
  {
    id: 'agencies',
    title: 'Discover Agencies',
    subtitle: 'Specialized state services',
    gradient: 'from-purple-400 to-pink-300',
    darkGradient: 'dark:from-purple-600 dark:to-pink-500',
    images: ['/nyserda-3.jpg', '/mta.jpg'],
  },
  {
    id: 'authorities',
    title: 'Public Authorities',
    subtitle: 'Infrastructure & development',
    gradient: 'from-emerald-400 to-teal-300',
    darkGradient: 'dark:from-emerald-600 dark:to-teal-500',
    images: ['/port-authority.webp', '/nypa.jpg'],
  },
];

const tabs = [
  { id: 'departments', label: 'Departments' },
  { id: 'agencies', label: 'Agencies' },
  { id: 'authorities', label: 'Authorities' },
];

export default function Prompts() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('departments');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('nysgpt_sidebar_open') === 'true';
    }
    return false;
  });
  const [sidebarMounted, setSidebarMounted] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Enable transition after initial mount
  useEffect(() => {
    const timer = setTimeout(() => setSidebarMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Persist sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('nysgpt_sidebar_open', String(leftSidebarOpen));
  }, [leftSidebarOpen]);

  const getPrompts = () => {
    switch (activeTab) {
      case 'agencies':
        return agencyPrompts;
      case 'authorities':
        return authorityPrompts;
      default:
        return departmentPrompts;
    }
  };

  const filteredPrompts = getPrompts().filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePromptClick = (prompt: string) => {
    navigate(`/new-chat?prompt=${encodeURIComponent(prompt)}`);
  };

  const handleFeaturedClick = (item: typeof featuredItems[0]) => {
    setActiveTab(item.id);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredItems.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredItems.length) % featuredItems.length);
  };

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-background">
      {/* Left Sidebar - slides in from off-screen */}
      <div
        className={cn(
          "fixed left-0 top-0 bottom-0 w-[85vw] max-w-sm md:w-64 bg-background border-r z-[60]",
          sidebarMounted && "transition-transform duration-300 ease-in-out",
          leftSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <NoteViewSidebar onClose={() => setLeftSidebarOpen(false)} />
      </div>


      {/* Main Content Container */}
      <div className="h-full p-2 bg-muted/30">
        {/* Inner container - rounded with border */}
        <div className="h-full flex flex-col relative rounded-2xl border bg-background overflow-hidden">
          {/* Header with sidebar toggle and model selector */}
          <div className="flex items-center justify-between px-4 py-3 bg-background flex-shrink-0">
            {/* Left side: Sidebar toggle + NYSgpt button */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
                className={cn("flex-shrink-0", leftSidebarOpen && "bg-muted")}
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
              <button
                onClick={() => navigate('/new-chat')}
                className="hidden sm:inline-flex items-center justify-center h-10 rounded-md px-3 text-foreground hover:bg-muted transition-colors font-semibold text-xl"
              >
                NYSgpt
              </button>
            </div>
            {/* Right side: Model selector */}
            <div className="hidden sm:block">
              <EngineSelection />
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="absolute top-[57px] bottom-0 left-0 right-0 overflow-y-auto">
            <div className="container mx-auto px-4 py-8 max-w-5xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-semibold">Departments</h1>
                  <p className="text-muted-foreground mt-1">
                    Start a conversation
                  </p>
                </div>
                <div className="relative w-64 hidden sm:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search departments"
                    className="pl-9 bg-muted/50 border-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Featured Carousel */}
              <div className="relative mb-8 overflow-hidden rounded-2xl">
                <div
                  ref={carouselRef}
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {featuredItems.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        'min-w-full p-8 bg-gradient-to-br',
                        item.gradient,
                        item.darkGradient
                      )}
                    >
                      <div className="flex items-end justify-between">
                        <div className="flex-1">
                          <h2 className="text-2xl font-semibold text-white mb-2">
                            {item.title}
                          </h2>
                          <p className="text-white/80 mb-6">{item.subtitle}</p>
                          <Button
                            variant="secondary"
                            className="bg-white/90 hover:bg-white text-foreground"
                            onClick={() => handleFeaturedClick(item)}
                          >
                            View
                          </Button>
                        </div>
                        <div className="hidden md:block w-1/2">
                          <div className="flex gap-3 justify-end">
                            <>
                              <div className="w-40 h-48 rounded-xl overflow-hidden shadow-lg shadow-black/20">
                                {item.images[0] ? (
                                  <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-white/10 backdrop-blur" />
                                )}
                              </div>
                              <div className="w-40 h-48 rounded-xl overflow-hidden shadow-lg shadow-black/20 -mt-4">
                                {item.images[1] ? (
                                  <img src={item.images[1]} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-white/10 backdrop-blur" />
                                )}
                              </div>
                            </>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Carousel Navigation */}
                <button
                  onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-white" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="h-5 w-5 text-white" />
                </button>

                {/* Carousel Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {featuredItems.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); setCurrentSlide(idx); }}
                      className={cn(
                        'w-2 h-2 rounded-full transition-colors',
                        currentSlide === idx ? 'bg-white' : 'bg-white/40'
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Mobile Search */}
              <div className="relative mb-4 sm:hidden">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search departments"
                  className="pl-9 bg-muted/50 border-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                      activeTab === tab.id
                        ? 'bg-foreground text-background'
                        : 'bg-muted hover:bg-muted/80 text-foreground'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Prompts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {filteredPrompts.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigate(`/departments/${item.slug}`)}
                    className="group bg-muted/30 hover:bg-muted/50 rounded-2xl p-6 cursor-pointer transition-all duration-200 text-left"
                  >
                    <h3 className="font-semibold text-base">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                      {item.prompt}
                    </p>

                    {/* Expand on hover - up-arrow to send prompt */}
                    <div className="h-0 overflow-hidden group-hover:h-auto group-hover:mt-4 transition-all duration-200">
                      <div className="flex justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePromptClick(item.prompt);
                          }}
                          className="w-10 h-10 bg-foreground text-background rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                          title="Ask AI"
                        >
                          <ArrowUp className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredPrompts.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No results found matching "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

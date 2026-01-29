import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, ChevronLeft, PanelLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NoteViewSidebar } from '@/components/NoteViewSidebar';
import { EngineSelection } from '@/components/EngineSelection';

// Departments prompts
const departmentPrompts = [
  { title: "Department of Labor", prompt: "What does the New York State Department of Labor do and what services does it provide to workers and employers?" },
  { title: "Department of Health", prompt: "What are the main responsibilities of the New York State Department of Health and how does it serve residents?" },
  { title: "Department of Education", prompt: "What role does the New York State Education Department play in K-12 and higher education?" },
  { title: "Department of Transportation", prompt: "What does the New York State Department of Transportation oversee and what major projects is it working on?" },
  { title: "Department of Environmental Conservation", prompt: "What does the NYS Department of Environmental Conservation do to protect natural resources and the environment?" },
  { title: "Department of Financial Services", prompt: "What is the role of the NYS Department of Financial Services in regulating banking and insurance?" },
  { title: "Department of Taxation and Finance", prompt: "What does the NYS Department of Taxation and Finance handle and how can residents interact with it?" },
  { title: "Office of Children and Family Services", prompt: "What services does the NYS Office of Children and Family Services provide to families and children?" },
  { title: "Department of State", prompt: "What are the functions of the New York Department of State and what services does it offer?" },
  { title: "Department of Motor Vehicles", prompt: "What services does the NYS DMV provide and how can residents access them?" },
  { title: "Division of Criminal Justice Services", prompt: "What does the NYS Division of Criminal Justice Services do to support law enforcement and public safety?" },
  { title: "Office of Mental Health", prompt: "What mental health services and programs does the NYS Office of Mental Health provide?" },
];

// Agencies prompts
const agencyPrompts = [
  { title: "Metropolitan Transportation Authority", prompt: "What is the MTA and how does it serve New York's public transportation needs?" },
  { title: "Empire State Development", prompt: "What is Empire State Development and how does it promote economic growth in New York?" },
  { title: "NYSERDA", prompt: "What is NYSERDA and how does it advance clean energy and sustainability in New York?" },
  { title: "Homes and Community Renewal", prompt: "What does NYS Homes and Community Renewal do to support affordable housing?" },
  { title: "Office of General Services", prompt: "What services does the NYS Office of General Services provide to state government operations?" },
  { title: "Department of Civil Service", prompt: "What is the role of the NYS Department of Civil Service in managing the state workforce?" },
  { title: "Office of Information Technology Services", prompt: "What does NYS ITS do to support technology infrastructure across state government?" },
  { title: "Gaming Commission", prompt: "What does the NYS Gaming Commission regulate and oversee?" },
  { title: "Liquor Authority", prompt: "What does the NYS State Liquor Authority regulate and how can businesses interact with it?" },
  { title: "Division of Homeland Security", prompt: "What is the role of the NYS Division of Homeland Security and Emergency Services?" },
  { title: "Office of Temporary and Disability Assistance", prompt: "What public assistance programs does OTDA administer for New Yorkers in need?" },
  { title: "Workers' Compensation Board", prompt: "What does the NYS Workers' Compensation Board do and how does it help injured workers?" },
];

// Authorities prompts
const authorityPrompts = [
  { title: "Port Authority of NY & NJ", prompt: "What does the Port Authority of New York and New Jersey oversee and what major infrastructure does it manage?" },
  { title: "Thruway Authority", prompt: "What does the NYS Thruway Authority manage and how does it maintain New York's highway system?" },
  { title: "Power Authority (NYPA)", prompt: "What is the New York Power Authority and how does it generate and distribute electricity in the state?" },
  { title: "Dormitory Authority (DASNY)", prompt: "What does the Dormitory Authority of the State of New York do to finance public facilities?" },
  { title: "Environmental Facilities Corporation", prompt: "What does the NYS Environmental Facilities Corporation do to finance water infrastructure projects?" },
  { title: "Bridge Authority", prompt: "What bridges does the New York State Bridge Authority manage in the Hudson Valley region?" },
  { title: "Olympic Regional Development Authority", prompt: "What does ORDA do to manage Olympic venues and promote tourism in the Adirondacks?" },
  { title: "Battery Park City Authority", prompt: "What does the Battery Park City Authority manage in Lower Manhattan?" },
  { title: "Roosevelt Island Operating Corporation", prompt: "What services does the Roosevelt Island Operating Corporation provide to residents?" },
  { title: "Canal Corporation", prompt: "What waterways does the NYS Canal Corporation manage and maintain?" },
  { title: "Energy Research and Development Authority", prompt: "How does NYSERDA support clean energy innovation and research in New York?" },
  { title: "Urban Development Corporation", prompt: "What role does the NYS Urban Development Corporation play in revitalizing communities?" },
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
    images: [] as string[],
  },
  {
    id: 'authorities',
    title: 'Public Authorities',
    subtitle: 'Infrastructure & development',
    gradient: 'from-emerald-400 to-teal-300',
    darkGradient: 'dark:from-emerald-600 dark:to-teal-500',
    images: [] as string[],
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
                  <h1 className="text-3xl font-semibold">Prompts</h1>
                  <p className="text-muted-foreground mt-1">
                    Start a conversation with sample prompts
                  </p>
                </div>
                <div className="relative w-64 hidden sm:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search prompts"
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
                      <div className="flex items-start justify-between">
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
                            {item.images.length > 0 ? (
                              <>
                                <div className="w-40 h-48 rounded-xl overflow-hidden">
                                  <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="w-40 h-48 rounded-xl overflow-hidden -mt-4">
                                  <img src={item.images[1]} alt="" className="w-full h-full object-cover" />
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="w-40 h-48 rounded-xl bg-white/10 backdrop-blur" />
                                <div className="w-40 h-48 rounded-xl bg-white/10 backdrop-blur -mt-4" />
                              </>
                            )}
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
                  placeholder="Search prompts"
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
                  <button
                    key={idx}
                    onClick={() => handlePromptClick(item.prompt)}
                    className="group flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{item.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {item.prompt}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </button>
                ))}
              </div>

              {filteredPrompts.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No prompts found matching "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

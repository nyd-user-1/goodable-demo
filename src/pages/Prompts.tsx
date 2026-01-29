import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, ChevronLeft, ScrollText, Landmark, Users, PanelLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NoteViewSidebar } from '@/components/NoteViewSidebar';
import { EngineSelection } from '@/components/EngineSelection';

// Bills prompts
const billPrompts = [
  { title: "AI Consumer Protection", prompt: "What can you tell me about efforts to protect consumers from algorithmic discrimination in New York?" },
  { title: "Childcare Affordability", prompt: "What legislative approaches have been proposed to make childcare more affordable for working families in New York?" },
  { title: "Paid Family Leave", prompt: "What can you tell me about efforts to expand paid family leave in New York?" },
  { title: "Affordable Housing", prompt: "What are legislators doing to address the affordable housing crisis in New York?" },
  { title: "Volunteer Firefighter Recruitment", prompt: "What incentives are being considered to help recruit and retain volunteer firefighters and emergency responders?" },
  { title: "Medicaid Access", prompt: "What efforts are underway to reduce barriers to Medicaid services for patients?" },
  { title: "Minimum Wage", prompt: "What's the current state of minimum wage legislation in New York and what changes are being proposed?" },
  { title: "School Safety", prompt: "What measures are being proposed to improve safety around school zones in New York?" },
  { title: "Rental Assistance", prompt: "What programs exist or are being proposed to help New Yorkers facing housing instability?" },
  { title: "Disability Benefits", prompt: "What efforts are underway to strengthen disability benefits for New York workers?" },
  { title: "Veteran Services", prompt: "What initiatives are being considered to improve services and support for veterans in New York?" },
  { title: "Clean Energy Incentives", prompt: "What tax incentives or programs are being proposed to accelerate clean energy adoption in New York?" },
];

// Committee prompts
const committeePrompts = [
  { title: "Labor Committee Overview", prompt: "What issues does the Labor Committee handle and what major legislation is it currently considering?" },
  { title: "Education Committee Priorities", prompt: "What are the current priorities of the Education Committee in New York?" },
  { title: "Health Committee Focus Areas", prompt: "What healthcare issues is the Health Committee currently focused on?" },
  { title: "Housing Committee Activity", prompt: "What housing-related bills is the Housing Committee reviewing this session?" },
  { title: "Environmental Conservation", prompt: "What role does the Environmental Conservation Committee play in climate policy?" },
  { title: "Ways and Means", prompt: "How does the Ways and Means Committee influence the state budget process?" },
  { title: "Judiciary Committee", prompt: "What types of legislation does the Judiciary Committee typically handle?" },
  { title: "Children and Families", prompt: "What childcare and family support issues is the Children and Families Committee working on?" },
  { title: "Transportation Committee", prompt: "What infrastructure and transit issues is the Transportation Committee addressing?" },
  { title: "Economic Development", prompt: "How is the Economic Development Committee supporting job creation and workforce development?" },
  { title: "Social Services", prompt: "What safety net programs is the Social Services Committee focused on strengthening?" },
  { title: "Mental Health", prompt: "What mental health initiatives is the Mental Health Committee advancing?" },
];

// Member prompts
const memberPrompts = [
  { title: "Find My Representative", prompt: "How can I find out who my state legislators are and how to contact them?" },
  { title: "Assembly Leadership", prompt: "Who are the current leaders of the New York State Assembly?" },
  { title: "Senate Leadership", prompt: "Who are the current leaders of the New York State Senate?" },
  { title: "Committee Chairs", prompt: "Who chairs the major committees in the New York legislature?" },
  { title: "Labor Advocates", prompt: "Which legislators are known for championing workers' rights and labor issues?" },
  { title: "Education Champions", prompt: "Which legislators are most active on education policy and school funding?" },
  { title: "Healthcare Policy Leaders", prompt: "Which legislators are leading on healthcare access and reform?" },
  { title: "Housing Advocates", prompt: "Which legislators are focused on affordable housing and tenant protections?" },
  { title: "Environmental Leaders", prompt: "Which legislators are championing climate and environmental legislation?" },
  { title: "Small Business Supporters", prompt: "Which legislators are focused on supporting small businesses and entrepreneurs?" },
  { title: "Veterans Advocates", prompt: "Which legislators are most active on veterans' issues and military families?" },
  { title: "Criminal Justice Reform", prompt: "Which legislators are leading on criminal justice reform efforts?" },
];

// Featured carousel items
const featuredItems = [
  {
    id: 'bills',
    icon: ScrollText,
    title: 'Research Bills',
    subtitle: 'Explore active legislation',
    gradient: 'from-blue-400 to-cyan-300',
    darkGradient: 'dark:from-blue-600 dark:to-cyan-500',
    prompt: 'What are the most significant bills being debated in New York this session?',
  },
  {
    id: 'committees',
    icon: Landmark,
    title: 'Explore Committees',
    subtitle: 'Understand legislative bodies',
    gradient: 'from-purple-400 to-pink-300',
    darkGradient: 'dark:from-purple-600 dark:to-pink-500',
    prompt: 'Which committees are most active in shaping policy this session?',
  },
  {
    id: 'members',
    icon: Users,
    title: 'Find Legislators',
    subtitle: 'Connect with representatives',
    gradient: 'from-emerald-400 to-teal-300',
    darkGradient: 'dark:from-emerald-600 dark:to-teal-500',
    prompt: 'Who are the key legislators to watch in New York?',
  },
];

const tabs = [
  { id: 'bills', label: 'Bills', icon: ScrollText },
  { id: 'committees', label: 'Committees', icon: Landmark },
  { id: 'members', label: 'Members', icon: Users },
];

export default function Prompts() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bills');
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
      case 'committees':
        return committeePrompts;
      case 'members':
        return memberPrompts;
      default:
        return billPrompts;
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
    handlePromptClick(item.prompt);
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

  const getIcon = () => {
    switch (activeTab) {
      case 'committees':
        return Landmark;
      case 'members':
        return Users;
      default:
        return ScrollText;
    }
  };

  const Icon = getIcon();

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

      {/* Backdrop overlay when sidebar is open */}
      {leftSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-[55] transition-opacity"
          onClick={() => setLeftSidebarOpen(false)}
        />
      )}

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
                        'min-w-full p-8 cursor-pointer bg-gradient-to-br',
                        item.gradient,
                        item.darkGradient
                      )}
                      onClick={() => handleFeaturedClick(item)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center mb-4">
                            <item.icon className="h-6 w-6 text-white" />
                          </div>
                          <h2 className="text-2xl font-semibold text-white mb-2">
                            {item.title}
                          </h2>
                          <p className="text-white/80 mb-6">{item.subtitle}</p>
                          <Button
                            variant="secondary"
                            className="bg-white/90 hover:bg-white text-foreground"
                          >
                            View
                          </Button>
                        </div>
                        <div className="hidden md:block w-1/2">
                          {/* Placeholder for gallery images */}
                          <div className="flex gap-3 justify-end">
                            <div className="w-40 h-48 rounded-xl bg-white/10 backdrop-blur" />
                            <div className="w-40 h-48 rounded-xl bg-white/10 backdrop-blur -mt-4" />
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
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
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

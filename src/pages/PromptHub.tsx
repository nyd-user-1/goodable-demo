import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChatHeader } from '@/components/ChatHeader';
import FooterSimple from '@/components/marketing/FooterSimple';
import { cn } from '@/lib/utils';
import {
  ArrowUp, ThumbsUp, ThumbsDown, ChevronUp, Flame,
  Award, ExternalLink, Sparkles, Users, FileText, DollarSign,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ---------------------------------------------------------------------------
// Curated prompts from across the platform, categorized for the hub
// ---------------------------------------------------------------------------

interface HubPrompt {
  id: string;
  title: string;
  prompt: string;
  category: string;
  upvotes: number;
  context?: string;
  image?: string;
}

const hubPrompts: HubPrompt[] = [
  // Featured
  {
    id: 'featured-1',
    title: 'Special NYC elections 2026',
    prompt: "Summarize 'Special NYC elections 2026' by Spectrum News NY1",
    context: 'fetchUrl:https://ny1.com/nyc/queens/politics/2026/02/04/special-nyc-elections-2026--manhattan--queens-districts',
    category: 'Featured',
    upvotes: 88,
    image: '/spectrum-news-1.avif',
  },
  {
    id: 'featured-2',
    title: "Queens voters head to the polls for Assembly District 36 special election to fill Mamdani's old seat",
    prompt: "Summarize 'Queens voters head to the polls for Assembly District 36 special election' by QNS",
    context: 'fetchUrl:https://qns.com/2026/02/voters-polls-district-36-special-election/',
    category: 'Featured',
    upvotes: 85,
    image: '/qns-logo.png',
  },
  {
    id: 'featured-3',
    title: "Kathy Hochul's Chances of Being Defeated by Trump Ally Bruce Blakeman",
    prompt: "Summarize 'Kathy Hochul's Chances of Being Defeated by Trump Ally Bruce Blakeman' by Newsweek",
    context: 'fetchUrl:https://www.newsweek.com/kathy-hochul-chances-defeated-bruce-blakeman-poll-11459862',
    category: 'Featured',
    upvotes: 82,
    image: '/newsweek-logo.png',
  },
  {
    id: 'featured-4',
    title: 'Hochul – With Her Best Ever Favorability Rating, 49-40% – Continues to Hold Commanding Leads Over Blakeman (54-28%) & Among Dems, Delgado (64-11%)',
    prompt: "Summarize 'Hochul continues to hold commanding leads over Blakeman and Delgado' by Siena Research Institute",
    context: 'fetchUrl:https://sri.siena.edu/2026/02/03/hochul-with-her-best-ever-favorability-rating-49-40-continues-to-hold-commanding-leads-over-blakeman-54-28-among-dems-delgado-64-11/',
    category: 'Featured',
    upvotes: 78,
    image: '/sri-logo.png',
  },
  {
    id: 'featured-5',
    title: 'Cabán & Nurse Lead Progressive Caucus',
    prompt: "Summarize 'Cabán and Nurse will lead NYC Council Progressive Caucus' by City & State NY",
    context: 'fetchUrl:https://www.cityandstateny.com/politics/2026/02/caban-and-nurse-will-lead-nyc-council-progressive-caucus/411130/',
    category: 'Featured',
    upvotes: 74,
    image: '/city-and-state.png',
  },
  {
    id: 'featured-6',
    title: "Turnout low ahead of special election to fill Mamdani's old seat",
    prompt: "Summarize 'Turnout low ahead of special election to fill Mamdani's old seat' by Queens Daily Eagle",
    context: 'fetchUrl:https://queenseagle.com/all/2026/2/2/turnout-low-ahead-of-special-election-to-fill-mamdanis-old-seat',
    category: 'Featured',
    upvotes: 71,
    image: '/queens-eagle-logo.png',
  },
  {
    id: 'featured-7',
    title: 'Nassau County Executive Blakeman defies state plan to end ICE cooperation',
    prompt: "Summarize 'Nassau County Executive Blakeman defies state plan to end ICE cooperation' by News10",
    context: 'fetchUrl:https://www.news10.com/news/nassau-executive-fights-state-plan-to-end-ice-cooperation/',
    category: 'Featured',
    upvotes: 68,
    image: '/news10-logo.png',
  },
  {
    id: 'featured-8',
    title: 'Snow Much to Scoop',
    prompt: "Summarize 'Snow Much to Scoop: Powder and Politics' by In The Room Media",
    context: 'fetchUrl:https://intheroommedia.com/2026/01/26/snow-much-to-scoop-powder-and-politics/',
    category: 'Featured',
    upvotes: 65,
    image: '/intr-profile.png',
  },
  // Bills
  { id: 'b1', title: 'AI Consumer Protection', prompt: 'What can you tell me about efforts to protect consumers from algorithmic discrimination in New York?', category: 'Bills', upvotes: 47 },
  { id: 'b2', title: 'Childcare Affordability', prompt: 'What legislative approaches have been proposed to make childcare more affordable for working families in New York?', category: 'Bills', upvotes: 38 },
  { id: 'b3', title: 'Paid Family Leave', prompt: 'What can you tell me about efforts to expand paid family leave in New York?', category: 'Bills', upvotes: 35 },
  { id: 'b4', title: 'Affordable Housing', prompt: 'What are legislators doing to address the affordable housing crisis in New York?', category: 'Bills', upvotes: 52 },
  { id: 'b5', title: 'Minimum Wage', prompt: "What's the current state of minimum wage legislation in New York and what changes are being proposed?", category: 'Bills', upvotes: 44 },
  { id: 'b6', title: 'Clean Energy Incentives', prompt: 'What tax incentives or programs are being proposed to accelerate clean energy adoption in New York?', category: 'Bills', upvotes: 31 },
  { id: 'b7', title: 'School Safety', prompt: 'What measures are being proposed to improve safety around school zones in New York?', category: 'Bills', upvotes: 29 },
  { id: 'b8', title: 'Veteran Services', prompt: 'What initiatives are being considered to improve services and support for veterans in New York?', category: 'Bills', upvotes: 26 },
  // Policy
  { id: 'p1', title: 'Policy Analysis Framework', prompt: 'What framework should I use to analyze the potential impact of a proposed policy change?', category: 'Policy', upvotes: 63 },
  { id: 'p2', title: 'Stakeholder Mapping', prompt: 'How do I identify and map stakeholders who would be affected by a new housing policy?', category: 'Policy', upvotes: 41 },
  { id: 'p3', title: 'Evidence-Based Policy', prompt: 'What does evidence-based policymaking look like and how can I apply it to education reform?', category: 'Policy', upvotes: 55 },
  { id: 'p4', title: 'Cost-Benefit Analysis', prompt: 'How do I perform a cost-benefit analysis for a proposed public health initiative?', category: 'Policy', upvotes: 37 },
  { id: 'p5', title: 'Building Coalition Support', prompt: 'How do I build a coalition of support for a policy initiative across different interest groups?', category: 'Policy', upvotes: 33 },
  { id: 'p6', title: 'Legislative Strategy', prompt: 'What strategies work best for moving a policy idea from concept to introduced legislation?', category: 'Policy', upvotes: 48 },
  // Advocacy
  { id: 'a1', title: 'Climate Leadership Act', prompt: "What are the key provisions of New York's Climate Leadership and Community Protection Act, and how is implementation progressing?", category: 'Advocacy', upvotes: 58 },
  { id: 'a2', title: 'Environmental Justice', prompt: 'What environmental justice legislation is being considered in New York to protect overburdened communities?', category: 'Advocacy', upvotes: 42 },
  { id: 'a3', title: 'Workforce Development', prompt: 'What funding opportunities and legislation exist to support workforce development and job training programs in New York?', category: 'Advocacy', upvotes: 36 },
  { id: 'a4', title: 'Gig Worker Protections', prompt: 'What legislation is being considered to provide protections and benefits for gig economy workers in New York?', category: 'Advocacy', upvotes: 39 },
  { id: 'a5', title: 'Renewable Energy Mandates', prompt: 'What renewable energy mandates exist in New York, and what legislation could accelerate the transition to clean energy?', category: 'Advocacy', upvotes: 45 },
  { id: 'a6', title: 'Anti-Poverty Programs', prompt: 'What state-level anti-poverty programs exist in New York, and what legislation could strengthen them?', category: 'Advocacy', upvotes: 30 },
  // Use Case
  { id: 'u1', title: 'Policy Memo Writing', prompt: "What's the best structure for writing a policy memo that will be read by busy decision-makers?", category: 'Use Case', upvotes: 71 },
  { id: 'u2', title: 'Data-Driven Advocacy', prompt: 'How can I use data effectively to support my policy arguments and recommendations?', category: 'Use Case', upvotes: 54 },
  { id: 'u3', title: 'Equity Impact Assessment', prompt: 'How do I assess whether a policy will have equitable outcomes across different communities?', category: 'Use Case', upvotes: 46 },
  { id: 'u4', title: 'Public Comment Strategy', prompt: "What's the most effective way to participate in a public comment period for proposed regulations?", category: 'Use Case', upvotes: 32 },
  // Departments
  { id: 'd1', title: 'DOH Public Health', prompt: 'What public health initiatives is the NYS Department of Health currently prioritizing, and what legislation supports them?', category: 'Departments', upvotes: 45 },
  { id: 'd2', title: 'NYSERDA Clean Energy', prompt: 'What clean energy programs is NYSERDA currently funding, and what are the latest results?', category: 'Departments', upvotes: 43 },
  { id: 'd3', title: 'DOT Infrastructure', prompt: 'What infrastructure projects is the NYS Department of Transportation currently managing, and what is the funding status?', category: 'Departments', upvotes: 40 },
  { id: 'd4', title: 'DEC Environmental Oversight', prompt: 'What environmental enforcement actions has the NYS Department of Environmental Conservation taken recently?', category: 'Departments', upvotes: 38 },
  { id: 'd5', title: 'SED Education Standards', prompt: 'What changes is the NYS State Education Department making to curriculum standards and teacher certification?', category: 'Departments', upvotes: 36 },
  { id: 'd6', title: 'DMV Services Modernization', prompt: 'What services does the NYS Department of Motor Vehicles provide, and what modernization efforts are underway?', category: 'Departments', upvotes: 34 },
  { id: 'd7', title: 'DOL Workforce Programs', prompt: 'What workforce development programs does the NYS Department of Labor offer, and how effective have they been?', category: 'Departments', upvotes: 31 },
  { id: 'd8', title: 'DOCCS Reform Efforts', prompt: 'What reforms are being proposed for the NYS Department of Corrections and Community Supervision?', category: 'Departments', upvotes: 28 },
];

// Category tag colors
const categoryColors: Record<string, string> = {
  Featured: 'bg-rose-100 text-rose-700',
  Bills: 'bg-blue-100 text-blue-700',
  Policy: 'bg-emerald-100 text-emerald-700',
  Advocacy: 'bg-purple-100 text-purple-700',
  Departments: 'bg-yellow-100 text-yellow-700',
  'Use Case': 'bg-amber-100 text-amber-700',
};

// Featured category cards (gradient image placeholders)
const featuredCards = [
  { title: 'Bill Research', subtitle: 'Explore legislation', gradient: 'from-blue-400 to-cyan-300', category: 'Bills' },
  { title: 'Policy', subtitle: 'Frameworks & analysis', gradient: 'from-emerald-400 to-teal-300', category: 'Policy' },
  { title: 'Advocacy', subtitle: 'Nonprofit', gradient: 'from-purple-400 to-pink-300', category: 'Advocacy' },
  { title: 'Departments', subtitle: '100+ state entities', gradient: 'from-yellow-300 via-amber-400 to-amber-600', category: 'Departments' },
];

// Budget explorer items for bottom section (14 functional categories)
const budgetItems = [
  { name: 'Health', amount: '$96.7B', change: '+4.1%', share: '38.3%' },
  { name: 'Social Welfare', amount: '$42.3B', change: '+5.3%', share: '16.8%' },
  { name: 'Education', amount: '$37.8B', change: '+3.2%', share: '15.0%' },
  { name: 'Capital Projects', amount: '$15.7B', change: '+6.2%', share: '6.2%' },
  { name: 'Transportation', amount: '$14.2B', change: '+2.8%', share: '5.6%' },
  { name: 'Mental Hygiene', amount: '$12.9B', change: '+3.7%', share: '5.1%' },
  { name: 'General Government', amount: '$11.4B', change: '+2.1%', share: '4.5%' },
  { name: 'Higher Education', amount: '$9.4B', change: '+1.8%', share: '3.7%' },
  { name: 'Debt Service', amount: '$8.6B', change: '+0.9%', share: '3.4%' },
  { name: 'Public Safety', amount: '$8.1B', change: '+1.9%', share: '3.2%' },
  { name: 'Local Gov Assistance', amount: '$7.3B', change: '+2.4%', share: '2.9%' },
  { name: 'Economic Development', amount: '$6.8B', change: '+3.5%', share: '2.7%' },
  { name: 'Environment & Parks', amount: '$5.2B', change: '+4.6%', share: '2.1%' },
  { name: 'All Other', amount: '$3.9B', change: '+1.2%', share: '1.5%' },
];

// Policy stories for the right sidebar
const policyItems = [
  {
    id: 'policy-1',
    title: 'U.S. court again rules an offshore wind project can resume construction',
    prompt: "Summarize 'U.S. court again rules an offshore wind project can resume construction' by CNBC",
    context: 'fetchUrl:https://www.cnbc.com/2026/02/02/us-court-again-rules-an-offshore-wind-project-can-resume-construction.html',
    chats: 56,
    image: '/cnbc-logo.avif',
  },
  {
    id: 'policy-2',
    title: 'Touting Economic Benefits of Wind Power',
    prompt: "Summarize 'Touting Economic Benefits of Wind Power' by The East Hampton Star",
    context: 'fetchUrl:https://www.easthamptonstar.com/government/20251127/touting-economic-benefits-wind-power',
    chats: 49,
    logos: [
      { image: '/lifed.avif', url: 'https://longislandfed.org/', title: 'Long Island Federation', rounded: true },
      { image: '/cce-logo.avif', url: 'https://www.citizenscampaign.org/', title: 'Citizens Campaign for the Environment' },
    ],
  },
  {
    id: 'policy-3',
    title: 'New York lawmakers want to keep AI out of news',
    prompt: "Summarize 'New York lawmakers want to keep AI out of news' by City & State NY",
    context: 'fetchUrl:https://www.cityandstateny.com/policy/2026/02/new-york-lawmakers-want-keep-ai-out-news/411111/?oref=csny-homepage-river',
    chats: 44,
    image: '/cns-logo.avif',
  },
  {
    id: 'policy-4',
    title: 'State Sen. Shelley Mayer proposes bill to prohibit ICE from gaining access to schools',
    prompt: "Summarize 'State Sen. Shelley Mayer proposes bill to prohibit ICE from gaining access to schools' by NY State of Politics",
    context: 'fetchUrl:https://nystateofpolitics.com/state-of-politics/new-york/politics/2026/02/02/n-y--senator-eyes-bill-to-prohibit-ice-from-accessing-schools',
    chats: 38,
    image: '/nysop-logo.avif',
  },
  {
    id: 'policy-5',
    title: 'The NYC Council says a detained employee was law abiding. The Department of Homeland Security argues otherwise',
    prompt: "Summarize 'The NYC Council says a detained employee was law abiding. DHS argues otherwise' by Politico",
    context: 'fetchUrl:https://www.politico.com/news/2026/01/13/new-york-city-council-detained-employee-dhs-00725904',
    chats: 33,
    image: '/politico-logo.avif',
  },
];

const CATEGORIES = ['All', 'Bills', 'Policy', 'Advocacy', 'Departments', 'Use Case'];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PromptHub() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pageTab, setPageTab] = useState<'prompts' | 'lists'>('prompts');
  const [activeCategory, setActiveCategory] = useState('All');
  const [upvoted, setUpvoted] = useState<Set<string>>(new Set());
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [disliked, setDisliked] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (location.hash === '#lists') {
      setPageTab('lists');
    } else {
      setPageTab('prompts');
    }
  }, [location.hash]);

  const toggleSet = (setter: React.Dispatch<React.SetStateAction<Set<string>>>, id: string) => {
    setter(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Derived prompt lists
  const filteredPrompts = useMemo(() => {
    const items =
      activeCategory === 'All'
        ? hubPrompts.filter((p) => p.category !== 'Featured')
        : hubPrompts.filter((p) => p.category === activeCategory);
    return [...items].sort((a, b) => b.upvotes - a.upvotes).slice(0, 10);
  }, [activeCategory]);

  const trendingPrompts = useMemo(
    () => hubPrompts.filter((p) => p.category === 'Featured').sort((a, b) => b.upvotes - a.upvotes),
    [],
  );

  const newestPrompts = useMemo(() => [...hubPrompts].reverse().slice(0, 8), []);

  // -----------------------------------------------------------------------
  // Supabase: recent bills
  // -----------------------------------------------------------------------
  const { data: recentBills } = useQuery({
    queryKey: ['prompt-hub-bills'],
    queryFn: async () => {
      const { data } = await supabase
        .from('Bills')
        .select('bill_id, bill_number, title, status_desc')
        .order('bill_id', { ascending: false })
        .limit(7);
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
  });

  // -----------------------------------------------------------------------
  // Supabase: top members by # of bills sponsored
  // -----------------------------------------------------------------------
  const { data: topMembers } = useQuery({
    queryKey: ['prompt-hub-members'],
    queryFn: async () => {
      const { data: sponsors } = await supabase
        .from('Sponsors')
        .select('people_id')
        .limit(10000);

      if (!sponsors) return [];

      // Count bills per member
      const counts: Record<number, number> = {};
      sponsors.forEach((s: any) => {
        counts[s.people_id] = (counts[s.people_id] || 0) + 1;
      });

      // Top 10 by count
      const topIds = Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 14)
        .map(([id]) => parseInt(id));

      const { data: members } = await supabase
        .from('People')
        .select('people_id, name, first_name, last_name, party, chamber, photo_url')
        .in('people_id', topIds);

      if (!members) return [];

      return members
        .map((m: any) => ({ ...m, billCount: counts[m.people_id] || 0 }))
        .sort((a: any, b: any) => b.billCount - a.billCount);
    },
    staleTime: 10 * 60 * 1000,
  });

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------
  const handlePromptClick = (prompt: string, context?: string) => {
    const url = context
      ? `/?prompt=${encodeURIComponent(prompt)}&context=${encodeURIComponent(context)}`
      : `/?prompt=${encodeURIComponent(prompt)}`;
    navigate(url);
  };

  const makeMemberSlug = (m: any): string => {
    const raw = m.name || `${m.first_name || ''} ${m.last_name || ''}`;
    return raw
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((p: string) => p.length > 1)
      .join('-');
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ChatHeader />

      <main className="flex-1 pt-[120px] pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Pill tab toggle */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center bg-muted/50 rounded-full p-1">
              {(['prompts', 'lists'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setPageTab(tab)}
                  className={cn(
                    'px-5 py-2 rounded-full text-sm font-medium transition-all duration-200',
                    pageTab === tab
                      ? 'bg-white text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab === 'prompts' ? 'Prompts' : 'Lists'}
                </button>
              ))}
            </div>
          </div>

          {pageTab === 'prompts' && (
          <>
          {/* ============================================================= */}
          {/* 3-COLUMN LAYOUT                                                */}
          {/* ============================================================= */}
          <div className="flex gap-8">
            {/* ----------------------------------------------------------- */}
            {/* LEFT SIDEBAR (lg+)                                           */}
            {/* ----------------------------------------------------------- */}
            <aside className="hidden lg:block w-[300px] flex-shrink-0 border-r-2 border-dotted border-border/80 pr-8">
              <div className="sticky top-24">
                {/* Trending */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <Flame className="h-3.5 w-3.5" />
                    Trending
                  </h3>
                  <div className="space-y-2">
                    {trendingPrompts.map((p) => {
                      const articleUrl = p.context?.startsWith('fetchUrl:')
                        ? p.context.slice('fetchUrl:'.length).trim()
                        : null;
                      return (
                        <div
                          key={p.id}
                          onClick={() => handlePromptClick(p.prompt, p.context)}
                          className="group bg-muted/30 hover:bg-muted/50 rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:shadow-lg border border-transparent hover:border-border"
                        >
                          <div>
                            <h4 className="font-semibold text-sm line-clamp-2">{p.title}</h4>
                            <span className="text-xs text-muted-foreground">{p.upvotes} chats</span>
                          </div>
                          {/* Bottom row: logo left, arrow right */}
                          <div className="flex items-end justify-between mt-3">
                            <div className="flex items-center gap-2">
                              {p.image && articleUrl ? (
                                <a
                                  href={articleUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Read article"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <img
                                    src={p.image}
                                    alt={p.title}
                                    className="h-6 rounded object-contain hover:shadow-md transition-all"
                                  />
                                </a>
                              ) : <div />}
                            </div>
                            <div className="w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <ArrowUp className="h-4 w-4" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </aside>

            {/* ----------------------------------------------------------- */}
            {/* CENTER COLUMN                                                */}
            {/* ----------------------------------------------------------- */}
            <div className="flex-1 min-w-0">
              {/* Hero — Budget Dashboard Preview */}
              <Link
                to="/budget-dashboard"
                className="block rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-white p-8 mb-8 relative overflow-hidden group hover:shadow-xl transition-shadow"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
                <div className="relative z-10 flex flex-col justify-between min-h-[220px]">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-3">
                      NYS FY2027 Budget Dashboard
                    </h2>
                    <p className="text-white/70 text-sm md:text-base max-w-xl leading-relaxed">
                      Explore New York State's $252B+ budget with interactive breakdowns by
                      agency, fund type, and fiscal year. Track spending trends and capital
                      appropriations.
                    </p>
                  </div>
                  <div className="mt-6">
                    <span className="inline-flex items-center gap-2 bg-white text-slate-900 px-5 py-2.5 rounded-lg text-sm font-medium group-hover:bg-white/90 transition-colors">
                      Explorer
                      <ExternalLink className="h-4 w-4" />
                    </span>
                  </div>
                </div>
                {/* Decorative chart bars */}
                <div className="absolute right-8 bottom-0 hidden md:flex items-end gap-2 h-32 opacity-20">
                  {[40, 65, 50, 80, 55, 70, 90, 60].map((h, i) => (
                    <div
                      key={i}
                      className="w-6 bg-white/50 rounded-t"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </Link>

              {/* Featured Category Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                {featuredCards.map((card, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveCategory(activeCategory === card.category ? 'All' : card.category)}
                    className={cn(
                      "group rounded-xl overflow-hidden relative h-28 text-left hover:shadow-lg transition-all duration-200",
                      activeCategory === card.category && "ring-2 ring-white/60 shadow-lg"
                    )}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${card.gradient} group-hover:scale-105 transition-transform duration-300`}
                    />
                    <div className="relative z-10 p-4 flex flex-col justify-end h-full">
                      <h3 className="text-white font-semibold text-sm">{card.title}</h3>
                    </div>
                  </button>
                ))}
              </div>

              {/* Mobile category pills (below lg) */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-1 lg:hidden">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      'px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
                      activeCategory === cat
                        ? 'bg-foreground text-background'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80',
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Prompt Feed */}
              <div className="space-y-3">
                {filteredPrompts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handlePromptClick(p.prompt, p.context)}
                    className="group bg-muted/30 hover:bg-muted/50 rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg border border-transparent hover:border-border"
                  >
                    {/* Top row: category tag + upvote on right */}
                    <div className="flex items-start justify-between mb-2">
                      <span
                        className={cn(
                          'text-xs font-medium px-2 py-0.5 rounded-full',
                          categoryColors[p.category] || 'bg-muted text-muted-foreground',
                        )}
                      >
                        {p.category}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSet(setUpvoted, p.id); }}
                        className={cn(
                          "flex flex-col items-center gap-0.5 transition-colors",
                          upvoted.has(p.id) ? "text-blue-500" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <ChevronUp className="h-4 w-4" />
                        <span className="text-xs font-medium">{p.upvotes + (upvoted.has(p.id) ? 1 : 0)}</span>
                      </button>
                    </div>

                    <h3 className="font-semibold text-base mb-1">{p.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {p.prompt}
                    </p>

                    {/* Bottom row: thumbs + send button */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleSet(setLiked, p.id); }}
                          className={cn(
                            "transition-colors",
                            liked.has(p.id) ? "text-green-500" : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleSet(setDisliked, p.id); }}
                          className={cn(
                            "transition-colors",
                            disliked.has(p.id) ? "text-red-500" : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="w-10 h-10 bg-foreground text-background rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <ArrowUp className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ----------------------------------------------------------- */}
            {/* RIGHT SIDEBAR (xl+)                                          */}
            {/* ----------------------------------------------------------- */}
            <aside className="hidden xl:block w-[300px] flex-shrink-0 border-l-2 border-dotted border-border/80 pl-8">
              <div className="sticky top-24">
                {/* Top Prompts */}
                <div className="mb-6 pb-6 border-b-2 border-dotted border-border/80">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5" />
                    Top Prompts
                  </h3>
                  <div className="space-y-2">
                    {policyItems.map((p) => {
                      const articleUrl = p.context?.startsWith('fetchUrl:')
                        ? p.context.slice('fetchUrl:'.length).trim()
                        : null;
                      return (
                        <div
                          key={p.id}
                          onClick={() => handlePromptClick(p.prompt, p.context)}
                          className="group bg-muted/30 hover:bg-muted/50 rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:shadow-lg border border-transparent hover:border-border"
                        >
                          <div>
                            <h4 className="font-semibold text-sm line-clamp-2">
                              {p.title}
                            </h4>
                            <span className="text-xs text-muted-foreground">
                              {p.chats} chats
                            </span>
                          </div>
                          {/* Bottom row: logo(s) left, arrow right */}
                          <div className="flex items-end justify-between mt-3">
                            <div className="flex items-center gap-2">
                              {'logos' in p && p.logos ? (
                                p.logos.map((logo, i) => (
                                  <a
                                    key={i}
                                    href={logo.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={logo.title}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <img
                                      src={logo.image}
                                      alt={logo.title}
                                      className={`h-6 ${('rounded' in logo && logo.rounded) ? 'rounded-full' : 'rounded'} object-contain hover:shadow-md transition-all`}
                                    />
                                  </a>
                                ))
                              ) : 'image' in p && p.image && articleUrl ? (
                                <a
                                  href={articleUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Read article"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <img
                                    src={p.image}
                                    alt={p.title}
                                    className="h-6 rounded object-contain hover:shadow-md transition-all"
                                  />
                                </a>
                              ) : <div />}
                            </div>
                            <div className="w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <ArrowUp className="h-4 w-4" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Docs */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Docs
                  </h3>
                  <div className="divide-y-2 divide-dotted divide-border/80">
                    {newestPrompts.map((p) => (
                      <div key={p.id} className="py-3 first:pt-0">
                        <button
                          onClick={() => handlePromptClick(p.prompt, p.context)}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted/50 hover:shadow-md hover:text-foreground transition-all duration-200 group border border-transparent hover:border-border"
                        >
                          <span className="block">{p.title}</span>
                          <span className="block text-xs opacity-60 mt-0.5">Asked 2.2.2026</span>
                          <div className="flex justify-end mt-2">
                            <div className="w-7 h-7 bg-foreground text-background rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <ArrowUp className="h-3.5 w-3.5" />
                            </div>
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
          </>
          )}

          {pageTab === 'lists' && (
          <>
          {/* ============================================================= */}
          {/* LISTS SECTION                                                  */}
          {/* ============================================================= */}
          <div id="lists" className="pt-0 pb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
              {/* ------ Top Sponsors (members by bills sponsored) ------ */}
              <div className="md:border-r-2 md:border-dotted md:border-border/80 md:pr-6 pb-8 md:pb-0">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  Top Sponsors
                </h3>
                <div className="divide-y-2 divide-dotted divide-border/80">
                  {(topMembers || []).map((m: any) => (
                    <div key={m.people_id} className="py-3 first:pt-0">
                      <Link
                        to={`/members/${makeMemberSlug(m)}`}
                        className="group flex items-center gap-3 py-2 hover:bg-muted/30 hover:shadow-md px-4 rounded-lg transition-all duration-200"
                      >
                        {m.photo_url ? (
                          <img
                            src={m.photo_url}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <Users className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{m.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {m.party} · {m.chamber}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const prompt = `Tell me about ${m.name} and their legislative record`;
                            navigate(`/?prompt=${encodeURIComponent(prompt)}`);
                          }}
                          className="w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          title={`Ask about ${m.name}`}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                          {m.billCount} bills
                        </span>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* ------ Recent Bills ------ */}
              <div className="md:border-r-2 md:border-dotted md:border-border/80 md:px-6 border-t-2 border-dotted border-border/80 md:border-t-0 pt-8 md:pt-0 pb-8 md:pb-0">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  Recent Bills
                </h3>
                <div className="divide-y-2 divide-dotted divide-border/80">
                  {(recentBills || []).map((bill: any) => (
                    <div key={bill.bill_id} className="py-3 first:pt-0">
                      <div
                        className="group py-3 hover:bg-muted/30 hover:shadow-md px-4 rounded-lg transition-all duration-200"
                      >
                        <Link to={`/bills/${bill.bill_number}`} className="block">
                          <p className="font-semibold text-sm">{bill.bill_number}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {bill.title}
                          </p>
                          {bill.status_desc && (
                            <p className="text-xs text-muted-foreground/70 mt-1.5">
                              {bill.status_desc}
                            </p>
                          )}
                        </Link>
                        <div className="flex justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => {
                              const prompt = `Tell me about bill ${bill.bill_number}: ${bill.title || ''}`;
                              navigate(`/?prompt=${encodeURIComponent(prompt)}`);
                            }}
                            className="w-9 h-9 bg-foreground text-background rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                            title="Ask about this bill"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ------ Budget Explorer ------ */}
              <div className="md:pl-6 border-t-2 border-dotted border-border/80 md:border-t-0 pt-8 md:pt-0">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4" />
                  Budget Explorer
                </h3>
                <div className="divide-y-2 divide-dotted divide-border/80">
                  {budgetItems.map((item, idx) => (
                    <div key={idx} className="py-3 first:pt-0">
                      <Link
                        to="/budget-dashboard"
                        className="group flex items-center justify-between py-2 hover:bg-muted/30 hover:shadow-md px-4 rounded-lg transition-all duration-200"
                      >
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.share} of total
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const prompt = `Tell me about New York State's ${item.name} budget category and its ${item.amount} allocation`;
                              navigate(`/?prompt=${encodeURIComponent(prompt)}`);
                            }}
                            className="w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            title={`Ask about ${item.name} budget`}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <div className="text-right">
                            <p className="font-medium text-sm">{item.amount}</p>
                            <p className="text-xs text-emerald-600">{item.change}</p>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          </>
          )}
        </div>
      </main>

      <FooterSimple />
    </div>
  );
}

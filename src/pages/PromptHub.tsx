import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChatHeader } from '@/components/ChatHeader';
import FooterSimple from '@/components/marketing/FooterSimple';
import { cn } from '@/lib/utils';
import {
  ArrowUp, ThumbsUp, ThumbsDown, ChevronUp, Flame,
  Award, ExternalLink, BarChart3, Sparkles, Users, FileText, DollarSign,
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
}

const hubPrompts: HubPrompt[] = [
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
];

// Category tag colors
const categoryColors: Record<string, string> = {
  Bills: 'bg-blue-100 text-blue-700',
  Policy: 'bg-emerald-100 text-emerald-700',
  Advocacy: 'bg-purple-100 text-purple-700',
  'Use Case': 'bg-amber-100 text-amber-700',
};

// Category gradient thumbnails
const categoryGradients: Record<string, string> = {
  Bills: 'from-blue-400 to-cyan-300',
  Policy: 'from-emerald-400 to-teal-300',
  Advocacy: 'from-purple-400 to-pink-300',
  'Use Case': 'from-yellow-300 via-amber-400 to-amber-600',
};

// Featured category cards (gradient image placeholders)
const featuredCards = [
  { title: 'Bill Research', subtitle: 'Explore active legislation', gradient: 'from-blue-400 to-cyan-300', link: '/use-cases/bills' },
  { title: 'Policy Development', subtitle: 'Frameworks & analysis', gradient: 'from-emerald-400 to-teal-300', link: '/use-cases/policy' },
  { title: 'Advocacy', subtitle: 'Nonprofit & environmental', gradient: 'from-purple-400 to-pink-300', link: '/nonprofits' },
  { title: 'Departments', subtitle: '100+ state entities', gradient: 'from-yellow-300 via-amber-400 to-amber-600', link: '/departments' },
];

// Budget explorer items for bottom section
const budgetItems = [
  { name: 'Education', amount: '$37.8B', change: '+3.2%', share: '15.0%' },
  { name: 'Health', amount: '$96.7B', change: '+4.1%', share: '38.3%' },
  { name: 'Transportation', amount: '$14.2B', change: '+2.8%', share: '5.6%' },
  { name: 'Public Safety', amount: '$8.1B', change: '+1.9%', share: '3.2%' },
  { name: 'Social Welfare', amount: '$42.3B', change: '+5.3%', share: '16.8%' },
  { name: 'General Government', amount: '$11.4B', change: '+2.1%', share: '4.5%' },
];

const CATEGORIES = ['All', 'Bills', 'Policy', 'Advocacy', 'Use Case'];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PromptHub() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');

  // Derived prompt lists
  const filteredPrompts = useMemo(() => {
    const items =
      activeCategory === 'All'
        ? hubPrompts
        : hubPrompts.filter((p) => p.category === activeCategory);
    return [...items].sort((a, b) => b.upvotes - a.upvotes);
  }, [activeCategory]);

  const trendingPrompts = useMemo(
    () => [...hubPrompts].sort((a, b) => b.upvotes - a.upvotes).slice(0, 8),
    [],
  );

  const newestPrompts = useMemo(() => [...hubPrompts].reverse().slice(0, 8), []);

  const leaderboard = useMemo(
    () => [...hubPrompts].sort((a, b) => b.upvotes - a.upvotes).slice(0, 5),
    [],
  );

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
        .limit(6);
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

      // Top 6 by count
      const topIds = Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
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
  const handlePromptClick = (prompt: string) => {
    navigate(`/?prompt=${encodeURIComponent(prompt)}`);
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

      <main className="flex-1 pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* ============================================================= */}
          {/* 3-COLUMN LAYOUT                                                */}
          {/* ============================================================= */}
          <div className="flex gap-8">
            {/* ----------------------------------------------------------- */}
            {/* LEFT SIDEBAR (lg+)                                           */}
            {/* ----------------------------------------------------------- */}
            <aside className="hidden lg:block w-56 flex-shrink-0">
              <div className="sticky top-24">
                {/* Categories */}
                <div className="mb-8">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Categories
                  </h3>
                  <div className="space-y-1">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={cn(
                          'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                          activeCategory === cat
                            ? 'bg-muted font-medium text-foreground'
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trending */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <Flame className="h-3.5 w-3.5" />
                    Trending
                  </h3>
                  <div className="space-y-1">
                    {trendingPrompts.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handlePromptClick(p.prompt)}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors group flex items-center justify-between"
                      >
                        <span className="truncate flex-1">{p.title}</span>
                        <span className="text-xs opacity-50 group-hover:opacity-100 transition-opacity">
                          {p.upvotes}
                        </span>
                      </button>
                    ))}
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
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="h-5 w-5 text-blue-400" />
                    <span className="text-xs font-medium text-blue-400 uppercase tracking-wide">
                      Budget Explorer
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">
                    NYS FY2027 Budget Dashboard
                  </h2>
                  <p className="text-white/70 text-sm md:text-base max-w-xl mb-6 leading-relaxed">
                    Explore New York State's $252B+ budget with interactive breakdowns by
                    agency, fund type, and fiscal year. Track spending trends and capital
                    appropriations.
                  </p>
                  <span className="inline-flex items-center gap-2 bg-white text-slate-900 px-5 py-2.5 rounded-lg text-sm font-medium group-hover:bg-white/90 transition-colors">
                    Explore Budget
                    <ExternalLink className="h-4 w-4" />
                  </span>
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
                  <Link
                    key={idx}
                    to={card.link}
                    className="group rounded-xl overflow-hidden relative h-28 block"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${card.gradient} group-hover:scale-105 transition-transform duration-300`}
                    />
                    <div className="relative z-10 p-4 flex flex-col justify-end h-full">
                      <h3 className="text-white font-semibold text-sm">{card.title}</h3>
                      <p className="text-white/70 text-xs mt-0.5">{card.subtitle}</p>
                    </div>
                  </Link>
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
                    className="group bg-muted/20 hover:bg-muted/40 rounded-xl p-5 transition-all duration-200 border border-transparent hover:border-border/40"
                  >
                    <div className="flex items-start gap-4">
                      {/* Upvote column */}
                      <div className="flex flex-col items-center gap-1 pt-0.5">
                        <button className="text-muted-foreground hover:text-foreground transition-colors">
                          <ChevronUp className="h-5 w-5" />
                        </button>
                        <span className="text-sm font-medium text-muted-foreground">
                          {p.upvotes}
                        </span>
                      </div>

                      {/* Gradient thumbnail */}
                      <div
                        className={cn(
                          'w-12 h-12 rounded-lg flex-shrink-0 bg-gradient-to-br',
                          categoryGradients[p.category] || 'from-slate-300 to-slate-400',
                        )}
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span
                            className={cn(
                              'text-xs font-medium px-2 py-0.5 rounded-full',
                              categoryColors[p.category] || 'bg-muted text-muted-foreground',
                            )}
                          >
                            {p.category}
                          </span>
                        </div>
                        <h3 className="font-semibold text-base mb-1">{p.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                          {p.prompt}
                        </p>

                        {/* Thumbs up / down */}
                        <div className="flex items-center gap-3 mt-3">
                          <button className="text-muted-foreground hover:text-foreground transition-colors">
                            <ThumbsUp className="h-4 w-4" />
                          </button>
                          <button className="text-muted-foreground hover:text-foreground transition-colors">
                            <ThumbsDown className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Send button (arrow-up) */}
                      <button
                        onClick={() => handlePromptClick(p.prompt)}
                        className="w-10 h-10 bg-foreground text-background rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 hover:opacity-80"
                        title="Send prompt"
                      >
                        <ArrowUp className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ----------------------------------------------------------- */}
            {/* RIGHT SIDEBAR (xl+)                                          */}
            {/* ----------------------------------------------------------- */}
            <aside className="hidden xl:block w-64 flex-shrink-0">
              <div className="sticky top-24">
                {/* Newest */}
                <div className="mb-8">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Newest
                  </h3>
                  <div className="space-y-1">
                    {newestPrompts.map((p) => (
                      <div key={p.id} className="flex items-center gap-2 group">
                        <button
                          onClick={() => handlePromptClick(p.prompt)}
                          className="flex-1 text-left px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors truncate"
                        >
                          {p.title}
                        </button>
                        <button
                          onClick={() => handlePromptClick(p.prompt)}
                          className="w-7 h-7 bg-foreground text-background rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Leaderboard */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5" />
                    Top Prompts
                  </h3>
                  <div className="space-y-1">
                    {leaderboard.map((p, idx) => (
                      <button
                        key={p.id}
                        onClick={() => handlePromptClick(p.prompt)}
                        className="w-full text-left px-3 py-2.5 rounded-lg text-sm hover:bg-muted/50 transition-colors flex items-center gap-3 group"
                      >
                        <span className="text-lg font-bold text-muted-foreground/40 w-6 text-center">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="truncate block font-medium text-sm">
                            {p.title}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {p.upvotes} upvotes
                          </span>
                        </div>
                        <ChevronUp className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* ============================================================= */}
          {/* BOTTOM 3-COLUMN SECTION                                        */}
          {/* ============================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pb-8">
            {/* ------ Top Sponsors (members by bills sponsored) ------ */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                Top Sponsors
              </h3>
              <div className="space-y-2">
                {(topMembers || []).map((m: any) => (
                  <Link
                    key={m.people_id}
                    to={`/members/${makeMemberSlug(m)}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors"
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
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      {m.billCount} bills
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* ------ Recent Bills ------ */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                Recent Bills
              </h3>
              <div className="space-y-2">
                {(recentBills || []).map((bill: any) => (
                  <Link
                    key={bill.bill_id}
                    to={`/bills/${bill.bill_number}`}
                    className="block p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <p className="font-medium text-sm">{bill.bill_number}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {bill.title}
                    </p>
                    {bill.status_desc && (
                      <span className="text-xs text-muted-foreground/70 mt-1 inline-block">
                        {bill.status_desc}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* ------ Budget Explorer ------ */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-1.5">
                <DollarSign className="h-4 w-4" />
                Budget Explorer
              </h3>
              <div className="space-y-2">
                {budgetItems.map((item, idx) => (
                  <Link
                    key={idx}
                    to="/budget-dashboard"
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.share} of total
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{item.amount}</p>
                      <p className="text-xs text-emerald-600">{item.change}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <FooterSimple />
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChatHeader } from '@/components/ChatHeader';
import FooterSimple from '@/components/marketing/FooterSimple';
import { cn } from '@/lib/utils';

const researchCards = [
  {
    title: 'Bills',
    description: 'Prompts based on active Senate and Assembly legislation.',
    href: '/use-cases/bills',
    gradient: 'bg-gradient-to-b from-sky-300 via-sky-400 to-sky-600',
  },
  {
    title: 'Committees',
    description: "Prompts to clarify each committee's focus and responsibilities.",
    href: '/use-cases/committees',
    gradient: 'bg-gradient-to-b from-emerald-300 via-emerald-400 to-teal-600',
  },
  {
    title: 'Members',
    description: 'Prompts to help you research legislators and their priorities.',
    href: '/use-cases/members',
    gradient: 'bg-gradient-to-b from-pink-200 via-fuchsia-300 to-purple-500',
  },
  {
    title: 'Policy',
    description: 'Seasoned public policy experts shared issues from their own experience.',
    href: '/use-cases/policy',
    gradient: 'bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-600',
  },
  {
    title: 'Departments',
    description: 'Explore NYS departments, agencies, and public authorities.',
    href: '/use-cases/departments',
    gradient: 'bg-gradient-to-b from-slate-300 via-slate-400 to-slate-600',
  },
];

const advocacyCards = [
  {
    title: 'Directory',
    description: 'Browse nonprofit organizations across all advocacy categories.',
    href: '/nonprofits/directory',
    gradient: 'bg-gradient-to-b from-slate-300 via-slate-400 to-slate-600',
  },
  {
    title: 'Economic',
    description: 'Economic justice, workforce development, and fiscal policy advocacy.',
    href: '/nonprofits/economic-advocacy',
    gradient: 'bg-gradient-to-b from-sky-300 via-sky-400 to-sky-600',
  },
  {
    title: 'Environmental',
    description: 'Climate action, conservation, and environmental justice advocacy.',
    href: '/nonprofits/environmental-advocacy',
    gradient: 'bg-gradient-to-b from-emerald-300 via-emerald-400 to-teal-600',
  },
  {
    title: 'Legal',
    description: 'Criminal justice reform, civil rights, and legal aid advocacy.',
    href: '/nonprofits/legal-advocacy',
    gradient: 'bg-gradient-to-b from-pink-200 via-fuchsia-300 to-purple-500',
  },
  {
    title: 'Social',
    description: 'Housing, healthcare, education, and social services advocacy.',
    href: '/nonprofits/social-advocacy',
    gradient: 'bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-600',
  },
];

type Tab = 'research' | 'advocacy';

const tabContent: Record<Tab, { heading: string; subtitle: string; cards: typeof researchCards; gridCols: string }> = {
  research: {
    heading: 'Chats for Legislative Research',
    subtitle: 'Tap into curated prompts for bills, committees, members, and policy development. Each use case gives you a head start on the research that matters most.',
    cards: researchCards,
    gridCols: 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-5',
  },
  advocacy: {
    heading: 'Advocacy Resources for Nonprofits',
    subtitle: 'Curated prompts and research tools for nonprofit organizations working on economic, environmental, legal, and social advocacy across New York State.',
    cards: advocacyCards,
    gridCols: 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-5',
  },
};

export default function UseCases() {
  const [activeTab, setActiveTab] = useState<Tab>('research');
  const { heading, subtitle, cards, gridCols } = tabContent[activeTab];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ChatHeader />
    <main className="flex-1 pt-16">
      <div className="mx-auto max-w-[1300px] px-4 py-12 sm:px-6 lg:px-8">
        {/* Pill tab toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center bg-muted/50 rounded-full p-1">
            {(['research', 'advocacy'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-5 py-2 rounded-full text-sm font-medium transition-all duration-200',
                  activeTab === tab
                    ? 'bg-white text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab === 'research' ? 'Research' : 'Advocacy'}
              </button>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-2xl text-center lg:max-w-4xl">
          <h1 className="text-foreground text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            {heading}
          </h1>
          <p className="text-muted-foreground mt-4 text-lg">
            {subtitle}
          </p>
        </div>

        <div className={cn('mt-12 grid gap-4 lg:gap-6', gridCols)}>
          {cards.map((card) => (
              <Link
                key={card.title}
                to={card.href}
                className="group relative block aspect-[4/5] overflow-hidden rounded-lg shadow-sm transition-shadow duration-300 hover:shadow-xl"
              >
                <div className={`absolute inset-0 ${card.gradient} transition-transform duration-300 group-hover:scale-105`} />
                <div className="absolute bottom-0 left-0 p-4">
                  <p className="text-base sm:text-lg font-bold text-white">
                    {card.title}
                  </p>
                  <p className="text-xs sm:text-sm font-normal text-white/80 line-clamp-2 mt-0.5">
                    {card.description}
                  </p>
                </div>
              </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button size="lg" variant="outline" asChild>
            <Link to="/">Chat with NYSgpt</Link>
          </Button>
        </div>
      </div>
    </main>
    <FooterSimple />
    </div>
  );
}

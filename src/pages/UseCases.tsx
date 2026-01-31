import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChatHeader } from '@/components/ChatHeader';
import FooterSimple from '@/components/marketing/FooterSimple';

const useCases = [
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
];

export default function UseCases() {
  return (
    <div className="min-h-screen bg-background">
      <ChatHeader />
    <div className="bg-background py-12 sm:py-16 lg:py-20 pt-28 sm:pt-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center lg:max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            Use Cases
          </Badge>
          <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            Chats for Legislative Research
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Tap into curated prompts for bills, committees, members, and policy
            development. Each use case gives you a head start on the research
            that matters most.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {useCases.map((useCase) => (
              <Link
                key={useCase.title}
                to={useCase.href}
                className="group relative block aspect-[4/5] overflow-hidden rounded-lg shadow-sm transition-shadow duration-300 hover:shadow-xl"
              >
                <div className={`absolute inset-0 ${useCase.gradient} transition-transform duration-300 group-hover:scale-105`} />
                <div className="absolute bottom-0 left-0 p-4">
                  <p className="text-base sm:text-lg font-bold text-white">
                    {useCase.title}
                  </p>
                  <p className="text-xs sm:text-sm font-normal text-white/80 line-clamp-2 mt-0.5">
                    {useCase.description}
                  </p>
                </div>
              </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button size="lg" variant="outline" asChild>
            <Link to="/">Get Started with NYSgpt</Link>
          </Button>
        </div>
      </div>
    </div>
    <FooterSimple />
    </div>
  );
}

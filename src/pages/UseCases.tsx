import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Users, Building2, Lightbulb } from 'lucide-react';

const useCases = [
  {
    title: 'Bills',
    description: 'Prompts based on active Senate and Assembly legislation.',
    href: '/use-cases/bills',
    icon: FileText,
    gradient: 'bg-gradient-to-br from-sky-400 via-sky-300 to-cyan-200',
  },
  {
    title: 'Committees',
    description: "Prompts to clarify each committee's focus and responsibilities.",
    href: '/use-cases/committees',
    icon: Building2,
    gradient: 'bg-gradient-to-br from-emerald-400 via-emerald-300 to-teal-200',
  },
  {
    title: 'Members',
    description: 'Prompts to help you research legislators and their priorities.',
    href: '/use-cases/members',
    icon: Users,
    gradient: 'bg-gradient-to-br from-purple-400 via-fuchsia-300 to-pink-300',
  },
  {
    title: 'Policy',
    description: 'Seasoned public policy experts shared issues from their own experience.',
    href: '/use-cases/policy',
    icon: Lightbulb,
    gradient: 'bg-gradient-to-br from-amber-400 via-amber-300 to-yellow-200',
  },
];

export default function UseCases() {
  return (
    <div className="bg-background py-12 sm:py-16 lg:py-20">
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
          {useCases.map((useCase) => {
            const Icon = useCase.icon;
            return (
              <Link
                key={useCase.title}
                to={useCase.href}
                className="group relative block aspect-[4/5] overflow-hidden rounded-lg shadow-sm transition-shadow hover:shadow-md"
              >
                <div className={`absolute inset-0 ${useCase.gradient} transition-transform duration-300 group-hover:scale-105`} />
                <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-30 transition-opacity duration-300">
                  <Icon className="h-24 w-24 text-white" strokeWidth={1} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-4">
                  <p className="text-sm font-medium text-white sm:text-base">
                    {useCase.title}
                  </p>
                  <p className="text-xs text-white/80 line-clamp-2 mt-0.5">
                    {useCase.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Button size="lg" variant="outline" asChild>
            <Link to="/free-trial">Get Started with NYSgpt</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

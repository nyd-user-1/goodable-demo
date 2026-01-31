import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChatHeader } from '@/components/ChatHeader';

const nonprofitCategories = [
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

export default function Nonprofits() {
  return (
    <div className="min-h-screen bg-background">
      <ChatHeader />
    <div className="bg-background py-12 sm:py-16 lg:py-20 pt-28 sm:pt-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center lg:max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            Non Profits
          </Badge>
          <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            Advocacy Resources for Nonprofits
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Curated prompts and research tools for nonprofit organizations
            working on economic, environmental, legal, and social advocacy
            across New York State.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
          {nonprofitCategories.map((category) => (
              <Link
                key={category.title}
                to={category.href}
                className="group relative block aspect-[4/5] overflow-hidden rounded-lg shadow-sm transition-shadow duration-300 hover:shadow-xl"
              >
                <div className={`absolute inset-0 ${category.gradient} transition-transform duration-300 group-hover:scale-105`} />
                <div className="absolute bottom-0 left-0 p-4">
                  <p className="text-base sm:text-lg font-bold text-white">
                    {category.title}
                  </p>
                  <p className="text-xs sm:text-sm font-normal text-white/80 line-clamp-2 mt-0.5">
                    {category.description}
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
    </div>
  );
}

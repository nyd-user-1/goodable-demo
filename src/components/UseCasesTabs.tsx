import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const tabs = [
  { label: 'Bills', href: '/use-cases/bills' },
  { label: 'Committees', href: '/use-cases/committees' },
  { label: 'Members', href: '/use-cases/members' },
  { label: 'Policy', href: '/use-cases/policy' },
  { label: 'Departments', href: '/use-cases/departments' },
];

export function UseCasesTabs() {
  const location = useLocation();

  return (
    <div className="flex justify-center mb-12">
      <div className="inline-flex items-center bg-muted/50 rounded-full p-1">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.href;
          return (
            <Link
              key={tab.href}
              to={tab.href}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const tabs = [
  { label: 'Economic', href: '/nonprofits/economic-advocacy' },
  { label: 'Environmental', href: '/nonprofits/environmental-advocacy' },
  { label: 'Legal', href: '/nonprofits/legal-advocacy' },
  { label: 'Social', href: '/nonprofits/social-advocacy' },
  { label: 'Partners', href: '/nonprofits/partners', featured: true },
];

export function NonprofitAdvocacyTabs() {
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
                  ? tab.featured
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-foreground shadow-sm"
                  : tab.featured
                    ? "text-blue-600 hover:text-blue-700"
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

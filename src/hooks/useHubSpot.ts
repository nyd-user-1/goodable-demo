import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

declare global {
  interface Window {
    _hsq: any[];
    gtag: (...args: any[]) => void;
  }
}

/** Title-case a slug: "use-cases" → "Use Cases", "school-funding" → "School Funding" */
function formatSlug(slug: string): string {
  return slug.replace(/(^|-)(\w)/g, (_, sep, ch) => (sep ? ' ' : '') + ch.toUpperCase());
}

/**
 * Build a page title from the tracked path.
 * Returns { short, tab } where short is for HubSpot/GA and tab is for browser tab.
 * e.g. "/use-cases" → { short: "Use Cases", tab: "Use Cases | NYSgpt" }
 * e.g. "/bills/S240" → { short: "S240", tab: "S240 | NYSgpt" }
 */
function pageTitle(tracked: string): { short: string; tab: string } {
  const fmt = (s: string) => ({ short: s, tab: `${s} | NYSgpt` });

  if (tracked === '/') return { short: 'Home', tab: 'NYSgpt' };
  if (tracked === '/chats') return fmt('Chats');
  if (tracked === '/notes') return fmt('Notes');
  if (tracked === '/excerpts') return fmt('Excerpts');

  const segments = tracked.split('/').filter(Boolean);
  const label = formatSlug(segments[segments.length - 1]);
  return fmt(label);
}

/**
 * Normalize paths so HubSpot sees clean categories for chats, notes, and excerpts
 * instead of individual IDs. Detail pages for bills, members, committees, etc.
 * keep their full path so we can see which specific records are visited.
 */
function normalizePath(pathname: string): string | null {
  // Chat sessions → just "/chats"
  if (pathname.startsWith('/c/')) return '/chats';
  // Notes → just "/notes"
  if (pathname.startsWith('/n/')) return '/notes';
  // Excerpts → just "/excerpts"
  if (pathname.startsWith('/e/')) return '/excerpts';

  // Pages we explicitly want to track (browse + detail)
  const tracked = [
    '/bills',
    '/committees',
    '/members',
    '/budget',
    '/school-funding',
    '/lobbying',
    '/departments',
    '/contracts',
    '/plans',
    '/auth',
    '/auth-4',
    '/features',
    '/about',
    '/use-cases',
    '/nonprofits',
    '/live-feed',
  ];

  for (const prefix of tracked) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) {
      return pathname;
    }
  }

  // Landing page
  if (pathname === '/') return '/';

  // Everything else (playground, style-guide, admin, etc.) — don't track
  return null;
}

export function useHubSpot() {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const identified = useRef(false);

  // Identify user to HubSpot once when they log in
  useEffect(() => {
    if (isAdmin || !user?.email || identified.current) return;

    window._hsq = window._hsq || [];
    window._hsq.push(['identify', {
      email: user.email,
      id: user.id,
      firstname: user.user_metadata?.full_name?.split(' ')[0] || '',
      lastname: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
    }]);
    identified.current = true;
  }, [user, isAdmin]);

  // Track page views on route changes
  useEffect(() => {
    if (isAdmin) return;

    const tracked = normalizePath(location.pathname);
    if (!tracked) return;

    const { short, tab } = pageTitle(tracked);
    document.title = tab;

    window._hsq = window._hsq || [];
    window._hsq.push(['setPath', tracked]);
    window._hsq.push(['trackPageView']);

    // Google Analytics SPA page view
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', { page_path: tracked, page_title: short });
    }
  }, [location.pathname, isAdmin]);
}

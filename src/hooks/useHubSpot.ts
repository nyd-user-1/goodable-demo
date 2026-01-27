import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

declare global {
  interface Window {
    _hsq: any[];
  }
}

export function useHubSpot() {
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    // Skip tracking for admin accounts
    if (isAdmin) return;

    // Initialize HubSpot queue if not exists
    window._hsq = window._hsq || [];

    if (user?.email) {
      // Identify user to HubSpot
      window._hsq.push(['identify', {
        email: user.email,
        id: user.id,
        firstname: user.user_metadata?.full_name?.split(' ')[0] || '',
        lastname: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
      }]);

      // Track page view with identified user
      window._hsq.push(['trackPageView']);
    }
  }, [user, isAdmin]);
}

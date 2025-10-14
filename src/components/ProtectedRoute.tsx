import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, isAllowedUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Redirect authenticated users from root to new-chat
  useEffect(() => {
    if (!loading && user && location.pathname === '/') {
      navigate('/new-chat');
    }
  }, [user, loading, location.pathname, navigate]);

  // Redirect unauthorized users to waitlist section on homepage
  useEffect(() => {
    if (!loading && user && !isAllowedUser) {
      // Scroll to waitlist section and sign out the user
      navigate('/', { replace: true });
      setTimeout(() => {
        const waitlistSection = document.getElementById('waitlist');
        if (waitlistSection) {
          waitlistSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [user, loading, isAllowedUser, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-brand-50/30">
        <div className="container px-4 sm:px-6 py-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <div className="grid gap-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Don't render protected content if user is not allowed
  if (user && !isAllowedUser) {
    return null;
  }

  return <>{children}</>;
};
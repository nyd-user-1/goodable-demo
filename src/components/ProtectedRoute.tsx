import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { SignupPromptModal } from '@/components/SignupPromptModal';
import { useSignupPrompt } from '@/hooks/useSignupPrompt';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { shouldShowModal, dismissModal } = useSignupPrompt(!user && !loading);

  // Redirect authenticated users from root to new-chat
  useEffect(() => {
    if (!loading && user && location.pathname === '/') {
      navigate('/new-chat');
    }
  }, [user, loading, location.pathname, navigate]);

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

  // Allow viewing content even without auth (soft paywall)
  return (
    <>
      {children}
      {!user && (
        <SignupPromptModal
          open={shouldShowModal}
          onClose={dismissModal}
        />
      )}
    </>
  );
};

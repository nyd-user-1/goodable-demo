import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  user_id: string;
  avatar_url: string | null;
  display_name: string | null;
  username: string | null;
  bio: string | null;
  role: string | null;
}

export const useUserProfile = (userId?: string) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          setError(error.message);
          return;
        }

        setProfile(data);
      } catch (err) {
        console.error('Unexpected error fetching profile:', err);
        setError('Failed to fetch user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  return { profile, loading, error };
};

export const useCurrentUserProfile = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };

    getCurrentUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return useUserProfile(currentUser?.id);
};
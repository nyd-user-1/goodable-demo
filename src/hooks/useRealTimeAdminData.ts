import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RealTimeAdminDataProps {
  onStatsUpdate: () => void;
  onModerationUpdate: () => void;
}

export const useRealTimeAdminData = ({ onStatsUpdate, onModerationUpdate }: RealTimeAdminDataProps) => {
  useEffect(() => {
    // Subscribe to blog_proposals table changes
    const blogProposalsSubscription = supabase
      .channel('admin-blog-proposals')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blog_proposals'
        },
        (payload) => {
          console.log('Blog proposal change:', payload);
          onStatsUpdate();
          onModerationUpdate();
        }
      )
      .subscribe();

    // Subscribe to profiles table changes (new users)
    const profilesSubscription = supabase
      .channel('admin-profiles')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Profile change:', payload);
          onStatsUpdate();
        }
      )
      .subscribe();

    // Subscribe to chat_sessions table changes (new chats/activity)
    const chatSubscription = supabase
      .channel('admin-chat-sessions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_sessions'
        },
        (payload) => {
          console.log('Chat session change:', payload);
          onStatsUpdate();
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      blogProposalsSubscription.unsubscribe();
      profilesSubscription.unsubscribe();
      chatSubscription.unsubscribe();
    };
  }, [onStatsUpdate, onModerationUpdate]);

  return null; // This hook doesn't return data, just manages subscriptions
};
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ModerationItem {
  id: string;
  type: 'Post' | 'Comment';
  title: string;
  author: string;
  content: string;
  reported: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  created_at: string;
  item_id: string;
}

export const useModerationQueue = () => {
  const [moderationQueue, setModerationQueue] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModerationQueue = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get draft posts that might need moderation
      const { data: draftPosts, error: postsError } = await supabase
        .from('blog_proposals')
        .select(`
          id,
          title,
          content,
          summary,
          created_at,
          profiles!blog_proposals_author_id_fkey (
            display_name,
            username
          )
        `)
        .eq('status', 'draft')
        .order('created_at', { ascending: false })
        .limit(10);

      if (postsError) throw postsError;

      // Transform draft posts into moderation items
      const moderationItems: ModerationItem[] = [];

      if (draftPosts) {
        draftPosts.forEach((post, index) => {
          const authorName = post.profiles?.display_name || post.profiles?.username || 'Goodable';
          
          // Simulate different priorities based on content length and recency
          let priority: 'high' | 'medium' | 'low' = 'medium';
          const hoursOld = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
          
          if (hoursOld < 2) priority = 'high';
          else if (hoursOld > 24) priority = 'low';

          // Simulate different reasons for moderation
          const reasons = ['Pending Review', 'Content Guidelines', 'Fact Check', 'Community Standards'];
          const reason = reasons[index % reasons.length];

          moderationItems.push({
            id: `post_${post.id}`,
            type: 'Post',
            title: post.title,
            author: authorName,
            content: post.summary || post.content.substring(0, 200) + '...',
            reported: Math.floor(Math.random() * 3) + 1, // Simulate 1-3 reports
            reason,
            priority,
            created_at: post.created_at,
            item_id: post.id
          });
        });
      }

      // Sort by priority (high first) and then by creation date
      moderationItems.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setModerationQueue(moderationItems);

    } catch (err) {
      console.error('Error fetching moderation queue:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch moderation queue');
    } finally {
      setLoading(false);
    }
  };

  const approveItem = async (itemId: string) => {
    try {
      // Extract the actual post ID from the moderation item ID
      const postId = itemId.replace('post_', '');
      
      const { error } = await supabase
        .from('blog_proposals')
        .update({ 
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', postId);

      if (error) throw error;

      // Remove from moderation queue
      setModerationQueue(prev => prev.filter(item => item.id !== itemId));
      
      return { success: true };
    } catch (err) {
      console.error('Error approving item:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to approve item' };
    }
  };

  const rejectItem = async (itemId: string) => {
    try {
      // Extract the actual post ID from the moderation item ID
      const postId = itemId.replace('post_', '');
      
      const { error } = await supabase
        .from('blog_proposals')
        .update({ status: 'archived' })
        .eq('id', postId);

      if (error) throw error;

      // Remove from moderation queue
      setModerationQueue(prev => prev.filter(item => item.id !== itemId));
      
      return { success: true };
    } catch (err) {
      console.error('Error rejecting item:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to reject item' };
    }
  };

  useEffect(() => {
    fetchModerationQueue();

    // Refresh every 30 seconds
    const interval = setInterval(fetchModerationQueue, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    moderationQueue,
    loading,
    error,
    refreshQueue: fetchModerationQueue,
    approveItem,
    rejectItem
  };
};
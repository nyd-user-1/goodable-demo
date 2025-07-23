import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ProblemChat {
  id: string;
  user_id: string;
  problem_number: string;
  title: string;
  problem_statement: string;
  current_state: string;
  chat_session_id?: string;
  created_at: string;
  updated_at: string;
}

export const useProblemChats = () => {
  const [problemChats, setProblemChats] = useState<ProblemChat[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProblemChats = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('problem_chats')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error loading problem chats",
          description: "There was an error loading your problem chats.",
          variant: "destructive",
        });
        return;
      }

      setProblemChats(data || []);
    } catch (error) {
      toast({
        title: "Error loading problem chats",
        description: "There was an unexpected error loading your problem chats.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteProblemChat = async (chatId: string) => {
    try {
      const { error } = await supabase
        .from('problem_chats')
        .delete()
        .eq('id', chatId)
        .eq('user_id', user?.id);

      if (error) {
        toast({
          title: "Error deleting chat",
          description: "There was an error deleting the problem chat.",
          variant: "destructive",
        });
        return;
      }

      // Remove from local state
      setProblemChats(prev => prev.filter(chat => chat.id !== chatId));
      
      toast({
        title: "Chat deleted",
        description: "Problem chat has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error deleting chat",
        description: "There was an unexpected error deleting the problem chat.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProblemChats();
  }, [user]);

  return {
    problemChats,
    loading,
    deleteProblemChat,
    refetch: fetchProblemChats
  };
};
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ChatNote {
  id: string;
  user_id: string;
  parent_session_id: string | null;
  title: string;
  content: string;
  user_query: string | null;
  bill_id: number | null;
  member_id: number | null;
  committee_id: number | null;
  tags: string[];
  snippet: string;
  created_at: string;
  updated_at: string;
}

interface CreateNoteData {
  parentSessionId?: string;
  title: string;
  content: string;
  userQuery?: string;
  billId?: number;
  memberId?: number;
  committeeId?: number;
}

export const useNotePersistence = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // CREATE - Insert new note and return it
  const createNote = useCallback(async (data: CreateNoteData): Promise<ChatNote | null> => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }
    setLoading(true);
    setError(null);

    try {
      const { data: note, error: insertError } = await supabase
        .from('chat_notes')
        .insert({
          user_id: user.id,
          parent_session_id: data.parentSessionId || null,
          title: data.title,
          content: data.content,
          user_query: data.userQuery || null,
          bill_id: data.billId || null,
          member_id: data.memberId || null,
          committee_id: data.committeeId || null,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return note as ChatNote;
    } catch (err: any) {
      setError(err.message || 'Failed to create note');
      console.error('Error creating note:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // READ - Fetch user's notes
  const fetchNotes = useCallback(async (limit = 20): Promise<ChatNote[]> => {
    if (!user) return [];

    try {
      const { data, error: fetchError } = await supabase
        .from('chat_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (fetchError) throw fetchError;
      return (data as ChatNote[]) || [];
    } catch (err: any) {
      console.error('Error fetching notes:', err);
      return [];
    }
  }, [user]);

  // READ - Fetch single note by ID
  const fetchNoteById = useCallback(async (id: string): Promise<ChatNote | null> => {
    if (!user) return null;

    try {
      const { data, error: fetchError } = await supabase
        .from('chat_notes')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;
      return data as ChatNote;
    } catch (err: any) {
      console.error('Error fetching note:', err);
      return null;
    }
  }, [user]);

  // UPDATE - Update note content
  const updateNote = useCallback(async (id: string, updates: Partial<Pick<ChatNote, 'title' | 'content' | 'tags' | 'snippet'>>): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error: updateError } = await supabase
        .from('chat_notes')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;
      return true;
    } catch (err: any) {
      console.error('Error updating note:', err);
      return false;
    }
  }, [user]);

  // DELETE - Remove note
  const deleteNote = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error: deleteError } = await supabase
        .from('chat_notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;
      return true;
    } catch (err: any) {
      console.error('Error deleting note:', err);
      return false;
    }
  }, [user]);

  return {
    createNote,
    fetchNotes,
    fetchNoteById,
    updateNote,
    deleteNote,
    loading,
    error,
  };
};

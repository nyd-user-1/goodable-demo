import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface PolicyDraft {
  id: string;
  title: string;
  persona: string;
  userInput: string;
  aiOutput: string;
  createdAt: string;
}

export const usePolicyDrafts = () => {
  const [drafts, setDrafts] = useState<PolicyDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadDrafts = () => {
    if (!user) {
      setDrafts([]);
      setLoading(false);
      return;
    }

    try {
      const stored = localStorage.getItem(`policyDrafts_${user.id}`);
      if (stored) {
        setDrafts(JSON.parse(stored));
      }
    } catch (error) {
      // Error loading policy drafts - handled silently
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = (draft: Omit<PolicyDraft, 'id' | 'createdAt'>) => {
    if (!user) return;

    const newDraft: PolicyDraft = {
      ...draft,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };

    const updatedDrafts = [newDraft, ...drafts];
    setDrafts(updatedDrafts);
    
    try {
      localStorage.setItem(`policyDrafts_${user.id}`, JSON.stringify(updatedDrafts));
    } catch (error) {
      // Error saving policy draft - handled silently
    }

    return newDraft.id;
  };

  const deleteDraft = (draftId: string) => {
    if (!user) return;

    const updatedDrafts = drafts.filter(draft => draft.id !== draftId);
    setDrafts(updatedDrafts);
    
    try {
      localStorage.setItem(`policyDrafts_${user.id}`, JSON.stringify(updatedDrafts));
    } catch (error) {
      // Error deleting policy draft - handled silently
    }
  };

  useEffect(() => {
    loadDrafts();
  }, [user]);

  return {
    drafts,
    loading,
    saveDraft,
    deleteDraft,
    refetch: loadDrafts
  };
};
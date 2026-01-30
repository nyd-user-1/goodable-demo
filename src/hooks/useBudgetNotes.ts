import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface BudgetNote {
  id: string;
  content: string;
  created_at: string;
  updated_at?: string;
}

const generateNoteId = (): string => {
  return `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const getStorageKey = (userId: string, type: string, id: string): string => {
  return `budget-notes-${userId}-${type}-${id}`;
};

export const useBudgetNotes = (type: string | undefined, id: string | undefined) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<BudgetNote[]>([]);

  useEffect(() => {
    if (!user || !type || !id) {
      setNotes([]);
      return;
    }

    const storageKey = getStorageKey(user.id, type, id);
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setNotes(JSON.parse(stored));
      } catch {
        setNotes([]);
      }
    } else {
      setNotes([]);
    }
  }, [user, type, id]);

  const saveToStorage = useCallback((updatedNotes: BudgetNote[]) => {
    if (!user || !type || !id) return;
    const storageKey = getStorageKey(user.id, type, id);
    localStorage.setItem(storageKey, JSON.stringify(updatedNotes));
  }, [user, type, id]);

  const addNote = useCallback((content: string) => {
    const newNote: BudgetNote = {
      id: generateNoteId(),
      content,
      created_at: new Date().toISOString(),
    };
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    saveToStorage(updatedNotes);
  }, [notes, saveToStorage]);

  const updateNote = useCallback((noteId: string, content: string) => {
    const updatedNotes = notes.map(note =>
      note.id === noteId
        ? { ...note, content, updated_at: new Date().toISOString() }
        : note
    );
    setNotes(updatedNotes);
    saveToStorage(updatedNotes);
  }, [notes, saveToStorage]);

  const deleteNote = useCallback((noteId: string) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    setNotes(updatedNotes);
    saveToStorage(updatedNotes);
  }, [notes, saveToStorage]);

  return {
    notes,
    addNote,
    updateNote,
    deleteNote,
  };
};

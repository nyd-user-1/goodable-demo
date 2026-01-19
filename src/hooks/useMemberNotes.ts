import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface MemberNote {
  id: string;
  content: string;
  created_at: string;
  updated_at?: string;
}

// Generate unique ID for notes
const generateNoteId = (): string => {
  return `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Get storage key for a specific user and member
const getStorageKey = (userId: string, memberId: number): string => {
  return `member-notes-${userId}-${memberId}`;
};

export const useMemberNotes = (memberId: number) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<MemberNote[]>([]);

  // Load notes from localStorage
  useEffect(() => {
    if (!user || !memberId) {
      setNotes([]);
      return;
    }

    const storageKey = getStorageKey(user.id, memberId);
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
  }, [user, memberId]);

  // Save notes to localStorage
  const saveToStorage = useCallback((updatedNotes: MemberNote[]) => {
    if (!user || !memberId) return;
    const storageKey = getStorageKey(user.id, memberId);
    localStorage.setItem(storageKey, JSON.stringify(updatedNotes));
  }, [user, memberId]);

  // Add a new note
  const addNote = useCallback((content: string) => {
    const newNote: MemberNote = {
      id: generateNoteId(),
      content,
      created_at: new Date().toISOString(),
    };
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    saveToStorage(updatedNotes);
  }, [notes, saveToStorage]);

  // Update an existing note
  const updateNote = useCallback((noteId: string, content: string) => {
    const updatedNotes = notes.map(note =>
      note.id === noteId
        ? { ...note, content, updated_at: new Date().toISOString() }
        : note
    );
    setNotes(updatedNotes);
    saveToStorage(updatedNotes);
  }, [notes, saveToStorage]);

  // Delete a note
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

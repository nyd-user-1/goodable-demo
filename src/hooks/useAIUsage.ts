import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from './useSubscription';
import { isAdmin } from '@/utils/adminHelpers';

interface AIUsageData {
  wordsUsed: number;
  dailyLimit: number;
  lastResetDate: string;
}

// Word limits by subscription tier
const WORD_LIMITS: Record<string, number> = {
  free: 1000,
  student: 10000,
  staffer: 50000,
  researcher: 100000,
  professional: 500000,
  enterprise: Infinity,
  government: Infinity,
};

// Custom event name for syncing usage across components
const AI_USAGE_UPDATED_EVENT = 'ai-usage-updated';

const getStorageKey = (userId: string) => `ai_usage_${userId}`;

const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
};

export const useAIUsage = () => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [usage, setUsage] = useState<AIUsageData>({
    wordsUsed: 0,
    dailyLimit: WORD_LIMITS.free,
    lastResetDate: getTodayDateString(),
  });

  // Get the daily limit based on subscription tier
  const getDailyLimit = useCallback(() => {
    // Admins get unlimited words
    if (isAdmin(user?.email)) {
      return Infinity;
    }
    const tier = subscription?.subscription_tier || 'free';
    return WORD_LIMITS[tier] || WORD_LIMITS.free;
  }, [subscription, user?.email]);

  // Load usage from localStorage
  const loadUsage = useCallback(() => {
    if (!user?.id) return;

    const storageKey = getStorageKey(user.id);
    const stored = localStorage.getItem(storageKey);
    const today = getTodayDateString();
    const dailyLimit = getDailyLimit();

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AIUsageData;

        // Reset if it's a new day
        if (parsed.lastResetDate !== today) {
          const newUsage = {
            wordsUsed: 0,
            dailyLimit,
            lastResetDate: today,
          };
          localStorage.setItem(storageKey, JSON.stringify(newUsage));
          setUsage(newUsage);
        } else {
          setUsage({ ...parsed, dailyLimit });
        }
      } catch {
        // Invalid stored data, reset
        const newUsage = {
          wordsUsed: 0,
          dailyLimit,
          lastResetDate: today,
        };
        localStorage.setItem(storageKey, JSON.stringify(newUsage));
        setUsage(newUsage);
      }
    } else {
      // No stored data, initialize
      const newUsage = {
        wordsUsed: 0,
        dailyLimit,
        lastResetDate: today,
      };
      localStorage.setItem(storageKey, JSON.stringify(newUsage));
      setUsage(newUsage);
    }
  }, [user?.id, getDailyLimit]);

  // Add words to usage count
  const addWordsUsed = useCallback((wordCount: number) => {
    if (!user?.id) return;

    const storageKey = getStorageKey(user.id);
    const today = getTodayDateString();
    const dailyLimit = getDailyLimit();

    // Read current value from localStorage to get the latest
    const stored = localStorage.getItem(storageKey);
    let currentWordsUsed = 0;
    let lastResetDate = today;

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AIUsageData;
        // Reset if it's a new day
        if (parsed.lastResetDate === today) {
          currentWordsUsed = parsed.wordsUsed;
          lastResetDate = parsed.lastResetDate;
        }
      } catch {
        // Ignore parse errors
      }
    }

    const newWordsUsed = currentWordsUsed + wordCount;
    const newUsage = {
      wordsUsed: newWordsUsed,
      dailyLimit,
      lastResetDate: today,
    };

    // Save to localStorage
    localStorage.setItem(storageKey, JSON.stringify(newUsage));

    // Update local state
    setUsage(newUsage);

    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent(AI_USAGE_UPDATED_EVENT, {
      detail: { userId: user.id, wordsUsed: newWordsUsed }
    }));
  }, [user?.id, getDailyLimit]);

  // Check if user can make AI request
  const canMakeRequest = useCallback((estimatedWords: number = 0) => {
    const today = getTodayDateString();

    // Reset check for new day
    if (usage.lastResetDate !== today) {
      return true;
    }

    return usage.wordsUsed + estimatedWords <= usage.dailyLimit;
  }, [usage]);

  // Get remaining words
  const remainingWords = Math.max(0, usage.dailyLimit - usage.wordsUsed);

  // Get usage percentage
  const usagePercentage = usage.dailyLimit === Infinity
    ? 0
    : Math.min(100, (usage.wordsUsed / usage.dailyLimit) * 100);

  // Check if limit is exceeded
  const isLimitExceeded = usage.wordsUsed >= usage.dailyLimit && usage.dailyLimit !== Infinity;

  // Load usage on mount and when user changes
  useEffect(() => {
    loadUsage();
  }, [loadUsage]);

  // Listen for usage updates from other components
  useEffect(() => {
    const handleUsageUpdate = (event: CustomEvent) => {
      // Only refresh if it's for the same user
      if (event.detail?.userId === user?.id) {
        loadUsage();
      }
    };

    window.addEventListener(AI_USAGE_UPDATED_EVENT, handleUsageUpdate as EventListener);
    return () => {
      window.removeEventListener(AI_USAGE_UPDATED_EVENT, handleUsageUpdate as EventListener);
    };
  }, [user?.id, loadUsage]);

  // Update daily limit when subscription changes
  useEffect(() => {
    if (user?.id) {
      const dailyLimit = getDailyLimit();
      setUsage(prev => ({ ...prev, dailyLimit }));
    }
  }, [subscription, user?.id, getDailyLimit]);

  return {
    wordsUsed: usage.wordsUsed,
    dailyLimit: usage.dailyLimit,
    remainingWords,
    usagePercentage,
    isLimitExceeded,
    addWordsUsed,
    canMakeRequest,
    refreshUsage: loadUsage,
  };
};

// Utility function to count words in a string
export const countWords = (text: string): number => {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

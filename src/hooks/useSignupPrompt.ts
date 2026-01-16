import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'signupPromptShown';
const TIMER_DELAY = 7000; // 7 seconds
const SCROLL_THRESHOLD = 0.5; // 50% of page

interface UseSignupPromptReturn {
  shouldShowModal: boolean;
  dismissModal: () => void;
}

export const useSignupPrompt = (isUnauthenticated: boolean): UseSignupPromptReturn => {
  const [shouldShowModal, setShouldShowModal] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  // Check if already shown this session
  const alreadyShown = typeof window !== 'undefined' && sessionStorage.getItem(STORAGE_KEY) === 'true';

  // Don't run effects if user is authenticated or modal already shown
  const shouldTrack = isUnauthenticated && !alreadyShown && !hasTriggered;

  // Timer trigger: 7 seconds
  useEffect(() => {
    if (!shouldTrack) return;

    const timer = setTimeout(() => {
      setShouldShowModal(true);
      setHasTriggered(true);
    }, TIMER_DELAY);

    return () => clearTimeout(timer);
  }, [shouldTrack]);

  // Scroll trigger: 50% of page
  useEffect(() => {
    if (!shouldTrack) return;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return; // No scrollable content

      const scrollPercent = window.scrollY / scrollHeight;

      if (scrollPercent >= SCROLL_THRESHOLD) {
        setShouldShowModal(true);
        setHasTriggered(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [shouldTrack]);

  const dismissModal = useCallback(() => {
    setShouldShowModal(false);
    sessionStorage.setItem(STORAGE_KEY, 'true');
  }, []);

  // If authenticated or already shown, never show modal
  if (!isUnauthenticated || alreadyShown) {
    return { shouldShowModal: false, dismissModal: () => {} };
  }

  return { shouldShowModal, dismissModal };
};

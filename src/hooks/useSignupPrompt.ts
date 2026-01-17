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

  // Debug logging
  useEffect(() => {
    console.log('[SignupPrompt] State:', { isUnauthenticated, alreadyShown, hasTriggered, shouldTrack });
  }, [isUnauthenticated, alreadyShown, hasTriggered, shouldTrack]);

  // Timer trigger: 7 seconds
  useEffect(() => {
    if (!shouldTrack) {
      console.log('[SignupPrompt] Timer not starting - shouldTrack is false');
      return;
    }

    console.log('[SignupPrompt] Starting 7-second timer...');
    const timer = setTimeout(() => {
      console.log('[SignupPrompt] Timer fired! Showing modal.');
      setShouldShowModal(true);
      setHasTriggered(true);
    }, TIMER_DELAY);

    return () => clearTimeout(timer);
  }, [shouldTrack]);

  // Scroll trigger: 50% of page (handles both window and container scroll)
  useEffect(() => {
    if (!shouldTrack) return;

    const handleScroll = (e?: Event) => {
      // Try to find the scrollable container (the main content area)
      const scrollContainer = document.querySelector('.overflow-auto') as HTMLElement;

      let scrollPercent = 0;

      if (scrollContainer && scrollContainer.scrollHeight > scrollContainer.clientHeight) {
        // Container scroll
        const scrollHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight;
        scrollPercent = scrollContainer.scrollTop / scrollHeight;
      } else {
        // Window scroll fallback
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollHeight <= 0) return;
        scrollPercent = window.scrollY / scrollHeight;
      }

      if (scrollPercent >= SCROLL_THRESHOLD) {
        console.log('[SignupPrompt] Scroll threshold reached! Showing modal.');
        setShouldShowModal(true);
        setHasTriggered(true);
      }
    };

    // Listen to both window and any scrollable containers
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });

    // Also listen directly to the main content container
    const scrollContainer = document.querySelector('.overflow-auto');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
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

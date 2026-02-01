/** Fire a custom GA4 event. No-ops if gtag isn't loaded. */
export function trackEvent(name: string, params?: Record<string, string | number>) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, params);
  }
}

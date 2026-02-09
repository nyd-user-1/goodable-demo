import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeTheme } from './lib/theme';

// Initialize theme before rendering
initializeTheme();

// Load analytics only in production
if (import.meta.env.VERCEL_ENV === 'production') {
  // Google Analytics
  const gaScript = document.createElement('script');
  gaScript.async = true;
  gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-CQC033H832';
  document.head.appendChild(gaScript);

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) { window.dataLayer.push(args); }
  gtag('js', new Date());
  gtag('config', 'G-CQC033H832');
  (window as any).gtag = gtag;

  // HubSpot
  const hsScript = document.createElement('script');
  hsScript.id = 'hs-script-loader';
  hsScript.async = true;
  hsScript.defer = true;
  hsScript.src = '//js-na2.hs-scripts.com/245035447.js';
  document.head.appendChild(hsScript);
}

createRoot(document.getElementById("root")!).render(<App />);
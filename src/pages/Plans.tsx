import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubscriptionPlans } from '@/components/shared/SubscriptionPlans';
import { NoteViewSidebar } from '@/components/NoteViewSidebar';
import { cn } from '@/lib/utils';

export default function Plans() {
  const navigate = useNavigate();
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [sidebarMounted, setSidebarMounted] = useState(false);

  useEffect(() => {
    setSidebarMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Slide-in sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 bottom-0 w-[85vw] max-w-sm md:w-72 bg-background border-r z-[60]",
          sidebarMounted && "transition-transform duration-300 ease-in-out",
          leftSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <NoteViewSidebar onClose={() => setLeftSidebarOpen(false)} />
      </div>
      {leftSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-50 transition-opacity"
          onClick={() => setLeftSidebarOpen(false)}
        />
      )}

      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-40 px-5 py-2 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setLeftSidebarOpen(true)}
              className="inline-flex items-center justify-center h-10 w-10 rounded-md text-foreground hover:bg-muted transition-colors"
              aria-label="Open menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 5h1"/><path d="M3 12h1"/><path d="M3 19h1"/>
                <path d="M8 5h1"/><path d="M8 12h1"/><path d="M8 19h1"/>
                <path d="M13 5h8"/><path d="M13 12h8"/><path d="M13 19h8"/>
              </svg>
            </button>
          </div>
          <button
            onClick={() => navigate('/?prompt=What%20is%20NYSgpt%3F')}
            className="inline-flex items-center justify-center h-10 rounded-md px-3 text-foreground hover:bg-muted transition-colors font-semibold text-xl"
          >
            NYSgpt
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 pt-16">
        <div className="mx-auto max-w-[1300px] px-4 sm:px-6 py-6">
          <SubscriptionPlans />
        </div>
      </main>
    </div>
  );
}

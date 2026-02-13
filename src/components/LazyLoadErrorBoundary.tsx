import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Error boundary that catches "Stale Chunk Blank Screen" errors.
 *
 * After a Vercel deployment, old JS chunks are invalidated. If a user
 * navigates client-side with a cached index.html, React.lazy() tries
 * to fetch a chunk that no longer exists. Without this boundary the
 * app renders a blank white screen.
 *
 * Recovery: auto-reload the page once so the browser fetches the new
 * index.html and fresh chunk URLs.
 */
export class LazyLoadErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    const isChunkError =
      error.name === 'ChunkLoadError' ||
      error.message.includes('Loading chunk') ||
      error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('Importing a module script failed') ||
      error.message.includes('error loading dynamically imported module');

    if (isChunkError) {
      // Prevent infinite reload loops: only reload once per session
      const reloadKey = 'nysgpt_chunk_reload';
      const lastReload = sessionStorage.getItem(reloadKey);
      const now = Date.now();

      if (!lastReload || now - Number(lastReload) > 10_000) {
        sessionStorage.setItem(reloadKey, String(now));
        window.location.reload();
        return;
      }
    }

    console.error('LazyLoadErrorBoundary caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
          <p className="text-muted-foreground">Something went wrong loading this page.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-foreground text-background text-sm hover:opacity-90 transition-opacity"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

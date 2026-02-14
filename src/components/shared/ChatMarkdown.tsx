import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { autoLinkBills } from '@/utils/autoLinkBills';
import { normalizeBillNumber } from '@/utils/billNumberUtils';

/**
 * Rewrite known external NYS URLs to internal paths.
 * e.g. nysenate.gov/legislation/bills/2025/S1234 → /bills/S1234
 */
function rewriteExternalUrl(href: string): string | null {
  try {
    const url = new URL(href, 'https://placeholder.com');

    if (
      url.hostname.includes('nysenate.gov') &&
      url.pathname.includes('/legislation/bills/')
    ) {
      const segments = url.pathname.split('/');
      const billNum = segments[segments.length - 1];
      if (billNum && /^[ASJK]\d+[A-Z]?$/i.test(billNum)) {
        return `/bills/${normalizeBillNumber(billNum)}`;
      }
    }

    return null;
  } catch {
    return null;
  }
}

interface ChatMarkdownProps {
  children: string;
}

export function ChatMarkdown({ children }: ChatMarkdownProps) {
  const processed = autoLinkBills(children);

  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => (
          <p className="mb-3 leading-relaxed text-foreground">{children}</p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-foreground">{children}</strong>
        ),
        h1: ({ children }) => (
          <h1 className="text-xl font-semibold mb-3 text-foreground">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-lg font-semibold mb-2 text-foreground">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-base font-semibold mb-2 text-foreground">
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-sm font-semibold mb-1 text-foreground">
            {children}
          </h4>
        ),
        ul: ({ children }) => (
          <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-6 space-y-1 my-2">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-foreground text-sm">{children}</li>
        ),
        a: ({ href, children }) => {
          if (!href) return <span>{children}</span>;

          // Internal path → React Router Link (SPA navigation)
          if (href.startsWith('/')) {
            return (
              <Link
                to={href}
                className="text-blue-500 hover:text-blue-600 underline"
              >
                {children}
              </Link>
            );
          }

          // Rewrite known external NYS URLs to internal paths
          const internalPath = rewriteExternalUrl(href);
          if (internalPath) {
            return (
              <Link
                to={internalPath}
                className="text-blue-500 hover:text-blue-600 underline"
              >
                {children}
              </Link>
            );
          }

          // External link — open in new tab
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 underline"
            >
              {children}
            </a>
          );
        },
      }}
    >
      {processed}
    </ReactMarkdown>
  );
}

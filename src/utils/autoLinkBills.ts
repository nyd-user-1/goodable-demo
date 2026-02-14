import { normalizeBillNumber } from './billNumberUtils';

/**
 * Auto-link unlinked bill numbers in markdown text.
 *
 * Converts plain "S1528" or "A100" references into [S1528](/bills/S1528).
 * Skips bill numbers already inside markdown link syntax to avoid double-linking.
 *
 * Pattern: A, S, J, or K prefix followed by 3+ digits, optional amendment letter.
 * Examples: S1234, A100, S256A, J5678
 */
export function autoLinkBills(markdown: string): string {
  if (!markdown) return '';

  // Negative lookbehind: skip if preceded by [ (link text) or / (URL path)
  // Negative lookahead: skip if followed by ] or ) (already inside link syntax)
  // Also skip if followed by more digits (avoid partial matches inside longer numbers)
  return markdown.replace(
    /(?<!\[|\/|\w)([ASJK]\d{3,}[A-Z]?)(?!\]|\)|\d)/gi,
    (match) => {
      const normalized = normalizeBillNumber(match);
      return `[${normalized}](/bills/${normalized})`;
    },
  );
}

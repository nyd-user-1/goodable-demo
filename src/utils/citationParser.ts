/**
 * Citation Parser Utility
 * Parses and formats Perplexity AI citations from responses
 */

export interface PerplexityCitation {
  number: number;
  url: string;
  title?: string;
  excerpt?: string;
}

export interface ParsedContent {
  text: string;
  citations: number[];
}

/**
 * Parse citation markers [1], [2], etc. from text
 * Returns array of segments with text and citation numbers
 */
export function parseInlineCitations(text: string): ParsedContent[] {
  const segments: ParsedContent[] = [];
  const citationPattern = /\[(\d+)\]/g;

  let lastIndex = 0;
  let match;

  while ((match = citationPattern.exec(text)) !== null) {
    // Add text before citation
    if (match.index > lastIndex) {
      segments.push({
        text: text.substring(lastIndex, match.index),
        citations: []
      });
    }

    // Add citation marker
    const citationNumber = parseInt(match[1]);
    segments.push({
      text: '',
      citations: [citationNumber]
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({
      text: text.substring(lastIndex),
      citations: []
    });
  }

  return segments;
}

/**
 * Extract all unique citation numbers from text
 */
export function extractCitationNumbers(text: string): number[] {
  const citationPattern = /\[(\d+)\]/g;
  const numbers = new Set<number>();

  let match;
  while ((match = citationPattern.exec(text)) !== null) {
    numbers.add(parseInt(match[1]));
  }

  return Array.from(numbers).sort((a, b) => a - b);
}

/**
 * Remove citation markers from text (for plain text display)
 */
export function stripCitations(text: string): string {
  return text.replace(/\[(\d+)\]/g, '');
}

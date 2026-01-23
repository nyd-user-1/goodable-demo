/**
 * Markdown to HTML conversion utilities for TipTap editor
 *
 * Note: TipTap works natively with HTML. These utilities help convert
 * existing markdown content to HTML for the editor.
 */

/**
 * Convert markdown text to HTML for TipTap editor
 * This is a simple converter that handles common markdown patterns
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';

  let html = markdown;

  // Escape HTML entities first (except for intentional HTML)
  // html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Convert code blocks (must be done before other conversions)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre><code class="language-${lang || 'text'}">${code.trim()}</code></pre>`;
  });

  // Convert inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Convert headers (must check for # at start of line or after newline)
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Convert bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Convert strikethrough
  html = html.replace(/~~(.+?)~~/g, '<s>$1</s>');

  // Convert links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Convert unordered lists
  html = html.replace(/^[\*\-] (.+)$/gm, '<li>$1</li>');

  // Convert ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // Wrap consecutive list items in ul/ol tags
  html = html.replace(/(<li>[\s\S]*?<\/li>(\n|$))+/g, (match) => {
    // Check if it was an ordered list (started with numbers)
    // For simplicity, we'll use ul for all
    return `<ul>${match}</ul>`;
  });

  // Convert blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

  // Convert horizontal rules
  html = html.replace(/^---$/gm, '<hr>');
  html = html.replace(/^\*\*\*$/gm, '<hr>');

  // Convert line breaks and paragraphs
  // Split by double newlines for paragraphs
  const blocks = html.split(/\n\n+/);
  html = blocks
    .map((block) => {
      block = block.trim();
      // Don't wrap if it's already wrapped in a block element
      if (
        block.startsWith('<h') ||
        block.startsWith('<ul') ||
        block.startsWith('<ol') ||
        block.startsWith('<pre') ||
        block.startsWith('<blockquote') ||
        block.startsWith('<hr')
      ) {
        return block;
      }
      // Convert single newlines to <br> and wrap in <p>
      if (block) {
        return `<p>${block.replace(/\n/g, '<br>')}</p>`;
      }
      return '';
    })
    .filter(Boolean)
    .join('\n');

  return html;
}

/**
 * Convert HTML to markdown for storage (optional)
 * Note: For simplicity, we recommend storing as HTML going forward
 */
export function htmlToMarkdown(html: string): string {
  if (!html) return '';

  let markdown = html;

  // Convert headings
  markdown = markdown.replace(/<h1[^>]*>(.+?)<\/h1>/gi, '# $1\n\n');
  markdown = markdown.replace(/<h2[^>]*>(.+?)<\/h2>/gi, '## $1\n\n');
  markdown = markdown.replace(/<h3[^>]*>(.+?)<\/h3>/gi, '### $1\n\n');

  // Convert bold and italic
  markdown = markdown.replace(/<strong><em>(.+?)<\/em><\/strong>/gi, '***$1***');
  markdown = markdown.replace(/<em><strong>(.+?)<\/strong><\/em>/gi, '***$1***');
  markdown = markdown.replace(/<strong[^>]*>(.+?)<\/strong>/gi, '**$1**');
  markdown = markdown.replace(/<b[^>]*>(.+?)<\/b>/gi, '**$1**');
  markdown = markdown.replace(/<em[^>]*>(.+?)<\/em>/gi, '*$1*');
  markdown = markdown.replace(/<i[^>]*>(.+?)<\/i>/gi, '*$1*');

  // Convert underline (no markdown equivalent, keep as-is or use HTML)
  markdown = markdown.replace(/<u[^>]*>(.+?)<\/u>/gi, '<u>$1</u>');

  // Convert strikethrough
  markdown = markdown.replace(/<s[^>]*>(.+?)<\/s>/gi, '~~$1~~');
  markdown = markdown.replace(/<del[^>]*>(.+?)<\/del>/gi, '~~$1~~');

  // Convert links
  markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.+?)<\/a>/gi, '[$2]($1)');

  // Convert code blocks
  markdown = markdown.replace(/<pre[^>]*><code[^>]*class="language-([^"]*)"[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```$1\n$2\n```\n\n');
  markdown = markdown.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```\n\n');

  // Convert inline code
  markdown = markdown.replace(/<code[^>]*>(.+?)<\/code>/gi, '`$1`');

  // Convert lists
  markdown = markdown.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, content) => {
    return content.replace(/<li[^>]*>(.+?)<\/li>/gi, '- $1\n') + '\n';
  });
  markdown = markdown.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, content) => {
    let index = 1;
    return content.replace(/<li[^>]*>(.+?)<\/li>/gi, () => `${index++}. $1\n`) + '\n';
  });

  // Convert blockquotes
  markdown = markdown.replace(/<blockquote[^>]*>(.+?)<\/blockquote>/gi, '> $1\n\n');

  // Convert horizontal rules
  markdown = markdown.replace(/<hr[^>]*>/gi, '---\n\n');

  // Convert paragraphs
  markdown = markdown.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n');

  // Convert line breaks
  markdown = markdown.replace(/<br[^>]*>/gi, '\n');

  // Remove remaining HTML tags
  markdown = markdown.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  markdown = markdown
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  // Clean up extra whitespace
  markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();

  return markdown;
}

/**
 * Detect if content is HTML or markdown
 */
export function isHtml(content: string): boolean {
  // Simple check for common HTML tags
  return /<(p|div|h[1-6]|ul|ol|li|strong|em|a|code|pre|blockquote)[^>]*>/i.test(content);
}

/**
 * Ensure content is HTML (convert from markdown if needed)
 */
export function ensureHtml(content: string): string {
  if (!content) return '';
  if (isHtml(content)) return content;
  return markdownToHtml(content);
}

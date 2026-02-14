/**
 * SSE Stream Parser
 *
 * Shared utility for parsing Server-Sent Events (SSE) streams from
 * Supabase edge functions. Handles both OpenAI and Claude response formats.
 *
 * Also provides a helper for non-streaming (JSON) responses.
 */

/**
 * Parses an SSE stream and calls `onContent` with each content chunk.
 * Returns the full accumulated response text.
 *
 * Supported formats:
 *   - OpenAI:  `choices[0].delta.content`
 *   - Claude:  `delta.text`
 */
export async function parseSSEStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onContent: (chunk: string, accumulated: string) => void,
): Promise<string> {
  const decoder = new TextDecoder();
  let accumulated = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;

      const data = line.slice(6);
      if (data === '[DONE]') continue;

      try {
        const parsed = JSON.parse(data);
        let content = '';

        // OpenAI format
        if (parsed.choices?.[0]?.delta?.content) {
          content = parsed.choices[0].delta.content;
        }
        // Claude format
        else if (parsed.delta?.text) {
          content = parsed.delta.text;
        }

        if (content) {
          accumulated += content;
          onContent(content, accumulated);
        }
      } catch {
        // Skip unparseable lines (partial JSON, comments, etc.)
      }
    }
  }

  return accumulated;
}

/**
 * Extracts content from a non-streaming JSON response.
 * Used for Perplexity and other non-streaming endpoints.
 */
export function extractNonStreamingContent(data: Record<string, unknown>): string {
  const text = (data as any).generatedText || (data as any).choices?.[0]?.message?.content || '';
  return String(text);
}

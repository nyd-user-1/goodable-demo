import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { CONSTITUTIONAL_CORE } from '../_shared/constitution.ts';

const perplexityApiKey = Deno.env.get("PERPLEXITY_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

// Interface for Perplexity citation
interface PerplexityCitation {
  id: string;
  index: number;
  url: string;
  title?: string;
  snippet?: string;
  publishedDate?: string;
  author?: string;
  favicon?: string;
}

// Extract favicon URL from domain
const getFaviconUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
  } catch {
    return '';
  }
};

// Process Perplexity citations array into our format
const processCitations = (citations: string[] | undefined): PerplexityCitation[] => {
  if (!citations || !Array.isArray(citations)) return [];

  return citations.map((url, index) => ({
    id: `citation-${index + 1}`,
    index: index + 1,
    url: url,
    favicon: getFaviconUrl(url)
  }));
};

const getSystemPrompt = (customSystemContext?: string) => {
  const today = new Date().toISOString().split("T")[0];
  const basePrompt = `${CONSTITUTIONAL_CORE}

---

You are an expert legislative research analyst for New York State.
Today's date: ${today}

Your job is to find verified, up-to-date information about NYS legislation
from authoritative sources. Always cite credible outlets like:
- Official: nysenate.gov, assembly.state.ny.us, governor.ny.gov
- News: Times Union, NY Times, Politico NY, City & State NY, Gothamist
- Analysis: Empire Center, Fiscal Policy Institute, Citizens Budget Commission

When given context, cross-reference it with your findings.
Always cite your sources, date all time-sensitive info,
and focus on developments from the past 30 days.

When analyzing legislation, consider impacts on working families and middle-class Americans.`;

  // Add custom system context if provided (e.g., for "What is NYSgpt.dev?" prompt)
  if (customSystemContext) {
    return `${customSystemContext}\n\n${basePrompt}`;
  }

  return basePrompt;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    let body;
    try {
      body = await req.json();
    } catch {
      throw new Error("Invalid JSON. Please send a valid JSON body with a 'prompt' field.");
    }

    const { prompt, model = "sonar-pro", context = null, temperature = 0.4, stream = true, domainFiltering = null } = body;

    if (!prompt) throw new Error("Missing required 'prompt' field.");
    if (!perplexityApiKey) throw new Error("Perplexity API key not configured.");

    // Extract systemContext if context is an object
    const systemContext = typeof context === 'object' && context?.systemContext ? context.systemContext : undefined;
    const contextData = typeof context === 'object' ? JSON.stringify(context) : context;

    const userMessage = contextData
      ? `# Relevant Legislative Data\n${contextData}\n\n# Research Request\n${prompt}`
      : prompt;

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${perplexityApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: getSystemPrompt(systemContext) },
          { role: "user", content: userMessage }
        ],
        temperature,
        max_tokens: 2000,
        top_p: 0.9,
        stream: stream
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Perplexity API error:", error);
      throw new Error(`Perplexity API returned ${response.status}: ${error}`);
    }

    if (stream) {
      // Pass through the streaming response directly
      // Citations will be extracted client-side from the content
      return new Response(response.body, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    } else {
      // Return complete response with citations
      const data = await response.json();
      const generatedText = data.choices?.[0]?.message?.content ?? "";
      const citations = processCitations(data.citations);

      return new Response(
        JSON.stringify({ generatedText, model, citations }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error in generate-with-perplexity:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

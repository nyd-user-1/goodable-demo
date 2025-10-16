import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const perplexityApiKey = Deno.env.get("PERPLEXITY_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const getSystemPrompt = () => {
  const today = new Date().toISOString().split("T")[0];
  return `You are an expert legislative research analyst for New York State.
Today's date: ${today}

Your job is to find verified, up-to-date information about NYS legislation
from authoritative sources. Always cite credible outlets like:
- Official: nysenate.gov, assembly.state.ny.us, governor.ny.gov
- News: Times Union, NY Times, Politico NY, City & State NY, Gothamist
- Analysis: Empire Center, Fiscal Policy Institute, Citizens Budget Commission

When given context, cross-reference it with your findings.
Always cite your sources, date all time-sensitive info,
and focus on developments from the past 30 days.`;
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

    const userMessage = context
      ? `# Relevant Legislative Data\n${context}\n\n# Research Request\n${prompt}`
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
          { role: "system", content: getSystemPrompt() },
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
      // Return streaming response
      return new Response(response.body, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    } else {
      // Return complete response
      const data = await response.json();
      const generatedText = data.choices?.[0]?.message?.content ?? "";

      return new Response(
        JSON.stringify({ generatedText, model }),
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

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// Streamlined Perplexity system prompt for Goodable
const PERPLEXITY_SYSTEM_PROMPT = `You are an expert legislative research analyst for New York State. Your specialty is finding current, verified information about NYS legislation through real-time web research.

## Today's Date
${new Date().toISOString().split('T')[0]}

## Your Core Strengths
- **Real-Time Research**: Find the latest news, developments, and coverage of NY legislation
- **Source Verification**: Always cite credible sources with links when possible
- **Comprehensive Analysis**: Cross-reference multiple sources for accuracy
- **NYS Focus**: Prioritize official NY government sources, major NY news outlets, and recognized policy organizations

## Key Sources to Prioritize
- Official: nysenate.gov, assembly.state.ny.us, governor.ny.gov
- News: Times Union, NY Times, Politico NY, City & State NY, Gothamist
- Analysis: Empire Center, Fiscal Policy Institute, Citizens Budget Commission

## Response Guidelines
1. **Always Cite Sources**: Include [Source: Name/Outlet] after claims
2. **Date Everything**: "As of [date]..." for time-sensitive information
3. **Be Comprehensive**: Research multiple perspectives on controversial bills
4. **Stay Current**: Prioritize recent news and developments (last 7-30 days)
5. **Cross-Reference**: Verify important claims with multiple sources
6. **Be Transparent**: Note when information is limited or conflicting

## When Given Legislative Database Context
Cross-reference the bill data provided with your real-time research to find:
- Recent news coverage and developments
- Stakeholder positions and statements
- Expert analysis and commentary
- Latest committee actions or votes
- Media coverage and editorial positions

Your mission: Provide thoroughly researched, properly cited, up-to-date intelligence about New York State legislation that empowers informed democratic participation.`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      prompt,
      model = 'llama-3.1-sonar-large-128k-online',
      context = null,
      temperature = 0.4 // Balanced for accuracy and engagement
    } = await req.json();

    console.log('Generating with Perplexity:', {
      model,
      promptLength: prompt?.length,
      hasContext: !!context
    });

    if (!perplexityApiKey) {
      console.error('Perplexity API key not configured');
      throw new Error('Perplexity requires API key to be configured in Supabase Edge Function Secrets');
    }

    // Build the user message with context if available
    let userMessage = prompt;
    if (context) {
      userMessage = `# Relevant Legislative Data from Goodable Database

${context}

---

# Research Request

${prompt}

---

Please research this using your real-time search capabilities. Cross-reference the database information with current news, recent developments, and stakeholder positions. Include citations for all claims and focus on information from the past week to month.`;
    }

    // Call Perplexity API with optimized parameters
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: PERPLEXITY_SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: temperature,
        max_tokens: 2000,
        top_p: 0.9,
        return_citations: true,
        return_related_questions: false,
        search_recency_filter: 'week' // Optimized for legislative developments
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Perplexity API error:', error);

      // Enhanced error handling for common issues
      if (response.status === 429) {
        throw new Error('API rate limit exceeded. Please try again in a moment.');
      } else if (response.status === 401) {
        throw new Error('Invalid Perplexity API key. Please check your configuration.');
      } else {
        throw new Error(`Perplexity API error: ${response.status} - ${error}`);
      }
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    console.log('Perplexity research completed successfully');

    // Return simplified response matching Claude function structure
    return new Response(
      JSON.stringify({
        generatedText,
        model: model
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error in generate-with-perplexity function:', error);

    return new Response(
      JSON.stringify({
        error: error.message
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});

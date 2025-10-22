import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
const nysApiKey = Deno.env.get('NYS_LEGISLATION_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get current NY legislative session year (odd years)
function getCurrentSessionYear(): number {
  const currentYear = new Date().getFullYear();
  // NY legislative sessions run on odd years
  return currentYear % 2 === 1 ? currentYear : currentYear - 1;
}

// Search Goodable's Supabase database for relevant bills
async function searchGoodableDatabase(query: string, sessionYear?: number) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract bill numbers from query (e.g., A00405, S12345, K00123)
    const billNumberPattern = /[ASK]\d{4,}/gi;
    const billNumbers = query.match(billNumberPattern) || [];

    console.log('Searching Goodable database with query:', query.substring(0, 100));
    console.log('Extracted bill numbers:', billNumbers);

    let results: any[] = [];

    // If specific bill numbers mentioned, fetch those
    if (billNumbers.length > 0) {
      const { data, error } = await supabase
        .from('Bills')
        .select('*')
        .in('bill_number', billNumbers.map(b => b.toUpperCase()))
        .limit(10);

      if (!error && data) {
        results = data;
        console.log(`Found ${data.length} bills by number`);
      }
    }

    // If no results yet, do keyword search
    if (results.length === 0) {
      const stopWords = ['the', 'a', 'an', 'in', 'on', 'at', 'for', 'to', 'of', 'and', 'or', 'but', 'bills', 'bill', 'legislation', 'about', 'tell', 'me', 'any', 'introduced', 'great', 'now'];

      // Extract keywords (filter out stop words, take top 3)
      const keywordArray = query
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.includes(word))
        .slice(0, 3);

      console.log('Extracted keywords:', keywordArray);

      if (keywordArray.length > 0) {
        // Build OR conditions for each keyword
        const orConditions = keywordArray.flatMap(keyword => [
          `title.ilike.%${keyword}%`,
          `description.ilike.%${keyword}%`
        ]).join(',');

        const { data, error } = await supabase
          .from('Bills')
          .select('*')
          .or(orConditions)
          .order('session_id', { ascending: false })
          .limit(10);

        if (!error && data) {
          results = data;
          console.log(`Found ${data.length} bills for keywords: ${keywordArray.join(', ')}`);
        } else if (error) {
          console.error('Keyword search error:', error);
        }
      }
    }

    return results;
  } catch (error) {
    console.error('Error searching Goodable database:', error);
    return [];
  }
}

// Search NYS Legislature API for live data
async function searchNYSData(query: string) {
  if (!nysApiKey) {
    console.log('NYS API key not available, skipping live legislative data search');
    return null;
  }

  try {
    const sessionYear = getCurrentSessionYear();
    const searchTypes = ['bills'];
    const results: any = {};

    for (const searchType of searchTypes) {
      try {
        const apiUrl = `https://legislation.nysenate.gov/api/3/${searchType}/search?term=${encodeURIComponent(query)}&limit=10&key=${nysApiKey}`;

        const response = await fetch(apiUrl);

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.result?.items?.length > 0) {
            results[searchType] = data.result.items.slice(0, 5);
            console.log(`Found ${results[searchType].length} ${searchType} from NYS API`);
          }
        }
      } catch (error) {
        console.error(`Error searching NYS API ${searchType}:`, error);
      }
    }

    return Object.keys(results).length > 0 ? results : null;
  } catch (error) {
    console.error('Error in NYS data search:', error);
    return null;
  }
}

// Format NYS API data for context
function formatNYSDataForContext(nysData: any) {
  if (!nysData) return '';

  let contextText = '\n\nLIVE NYS LEGISLATURE API DATA:\n\n';

  if (nysData.bills) {
    contextText += 'CURRENT BILLS FROM NYS API:\n';
    nysData.bills.forEach((bill: any, index: number) => {
      contextText += `${index + 1}. BILL ${bill.result?.printNo || bill.result?.basePrintNo}: ${bill.result?.title || 'No title'}\n`;
      contextText += `   Current Status: ${bill.result?.status?.statusDesc || 'Unknown'}\n`;
      contextText += `   Primary Sponsor: ${bill.result?.sponsor?.member?.shortName || 'Unknown'}\n`;
      if (bill.result?.status?.committeeName) {
        contextText += `   Committee: ${bill.result.status.committeeName}\n`;
      }
      contextText += '\n';
    });
  }

  return contextText;
}

// Format Goodable database results for context
function formatGoodableBillsForContext(bills: any[]) {
  if (!bills || bills.length === 0) return '';

  let contextText = '\n\nGOODABLE DATABASE - BILLS FROM SUPABASE:\n\n';

  bills.forEach((bill, index) => {
    contextText += `${index + 1}. BILL ${bill.bill_number}: ${bill.title || 'No title'}\n`;
    contextText += `   Session: ${bill.session_id || 'Unknown'}\n`;
    contextText += `   Status: ${bill.status_desc || 'Unknown'}\n`;
    if (bill.committee) {
      contextText += `   Committee: ${bill.committee}\n`;
    }
    if (bill.description) {
      contextText += `   Description: ${bill.description.substring(0, 200)}${bill.description.length > 200 ? '...' : ''}\n`;
    }
    contextText += '\n';
  });

  return contextText;
}

// Claude-specific system prompt for Goodable
const CLAUDE_SYSTEM_PROMPT = `# System Prompt for Goodable NY State Legislative Analysis AI

You are an expert legislative analyst for New York State with comprehensive knowledge of state government operations, legislative processes, and policy analysis. You assist users of Goodable, a legislative policy platform, in understanding and analyzing NYS legislation.

## Your Core Identity

You are a knowledgeable, impartial policy analyst who combines deep expertise in New York State government with the ability to explain complex legislation in clear, accessible language. You provide evidence-based analysis while maintaining professional objectivity.

## Available Data & Context

You have DIRECT ACCESS to comprehensive, up-to-date legislative data through TWO sources:

1. **Goodable's Complete Database (Supabase)**:
   - Contains ALL New York State bills from multiple sessions including current and future sessions (2023, 2024, 2025, and beyond)
   - The system automatically searches this database for relevant bills based on user queries
   - Returns bill metadata: bill numbers, titles, descriptions, sponsors, status, committee assignments

2. **User-provided context**:
   - Bill texts, PDFs, or specific legislative documents
   - Context from their current view or research

**IMPORTANT**: When users ask about bills from 2025 or the current session, you have COMPLETE ACCESS to this data through the Goodable database. The database is searched automatically and relevant bills are provided to you. Always use the specific bill data provided to you in each conversation.

## Response Framework

### For Bill Analysis Questions
Structure your responses with:

1. **Executive Summary** (2-3 sentences): What the bill does in plain language
2. **Key Provisions**: Specific sections and their effects, citing actual bill language
3. **Fiscal Impact**: Cost estimates, funding sources, budget implications (be specific or acknowledge when data is unavailable)
4. **Stakeholder Analysis**: Who benefits, who's affected, potential opposition/support
5. **Political Context**: Sponsor background, committee assignment significance, likelihood of passage based on sponsor influence, committee composition, and party dynamics
6. **District Impact** (when relevant): How this affects specific regions or districts

### For Quick Review/Recommendation Requests
Provide a structured assessment:

**RECOMMENDATION: [Support/Oppose/Neutral - With Confidence Level]**

- **Rationale**: 3-4 key reasons for your assessment
- **Fiscal Impact**: Budget effect in concrete terms
- **Primary Beneficiaries**: Who this helps
- **Potential Concerns**: Risks, opposition arguments, implementation challenges
- **Political Viability**: Realistic passage outlook based on sponsorship, committee, and political climate

### For Legislator/Committee Questions
Include:
- Full names, titles, party (D/R/Other), district numbers
- Committee memberships and leadership positions
- Relevant voting patterns or policy priorities
- Relationship to the bill in question

## Response Principles

**BE SPECIFIC**:
- Use actual bill numbers (e.g., "Senate Bill S1234A")
- Name specific legislators (e.g., "Senator Jane Smith (D-SD12)")
- Cite exact committee names (e.g., "Assembly Standing Committee on Education")
- Reference specific bill sections (e.g., "Section 3(b) amends Education Law §212")

**BE CLEAR**:
- Avoid jargon; when technical terms are necessary, explain them
- Use bullet points and structured formatting for readability
- Highlight key takeaways

**BE ACTIONABLE**:
- Provide concrete insights users can act on
- Connect legislative details to real-world impacts
- Explain "so what?" - why this matters

**BE CONTEXTUAL**:
- If a user is viewing a bill PDF, reference specific sections they might be reading
- Connect related bills, amendments, or prior legislative history
- Link legislators to their committee roles and influence

**BE HONEST ABOUT LIMITATIONS**:
- If fiscal data isn't available, say so and explain what analysis is possible
- Acknowledge when passage likelihood is uncertain
- Distinguish between facts and informed speculation

## Special Capabilities

- **Cross-referencing**: Connect bills to related legislation, amendments, and legislative history
- **Pattern recognition**: Identify trends in legislator voting, committee actions, or policy areas
- **Impact projection**: Analyze how bills affect different stakeholder groups, regions, or industries
- **Process guidance**: Explain where a bill is in the legislative process and what comes next

## Tone & Style

- **Conversational yet authoritative**: Speak like a knowledgeable colleague, not a textbook
- **Impartial but not bland**: Present clear analysis without partisan bias
- **Empowering**: Help users feel confident in understanding and engaging with legislation
- **Efficient**: Respect user time - be comprehensive but concise

## Example Response Patterns

**User: "What does Bill S1234 actually do?"**
→ Lead with plain-language summary, then break down key provisions with specific section references, conclude with significance and stakeholders.

**User: "Should I support this bill?"**
→ Provide structured recommendation with clear reasoning, fiscal impact, beneficiaries, concerns, and political context.

**User: "How does this affect my district?"**
→ Ask for district if not specified, then analyze geographic/demographic impacts with specifics.

**User: "What's the likelihood of passage?"**
→ Assess based on sponsor influence, committee composition, party control, similar bill history, and current political climate.

## Your Mission

Enable every Goodable user - whether citizen, staffer, researcher, or professional - to deeply understand New York State legislation and make informed decisions about policy. You make the complex accessible and empower democratic engagement through knowledge.

---

**Remember**: You're not just providing information; you're translating legislative complexity into actionable insight. Every response should leave the user more informed and confident about NYS legislation.`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      prompt,
      model = 'claude-3-5-haiku-20241022',
      stream = true,
      context = null,
      domainFiltering = null,
      type = 'chat',
      fastMode = type === 'chat'
    } = await req.json();

    console.log('Generating with Claude:', { model, promptLength: prompt?.length, hasContext: !!context, stream, fastMode });

    if (!anthropicApiKey) {
      console.error('Anthropic API key not configured');
      throw new Error('Claude requires Anthropic API key to be configured in Supabase Edge Function Secrets');
    }

    // Search Goodable database AND conditionally search NYS API
    let goodableBills: any[] = [];
    let nysData: any = null;

    // Fast-path detection: skip NYS API for simple chat queries in fast mode
    // BUT always search Goodable database for legislative queries
    const shouldSkipNYSData = fastMode && !prompt.match(/[ASK]\d{5,}/gi) && type !== 'media' && context !== 'landing_page';

    // Start data searches in parallel (non-blocking)
    let nysDataPromise: Promise<any> | null = null;
    const goodableDataPromise = searchGoodableDatabase(prompt, getCurrentSessionYear());

    // Start NYS API search if appropriate
    if (nysApiKey && !shouldSkipNYSData) {
      nysDataPromise = searchNYSData(prompt);
    }

    // IMPORTANT: Always wait for Goodable database search before generating response
    // This ensures AI has context even for streaming responses
    goodableBills = await goodableDataPromise;
    console.log(`Goodable database search found ${goodableBills?.length || 0} bills`);

    // For non-streaming, also wait for NYS API data
    if (!stream && nysDataPromise) {
      nysData = await nysDataPromise;
      console.log(`NYS API search found ${nysData?.bills?.length || 0} bills`);
    } else if (shouldSkipNYSData) {
      console.log('Skipping NYS API search (fast mode enabled)');
    }

    // Build enhanced context with all available information
    let legislativeContext = '';

    // Add Goodable database results
    if (goodableBills && goodableBills.length > 0) {
      legislativeContext += formatGoodableBillsForContext(goodableBills);
    }

    // Add NYS API results
    if (nysData) {
      legislativeContext += formatNYSDataForContext(nysData);
    }

    // Build the enhanced system prompt with legislative data
    let enhancedSystemPrompt = CLAUDE_SYSTEM_PROMPT;
    if (legislativeContext) {
      enhancedSystemPrompt += `\n\nCURRENT LEGISLATIVE DATA:\n${legislativeContext}\n\nUse this information to provide accurate, up-to-date legislative analysis with specific details.`;
    }

    // Build user message
    const userMessage = legislativeContext
      ? `${prompt}\n\n[IMPORTANT: Use the comprehensive legislative database information provided in your system context to give specific, detailed answers with exact bill numbers, titles, and current information.]`
      : prompt;

    // Call Claude API with correct authentication header
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,  // CORRECT: Use x-api-key, not Authorization Bearer
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: userMessage
        }],
        system: enhancedSystemPrompt,  // Send enhanced system prompt with legislative data
        temperature: 0.7,
        stream: stream,  // Enable streaming
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Claude API error:', error);
      throw new Error(`Claude API error: ${response.status} - ${error}`);
    }

    if (stream) {
      // Return streaming response
      return new Response(response.body, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Return complete response
      const data = await response.json();
      const generatedText = data.content[0].text;

      console.log('Claude response generated successfully');

      return new Response(JSON.stringify({
        generatedText,
        model: model
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in generate-with-claude function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

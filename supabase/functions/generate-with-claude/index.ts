import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
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
      const stopWords = [
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'about', 'as', 'into', 'through', 'during',
        'before', 'after', 'above', 'below', 'between', 'under', 'again',
        'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
        'how', 'all', 'both', 'each', 'few', 'more', 'most', 'other', 'some',
        'such', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'can',
        'will', 'just', 'should', 'now', 'tell', 'me', 'you', 'it', 'is', 'are',
        'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
        'did', 'would', 'could', 'their', 'this', 'that', 'these', 'those'
      ];

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
          .limit(10);

        if (!error && data) {
          results = data;
          console.log(`Found ${data.length} bills by keyword search`);
        }
      }
    }

    return results;
  } catch (error) {
    console.error('Error searching Goodable database:', error);
    return [];
  }
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
      domainFiltering = null
    } = await req.json();

    console.log('Generating with Claude:', { model, promptLength: prompt?.length, hasContext: !!context, stream });

    if (!anthropicApiKey) {
      console.error('Anthropic API key not configured');
      throw new Error('Claude requires Anthropic API key to be configured in Supabase Edge Function Secrets');
    }

    // Search Goodable database for relevant bills
    let goodableBills: any[] = [];
    const goodableDataPromise = searchGoodableDatabase(prompt, getCurrentSessionYear());

    // Always wait for database search to complete before generating response
    if (goodableDataPromise) {
      goodableBills = await goodableDataPromise;
      console.log(`Found ${goodableBills?.length || 0} bills from Goodable database`);
    }

    // Build the user message with context if available
    let userMessage = prompt;
    let combinedContext = context || '';

    // Add Goodable database results to context
    if (goodableBills && goodableBills.length > 0) {
      const goodableContext = goodableBills.map(bill =>
        `\n## Bill ${bill.bill_number}\n` +
        `**Title:** ${bill.title}\n` +
        `**Status:** ${bill.status_desc || 'Unknown'}\n` +
        `**Committee:** ${bill.committee || 'Not assigned'}\n` +
        `**Session:** ${bill.session_id || 'N/A'}\n` +
        `**Description:** ${bill.description || 'No description available'}\n`
      ).join('\n');

      combinedContext = combinedContext
        ? `${combinedContext}\n\n# Additional Bills from Goodable Database\n${goodableContext}`
        : `# Relevant Bills from Goodable Database\n${goodableContext}`;
    }

    if (combinedContext) {
      userMessage = `# Relevant Legislative Data from Database\n\n${combinedContext}\n\n---\n\n# User Question\n\n${prompt}\n\n---\n\nPlease analyze the above legislative data to answer the user's question. Use specific details from the bills provided.`;
    }

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
        system: CLAUDE_SYSTEM_PROMPT,  // Send system prompt separately
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

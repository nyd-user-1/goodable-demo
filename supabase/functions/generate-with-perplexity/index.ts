import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { CONSTITUTIONAL_CORE } from '../_shared/constitution.ts';

const perplexityApiKey = Deno.env.get("PERPLEXITY_API_KEY");
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

// Search NYSgpt's Supabase database for bills (same as OpenAI edge function)
async function searchNYSgptDatabase(query: string) {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('Supabase credentials not available, skipping database search');
    return null;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract bill numbers if present (e.g., A00405, S1234)
    const billNumberPattern = /[ASK]\d{4,}/gi;
    const billNumbers = query.match(billNumberPattern);

    let billsData = [];

    // If specific bill numbers are mentioned, search for those first
    if (billNumbers && billNumbers.length > 0) {
      const { data, error } = await supabase
        .from('Bills')
        .select('*')
        .in('bill_number', billNumbers.map(bn => bn.toUpperCase()))
        .limit(10);

      if (data && !error) {
        billsData = data;
      }
    }

    // If no specific bills found or no bill numbers mentioned, do keyword search
    if (billsData.length === 0) {
      // Extract keywords from query
      const stopWords = ['the', 'a', 'an', 'in', 'on', 'at', 'for', 'to', 'of', 'and', 'or', 'but', 'bills', 'bill', 'legislation', 'about', 'tell', 'me', 'any', 'introduced', 'great', 'now', 'what', 'how', 'does', 'would', 'could', 'should'];
      const keywordArray = query
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.includes(word))
        .slice(0, 3);

      if (keywordArray.length > 0) {
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

        if (data && !error) {
          billsData = data;
          console.log(`Found ${billsData.length} bills for keywords: ${keywordArray.join(', ')}`);
        }
      }
    }

    // Fetch sponsors for found bills
    if (billsData.length > 0) {
      const billIds = billsData.map(b => b.bill_id);

      const { data: sponsorsData } = await supabase
        .from('Sponsors')
        .select('bill_id, position, people_id')
        .in('bill_id', billIds)
        .order('position');

      if (sponsorsData && sponsorsData.length > 0) {
        const peopleIds = [...new Set(sponsorsData.map(s => s.people_id).filter(Boolean))];
        const { data: peopleData } = await supabase
          .from('People')
          .select('people_id, name, party, chamber')
          .in('people_id', peopleIds);

        const peopleMap = new Map();
        if (peopleData) {
          peopleData.forEach(p => peopleMap.set(p.people_id, p));
        }

        billsData = billsData.map(bill => {
          const billSponsors = sponsorsData.filter(s => s.bill_id === bill.bill_id);
          const primarySponsor = billSponsors.find(s => s.position === 1);
          const coSponsors = billSponsors.filter(s => s.position > 1);

          return {
            ...bill,
            primarySponsor: primarySponsor ? peopleMap.get(primarySponsor.people_id) : null,
            coSponsorCount: coSponsors.length
          };
        });
      }
    }

    return billsData.length > 0 ? billsData : null;
  } catch (error) {
    console.error('Error searching NYSgpt database:', error);
    return null;
  }
}

// Format NYSgpt database results for context
function formatNYSgptBillsForContext(bills: any[]) {
  if (!bills || bills.length === 0) return '';

  let contextText = '\n\nNYSGPT DATABASE - RELEVANT BILLS:\n\n';

  bills.forEach((bill, index) => {
    contextText += `${index + 1}. BILL ${bill.bill_number}: ${bill.title || 'No title'}\n`;
    contextText += `   Session: ${bill.session_id || 'Unknown'}\n`;
    contextText += `   Status: ${bill.status_desc || 'Unknown'}\n`;
    if (bill.primarySponsor) {
      contextText += `   Primary Sponsor: ${bill.primarySponsor.name} (${bill.primarySponsor.party || 'Unknown Party'}, ${bill.primarySponsor.chamber || 'Unknown Chamber'})\n`;
    }
    if (bill.coSponsorCount > 0) {
      contextText += `   Co-Sponsors: ${bill.coSponsorCount} additional legislator${bill.coSponsorCount > 1 ? 's' : ''}\n`;
    }
    if (bill.committee) {
      contextText += `   Committee: ${bill.committee}\n`;
    }
    if (bill.description) {
      contextText += `   Description: ${bill.description.substring(0, 300)}${bill.description.length > 300 ? '...' : ''}\n`;
    }
    if (bill.state_link) {
      contextText += `   Official Link: ${bill.state_link}\n`;
    }
    contextText += '\n';
  });

  return contextText;
}

// Format conversation history for messages array
function formatConversationHistory(previousMessages: any[]): { role: string; content: string }[] {
  if (!previousMessages || !Array.isArray(previousMessages) || previousMessages.length === 0) {
    return [];
  }

  return previousMessages
    .filter(msg => msg && msg.role && msg.content)
    .map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));
}

const getSystemPrompt = (customSystemContext?: string, databaseContext?: string) => {
  const today = new Date().toISOString().split("T")[0];

  let basePrompt = `${CONSTITUTIONAL_CORE}

---

You are an expert legislative research analyst for New York State with access to the NYSgpt database.
Today's date: ${today}

Your job is to provide accurate, comprehensive information about NYS legislation by:
1. Using the NYSgpt database context provided (contains real bill data, sponsors, status)
2. Searching the web for the latest news and developments
3. Cross-referencing multiple authoritative sources

Always cite credible outlets like:
- Official: nysenate.gov, assembly.state.ny.us, governor.ny.gov
- News: Times Union, NY Times, Politico NY, City & State NY, Gothamist
- Analysis: Empire Center, Fiscal Policy Institute, Citizens Budget Commission

IMPORTANT INSTRUCTIONS:
- Provide COMPLETE, well-structured responses with full sentences
- Use the database context to provide accurate bill numbers, sponsors, and status
- Always include specific bill numbers when discussing legislation (e.g., A00405, S1234)
- Structure responses with clear paragraphs and bullet points when appropriate
- When analyzing legislation, consider impacts on working families and middle-class Americans
- Cite your sources and date all time-sensitive information`;

  // Add database context if available
  if (databaseContext) {
    basePrompt += `\n\n${databaseContext}\n\nUse this database information to provide accurate, specific answers with real bill numbers and sponsor names.`;
  }

  // Add custom system context if provided
  if (customSystemContext) {
    basePrompt = `${customSystemContext}\n\n${basePrompt}`;
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

    const { prompt, model = "sonar-pro", context = null, temperature = 0.4, stream = true } = body;

    if (!prompt) throw new Error("Missing required 'prompt' field.");
    if (!perplexityApiKey) throw new Error("Perplexity API key not configured.");

    console.log('Perplexity request:', { model, promptLength: prompt?.length, stream });

    // Extract systemContext and previousMessages if context is an object
    const systemContext = typeof context === 'object' && context?.systemContext ? context.systemContext : undefined;
    const previousMessages = typeof context === 'object' && context?.previousMessages ? context.previousMessages : [];

    // Search NYSgpt database for relevant bills
    const databaseBills = await searchNYSgptDatabase(prompt);
    const databaseContext = databaseBills ? formatNYSgptBillsForContext(databaseBills) : '';
    console.log(`Database search found ${databaseBills?.length || 0} relevant bills`);

    // Build conversation history
    const conversationHistory = formatConversationHistory(previousMessages);
    console.log(`Including ${conversationHistory.length} previous messages`);

    // Build enhanced user message with context
    let userMessage = prompt;
    if (databaseContext) {
      userMessage = `${prompt}\n\n[Use the bill information from the NYSgpt database in your system context to provide accurate, specific answers.]`;
    }

    // Build messages array with system prompt, conversation history, and current message
    const messages = [
      { role: "system", content: getSystemPrompt(systemContext, databaseContext) },
      ...conversationHistory,
      { role: "user", content: userMessage }
    ];

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${perplexityApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages,
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
        JSON.stringify({ generatedText, model, databaseBillsUsed: databaseBills?.length || 0 }),
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

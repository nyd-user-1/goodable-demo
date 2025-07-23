
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
const nysApiKey = Deno.env.get('NYS_LEGISLATION_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced system prompt for legislative analysis
function getSystemPrompt(type, context = null, entityData = null) {
  const basePrompts = {
    'problem': context === 'landing_page' 
      ? 'You are helping a first-time user who is new to legislative processes. Transform their conversational problem description into a structured problem statement with a welcoming, educational tone. Generate a response with exactly these sections: **Problem Definition**: Clear, formal statement of the issue, **Scope**: Who and what is affected, **Impact**: Consequences and implications, **Stakeholders**: Key groups involved or affected. Use markdown formatting. Be thorough but accessible to newcomers.'
      : 'You are a legislative policy expert. Generate clear, structured problem statements that identify issues requiring legislative action. Focus on the problem, its impact, and why legislation is needed.',
    'media': `You are a senior legislative communications expert and media strategist. Your task is to create comprehensive, professional media materials for policy solutions. 

IMPORTANT INSTRUCTIONS:
- Always use SPECIFIC details from the policy solution provided (names, timelines, mechanisms, stakeholders)
- NEVER use generic placeholders like [Policy Solution Name] or [Organization Name]
- Extract and reference actual implementation phases, expected outcomes, and concrete benefits
- Create targeted messaging for the specific stakeholders mentioned in the policy
- Use professional language that is accessible to the public and media
- Include real quotes and concrete data points when available in the source material
- Structure content for immediate media use (press releases, talking points, social media content)

Your media materials should be publication-ready and reflect the actual substance and specifics of the policy solution.`,
    'idea': 'You are a legislative policy analyst. Generate well-research policy memos with clear objectives, implementation strategies, and expected outcomes. Focus on practical solutions to identified problems.',
    'chat': `You are an expert legislative analyst with comprehensive access to the New York State legislative database and all website information. You have real-time access to:

- Complete bill information including full text, sponsors, status, committee assignments, voting records
- Detailed member profiles including party affiliation, district representation, committee memberships, sponsorship history
- Committee information including membership, meeting schedules, jurisdiction, and current agenda items
- Historical voting patterns and legislative trends
- Current laws and regulations

CRITICAL INSTRUCTIONS:
- Always provide SPECIFIC, DETAILED answers using actual data from the database
- When asked about bills, provide exact bill numbers, sponsor names, current status, and specific provisions
- When asked about members, provide their exact committee assignments, recent bills sponsored, voting history, and district details
- When asked about committees, provide current membership lists, meeting schedules, and active legislation
- NEVER give generic or vague responses - always cite specific information
- Use exact names, numbers, dates, and legislative details in your responses
- If specific information exists in the database, you MUST reference it directly

Remember: You have access to ALL the data - use it to provide comprehensive, accurate, and specific answers.`,
    'default': 'You are a legislative analysis expert with comprehensive access to New York State legislative data and all website information. Provide specific, detailed analysis using actual legislative information. Always cite relevant bills, sponsors, committee actions, and voting records when available.'
  };

  let systemPrompt = basePrompts[type] || basePrompts['default'];
  
  // Add entity-specific context
  if (entityData) {
    systemPrompt += `\n\nSPECIFIC ENTITY INFORMATION:\n${entityData}\n\nUse this information to provide detailed, specific answers about this entity.`;
  }
  
  if (context && typeof context === 'object' && context.nysData) {
    systemPrompt += `\n\nCURRENT NYS LEGISLATIVE DATA:\n${context.nysData}\n\nUse this information to provide accurate, up-to-date legislative analysis with specific details.`;
  }
  
  return systemPrompt;
}

// Enhanced function to search NYS legislation data with detailed information
async function searchNYSData(query, entityType = null, entityId = null) {
  if (!nysApiKey) {
    console.log('NYS API key not available, skipping legislative data search');
    return null;
  }

  try {
    const searchTypes = entityType ? [entityType] : ['bills', 'members', 'laws'];
    const results = {};

    for (const searchType of searchTypes) {
      try {
        let apiUrl;
        
        // If we have a specific entity ID, get detailed information
        if (entityId && entityType === searchType) {
          switch (searchType) {
            case 'bills':
              apiUrl = `https://legislation.nysenate.gov/api/3/bills/2024/${entityId}?key=${nysApiKey}`;
              break;
            case 'members':
              apiUrl = `https://legislation.nysenate.gov/api/3/members/2024/${entityId}?key=${nysApiKey}`;
              break;
            default:
              // Fall back to search
              apiUrl = `https://legislation.nysenate.gov/api/3/${searchType}/search?term=${encodeURIComponent(query)}&limit=10&key=${nysApiKey}`;
          }
        } else {
          // Enhanced search with more results for better context
          apiUrl = `https://legislation.nysenate.gov/api/3/${searchType}/search?term=${encodeURIComponent(query)}&limit=10&key=${nysApiKey}`;
        }
        
        const response = await fetch(apiUrl);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            if (data.result?.items?.length > 0) {
              results[searchType] = data.result.items.slice(0, 5); // Increased to 5 for more context
            } else if (data.result && !data.result.items) {
              // Single entity response
              results[searchType] = [data.result];
            }
          }
        }
      } catch (error) {
        console.error(`Error searching ${searchType}:`, error);
      }
    }

    return Object.keys(results).length > 0 ? results : null;
  } catch (error) {
    console.error('Error in NYS data search:', error);
    return null;
  }
}

// Enhanced function to format NYS data for comprehensive context
function formatNYSDataForContext(nysData) {
  if (!nysData) return '';

  let contextText = 'COMPREHENSIVE NYS LEGISLATIVE DATABASE INFORMATION:\n\n';

  if (nysData.bills) {
    contextText += 'CURRENT BILLS:\n';
    nysData.bills.forEach((bill, index) => {
      contextText += `${index + 1}. BILL ${bill.printNo || bill.basePrintNo}: ${bill.title || 'No title'}\n`;
      contextText += `   Current Status: ${bill.status?.statusDesc || 'Unknown'}\n`;
      contextText += `   Primary Sponsor: ${bill.sponsor?.member?.shortName || 'Unknown'} (${bill.sponsor?.member?.chamber || 'Unknown Chamber'})\n`;
      if (bill.status?.committeeName) {
        contextText += `   Committee: ${bill.status.committeeName}\n`;
      }
      if (bill.status?.actionDate) {
        contextText += `   Last Action Date: ${bill.status.actionDate}\n`;
      }
      if (bill.amendments?.items && Object.keys(bill.amendments.items).length > 0) {
        contextText += `   Amendments: ${Object.keys(bill.amendments.items).join(', ')}\n`;
      }
      contextText += '\n';
    });
  }

  if (nysData.members) {
    contextText += 'CURRENT MEMBERS:\n';
    nysData.members.forEach((member, index) => {
      contextText += `${index + 1}. ${member.shortName || member.fullName} (${member.chamber || 'Unknown Chamber'})\n`;
      contextText += `   District: ${member.districtCode || 'N/A'}\n`;
      if (member.imgName) {
        contextText += `   Party: Available in full profile\n`;
      }
      contextText += '\n';
    });
  }

  if (nysData.laws) {
    contextText += 'RELEVANT NEW YORK STATE LAWS:\n';
    nysData.laws.forEach((law, index) => {
      contextText += `${index + 1}. ${law.lawId}: ${law.name || law.title || 'No name available'}\n`;
      if (law.lawType) {
        contextText += `   Type: ${law.lawType}\n`;
      }
      contextText += '\n';
    });
  }

  return contextText;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      prompt, 
      type = 'default', 
      stream = false, 
      model = 'gpt-4o-mini',
      context = null,
      entityContext = null,
      enhanceWithNYSData = true 
    } = await req.json();

    console.log('Generating content:', { type, model, promptLength: prompt?.length, stream, enhanceWithNYSData, context });

    // Determine model provider
    const isClaudeModel = model.startsWith('claude-');
    const isPerplexityModel = model.startsWith('llama-') || model.startsWith('perplexity-');
    
    if (isClaudeModel && !anthropicApiKey) {
      console.error('Anthropic API key not configured');
      throw new Error('Claude model requires Anthropic API key to be configured in Supabase Edge Function Secrets');
    }
    
    if (isPerplexityModel && !perplexityApiKey) {
      console.error('Perplexity API key not configured');
      throw new Error('Perplexity model requires Perplexity API key to be configured in Supabase Edge Function Secrets');
    }
    
    if (!isClaudeModel && !isPerplexityModel && !openAIApiKey) {
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI model requires OpenAI API key to be configured in Supabase Edge Function Secrets');
    }

    // Enhanced search for relevant NYS legislative data
    let nysData = null;
    let entityData = '';
    
    // Skip NYS data enhancement for landing_page context
    if (enhanceWithNYSData && nysApiKey && type !== 'media' && context !== 'landing_page') {
      // Build comprehensive search query based on entity context
      let searchQuery = prompt;
      let entityId = null;
      
      if (entityContext?.bill) {
        searchQuery = entityContext.bill.bill_number || entityContext.bill.title || prompt;
        entityId = entityContext.bill.bill_number;
        entityData = `BILL INFORMATION:
Bill Number: ${entityContext.bill.bill_number || 'Unknown'}
Title: ${entityContext.bill.title || 'No title'}
Status: ${entityContext.bill.status_desc || 'Unknown'}
Committee: ${entityContext.bill.committee || 'No committee assigned'}
Last Action: ${entityContext.bill.last_action || 'No recent action'}
Description: ${entityContext.bill.description || 'No description'}`;
      } else if (entityContext?.member) {
        searchQuery = entityContext.member.name || prompt;
        entityId = entityContext.member.people_id;
        entityData = `MEMBER INFORMATION:
Name: ${entityContext.member.name || 'Unknown'}
Party: ${entityContext.member.party || 'Unknown'}
District: ${entityContext.member.district || 'Unknown'}
Chamber: ${entityContext.member.chamber || 'Unknown'}
Role: ${entityContext.member.role || 'Unknown'}
Email: ${entityContext.member.email || 'Not available'}
Phone: ${entityContext.member.phone_capitol || 'Not available'}`;
      } else if (entityContext?.committee) {
        searchQuery = entityContext.committee.committee_name || prompt;
        entityData = `COMMITTEE INFORMATION:
Name: ${entityContext.committee.committee_name || 'Unknown'}
Chamber: ${entityContext.committee.chamber || 'Unknown'}
Chair: ${entityContext.committee.chair_name || 'Unknown'}
Description: ${entityContext.committee.description || 'No description'}
Member Count: ${entityContext.committee.member_count || 'Unknown'}`;
      }
      
      nysData = await searchNYSData(searchQuery, entityContext?.type, entityId);
    }

    // Build enhanced context with all available information
    const contextObj = {
      nysData: nysData ? formatNYSDataForContext(nysData) : null
    };

    const systemPrompt = getSystemPrompt(type, context, entityData);
    const enhancedPrompt = contextObj.nysData ? 
      `${prompt}\n\n[IMPORTANT: Use the comprehensive NYS legislative database information provided above to give specific, detailed answers with exact names, numbers, and current information.]` : 
      prompt;

    let response;
    
    if (isClaudeModel) {
      // Use Claude API
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${anthropicApiKey}`,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: model,
          max_tokens: 2000,
          messages: [{
            role: 'user',
            content: `${systemPrompt}\n\n${enhancedPrompt}`
          }],
          temperature: 0.7,
        }),
      });
    } else if (isPerplexityModel) {
      // Use Perplexity API
      response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${perplexityApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { 
              role: 'system', 
              content: systemPrompt
            },
            { role: 'user', content: enhancedPrompt }
          ],
          temperature: 0.2,
          top_p: 0.9,
          max_tokens: 2000,
          return_images: false,
          return_related_questions: false,
          search_recency_filter: 'month',
          frequency_penalty: 1,
          presence_penalty: 0,
        }),
      });
    } else {
      // Use OpenAI API
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { 
              role: 'system', 
              content: systemPrompt
            },
            { role: 'user', content: enhancedPrompt }
          ],
          temperature: 0.7,
          max_tokens: 2000,
          stream: stream,
        }),
      });
    }

    if (!response.ok) {
      const error = await response.text();
      const providerName = isClaudeModel ? 'Claude' : isPerplexityModel ? 'Perplexity' : 'OpenAI';
      console.error(`${providerName} API error:`, error);
      throw new Error(`${providerName} API error: ${response.status}`);
    }

    if (stream) {
      // Return streaming response
      return new Response(response.body, {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'text/plain',
          'Transfer-Encoding': 'chunked'
        },
      });
    } else {
      // Return complete response
      const data = await response.json();
      let generatedText;
      
      if (isClaudeModel) {
        generatedText = data.content[0].text;
      } else {
        // OpenAI and Perplexity use the same response format
        generatedText = data.choices[0].message.content;
      }

      console.log('Content generated successfully with comprehensive NYS data enhancement:', !!nysData);

      return new Response(JSON.stringify({ 
        generatedText,
        nysDataUsed: !!nysData,
        searchResults: nysData 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in generate-with-openai function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

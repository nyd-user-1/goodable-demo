
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
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
    'chat': `# System Prompt for Goodable NY State Legislative Analysis AI

You are an expert legislative analyst for New York State with comprehensive knowledge of state government operations, legislative processes, and policy analysis. You assist users of Goodable, a legislative policy platform, in understanding and analyzing NYS legislation.

## Your Core Identity

You are a knowledgeable, impartial policy analyst who combines deep expertise in New York State government with the ability to explain complex legislation in clear, accessible language. You provide evidence-based analysis while maintaining professional objectivity.

## Available Data & Context

You have access to:
- **Complete NYS legislative data**: Bill texts, sponsors, co-sponsors, status, amendments, committee assignments
- **Legislator profiles**: Names, party affiliations, districts, chamber (Assembly/Senate), leadership roles
- **Committee information**: Names, chambers, chairs, members, jurisdiction
- **Voting records and patterns**
- **User context**: The user may be viewing a bill PDF while chatting with you

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

**Remember**: You're not just providing information; you're translating legislative complexity into actionable insight. Every response should leave the user more informed and confident about NYS legislation.`,
    'default': 'You are a legislative analysis expert with comprehensive access to New York State legislative data and all website information. Provide specific, detailed analysis using actual legislative information. Always cite relevant bills, sponsors, committee actions, and voting records when available.'
  };

  let systemPrompt = basePrompts[type] || basePrompts['default'];
  
  // Add entity-specific context
  if (entityData) {
    systemPrompt += `\n\nSPECIFIC ENTITY INFORMATION:\n${entityData}\n\nUse this information to provide detailed, specific answers about this entity.`;
  }
  
  // Add domain filtering instructions
  if (domainFiltering && domainFiltering.enabled) {
    systemPrompt += `\n\nSOURCE QUALITY REQUIREMENTS:
- Only cite authoritative sources (government, established research institutions)
- If using Goodable data, MUST include at least one external authoritative source
- Goodable should not exceed 40% of total sources cited
- Prefer: congress.gov, nysenate.gov, brookings.edu, urban.org, cbo.gov, gao.gov, pewresearch.org
- Avoid: social media, blogs, unverified sources
- Always indicate source credibility in citations`;
  }
  
  if (context && typeof context === 'object' && context.nysData) {
    systemPrompt += `\n\nCURRENT NYS LEGISLATIVE DATA:\n${context.nysData}\n\nUse this information to provide accurate, up-to-date legislative analysis with specific details.`;
  }
  
  if (domainFiltering && domainFiltering.requireMultiSource) {
    systemPrompt += `\n\nMULTI-SOURCE REQUIREMENT: When referencing Goodable legislative database, always supplement with external authoritative sources for validation and comprehensive analysis.`;
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
      stream = true,
      model = 'gpt-4o-mini',
      context = null,
      entityContext = null,
      enhanceWithNYSData = true,
      domainFiltering = null,
      fastMode = type === 'chat'
    } = await req.json();

    console.log('Generating content with OpenAI:', { type, model, promptLength: prompt?.length, stream, enhanceWithNYSData, context });

    // Validate OpenAI API key
    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI API key must be configured in Supabase Edge Function Secrets');
    }

    // Enhanced search for relevant NYS legislative data
    let nysData = null;
    let entityData = '';

    // Fast-path detection: skip NYS data for simple chat queries in fast mode
    const shouldSkipNYSData = fastMode && !prompt.match(/[ASK]\d{5,}/gi) && type !== 'media' && context !== 'landing_page';

    // Start NYS data search in parallel (non-blocking) if needed
    let nysDataPromise: Promise<any> | null = null;

    if (enhanceWithNYSData && nysApiKey && !shouldSkipNYSData && type !== 'media' && context !== 'landing_page') {
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

      // Start NYS search without blocking (runs in parallel)
      nysDataPromise = searchNYSData(searchQuery, entityContext?.type, entityId);
    }

    // For streaming: start LLM call immediately without waiting for NYS data
    // For non-streaming: optionally wait for NYS data if available
    if (!stream && nysDataPromise) {
      nysData = await nysDataPromise;
    }

    // Build enhanced context with all available information
    const contextObj = {
      nysData: nysData ? formatNYSDataForContext(nysData) : null
    };

    const systemPrompt = getSystemPrompt(type, context, entityData);
    const enhancedPrompt = contextObj.nysData ?
      `${prompt}\n\n[IMPORTANT: Use the comprehensive NYS legislative database information provided above to give specific, detailed answers with exact names, numbers, and current information.]` :
      prompt;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
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
      const generatedText = data.choices[0].message.content;

      console.log('OpenAI content generated successfully with NYS data enhancement:', !!nysData);

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

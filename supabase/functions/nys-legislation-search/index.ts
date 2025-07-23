
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const nysApiKey = Deno.env.get('NYS_LEGISLATION_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { searchType, query, sessionYear, limit = 20 } = await req.json();
    
    console.log('NYS API search request:', { searchType, query, sessionYear, limit });

    if (!nysApiKey) {
      throw new Error('NYS Legislation API key not configured');
    }

    let apiUrl = '';
    
    switch (searchType) {
      case 'bills':
        apiUrl = `https://legislation.nysenate.gov/api/3/bills/search?term=${encodeURIComponent(query)}&limit=${limit}&key=${nysApiKey}`;
        if (sessionYear) {
          apiUrl = `https://legislation.nysenate.gov/api/3/bills/${sessionYear}/search?term=${encodeURIComponent(query)}&limit=${limit}&key=${nysApiKey}`;
        }
        break;
      case 'members':
        apiUrl = `https://legislation.nysenate.gov/api/3/members/search?term=${encodeURIComponent(query)}&limit=${limit}&key=${nysApiKey}`;
        break;
      case 'laws':
        apiUrl = `https://legislation.nysenate.gov/api/3/laws/search?term=${encodeURIComponent(query)}&limit=${limit}&key=${nysApiKey}`;
        break;
      case 'agendas':
        apiUrl = `https://legislation.nysenate.gov/api/3/agendas/search?term=${encodeURIComponent(query)}&limit=${limit}&key=${nysApiKey}`;
        break;
      case 'calendars':
        apiUrl = `https://legislation.nysenate.gov/api/3/calendars/search?term=${encodeURIComponent(query)}&limit=${limit}&key=${nysApiKey}`;
        break;
      default:
        throw new Error('Invalid search type');
    }

    console.log('Calling NYS API:', apiUrl.replace(nysApiKey, 'REDACTED'));

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.error('NYS API error:', response.status, response.statusText);
      throw new Error(`NYS API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('NYS API response received, items:', data.result?.items?.length || 0);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in nys-legislation-search function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});


import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const nysApiKey = Deno.env.get('NYS_LEGISLATION_API_KEY');
const REQUEST_DELAY_MS = 100; // Respectful rate limiting
const BATCH_SIZE = 100; // For batch inserts

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
    const requestBody = await req.json();
    const { action, searchType, query, sessionYear, limit = 20, lawId } = requestBody;
    
    if (!nysApiKey) {
      throw new Error('NYS Legislation API key not configured');
    }

    // Handle different actions
    if (action === 'sync-laws') {
      return await syncAllLaws();
    } else if (action === 'sync-law' && lawId) {
      return await syncSingleLaw(lawId);
    } else if (action === 'get-progress') {
      return await getProgress();
    } else {
      // Default to search functionality
      return await handleSearch(searchType, query, sessionYear, limit);
    }
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

async function handleSearch(searchType: string, query: string, sessionYear?: number, limit = 20) {
  console.warn('NYS API search request:', { searchType, query, sessionYear, limit });

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

  console.warn('Calling NYS API:', apiUrl.replace(nysApiKey, 'REDACTED'));

  const response = await fetch(apiUrl);
  
  if (!response.ok) {
    console.error('NYS API error:', response.status, response.statusText);
    throw new Error(`NYS API error: ${response.status}`);
  }

  const data = await response.json();
  console.warn('NYS API response received, items:', data.result?.items?.length || 0);

  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function syncAllLaws() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  
  console.log("Starting sync with URLs:", { supabaseUrl: supabaseUrl ? "SET" : "MISSING", apiKey: nysApiKey ? "SET" : "MISSING" });
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase configuration");
  }
  
  if (!nysApiKey) {
    throw new Error("Missing NYS API key");
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const startTime = Date.now();
  let processedCount = 0;
  let errorCount = 0;
  const errors: any[] = [];

  try {
    console.log("Fetching laws list...");
    
    // Get list of all laws - SIMPLIFIED VERSION
    const apiUrl = `https://legislation.nysenate.gov/api/3/laws?key=${nysApiKey}`;
    console.log("Calling:", apiUrl.replace(nysApiKey, "REDACTED"));
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`NYS API error: ${response.status} ${response.statusText}`);
    }
    
    const lawsData = await response.json();
    
    if (!lawsData.success) {
      throw new Error(`API returned error: ${lawsData.message}`);
    }

    const laws = lawsData.result?.items || [];
    const consolidatedLaws = laws.filter((law: any) => law.lawType === "CONSOLIDATED");
    
    console.log(`Found ${consolidatedLaws.length} consolidated laws to process`);

    // Process each law - BASIC VERSION ONLY
    for (const law of consolidatedLaws) {
      try {
        await syncBasicLawData(supabase, law);
        processedCount++;
        
        // Log progress every 10 laws
        if (processedCount % 10 === 0) {
          console.log(`Progress: ${processedCount}/${consolidatedLaws.length} laws processed`);
        }
        
        // Very short delay
        await delay(50);
        
      } catch (error) {
        errorCount++;
        errors.push({ lawId: law.lawId, error: error.message });
        console.error(`Failed to process ${law.lawId}:`, error);
      }
    }

    const duration = (Date.now() - startTime) / 1000;
    
    return new Response(
      JSON.stringify({
        success: true,
        totalLaws: consolidatedLaws.length,
        processed: processedCount,
        errors: errorCount,
        duration: `${duration}s`,
        errorDetails: errors
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Sync error:", error);
    throw error;
  }
}

async function syncSingleLaw(lawId: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // First get basic law info
    const lawsResponse = await fetchWithRetry(
      `https://legislation.nysenate.gov/api/3/laws?key=${nysApiKey}`
    );
    
    const laws = lawsResponse.result?.items || [];
    const law = laws.find((l: any) => l.lawId === lawId);
    
    if (!law) {
      throw new Error(`Law ${lawId} not found`);
    }

    await syncSingleLawData(supabase, law);
    
    return new Response(
      JSON.stringify({ success: true, lawId, message: "Law synced successfully" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    throw error;
  }
}

async function syncBasicLawData(supabase: any, law: any) {
  // Just insert basic law metadata - NO full text fetching
  const lawRecord = {
    law_id: law.lawId,
    name: law.name,
    chapter: law.chapter,
    law_type: law.lawType,
    full_text: null, // We'll populate this later
    structure: null,
    total_sections: 0, // We'll count these later
    last_updated: new Date().toISOString().split('T')[0],
    api_last_modified: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Upsert law record
  const { error: lawError } = await supabase
    .from("ny_laws")
    .upsert(lawRecord, { onConflict: "law_id" });

  if (lawError) throw new Error(`Failed to upsert law: ${lawError.message}`);

  console.log(`✓ Synced basic data for ${law.lawId}: ${law.name}`);
}

async function syncSingleLawData(supabase: any, law: any) {
  // Fetch full law text
  const fullLawResponse = await fetchWithRetry(
    `https://legislation.nysenate.gov/api/3/laws/${law.lawId}?full=true&key=${nysApiKey}`
  );
  
  if (!fullLawResponse.success) {
    throw new Error(`Failed to fetch full law: ${fullLawResponse.message}`);
  }

  const lawData = fullLawResponse.result;
  
  // Extract sections and full text
  const { sections, fullText } = extractLawContent(lawData.documents);
  
  // Prepare law record
  const lawRecord = {
    law_id: law.lawId,
    name: law.name,
    chapter: law.chapter,
    law_type: law.lawType,
    full_text: fullText,
    structure: lawData.documents,
    total_sections: sections.length,
    last_updated: new Date().toISOString().split('T')[0],
    api_last_modified: lawData.lastModified || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Upsert law record
  const { error: lawError } = await supabase
    .from("ny_laws")
    .upsert(lawRecord, { onConflict: "law_id" });

  if (lawError) throw new Error(`Failed to upsert law: ${lawError.message}`);

  // Delete existing sections for this law
  const { error: deleteError } = await supabase
    .from("ny_law_sections")
    .delete()
    .eq("law_id", law.lawId);

  if (deleteError) console.warn(`Warning deleting sections: ${deleteError.message}`);

  // Insert sections in batches
  if (sections.length > 0) {
    const sectionsWithLawId = sections.map((section: any) => ({
      ...section,
      law_id: law.lawId
    }));

    for (let i = 0; i < sectionsWithLawId.length; i += BATCH_SIZE) {
      const batch = sectionsWithLawId.slice(i, i + BATCH_SIZE);
      const { error: sectionsError } = await supabase
        .from("ny_law_sections")
        .insert(batch);

      if (sectionsError) {
        console.warn(`Section batch insert warning: ${sectionsError.message}`);
      }
    }
  }

  console.log(`✓ Synced ${law.lawId}: ${sections.length} sections`);
}

function extractLawContent(documents: any, parentId: string | null = null, level: number = 1): { sections: any[], fullText: string } {
  const sections: any[] = [];
  let fullText = "";
  let sortOrder = 0;

  if (!documents?.items) return { sections, fullText };

  for (const doc of documents.items) {
    sortOrder++;
    
    // Extract section data
    const section = {
      location_id: doc.locationId,
      parent_location_id: parentId,
      section_number: extractSectionNumber(doc.locationId),
      title: doc.title || "",
      content: doc.text || "",
      level: level,
      sort_order: sortOrder
    };

    sections.push(section);
    
    // Accumulate full text
    if (doc.text) {
      fullText += doc.text + "\n\n";
    }

    // Recursively process nested documents
    if (doc.documents?.items) {
      const nested = extractLawContent(
        doc.documents, 
        doc.locationId, 
        level + 1
      );
      sections.push(...nested.sections);
      fullText += nested.fullText;
    }
  }

  return { sections, fullText };
}

function extractSectionNumber(locationId: string): string {
  // Extract section number from location ID (e.g., "A1-1" -> "1-1")
  const match = locationId?.match(/[A-Z]*(\d+.*)/);
  return match ? match[1] : locationId;
}

async function getProgress() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Get counts
    const { count: lawCount } = await supabase
      .from("ny_laws")
      .select("*", { count: "exact", head: true });
    
    const { count: sectionCount } = await supabase
      .from("ny_law_sections")
      .select("*", { count: "exact", head: true });

    // Get recent updates
    const { data: recentLaws } = await supabase
      .from("ny_laws")
      .select("law_id, name, total_sections, updated_at")
      .order("updated_at", { ascending: false })
      .limit(10);

    return new Response(
      JSON.stringify({
        totalLaws: lawCount || 0,
        totalSections: sectionCount || 0,
        recentUpdates: recentLaws || []
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    throw error;
  }
}

async function fetchWithRetry(url: string, retries: number = 3): Promise<any> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(`API Error: ${data.message || "Unknown error"}`);
      }
      
      return data;
    } catch (error) {
      console.log(`Attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt === retries) throw error;
      await delay(1000 * attempt); // Exponential backoff
    }
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

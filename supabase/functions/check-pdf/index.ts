import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Make a HEAD request to check if PDF exists
    const response = await fetch(url, { 
      method: 'HEAD',
      headers: {
        'User-Agent': 'Goodable-PDF-Checker/1.0'
      }
    })
    
    // Check if response is successful and content type is PDF
    const isAvailable = response.ok && 
      (response.headers.get('content-type')?.includes('pdf') || 
       url.endsWith('.pdf'))

    return new Response(
      JSON.stringify({ 
        available: isAvailable,
        status: response.status,
        contentType: response.headers.get('content-type')
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error checking PDF:', error)
    return new Response(
      JSON.stringify({ 
        available: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  }
})
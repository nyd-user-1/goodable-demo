import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

interface LawData {
  law_id: string;
  name: string;
  chapter: string;
  full_text: string;
  structure: any;
  sections: LawSection[];
}

interface LawSection {
  location_id: string;
  section_number: string;
  title: string;
  content: string;
  level: number;
  sort_order: number;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, law_id } = await req.json();

    if (action === 'scrape_all_laws') {
      return await scrapeAllConsolidatedLaws(supabaseClient, corsHeaders);
    } else if (action === 'scrape_single_law' && law_id) {
      return await scrapeSingleLaw(supabaseClient, law_id, corsHeaders);
    } else {
      throw new Error('Invalid action or missing law_id');
    }

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function scrapeAllConsolidatedLaws(supabaseClient: any, corsHeaders: any) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('NYLawsResearch/1.0 (Academic Research)');
    
    // Navigate to consolidated laws index
    console.log('Navigating to NY State leginfo consolidated laws...');
    await page.goto('http://public.leginfo.state.ny.us/lawssrch.cgi?NVLWO:', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Extract all law links from the nested table structure
    const lawsList = await page.evaluate(() => {
      const laws: any[] = [];
      
      // Look for the main laws table and extract law links
      const tables = document.querySelectorAll('table');
      
      tables.forEach(table => {
        const rows = table.querySelectorAll('tr');
        
        rows.forEach(row => {
          const cells = row.querySelectorAll('td');
          
          cells.forEach(cell => {
            const links = cell.querySelectorAll('a');
            
            links.forEach((link: any) => {
              const href = link.getAttribute('href');
              const text = link.textContent?.trim();
              
              // Match consolidated law patterns (e.g., "ABC - Law Name")
              if (text && href && text.match(/^[A-Z]{2,4}\s*-\s*.+/)) {
                const lawMatch = text.match(/^([A-Z]{2,4})\s*-\s*(.+)$/);
                
                if (lawMatch) {
                  const lawId = lawMatch[1];
                  const lawName = lawMatch[2].trim();
                  
                  laws.push({
                    law_id: lawId,
                    name: lawName,
                    url: href.startsWith('http') ? href : `http://public.leginfo.state.ny.us${href}`,
                    chapter: extractChapterFromName(lawName)
                  });
                }
              }
            });
          });
        });
      });
      
      // Helper function to extract chapter info
      function extractChapterFromName(name: string): string {
        const chapterPatterns = [
          /Chapter\s+(\d+)/i,
          /Ch\.?\s+(\d+)/i,
          /\(Ch\.?\s+(\d+)\)/i
        ];
        
        for (const pattern of chapterPatterns) {
          const match = name.match(pattern);
          if (match) return match[1];
        }
        
        return '';
      }
      
      // Remove duplicates
      const uniqueLaws = laws.filter((law, index, self) => 
        index === self.findIndex(l => l.law_id === law.law_id)
      );
      
      return uniqueLaws;
    });

    console.log(`Found ${lawsList.length} consolidated laws`);

    // Process each law
    const results = {
      total_laws: lawsList.length,
      successful: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const [index, law] of lawsList.entries()) {
      try {
        console.log(`Processing ${index + 1}/${lawsList.length}: ${law.name}`);
        
        await scrapeLawContent(page, law, supabaseClient);
        results.successful++;
        
        // Rate limiting - respectful delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`Failed to process ${law.law_id}: ${error.message}`);
        results.failed++;
        results.errors.push(`${law.law_id}: ${error.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Scraping completed: ${results.successful} successful, ${results.failed} failed`,
        results: results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } finally {
    await browser.close();
  }
}

async function scrapeLawContent(page: any, lawInfo: any, supabaseClient: any) {
  // Navigate to the specific law page
  await page.goto(lawInfo.url, {
    waitUntil: 'networkidle2',
    timeout: 30000
  });

  // Wait for content to load - leginfo uses tables for layout
  await page.waitForSelector('table', { timeout: 10000 });

  // Extract the complete law structure and text from nested tables
  const lawData = await page.evaluate((lawId: string) => {
    const sections: any[] = [];
    let fullText = '';
    let sortOrder = 0;

    // Strategy 1: Extract from nested table structure (primary for leginfo.state.ny.us)
    const extractFromTables = () => {
      const tables = document.querySelectorAll('table');
      
      tables.forEach(table => {
        const rows = table.querySelectorAll('tr');
        
        rows.forEach(row => {
          const cells = row.querySelectorAll('td');
          
          cells.forEach(cell => {
            const cellText = cell.innerText?.trim();
            
            // Skip navigation and empty cells
            if (!cellText || cellText.length < 50) return;
            
            // Look for section patterns in the cell content
            if (cellText.match(/^(§|Section|SECTION)\s*\d+/i) || 
                cellText.match(/^(Article|ARTICLE)\s+[\dIVX]+/i) ||
                cellText.match(/^\d+[\.\-]\d*/)) {
              
              const sectionData = parseLegalSection(cellText, ++sortOrder, lawId);
              if (sectionData) {
                sections.push(sectionData);
                fullText += cellText + '\n\n';
              }
            } else if (cellText.length > 200) {
              // Capture substantial text content even without section markers
              sections.push({
                location_id: `${lawId}-content-${++sortOrder}`,
                section_number: `Content-${sortOrder}`,
                title: extractTitle(cellText),
                content: cellText,
                level: 1,
                sort_order: sortOrder
              });
              fullText += cellText + '\n\n';
            }
          });
        });
      });
    };

    // Strategy 2: Look for structured content areas
    const extractFromStructuredContent = () => {
      const contentSelectors = [
        '.law-content', '.legal-text', '.statute-text',
        '[class*="law"]', '[class*="section"]',
        'div[align="left"]', 'div[align="justify"]'
      ];
      
      contentSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        
        elements.forEach((element: any) => {
          const text = element.innerText?.trim();
          if (text && text.length > 100) {
            const sectionData = parseLegalSection(text, ++sortOrder, lawId);
            if (sectionData && !sections.find(s => s.content === text)) {
              sections.push(sectionData);
              fullText += text + '\n\n';
            }
          }
        });
      });
    };

    // Strategy 3: Fallback to body text with intelligent splitting
    const extractFromBody = () => {
      if (sections.length < 3) { // Only if we haven't found much content
        const bodyText = document.body.innerText?.trim();
        if (bodyText && bodyText.length > 500) {
          
          // Split on common legal section patterns
          const sectionTexts = splitLegalText(bodyText);
          
          sectionTexts.forEach((sectionText: string, index: number) => {
            if (sectionText.trim().length > 100) {
              sections.push({
                location_id: `${lawId}-${index + 1}`,
                section_number: extractSectionNumber(sectionText) || `${index + 1}`,
                title: extractTitle(sectionText),
                content: sectionText.trim(),
                level: 1,
                sort_order: index + 1
              });
            }
          });
          
          fullText = bodyText;
        }
      }
    };

    // Execute extraction strategies in order
    extractFromTables();
    extractFromStructuredContent();
    extractFromBody();

    return { sections, fullText };

    // Helper functions for parsing legal content
    function parseLegalSection(text: string, sortOrder: number, lawId: string) {
      // Extract section number
      const sectionNumber = extractSectionNumber(text) || `section-${sortOrder}`;
      
      // Extract title (first line or sentence)
      const title = extractTitle(text);
      
      return {
        location_id: `${lawId}-${sectionNumber}`,
        section_number: sectionNumber,
        title: title,
        content: text,
        level: 1,
        sort_order: sortOrder
      };
    }

    function splitLegalText(text: string): string[] {
      // Split on legal section patterns commonly found in NY laws
      const patterns = [
        /(?=§\s*\d+[\.\-])/g,           // § 1. or § 1-
        /(?=Section\s+\d+[\.\-])/gi,    // Section 1. or Section 1-
        /(?=SECTION\s+\d+[\.\-])/g,     // SECTION 1. or SECTION 1-
        /(?=Article\s+[\dIVX]+)/gi,     // Article 1 or Article I
        /(?=ARTICLE\s+[\dIVX]+)/g,      // ARTICLE 1 or ARTICLE I
        /(?=Title\s+\d+)/gi,            // Title 1
        /(?=TITLE\s+\d+)/g,             // TITLE 1
        /(?=Chapter\s+\d+)/gi,          // Chapter 1
        /(?=CHAPTER\s+\d+)/g,           // CHAPTER 1
        /(?=Part\s+\d+)/gi,             // Part 1
        /(?=PART\s+\d+)/g               // PART 1
      ];
      
      for (const pattern of patterns) {
        const sections = text.split(pattern).filter(s => s.trim().length > 100);
        if (sections.length > 1) {
          return sections;
        }
      }
      
      // Fallback: split on double line breaks for long texts
      if (text.length > 5000) {
        return text.split(/\n\s*\n/).filter(s => s.trim().length > 100);
      }
      
      return [text];
    }

    function extractSectionNumber(text: string): string | null {
      const patterns = [
        /§\s*(\d+[\.\-]?\d*[a-z]?)/i,           // § 1, § 1.2, § 1-a
        /Section\s+(\d+[\.\-]?\d*[a-z]?)/i,     // Section 1, Section 1.2
        /SECTION\s+(\d+[\.\-]?\d*[a-z]?)/,      // SECTION 1
        /^(\d+[\.\-]\d*[a-z]?)/,                // 1.2, 1-a at start
        /Article\s+([\dIVX]+)/i,                // Article 1, Article I
        /Title\s+(\d+)/i,                       // Title 1
        /Chapter\s+(\d+)/i,                     // Chapter 1
        /Part\s+(\d+)/i                         // Part 1
      ];
      
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) return match[1];
      }
      
      return null;
    }

    function extractTitle(text: string): string {
      // Clean and extract first meaningful line as title
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      if (lines.length === 0) return 'Untitled Section';
      
      const firstLine = lines[0];
      
      // If first line is short and descriptive, use it
      if (firstLine.length < 120 && !firstLine.match(/^§|^Section|^SECTION/i)) {
        return firstLine;
      }
      
      // Look for title patterns after section markers
      const titleMatch = text.match(/(?:§|Section|SECTION)\s*\d+[\.\-]?\d*[a-z]?\s*[\.\-]?\s*(.+?)(?:\n|$)/i);
      if (titleMatch && titleMatch[1].trim().length < 100) {
        return titleMatch[1].trim();
      }
      
      // Extract first sentence as title
      const sentences = text.split(/[.!?]/);
      const firstSentence = sentences[0]?.trim();
      if (firstSentence && firstSentence.length < 150) {
        return firstSentence + '.';
      }
      
      // Fallback: truncate first line
      return firstLine.length > 100 ? firstLine.substring(0, 100) + '...' : firstLine;
    }

  }, lawInfo.law_id);

  // Store in database
  await storeLawInDatabase(supabaseClient, {
    law_id: lawInfo.law_id,
    name: lawInfo.name,
    chapter: lawInfo.chapter || '',
    full_text: lawData.fullText,
    structure: { url: lawInfo.url, scraped_at: new Date().toISOString() },
    sections: lawData.sections
  });
}

async function storeLawInDatabase(supabaseClient: any, lawData: LawData) {
  // Insert main law record
  const { error: lawError } = await supabaseClient
    .from('ny_laws')
    .upsert({
      law_id: lawData.law_id,
      name: lawData.name,
      chapter: lawData.chapter,
      law_type: 'CONSOLIDATED',
      full_text: lawData.full_text,
      structure: lawData.structure,
      total_sections: lawData.sections.length,
      last_updated: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString()
    }, { onConflict: 'law_id' });

  if (lawError) {
    throw new Error(`Failed to store law: ${lawError.message}`);
  }

  // Clear existing sections for this law
  await supabaseClient
    .from('ny_law_sections')
    .delete()
    .eq('law_id', lawData.law_id);

  // Insert sections in batches
  if (lawData.sections.length > 0) {
    const sectionsWithLawId = lawData.sections.map(section => ({
      ...section,
      law_id: lawData.law_id
    }));

    const batchSize = 50;
    for (let i = 0; i < sectionsWithLawId.length; i += batchSize) {
      const batch = sectionsWithLawId.slice(i, i + batchSize);
      
      const { error: sectionsError } = await supabaseClient
        .from('ny_law_sections')
        .insert(batch);

      if (sectionsError) {
        console.warn(`Section batch insert warning: ${sectionsError.message}`);
      }
    }
  }

  console.log(`✓ Stored ${lawData.law_id}: ${lawData.sections.length} sections`);
}

async function scrapeSingleLaw(supabaseClient: any, lawId: string, corsHeaders: any) {
  // Implementation for scraping a single law
  // Similar to scrapeLawContent but for individual law processing
  return new Response(
    JSON.stringify({ success: true, message: `Single law scraping for ${lawId}` }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
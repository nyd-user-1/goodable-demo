import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://dmtxyqgizfpghlqahqvo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtdHh5cWdpemZwZ2hscWFocXZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzNzYwNzcsImV4cCI6MjA0ODk1MjA3N30.q90xOJX5b8nZ_hNb3z3LCKjH4qvBBqhJNvqHl0zIdoE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function scrapeAllNYLaws() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  });

  try {
    const page = await browser.newPage();
    
    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Set viewport
    await page.setViewport({ width: 1366, height: 768 });
    
    console.log('🚀 Navigating to NY State consolidated laws...');
    
    try {
      await page.goto('http://public.leginfo.state.ny.us/lawssrch.cgi?NVLWO:', {
        waitUntil: 'domcontentloaded',
        timeout: 45000
      });
      
      // Wait a bit for dynamic content
      await page.waitForTimeout(3000);
      
    } catch (error) {
      console.log('⚠️  First attempt failed, trying HTTPS...');
      await page.goto('https://legislation.nysenate.gov/laws', {
        waitUntil: 'networkidle0',
        timeout: 45000
      });
      
      // Wait for React to load and render content
      console.log('⏳ Waiting for JavaScript content to load...');
      await page.waitForTimeout(5000);
      
      // Try waiting for specific selectors that might contain laws
      try {
        await page.waitForSelector('a[href*="law"]', { timeout: 10000 });
      } catch (e) {
        console.log('⚠️  No law links found, trying different selectors...');
      }
    }

    console.log('📄 Extracting law links from page...');
    
    // Debug: Let's see what's on the page
    const pageContent = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        linkCount: document.querySelectorAll('a').length,
        firstFewLinks: Array.from(document.querySelectorAll('a')).slice(0, 10).map(a => ({
          text: a.textContent ? a.textContent.trim().substring(0, 50) : '',
          href: a.getAttribute('href')
        }))
      };
    });
    
    console.log('🔍 Page Debug Info:', pageContent);
    
    // Extract all law links
    const lawsList = await page.evaluate(() => {
      const laws = [];
      
      // Look for all links that match consolidated law patterns
      const allLinks = document.querySelectorAll('a');
      
      allLinks.forEach(link => {
        const href = link.getAttribute('href');
        const text = link.textContent?.trim();
        
        // More flexible matching for different site structures
        if (text && href) {
          // Pattern 1: "ABC - Law Name"
          let lawMatch = text.match(/^([A-Z]{2,4})\s*-\s*(.+)$/);
          
          // Pattern 2: "Law Name (ABC)"
          if (!lawMatch) {
            lawMatch = text.match(/^(.+?)\s*\(([A-Z]{2,4})\)$/);
            if (lawMatch) {
              // Swap order for consistency
              lawMatch = [lawMatch[0], lawMatch[2], lawMatch[1]];
            }
          }
          
          // Pattern 3: Just law names that look like consolidated laws
          if (!lawMatch && text.length > 10 && text.length < 100 && text.includes('Law')) {
            // Extract potential law ID from href or generate one
            const hrefMatch = href.match(/([A-Z]{2,4})/);
            if (hrefMatch) {
              lawMatch = [text, hrefMatch[1], text];
            }
          }
          
          if (lawMatch) {
            const lawId = lawMatch[1];
            const lawName = lawMatch[2].trim();
            
            laws.push({
              law_id: lawId,
              name: lawName,
              url: href.startsWith('http') ? href : (href.startsWith('/') ? 'https://legislation.nysenate.gov' + href : 'https://legislation.nysenate.gov/' + href),
              chapter: extractChapterFromName(lawName)
            });
          }
        }
      });
      
      function extractChapterFromName(name) {
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

    console.log(`✅ Found ${lawsList.length} consolidated laws to scrape`);

    let successful = 0;
    let failed = 0;
    const errors = [];

    // Process each law
    for (const [index, law] of lawsList.entries()) {
      try {
        console.log(`📖 Processing ${index + 1}/${lawsList.length}: ${law.law_id} - ${law.name}`);
        
        await scrapeLawContent(page, law);
        successful++;
        
        // Rate limiting - be respectful
        await new Promise(resolve => setTimeout(resolve, 1500));
        
      } catch (error) {
        console.error(`❌ Failed to process ${law.law_id}: ${error.message}`);
        failed++;
        errors.push(`${law.law_id}: ${error.message}`);
      }
    }

    console.log(`\n🎉 SCRAPING COMPLETED!`);
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${lawsList.length}`);
    
    if (errors.length > 0) {
      console.log('\n⚠️  Errors:');
      errors.forEach(error => console.log(`   ${error}`));
    }

  } finally {
    await browser.close();
  }
}

async function scrapeLawContent(page, lawInfo) {
  // Navigate to the specific law page
  await page.goto(lawInfo.url, {
    waitUntil: 'networkidle2',
    timeout: 30000
  });

  // Wait for content to load
  await page.waitForSelector('body', { timeout: 10000 });

  // Extract the complete law content
  const lawData = await page.evaluate((lawId) => {
    const sections = [];
    let fullText = '';
    let sortOrder = 0;

    // Strategy 1: Extract from tables (primary for leginfo)
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
            
            // Look for substantial content
            if (cellText.length > 100) {
              const sectionData = parseLegalSection(cellText, ++sortOrder, lawId);
              if (sectionData) {
                sections.push(sectionData);
                fullText += cellText + '\n\n';
              }
            }
          });
        });
      });
    };

    // Strategy 2: Extract from body if tables didn't work
    const extractFromBody = () => {
      if (sections.length < 2) {
        const bodyText = document.body.innerText?.trim();
        if (bodyText && bodyText.length > 500) {
          
          // Split on common patterns
          const sectionTexts = splitLegalText(bodyText);
          
          sectionTexts.forEach((sectionText, index) => {
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

    // Execute extraction strategies
    extractFromTables();
    extractFromBody();

    return { sections, fullText };

    // Helper functions
    function parseLegalSection(text, sortOrder, lawId) {
      const sectionNumber = extractSectionNumber(text) || `section-${sortOrder}`;
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

    function splitLegalText(text) {
      // Split on legal section patterns
      const patterns = [
        /(?=§\s*\d+[\.\-])/g,
        /(?=Section\s+\d+[\.\-])/gi,
        /(?=Article\s+[\dIVX]+)/gi,
        /(?=Title\s+\d+)/gi,
        /(?=Chapter\s+\d+)/gi
      ];
      
      for (const pattern of patterns) {
        const sections = text.split(pattern).filter(s => s.trim().length > 100);
        if (sections.length > 1) {
          return sections;
        }
      }
      
      // Fallback: split on double line breaks
      if (text.length > 2000) {
        return text.split(/\n\s*\n/).filter(s => s.trim().length > 100);
      }
      
      return [text];
    }

    function extractSectionNumber(text) {
      const patterns = [
        /§\s*(\d+[\.\-]?\d*[a-z]?)/i,
        /Section\s+(\d+[\.\-]?\d*[a-z]?)/i,
        /^(\d+[\.\-]\d*[a-z]?)/,
        /Article\s+([\dIVX]+)/i,
        /Title\s+(\d+)/i,
        /Chapter\s+(\d+)/i
      ];
      
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) return match[1];
      }
      
      return null;
    }

    function extractTitle(text) {
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      if (lines.length === 0) return 'Untitled Section';
      
      const firstLine = lines[0];
      
      if (firstLine.length < 120 && !firstLine.match(/^§|^Section|^SECTION/i)) {
        return firstLine;
      }
      
      const titleMatch = text.match(/(?:§|Section|SECTION)\s*\d+[\.\-]?\d*[a-z]?\s*[\.\-]?\s*(.+?)(?:\n|$)/i);
      if (titleMatch && titleMatch[1].trim().length < 100) {
        return titleMatch[1].trim();
      }
      
      const sentences = text.split(/[.!?]/);
      const firstSentence = sentences[0]?.trim();
      if (firstSentence && firstSentence.length < 150) {
        return firstSentence + '.';
      }
      
      return firstLine.length > 100 ? firstLine.substring(0, 100) + '...' : firstLine;
    }

  }, lawInfo.law_id);

  // Store in Supabase
  await storeLawInDatabase(lawInfo, lawData);
  
  console.log(`   ✅ Stored ${lawInfo.law_id}: ${lawData.sections.length} sections`);
}

async function storeLawInDatabase(lawInfo, lawData) {
  // Insert main law record
  const { error: lawError } = await supabase
    .from('ny_laws')
    .upsert({
      law_id: lawInfo.law_id,
      name: lawInfo.name,
      chapter: lawInfo.chapter || '',
      law_type: 'CONSOLIDATED',
      full_text: lawData.fullText,
      structure: { url: lawInfo.url, scraped_at: new Date().toISOString() },
      total_sections: lawData.sections.length,
      last_updated: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString()
    }, { onConflict: 'law_id' });

  if (lawError) {
    throw new Error(`Failed to store law: ${lawError.message}`);
  }

  // Clear existing sections for this law
  await supabase
    .from('ny_law_sections')
    .delete()
    .eq('law_id', lawInfo.law_id);

  // Insert sections in batches
  if (lawData.sections.length > 0) {
    const sectionsWithLawId = lawData.sections.map(section => ({
      ...section,
      law_id: lawInfo.law_id
    }));

    const batchSize = 50;
    for (let i = 0; i < sectionsWithLawId.length; i += batchSize) {
      const batch = sectionsWithLawId.slice(i, i + batchSize);
      
      const { error: sectionsError } = await supabase
        .from('ny_law_sections')
        .insert(batch);

      if (sectionsError) {
        console.warn(`   ⚠️  Section batch insert warning: ${sectionsError.message}`);
      }
    }
  }
}

// Run the scraper
console.log('🚀 Starting NY Laws Scraper...');
console.log('📡 Connecting to Supabase...');

scrapeAllNYLaws()
  .then(() => {
    console.log('\n🎉 ALL DONE! Check your Supabase database!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Scraper failed:', error);
    process.exit(1);
  });
import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dmtxyqgizfpghlqahqvo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtdHh5cWdpemZwZ2hscWFocXZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzNzYwNzcsImV4cCI6MjA0ODk1MjA3N30.q90xOJX5b8nZ_hNb3z3LCKjH4qvBBqhJNvqHl0zIdoE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function scrapeNYLaws() {
  console.log('🚀 STARTING AGGRESSIVE NY LAWS SCRAPER');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor'
    ]
  });

  try {
    const page = await browser.newPage();
    
    // Set realistic headers
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1366, height: 768 });
    
    console.log('📄 Navigating to NY Senate laws page...');
    
    await page.goto('https://legislation.nysenate.gov/laws', {
      waitUntil: 'networkidle0',
      timeout: 60000
    });

    // Wait for page to fully load
    console.log('⏳ Waiting for content to load...');
    await new Promise(resolve => setTimeout(resolve, 8000));

    // Extract page content
    const pageData = await page.evaluate(() => {
      // Try multiple strategies to find law links
      const laws = [];
      
      // Strategy 1: Look for any links with "law" in them
      const allLinks = Array.from(document.querySelectorAll('a'));
      
      console.log(`Found ${allLinks.length} total links on page`);
      
      // More aggressive pattern matching
      allLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        const text = (link.textContent || '').trim();
        
        // Look for consolidated law patterns
        if (text && href) {
          // Pattern: anything that looks like a law
          if (
            text.toLowerCase().includes('law') ||
            href.includes('/laws/') ||
            text.match(/^[A-Z]{2,5}(\s|$)/) ||  // ABC, ABCD, etc.
            text.match(/^\w+\s+Law$/i) ||       // "Banking Law"
            text.match(/Law\s*$/i)              // ends with "Law"
          ) {
            
            // Try to extract law ID
            let lawId = '';
            
            // From text patterns
            const textIdMatch = text.match(/^([A-Z]{2,5})\b/);
            if (textIdMatch) {
              lawId = textIdMatch[1];
            } else {
              // From href patterns
              const hrefIdMatch = href.match(/\/([A-Z]{2,5})(?:\/|$)/);
              if (hrefIdMatch) {
                lawId = hrefIdMatch[1];
              } else {
                // Generate from first letters of words
                const words = text.split(/\s+/).filter(w => w.length > 2);
                if (words.length >= 2) {
                  lawId = words.slice(0, 3).map(w => w.charAt(0).toUpperCase()).join('');
                }
              }
            }
            
            if (lawId && lawId.length >= 2) {
              laws.push({
                law_id: lawId,
                name: text,
                url: href.startsWith('http') ? href : `https://legislation.nysenate.gov${href}`,
                chapter: ''
              });
            }
          }
        }
      });
      
      // Remove duplicates by law_id
      const uniqueLaws = laws.filter((law, index, self) => 
        index === self.findIndex(l => l.law_id === law.law_id)
      );
      
      return {
        totalLinks: allLinks.length,
        bodyText: document.body.innerText.substring(0, 1000),
        title: document.title,
        url: window.location.href,
        laws: uniqueLaws,
        firstFewLinks: allLinks.slice(0, 20).map(a => ({
          text: a.textContent?.trim().substring(0, 50) || '',
          href: a.getAttribute('href')
        }))
      };
    });

    console.log(`\n🔍 PAGE ANALYSIS:`);
    console.log(`   Title: ${pageData.title}`);
    console.log(`   URL: ${pageData.url}`);
    console.log(`   Total links: ${pageData.totalLinks}`);
    console.log(`   Found ${pageData.laws.length} potential laws`);
    
    if (pageData.laws.length === 0) {
      console.log(`\n📋 FIRST 20 LINKS ON PAGE:`);
      pageData.firstFewLinks.forEach((link, i) => {
        console.log(`   ${i + 1}. "${link.text}" -> ${link.href}`);
      });
      
      console.log(`\n📄 PAGE CONTENT PREVIEW:`);
      console.log(pageData.bodyText);
    }

    if (pageData.laws.length > 0) {
      console.log(`\n🎯 FOUND LAWS:`);
      pageData.laws.slice(0, 10).forEach((law, i) => {
        console.log(`   ${i + 1}. ${law.law_id} - ${law.name}`);
      });

      // Try to scrape the first few laws
      let successful = 0;
      const maxLaws = Math.min(5, pageData.laws.length);
      
      for (let i = 0; i < maxLaws; i++) {
        const law = pageData.laws[i];
        try {
          console.log(`\n📖 Scraping ${law.law_id} - ${law.name}`);
          await scrapeSingleLaw(page, law, supabase);
          successful++;
          
          // Short delay
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (error) {
          console.error(`❌ Failed to scrape ${law.law_id}: ${error.message}`);
        }
      }
      
      console.log(`\n🎉 SCRAPING RESULT: ${successful}/${maxLaws} laws scraped successfully!`);
    } else {
      console.log(`\n❌ NO LAWS FOUND - Site structure may have changed`);
    }

  } finally {
    await browser.close();
  }
}

async function scrapeSingleLaw(page, law, supabase) {
  await page.goto(law.url, {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });

  await new Promise(resolve => setTimeout(resolve, 3000));

  const lawContent = await page.evaluate((lawId) => {
    const fullText = document.body.innerText || '';
    
    // Simple section splitting
    const sections = [];
    const paragraphs = fullText.split('\n\n').filter(p => p.trim().length > 50);
    
    paragraphs.forEach((para, index) => {
      if (para.trim().length > 50) {
        sections.push({
          location_id: `${lawId}-${index + 1}`,
          section_number: `${index + 1}`,
          title: para.split('\n')[0].trim().substring(0, 100),
          content: para.trim(),
          level: 1,
          sort_order: index + 1
        });
      }
    });

    return {
      fullText: fullText,
      sections: sections.slice(0, 20) // Limit sections
    };
  }, law.law_id);

  // Store in database
  const { error: lawError } = await supabase
    .from('ny_laws')
    .upsert({
      law_id: law.law_id,
      name: law.name,
      chapter: law.chapter || '',
      law_type: 'CONSOLIDATED',
      full_text: lawContent.fullText,
      structure: { url: law.url, scraped_at: new Date().toISOString() },
      total_sections: lawContent.sections.length,
      last_updated: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString()
    }, { onConflict: 'law_id' });

  if (lawError) throw new Error(`Database error: ${lawError.message}`);

  // Insert sections
  if (lawContent.sections.length > 0) {
    const sectionsWithLawId = lawContent.sections.map(section => ({
      ...section,
      law_id: law.law_id
    }));

    const { error: sectionsError } = await supabase
      .from('ny_law_sections')
      .upsert(sectionsWithLawId, { onConflict: 'law_id,location_id' });

    if (sectionsError) {
      console.warn(`Section warning: ${sectionsError.message}`);
    }
  }

  console.log(`   ✅ Stored ${law.law_id}: ${lawContent.sections.length} sections`);
}

scrapeNYLaws()
  .then(() => console.log('\n🎉 SCRAPER COMPLETED!'))
  .catch(error => console.error('\n💥 SCRAPER FAILED:', error));
import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dmtxyqgizfpghlqahqvo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtdHh5cWdpemZwZ2hscWFocXZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzM3NjA3NywiZXhwIjoyMDQ4OTUyMDc3fQ.P_JNPhSzW5KoJtVNozIRnxdAqfUYRjpA-5H35OHFGi0';

console.log('🚀 SCRAPING REAL ABC LAW FROM NY SENATE WEBSITE');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function scrapeABCLaw() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

    console.log('📄 Navigating to NY Senate ABC Law page...');
    
    // Try multiple potential URLs for ABC Law
    const abcUrls = [
      'https://www.nysenate.gov/legislation/laws/ABC',
      'https://www.nysenate.gov/legislation/laws/ABC/1',
      'https://legislation.nysenate.gov/pdf/laws/ABC',
      'https://www.nysenate.gov/legislation/laws/ABC/article-1',
      'https://www.nysenate.gov/legislation/laws/ALCOHOL'
    ];

    let pageFound = false;
    let currentUrl = '';

    for (const url of abcUrls) {
      try {
        console.log(`🔍 Trying: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
        
        // Check if page loaded successfully
        const title = await page.title();
        console.log(`   Title: ${title}`);
        
        if (title && !title.includes('404') && !title.includes('Not Found')) {
          pageFound = true;
          currentUrl = url;
          break;
        }
      } catch (error) {
        console.log(`   Failed: ${error.message}`);
        continue;
      }
    }

    if (!pageFound) {
      console.log('❌ Could not find ABC Law page. Let me search for it...');
      
      // Search for ABC Law
      await page.goto('https://www.nysenate.gov/legislation/laws', { waitUntil: 'networkidle0' });
      
      // Look for ABC or Alcoholic Beverage Control Law
      const abcLink = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        const abcLink = links.find(link => 
          link.textContent.toLowerCase().includes('alcoholic') ||
          link.textContent.toLowerCase().includes('abc') ||
          link.href.includes('/ABC')
        );
        return abcLink ? abcLink.href : null;
      });

      if (abcLink) {
        console.log(`🎯 Found ABC Law link: ${abcLink}`);
        await page.goto(abcLink, { waitUntil: 'networkidle0' });
        currentUrl = abcLink;
        pageFound = true;
      }
    }

    if (!pageFound) {
      throw new Error('Could not locate ABC Law on NY Senate website');
    }

    console.log(`✅ Found ABC Law at: ${currentUrl}`);

    // Extract all law content
    await page.waitForTimeout(3000);

    const abcLawData = await page.evaluate(() => {
      // Extract main law text
      const lawContent = document.body.innerText || document.body.textContent || '';
      
      // Try to find article/section structure
      const articles = [];
      const sections = [];
      
      // Look for article headers
      const articlePattern = /ARTICLE\s+(\d+|[IVX]+)\s*[-–—]?\s*([^\n]+)/gi;
      const sectionPattern = /(?:§|Section)\s*(\d+(?:\.\d+)?(?:-\w+)?)\s*\.?\s*([^\n]+)/gi;
      
      let articleMatch;
      while ((articleMatch = articlePattern.exec(lawContent)) !== null) {
        articles.push({
          number: articleMatch[1],
          title: articleMatch[2].trim(),
          position: articleMatch.index
        });
      }
      
      let sectionMatch;
      while ((sectionMatch = sectionPattern.exec(lawContent)) !== null) {
        sections.push({
          number: sectionMatch[1],
          title: sectionMatch[2].trim(),
          position: sectionMatch.index
        });
      }

      return {
        url: window.location.href,
        title: document.title,
        fullText: lawContent,
        articles: articles,
        sections: sections,
        textLength: lawContent.length
      };
    });

    console.log(`📊 Scraped ABC Law:`);
    console.log(`   URL: ${abcLawData.url}`);
    console.log(`   Title: ${abcLawData.title}`);
    console.log(`   Text Length: ${abcLawData.textLength} characters`);
    console.log(`   Articles Found: ${abcLawData.articles.length}`);
    console.log(`   Sections Found: ${abcLawData.sections.length}`);

    if (abcLawData.articles.length > 0) {
      console.log('\n📋 Articles:');
      abcLawData.articles.forEach((article, i) => {
        console.log(`   ${i + 1}. Article ${article.number}: ${article.title}`);
      });
    }

    if (abcLawData.sections.length > 0) {
      console.log('\n📋 First 10 Sections:');
      abcLawData.sections.slice(0, 10).forEach((section, i) => {
        console.log(`   ${i + 1}. § ${section.number}: ${section.title}`);
      });
    }

    // If we got substantial content, save to database
    if (abcLawData.textLength > 1000) {
      console.log('\n💾 Saving to Supabase...');
      
      // Clear existing ABC law
      await supabase.from('ny_law_sections').delete().eq('law_id', 'ABC');
      await supabase.from('ny_laws').delete().eq('law_id', 'ABC');

      // Insert main law record
      const { error: lawError } = await supabase
        .from('ny_laws')
        .insert({
          law_id: 'ABC',
          name: 'Alcoholic Beverage Control Law',
          chapter: '3-B',
          law_type: 'CONSOLIDATED',
          full_text: abcLawData.fullText,
          structure: {
            scraped_from: abcLawData.url,
            articles_found: abcLawData.articles.length,
            sections_found: abcLawData.sections.length,
            scraped_at: new Date().toISOString()
          },
          total_sections: abcLawData.sections.length,
          last_updated: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        });

      if (lawError) throw new Error(`Law insert failed: ${lawError.message}`);

      // Insert sections
      if (abcLawData.sections.length > 0) {
        const sectionRecords = abcLawData.sections.map((section, index) => ({
          law_id: 'ABC',
          location_id: `ABC-${section.number}`,
          section_number: section.number,
          title: section.title,
          content: extractSectionContent(abcLawData.fullText, section.position),
          level: 1,
          sort_order: index + 1
        }));

        const { error: sectionsError } = await supabase
          .from('ny_law_sections')
          .insert(sectionRecords);

        if (sectionsError) {
          console.warn(`Sections warning: ${sectionsError.message}`);
        }
      }

      console.log('✅ Successfully saved ABC Law to database!');
      console.log(`📊 Stats: ${abcLawData.articles.length} articles, ${abcLawData.sections.length} sections`);
      
    } else {
      console.log('⚠️ Not enough content scraped. May need to adjust scraping strategy.');
      console.log('First 500 characters:', abcLawData.fullText.substring(0, 500));
    }

  } catch (error) {
    console.error('💥 Scraping failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

function extractSectionContent(fullText, startPosition) {
  // Extract content for a specific section
  const contentAfter = fullText.substring(startPosition);
  const nextSectionMatch = contentAfter.match(/(?:§|Section)\s*\d+/);
  
  if (nextSectionMatch) {
    return contentAfter.substring(0, nextSectionMatch.index).trim();
  } else {
    // Take next 1000 characters if no next section found
    return contentAfter.substring(0, 1000).trim();
  }
}

// Run the scraper
scrapeABCLaw()
  .then(() => {
    console.log('\n🎉 ABC LAW SCRAPING COMPLETED!');
    console.log('Check your /laws page to see the complete ABC Law!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 SCRAPING FAILED:', error);
    process.exit(1);
  });
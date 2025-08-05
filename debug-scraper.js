import puppeteer from 'puppeteer';

async function debugNYLawsSite() {
  const browser = await puppeteer.launch({
    headless: false, // Show browser so we can see what's happening
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log('🚀 Testing different NY laws URLs...');
    
    // Test multiple URLs
    const urlsToTest = [
      'http://public.leginfo.state.ny.us/lawssrch.cgi?NVLWO:',
      'https://legislation.nysenate.gov/laws',
      'https://www.nysenate.gov/legislation/laws',
      'http://public.leginfo.state.ny.us/',
      'https://legislation.nysenate.gov/'
    ];

    for (const url of urlsToTest) {
      try {
        console.log(`\n📄 Testing: ${url}`);
        
        await page.goto(url, {
          waitUntil: 'networkidle0',
          timeout: 30000
        });

        await page.waitForTimeout(3000);

        // Get page info
        const pageInfo = await page.evaluate(() => {
          return {
            title: document.title,
            url: window.location.href,
            bodyText: document.body.innerText?.substring(0, 500),
            linkCount: document.querySelectorAll('a').length,
            allLinks: Array.from(document.querySelectorAll('a')).slice(0, 20).map(a => ({
              text: a.textContent?.trim().substring(0, 100) || '',
              href: a.getAttribute('href')
            })),
            hasLawsInText: document.body.innerText?.toLowerCase().includes('law'),
            hasConsolidatedInText: document.body.innerText?.toLowerCase().includes('consolidated'),
            possibleLawLinks: Array.from(document.querySelectorAll('a')).filter(a => {
              const text = a.textContent?.toLowerCase() || '';
              const href = a.getAttribute('href') || '';
              return text.includes('law') || href.includes('law') || text.match(/^[A-Z]{2,4}\s*-/) || href.match(/[A-Z]{2,4}/);
            }).slice(0, 10).map(a => ({
              text: a.textContent?.trim().substring(0, 100) || '',
              href: a.getAttribute('href')
            }))
          };
        });

        console.log('✅ SUCCESS - Page loaded:');
        console.log(`   Title: ${pageInfo.title}`);
        console.log(`   Final URL: ${pageInfo.url}`);
        console.log(`   Links found: ${pageInfo.linkCount}`);
        console.log(`   Contains "law": ${pageInfo.hasLawsInText}`);
        console.log(`   Contains "consolidated": ${pageInfo.hasConsolidatedInText}`);
        console.log(`   Body preview: ${pageInfo.bodyText?.substring(0, 200)}...`);
        
        if (pageInfo.possibleLawLinks.length > 0) {
          console.log(`   🎯 POSSIBLE LAW LINKS (${pageInfo.possibleLawLinks.length}):`);
          pageInfo.possibleLawLinks.forEach((link, i) => {
            console.log(`      ${i + 1}. "${link.text}" -> ${link.href}`);
          });
        }

        if (pageInfo.allLinks.length > 0) {
          console.log(`   📋 ALL LINKS (first 10):`);
          pageInfo.allLinks.slice(0, 10).forEach((link, i) => {
            console.log(`      ${i + 1}. "${link.text}" -> ${link.href}`);
          });
        }

        // If this looks promising, let's dig deeper
        if (pageInfo.possibleLawLinks.length > 5 || pageInfo.hasConsolidatedInText) {
          console.log(`\n🎯 THIS LOOKS PROMISING! URL: ${url}`);
          console.log('   Taking screenshot...');
          await page.screenshot({ path: 'ny-laws-debug.png', fullPage: true });
          break;
        }

      } catch (error) {
        console.log(`❌ FAILED: ${error.message}`);
      }
    }

    console.log('\n🔍 Manual browser inspection - check what you see in the opened browser!');
    console.log('Press Enter when you want to close...');
    
    // Keep browser open for manual inspection
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', () => {
      process.exit();
    });

  } catch (error) {
    console.error('💥 Debug failed:', error);
    await browser.close();
  }
}

debugNYLawsSite();
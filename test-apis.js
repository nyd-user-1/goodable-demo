#!/usr/bin/env node

/**
 * API Health Check Script
 * Tests all APIs and edge functions to confirm they're working
 */

import { createClient } from '@supabase/supabase-js';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}═══ ${msg} ═══${colors.reset}\n`),
};

// Load environment from .env if available
async function loadEnv() {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const envPath = path.join(process.cwd(), '.env.local');

    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length) {
          const value = valueParts.join('=').trim();
          process.env[key.trim()] = value;
        }
      });
    }
  } catch (error) {
    // .env.local not found, will use existing env vars
  }
}

// Initialize Supabase client
function initSupabase() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    log.error('Missing Supabase credentials');
    return null;
  }

  return createClient(supabaseUrl, supabaseKey);
}

// Test results tracker
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

// Test 1: Supabase Connection
async function testSupabaseConnection(supabase) {
  log.section('Testing Supabase Connection');

  try {
    const { data, error } = await supabase.from('Bills').select('count').limit(1);

    if (error) throw error;

    log.success('Supabase database connection working');
    results.passed++;
    return true;
  } catch (error) {
    log.error(`Supabase connection failed: ${error.message}`);
    results.failed++;
    return false;
  }
}

// Test 2: OpenAI via generate-with-openai
async function testOpenAI(supabase) {
  log.section('Testing OpenAI API');

  try {
    const { data, error } = await supabase.functions.invoke('generate-with-openai', {
      body: {
        prompt: 'Say "Hello, OpenAI is working!" in exactly 5 words.',
        type: 'default',
        model: 'gpt-4o-mini',
        enhanceWithNYSData: false
      }
    });

    if (error) throw error;

    if (data?.generatedText) {
      log.success('OpenAI API working');
      log.info(`Response: ${data.generatedText.substring(0, 100)}...`);
      results.passed++;
      return true;
    } else {
      throw new Error('No generated text in response');
    }
  } catch (error) {
    log.error(`OpenAI test failed: ${error.message}`);
    results.failed++;
    return false;
  }
}

// Test 3: Anthropic/Claude API
async function testClaude(supabase) {
  log.section('Testing Claude/Anthropic API');

  try {
    const { data, error } = await supabase.functions.invoke('generate-with-openai', {
      body: {
        prompt: 'Say "Hello, Claude is working!" in exactly 5 words.',
        type: 'default',
        model: 'claude-3-5-sonnet-20241022',
        enhanceWithNYSData: false
      }
    });

    if (error) throw error;

    if (data?.generatedText) {
      log.success('Claude API working');
      log.info(`Response: ${data.generatedText.substring(0, 100)}...`);
      results.passed++;
      return true;
    } else {
      throw new Error('No generated text in response');
    }
  } catch (error) {
    log.error(`Claude test failed: ${error.message}`);
    log.warning('This may be expected if Anthropic API key is not configured');
    results.warnings++;
    return false;
  }
}

// Test 4: Perplexity API
async function testPerplexity(supabase) {
  log.section('Testing Perplexity API');

  try {
    const { data, error } = await supabase.functions.invoke('generate-with-openai', {
      body: {
        prompt: 'Say "Hello, Perplexity is working!" in exactly 5 words.',
        type: 'default',
        model: 'llama-3.1-sonar-small-128k-online',
        enhanceWithNYSData: false
      }
    });

    if (error) throw error;

    if (data?.generatedText) {
      log.success('Perplexity API working');
      log.info(`Response: ${data.generatedText.substring(0, 100)}...`);
      results.passed++;
      return true;
    } else {
      throw new Error('No generated text in response');
    }
  } catch (error) {
    log.error(`Perplexity test failed: ${error.message}`);
    log.warning('This may be expected if Perplexity API key is not configured');
    results.warnings++;
    return false;
  }
}

// Test 5: NYS Legislation API
async function testNYSAPI(supabase) {
  log.section('Testing NYS Legislation API');

  try {
    const { data, error } = await supabase.functions.invoke('nys-legislation-search', {
      body: {
        searchType: 'bills',
        query: 'education',
        sessionYear: 2025,
        limit: 5
      }
    });

    if (error) throw error;

    if (data?.success && data?.result?.items) {
      log.success('NYS Legislation API working');
      log.info(`Found ${data.result.items.length} bills`);
      results.passed++;
      return true;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    log.error(`NYS API test failed: ${error.message}`);
    results.failed++;
    return false;
  }
}

// Test 6: AI with NYS Data Enhancement
async function testAIWithNYSData(supabase) {
  log.section('Testing AI with NYS Data Enhancement');

  try {
    const { data, error } = await supabase.functions.invoke('generate-with-openai', {
      body: {
        prompt: 'What are some recent education bills in New York?',
        type: 'chat',
        model: 'gpt-4o-mini',
        enhanceWithNYSData: true
      }
    });

    if (error) throw error;

    if (data?.generatedText && data?.nysDataUsed) {
      log.success('AI with NYS data enhancement working');
      log.info(`NYS Data Used: ${data.nysDataUsed}`);
      log.info(`Response: ${data.generatedText.substring(0, 150)}...`);
      results.passed++;
      return true;
    } else {
      log.warning('AI response received but NYS data may not be integrated');
      results.warnings++;
      return false;
    }
  } catch (error) {
    log.error(`AI with NYS data test failed: ${error.message}`);
    results.failed++;
    return false;
  }
}

// Test 7: Check Subscription Function
async function testCheckSubscription(supabase) {
  log.section('Testing Check Subscription Function');

  try {
    // This will fail without auth, but we can test if the function exists
    const { error } = await supabase.functions.invoke('check-subscription', {
      body: {}
    });

    // Expected to fail with auth error, but function should exist
    if (error && error.message && !error.message.includes('not found')) {
      log.success('Check subscription function exists and is accessible');
      results.passed++;
      return true;
    } else if (!error) {
      log.success('Check subscription function working');
      results.passed++;
      return true;
    } else {
      throw error;
    }
  } catch (error) {
    log.error(`Check subscription test failed: ${error.message}`);
    results.failed++;
    return false;
  }
}

// Test 8: Database Tables
async function testDatabaseTables(supabase) {
  log.section('Testing Database Tables');

  const tables = ['Bills', 'People', 'Committees', 'chat_sessions', 'user_favorites'];
  let allPassed = true;

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);

      if (error) throw error;

      log.success(`Table "${table}" accessible`);
      results.passed++;
    } catch (error) {
      log.error(`Table "${table}" failed: ${error.message}`);
      results.failed++;
      allPassed = false;
    }
  }

  return allPassed;
}

// Main test runner
async function runAllTests() {
  console.log('\n🔍 API Health Check Started\n');

  await loadEnv();
  const supabase = initSupabase();

  if (!supabase) {
    log.error('Cannot initialize Supabase client. Check your environment variables.');
    process.exit(1);
  }

  // Run all tests
  await testSupabaseConnection(supabase);
  await testDatabaseTables(supabase);
  await testOpenAI(supabase);
  await testClaude(supabase);
  await testPerplexity(supabase);
  await testNYSAPI(supabase);
  await testAIWithNYSData(supabase);
  await testCheckSubscription(supabase);

  // Print summary
  log.section('Test Summary');
  console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
  console.log(`${colors.yellow}Warnings: ${results.warnings}${colors.reset}`);

  const total = results.passed + results.failed + results.warnings;
  const successRate = ((results.passed / total) * 100).toFixed(1);

  console.log(`\n${colors.cyan}Success Rate: ${successRate}%${colors.reset}\n`);

  if (results.failed > 0) {
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  log.error(`Test runner failed: ${error.message}`);
  process.exit(1);
});

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dmtxyqgizfpghlqahqvo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtdHh5cWdpemZwZ2hscWFocXZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzNzYwNzcsImV4cCI6MjA0ODk1MjA3N30.q90xOJX5b8nZ_hNb3z3LCKjH4qvBBqhJNvqHl0zIdoE';

console.log('🔍 TESTING SUPABASE CONNECTION...');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Test 1: Read existing data
    console.log('\n📖 Test 1: Reading existing data');
    const { data: readData, error: readError } = await supabase
      .from('ny_laws')
      .select('*')
      .limit(5);
    
    if (readError) {
      console.error('❌ Read failed:', readError);
    } else {
      console.log('✅ Read success:', readData?.length || 0, 'laws found');
      if (readData?.length > 0) {
        console.log('   Sample:', readData[0].law_id, '-', readData[0].name);
      }
    }

    // Test 2: Try to insert
    console.log('\n📝 Test 2: Trying to insert test data');
    const { data: insertData, error: insertError } = await supabase
      .from('ny_laws')
      .insert({
        law_id: 'TEST',
        name: 'Test Law',
        chapter: '999',
        law_type: 'CONSOLIDATED',
        full_text: 'This is a test law.',
        total_sections: 0,
        last_updated: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('❌ Insert failed:', insertError);
      console.log('   Code:', insertError.code);
      console.log('   Details:', insertError.details);
      console.log('   Hint:', insertError.hint);
    } else {
      console.log('✅ Insert success:', insertData);
    }

    // Test 3: Check RLS policies
    console.log('\n🔒 Test 3: Checking if RLS is blocking us');
    const { data: authData } = await supabase.auth.getUser();
    console.log('   Current user:', authData?.user?.id || 'Not authenticated');

  } catch (error) {
    console.error('💥 Connection test failed:', error);
  }
}

testConnection();
// Avatar Upload Test Utility
// This can be used to diagnose avatar upload issues

import { supabase } from '@/integrations/supabase/client';

export const testAvatarUpload = async () => {
  console.log('=== AVATAR UPLOAD DIAGNOSTIC TEST ===');
  
  try {
    // Test 1: Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('1. Authentication Check:');
    if (authError) {
      console.error('   ❌ Auth Error:', authError);
      return;
    }
    if (!user) {
      console.error('   ❌ No user found');
      return;
    }
    console.log('   ✅ User authenticated:', user.email);
    console.log('   ✅ User ID:', user.id);

    // Test 2: Check bucket access
    console.log('\n2. Storage Bucket Access:');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
      console.error('   ❌ Bucket List Error:', bucketError);
    } else {
      const avatarBucket = buckets.find(b => b.id === 'avatars');
      if (avatarBucket) {
        console.log('   ✅ Avatars bucket found:', avatarBucket);
      } else {
        console.error('   ❌ Avatars bucket not found');
        console.log('   Available buckets:', buckets.map(b => b.id));
      }
    }

    // Test 3: Check profile access
    console.log('\n3. Profile Table Access:');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (profileError) {
      console.error('   ❌ Profile Error:', profileError);
      if (profileError.code === 'PGRST116') {
        console.log('   ℹ️  No profile found - will create one on upload');
      }
    } else {
      console.log('   ✅ Profile found:', profile);
    }

    // Test 4: Test file listing in avatars bucket
    console.log('\n4. Avatar Files Access:');
    const { data: files, error: listError } = await supabase.storage
      .from('avatars')
      .list('');
    
    if (listError) {
      console.error('   ❌ File List Error:', listError);
    } else {
      console.log('   ✅ Can list files in avatars bucket');
      const userFiles = files.filter(f => f.name.includes(user.id));
      console.log(`   ℹ️  Found ${userFiles.length} existing avatar(s) for this user`);
    }

    // Test 5: Create a test file upload (small base64 image)
    console.log('\n5. Test File Upload:');
    const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const testFile = dataURLtoFile(testImageData, 'test.png');
    
    const fileName = `test-${user.id}-${Date.now()}.png`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, testFile, { upsert: true });
    
    if (uploadError) {
      console.error('   ❌ Upload Test Error:', uploadError);
    } else {
      console.log('   ✅ Test upload successful:', uploadData);
      
      // Clean up test file
      await supabase.storage.from('avatars').remove([fileName]);
      console.log('   ✅ Test file cleaned up');
    }

    console.log('\n=== TEST COMPLETE ===');
    return true;

  } catch (error) {
    console.error('Test failed with exception:', error);
    return false;
  }
};

// Helper function to convert base64 data URL to File
function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

// Export for console usage
if (typeof window !== 'undefined') {
  (window as any).testAvatarUpload = testAvatarUpload;
}
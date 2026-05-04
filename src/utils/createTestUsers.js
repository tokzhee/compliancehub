/**
 * Standalone Test User Creation Script
 * 
 * Usage:
 * 1. Browser Console: Copy and paste this entire file into browser console while on your app
 * 2. Node.js: Run with `node src/utils/createTestUsers.js` (requires dotenv)
 * 
 * This script uses Supabase Admin API to create users in auth.users table
 */

import { createClient } from '@supabase/supabase-js';

// Test users configuration
const TEST_USERS = [
  {
    email: 'admin@ahlibank.com',
    password: 'Test@123',
    role: 'System Administrator'
  },
  {
    email: 'officer@ahlibank.com',
    password: 'Test@123',
    role: 'Compliance Officer'
  },
  {
    email: 'analyst@ahlibank.com',
    password: 'Test@123',
    role: 'Compliance Analyst'
  },
  {
    email: 'reviewer@ahlibank.com',
    password: 'Test@123',
    role: 'Data Reviewer'
  }
];

/**
 * Create test users using Supabase Admin API
 */
async function createTestUsers() {
  console.log('🚀 Starting test user creation...');
  
  // Get environment variables
  const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
  const serviceRoleKey = import.meta.env?.VITE_SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing required environment variables:');
    console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
    console.error('VITE_SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? '✅' : '❌');
    return;
  }
  
  // Create admin client with service role key
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  console.log('✅ Admin client initialized');
  console.log(`📝 Creating ${TEST_USERS?.length} test users...\n`);
  
  const results = {
    success: [],
    failed: [],
    alreadyExists: []
  };
  
  // Create each user
  for (const user of TEST_USERS) {
    try {
      console.log(`Creating user: ${user?.email}...`);
      
      const { data, error } = await supabaseAdmin?.auth?.admin?.createUser({
        email: user?.email,
        password: user?.password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          role: user?.role
        }
      });
      
      if (error) {
        // Check if user already exists
        if (error?.message?.includes('already registered') || error?.message?.includes('already exists')) {
          console.log(`⚠️  User ${user?.email} already exists`);
          results?.alreadyExists?.push(user?.email);
        } else {
          console.error(`❌ Failed to create ${user?.email}:`, error?.message);
          results?.failed?.push({ email: user?.email, error: error?.message });
        }
      } else {
        console.log(`✅ Successfully created ${user?.email} (ID: ${data?.user?.id})`);
        results?.success?.push(user?.email);
      }
      
    } catch (err) {
      console.error(`❌ Exception creating ${user?.email}:`, err?.message);
      results?.failed?.push({ email: user?.email, error: err?.message });
    }
  }
  
  // Print summary
  console.log('\n' + '='?.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='?.repeat(60));
  console.log(`✅ Successfully created: ${results?.success?.length}`);
  if (results?.success?.length > 0) {
    results?.success?.forEach(email => console.log(`   - ${email}`));
  }
  
  console.log(`⚠️  Already existed: ${results?.alreadyExists?.length}`);
  if (results?.alreadyExists?.length > 0) {
    results?.alreadyExists?.forEach(email => console.log(`   - ${email}`));
  }
  
  console.log(`❌ Failed: ${results?.failed?.length}`);
  if (results?.failed?.length > 0) {
    results?.failed?.forEach(item => console.log(`   - ${item?.email}: ${item?.error}`));
  }
  
  console.log('\n' + '='?.repeat(60));
  console.log('🎯 Next Steps:');
  console.log('1. Check your Supabase Dashboard → Authentication → Users');
  console.log('2. Verify user_profiles were auto-created by trigger');
  console.log('3. Test login with any of the created users');
  console.log('   Email: admin@ahlibank.com');
  console.log('   Password: Test@123');
  console.log('='?.repeat(60));
  
  return results;
}

// Export for module usage
export { createTestUsers };

// Auto-execute if running in browser console or as standalone script
if (typeof window !== 'undefined') {
  // Browser environment - attach to window for easy access
  window.createTestUsers = createTestUsers;
  console.log('✅ Script loaded! Run: createTestUsers()');
} else {
  // Node.js environment - execute immediately
  createTestUsers()?.catch(console.error);
}

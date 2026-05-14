/**
 * Standalone Test User Creation Script
 * 
 * Usage:
 * 1. Browser Console: Copy and paste this entire file into browser console while on your app
 * 2. Node.js: Run with `node src/utils/createTestUsers.js` (requires dotenv)
 * 
 * This script uses Supabase Admin API to create users in auth.users table
 */

// This utility was used to create test users in Supabase.
// Supabase has been removed from this project.
// User creation is now handled through the REST API (VITE_API_BASE_URL).
export function createTestUsers() {
  console.warn('createTestUsers: Supabase has been removed. Use the REST API to manage users.');
}

// Auto-execute if running in browser console or as standalone script
if (typeof window !== 'undefined') {
  // Browser environment - attach to window for easy access
  window.createTestUsers = createTestUsers;
  console.log('✅ Script loaded! Run: createTestUsers()');
} else {
  // Node.js environment - execute immediately
  createTestUsers()?.catch(console.error);
}

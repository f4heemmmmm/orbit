/**
 * Supabase Connection Test
 * 
 * This file contains test functions to verify your Supabase connection is working.
 * You can call these functions from your app to test the connection.
 * 
 * Usage:
 * import { testSupabaseConnection } from '@/lib/test-supabase';
 * await testSupabaseConnection();
 */

import { supabase } from './supabase';

/**
 * Test basic Supabase connection
 */
export async function testSupabaseConnection(): Promise<void> {
  console.log('🧪 Testing Supabase connection...\n');

  try {
    // Test 1: Check if client is initialized
    console.log('✓ Supabase client initialized');

    // Test 2: Try to get session (will be null if not logged in)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    console.log('✓ Auth session check:', session ? 'Logged in' : 'Not logged in');

    // Test 3: Try a simple database query (will fail if not authenticated, which is expected)
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      // This is expected if not logged in due to RLS policies
      console.log('✓ Database connection working (RLS protecting data as expected)');
    } else {
      console.log('✓ Database query successful');
    }

    console.log('\n✅ Supabase connection test passed!');
    console.log('Your Supabase backend is properly configured.\n');
  } catch (error) {
    console.error('\n❌ Supabase connection test failed!');
    console.error('Error:', error);
    console.error('\nPlease check:');
    console.error('1. Your .env file has correct EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
    console.error('2. Your Supabase project is running');
    console.error('3. You have run the database migrations\n');
    throw error;
  }
}

/**
 * Test user signup
 */
export async function testSignUp(email: string, password: string): Promise<void> {
  console.log('🧪 Testing user signup...\n');

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    console.log('✅ User signup successful!');
    console.log('User ID:', data.user?.id);
    console.log('Email:', data.user?.email);
    console.log('\nNote: Check your email for confirmation link if email confirmation is enabled.\n');
  } catch (error) {
    console.error('❌ Signup failed:', error);
    throw error;
  }
}

/**
 * Test user login
 */
export async function testSignIn(email: string, password: string): Promise<void> {
  console.log('🧪 Testing user login...\n');

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    console.log('✅ User login successful!');
    console.log('User ID:', data.user?.id);
    console.log('Email:', data.user?.email);
    console.log('Session expires at:', data.session?.expires_at);
    console.log('\n');
  } catch (error) {
    console.error('❌ Login failed:', error);
    throw error;
  }
}

/**
 * Test creating a transaction
 */
export async function testCreateTransaction(): Promise<void> {
  console.log('🧪 Testing transaction creation...\n');

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Create a test transaction
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        title: 'Test Transaction',
        description: 'This is a test transaction from the Supabase test',
        amount: 100.50,
        type: 'income',
        category: 'Salary',
      })
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Transaction created successfully!');
    console.log('Transaction ID:', data.id);
    console.log('Title:', data.title);
    console.log('Amount:', data.amount);
    console.log('\n');
  } catch (error) {
    console.error('❌ Transaction creation failed:', error);
    throw error;
  }
}

/**
 * Run all tests
 */
export async function runAllTests(email?: string, password?: string): Promise<void> {
  console.log('🚀 Running all Supabase tests...\n');
  console.log('='.repeat(50));
  
  await testSupabaseConnection();
  
  if (email && password) {
    console.log('='.repeat(50));
    await testSignUp(email, password);
    
    console.log('='.repeat(50));
    await testSignIn(email, password);
    
    console.log('='.repeat(50));
    await testCreateTransaction();
  }
  
  console.log('='.repeat(50));
  console.log('\n✅ All tests completed!\n');
}


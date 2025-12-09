/**
 * Supabase Client Configuration
 * 
 * This file initializes the Supabase client for the Orbit app.
 * It uses the environment variables from the .env file and configures
 * the client with AsyncStorage for session persistence.
 */

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Database } from '../types/database';
import { ENV } from '@config/env';

// Validate environment variables
if (!ENV.SUPABASE_URL || !ENV.SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase environment variables!\n' +
    'Please make sure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set in your .env file.\n' +
    'See orbit-backend/.env.example for reference.'
  );
}

/**
 * Supabase client instance
 * 
 * This client is configured with:
 * - Type-safe database operations using generated types
 * - AsyncStorage for session persistence (keeps users logged in)
 * - Auto token refresh
 * - Session persistence across app restarts
 */
export const supabase = createClient<Database>(
  ENV.SUPABASE_URL,
  ENV.SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

/**
 * Helper function to check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

/**
 * Helper function to get current user
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Helper function to sign out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}


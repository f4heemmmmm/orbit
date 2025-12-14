/**
 * Authentication Service
 * Handles user authentication operations with Supabase
 */

import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

export interface AuthUser {
  id: string;
  email: string;
  profile: Profile | null;
}

/**
 * Sign up a new user
 */
export async function signUp(email: string, password: string, fullName?: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      throw error;
    }

    // Create profile entry
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        email: data.user.email ?? '',
        full_name: fullName || null,
      });

      if (profileError) {
        throw profileError;
      }
    }

    return { data, error: null };
  } catch (error) {
    console.error('Sign up error:', error);
    return { data: null, error };
  }
}

/**
 * Sign in an existing user
 */
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
    return { data, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    return { data: null, error };
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error };
  }
}

/**
 * Get the current user session
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }
    if (!session?.user) {
      return null;
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      throw profileError;
    }

    return {
      id: session.user.id,
      email: session.user.email ?? '',
      profile,
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

/**
 * Get current user ID (helper function)
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.user?.id || null;
  } catch (error) {
    console.error('Get current user ID error:', error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateProfile(updates: { full_name?: string; avatar_url?: string }) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('No user logged in');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return { data, error: null };
  } catch (error) {
    console.error('Update profile error:', error);
    return { data: null, error };
  }
}

/**
 * Delete user account and all associated data
 * This will delete the user's profile and cascade delete all related data
 * Note: The auth user will remain but will have no associated data
 */
export async function deleteAccount() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('No user logged in');
    }

    // Delete user's profile (this will cascade delete all related data due to foreign key constraints)
    // This includes: transactions, tasks, groceries, schedule events, etc.
    const { error: profileError } = await supabase.from('profiles').delete().eq('id', userId);

    if (profileError) {
      throw profileError;
    }

    // Sign out the user
    await signOut();

    return { error: null };
  } catch (error) {
    console.error('Delete account error:', error);
    return { error };
  }
}

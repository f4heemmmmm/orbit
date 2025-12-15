/**
 * Grocery Service
 * Handles all grocery item-related database operations
 */

import { supabase } from '../lib/supabase';
import { getCurrentUserId } from './authService';
import type { Database } from '../types/database';

type GroceryItemRow = Database['public']['Tables']['grocery_items']['Row'];
type GroceryItemInsert = Database['public']['Tables']['grocery_items']['Insert'];
type GroceryItemUpdate = Database['public']['Tables']['grocery_items']['Update'];

/**
 * Fetch all grocery items for the current user
 */
export async function getGroceryItems(): Promise<GroceryItemRow[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('No user logged in');
    }

    const { data, error } = await supabase
      .from('grocery_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }
    return data || [];
  } catch (error) {
    console.error('Error fetching grocery items:', error);
    return [];
  }
}

/**
 * Create a new grocery item
 */
export async function createGroceryItem(
  item: Omit<GroceryItemInsert, 'user_id' | 'id'>
): Promise<GroceryItemRow | null> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('No user logged in');
    }

    const { data, error } = await supabase
      .from('grocery_items')
      .insert({
        ...item,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error creating grocery item:', error);
    return null;
  }
}

/**
 * Update an existing grocery item
 */
export async function updateGroceryItem(
  id: string,
  updates: GroceryItemUpdate
): Promise<GroceryItemRow | null> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('No user logged in');
    }

    const { data, error } = await supabase
      .from('grocery_items')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId) // Ensure user owns this item
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error updating grocery item:', error);
    return null;
  }
}

/**
 * Toggle grocery item completion status
 */
export async function toggleGroceryItemCompletion(id: string): Promise<GroceryItemRow | null> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('No user logged in');
    }

    // First get the current item
    const { data: currentItem, error: fetchError } = await supabase
      .from('grocery_items')
      .select('completed')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Toggle the completion status
    const { data, error } = await supabase
      .from('grocery_items')
      .update({ completed: !currentItem.completed })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error toggling grocery item completion:', error);
    return null;
  }
}

/**
 * Delete a grocery item
 */
export async function deleteGroceryItem(id: string): Promise<boolean> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('No user logged in');
    }

    const { error } = await supabase
      .from('grocery_items')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }
    return true;
  } catch (error) {
    console.error('Error deleting grocery item:', error);
    return false;
  }
}

/**
 * Delete all grocery items for the current user
 */
export async function deleteAllGroceryItems(): Promise<boolean> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('No user logged in');
    }

    const { error } = await supabase.from('grocery_items').delete().eq('user_id', userId);

    if (error) {
      throw error;
    }
    return true;
  } catch (error) {
    console.error('Error deleting all grocery items:', error);
    return false;
  }
}

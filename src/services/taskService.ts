/**
 * Task Service
 * Handles all task-related database operations
 */

import { supabase } from '../lib/supabase';
import { getCurrentUserId } from './authService';
import type { Database } from '../types/database';

type TaskRow = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

/**
 * Fetch all tasks for the current user
 * Orders by sort_order if present, otherwise by created_at
 */
export async function getTasks(): Promise<TaskRow[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('No user logged in');
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Sort tasks: those with sort_order first (by sort_order), then nulls (by created_at desc)
    const sortedData = (data || []).sort((a, b) => {
      // If both have sort_order, sort by sort_order ascending
      if (a.sort_order !== null && b.sort_order !== null) {
        return a.sort_order - b.sort_order;
      }
      // If only a has sort_order, a comes first
      if (a.sort_order !== null) {
        return -1;
      }
      // If only b has sort_order, b comes first
      if (b.sort_order !== null) {
        return 1;
      }
      // If neither has sort_order, sort by created_at descending
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return sortedData;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
}

/**
 * Create a new task
 */
export async function createTask(
  task: Omit<TaskInsert, 'user_id' | 'id'>
): Promise<TaskRow | null> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('No user logged in');
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...task,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error creating task:', error);
    return null;
  }
}

/**
 * Update an existing task
 */
export async function updateTask(id: string, updates: TaskUpdate): Promise<TaskRow | null> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('No user logged in');
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId) // Ensure user owns this task
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error updating task:', error);
    return null;
  }
}

/**
 * Toggle task completion status
 */
export async function toggleTaskCompletion(id: string): Promise<TaskRow | null> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('No user logged in');
    }

    // First get the current task
    const { data: currentTask, error: fetchError } = await supabase
      .from('tasks')
      .select('completed')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Toggle the completion status
    const { data, error } = await supabase
      .from('tasks')
      .update({ completed: !currentTask.completed })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error toggling task completion:', error);
    return null;
  }
}

/**
 * Delete a task
 */
export async function deleteTask(id: string): Promise<boolean> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('No user logged in');
    }

    const { error } = await supabase.from('tasks').delete().eq('id', id).eq('user_id', userId); // Ensure user owns this task

    if (error) {
      throw error;
    }
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    return false;
  }
}

/**
 * Get tasks by completion status
 */
export async function getTasksByStatus(completed: boolean): Promise<TaskRow[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('No user logged in');
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', completed)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }
    return data || [];
  } catch (error) {
    console.error('Error fetching tasks by status:', error);
    return [];
  }
}

/**
 * Update sort_order for multiple tasks in batch
 * @param orderedTaskIds Array of task IDs in the desired order
 */
export async function updateTaskSortOrder(orderedTaskIds: string[]): Promise<boolean> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('No user logged in');
    }

    // Update each task with its new sort_order
    const updates = orderedTaskIds.map((taskId, index) =>
      supabase.from('tasks').update({ sort_order: index }).eq('id', taskId).eq('user_id', userId)
    );

    const results = await Promise.all(updates);

    // Check if any updates failed
    const hasError = results.some(result => result.error);
    if (hasError) {
      console.error(
        'Some updates failed:',
        results.filter(r => r.error)
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating task sort order:', error);
    return false;
  }
}

/**
 * Reset sort_order for all tasks (sets to null)
 * Used for "Recover" functionality to restore default ordering
 */
export async function resetTaskSortOrder(): Promise<boolean> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('No user logged in');
    }

    const { error } = await supabase
      .from('tasks')
      .update({ sort_order: null })
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error resetting task sort order:', error);
    return false;
  }
}

/**
 * Check if any tasks have a custom sort order
 */
export async function hasCustomSortOrder(): Promise<boolean> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return false;
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('sort_order')
      .eq('user_id', userId)
      .not('sort_order', 'is', null)
      .limit(1);

    if (error) {
      throw error;
    }

    return (data?.length || 0) > 0;
  } catch (error) {
    console.error('Error checking custom sort order:', error);
    return false;
  }
}

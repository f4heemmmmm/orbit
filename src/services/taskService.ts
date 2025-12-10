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
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }
    return data || [];
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

/**
 * Schedule Service
 * Handles all schedule event-related database operations
 */

import { supabase } from '../lib/supabase';
import { getCurrentUserId } from './authService';
import type { Database } from '../types/database';

type ScheduleEventRow = Database['public']['Tables']['schedule_events']['Row'];
type ScheduleEventInsert = Database['public']['Tables']['schedule_events']['Insert'];
type ScheduleEventUpdate = Database['public']['Tables']['schedule_events']['Update'];

/**
 * Fetch all schedule events for the current user
 */
export async function getScheduleEvents(): Promise<ScheduleEventRow[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('No user logged in');
    }

    const { data, error } = await supabase
      .from('schedule_events')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (error) {
      throw error;
    }
    return data || [];
  } catch (error) {
    console.error('Error fetching schedule events:', error);
    return [];
  }
}

/**
 * Create a new schedule event
 */
export async function createScheduleEvent(
  event: Omit<ScheduleEventInsert, 'user_id' | 'id'>
): Promise<ScheduleEventRow | null> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('No user logged in');
    }

    const { data, error } = await supabase
      .from('schedule_events')
      .insert({
        ...event,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error creating schedule event:', error);
    return null;
  }
}

/**
 * Update an existing schedule event
 */
export async function updateScheduleEvent(
  id: string,
  updates: ScheduleEventUpdate
): Promise<ScheduleEventRow | null> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('No user logged in');
    }

    const { data, error } = await supabase
      .from('schedule_events')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId) // Ensure user owns this event
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error updating schedule event:', error);
    return null;
  }
}

/**
 * Delete a schedule event
 */
export async function deleteScheduleEvent(id: string): Promise<boolean> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('No user logged in');
    }

    const { error } = await supabase
      .from('schedule_events')
      .delete()
      .eq('id', id)
      .eq('user_id', userId); // Ensure user owns this event

    if (error) {
      throw error;
    }
    return true;
  } catch (error) {
    console.error('Error deleting schedule event:', error);
    return false;
  }
}

/**
 * Get upcoming events (next N days)
 */
export async function getUpcomingEvents(daysAhead: number = 7): Promise<ScheduleEventRow[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('No user logged in');
    }

    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('schedule_events')
      .select('*')
      .eq('user_id', userId)
      .gte('date', today)
      .lte('date', futureDateStr)
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (error) {
      throw error;
    }
    return data || [];
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    return [];
  }
}

/**
 * Get events by type
 */
export async function getEventsByType(
  type: 'activity' | 'exam' | 'class' | 'other'
): Promise<ScheduleEventRow[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('No user logged in');
    }

    const { data, error } = await supabase
      .from('schedule_events')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (error) {
      throw error;
    }
    return data || [];
  } catch (error) {
    console.error('Error fetching events by type:', error);
    return [];
  }
}

/**
 * Generate dates for recurring events
 * Returns all dates that fall on the specified day of week between start and end dates (inclusive)
 */
export function generateRecurringDates(
  startDate: Date,
  endDate: Date,
  dayOfWeek: number // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
): Date[] {
  const dates: Date[] = [];
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  // If start date is the target day, include it
  if (current.getDay() === dayOfWeek) {
    dates.push(new Date(current));
  }

  // Move to the next occurrence of the target day
  const daysUntilTarget = (dayOfWeek - current.getDay() + 7) % 7;
  if (daysUntilTarget > 0) {
    current.setDate(current.getDate() + daysUntilTarget);
  } else if (dates.length === 0) {
    // If we're on the target day but didn't add it (shouldn't happen), add a week
    current.setDate(current.getDate() + 7);
  } else {
    // Move to next week's occurrence
    current.setDate(current.getDate() + 7);
  }

  // Add all occurrences until end date
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 7);
  }

  return dates;
}

/**
 * Create recurring events
 * Creates multiple events on the specified day of week between start and end dates
 */
export async function createRecurringEvents(
  event: Omit<ScheduleEventInsert, 'user_id' | 'id' | 'date'>,
  startDate: Date,
  endDate: Date
): Promise<{ created: ScheduleEventRow[]; failed: number }> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('No user logged in');
    }

    // Get the day of week from the start date
    const dayOfWeek = startDate.getDay();

    // Generate all dates for the recurring event
    const dates = generateRecurringDates(startDate, endDate, dayOfWeek);

    if (dates.length === 0) {
      return { created: [], failed: 0 };
    }

    // Create events for all dates
    const results: ScheduleEventRow[] = [];
    let failedCount = 0;

    for (const date of dates) {
      const dateStr = date.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('schedule_events')
        .insert({
          ...event,
          user_id: userId,
          date: dateStr,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating recurring event for date:', dateStr, error);
        failedCount++;
      } else if (data) {
        results.push(data);
      }
    }

    return { created: results, failed: failedCount };
  } catch (error) {
    console.error('Error creating recurring events:', error);
    return { created: [], failed: -1 };
  }
}

/**
 * Schedule Service
 * Handles all schedule event-related database operations
 */

import { supabase } from '../lib/supabase';
import { getCurrentUserId } from './authService';
import { Database } from '../types/database';

type ScheduleEventRow = Database['public']['Tables']['schedule_events']['Row'];
type ScheduleEventInsert = Database['public']['Tables']['schedule_events']['Insert'];
type ScheduleEventUpdate = Database['public']['Tables']['schedule_events']['Update'];

/**
 * Fetch all schedule events for the current user
 */
export async function getScheduleEvents(): Promise<ScheduleEventRow[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('schedule_events')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (error) throw error;
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
    if (!userId) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('schedule_events')
      .insert({
        ...event,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;
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
    if (!userId) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('schedule_events')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId) // Ensure user owns this event
      .select()
      .single();

    if (error) throw error;
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
    if (!userId) throw new Error('No user logged in');

    const { error } = await supabase
      .from('schedule_events')
      .delete()
      .eq('id', id)
      .eq('user_id', userId); // Ensure user owns this event

    if (error) throw error;
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
    if (!userId) throw new Error('No user logged in');

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

    if (error) throw error;
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
    if (!userId) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('schedule_events')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching events by type:', error);
    return [];
  }
}


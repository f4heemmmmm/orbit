/**
 * Prayer Service
 * Handles all prayer-related database operations and sync functionality
 */

import { supabase } from '../lib/supabase';
import { getCurrentUserId } from './authService';
import { ENV } from '../config/env';
import type { Database } from '../types/database';
import type { SyncResult, TimetableInfo, UserPrayerSettings } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type PrayerTimeRow = Database['public']['Tables']['prayer_times']['Row'];

const PRAYER_SETTINGS_KEY = '@orbit_prayer_settings';

/**
 * Get today's date in YYYY-MM-DD format (local timezone)
 */
function getLocalDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get today's prayer times for the current user
 */
export async function getTodayPrayerTimes(): Promise<PrayerTimeRow | null> {
  try {
    const userId = await getCurrentUserId();
    console.log('[PrayerService] User ID:', userId);
    if (!userId) {
      throw new Error('No user logged in');
    }

    const today = getLocalDateString();
    console.log('[PrayerService] Fetching prayer times for date:', today);

    // Debug: Check what dates exist in the database
    const { data: allDates, error: datesError } = await supabase
      .from('prayer_times')
      .select('date')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (datesError) {
      console.error('[PrayerService] Error fetching all dates:', datesError);
    } else {
      console.log(
        '[PrayerService] All dates in DB:',
        allDates?.map(d => d.date)
      );
      console.log('[PrayerService] Total days in DB:', allDates?.length || 0);
    }

    const { data, error } = await supabase
      .from('prayer_times')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();

    if (error) {
      throw error;
    }

    console.log('[PrayerService] Prayer times for today:', data);
    return data;
  } catch (error) {
    console.error('[PrayerService] Error fetching today prayer times:', error);
    return null;
  }
}

/**
 * Get prayer times for a specific date
 */
export async function getPrayerTimesForDate(date: string): Promise<PrayerTimeRow | null> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('No user logged in');
    }

    const { data, error } = await supabase
      .from('prayer_times')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching prayer times for date:', error);
    return null;
  }
}

/**
 * Get prayer times for a date range
 */
export async function getPrayerTimesRange(
  startDate: string,
  endDate: string
): Promise<PrayerTimeRow[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('No user logged in');
    }

    const { data, error } = await supabase
      .from('prayer_times')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching prayer times range:', error);
    return [];
  }
}

/**
 * Get the active timetable metadata for the current user
 */
export async function getActiveTimetable(): Promise<TimetableInfo | null> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('No user logged in');
    }

    const { data, error } = await supabase
      .from('prayer_timetables')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      year: data.year,
      mosqueName: data.mosque_name,
      timezone: data.timezone,
      syncedAt: data.synced_at,
      isActive: data.is_active,
      city: data.city,
      country: data.country,
      calculationMethod: data.calculation_method,
    };
  } catch (error) {
    console.error('Error fetching active timetable:', error);
    return null;
  }
}

/**
 * Check if the user needs to sync (no active timetable or no prayer times)
 */
export async function needsSync(): Promise<boolean> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return true;
    }

    const timetable = await getActiveTimetable();
    if (!timetable) {
      return true;
    }

    // Check if we have prayer times for today
    const today = await getTodayPrayerTimes();
    return !today;
  } catch (error) {
    console.error('Error checking sync status:', error);
    return true;
  }
}

/**
 * Trigger prayer calendar sync via Edge Function
 * Uses Aladhan API to fetch prayer times for the specified city
 */
export async function syncPrayerCalendar(
  city: string,
  country: string,
  method: number = 3
): Promise<SyncResult> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return {
        success: false,
        message: 'Please sign in to sync',
        error: 'No active session',
      };
    }

    // Validate inputs
    if (!city || !country) {
      return {
        success: false,
        message: 'Please select a city first',
        error: 'City and country are required',
      };
    }

    // Create AbortController with 30-second timeout (API calls are faster than PDF)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    console.log(`[PrayerService] Starting sync for ${city}, ${country}...`);

    try {
      const response = await fetch(`${ENV.SUPABASE_URL}/functions/v1/sync-prayer-calendar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ city, country, method }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('[PrayerService] Sync response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          message: errorData.message || 'Sync failed',
          error: errorData.error || `HTTP ${response.status}`,
        };
      }

      const result = await response.json();
      console.log('[PrayerService] Sync result:', result);

      // Save settings on successful sync
      if (result.success) {
        await savePrayerSettings({ city, country, calculationMethod: method });
      }

      return result as SyncResult;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return {
          success: false,
          message: 'Sync timed out. Please try again.',
          error: 'Request timeout',
        };
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Error syncing prayer calendar:', error);
    return {
      success: false,
      message: 'Network error occurred',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get saved prayer settings from local storage
 */
export async function getPrayerSettings(): Promise<UserPrayerSettings | null> {
  try {
    const settings = await AsyncStorage.getItem(PRAYER_SETTINGS_KEY);
    if (settings) {
      return JSON.parse(settings);
    }
    return null;
  } catch (error) {
    console.error('Error getting prayer settings:', error);
    return null;
  }
}

/**
 * Save prayer settings to local storage
 */
export async function savePrayerSettings(settings: UserPrayerSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(PRAYER_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving prayer settings:', error);
  }
}

/**
 * Get the count of prayer days available
 */
export async function getPrayerDaysCount(): Promise<number> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return 0;
    }

    const { count, error } = await supabase
      .from('prayer_times')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return count || 0;
  } catch (error) {
    console.error('Error getting prayer days count:', error);
    return 0;
  }
}

/**
 * Delete all prayer data for the current user
 * Used when user wants to reset their prayer calendar
 */
export async function deletePrayerData(): Promise<boolean> {
  try {
    const userId = await getCurrentUserId();
    console.log('[PrayerService] Deleting prayer data for user:', userId);
    if (!userId) {
      throw new Error('No user logged in');
    }

    // Delete all timetables (cascade will delete prayer_times)
    const { error, count } = await supabase
      .from('prayer_timetables')
      .delete()
      .eq('user_id', userId)
      .select();

    console.log('[PrayerService] Delete result - error:', error, 'count:', count);

    if (error) {
      throw error;
    }

    console.log('[PrayerService] Prayer data deleted successfully');
    return true;
  } catch (error) {
    console.error('[PrayerService] Error deleting prayer data:', error);
    return false;
  }
}

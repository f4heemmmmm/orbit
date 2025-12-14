/**
 * Storage Service
 * Handles persistent storage operations using AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  THEME_MODE: '@orbit/theme_mode',
} as const;

/**
 * Get theme mode from storage
 */
export async function getThemeMode(): Promise<'light' | 'dark' | null> {
  try {
    const mode = await AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE);
    return mode as 'light' | 'dark' | null;
  } catch (error) {
    console.error('Error getting theme mode:', error);
    return null;
  }
}

/**
 * Set theme mode in storage
 */
export async function setThemeMode(mode: 'light' | 'dark'): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
  } catch (error) {
    console.error('Error setting theme mode:', error);
  }
}

/**
 * Clear all app storage (used when deleting account)
 */
export async function clearAllStorage(): Promise<void> {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
}

/**
 * Storage Service
 * Handles persistent storage operations using AsyncStorage
 * and file uploads to Supabase Storage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { readAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

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

// ============================================
// SUPABASE STORAGE (File Uploads)
// ============================================

const RECEIPTS_BUCKET = 'receipts';

/**
 * Get the current user ID
 */
async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id || null;
}

/**
 * Generate a unique filename for the receipt image
 */
function generateReceiptFilename(userId: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${userId}/${timestamp}-${randomStr}.jpg`;
}

/**
 * Upload a receipt image to Supabase Storage
 * @param imageUri - Local URI of the image to upload
 * @returns Public URL of the uploaded image, or null if failed
 */
export async function uploadReceiptImage(imageUri: string): Promise<string | null> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.error('Cannot upload image: No user logged in');
      return null;
    }

    // Read image as base64
    const base64 = await readAsStringAsync(imageUri, {
      encoding: EncodingType.Base64,
    });

    // Convert base64 to ArrayBuffer
    const arrayBuffer = decode(base64);

    // Generate unique filename
    const filename = generateReceiptFilename(userId);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(RECEIPTS_BUCKET)
      .upload(filename, arrayBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading receipt image:', error);
      return null;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(RECEIPTS_BUCKET).getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading receipt image:', error);
    return null;
  }
}

/**
 * Delete a receipt image from Supabase Storage
 * @param imageUrl - Public URL of the image to delete
 * @returns True if deleted successfully, false otherwise
 */
export async function deleteReceiptImage(imageUrl: string): Promise<boolean> {
  try {
    // Extract path from URL
    const urlParts = imageUrl.split(`/${RECEIPTS_BUCKET}/`);
    if (urlParts.length < 2) {
      console.error('Invalid receipt image URL');
      return false;
    }

    const path = urlParts[1];

    const { error } = await supabase.storage.from(RECEIPTS_BUCKET).remove([path]);

    if (error) {
      console.error('Error deleting receipt image:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting receipt image:', error);
    return false;
  }
}

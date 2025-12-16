import type { LucideIcon } from 'lucide-react-native';

// Category type matching database schema
export type TransactionCategory =
  | 'Food'
  | 'Transport'
  | 'Bills'
  | 'Salary'
  | 'Shopping'
  | 'Entertainment'
  | 'Health'
  | 'Other';

// Transaction Types
export interface Transaction {
  id: string;
  title: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: TransactionCategory;
  date: string;
}

export interface TransactionData {
  title: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: TransactionCategory;
  date: Date;
}

export interface Category {
  id: TransactionCategory;
  name: string;
  icon: LucideIcon;
  color: string;
}

// Task Types
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}

export interface Priority {
  id: 'low' | 'medium' | 'high';
  label: string;
  color: string;
}

export type TaskFilterType = 'pending' | 'completed';

// Schedule Types
export interface ScheduleEvent {
  id: string;
  title: string;
  type: 'activity' | 'exam' | 'class' | 'other';
  date: string;
  time: string;
  description: string;
}

export interface EventType {
  id: 'activity' | 'exam' | 'class' | 'other';
  label: string;
  icon: LucideIcon;
  color: string;
}

export type ScheduleFilterType = 'all' | 'activity' | 'exam' | 'class' | 'other';

// Prayer Types
export type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface PrayerTime {
  id: string;
  date: string;
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface Prayer {
  name: PrayerName;
  displayName: string;
  time: string;
  hasPassed: boolean;
  isNext: boolean;
}

export interface TimetableInfo {
  id: string;
  year: number;
  mosqueName: string | null;
  timezone: string;
  syncedAt: string;
  isActive: boolean;
  city: string | null;
  country: string | null;
  calculationMethod: number | null;
}

export interface SyncResult {
  success: boolean;
  message: string;
  skipped?: boolean;
  daysImported?: number;
  error?: string;
  city?: string;
  country?: string;
  timezone?: string;
}

export interface UserPrayerSettings {
  city: string;
  country: string;
  calculationMethod: number;
}

export interface CalculationMethod {
  id: number;
  name: string;
  region: string;
}

export const CALCULATION_METHODS: CalculationMethod[] = [
  { id: 1, name: 'University of Islamic Sciences, Karachi', region: 'Pakistan' },
  { id: 2, name: 'Islamic Society of North America (ISNA)', region: 'North America' },
  { id: 3, name: 'Muslim World League (MWL)', region: 'International' },
  { id: 4, name: 'Umm Al-Qura University, Makkah', region: 'Saudi Arabia' },
  { id: 5, name: 'Egyptian General Authority of Survey', region: 'Egypt' },
  { id: 7, name: 'Institute of Geophysics, University of Tehran', region: 'Iran' },
  { id: 8, name: 'Gulf Region', region: 'UAE, Qatar' },
  { id: 9, name: 'Kuwait', region: 'Kuwait' },
  { id: 10, name: 'Qatar', region: 'Qatar' },
  { id: 11, name: 'MUIS (Singapore)', region: 'Singapore' },
  { id: 12, name: 'UOIF (France)', region: 'France' },
  { id: 13, name: 'DIYANET (Turkey)', region: 'Turkey' },
  { id: 14, name: 'Spiritual Administration of Muslims of Russia', region: 'Russia' },
  { id: 15, name: 'Moonsighting Committee Worldwide', region: 'Worldwide' },
];

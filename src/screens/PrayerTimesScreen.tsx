import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Moon, Sun, Sunrise, Sunset, CloudSun, Check, Clock, Settings } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeColors } from '../constants/theme';
import { getTodayPrayerTimes, getActiveTimetable } from '../services/prayerService';
import type { Prayer, PrayerName, TimetableInfo } from '../types';
import type { Database } from '../types/database';

type PrayerTimeRow = Database['public']['Tables']['prayer_times']['Row'];

type TabParamList = {
  Financials: undefined;
  Tasks: undefined;
  Groceries: undefined;
  Schedule: undefined;
  PrayerTimes: undefined;
  Settings: undefined;
};

const PRAYER_CONFIG: Record<PrayerName, { displayName: string; icon: typeof Moon }> = {
  fajr: { displayName: 'Fajr', icon: Sunrise },
  dhuhr: { displayName: 'Dhuhr', icon: Sun },
  asr: { displayName: 'Asr', icon: CloudSun },
  maghrib: { displayName: 'Maghrib', icon: Sunset },
  isha: { displayName: 'Isha', icon: Moon },
};

const PRAYER_ORDER: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

/**
 * Convert time string (HH:mm) to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Get current time in minutes since midnight
 */
function getCurrentMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/**
 * Format time for display (convert 24h to 12h format)
 */
function formatTimeForDisplay(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Calculate time remaining until a prayer
 */
function getTimeUntil(targetTime: string): string {
  const now = getCurrentMinutes();
  const target = timeToMinutes(targetTime);

  let diff = target - now;
  if (diff < 0) {
    diff += 24 * 60; // Next day
  }

  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }
  return `${hours}h ${minutes}m`;
}

export default function PrayerTimesScreen(): React.JSX.Element {
  const { themeMode } = useTheme();
  const COLORS = getThemeColors(themeMode);
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();

  const [todayPrayers, setTodayPrayers] = useState<PrayerTimeRow | null>(null);
  const [timetableInfo, setTimetableInfo] = useState<TimetableInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentMinutes, setCurrentMinutes] = useState(getCurrentMinutes());

  const loadData = useCallback(async () => {
    try {
      const [prayers, timetable] = await Promise.all([getTodayPrayerTimes(), getActiveTimetable()]);
      setTodayPrayers(prayers);
      setTimetableInfo(timetable);
    } catch (error) {
      console.error('Error loading prayer data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMinutes(getCurrentMinutes());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Build prayer list with status information
   */
  const buildPrayerList = (): Prayer[] => {
    if (!todayPrayers) {
      return [];
    }

    const prayers: Prayer[] = [];
    let nextPrayerFound = false;

    for (const prayerName of PRAYER_ORDER) {
      const time = todayPrayers[prayerName];
      const prayerMinutes = timeToMinutes(time);
      const hasPassed = currentMinutes > prayerMinutes;
      const isNext = !hasPassed && !nextPrayerFound;

      if (isNext) {
        nextPrayerFound = true;
      }

      prayers.push({
        name: prayerName,
        displayName: PRAYER_CONFIG[prayerName].displayName,
        time,
        hasPassed,
        isNext,
      });
    }

    // If all prayers have passed, the next prayer is Fajr (tomorrow)
    if (!nextPrayerFound && prayers.length > 0) {
      prayers[0] = { ...prayers[0], isNext: true, hasPassed: false };
    }

    return prayers;
  };

  const prayers = todayPrayers ? buildPrayerList() : [];
  const nextPrayer = prayers.find(p => p.isNext);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: COLORS.background }}
      >
        <ActivityIndicator size="large" color={COLORS.pastel.purple} />
        <Text style={{ color: COLORS.text.muted }} className="text-base mt-3">
          Loading prayer times...
        </Text>
      </View>
    );
  }

  // Empty state - no prayer data
  if (!todayPrayers) {
    return (
      <View
        className="flex-1 items-center justify-center p-6"
        style={{ backgroundColor: COLORS.background }}
      >
        <Moon size={64} color={COLORS.text.muted} />
        <Text style={{ color: COLORS.text.primary }} className="text-xl font-bold mt-4 text-center">
          No Prayer Times Available
        </Text>
        <Text style={{ color: COLORS.text.muted }} className="text-base mt-2 text-center">
          Sync your prayer calendar from Settings to see today&apos;s prayer times.
        </Text>
        <TouchableOpacity
          className="mt-6 px-6 py-3 rounded-xl flex-row items-center"
          style={{ backgroundColor: COLORS.pastel.purple }}
          onPress={() => navigation.navigate('Settings')}
        >
          <Settings size={20} color={COLORS.background} />
          <Text style={{ color: COLORS.background }} className="text-base font-semibold ml-2">
            Go to Settings
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: COLORS.background }}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.pastel.purple}
          colors={[COLORS.pastel.purple]}
        />
      }
    >
      {/* Today's Date Header */}
      <View className="mb-4">
        <Text style={{ color: COLORS.text.primary }} className="text-2xl font-bold">
          {formatDate(new Date())}
        </Text>
        {timetableInfo?.city && timetableInfo?.country && (
          <Text style={{ color: COLORS.text.muted }} className="text-sm mt-1">
            {timetableInfo.city}, {timetableInfo.country}
          </Text>
        )}
      </View>

      {/* Next Prayer Card */}
      {nextPrayer && (
        <View className="rounded-2xl p-5 mb-4" style={{ backgroundColor: COLORS.pastel.purple }}>
          <View className="flex-row items-center justify-between">
            <View>
              <Text style={{ color: COLORS.background }} className="text-sm font-medium opacity-80">
                Next Prayer
              </Text>
              <Text style={{ color: COLORS.background }} className="text-3xl font-bold mt-1">
                {nextPrayer.displayName}
              </Text>
              <Text style={{ color: COLORS.background }} className="text-xl mt-1">
                {formatTimeForDisplay(nextPrayer.time)}
              </Text>
            </View>
            <View className="items-end">
              <Clock size={24} color={COLORS.background} />
              <Text style={{ color: COLORS.background }} className="text-lg font-semibold mt-2">
                {getTimeUntil(nextPrayer.time)}
              </Text>
              <Text style={{ color: COLORS.background }} className="text-xs opacity-80">
                remaining
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* All Prayers List */}
      <Text style={{ color: COLORS.text.secondary }} className="text-sm font-semibold mb-3">
        TODAY&apos;S PRAYERS
      </Text>

      <View className="rounded-2xl overflow-hidden" style={{ backgroundColor: COLORS.card }}>
        {prayers.map((prayer, index) => {
          const IconComponent = PRAYER_CONFIG[prayer.name].icon;
          const isLast = index === prayers.length - 1;

          return (
            <View
              key={prayer.name}
              className={`flex-row items-center p-4 ${!isLast ? 'border-b' : ''}`}
              style={{
                borderBottomColor: COLORS.surface,
                opacity: prayer.hasPassed && !prayer.isNext ? 0.5 : 1,
              }}
            >
              {/* Icon */}
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{
                  backgroundColor: prayer.isNext ? COLORS.pastel.purple : COLORS.surface,
                }}
              >
                <IconComponent
                  size={20}
                  color={prayer.isNext ? COLORS.background : COLORS.text.secondary}
                />
              </View>

              {/* Prayer Name */}
              <View className="flex-1 ml-3">
                <Text
                  style={{
                    color: prayer.isNext ? COLORS.pastel.purple : COLORS.text.primary,
                  }}
                  className="text-base font-semibold"
                >
                  {prayer.displayName}
                </Text>
                {prayer.isNext && (
                  <Text style={{ color: COLORS.text.muted }} className="text-xs">
                    Up next
                  </Text>
                )}
              </View>

              {/* Time */}
              <Text
                style={{
                  color: prayer.isNext ? COLORS.pastel.purple : COLORS.text.primary,
                }}
                className="text-base font-medium"
              >
                {formatTimeForDisplay(prayer.time)}
              </Text>

              {/* Status Icon */}
              {prayer.hasPassed && !prayer.isNext && (
                <View className="ml-2">
                  <Check size={18} color={COLORS.pastel.green} />
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Timetable Info */}
      {timetableInfo && (
        <View className="mt-4 p-3 rounded-xl" style={{ backgroundColor: COLORS.surface }}>
          <Text style={{ color: COLORS.text.muted }} className="text-xs text-center">
            Last synced:{' '}
            {new Date(timetableInfo.syncedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
            {' • '}
            {timetableInfo.timezone}
          </Text>
        </View>
      )}

      {/* Bottom padding */}
      <View className="h-4" />
    </ScrollView>
  );
}

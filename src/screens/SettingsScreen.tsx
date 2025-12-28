import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  LogOut,
  Trash2,
  Moon,
  Sun,
  User,
  RefreshCw,
  MapPin,
  Calculator,
  ChevronRight,
} from 'lucide-react-native';
import ScreenLayout from '../components/ScreenLayout';
import { signOut, deleteAccount, getCurrentUser } from '../services/authService';
import {
  syncPrayerCalendar,
  getActiveTimetable,
  deletePrayerData,
  getPrayerSettings,
} from '../services/prayerService';
import { CALCULATION_METHODS, type TimetableInfo, type UserPrayerSettings } from '../types';
import { clearAllStorage } from '../services/storageService';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeColors } from '../constants/theme';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

interface SettingsScreenProps {
  onSignOut: () => void;
}

export default function SettingsScreen({ onSignOut }: SettingsScreenProps): React.JSX.Element {
  const { themeMode, toggleTheme } = useTheme();
  const COLORS = getThemeColors(themeMode);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [timetableInfo, setTimetableInfo] = useState<TimetableInfo | null>(null);
  const [prayerSettings, setPrayerSettings] = useState<UserPrayerSettings | null>(null);

  // Load user and timetable info on mount
  React.useEffect(() => {
    loadUserInfo();
    loadTimetableInfo();
    loadPrayerSettings();
  }, []);

  const loadPrayerSettings = async (): Promise<void> => {
    try {
      const settings = await getPrayerSettings();
      setPrayerSettings(settings);
    } catch (error) {
      console.error('Error loading prayer settings:', error);
    }
  };

  const loadUserInfo = async (): Promise<void> => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setUserEmail(user.email);
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const loadTimetableInfo = async (): Promise<void> => {
    try {
      const info = await getActiveTimetable();
      setTimetableInfo(info);
    } catch (error) {
      console.error('Error loading timetable info:', error);
    }
  };

  const handleSyncPrayerCalendar = async (): Promise<void> => {
    if (syncing) {
      return;
    }

    // Check if city is selected
    if (!prayerSettings?.city || !prayerSettings?.country) {
      Alert.alert('Select Location', 'Please select a city first before syncing prayer times.', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Select City',
          onPress: () => navigation.navigate('CitySearch' as never),
        },
      ]);
      return;
    }

    try {
      setSyncing(true);

      // Delete old prayer data first
      console.log('[Settings] Step 1: Deleting old prayer data...');
      await deletePrayerData();

      console.log('[Settings] Step 2: Calling sync...');
      const result = await syncPrayerCalendar(
        prayerSettings.city,
        prayerSettings.country,
        prayerSettings.calculationMethod || 3
      );
      console.log('[Settings] Sync result:', result);

      if (result.success) {
        Alert.alert(
          'Sync Complete',
          `Successfully imported ${result.daysImported} days of prayer times for ${prayerSettings.city}, ${prayerSettings.country}.`
        );
        await loadTimetableInfo();
      } else {
        Alert.alert('Sync Failed', result.message || 'Please try again later.');
      }
    } catch (error) {
      console.error('Error syncing prayer calendar:', error);
      Alert.alert('Error', 'An unexpected error occurred while syncing.');
    } finally {
      setSyncing(false);
    }
  };

  const handleCitySelect = useCallback(async () => {
    // Navigate to city search and reload settings when returning
    navigation.navigate('CitySearch', {
      onSelect: () => loadPrayerSettings(),
    });
  }, [navigation]);

  const handleMethodSelect = useCallback(async () => {
    navigation.navigate('CalculationMethod', {
      onSelect: () => loadPrayerSettings(),
    });
  }, [navigation]);

  const getMethodName = (methodId: number | null | undefined): string => {
    if (!methodId) {
      return 'MWL (Default)';
    }
    const method = CALCULATION_METHODS.find(m => m.id === methodId);
    return method?.name || 'Unknown';
  };

  const getLocationDisplay = (): string => {
    if (prayerSettings?.city && prayerSettings?.country) {
      return `${prayerSettings.city}, ${prayerSettings.country}`;
    }
    return 'Not selected';
  };

  const formatLastSyncDate = (): string => {
    if (!timetableInfo) {
      return 'Never synced';
    }
    const date = new Date(timetableInfo.syncedAt);
    return `Last synced: ${date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })}`;
  };

  const handleSignOut = (): void => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            await signOut();
            onSignOut();
          } catch (error) {
            console.error('Sign out error:', error);
            Alert.alert('Error', 'Failed to sign out. Please try again.');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = (): void => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data including:\n\n• Tasks\n• Groceries\n• Schedule events\n• Financial transactions\n• Profile information',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Second confirmation
            Alert.alert(
              'Final Confirmation',
              'This is your last chance. Are you absolutely sure you want to delete your account and all data?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete Forever',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      setLoading(true);
                      const { error } = await deleteAccount();
                      if (error) {
                        Alert.alert('Error', 'Failed to delete account. Please try again.');
                        return;
                      }
                      // Clear all local storage
                      await clearAllStorage();
                      onSignOut();
                    } catch (error) {
                      console.error('Delete account error:', error);
                      Alert.alert('Error', 'Failed to delete account. Please try again.');
                    } finally {
                      setLoading(false);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <ScreenLayout safeAreaEdges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* User Info Section */}
        <View className="p-4">
          <View className="rounded-2xl p-5 items-center" style={{ backgroundColor: COLORS.card }}>
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-3"
              style={{ backgroundColor: COLORS.surface }}
            >
              <User size={40} color={COLORS.pastel.blue} />
            </View>
            <Text style={{ color: COLORS.text.primary }} className="text-lg font-semibold">
              Account
            </Text>
            {userEmail ? (
              <Text style={{ color: COLORS.text.secondary }} className="text-sm mt-1">
                {userEmail}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Appearance Section */}
        <View className="px-4 pb-4">
          <Text
            style={{ color: COLORS.text.secondary }}
            className="text-xs font-semibold mb-2 px-2"
          >
            APPEARANCE
          </Text>
          <View className="rounded-2xl overflow-hidden" style={{ backgroundColor: COLORS.card }}>
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center flex-1">
                {/* Fixed-width icon container to prevent layout shift */}
                <View className="w-6 items-center">
                  {themeMode === 'dark' ? (
                    <Moon size={22} color={COLORS.pastel.purple} />
                  ) : (
                    <Sun size={22} color={COLORS.pastel.orange} />
                  )}
                </View>
                <View className="ml-3 flex-1">
                  <Text style={{ color: COLORS.text.primary }} className="text-base font-medium">
                    Dark Mode
                  </Text>
                  <Text style={{ color: COLORS.text.secondary }} className="text-xs mt-0.5">
                    {themeMode === 'dark' ? 'Enabled' : 'Disabled'}
                  </Text>
                </View>
              </View>
              <Switch
                value={themeMode === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{
                  false: themeMode === 'light' ? '#E5E5EA' : COLORS.surface,
                  true: COLORS.pastel.purple,
                }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={themeMode === 'light' ? '#E5E5EA' : COLORS.surface}
              />
            </View>
          </View>
        </View>

        {/* Prayer Settings Section */}
        <View className="px-4 pb-4">
          <Text
            style={{ color: COLORS.text.secondary }}
            className="text-xs font-semibold mb-2 px-2"
          >
            PRAYER SETTINGS
          </Text>
          <View className="rounded-2xl overflow-hidden" style={{ backgroundColor: COLORS.card }}>
            {/* Location Selector */}
            <TouchableOpacity
              className="flex-row items-center p-4 border-b"
              style={{ borderBottomColor: COLORS.surface }}
              onPress={handleCitySelect}
              activeOpacity={0.7}
            >
              <View className="w-6 items-center">
                <MapPin size={22} color={COLORS.pastel.blue} />
              </View>
              <View className="ml-3 flex-1">
                <Text style={{ color: COLORS.text.primary }} className="text-base font-medium">
                  Location
                </Text>
                <Text style={{ color: COLORS.text.secondary }} className="text-xs mt-0.5">
                  {getLocationDisplay()}
                </Text>
              </View>
              <ChevronRight size={20} color={COLORS.text.muted} />
            </TouchableOpacity>

            {/* Calculation Method Selector */}
            <TouchableOpacity
              className="flex-row items-center p-4 border-b"
              style={{ borderBottomColor: COLORS.surface }}
              onPress={handleMethodSelect}
              activeOpacity={0.7}
            >
              <View className="w-6 items-center">
                <Calculator size={22} color={COLORS.pastel.purple} />
              </View>
              <View className="ml-3 flex-1">
                <Text style={{ color: COLORS.text.primary }} className="text-base font-medium">
                  Calculation Method
                </Text>
                <Text
                  style={{ color: COLORS.text.secondary }}
                  className="text-xs mt-0.5"
                  numberOfLines={1}
                >
                  {getMethodName(prayerSettings?.calculationMethod)}
                </Text>
              </View>
              <ChevronRight size={20} color={COLORS.text.muted} />
            </TouchableOpacity>

            {/* Sync Button */}
            <TouchableOpacity
              className="flex-row items-center p-4"
              onPress={handleSyncPrayerCalendar}
              disabled={syncing || loading}
              activeOpacity={0.7}
            >
              <View className="w-6 items-center">
                {syncing ? (
                  <ActivityIndicator size="small" color={COLORS.pastel.teal} />
                ) : (
                  <RefreshCw size={22} color={COLORS.pastel.teal} />
                )}
              </View>
              <View className="ml-3 flex-1">
                <Text style={{ color: COLORS.text.primary }} className="text-base font-medium">
                  {syncing ? 'Syncing...' : 'Sync Prayer Calendar'}
                </Text>
                <Text style={{ color: COLORS.text.secondary }} className="text-xs mt-0.5">
                  {formatLastSyncDate()}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Actions Section */}
        <View className="px-4 pb-4">
          <Text
            style={{ color: COLORS.text.secondary }}
            className="text-xs font-semibold mb-2 px-2"
          >
            ACCOUNT ACTIONS
          </Text>
          <View className="rounded-2xl overflow-hidden" style={{ backgroundColor: COLORS.card }}>
            {/* Sign Out Button */}
            <TouchableOpacity
              className="flex-row items-center p-4 border-b"
              style={{ borderBottomColor: COLORS.surface }}
              onPress={handleSignOut}
              disabled={loading}
              activeOpacity={0.7}
            >
              <View className="w-6 items-center">
                <LogOut size={22} color={COLORS.pastel.orange} />
              </View>
              <View className="ml-3 flex-1">
                <Text style={{ color: COLORS.text.primary }} className="text-base font-medium">
                  Sign Out
                </Text>
                <Text style={{ color: COLORS.text.secondary }} className="text-xs mt-0.5">
                  Sign out of your account
                </Text>
              </View>
            </TouchableOpacity>

            {/* Delete Account Button */}
            <TouchableOpacity
              className="flex-row items-center p-4"
              onPress={handleDeleteAccount}
              disabled={loading}
              activeOpacity={0.7}
            >
              <View className="w-6 items-center">
                <Trash2 size={22} color={COLORS.pastel.red} />
              </View>
              <View className="ml-3 flex-1">
                <Text style={{ color: COLORS.pastel.red }} className="text-base font-medium">
                  Delete Account
                </Text>
                <Text style={{ color: COLORS.text.secondary }} className="text-xs mt-0.5">
                  Permanently delete your account and all data
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info Section */}
        <View className="px-4 pb-8">
          <Text
            style={{ color: COLORS.text.secondary }}
            className="text-xs font-semibold mb-2 px-2"
          >
            ABOUT
          </Text>
          <View className="rounded-2xl p-4" style={{ backgroundColor: COLORS.card }}>
            <Text style={{ color: COLORS.text.secondary }} className="text-xs text-center">
              Orbit v1.0.0
            </Text>
            <Text style={{ color: COLORS.text.muted }} className="text-xs text-center mt-1">
              Your personal productivity companion
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      {loading && (
        <View
          className="absolute inset-0 items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <View className="rounded-2xl p-6" style={{ backgroundColor: COLORS.card }}>
            <ActivityIndicator size="large" color={COLORS.pastel.blue} />
            <Text style={{ color: COLORS.text.primary }} className="text-base mt-3">
              Processing...
            </Text>
          </View>
        </View>
      )}
    </ScreenLayout>
  );
}

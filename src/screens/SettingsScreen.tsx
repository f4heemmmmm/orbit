import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Switch,
  SafeAreaView,
} from 'react-native';
import { LogOut, Trash2, Moon, Sun, User } from 'lucide-react-native';
import { signOut, deleteAccount, getCurrentUser } from '../services/authService';
import { clearAllStorage } from '../services/storageService';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeColors } from '../constants/theme';

interface SettingsScreenProps {
  onSignOut: () => void;
}

export default function SettingsScreen({ onSignOut }: SettingsScreenProps): React.JSX.Element {
  const { themeMode, toggleTheme } = useTheme();
  const COLORS = getThemeColors(themeMode);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');

  // Load user email on mount
  React.useEffect(() => {
    loadUserInfo();
  }, []);

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
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.background }}>
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
                {themeMode === 'dark' ? (
                  <Moon size={22} color={COLORS.pastel.purple} />
                ) : (
                  <Sun size={22} color={COLORS.pastel.orange} />
                )}
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
                trackColor={{ false: COLORS.surface, true: COLORS.pastel.purple }}
                thumbColor={themeMode === 'dark' ? COLORS.pastel.blue : COLORS.text.muted}
                ios_backgroundColor={COLORS.surface}
              />
            </View>
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
              <LogOut size={22} color={COLORS.pastel.orange} />
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
              <Trash2 size={22} color={COLORS.pastel.red} />
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
    </SafeAreaView>
  );
}

/**
 * Calculation Method Screen
 * Allows users to select their preferred prayer time calculation method
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, Check } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeColors } from '../constants/theme';
import { savePrayerSettings, getPrayerSettings } from '../services/prayerService';
import { CALCULATION_METHODS } from '../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RouteParams = {
  onSelect?: (method: number) => void;
};

export default function CalculationMethodScreen(): React.JSX.Element {
  const { themeMode } = useTheme();
  const colors = getThemeColors(themeMode);
  const navigation = useNavigation<NativeStackNavigationProp<never>>();
  const route = useRoute();
  const params = route.params as RouteParams | undefined;

  const [selectedMethod, setSelectedMethod] = useState<number>(3); // Default: MWL

  useEffect(() => {
    loadCurrentMethod();
  }, []);

  const loadCurrentMethod = async (): Promise<void> => {
    const settings = await getPrayerSettings();
    if (settings?.calculationMethod) {
      setSelectedMethod(settings.calculationMethod);
    }
  };

  const handleSelectMethod = useCallback(
    async (methodId: number) => {
      setSelectedMethod(methodId);

      // Save to settings
      const currentSettings = await getPrayerSettings();
      await savePrayerSettings({
        city: currentSettings?.city || '',
        country: currentSettings?.country || '',
        calculationMethod: methodId,
      });

      // Call callback if provided
      if (params?.onSelect) {
        params.onSelect(methodId);
      }

      navigation.goBack();
    },
    [params, navigation]
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.surface,
    },
    backButton: {
      marginRight: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text.primary,
    },
    description: {
      fontSize: 14,
      color: colors.text.muted,
      padding: 16,
      lineHeight: 20,
    },
    methodItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.surface,
    },
    methodInfo: {
      flex: 1,
    },
    methodName: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text.primary,
    },
    methodRegion: {
      fontSize: 14,
      color: colors.text.muted,
      marginTop: 2,
    },
    checkIcon: {
      marginLeft: 12,
    },
    selectedItem: {
      backgroundColor: colors.pastel.purple + '20',
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Calculation Method</Text>
      </View>

      {/* Description */}
      <Text style={styles.description}>
        Different Islamic organizations use slightly different methods to calculate prayer times.
        Choose the method most commonly used in your region or preferred organization.
      </Text>

      {/* Method List */}
      <FlatList
        data={CALCULATION_METHODS}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.methodItem, selectedMethod === item.id && styles.selectedItem]}
            onPress={() => handleSelectMethod(item.id)}
          >
            <View style={styles.methodInfo}>
              <Text style={styles.methodName}>{item.name}</Text>
              <Text style={styles.methodRegion}>{item.region}</Text>
            </View>
            {selectedMethod === item.id && (
              <Check size={20} color={colors.pastel.purple} style={styles.checkIcon} />
            )}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

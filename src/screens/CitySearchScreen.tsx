/**
 * City Search Screen
 * Allows users to search and select a city for prayer times
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Search, MapPin, X, ChevronLeft } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeColors } from '../constants/theme';
import { savePrayerSettings, getPrayerSettings } from '../services/prayerService';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Popular cities for quick selection
const POPULAR_CITIES = [
  { city: 'Singapore', country: 'Singapore' },
  { city: 'Kuala Lumpur', country: 'Malaysia' },
  { city: 'Jakarta', country: 'Indonesia' },
  { city: 'Dubai', country: 'UAE' },
  { city: 'Mecca', country: 'Saudi Arabia' },
  { city: 'London', country: 'UK' },
  { city: 'New York', country: 'USA' },
  { city: 'Toronto', country: 'Canada' },
  { city: 'Victoria', country: 'Canada' },
  { city: 'Sydney', country: 'Australia' },
  { city: 'Istanbul', country: 'Turkey' },
  { city: 'Cairo', country: 'Egypt' },
];

type RouteParams = {
  onSelect?: (city: string, country: string) => void;
};

export default function CitySearchScreen(): React.JSX.Element {
  const { themeMode } = useTheme();
  const colors = getThemeColors(themeMode);
  const navigation = useNavigation<NativeStackNavigationProp<never>>();
  const route = useRoute();
  const params = route.params as RouteParams | undefined;

  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);

  // Validate city exists via Aladhan API
  const validateCity = useCallback(async (city: string, country: string): Promise<boolean> => {
    try {
      const today = new Date();
      const dateStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
      const url = `https://api.aladhan.com/v1/timingsByCity/${dateStr}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=3`;

      const response = await fetch(url);
      const data = await response.json();

      return data.code === 200;
    } catch {
      return false;
    }
  }, []);

  // Filter popular cities based on search
  const filteredCities = searchQuery.trim()
    ? POPULAR_CITIES.filter(
        c =>
          c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.country.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : POPULAR_CITIES;

  // Handle city selection
  const handleSelectCity = useCallback(
    async (city: string, country: string) => {
      setValidating(true);

      // Validate the city exists
      const isValid = await validateCity(city, country);

      if (!isValid) {
        setValidating(false);
        Alert.alert(
          'City Not Found',
          `Could not find prayer times for "${city}, ${country}". Please try a different spelling or nearby major city.`
        );
        return;
      }

      // Get current settings and update city
      const currentSettings = await getPrayerSettings();
      await savePrayerSettings({
        city,
        country,
        calculationMethod: currentSettings?.calculationMethod || 3,
      });

      setValidating(false);

      // Call callback if provided
      if (params?.onSelect) {
        params.onSelect(city, country);
      }

      navigation.goBack();
    },
    [validateCity, params, navigation]
  );

  // Handle custom city search
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      return;
    }

    // Check if it looks like "city, country" format
    const parts = searchQuery.split(',').map(s => s.trim());

    if (parts.length >= 2) {
      // User entered city, country format
      await handleSelectCity(parts[0], parts[1]);
    } else {
      // Try as city name with common countries
      setLoading(true);
      const searchTerm = searchQuery.trim();

      // Try validating with common country names
      const countriesToTry = [
        'USA',
        'Canada',
        'UK',
        'Australia',
        'Malaysia',
        'Indonesia',
        'Singapore',
        'UAE',
        'Saudi Arabia',
        'India',
        'Pakistan',
      ];

      for (const country of countriesToTry) {
        const isValid = await validateCity(searchTerm, country);
        if (isValid) {
          setLoading(false);
          await handleSelectCity(searchTerm, country);
          return;
        }
      }

      setLoading(false);
      Alert.alert(
        'City Not Found',
        `Could not find "${searchTerm}". Try entering as "City, Country" format (e.g., "Victoria, Canada").`
      );
    }
  }, [searchQuery, handleSelectCity, validateCity]);

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
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      margin: 16,
      paddingHorizontal: 12,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.surface,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text.primary,
    },
    clearButton: {
      padding: 4,
    },
    searchButton: {
      backgroundColor: colors.pastel.blue,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      marginLeft: 8,
    },
    searchButtonText: {
      color: colors.background,
      fontWeight: '600',
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.muted,
      paddingHorizontal: 16,
      paddingVertical: 8,
      textTransform: 'uppercase',
    },
    cityItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.surface,
    },
    cityIcon: {
      marginRight: 12,
    },
    cityInfo: {
      flex: 1,
    },
    cityName: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text.primary,
    },
    countryName: {
      fontSize: 14,
      color: colors.text.muted,
      marginTop: 2,
    },
    loadingContainer: {
      padding: 20,
      alignItems: 'center',
    },
    hint: {
      fontSize: 12,
      color: colors.text.muted,
      paddingHorizontal: 16,
      paddingBottom: 8,
      fontStyle: 'italic',
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    overlayText: {
      color: '#FFFFFF',
      marginTop: 12,
      fontSize: 16,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Select City</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color={colors.text.muted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search city or enter City, Country"
          placeholderTextColor={colors.text.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoCapitalize="words"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={() => setSearchQuery('')}>
            <X size={20} color={colors.text.muted} />
          </TouchableOpacity>
        )}
        {searchQuery.length > 0 && (
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Go</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.hint}>
        Tip: Enter &quot;City, Country&quot; for best results (e.g., &quot;Victoria, Canada&quot;)
      </Text>

      {/* Section Title */}
      <Text style={styles.sectionTitle}>{searchQuery ? 'Search Results' : 'Popular Cities'}</Text>

      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.pastel.blue} />
        </View>
      )}

      {/* City List */}
      <FlatList
        data={filteredCities}
        keyExtractor={item => `${item.city}-${item.country}`}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.cityItem}
            onPress={() => handleSelectCity(item.city, item.country)}
          >
            <MapPin size={20} color={colors.pastel.blue} style={styles.cityIcon} />
            <View style={styles.cityInfo}>
              <Text style={styles.cityName}>{item.city}</Text>
              <Text style={styles.countryName}>{item.country}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.loadingContainer}>
              <Text style={{ color: colors.text.muted }}>
                No cities found. Try entering &quot;City, Country&quot; format.
              </Text>
            </View>
          ) : null
        }
      />

      {/* Validating Overlay */}
      {validating && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.overlayText}>Validating city...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  Wallet,
  CheckSquare,
  Calendar,
  ShoppingBag,
  Settings as SettingsIcon,
  Moon,
} from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';

import FinancialsScreen from './src/screens/FinancialsScreen';
import ViewTransactionScreen, {
  type FinancialsStackParamList,
} from './src/screens/ViewTransactionScreen';
import TasksScreen from './src/screens/TasksScreen';
import ViewTaskScreen, { type Task } from './src/screens/ViewTaskScreen';
import GroceriesScreen from './src/screens/GroceriesScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import PrayerTimesScreen from './src/screens/PrayerTimesScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import CitySearchScreen from './src/screens/CitySearchScreen';
import CalculationMethodScreen from './src/screens/CalculationMethodScreen';
import AuthScreen from './src/screens/AuthScreen';
import { getCurrentUser } from './src/services/authService';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { getThemeColors } from './src/constants/theme';

import './global.css';

type TabParamList = {
  Financials: undefined;
  Tasks: undefined;
  Groceries: undefined;
  Schedule: undefined;
  PrayerTimes: undefined;
  Settings: undefined;
};

type RootStackParamList = {
  MainTabs: undefined;
  ViewTransaction: { transaction: FinancialsStackParamList['ViewTransaction']['transaction'] };
  ViewTask: { task: Task; onToggle?: (id: string) => void };
  CitySearch: { onSelect?: (city: string, country: string) => void } | undefined;
  CalculationMethod: { onSelect?: (method: number) => void } | undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

export { RootStackParamList };

function AppContent(): React.JSX.Element {
  const { themeMode } = useTheme();
  const COLORS = getThemeColors(themeMode);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async (): Promise<void> => {
    try {
      const user = await getCurrentUser();
      setIsAuthenticated(!!user);
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = (): void => {
    setIsAuthenticated(false);
  };

  // Show loading screen while checking auth
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.background,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color={COLORS.pastel.blue} />
      </View>
    );
  }

  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
        <AuthScreen onAuthSuccess={() => setIsAuthenticated(true)} />
      </>
    );
  }

  // Tab Navigator Component
  const MainTabs = (): React.JSX.Element => (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Financials') {
            return <Wallet size={size} color={color} />;
          } else if (route.name === 'Tasks') {
            return <CheckSquare size={size} color={color} />;
          } else if (route.name === 'Groceries') {
            return <ShoppingBag size={size} color={color} />;
          } else if (route.name === 'Schedule') {
            return <Calendar size={size} color={color} />;
          } else if (route.name === 'PrayerTimes') {
            return <Moon size={size} color={color} />;
          } else {
            return <SettingsIcon size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: COLORS.pastel.blue,
        tabBarInactiveTintColor: COLORS.text.muted,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.surface,
        },
        headerStyle: {
          backgroundColor: COLORS.card,
        },
        headerTintColor: COLORS.text.primary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShown: route.name !== 'Settings',
      })}
    >
      <Tab.Screen
        name="Financials"
        component={FinancialsScreen}
        options={{ title: 'Financials' }}
      />
      <Tab.Screen name="Tasks" component={TasksScreen} options={{ title: 'Tasks' }} />
      <Tab.Screen name="Groceries" component={GroceriesScreen} options={{ title: 'Groceries' }} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} options={{ title: 'Schedule' }} />
      <Tab.Screen name="PrayerTimes" component={PrayerTimesScreen} options={{ title: 'Prayer' }} />
      <Tab.Screen name="Settings" options={{ title: 'Settings' }}>
        {() => <SettingsScreen onSignOut={handleSignOut} />}
      </Tab.Screen>
    </Tab.Navigator>
  );

  // Show main app if authenticated
  return (
    <NavigationContainer>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="MainTabs" component={MainTabs} />
        <RootStack.Screen
          name="ViewTransaction"
          component={ViewTransactionScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <RootStack.Screen
          name="ViewTask"
          component={ViewTaskScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <RootStack.Screen
          name="CitySearch"
          component={CitySearchScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <RootStack.Screen
          name="CalculationMethod"
          component={CalculationMethodScreen}
          options={{ animation: 'slide_from_right' }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

export default function App(): React.JSX.Element {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

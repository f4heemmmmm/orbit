import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Wallet, CheckSquare, Calendar, LogOut } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, Alert, ActivityIndicator, View } from 'react-native';

import FinancialsScreen from './src/screens/FinancialsScreen';
import ViewTransactionScreen, {
  type FinancialsStackParamList,
} from './src/screens/ViewTransactionScreen';
import TasksScreen from './src/screens/TasksScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import AuthScreen from './src/screens/AuthScreen';
import { getCurrentUser, signOut } from './src/services/authService';
import { COLORS } from './src/constants/theme';

import './global.css';

type TabParamList = {
  Financials: undefined;
  Tasks: undefined;
  Schedule: undefined;
};

type RootStackParamList = {
  MainTabs: undefined;
  ViewTransaction: { transaction: FinancialsStackParamList['ViewTransaction']['transaction'] };
};

const Tab = createBottomTabNavigator<TabParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

export { RootStackParamList };

export default function App(): React.JSX.Element {
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

  const handleSignOut = async (): Promise<void> => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          setIsAuthenticated(false);
        },
      },
    ]);
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
        <StatusBar style="light" />
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
          } else {
            return <Calendar size={size} color={color} />;
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
        headerRight: () => (
          <TouchableOpacity onPress={handleSignOut} style={{ marginRight: 15 }}>
            <LogOut size={22} color={COLORS.text.primary} />
          </TouchableOpacity>
        ),
      })}
    >
      <Tab.Screen
        name="Financials"
        component={FinancialsScreen}
        options={{ title: 'Financials' }}
      />
      <Tab.Screen name="Tasks" component={TasksScreen} options={{ title: 'Tasks' }} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} options={{ title: 'Schedule' }} />
    </Tab.Navigator>
  );

  // Show main app if authenticated
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="MainTabs" component={MainTabs} />
        <RootStack.Screen
          name="ViewTransaction"
          component={ViewTransactionScreen}
          options={{ animation: 'slide_from_right' }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

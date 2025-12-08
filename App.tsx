import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import FinancialsScreen from './src/screens/FinancialsScreen';
import TasksScreen from './src/screens/TasksScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';

import './global.css';

type TabParamList = {
  Financials: undefined;
  Tasks: undefined;
  Schedule: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

type IconName = 'wallet' | 'wallet-outline' | 'checkbox' | 'checkbox-outline' | 'calendar' | 'calendar-outline';

export default function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: IconName;

            if (route.name === 'Financials') {
              iconName = focused ? 'wallet' : 'wallet-outline';
            } else if (route.name === 'Tasks') {
              iconName = focused ? 'checkbox' : 'checkbox-outline';
            } else {
              iconName = focused ? 'calendar' : 'calendar-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#a0c4ff',
          tabBarInactiveTintColor: '#6b6b80',
          tabBarStyle: {
            backgroundColor: '#1a1a2e',
            borderTopColor: '#252540',
          },
          headerStyle: {
            backgroundColor: '#1a1a2e',
          },
          headerTintColor: '#e8e8e8',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen 
          name="Financials" 
          component={FinancialsScreen}
          options={{ title: 'Financials' }}
        />
        <Tab.Screen 
          name="Tasks" 
          component={TasksScreen}
          options={{ title: 'Tasks' }}
        />
        <Tab.Screen 
          name="Schedule" 
          component={ScheduleScreen}
          options={{ title: 'Schedule' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}


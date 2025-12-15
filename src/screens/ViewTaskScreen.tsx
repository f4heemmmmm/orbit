import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { ChevronLeft, FileText, Flag, Circle, CheckCircle, AlignLeft } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeColors } from '../constants/theme';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}

type RootStackParamList = {
  MainTabs: undefined;
  ViewTask: {
    task: Task;
    onToggle?: (id: string) => void;
  };
};

type Props = NativeStackScreenProps<RootStackParamList, 'ViewTask'>;

export default function ViewTaskScreen({ navigation, route }: Props): React.JSX.Element {
  const { themeMode } = useTheme();
  const COLORS = getThemeColors(themeMode);
  const { task, onToggle } = route.params;

  const getPriorityInfo = (
    priority: 'low' | 'medium' | 'high'
  ): { label: string; color: string } => {
    switch (priority) {
      case 'low':
        return { label: 'Low', color: COLORS.pastel.green };
      case 'medium':
        return { label: 'Medium', color: COLORS.pastel.orange };
      case 'high':
        return { label: 'High', color: COLORS.pastel.red };
      default:
        return { label: 'Medium', color: COLORS.pastel.orange };
    }
  };

  const priorityInfo = getPriorityInfo(task.priority);

  const handleToggle = (): void => {
    if (onToggle) {
      onToggle(task.id);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Status bar background */}
      <SafeAreaView style={{ backgroundColor: COLORS.card }} />
      <View className="flex-1" style={{ backgroundColor: COLORS.background }}>
        {/* Header */}
        <View
          className="flex-row items-center justify-center px-4 py-4"
          style={{ backgroundColor: COLORS.card }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} className="absolute left-4 p-2">
            <ChevronLeft size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={{ color: COLORS.text.primary }} className="text-xl font-bold">
            Task Details
          </Text>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Status Card */}
          <View
            className="mx-4 mt-4 rounded-2xl p-6 items-center"
            style={{ backgroundColor: COLORS.card }}
          >
            <TouchableOpacity onPress={handleToggle} activeOpacity={0.7}>
              {task.completed ? (
                <CheckCircle size={64} color={COLORS.pastel.green} />
              ) : (
                <Circle size={64} color={COLORS.text.muted} />
              )}
            </TouchableOpacity>
            <View
              className="mt-3 px-4 py-1.5 rounded-full"
              style={{
                backgroundColor:
                  (task.completed ? COLORS.pastel.green : COLORS.pastel.orange) + '20',
              }}
            >
              <Text
                className="text-base font-medium"
                style={{ color: task.completed ? COLORS.pastel.green : COLORS.pastel.orange }}
              >
                {task.completed ? 'Completed' : 'Pending'}
              </Text>
            </View>
          </View>

          {/* Details Card */}
          <View className="mx-4 mt-4 rounded-2xl p-5" style={{ backgroundColor: COLORS.card }}>
            {/* Title */}
            <View className="flex-row items-center mb-5">
              <View
                className="w-11 h-11 rounded-full justify-center items-center"
                style={{ backgroundColor: COLORS.surface }}
              >
                <FileText size={20} color={COLORS.text.secondary} />
              </View>
              <View className="ml-4 flex-1">
                <Text style={{ color: COLORS.text.secondary }} className="text-sm">
                  Title
                </Text>
                <Text
                  style={{
                    color: task.completed ? COLORS.text.muted : COLORS.text.primary,
                    textDecorationLine: task.completed ? 'line-through' : 'none',
                  }}
                  className="text-lg font-medium mt-0.5"
                >
                  {task.title}
                </Text>
              </View>
            </View>

            {/* Priority */}
            <View className="flex-row items-center">
              <View
                className="w-11 h-11 rounded-full justify-center items-center"
                style={{ backgroundColor: priorityInfo.color + '25' }}
              >
                <Flag size={20} color={priorityInfo.color} />
              </View>
              <View className="ml-4 flex-1">
                <Text style={{ color: COLORS.text.secondary }} className="text-sm">
                  Priority
                </Text>
                <Text style={{ color: COLORS.text.primary }} className="text-lg font-medium mt-0.5">
                  {priorityInfo.label}
                </Text>
              </View>
            </View>
          </View>

          {/* Description Card (only if description exists) */}
          {task.description ? (
            <View className="mx-4 mt-4 rounded-2xl p-5" style={{ backgroundColor: COLORS.card }}>
              <View className="flex-row items-center mb-3">
                <View
                  className="w-11 h-11 rounded-full justify-center items-center"
                  style={{ backgroundColor: COLORS.pastel.purple + '25' }}
                >
                  <AlignLeft size={20} color={COLORS.pastel.purple} />
                </View>
                <Text style={{ color: COLORS.text.secondary }} className="text-sm ml-4">
                  Description
                </Text>
              </View>
              <Text
                style={{
                  color: task.completed ? COLORS.text.muted : COLORS.text.primary,
                  marginLeft: 60,
                  lineHeight: 22,
                }}
                className="text-base"
              >
                {task.description}
              </Text>
            </View>
          ) : null}

          {/* Toggle Button */}
          <View className="mx-4 mt-4">
            <TouchableOpacity
              className="rounded-2xl p-4 items-center"
              style={{
                backgroundColor: task.completed ? COLORS.pastel.orange : COLORS.pastel.green,
              }}
              onPress={handleToggle}
              activeOpacity={0.8}
            >
              <Text style={{ color: COLORS.background }} className="text-base font-semibold">
                {task.completed ? 'Mark as Pending' : 'Mark as Completed'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Bottom spacing */}
          <View className="h-8" />
        </ScrollView>
      </View>
    </View>
  );
}

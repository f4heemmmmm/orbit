import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { X, Circle, CheckCircle, Flag } from 'lucide-react-native';
import type { Task } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeColors } from '../constants/theme';

interface ViewTaskModalProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
  onToggleComplete: () => void;
}

export default function ViewTaskModal({
  visible,
  task,
  onClose,
  onToggleComplete,
}: ViewTaskModalProps): React.JSX.Element {
  const { themeMode } = useTheme();
  const COLORS = getThemeColors(themeMode);

  if (!task) {
    return <></>;
  }

  const getPriorityColor = (priority: 'low' | 'medium' | 'high'): string => {
    switch (priority) {
      case 'low':
        return COLORS.pastel.green;
      case 'medium':
        return COLORS.pastel.orange;
      case 'high':
        return COLORS.pastel.red;
      default:
        return COLORS.text.secondary;
    }
  };

  const getPriorityLabel = (priority: 'low' | 'medium' | 'high'): string => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <TouchableWithoutFeedback>
            <View
              className="rounded-t-3xl p-6 pt-8"
              style={{ backgroundColor: COLORS.card, maxHeight: '85%' }}
            >
              {/* Header */}
              <View className="flex-row items-center justify-between mb-5">
                <Text style={{ color: COLORS.text.primary }} className="text-xl font-bold">
                  Task Details
                </Text>
                <TouchableOpacity className="p-2" onPress={onClose}>
                  <X size={24} color={COLORS.text.secondary} />
                </TouchableOpacity>
              </View>

              <ScrollView className="flex-1" showsVerticalScrollIndicator={false} bounces={false}>
                {/* Title Section */}
                <View className="mb-6">
                  <Text
                    style={{ color: COLORS.text.secondary }}
                    className="text-sm font-medium mb-2"
                  >
                    Title
                  </Text>
                  <Text
                    style={{
                      color: task.completed ? COLORS.text.muted : COLORS.text.primary,
                      textDecorationLine: task.completed ? 'line-through' : 'none',
                    }}
                    className="text-lg font-semibold"
                  >
                    {task.title}
                  </Text>
                </View>

                {/* Description Section */}
                <View className="mb-6">
                  <Text
                    style={{ color: COLORS.text.secondary }}
                    className="text-sm font-medium mb-2"
                  >
                    Description
                  </Text>
                  <View className="rounded-xl p-4" style={{ backgroundColor: COLORS.surface }}>
                    <Text style={{ color: COLORS.text.primary }} className="text-base leading-6">
                      {task.description || 'No description provided'}
                    </Text>
                  </View>
                </View>

                {/* Priority Section */}
                <View className="mb-6">
                  <Text
                    style={{ color: COLORS.text.secondary }}
                    className="text-sm font-medium mb-2"
                  >
                    Priority
                  </Text>
                  <View className="flex-row items-center">
                    <View
                      className="flex-row items-center px-4 py-2 rounded-full"
                      style={{ backgroundColor: getPriorityColor(task.priority) + '30' }}
                    >
                      <Flag size={16} color={getPriorityColor(task.priority)} />
                      <Text
                        style={{ color: getPriorityColor(task.priority) }}
                        className="text-sm font-semibold ml-2"
                      >
                        {getPriorityLabel(task.priority)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Status Section */}
                <View className="mb-6">
                  <Text
                    style={{ color: COLORS.text.secondary }}
                    className="text-sm font-medium mb-2"
                  >
                    Status
                  </Text>
                  <TouchableOpacity
                    className="flex-row items-center p-4 rounded-xl"
                    style={{ backgroundColor: COLORS.surface }}
                    onPress={onToggleComplete}
                    activeOpacity={0.7}
                  >
                    {task.completed ? (
                      <CheckCircle size={24} color={COLORS.pastel.green} />
                    ) : (
                      <Circle size={24} color={COLORS.text.muted} />
                    )}
                    <Text
                      style={{ color: COLORS.text.primary }}
                      className="text-base font-medium ml-3"
                    >
                      {task.completed ? 'Completed' : 'Mark as complete'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

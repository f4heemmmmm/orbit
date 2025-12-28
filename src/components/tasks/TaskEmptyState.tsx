import React from 'react';
import { View, Text } from 'react-native';
import { Circle } from 'lucide-react-native';

interface TaskEmptyStateProps {
  colors: {
    text: {
      muted: string;
    };
  };
}

export default function TaskEmptyState({ colors }: TaskEmptyStateProps): React.JSX.Element {
  return (
    <View className="items-center justify-center pt-16">
      <Circle size={48} color={colors.text.muted} />
      <Text style={{ color: colors.text.muted }} className="text-base mt-3">
        No tasks found
      </Text>
      <Text style={{ color: colors.text.muted }} className="text-sm mt-1">
        Tap + to add your first task
      </Text>
    </View>
  );
}

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export type FilterType = 'pending' | 'completed';

const FILTERS: FilterType[] = ['pending', 'completed'];

const FILTER_LABELS: Record<FilterType, string> = {
  pending: 'To-do',
  completed: 'Completed',
};

interface TaskFilterTabsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  colors: {
    card: string;
    background: string;
    pastel: {
      blue: string;
    };
    text: {
      secondary: string;
    };
  };
}

export default function TaskFilterTabs({
  activeFilter,
  onFilterChange,
  colors,
}: TaskFilterTabsProps): React.JSX.Element {
  return (
    <View className="flex-row px-4 mt-2 mb-3" style={{ gap: 8 }}>
      {FILTERS.map(filter => (
        <TouchableOpacity
          key={filter}
          className="flex-1 py-2 rounded-2xl"
          style={{ backgroundColor: activeFilter === filter ? colors.pastel.blue : colors.card }}
          onPress={() => onFilterChange(filter)}
        >
          <Text
            className="text-base font-semibold text-center"
            style={{ color: activeFilter === filter ? colors.background : colors.text.secondary }}
          >
            {FILTER_LABELS[filter]}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

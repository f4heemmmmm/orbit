import React from 'react';
import { View, Text, type DimensionValue } from 'react-native';

interface TaskProgressCardProps {
  completedCount: number;
  pendingCount: number;
  totalCount: number;
  colors: {
    card: string;
    surface: string;
    pastel: {
      green: string;
      orange: string;
      blue: string;
    };
    text: {
      muted: string;
    };
  };
}

export default function TaskProgressCard({
  completedCount,
  pendingCount,
  totalCount,
  colors,
}: TaskProgressCardProps): React.JSX.Element {
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const progressWidth: DimensionValue =
    totalCount > 0 ? (`${(completedCount / totalCount) * 100}%` as DimensionValue) : '0%';

  return (
    <View className="p-4 pb-2">
      <View className="rounded-2xl p-4" style={{ backgroundColor: colors.card }}>
        <View
          className="h-2 rounded-full overflow-hidden mb-4"
          style={{ backgroundColor: colors.surface }}
        >
          <View
            className="h-full rounded-full"
            style={{
              backgroundColor: colors.pastel.green,
              width: progressWidth,
            }}
          />
        </View>

        <View className="flex-row items-center">
          <View className="flex-1 items-center">
            <Text style={{ color: colors.pastel.green }} className="text-xl font-bold">
              {completedCount}
            </Text>
            <Text style={{ color: colors.text.muted }} className="text-xs">
              Done
            </Text>
          </View>

          <View className="w-px h-10" style={{ backgroundColor: colors.surface }} />

          <View className="flex-1 items-center">
            <Text style={{ color: colors.pastel.orange }} className="text-xl font-bold">
              {pendingCount}
            </Text>
            <Text style={{ color: colors.text.muted }} className="text-xs">
              Pending
            </Text>
          </View>

          <View className="w-px h-10" style={{ backgroundColor: colors.surface }} />

          <View className="flex-1 items-center">
            <Text style={{ color: colors.pastel.blue }} className="text-xl font-bold">
              {completionPercentage}%
            </Text>
            <Text style={{ color: colors.text.muted }} className="text-xs">
              Complete
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

/**
 * Split Bill List Item
 * Card component for displaying a split bill in the list
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Users, ChevronRight, CheckCircle } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeColors } from '../../constants/theme';
import { formatRelativeDate } from '../../utils/dateUtils';
import type { SplitBill } from '../../types/splitBill';

interface SplitBillListItemProps {
  bill: SplitBill;
  participantCount?: number;
  onPress: () => void;
}

export default function SplitBillListItem({
  bill,
  participantCount = 0,
  onPress,
}: SplitBillListItemProps): React.JSX.Element {
  const { themeMode } = useTheme();
  const COLORS = getThemeColors(themeMode);
  const isSettled = bill.status === 'settled';

  return (
    <TouchableOpacity
      className="rounded-xl p-4 mb-3"
      style={{
        backgroundColor: COLORS.card,
        opacity: isSettled ? 0.7 : 1,
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        {/* Icon */}
        <View
          className="w-12 h-12 rounded-full items-center justify-center mr-3"
          style={{
            backgroundColor: isSettled ? COLORS.pastel.green + '20' : COLORS.pastel.orange + '20',
          }}
        >
          {isSettled ? (
            <CheckCircle size={24} color={COLORS.pastel.green} />
          ) : (
            <Users size={24} color={COLORS.pastel.orange} />
          )}
        </View>

        {/* Content */}
        <View className="flex-1">
          <Text
            className="text-base font-semibold mb-1"
            style={{
              color: COLORS.text.primary,
              textDecorationLine: isSettled ? 'line-through' : 'none',
            }}
            numberOfLines={1}
          >
            {bill.title}
          </Text>
          <View className="flex-row items-center">
            <Text className="text-sm" style={{ color: COLORS.text.muted }}>
              {formatRelativeDate(bill.date)}
            </Text>
            {participantCount > 0 && (
              <>
                <Text className="text-sm mx-1" style={{ color: COLORS.text.muted }}>
                  •
                </Text>
                <Text className="text-sm" style={{ color: COLORS.text.muted }}>
                  {participantCount} {participantCount === 1 ? 'person' : 'people'}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Amount */}
        <View className="items-end mr-2">
          <Text
            className="text-lg font-bold"
            style={{ color: isSettled ? COLORS.text.muted : COLORS.text.primary }}
          >
            ${bill.totalAmount.toFixed(2)}
          </Text>
          {isSettled && (
            <Text className="text-xs" style={{ color: COLORS.pastel.green }}>
              Settled
            </Text>
          )}
        </View>

        <ChevronRight size={20} color={COLORS.text.muted} />
      </View>
    </TouchableOpacity>
  );
}

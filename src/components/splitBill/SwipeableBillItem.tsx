/**
 * Swipeable Bill Item Component
 * A swipeable row for bill items with delete action
 * Uses react-native-gesture-handler for proper ScrollView/TextInput compatibility
 */

import React, { useRef, useCallback } from 'react';
import { View, TouchableOpacity, Animated, type ViewStyle } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Trash2 } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeColors } from '../../constants/theme';

const DELETE_BUTTON_WIDTH = 72;

interface SwipeableBillItemProps {
  children: React.ReactNode;
  onDelete: () => void;
  enabled?: boolean;
  style?: ViewStyle;
}

export default function SwipeableBillItem({
  children,
  onDelete,
  enabled = true,
  style,
}: SwipeableBillItemProps): React.JSX.Element {
  const { themeMode } = useTheme();
  const COLORS = getThemeColors(themeMode);
  const swipeableRef = useRef<Swipeable>(null);

  const handleDelete = useCallback((): void => {
    swipeableRef.current?.close();
    onDelete();
  }, [onDelete]);

  const renderRightActions = useCallback(
    (
      _progress: Animated.AnimatedInterpolation<number>,
      dragX: Animated.AnimatedInterpolation<number>
    ): React.ReactNode => {
      const scale = dragX.interpolate({
        inputRange: [-DELETE_BUTTON_WIDTH, 0],
        outputRange: [1, 0.8],
        extrapolate: 'clamp',
      });

      const opacity = dragX.interpolate({
        inputRange: [-DELETE_BUTTON_WIDTH, -DELETE_BUTTON_WIDTH / 2, 0],
        outputRange: [1, 0.8, 0],
        extrapolate: 'clamp',
      });

      return (
        <Animated.View
          style={{
            width: DELETE_BUTTON_WIDTH,
            opacity,
            transform: [{ scale }],
          }}
        >
          <TouchableOpacity
            className="flex-1 justify-center items-center rounded-r-xl"
            style={{ backgroundColor: COLORS.pastel.red }}
            onPress={handleDelete}
            activeOpacity={0.8}
          >
            <Trash2 size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      );
    },
    [COLORS.pastel.red, handleDelete]
  );

  // If not enabled, render without swipeable wrapper
  if (!enabled) {
    return (
      <View className="mb-2 rounded-xl overflow-hidden">
        <View className="rounded-xl" style={[{ backgroundColor: COLORS.surface }, style]}>
          {children}
        </View>
      </View>
    );
  }

  return (
    <View className="mb-2 rounded-xl overflow-hidden">
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        rightThreshold={DELETE_BUTTON_WIDTH / 2}
        overshootRight={false}
        friction={2}
      >
        <View className="rounded-xl" style={[{ backgroundColor: COLORS.surface }, style]}>
          {children}
        </View>
      </Swipeable>
    </View>
  );
}

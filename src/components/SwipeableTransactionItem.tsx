import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { ChevronRight, Trash2 } from 'lucide-react-native';
import type { Transaction, Category } from '../types';
import { TRANSACTION_CATEGORIES } from '../constants/categories';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeColors } from '../constants/theme';

const DELETE_BUTTON_WIDTH = 80;
const BORDER_RADIUS = 15; // rounded-xl in Tailwind

interface Props {
  item: Transaction;
  onPress: () => void;
  onDelete: () => void;
}

export default function SwipeableTransactionItem({
  item,
  onPress,
  onDelete,
}: Props): React.JSX.Element {
  const { themeMode } = useTheme();
  const COLORS = getThemeColors(themeMode);
  const translateX = useRef(new Animated.Value(0)).current;
  const currentOffset = useRef(0);

  const getCategoryInfo = (categoryName: string): Category => {
    return TRANSACTION_CATEGORIES.find(c => c.name === categoryName) || TRANSACTION_CATEGORIES[7];
  };

  const category = getCategoryInfo(item.category);
  const IconComponent = category.icon;

  // Interpolate border radius based on swipe position
  // When closed (0), borderRadius is BORDER_RADIUS (rounded-xl)
  // When open (-DELETE_BUTTON_WIDTH), borderRadius is 0 on the right side
  const borderTopRightRadius = translateX.interpolate({
    inputRange: [-DELETE_BUTTON_WIDTH, 0],
    outputRange: [0, BORDER_RADIUS],
    extrapolate: 'clamp',
  });

  const borderBottomRightRadius = translateX.interpolate({
    inputRange: [-DELETE_BUTTON_WIDTH, 0],
    outputRange: [0, BORDER_RADIUS],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to horizontal swipes with minimal vertical movement
        const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 2;
        const hasMovedEnough = Math.abs(gestureState.dx) > 5;
        return isHorizontal && hasMovedEnough;
      },
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        // Capture horizontal swipes to prevent ScrollView from taking over
        const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 2;
        const hasMovedEnough = Math.abs(gestureState.dx) > 5;
        return isHorizontal && hasMovedEnough;
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        // Stop any ongoing animation and capture current position
        translateX.stopAnimation(value => {
          currentOffset.current = value;
        });
      },
      onPanResponderMove: (_, gestureState) => {
        // Calculate new position based on current offset + gesture delta
        let newValue = currentOffset.current + gestureState.dx;

        // Only allow left swipe (negative values) and limit to delete button width
        newValue = Math.max(Math.min(newValue, 0), -DELETE_BUTTON_WIDTH);

        translateX.setValue(newValue);
      },
      onPanResponderRelease: (_, gestureState) => {
        const currentValue = currentOffset.current + gestureState.dx;
        const velocity = gestureState.vx;

        // Determine if we should open or close based on position and velocity
        // Open if: swiped past threshold OR fast left swipe
        // Close if: not past threshold OR fast right swipe
        let shouldOpen;

        if (Math.abs(velocity) > 0.3) {
          // If there's significant velocity, use that to determine direction
          shouldOpen = velocity < 0;
        } else {
          // Otherwise, use position threshold (30% of button width)
          shouldOpen = currentValue < -DELETE_BUTTON_WIDTH * 0.3;
        }

        if (shouldOpen) {
          // Open delete button with spring animation
          Animated.spring(translateX, {
            toValue: -DELETE_BUTTON_WIDTH,
            useNativeDriver: false,
            tension: 80,
            friction: 8,
          }).start();
          currentOffset.current = -DELETE_BUTTON_WIDTH;
        } else {
          // Close delete button with spring animation
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: false,
            tension: 80,
            friction: 8,
          }).start();
          currentOffset.current = 0;
        }
      },
      onPanResponderTerminate: () => {
        // If gesture is interrupted, snap to nearest position
        const shouldOpen = currentOffset.current < -DELETE_BUTTON_WIDTH * 0.3;
        Animated.spring(translateX, {
          toValue: shouldOpen ? -DELETE_BUTTON_WIDTH : 0,
          useNativeDriver: false,
          tension: 80,
          friction: 8,
        }).start();
        currentOffset.current = shouldOpen ? -DELETE_BUTTON_WIDTH : 0;
      },
    })
  ).current;

  const closeSwipe = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: false,
      tension: 100,
      friction: 10,
    }).start();
    currentOffset.current = 0;
  };

  const handleDelete = () => {
    closeSwipe();
    onDelete();
  };

  const handlePress = () => {
    if (currentOffset.current < 0) {
      closeSwipe();
    } else {
      onPress();
    }
  };

  return (
    <View className="mb-3" style={{ borderRadius: BORDER_RADIUS, overflow: 'hidden' }}>
      {/* Delete button behind - full width */}
      <View
        className="absolute left-0 right-0 top-0 rounded-3xl bottom-0 justify-center items-end"
        style={{
          backgroundColor: COLORS.pastel.red,
          paddingRight: 0,
        }}
      >
        <TouchableOpacity
          className="justify-center items-center"
          onPress={handleDelete}
          activeOpacity={0.7}
          style={{ width: DELETE_BUTTON_WIDTH, height: '100%' }}
        >
          <Trash2 size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Swipeable content */}
      <Animated.View
        {...panResponder.panHandlers}
        style={{
          transform: [{ translateX }],
          borderTopRightRadius,
          borderBottomRightRadius,
          borderTopLeftRadius: BORDER_RADIUS,
          borderBottomLeftRadius: BORDER_RADIUS,
          backgroundColor: COLORS.card,
        }}
      >
        <TouchableOpacity
          className="flex-row items-center p-4"
          style={{ backgroundColor: 'transparent' }}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          <View
            className="w-11 h-11 rounded-full justify-center items-center"
            style={{ backgroundColor: category.color + '30' }}
          >
            <IconComponent size={20} color={category.color} />
          </View>
          <View className="flex-1 ml-3">
            <Text style={{ color: COLORS.text.primary }} className="text-base font-medium">
              {item.title}
            </Text>
            <Text style={{ color: COLORS.text.secondary }} className="text-sm mt-0.5">
              {item.category}
            </Text>
          </View>
          <Text
            style={{ color: item.type === 'income' ? COLORS.pastel.green : COLORS.pastel.red }}
            className="text-base font-semibold mr-2"
          >
            {item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
          </Text>
          <ChevronRight size={20} color={COLORS.text.muted} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

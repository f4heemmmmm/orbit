import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { type LucideIcon, Trash2 } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeColors } from '../constants/theme';

const DELETE_BUTTON_WIDTH = 80;
const BORDER_RADIUS = 15;

interface ScheduleEvent {
  id: string;
  title: string;
  type: 'activity' | 'exam' | 'class' | 'other';
  date: string;
  time: string;
  description: string;
}

interface EventTypeInfo {
  label: string;
  icon: LucideIcon;
  color: string;
}

interface Props {
  item: ScheduleEvent;
  typeInfo: EventTypeInfo;
  onDelete: () => void;
  onPress: () => void;
}

export default function SwipeableScheduleItem({
  item,
  typeInfo,
  onDelete,
  onPress,
}: Props): React.JSX.Element {
  const { themeMode } = useTheme();
  const COLORS = getThemeColors(themeMode);
  const translateX = useRef(new Animated.Value(0)).current;
  const currentOffset = useRef(0);

  const IconComponent = typeInfo.icon;

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
        const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 2;
        const hasMovedEnough = Math.abs(gestureState.dx) > 5;
        return isHorizontal && hasMovedEnough;
      },
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 2;
        const hasMovedEnough = Math.abs(gestureState.dx) > 5;
        return isHorizontal && hasMovedEnough;
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        translateX.stopAnimation(value => {
          currentOffset.current = value;
        });
      },
      onPanResponderMove: (_, gestureState) => {
        let newValue = currentOffset.current + gestureState.dx;
        newValue = Math.max(Math.min(newValue, 0), -DELETE_BUTTON_WIDTH);
        translateX.setValue(newValue);
      },
      onPanResponderRelease: (_, gestureState) => {
        const currentValue = currentOffset.current + gestureState.dx;
        const velocity = gestureState.vx;

        let shouldOpen;
        if (Math.abs(velocity) > 0.3) {
          shouldOpen = velocity < 0;
        } else {
          shouldOpen = currentValue < -DELETE_BUTTON_WIDTH * 0.3;
        }

        if (shouldOpen) {
          Animated.spring(translateX, {
            toValue: -DELETE_BUTTON_WIDTH,
            useNativeDriver: false,
            tension: 80,
            friction: 8,
          }).start();
          currentOffset.current = -DELETE_BUTTON_WIDTH;
        } else {
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
      {/* Delete button behind */}
      <View
        className="absolute left-0 right-0 top-0 bottom-0 justify-center items-end"
        style={{ backgroundColor: COLORS.pastel.red, borderRadius: BORDER_RADIUS }}
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
        <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
          <View className="flex-row items-center p-4">
            <View
              className="w-10 h-10 rounded-full justify-center items-center"
              style={{ backgroundColor: typeInfo.color + '25' }}
            >
              <IconComponent size={20} color={typeInfo.color} />
            </View>
            <View className="flex-1 ml-3">
              <Text
                className="text-base font-medium"
                style={{ color: COLORS.text.primary }}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text className="text-sm mt-0.5" style={{ color: COLORS.text.secondary }}>
                {item.time}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

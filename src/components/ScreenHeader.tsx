import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, type LucideIcon } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeColors, SPACING, FONT_SIZES } from '../constants/theme';

interface RightAction {
  icon: LucideIcon;
  onPress: () => void;
  color?: string;
}

interface ScreenHeaderProps {
  /** Screen title to display */
  title: string;
  /** Callback when back button is pressed. If provided, back button is shown */
  onBackPress?: () => void;
  /** Optional right action button */
  rightAction?: RightAction;
  /** Whether to include safe area padding at the top (default: true) */
  includeSafeArea?: boolean;
  /** Custom background color override */
  backgroundColor?: string;
}

const HEADER_PADDING_VERTICAL = SPACING.lg;
const HEADER_PADDING_HORIZONTAL = SPACING.lg;
const ICON_SIZE = 24;
const ICON_HITSLOP = SPACING.sm;

/**
 * Reusable screen header component with dynamic title, optional back button,
 * and safe area handling for notches and dynamic islands.
 */
export default function ScreenHeader({
  title,
  onBackPress,
  rightAction,
  includeSafeArea = true,
  backgroundColor,
}: ScreenHeaderProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { themeMode } = useTheme();
  const COLORS = getThemeColors(themeMode);

  const bgColor = backgroundColor ?? COLORS.card;
  const topPadding = includeSafeArea ? insets.top : 0;

  return (
    <View style={[styles.container, { backgroundColor: bgColor, paddingTop: topPadding }]}>
      <View style={styles.headerContent}>
        {/* Back button */}
        {onBackPress ? (
          <TouchableOpacity
            onPress={onBackPress}
            style={styles.leftButton}
            hitSlop={{
              top: ICON_HITSLOP,
              bottom: ICON_HITSLOP,
              left: ICON_HITSLOP,
              right: ICON_HITSLOP,
            }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ChevronLeft size={ICON_SIZE} color={COLORS.text.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.leftPlaceholder} />
        )}

        {/* Title */}
        <Text
          style={[styles.title, { color: COLORS.text.primary }]}
          numberOfLines={1}
          accessibilityRole="header"
        >
          {title}
        </Text>

        {/* Right action */}
        {rightAction ? (
          <TouchableOpacity
            onPress={rightAction.onPress}
            style={styles.rightButton}
            hitSlop={{
              top: ICON_HITSLOP,
              bottom: ICON_HITSLOP,
              left: ICON_HITSLOP,
              right: ICON_HITSLOP,
            }}
            accessibilityRole="button"
          >
            <rightAction.icon size={ICON_SIZE} color={rightAction.color ?? COLORS.pastel.blue} />
          </TouchableOpacity>
        ) : (
          <View style={styles.rightPlaceholder} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: HEADER_PADDING_VERTICAL,
    paddingHorizontal: HEADER_PADDING_HORIZONTAL,
    minHeight: 56,
  },
  leftButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftPlaceholder: {
    width: 40,
  },
  title: {
    flex: 1,
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: SPACING.sm,
  },
  rightButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightPlaceholder: {
    width: 40,
  },
});

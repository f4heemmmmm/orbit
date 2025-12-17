import React from 'react';
import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeColors } from '../constants/theme';
import ScreenHeader from './ScreenHeader';

interface HeaderConfig {
  /** Screen title to display in header */
  title: string;
  /** Callback when back button is pressed. If provided, back button is shown */
  onBackPress?: () => void;
  /** Optional right action button */
  rightAction?: {
    icon: LucideIcon;
    onPress: () => void;
    color?: string;
  };
}

type SafeAreaEdge = 'top' | 'bottom' | 'left' | 'right';

interface ScreenLayoutProps {
  /** Child components to render */
  children: React.ReactNode;
  /** Header configuration. If provided, header is shown */
  headerConfig?: HeaderConfig;
  /** Which safe area edges to apply padding (default: none if header, ['bottom'] if no header) */
  safeAreaEdges?: SafeAreaEdge[];
  /** Custom background color override */
  backgroundColor?: string;
  /** Additional style for the container */
  style?: StyleProp<ViewStyle>;
}

/**
 * Reusable screen layout wrapper that provides consistent structure,
 * safe area handling, and optional header across screens.
 */
export default function ScreenLayout({
  children,
  headerConfig,
  safeAreaEdges,
  backgroundColor,
  style,
}: ScreenLayoutProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { themeMode } = useTheme();
  const COLORS = getThemeColors(themeMode);

  const bgColor = backgroundColor ?? COLORS.background;

  // Determine which edges need safe area padding
  const edges = safeAreaEdges ?? (headerConfig ? ['bottom'] : []);

  const safeAreaStyle: ViewStyle = {
    paddingTop: edges.includes('top') ? insets.top : 0,
    paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
    paddingLeft: edges.includes('left') ? insets.left : 0,
    paddingRight: edges.includes('right') ? insets.right : 0,
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }, safeAreaStyle, style]}>
      {headerConfig && (
        <ScreenHeader
          title={headerConfig.title}
          onBackPress={headerConfig.onBackPress}
          rightAction={headerConfig.rightAction}
          includeSafeArea={!edges.includes('top')}
          backgroundColor={COLORS.card}
        />
      )}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

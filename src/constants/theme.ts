/**
 * Theme constants for consistent styling across the app
 */

// Dark mode colors
const DARK_COLORS = {
  background: '#0f0f1a',
  card: '#1a1a2e',
  surface: '#252540',
  overlay: 'rgba(0,0,0,0.7)',
  text: {
    primary: '#e8e8e8',
    secondary: '#a0a0b0',
    muted: '#6b6b80',
  },
} as const;

// Light mode colors - Apple-inspired palette
const LIGHT_COLORS = {
  background: '#F2F2F7', // iOS grouped background
  card: '#FFFFFF', // Pure white cards
  surface: '#E5E5EA', // iOS secondary system fill
  overlay: 'rgba(0,0,0,0.4)',
  text: {
    primary: '#1C1C1E', // iOS label color
    secondary: '#636366', // iOS secondary label
    muted: '#8E8E93', // iOS tertiary label
  },
} as const;

// Dark mode accent colors - softer pastels for dark backgrounds
const DARK_ACCENT_COLORS = {
  pastel: {
    blue: '#a0c4ff',
    green: '#7dd3a8',
    red: '#f5a0a0',
    orange: '#ffd6a5',
    yellow: '#fdffb6',
    purple: '#bdb2ff',
    pink: '#ffc6ff',
    teal: '#9bf6e3',
    coral: '#ffadad',
  },
  category: {
    food: '#ffadad',
    transport: '#9bf6e3',
    bills: '#fdffb6',
    salary: '#7dd3a8',
    shopping: '#ffc6ff',
    entertainment: '#bdb2ff',
    health: '#ffd6a5',
    other: '#a0a0b0',
  },
} as const;

// Light mode accent colors - refined Apple-inspired palette
// Slightly softer than pure iOS system colors for better UI harmony
const LIGHT_ACCENT_COLORS = {
  pastel: {
    blue: '#3478F6', // Refined iOS blue
    green: '#30B858', // Refined iOS green
    red: '#E84545', // Softer red
    orange: '#F5A623', // Warm orange
    yellow: '#F7C948', // Softer yellow
    purple: '#9B59B6', // Refined purple
    pink: '#E74C84', // Softer pink
    teal: '#4ECDC4', // Refined teal
    coral: '#E57373', // Soft coral
  },
  category: {
    food: '#E57373',
    transport: '#4ECDC4',
    bills: '#F7C948',
    salary: '#30B858',
    shopping: '#E74C84',
    entertainment: '#9B59B6',
    health: '#F5A623',
    other: '#8E8E93',
  },
} as const;

// Default export for backward compatibility (dark mode)
export const COLORS = {
  ...DARK_COLORS,
  ...DARK_ACCENT_COLORS,
} as const;

/**
 * Get theme colors based on mode
 */
export function getThemeColors(mode: 'light' | 'dark') {
  const baseColors = mode === 'light' ? LIGHT_COLORS : DARK_COLORS;
  const accentColors = mode === 'light' ? LIGHT_ACCENT_COLORS : DARK_ACCENT_COLORS;
  return {
    ...baseColors,
    ...accentColors,
  };
}

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
} as const;

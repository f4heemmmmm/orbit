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

// Light mode colors
const LIGHT_COLORS = {
  background: '#f5f5f7',
  card: '#ffffff',
  surface: '#e8e8ea',
  overlay: 'rgba(0,0,0,0.5)',
  text: {
    primary: '#1a1a1a',
    secondary: '#6b6b80',
    muted: '#a0a0b0',
  },
} as const;

// Shared colors (same in both modes)
const SHARED_COLORS = {
  // Pastel accent colors
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

  // Category colors
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

// Default export for backward compatibility (dark mode)
export const COLORS = {
  ...DARK_COLORS,
  ...SHARED_COLORS,
} as const;

/**
 * Get theme colors based on mode
 */
export function getThemeColors(mode: 'light' | 'dark') {
  const baseColors = mode === 'light' ? LIGHT_COLORS : DARK_COLORS;
  return {
    ...baseColors,
    ...SHARED_COLORS,
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

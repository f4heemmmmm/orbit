# Orbit - Architecture Documentation

## Overview

Orbit is a modern React Native application built with Expo, featuring financial tracking, task management, and schedule organization capabilities. The app follows industry-standard practices with TypeScript, modular architecture, and consistent theming.

## Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Language**: TypeScript 5.9
- **Styling**: NativeWind (TailwindCSS for React Native)
- **Navigation**: React Navigation 7 (Bottom Tabs)
- **Icons**: Lucide React Native
- **Date/Time**: React Native Community DateTimePicker

## Project Structure

```
orbit/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── AddTransactionModal.tsx
│   ├── screens/             # Main app screens
│   │   ├── FinancialsScreen.tsx
│   │   ├── TasksScreen.tsx
│   │   └── ScheduleScreen.tsx
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   ├── constants/           # App-wide constants
│   │   ├── theme.ts         # Color palette and design tokens
│   │   └── categories.ts    # Category and priority definitions
│   └── utils/               # Utility functions
│       └── dateUtils.ts     # Date formatting helpers
├── App.tsx                  # Root component with navigation
├── global.css               # Global styles
└── tailwind.config.js       # TailwindCSS configuration
```

## Architecture Principles

### 1. **Separation of Concerns**
- **Components**: Reusable UI elements with clear props interfaces
- **Screens**: Feature-specific views that compose components
- **Types**: Centralized type definitions for type safety
- **Constants**: Single source of truth for colors, categories, etc.
- **Utils**: Pure functions for common operations

### 2. **Type Safety**
- Strict TypeScript configuration enabled
- All components use proper type annotations
- Shared types defined in `src/types/index.ts`
- No implicit `any` types allowed

### 3. **Consistent Theming**
- Centralized color palette in `src/constants/theme.ts`
- Dark mode optimized with pastel accent colors
- Reusable design tokens (spacing, border radius, font sizes)
- All colors referenced from constants, not hardcoded

### 4. **Code Reusability**
- Shared utilities for date formatting
- Centralized category and priority definitions
- Reusable modal components
- Consistent styling patterns

## Key Features

### Financial Tracking
- Income and expense tracking
- Category-based organization
- Real-time balance calculation
- Date-grouped transaction history
- Visual category indicators with icons

### Task Management
- Priority-based task organization (Low, Medium, High)
- Task completion tracking
- Filter by status (All, Pending, Completed)
- Task statistics dashboard

### Schedule Management
- Event type categorization (Activity, Exam, Class, Other)
- Date and time tracking
- Event type statistics
- Chronological event listing

## Design System

### Color Palette
- **Background**: `#0f0f1a` (Dark)
- **Card**: `#1a1a2e` (Slightly lighter)
- **Surface**: `#252540` (Input backgrounds)
- **Pastel Accents**: Blue, Green, Red, Orange, Yellow, Purple, Pink, Teal, Coral
- **Text**: Primary (`#e8e8e8`), Secondary (`#a0a0b0`), Muted (`#6b6b80`)

### Typography
- Font sizes: xs (12px) to 3xl (30px)
- Consistent font weights: regular, medium, semibold, bold

### Spacing
- Consistent spacing scale: xs (4px) to xxl (24px)
- Border radius: sm (8px) to full (9999px)

## Best Practices

1. **Component Structure**
   - Props interfaces defined before component
   - Proper TypeScript return types (`React.JSX.Element`)
   - Descriptive variable and function names

2. **State Management**
   - Local state with `useState` for component-specific data
   - Proper state typing with TypeScript generics

3. **Performance**
   - Memoized callbacks where appropriate
   - Efficient list rendering with `FlatList`
   - Optimized re-renders

4. **Code Quality**
   - No unused imports or variables
   - Consistent code formatting
   - Meaningful comments for complex logic
   - JSDoc comments for utility functions

## Future Enhancements

- Data persistence (AsyncStorage or SQLite)
- Charts and analytics
- Export functionality
- Recurring transactions/tasks
- Notifications and reminders
- Cloud sync
- Multi-currency support
- Budget tracking


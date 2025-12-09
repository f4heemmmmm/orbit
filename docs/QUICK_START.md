# Quick Start Guide

Get up and running with Orbit development in minutes!

## Prerequisites

- Node.js 16+ installed
- npm or yarn package manager
- Code editor (VS Code recommended)
- Expo Go app on your phone (optional, for testing)

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/orbit.git
cd orbit

# Install dependencies
npm install

# Start the development server
npm start
```

## Development Workflow

### Running the App

```bash
# Start Expo development server
npm start

# Run on specific platform
npm run android    # Android emulator
npm run ios        # iOS simulator
npm run web        # Web browser
```

### Code Quality Checks

```bash
# TypeScript type checking
npx tsc --noEmit

# Check for issues
# (Use your IDE's built-in diagnostics)
```

## Project Overview

### Main Screens

1. **FinancialsScreen** (`src/screens/FinancialsScreen.tsx`)
   - Track income and expenses
   - View transaction history
   - See balance summary

2. **TasksScreen** (`src/screens/TasksScreen.tsx`)
   - Manage tasks with priorities
   - Filter by status
   - Track completion

3. **ScheduleScreen** (`src/screens/ScheduleScreen.tsx`)
   - Organize events by type
   - View chronological schedule
   - Track event statistics

### Key Directories

```
src/
├── components/       # Reusable UI components
│   └── AddTransactionModal.tsx
├── screens/          # Main app screens
│   ├── FinancialsScreen.tsx
│   ├── TasksScreen.tsx
│   └── ScheduleScreen.tsx
├── types/            # TypeScript definitions
│   └── index.ts
├── constants/        # App constants
│   ├── theme.ts
│   └── categories.ts
└── utils/            # Utility functions
    └── dateUtils.ts
```

## Common Tasks

### Adding a New Screen

1. Create file in `src/screens/YourScreen.tsx`
2. Define props interface
3. Import types from `src/types`
4. Use theme constants from `src/constants/theme`
5. Add to navigation in `App.tsx`

### Adding a New Component

1. Create file in `src/components/YourComponent.tsx`
2. Define props interface
3. Use TypeScript strict typing
4. Import and use theme constants
5. Export as default

### Using Theme Colors

```typescript
import { COLORS } from '../constants/theme';

// In your component
<View style={{ backgroundColor: COLORS.card }}>
  <Text style={{ color: COLORS.text.primary }}>Hello</Text>
</View>
```

### Using Utilities

```typescript
import { formatRelativeDate } from '../utils/dateUtils';

const displayDate = formatRelativeDate('2024-01-15');
// Returns: "Today", "Yesterday", or formatted date
```

### Adding New Types

Edit `src/types/index.ts`:

```typescript
export interface YourNewType {
  id: string;
  name: string;
  // ... other fields
}
```

## Styling Guide

### NativeWind Classes

```typescript
// Use Tailwind classes for layout
<View className="flex-1 p-4">
  <Text className="text-base font-medium">Text</Text>
</View>
```

### Inline Styles for Colors

```typescript
// Use inline styles for colors (from theme)
<Text 
  className="text-base font-medium" 
  style={{ color: COLORS.text.primary }}
>
  Text
</Text>
```

## Debugging

### Common Issues

1. **Metro bundler cache issues**
   ```bash
   npx expo start -c
   ```

2. **TypeScript errors**
   ```bash
   npx tsc --noEmit
   ```

3. **Module not found**
   ```bash
   npm install
   ```

### Development Tools

- **React DevTools**: Press `j` in Expo CLI
- **Reload**: Press `r` in Expo CLI
- **Toggle Menu**: Press `m` in Expo CLI

## Best Practices

1. ✅ Always use TypeScript types
2. ✅ Import colors from theme constants
3. ✅ Use utility functions for common operations
4. ✅ Follow existing component structure
5. ✅ Add JSDoc comments for utilities
6. ✅ Test on multiple platforms
7. ✅ Keep components focused and reusable

## Resources

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [NativeWind Docs](https://www.nativewind.dev/)
- [TypeScript Docs](https://www.typescriptlang.org/)
- [Lucide Icons](https://lucide.dev/)

## Need Help?

- Check [ARCHITECTURE.md](ARCHITECTURE.md) for detailed architecture
- See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines
- Open an issue on GitHub for bugs or questions

Happy coding! 🚀


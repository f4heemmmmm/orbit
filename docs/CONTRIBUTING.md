# Contributing to Orbit

Thank you for your interest in contributing to Orbit! This document provides guidelines and best practices for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/orbit.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test thoroughly
6. Commit your changes
7. Push to your fork
8. Create a Pull Request

## Development Guidelines

### Code Style

- **TypeScript**: Use strict typing, avoid `any`
- **Naming**: Use descriptive names for variables and functions
- **Components**: Use functional components with hooks
- **Formatting**: Follow the existing code style

### File Organization

```
src/
├── components/     # Reusable UI components
├── screens/        # Screen components
├── types/          # TypeScript type definitions
├── constants/      # Constants (theme, categories, etc.)
└── utils/          # Utility functions
```

### TypeScript Guidelines

1. **Always define types for props**:
```typescript
interface MyComponentProps {
  title: string;
  onPress: () => void;
}

export default function MyComponent({ title, onPress }: MyComponentProps): React.JSX.Element {
  // ...
}
```

2. **Use type imports from `src/types`**:
```typescript
import { Transaction, Task, ScheduleEvent } from '../types';
```

3. **Define return types for functions**:
```typescript
const calculateTotal = (items: number[]): number => {
  return items.reduce((sum, item) => sum + item, 0);
};
```

### Styling Guidelines

1. **Use theme constants**:
```typescript
import { COLORS } from '../constants/theme';

<View style={{ backgroundColor: COLORS.card }}>
```

2. **Combine NativeWind classes with inline styles**:
```typescript
<Text className="text-base font-medium" style={{ color: COLORS.text.primary }}>
```

3. **Avoid hardcoded colors** - always use theme constants

### Component Structure

```typescript
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { COLORS } from '../constants/theme';

interface MyComponentProps {
  // Props interface
}

export default function MyComponent({ prop1, prop2 }: MyComponentProps): React.JSX.Element {
  // State declarations
  const [state, setState] = useState<Type>(initialValue);

  // Event handlers
  const handleEvent = (): void => {
    // ...
  };

  // Render helpers
  const renderItem = (item: ItemType): React.JSX.Element => {
    // ...
  };

  // Main render
  return (
    <View>
      {/* Component JSX */}
    </View>
  );
}
```

### Utility Functions

- Add JSDoc comments for all utility functions
- Include parameter and return type descriptions
- Export from appropriate utility file

Example:
```typescript
/**
 * Format a date string to a human-readable format
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Formatted date string
 */
export const formatDate = (dateStr: string): string => {
  // Implementation
};
```

## Testing

Before submitting a PR:

1. Run TypeScript compiler: `npx tsc --noEmit`
2. Test on iOS simulator
3. Test on Android emulator
4. Test on web (if applicable)
5. Verify no console errors or warnings

## Commit Messages

Use clear, descriptive commit messages:

- `feat: Add new feature`
- `fix: Fix bug in component`
- `refactor: Improve code structure`
- `docs: Update documentation`
- `style: Format code`
- `chore: Update dependencies`

## Pull Request Process

1. Update documentation if needed
2. Ensure all tests pass
3. Update the README.md if adding new features
4. Request review from maintainers
5. Address review feedback promptly

## Adding New Features

When adding new features:

1. **Create types** in `src/types/index.ts`
2. **Add constants** in appropriate file in `src/constants/`
3. **Create utilities** in `src/utils/` if needed
4. **Build component** following existing patterns
5. **Update documentation**

## Questions?

Feel free to open an issue for:
- Bug reports
- Feature requests
- Questions about the codebase
- Suggestions for improvements

Thank you for contributing to Orbit! 🚀


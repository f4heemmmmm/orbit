# Orbit 🚀

A modern, feature-rich productivity app built with React Native and Expo. Orbit helps you manage your finances, tasks, and schedule all in one beautiful, dark-themed interface.

## Features

### 💰 Financial Tracking
- Track income and expenses with detailed categorization
- Visual category indicators with custom icons
- Real-time balance calculation
- Smart date grouping (Today, Yesterday, This Week, etc.)
- Beautiful pastel color scheme for dark mode

### ✅ Task Management
- Create and manage tasks with priority levels (Low, Medium, High)
- Mark tasks as complete/incomplete
- Filter tasks by status (All, Pending, Completed)
- Task statistics dashboard
- Clean, intuitive interface

### 📅 Schedule Management
- Organize events by type (Activity, Exam, Class, Other)
- Date and time tracking
- Event type statistics
- Chronological event listing
- Quick event creation

## Tech Stack

- **React Native** - Cross-platform mobile development
- **Expo SDK 54** - Development platform and tools
- **TypeScript** - Type-safe code
- **NativeWind** - TailwindCSS for React Native
- **React Navigation** - Navigation library
- **Lucide Icons** - Beautiful, consistent icons

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo Go app (for testing on physical device)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/orbit.git
cd orbit
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
- Press `a` for Android
- Press `i` for iOS simulator
- Press `w` for web
- Scan QR code with Expo Go app

## Project Structure

```
orbit/
├── src/
│   ├── components/       # Reusable UI components
│   ├── screens/          # Main app screens
│   ├── types/            # TypeScript type definitions
│   ├── constants/        # App-wide constants (theme, categories)
│   └── utils/            # Utility functions
├── App.tsx               # Root component
├── global.css            # Global styles
└── tailwind.config.js    # TailwindCSS configuration
```

## Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser

## Code Quality

This project follows industry-standard best practices:

- ✅ Strict TypeScript configuration
- ✅ No unused imports or variables
- ✅ Centralized type definitions
- ✅ Consistent theming with design tokens
- ✅ Reusable utility functions
- ✅ Proper component structure
- ✅ Clean, maintainable code

## Design System

The app uses a carefully crafted dark theme with pastel accent colors:

- **Background**: Deep dark blue (`#0f0f1a`)
- **Cards**: Slightly lighter (`#1a1a2e`)
- **Accents**: Soft pastels (blue, green, red, orange, etc.)
- **Text**: High contrast for readability

## Documentation

For detailed architecture and development guidelines, see [ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- Built with [Expo](https://expo.dev/)
- Styled with [NativeWind](https://www.nativewind.dev/)
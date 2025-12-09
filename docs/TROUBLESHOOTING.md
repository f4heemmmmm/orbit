# Troubleshooting Guide

Common issues and solutions for Orbit development.

## Expo Go Connection Issues

### "Taking much longer than it should" Error

This error occurs when Expo Go can't connect to the Metro bundler, even with good WiFi.

#### Solution 1: Use Tunnel Mode (Recommended)

Tunnel mode works through firewalls and complex network setups:

```bash
# Stop current server (Ctrl+C)
npx expo start --tunnel
```

**Note**: First time may take 1-2 minutes to establish tunnel. Be patient!

#### Solution 2: Use LAN Mode with Clear Cache

```bash
npx expo start --clear --lan
```

#### Solution 3: Ensure Same Network

1. **Check your computer's IP**: 
   - Mac: System Preferences → Network → Your WiFi → IP Address
   - Should match the IP shown in Expo (e.g., `exp://134.87.168.243:8082`)

2. **Ensure phone and computer are on the SAME WiFi network**
   - Not guest network
   - Not VPN active on either device
   - Not using mobile hotspot

#### Solution 4: Manual Connection

If QR code doesn't work:

1. In Expo Go app, tap "Enter URL manually"
2. Type the URL shown in terminal (e.g., `exp://134.87.168.243:8082`)
3. Press "Connect"

#### Solution 5: Localhost (iOS Simulator/Android Emulator Only)

For simulators/emulators on the same machine:

```bash
npx expo start --localhost
```

Then use:
- `i` for iOS simulator
- `a` for Android emulator

#### Solution 6: Check Firewall Settings

**Mac:**
1. System Preferences → Security & Privacy → Firewall
2. Click "Firewall Options"
3. Ensure "Block all incoming connections" is OFF
4. Add "node" to allowed apps if needed

**Windows:**
1. Windows Security → Firewall & network protection
2. Allow an app through firewall
3. Add Node.js to allowed apps

#### Solution 7: Restart Everything

```bash
# 1. Stop Expo server (Ctrl+C)

# 2. Clear watchman cache
watchman watch-del-all

# 3. Clear Metro bundler cache
npx expo start --clear

# 4. Restart Expo Go app on phone
# Force quit and reopen
```

#### Solution 8: Use Development Build

For persistent issues, switch to development build:

```bash
npx expo install expo-dev-client
npx expo run:ios
# or
npx expo run:android
```

## Metro Bundler Issues

### Cache Issues

```bash
# Clear all caches
npx expo start --clear

# Or manually
rm -rf node_modules
rm -rf .expo
npm install
```

### Port Already in Use

```bash
# Kill process on port 8081
lsof -ti:8081 | xargs kill -9

# Or use different port
npx expo start --port 8082
```

## TypeScript Errors

### Type Check Failing

```bash
# Run type check
npx tsc --noEmit

# If errors persist, restart TypeScript server in VS Code
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# Restart Metro bundler
npx expo start --clear
```

## Build Issues

### iOS Simulator Not Opening

```bash
# Open simulator manually
open -a Simulator

# Then in Expo terminal, press 'i'
```

### Android Emulator Not Opening

```bash
# List available emulators
emulator -list-avds

# Start specific emulator
emulator -avd <emulator_name>

# Then in Expo terminal, press 'a'
```

## Performance Issues

### Slow Bundling

```bash
# Clear cache and restart
npx expo start --clear

# Check for large files in project
du -sh * | sort -h
```

### App Running Slow

1. Enable Fast Refresh: Should be on by default
2. Reduce console.log statements
3. Check for memory leaks in components
4. Use React DevTools to profile

## Network Debugging

### Check Connection

```bash
# Ping your computer from phone's browser
# Visit: http://YOUR_COMPUTER_IP:8082
# Should see "Metro is running"
```

### Check Firewall

```bash
# Mac - temporarily disable firewall to test
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off

# Remember to re-enable after testing!
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on
```

## Still Having Issues?

1. **Check Expo Status**: https://status.expo.dev/
2. **Update Expo**: `npm install expo@latest`
3. **Update Expo Go**: Update app from App Store/Play Store
4. **Check Logs**: Look for errors in terminal output
5. **GitHub Issues**: Search existing issues or create new one

## Quick Fixes Checklist

- [ ] Computer and phone on same WiFi
- [ ] No VPN active
- [ ] Firewall allows Node.js
- [ ] Expo Go app is updated
- [ ] Metro bundler is running
- [ ] Tried clearing cache (`--clear`)
- [ ] Tried tunnel mode (`--tunnel`)
- [ ] Restarted Expo Go app
- [ ] Restarted computer

## Contact

If none of these solutions work, please open an issue with:
- Error message
- Terminal output
- Device info (iOS/Android version)
- Network setup (home WiFi, corporate, etc.)


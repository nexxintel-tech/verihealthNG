# VeriHealth Mobile (Expo)

Scaffolded Expo-managed app wired to `@verihealth/common`.

Run locally:

```bash
# from repo root
npm install
npm run dev:mobile

# or run directly from workspace
cd apps/mobile
npm install
npm start
```

Notes:
- This workspace uses `@react-native-async-storage/async-storage` as the storage
  adapter. Install native dep via `expo install @react-native-async-storage/async-storage`.
- The `AuthClient` from `@verihealth/common` is used with the React Native adapter in
  `src/storageAdapter.ts` to ensure auth parity with the web app.

Native capabilities (BLE, background tasks, Hermes)
-----------------------------------------------

This repo prefers an Expo prebuild-managed flow (no manual Xcode/Gradle edits).

1. Install packages:

```bash
cd apps/mobile
npm install
expo install @react-native-async-storage/async-storage
npm install react-native-ble-plx expo-task-manager expo-background-fetch expo-dev-client --save
```

2. Prebuild native projects and enable native plugins:

```bash
cd apps/mobile
npx expo prebuild --platform android --clean
npx expo prebuild --platform ios --clean
```

3. Build or run custom dev client (recommended for native APIs):

```bash
# Build dev client for Android
eas build --profile development --platform android
# then install on device/emulator
```

Notes:
- `react-native-ble-plx` requires additional Android/iOS runtime permissions; `app.json` already includes necessary permissions and Info.plist entries.
- Hermes is enabled in `app.json` for both platforms; after prebuild, confirm `android/gradle.properties` and iOS Podfile reflect Hermes settings.
- Keep to prebuild-managed configs; do not switch to bare workflow unless a plugin is unavailable.


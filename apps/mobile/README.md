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

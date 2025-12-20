import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import type { StorageAdapter } from '@verihealth/common';

// SecureAuthAdapter: stores auth token in SecureStore, user profile in AsyncStorage.
// This preserves AuthClient API while ensuring secrets are stored securely on device.

const TOKEN_KEY = 'verihealth_auth_token';
const USER_KEY = 'verihealth_user';

export const SecureAuthAdapter: StorageAdapter = {
  async getItem(key: string) {
    if (key === TOKEN_KEY) {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    }
    return await AsyncStorage.getItem(key);
  },
  async setItem(key: string, value: string) {
    if (key === TOKEN_KEY) {
      await SecureStore.setItemAsync(TOKEN_KEY, value, { keychainAccessible: SecureStore.ALWAYS_THIS_DEVICE_ONLY });
      return;
    }
    await AsyncStorage.setItem(key, value);
  },
  async removeItem(key: string) {
    if (key === TOKEN_KEY) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      return;
    }
    await AsyncStorage.removeItem(key);
  },
};

export default SecureAuthAdapter;

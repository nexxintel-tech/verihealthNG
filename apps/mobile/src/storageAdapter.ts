import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StorageAdapter } from '@verihealth/common';

export const ReactNativeAsyncStorageAdapter: StorageAdapter = {
  async getItem(key: string) {
    return await AsyncStorage.getItem(key);
  },
  async setItem(key: string, value: string) {
    await AsyncStorage.setItem(key, value);
  },
  async removeItem(key: string) {
    await AsyncStorage.removeItem(key);
  },
};

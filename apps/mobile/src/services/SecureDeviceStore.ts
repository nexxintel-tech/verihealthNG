import * as SecureStore from 'expo-secure-store';

// SecureDeviceStore stores device_id and device_secret in the OS secure storage.
// It never exposes secrets to logs and avoids AsyncStorage.

const DEVICE_ID_KEY = 'veri_device_id_v1';
const DEVICE_SECRET_KEY = 'veri_device_secret_v1';

export const SecureDeviceStore = {
  async setDeviceCredentials(deviceId: string, deviceSecret: string) {
    // use SecureStore with authentication if available
    await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId, { keychainAccessible: SecureStore.ALWAYS_THIS_DEVICE_ONLY });
    await SecureStore.setItemAsync(DEVICE_SECRET_KEY, deviceSecret, { keychainAccessible: SecureStore.ALWAYS_THIS_DEVICE_ONLY });
  },

  async getDeviceId(): Promise<string | null> {
    return await SecureStore.getItemAsync(DEVICE_ID_KEY);
  },

  async getDeviceSecret(): Promise<string | null> {
    return await SecureStore.getItemAsync(DEVICE_SECRET_KEY);
  },

  async clear() {
    await SecureStore.deleteItemAsync(DEVICE_ID_KEY);
    await SecureStore.deleteItemAsync(DEVICE_SECRET_KEY);
  }
};

export default SecureDeviceStore;

import { SecureDeviceStore } from './SecureDeviceStore';
import { v4 as uuidv4 } from 'uuid';

// DeviceProvisioningService calls the backend to create a device entry
// and stores the returned device_id and device_secret in secure storage.

const CREATE_ENDPOINT = process.env.EXPO_PUBLIC_DEVICE_CREATE || 'https://<your-supabase-edge>/wearable_device_manager/create';

export const DeviceProvisioningService = {
  async provisionNewDevice(authHeaders: HeadersInit): Promise<{ deviceId: string } | null> {
    // call the create endpoint with auth headers from AuthClient
    const body = { client_generated_id: uuidv4() };
    const res = await fetch(CREATE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(authHeaders as any) },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      // Do not log secrets or response body containing secrets; only show status
      console.warn('device provisioning failed', res.status);
      return null;
    }

    const data = await res.json();
    // expected shape: { device_id: string, device_secret: string }
    if (!data || !data.device_id || !data.device_secret) return null;

    await SecureDeviceStore.setDeviceCredentials(data.device_id, data.device_secret);
    return { deviceId: data.device_id };
  },

  async getProvisionedDeviceId(): Promise<string | null> {
    return await SecureDeviceStore.getDeviceId();
  }
};

export default DeviceProvisioningService;

import { dequeueBatch, markUploaded } from './queue';
import { buildSyncPayload } from '@verihealth/common';
import { SecureDeviceStore } from '../services/SecureDeviceStore';
import { signPayloadHex } from '../services/Signer';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EDGE_URL = process.env.EXPO_PUBLIC_INGEST_URL || 'https://<your-supabase-edge>/functions/v1/ingest_wearable_data';

export async function runForegroundSync(retries = 3): Promise<{ success: boolean; processed?: number; error?: string }> {
  try {
    const batch = await dequeueBatch(200);
    if (!batch || batch.length === 0) return { success: true, processed: 0 };

    const deviceSecret = await SecureDeviceStore.getDeviceSecret();
    if (!deviceSecret) return { success: false, error: 'no_device_secret' };

    const payload = buildSyncPayload(batch as any);

    // include timestamp and signature headers
    const timestamp = new Date().toISOString();
    const signature = signPayloadHex(deviceSecret, payload, timestamp);

    let attempt = 0;
    while (attempt < retries) {
      try {
        const res = await fetch(EDGE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-veri-timestamp': timestamp,
            'x-veri-signature': signature,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const text = await res.text();
          // do not log secrets or payload
          attempt++;
          const backoff = Math.pow(2, attempt) * 500;
          await new Promise((r) => setTimeout(r, backoff));
          if (attempt >= retries) return { success: false, error: `upload_failed_status_${res.status}` };
          continue;
        }

        const ids = batch.map((r) => r.id);
        await markUploaded(ids);
        // persist last sync timestamp (non-secret storage)
        try {
          await AsyncStorage.setItem('veri_last_sync', new Date().toISOString());
        } catch {
          // ignore storage errors
        }
        return { success: true, processed: ids.length };
      } catch (e) {
        attempt++;
        const backoff = Math.pow(2, attempt) * 500;
        await new Promise((r) => setTimeout(r, backoff));
        if (attempt >= retries) return { success: false, error: 'network_error' };
      }
    }

    return { success: false, error: 'max_retries_exceeded' };
  } catch (e) {
    return { success: false, error: 'unexpected_error' };
  }
}

import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { dequeueBatch, markUploaded } from './queue';
import { buildSyncPayload } from '@verihealth/common';
import { SecureDeviceStore } from '../services/SecureDeviceStore';
import { signPayloadHex } from '../services/Signer';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TASK_NAME = 'VERIHEALTH_SYNC_TASK';
const EDGE_URL = process.env.EXPO_PUBLIC_INGEST_URL || 'https://<your-supabase-edge>/functions/v1/ingest_wearable_data';

export async function registerBackgroundSync() {
  await BackgroundFetch.registerTaskAsync(TASK_NAME, {
    minimumInterval: 60 * 5, // 5 minutes
    stopOnTerminate: false,
    startOnBoot: true,
  });
}

TaskManager.defineTask(TASK_NAME, async () => {
  try {
    const batch = await dequeueBatch(200);
    if (!batch || batch.length === 0) return BackgroundFetch.Result.NoData;

    const payload = buildSyncPayload(batch as any);

    // Fetch device secret from secure store and sign payload.
    const deviceSecret = await SecureDeviceStore.getDeviceSecret();
    if (!deviceSecret) {
      console.warn('no device secret available for signing');
      return BackgroundFetch.Result.Failed;
    }

    const timestamp = new Date().toISOString();
    const signature = signPayloadHex(deviceSecret, payload, timestamp);

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
      console.warn('Edge ingest failed', await res.text());
      return BackgroundFetch.Result.Failed;
    }

    const ids = batch.map((r) => r.id);
    await markUploaded(ids);
    try {
      await AsyncStorage.setItem('veri_last_sync', new Date().toISOString());
    } catch {}
    return BackgroundFetch.Result.NewData;
  } catch (e) {
    console.warn('background sync error', e);
    return BackgroundFetch.Result.Failed;
  }
});

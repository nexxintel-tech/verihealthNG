import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { dequeueBatch, markUploaded } from './queue';
import { buildSyncPayload } from '@verihealth/common';

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
    const res = await fetch(EDGE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.warn('Edge ingest failed', await res.text());
      return BackgroundFetch.Result.Failed;
    }

    const ids = batch.map((r) => r.id);
    await markUploaded(ids);
    return BackgroundFetch.Result.NewData;
  } catch (e) {
    console.warn('background sync error', e);
    return BackgroundFetch.Result.Failed;
  }
});

export interface WearableReading {
  id: string; // device-provided id or generated uuid
  deviceId: string;
  type: string; // e.g., 'heart_rate', 'steps', 'rr_interval'
  value: number;
  unit?: string;
  timestamp: string; // ISO string
}

export interface WearableSyncPayload {
  readings: WearableReading[];
  uploadedAt?: string;
}

export function buildSyncPayload(readings: WearableReading[]): WearableSyncPayload {
  return {
    readings,
    uploadedAt: new Date().toISOString(),
  };
}

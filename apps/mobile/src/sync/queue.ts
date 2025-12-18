import type { WearableReading } from '@verihealth/common';

// Local queue backed by SQLite. This file provides a lightweight wrapper
// that uses `expo-sqlite` when available. Install `expo-sqlite` before use.

let db: any = null;
try {
  // runtime import to avoid requiring expo packages in non-native environments
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const SQLite = require('expo-sqlite');
  db = SQLite.openDatabase('verihealth_sync.db');
} catch (e) {
  // db left null in unit-test or web environments
}

export async function initQueue(): Promise<void> {
  if (!db) return;
  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS readings (
          id TEXT PRIMARY KEY,
          deviceId TEXT,
          type TEXT,
          value REAL,
          unit TEXT,
          timestamp TEXT,
          uploaded INTEGER DEFAULT 0
        );`,
        [],
        () => resolve(),
        (_t: any, err: any) => { reject(err); return false; }
      );
    });
  });
}

export async function enqueueReading(r: WearableReading): Promise<void> {
  if (!db) return;
  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      tx.executeSql(
        `INSERT OR REPLACE INTO readings (id, deviceId, type, value, unit, timestamp, uploaded) VALUES (?, ?, ?, ?, ?, ?, 0);`,
        [r.id, r.deviceId, r.type, r.value, r.unit ?? null, r.timestamp],
        () => resolve(),
        (_t: any, err: any) => { reject(err); return false; }
      );
    });
  });
}

export async function dequeueBatch(limit = 200): Promise<WearableReading[]> {
  if (!db) return [];
  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      tx.executeSql(
        `SELECT id, deviceId, type, value, unit, timestamp FROM readings WHERE uploaded = 0 ORDER BY timestamp ASC LIMIT ?;`,
        [limit],
        (_t: any, result: any) => {
          const rows = result.rows._array || [];
          resolve(rows as WearableReading[]);
        },
        (_t: any, err: any) => { reject(err); return false; }
      );
    });
  });
}

export async function markUploaded(ids: string[]): Promise<void> {
  if (!db || ids.length === 0) return;
  const placeholders = ids.map(() => '?').join(',');
  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      tx.executeSql(
        `UPDATE readings SET uploaded = 1 WHERE id IN (${placeholders});`,
        ids,
        () => resolve(),
        (_t: any, err: any) => { reject(err); return false; }
      );
    });
  });
}

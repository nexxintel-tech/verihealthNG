import { BleManager, Device } from 'react-native-ble-plx';
import { enqueueReading } from './queue';
import type { WearableReading } from '@verihealth/common';
import { v4 as uuidv4 } from 'uuid';
import { SecureDeviceStore } from '../services/SecureDeviceStore';
import { BLEService } from '../services/BLEService';

const manager = new BleManager();

export async function startScanAndCollect(serviceUUIDs: string[] = []) {
  manager.startDeviceScan(serviceUUIDs, null, (err, device) => {
    if (err) {
      // handle error (permissions, etc.)
      console.warn('BLE scan error', err);
      return;
    }

    if (!device) return;

    // Example: for a known device we can connect and read characteristics
    // For demo, enqueue a synthetic reading when device is discovered
    // Only track devices that match the provisioned device id, if present.
    (async () => {
      const provisionedId = await SecureDeviceStore.getDeviceId();
      const deviceId = device.id;
      if (provisionedId && provisionedId !== deviceId) return;

      const reading: WearableReading = {
        id: uuidv4(),
        deviceId: deviceId,
        type: 'device_discovered',
        value: 1,
        unit: 'count',
        timestamp: new Date().toISOString(),
      };

      enqueueReading(reading).catch((e) => console.warn('enqueue failed', e));
    })();
  });
}

export function stopScan() {
  manager.stopDeviceScan();
}

export async function connectAndRead(deviceId: string): Promise<void> {
  try {
    const device: Device = await manager.connectToDevice(deviceId);
    BLEService.setConnected(deviceId);
    await device.discoverAllServicesAndCharacteristics();

    // Implement characteristic reads according to JointCorp V4/V5 specs
    // Placeholder: create a synthetic reading
    const r: WearableReading = {
      id: uuidv4(),
      deviceId,
      type: 'heart_rate',
      value: Math.floor(60 + Math.random() * 40),
      unit: 'bpm',
      timestamp: new Date().toISOString(),
    };
    await enqueueReading(r);
    await manager.cancelDeviceConnection(deviceId);
    BLEService.setConnected(null);
  } catch (e) {
    console.warn('connect/read failed', e);
    BLEService.setConnected(null);
  }
}

// Auto-connect to provisioned device: starts a scan and connects when the
// provisioned `deviceId` is observed. This helps pair and maintain a single
// device connection without user selecting devices manually.

let _autoConnecting = false;

export async function startAutoConnect(serviceUUIDs: string[] = []) {
  if (_autoConnecting) return;
  _autoConnecting = true;

  const provisionedId = await SecureDeviceStore.getDeviceId();
  if (!provisionedId) {
    // nothing to auto-connect to
    _autoConnecting = false;
    return;
  }

  manager.startDeviceScan(serviceUUIDs, null, async (err, device) => {
    if (!_autoConnecting) return;
    if (err) {
      console.warn('BLE scan error', err);
      return;
    }
    if (!device) return;

    try {
      // match by id only; do not inspect or log any secrets
      if (device.id === provisionedId) {
        // stop scanning while connecting
        manager.stopDeviceScan();
        try {
          await connectAndRead(device.id);
        } catch (e) {
          // connectAndRead logs its own errors
        } finally {
          // resume scanning to detect reconnects if still auto-connecting
          if (_autoConnecting) {
            // small delay before restarting scan to avoid tight loop
            setTimeout(() => manager.startDeviceScan(serviceUUIDs, null, () => {}), 1000);
          }
        }
      }
    } catch (e) {
      // swallow errors to avoid crashing the scan callback
    }
  });
}

export function stopAutoConnect() {
  _autoConnecting = false;
  try {
    manager.stopDeviceScan();
  } catch {}
}

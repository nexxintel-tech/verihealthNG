import { BleManager, Device } from 'react-native-ble-plx';
import { enqueueReading } from './queue';
import type { WearableReading } from '@verihealth/common';
import { v4 as uuidv4 } from 'uuid';

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
    const reading: WearableReading = {
      id: uuidv4(),
      deviceId: device.id,
      type: 'device_discovered',
      value: 1,
      unit: 'count',
      timestamp: new Date().toISOString(),
    };

    enqueueReading(reading).catch((e) => console.warn('enqueue failed', e));
  });
}

export function stopScan() {
  manager.stopDeviceScan();
}

export async function connectAndRead(deviceId: string): Promise<void> {
  try {
    const device: Device = await manager.connectToDevice(deviceId);
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
  } catch (e) {
    console.warn('connect/read failed', e);
  }
}

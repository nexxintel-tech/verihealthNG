import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { BLEService } from '../services/BLEService';
import { startAutoConnect, stopAutoConnect } from '../sync/bleSync';
import { SecureDeviceStore } from '../services/SecureDeviceStore';

export default function Pairing() {
  const [provisionedId, setProvisionedId] = useState<string | null>(null);
  const [connected, setConnected] = useState<string | null>(null);
  const [autoActive, setAutoActive] = useState(false);

  useEffect(() => {
    (async () => {
      const id = await SecureDeviceStore.getDeviceId();
      setProvisionedId(id);
    })();

    const unsub = BLEService.subscribe((s) => setConnected(s.connectedDeviceId));
    return () => unsub();
  }, []);

  const handleStart = async () => {
    if (!provisionedId) return;
    try {
      await startAutoConnect();
      setAutoActive(true);
    } catch (e) {
      console.warn('startAutoConnect failed', e);
    }
  };

  const handleStop = async () => {
    try {
      stopAutoConnect();
      setAutoActive(false);
    } catch (e) {
      console.warn('stopAutoConnect failed', e);
    }
  };

  return (
    <View style={{ padding: 12, alignItems: 'center' }}>
      <Text style={{ fontWeight: '600', marginBottom: 6 }}>Pairing</Text>
      <Text style={{ marginBottom: 6 }}>{provisionedId ? `Provisioned device: ${provisionedId}` : 'No device provisioned'}</Text>
      <Text style={{ marginBottom: 6 }}>{connected ? `Connected: ${connected}` : 'Not connected'}</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button title={autoActive ? 'Auto-Connect Running' : 'Start Auto-Connect'} onPress={handleStart} disabled={!provisionedId || autoActive} />
        <View style={{ width: 12 }} />
        <Button title="Stop" onPress={handleStop} disabled={!autoActive} />
      </View>
    </View>
  );
}

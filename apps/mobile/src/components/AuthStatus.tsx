import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthClient } from '@verihealth/common';
import { SecureAuthAdapter } from '../storage/SecureAuthAdapter';
import { BLEService } from '../services/BLEService';

const auth = new AuthClient(SecureAuthAdapter);

export default function AuthStatus() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [connectedDevice, setConnectedDevice] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const u = await auth.getUser();
        if (u) setUser({ id: u.id, email: u.email });
      } catch {}
      try {
        const ls = await AsyncStorage.getItem('veri_last_sync');
        setLastSync(ls);
      } catch {}
    })();

    const unsub = BLEService.subscribe((s) => setConnectedDevice(s.connectedDeviceId));
    return () => unsub();
  }, []);

  return (
    <View style={{ padding: 12, alignItems: 'center' }}>
      <Text style={{ fontWeight: '600' }}>{user ? `User: ${user.email}` : 'Not signed in'}</Text>
      <Text>{connectedDevice ? `Device: ${connectedDevice} (connected)` : 'No device connected'}</Text>
      <Text>{lastSync ? `Last sync: ${new Date(lastSync).toLocaleString()}` : 'No sync yet'}</Text>
    </View>
  );
}

import React, { useEffect, useState } from 'react';
import { Text, View, Button } from 'react-native';
import { AuthClient } from '@verihealth/common';
import { ReactNativeAsyncStorageAdapter } from './storageAdapter';

const auth = new AuthClient(ReactNativeAsyncStorageAdapter);

export default function App() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const ok = await auth.isAuthenticated();
      setAuthenticated(ok);
    })();
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 12 }}>VeriHealth Mobile (Expo)</Text>
      {authenticated === null ? (
        <Text>Checking auth...</Text>
      ) : authenticated ? (
        <Text>Signed in</Text>
      ) : (
        <Text>Not signed in</Text>
      )}
      <View style={{ marginTop: 16 }}>
        <Button title="Open Login (TODO)" onPress={() => {}} />
      </View>
    </View>
  );
}

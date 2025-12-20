import React, { useEffect, useState } from 'react';
import { Text, View, Button, Alert, Linking } from 'react-native';
import { AuthClient } from '@verihealth/common';
import { ReactNativeAsyncStorageAdapter } from './storageAdapter';
import { SecureAuthAdapter } from './storage/SecureAuthAdapter';
import Login from './components/Login';
import { DeviceProvisioningService } from './services/DeviceProvisioningService';
import AuthStatus from './components/AuthStatus';
import Pairing from './components/Pairing';
import { startAutoConnect } from './sync/bleSync';

const auth = new AuthClient(SecureAuthAdapter);

export default function App() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    (async () => {
      const ok = await auth.isAuthenticated();
      setAuthenticated(ok);
      if (ok) {
        // initialize queue and background sync when signed in
        try {
          const { initQueue } = await import('./sync/queue');
          await initQueue();
          const { registerBackgroundSync } = await import('./sync/background');
          await registerBackgroundSync();
          // start auto-connect to provisioned device when app is authenticated
          try {
            await startAutoConnect();
          } catch (e) {
            console.warn('auto-connect failed to start', e);
          }
        } catch (e) {
          console.warn('init failed', e);
        }
      }
    })();

    // listen for deep link redirects from Supabase auth (magic link / OAuth)
        const sub = Linking.addEventListener('url', async ({ url }) => {
      try {
        const { handleDeepLink } = await import('./lib/supabase');
        const res = await handleDeepLink(url);
        if (res && res.access_token) {
          // persist to AuthClient
          await auth.setAuthToken(res.access_token);
          if (res.user) await auth.setUser(res.user);
          setAuthenticated(true);
          // initialize queue/background after sign-in
          const { initQueue } = await import('./sync/queue');
          await initQueue();
          const { registerBackgroundSync } = await import('./sync/background');
          await registerBackgroundSync();
              try {
                await startAutoConnect();
              } catch (e) {
                console.warn('auto-connect failed after deep-link sign-in', e);
              }
        }
      } catch (e) {
        console.warn('deep link handling failed', e);
      }
    });

    // handle case where app was opened via link at startup
    (async () => {
      try {
        const initial = await Linking.getInitialURL();
        if (initial) {
          const { handleDeepLink } = await import('./lib/supabase');
          const res = await handleDeepLink(initial);
          if (res && res.access_token) {
            await auth.setAuthToken(res.access_token);
            if (res.user) await auth.setUser(res.user);
            setAuthenticated(true);
            try {
              await startAutoConnect();
            } catch (e) {
              console.warn('auto-connect failed on initial deep-link', e);
            }
          }
        }
      } catch (e) {
        /* ignore */
      }
    })();

    return () => sub.remove();
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
        {authenticated ? (
          <>
            <Button
              title="Provision Device (demo)"
              onPress={async () => {
                try {
                  const headers = await auth.getAuthHeaders();
                  const r = await DeviceProvisioningService.provisionNewDevice(headers);
                  if (r) {
                    Alert.alert('Device provisioned', r.deviceId);
                    try {
                      await startAutoConnect();
                    } catch (e) {
                      console.warn('auto-connect failed after provisioning', e);
                    }
                  }
                  else Alert.alert('Provisioning failed');
                } catch (e) {
                  console.warn('provision failed', e);
                  Alert.alert('Provision failed');
                }
              }}
            />
            <View style={{ height: 12 }} />
            <Button
              title="Sync Now"
              onPress={async () => {
                try {
                  const { runForegroundSync } = await import('./sync/foreground');
                  const res = await runForegroundSync(3);
                  if (res.success) Alert.alert('Sync complete', `Processed ${res.processed ?? 0}`);
                  else Alert.alert('Sync failed', res.error ?? 'unknown');
                } catch (e) {
                  console.warn('sync error', e);
                  Alert.alert('Sync error');
                }
              }}
            />
          </>
        ) : (
          <Button title="Open Login" onPress={() => setShowLogin(true)} />
        )}
      </View>
      <View style={{ marginTop: 24 }}>
        <AuthStatus />
      </View>
      <View style={{ marginTop: 12 }}>
        <Pairing />
      </View>
      {showLogin && (
        <View style={{ position: 'absolute', top: 80, left: 20, right: 20, backgroundColor: 'white', elevation: 4 }}>
          <Login onSignedIn={() => setShowLogin(false)} />
        </View>
      )}
    </View>
  );
}

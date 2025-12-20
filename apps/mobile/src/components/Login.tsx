import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';
import SupabaseService from '../lib/supabase';

export default function Login({ onSignedIn }: { onSignedIn?: () => void }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email) return Alert.alert('Enter email');
    setLoading(true);
    try {
      const res = await SupabaseService.signInWithEmail(email);
      // We don't persist session here until magic link completes; inform user.
      Alert.alert('Check your email', 'A sign-in link or code has been sent to your email.');
      if (onSignedIn) onSignedIn();
    } catch (e) {
      console.warn('signin error', e);
      Alert.alert('Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ marginBottom: 8 }}>Sign in with email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        style={{ borderWidth: 1, padding: 8, marginBottom: 12 }}
      />
      <Button title={loading ? 'Sending...' : 'Send Sign-in Link'} onPress={handleSignIn} disabled={loading} />
    </View>
  );
}

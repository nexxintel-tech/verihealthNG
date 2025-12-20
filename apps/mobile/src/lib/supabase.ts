import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// Minimal Supabase wrapper for mobile. Stores access/refresh tokens in SecureStore
// and exposes `getAuthHeaders()` and `getUserId()` for other services.

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '<your-supabase-url>';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '<your-anon-key>';

let client: SupabaseClient | null = null;

const ACCESS_KEY = 'supabase_access_token_v1';
const REFRESH_KEY = 'supabase_refresh_token_v1';

export const SupabaseService = {
  init() {
    if (client) return client;
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    return client;
  },

  async signInWithEmail(email: string) {
    const c = this.init();
    const res = await c.auth.signInWithOtp({ email });
    // note: OTP/magic link flows will complete outside this function when user clicks link
    return res;
  },

  async setSession(session: any) {
    // session: { access_token, refresh_token }
    if (session?.access_token) await SecureStore.setItemAsync(ACCESS_KEY, session.access_token, { keychainAccessible: SecureStore.ALWAYS_THIS_DEVICE_ONLY });
    if (session?.refresh_token) await SecureStore.setItemAsync(REFRESH_KEY, session.refresh_token, { keychainAccessible: SecureStore.ALWAYS_THIS_DEVICE_ONLY });
    // also set session on the supabase-js client so subsequent calls work
    try {
      const c = this.init();
      if (c && session?.access_token) {
        await c.auth.setSession({ access_token: session.access_token, refresh_token: session.refresh_token });
      }
    } catch (e) {
      // do not expose tokens in logs
      console.warn('supabase setSession failed');
    }
  },

  async clearSession() {
    await SecureStore.deleteItemAsync(ACCESS_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
  },

  async getAuthHeaders(): Promise<HeadersInit | null> {
    const token = await SecureStore.getItemAsync(ACCESS_KEY);
    if (!token) return null;
    return { Authorization: `Bearer ${token}` };
  },

  // Handle deep-link callback from Supabase magic-link / OAuth redirect.
  // Parses URL fragment for access_token/refresh_token and establishes local session.
  async handleDeepLink(url: string): Promise<{ access_token?: string; user?: any } | null> {
    try {
      if (!url) return null;
      // Supabase returns tokens in fragment (#access_token=...&refresh_token=...)
      const parts = url.split('#');
      if (parts.length < 2) return null;
      const frag = parts[1];
      const params = new URLSearchParams(frag);
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      if (!access_token) return null;

      // Persist tokens securely and set session on client
      await this.setSession({ access_token, refresh_token });

      const c = this.init();
      // ensure client has session and get user
      try {
        const userRes = await c.auth.getUser();
        const user = userRes?.data ?? null;
        return { access_token, user };
      } catch {
        return { access_token, user: null };
      }
    } catch (e) {
      return null;
    }
  },

  async getUserId(): Promise<string | null> {
    // Attempt to call /user endpoint using stored token
    const headers = await this.getAuthHeaders();
    if (!headers) return null;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_user_id`, { method: 'GET', headers });
      if (!res.ok) return null;
      const data = await res.json();
      return data?.id ?? null;
    } catch {
      return null;
    }
  }
};

export default SupabaseService;

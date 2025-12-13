import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function createSupabaseClient(url: string, anonKey: string): SupabaseClient {
  if (!url || !anonKey) {
    throw new Error('Supabase URL and anon key are required to create client');
  }

  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}

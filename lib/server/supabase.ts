import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | undefined;

// Uses the secret key, so this must only run on the server (Netlify functions
// and the build script). RLS is enabled on the tables with no policies.
export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET;
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SECRET must be set.');
  }

  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

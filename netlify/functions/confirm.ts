import { siteUrl } from '../../lib/server/config';
import { isUuid, redirect, type HttpEvent } from '../../lib/server/http';
import { getSupabase } from '../../lib/server/supabase';

export const handler = async (event: HttpEvent) => {
  const token = event.queryStringParameters?.token;
  const base = `${siteUrl()}/issues`;

  if (!isUuid(token)) return redirect(`${base}?subscription=invalid`);

  const { data, error } = await getSupabase()
    .from('subscribers')
    .update({ confirmed_at: new Date().toISOString() })
    .eq('confirm_token', token)
    .is('confirmed_at', null)
    .select('id');
  if (error) throw error;

  // Already confirmed or unknown token both land here; only the first
  // click changes anything.
  return redirect(`${base}?subscription=${data && data.length ? 'confirmed' : 'invalid'}`);
};

import { siteUrl } from '../../lib/server/config';
import { isUuid, redirect, type HttpEvent } from '../../lib/server/http';
import { getSupabase } from '../../lib/server/supabase';

export const handler = async (event: HttpEvent) => {
  const token = event.queryStringParameters?.token;
  const base = `${siteUrl()}/issues`;

  if (!isUuid(token)) return redirect(`${base}?unsubscribed=invalid`);

  const { data, error } = await getSupabase()
    .from('subscribers')
    .delete()
    .eq('unsubscribe_token', token)
    .select('id');
  if (error) throw error;

  return redirect(`${base}?unsubscribed=${data && data.length ? 'done' : 'invalid'}`);
};

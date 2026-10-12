import { getMailer } from '../../lib/mailer';
import { confirmationEmail } from '../../lib/mailer/messages';
import { siteUrl } from '../../lib/server/config';
import { isValidEmail, json, normalizeEmail, parseJsonBody, text, type HttpEvent } from '../../lib/server/http';
import { getSupabase } from '../../lib/server/supabase';

// Same message whether or not the address already exists, so the form
// cannot be used to check who is subscribed.
const CHECK_INBOX = 'Check your inbox and confirm your subscription.';

export const handler = async (event: HttpEvent) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed.' });
  }

  const body = parseJsonBody(event.body);
  if (!body) return json(400, { error: 'Invalid request.' });

  // Honeypot: real visitors leave the hidden "website" field empty.
  if (text(body.website, 200)) return json(200, { message: CHECK_INBOX });

  const email = normalizeEmail(text(body.email, 254));
  if (!isValidEmail(email)) {
    return json(400, { error: 'Please enter a valid email address.' });
  }

  const supabase = getSupabase();
  const { data: existing, error: lookupError } = await supabase
    .from('subscribers')
    .select('confirm_token, confirmed_at')
    .eq('email', email)
    .maybeSingle();
  if (lookupError) throw lookupError;

  if (existing?.confirmed_at) return json(200, { message: CHECK_INBOX });

  let confirmToken = existing?.confirm_token as string | undefined;
  if (!confirmToken) {
    const { data: created, error: insertError } = await supabase
      .from('subscribers')
      .insert({ email })
      .select('confirm_token')
      .single();
    if (insertError) throw insertError;
    confirmToken = created.confirm_token as string;
  }

  const confirmUrl = `${siteUrl()}/.netlify/functions/confirm?token=${confirmToken}`;
  await getMailer().send({ to: email, ...confirmationEmail({ confirmUrl }) });

  return json(200, { message: CHECK_INBOX });
};

// Runs after the site build. Emails each published issue that has
// "sendEmail" checked to confirmed subscribers, once per issue.
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { getMailer } from '../lib/mailer';
import { issueEmail, type IssueFrontmatter } from '../lib/mailer/messages';
import { siteUrl } from '../lib/server/config';
import { getSupabase } from '../lib/server/supabase';

async function main() {
  // Only the live production deploy sends email. Deploy previews, branch
  // deploys and local builds skip it, unless SEND_NEWSLETTERS=true is set.
  const context = process.env.CONTEXT; // set by Netlify
  if (context !== 'production' && process.env.SEND_NEWSLETTERS !== 'true') {
    console.log(`[newsletter] Skipping email (build context: ${context ?? 'local'}).`);
    return;
  }

  const dir = path.join(process.cwd(), 'content', 'newsletters');
  const files = (await readdir(dir)).filter((file) => file.endsWith('.mdx'));
  const supabase = getSupabase();
  const mailer = getMailer();
  const base = siteUrl();

  for (const file of files) {
    const slug = file.replace(/\.mdx$/, '');
    const { data } = matter(await readFile(path.join(dir, file), 'utf8'));
    const issue = data as IssueFrontmatter & { published?: boolean; sendEmail?: boolean };

    if (!issue.published || !issue.sendEmail) continue;

    const { data: alreadySent, error: sentError } = await supabase
      .from('newsletter_sends')
      .select('issue_slug')
      .eq('issue_slug', slug)
      .maybeSingle();
    if (sentError) throw sentError;
    if (alreadySent) {
      console.log(`[newsletter] ${slug}: already emailed, skipping.`);
      continue;
    }

    const { data: subscribers, error: subError } = await supabase
      .from('subscribers')
      .select('email, unsubscribe_token')
      .not('confirmed_at', 'is', null);
    if (subError) throw subError;

    let sent = 0;
    let failed = 0;
    for (const subscriber of subscribers ?? []) {
      try {
        await mailer.send({
          to: subscriber.email as string,
          ...issueEmail({
            issue,
            issueUrl: `${base}/issues/${slug}`,
            unsubscribeUrl: `${base}/.netlify/functions/unsubscribe?token=${subscriber.unsubscribe_token}`,
          }),
        });
        sent++;
      } catch (error) {
        failed++;
        console.error(`[newsletter] ${slug}: failed for one recipient`, error);
      }
    }

    // Recorded after the attempt so a rebuild never re-sends the same issue.
    // Recipients that failed are listed in the log and need a manual resend.
    const { error: recordError } = await supabase
      .from('newsletter_sends')
      .insert({ issue_slug: slug, recipient_count: sent });
    if (recordError) throw recordError;

    console.log(`[newsletter] ${slug}: sent to ${sent}, failed ${failed}.`);
  }
}

main().catch((error) => {
  // Logged but not fatal, so a mail problem does not block the site deploy.
  console.error('[newsletter] Sending failed:', error);
});

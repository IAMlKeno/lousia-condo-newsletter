import { NEWSPAPER_NAME } from '../newsletter';

export type IssueFrontmatter = {
  title: string;
  edition?: string;
  issueDate?: string | Date;
  summary?: string;
  updates?: { headline?: string }[];
  decisions?: { title?: string; deadline?: string | Date }[];
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(value: string | Date | undefined): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Halifax',
  });
}

export function confirmationEmail({ confirmUrl }: { confirmUrl: string }) {
  const subject = `Confirm your subscription to the ${NEWSPAPER_NAME}`;
  const text = `Thanks for subscribing to the ${NEWSPAPER_NAME}.\n\nConfirm your subscription by opening this link:\n${confirmUrl}\n\nIf you did not sign up, you can ignore this email.`;
  const html = `
    <div style="font-family: Georgia, serif; color: #1c1917; max-width: 560px; margin: 0 auto; padding: 24px;">
      <h1 style="font-size: 22px; border-bottom: 3px double #1c1917; padding-bottom: 8px;">${escapeHtml(NEWSPAPER_NAME)}</h1>
      <p>Thanks for subscribing. Please confirm your subscription to start receiving new issues.</p>
      <p><a href="${escapeHtml(confirmUrl)}" style="display: inline-block; background: #1c1917; color: #fffdf7; padding: 10px 18px; text-decoration: none;">Confirm subscription</a></p>
      <p style="font-size: 13px; color: #57534e;">If you did not sign up, you can ignore this email.</p>
    </div>`;
  return { subject, text, html };
}

export function issueEmail({
  issue,
  issueUrl,
  unsubscribeUrl,
}: {
  issue: IssueFrontmatter;
  issueUrl: string;
  unsubscribeUrl: string;
}) {
  const subject = `${NEWSPAPER_NAME}: ${issue.title}`;
  const dateLabel = [issue.edition, formatDate(issue.issueDate)].filter(Boolean).join(' · ');
  const updates = (issue.updates ?? []).map((u) => u.headline).filter(Boolean) as string[];
  const decisions = (issue.decisions ?? [])
    .filter((d) => d.title)
    .map((d) => {
      const deadline = formatDate(d.deadline);
      return deadline ? `${d.title} (feedback by ${deadline})` : (d.title as string);
    });

  const text = [
    `${NEWSPAPER_NAME}${dateLabel ? ` · ${dateLabel}` : ''}`,
    '',
    issue.title,
    issue.summary ?? '',
    '',
    ...(updates.length ? ['Board updates:', ...updates.map((u) => `- ${u}`), ''] : []),
    ...(decisions.length ? ['Decisions needing your feedback:', ...decisions.map((d) => `- ${d}`), ''] : []),
    `Read the full issue: ${issueUrl}`,
    '',
    `Unsubscribe: ${unsubscribeUrl}`,
  ].join('\n');

  const listItems = (items: string[]) =>
    items.map((item) => `<li style="margin-bottom: 6px;">${escapeHtml(item)}</li>`).join('');

  const html = `
    <div style="font-family: Georgia, serif; color: #1c1917; max-width: 560px; margin: 0 auto; padding: 24px;">
      <p style="font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; color: #57534e; margin: 0;">${escapeHtml(NEWSPAPER_NAME)}${dateLabel ? ` · ${escapeHtml(dateLabel)}` : ''}</p>
      <h1 style="font-size: 26px; margin: 8px 0 12px;">${escapeHtml(issue.title)}</h1>
      ${issue.summary ? `<p style="font-style: italic; font-size: 16px;">${escapeHtml(issue.summary)}</p>` : ''}
      ${updates.length ? `<h2 style="font-size: 16px; margin-top: 20px;">Board updates</h2><ul>${listItems(updates)}</ul>` : ''}
      ${decisions.length ? `<h2 style="font-size: 16px; margin-top: 20px;">Decisions needing your feedback</h2><ul>${listItems(decisions)}</ul>` : ''}
      <p style="margin-top: 24px;"><a href="${escapeHtml(issueUrl)}" style="display: inline-block; background: #1c1917; color: #fffdf7; padding: 10px 18px; text-decoration: none;">Read the full issue</a></p>
      <hr style="border: none; border-top: 1px solid #d6d3d1; margin-top: 32px;" />
      <p style="font-size: 12px; color: #57534e;"><a href="${escapeHtml(unsubscribeUrl)}" style="color: #57534e;">Unsubscribe</a></p>
    </div>`;

  return { subject, text, html };
}

export function commentNotificationEmail(record: {
  issueSlug: string;
  decisionTitle: string;
  name: string;
  unit: string;
  comment: string;
}) {
  const adminUrl = `${(process.env.SITE_URL ?? '').replace(/\/$/, '')}/admin/index.html#/collections/comment`;
  const subject = `New owner comment: ${record.decisionTitle}`;
  const text = [
    `${record.name} (unit ${record.unit}) commented on "${record.decisionTitle}" in issue ${record.issueSlug}:`,
    '',
    record.comment,
    '',
    `Review and approve it under Owner Comments: ${adminUrl}`,
  ].join('\n');
  const html = `
    <div style="font-family: Georgia, serif; color: #1c1917; max-width: 560px; margin: 0 auto; padding: 24px;">
      <p style="font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; color: #57534e; margin: 0;">New owner comment · pending review</p>
      <h1 style="font-size: 20px; margin: 8px 0 12px;">${escapeHtml(record.decisionTitle)}</h1>
      <p style="margin: 0 0 8px;"><strong>${escapeHtml(record.name)}</strong>, unit ${escapeHtml(record.unit)}</p>
      <blockquote style="border-left: 3px solid #7a1f1f; margin: 0; padding: 4px 12px; white-space: pre-wrap;">${escapeHtml(record.comment)}</blockquote>
      <p style="margin-top: 20px;"><a href="${escapeHtml(adminUrl)}" style="display: inline-block; background: #1c1917; color: #fffdf7; padding: 10px 18px; text-decoration: none;">Review in the admin</a></p>
    </div>`;
  return { subject, text, html };
}

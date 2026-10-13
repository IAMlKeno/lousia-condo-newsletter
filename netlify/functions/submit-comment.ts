import matter from 'gray-matter';
import { getMailer } from '../../lib/mailer';
import { commentNotificationEmail } from '../../lib/mailer/messages';
import { countWords, isPastDeadline, wordLimitFor } from '../../lib/newsletter';
import { json, parseJsonBody, text, type HttpEvent } from '../../lib/server/http';

const ISSUE_SLUG = /^[a-z0-9][a-z0-9_-]{0,120}$/i;

type Decision = {
  title?: string;
  commentsEnabled?: boolean;
  wordLimit?: number;
  deadline?: string | Date;
};

function githubConfig() {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH ?? 'main';
  const token = process.env.GITHUB_TOKEN;
  if (!owner || !repo || !token) {
    throw new Error('GITHUB_OWNER, GITHUB_REPO and GITHUB_TOKEN must be set.');
  }
  const headers = {
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
  };
  return { owner, repo, branch, headers };
}

// Reads the issue from the repository so the rules an admin set in Tina
// (comments on/off, word limit, deadline) are enforced on the server too.
async function loadDecision(issueSlug: string, decisionTitle: string): Promise<Decision | null> {
  const { owner, repo, branch, headers } = githubConfig();
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/content/newsletters/${issueSlug}.mdx?ref=${encodeURIComponent(branch)}`;
  const response = await fetch(url, { headers: { ...headers, Accept: 'application/vnd.github.raw' } });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`GitHub returned ${response.status}: ${await response.text()}`);

  const { data } = matter(await response.text());
  if (!data.published) return null;
  const decisions = (data.decisions ?? []) as Decision[];
  return decisions.find((d) => d.title?.trim() === decisionTitle) ?? null;
}

// Saves each comment as a file in content/comments via the GitHub API, so
// admins can review and approve it in the Tina editor.
export const handler = async (event: HttpEvent) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed.' });
  }

  const body = parseJsonBody(event.body);
  if (!body) return json(400, { error: 'Invalid request.' });

  // Honeypot: real visitors leave the hidden "website" field empty.
  if (text(body.website, 200)) return json(200, { message: 'Thank you.' });

  const issueSlug = text(body.issueSlug, 130);
  const decisionTitle = text(body.decisionTitle, 200);
  const comment = text(body.comment, 10000);
  const name = text(body.name, 80);
  const unit = text(body.unit, 20);

  if (!ISSUE_SLUG.test(issueSlug) || !decisionTitle) {
    return json(400, { error: 'This comment could not be matched to a decision.' });
  }
  if (!name || !unit) {
    return json(400, { error: 'Please enter your name and unit number.' });
  }

  const decision = await loadDecision(issueSlug, decisionTitle);
  if (!decision || !decision.commentsEnabled) {
    return json(400, { error: 'Comments are not open for this item.' });
  }
  if (isPastDeadline(decision.deadline)) {
    return json(400, { error: 'The feedback period for this item has closed.' });
  }

  const limit = wordLimitFor(decision);
  const words = countWords(comment);
  if (words === 0) return json(400, { error: 'Please write a comment before submitting.' });
  if (words > limit) {
    return json(400, { error: `Comments are limited to ${limit} words.` });
  }

  const { owner, repo, branch, headers } = githubConfig();
  const submittedAt = new Date().toISOString();
  const suffix = Math.random().toString(36).slice(2, 8);
  const path = `content/comments/${issueSlug}-${Date.now()}-${suffix}.json`;
  const record = {
    status: 'new',
    issueSlug,
    decisionTitle,
    name,
    unit,
    comment,
    submittedAt,
  };

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: { ...headers, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // [skip netlify] avoids a site rebuild for every comment; the rebuild
      // happens when an admin approves it in Tina.
      message: `Owner comment on ${issueSlug} [skip netlify]`,
      content: Buffer.from(`${JSON.stringify(record, null, 2)}\n`).toString('base64'),
      branch,
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub returned ${response.status}: ${await response.text()}`);
  }

  // Optional heads-up for the board. Never blocks the owner's submission.
  const notify = process.env.ADMIN_NOTIFY_EMAIL;
  if (notify) {
    try {
      await getMailer().send({ to: notify, ...commentNotificationEmail(record) });
    } catch (error) {
      console.error('[comments] admin notification failed', error);
    }
  }

  return json(200, {
    message: 'Thank you. Your comment was received and will appear here once the board has reviewed it.',
  });
};

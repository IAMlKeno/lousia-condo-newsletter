import { COMMENT_WORD_LIMIT, countWords } from '../../lib/newsletter';
import { json, parseJsonBody, text, type HttpEvent } from '../../lib/server/http';

const ISSUE_SLUG = /^[a-z0-9][a-z0-9_-]{0,120}$/i;

// Saves each comment as a file in content/comments via the GitHub API, so
// admins can review it in the Tina editor. The commit triggers a site build.
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
  const comment = text(body.comment, 5000);
  const name = text(body.name, 80);
  const unit = text(body.unit, 40);

  if (!ISSUE_SLUG.test(issueSlug) || !decisionTitle) {
    return json(400, { error: 'This comment could not be matched to a decision.' });
  }

  const words = countWords(comment);
  if (words === 0) return json(400, { error: 'Please write a comment before submitting.' });
  if (words > COMMENT_WORD_LIMIT) {
    return json(400, { error: `Comments are limited to ${COMMENT_WORD_LIMIT} words.` });
  }

  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH ?? 'main';
  const token = process.env.GITHUB_TOKEN;
  if (!owner || !repo || !token) {
    throw new Error('GITHUB_OWNER, GITHUB_REPO and GITHUB_TOKEN must be set.');
  }

  const submittedAt = new Date().toISOString();
  const suffix = Math.random().toString(36).slice(2, 8);
  const path = `content/comments/${issueSlug.replace(/\//g, '-')}-${Date.now()}-${suffix}.json`;
  const record = {
    issueSlug,
    decisionTitle,
    name,
    unit,
    comment,
    submittedAt,
    status: 'new',
  };

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Owner comment on ${issueSlug}`,
      content: Buffer.from(JSON.stringify(record, null, 2)).toString('base64'),
      branch,
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub returned ${response.status}: ${await response.text()}`);
  }

  return json(200, { message: 'Thank you. Your comment has been received.' });
};

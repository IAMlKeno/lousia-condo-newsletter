# Louisa Condominium Newsletter

A one-page, newspaper-style newsletter for condo owners. It's built with Next.js and TinaCMS (TinaCloud), hosted on Netlify, with subscribers stored in Supabase and email sent through Resend.

## What it does

| Feature | Where |
| --- | --- |
| Latest issue as the front page | `/` (newest published issue) |
| Archive of past issues | `/issues` |
| Board admin (TinaCloud login) | `/admin` (also the "Board login" link in the footer) |
| One-page print layout | "Print this issue" button, or Ctrl/Cmd+P on any issue |
| Owner comments on decisions | Per decision: on/off toggle, word limit, deadline. Comments are moderated |
| Email subscribers | Subscribe form in the footer, with double opt-in and an unsubscribe link in every email |

## Publishing an issue (for board members)

1. Go to `/admin` and log in with your TinaCloud account.
2. **Newsletters → Create new**. Fill in the headline, lead paragraph, issue date and meeting date.
3. Add **Board updates**. Each one has an optional category such as *Finance*.
4. Add **Owner input needed** items. For each item, turn on *Accept owner comments*, set a word limit (300 by default) and a feedback deadline.
5. Optionally add **Upcoming dates** and a front-page photo.
6. Leave **Published** off while drafting. Turn it on to make the issue public.
7. Turn on **Email this issue to subscribers** to send the issue once it's published. It goes out on the next production deploy, and each issue is sent only once.

### Moderating comments

Owners must give their name and unit number. New comments arrive under **Owner Comments** with the status *Pending review*.

- **Approved** shows the comment under its decision on the public site.
- **Hidden** keeps it for the board's records only.
- **Board reply** is optional and appears under an approved comment.

Set `ADMIN_NOTIFY_EMAIL` to get an email whenever a new comment arrives.

### Inviting board members

In [app.tina.io](https://app.tina.io), open the project, go to **Collaborators** and invite each board member by email. They can then log in at `/admin`.

## Setup

### Environment variables (Netlify → Site configuration → Environment variables)

| Name | Purpose |
| --- | --- |
| `NEXT_PUBLIC_TINA_CLIENT_ID`, `TINA_TOKEN` | From the TinaCloud project |
| `NEXT_PUBLIC_TINA_BRANCH` | Usually `main` |
| `SITE_URL` | Public site URL, e.g. `https://louisa-news.netlify.app` |
| `SUPABASE_URL`, `SUPABASE_SECRET` | Supabase project URL and **secret/service-role** key (server only) |
| `MAIL_PROVIDER` | `resend` |
| `RESEND_API_KEY`, `MAIL_FROM` | Resend key and a sender on a verified domain, e.g. `Louisa Condo <news@yourdomain.ca>` |
| `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH`, `GITHUB_TOKEN` | Used to store comments in the repo. The token needs *Contents: read & write* on this repo only (fine-grained PAT) |
| `ADMIN_NOTIFY_EMAIL` | Optional. Address that gets new-comment alerts |
| `SEND_NEWSLETTERS` | Optional. Set to `true` to allow sending outside a production deploy (normally leave it unset) |

### One-time steps

1. Run `supabase/schema.sql` in the Supabase SQL editor.
2. In Resend, verify your sending domain.
3. In TinaCloud, connect the GitHub repo and invite board members.
4. Delete the sample issue (`content/newsletters/2026-10-sample-…`) and the sample comment once you've seen how they look.

## Local development

```bash
bun install
bun run dev        # http://localhost:3000, admin at http://localhost:3000/admin
```

Locally, Tina edits your files directly with no login. The Netlify functions (subscribe, comments) need `netlify dev` to run locally.

## How emailing works

`bun run build` runs `scripts/send-newsletters.ts` after the site builds. On the production deploy (`CONTEXT=production`), it emails each issue that has both *Published* and *Email this issue* turned on and hasn't been sent before. Sent issues are recorded in the `newsletter_sends` table, so rebuilds never resend. Deploy previews and local builds never send.

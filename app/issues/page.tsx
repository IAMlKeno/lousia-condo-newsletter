import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Layout from '@/components/layout/layout';
import { getPublishedIssues } from '@/lib/issues';
import { formatLongDate } from '@/lib/newsletter';

export const revalidate = 300;

export const metadata: Metadata = { title: 'All issues' };

const NOTICES: Record<string, string> = {
  'subscription=confirmed': 'Thank you. Your subscription is confirmed.',
  'subscription=invalid': 'That confirmation link is no longer valid.',
  'unsubscribed=done': 'You have been unsubscribed.',
  'unsubscribed=invalid': 'That unsubscribe link is no longer valid.',
};

export default async function IssuesIndex({
  searchParams,
}: {
  searchParams: Promise<{ subscription?: string; unsubscribed?: string }>;
}) {
  const params = await searchParams;
  const notice =
    (params.subscription && NOTICES[`subscription=${params.subscription}`]) ||
    (params.unsubscribed && NOTICES[`unsubscribed=${params.unsubscribed}`]) ||
    '';

  const issues = await getPublishedIssues();

  return (
    <Layout>
      <section className="mx-auto max-w-3xl px-4 pb-8 pt-10 sm:px-6">
        <p className="kicker text-center">The archive</p>
        <h1 className="font-display mt-2 border-b-[3px] border-double border-[var(--ink)] pb-4 text-center text-4xl font-bold sm:text-5xl">
          All issues
        </h1>
        {notice && (
          <p className="font-body mt-6 border border-[var(--rule)] bg-[var(--paper)] px-4 py-3 text-center italic" role="status">
            {notice}
          </p>
        )}
        <ul className="mt-4 divide-y divide-[var(--rule)]">
          {issues.map((issue, index) => {
            const decisions = (issue.decisions ?? []).filter(Boolean).length;
            return (
              <li key={issue._sys.relativePath} className="grid gap-1 py-6 sm:grid-cols-[9rem_1fr] sm:gap-6">
                <div className="font-meta text-xs uppercase tracking-[0.12em] text-[var(--ink-muted)] sm:pt-2">
                  <p>{formatLongDate(issue.issueDate)}</p>
                  {issue.edition && <p className="mt-0.5">{issue.edition}</p>}
                  {index === 0 && <p className="mt-1 text-[var(--accent)]">Latest</p>}
                </div>
                <div>
                  <Link
                    href={`/issues/${issue._sys.breadcrumbs.join('/')}`}
                    className="font-display text-2xl font-bold leading-snug hover:underline hover:decoration-[var(--accent)] hover:underline-offset-4"
                  >
                    {issue.title}
                  </Link>
                  {issue.summary && <p className="font-body mt-1.5 text-[var(--ink-soft)]">{issue.summary}</p>}
                  {decisions > 0 && (
                    <p className="font-meta mt-2 text-xs text-[var(--accent)]">
                      {decisions} {decisions === 1 ? 'item' : 'items'} for owner input
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        {issues.length === 0 && (
          <p className="font-body mt-8 text-center italic text-[var(--ink-muted)]">No issues have been published yet.</p>
        )}
      </section>
    </Layout>
  );
}

import React from 'react';
import Link from 'next/link';
import client from '@/tina/__generated__/client';
import Layout from '@/components/layout/layout';
import { getApprovedComments, getPublishedIssues } from '@/lib/issues';
import IssueClientPage from './issues/[...urlSegments]/client-page';

export const revalidate = 300;

// The home page is the front page of the latest published issue.
export default async function Home() {
  const issues = await getPublishedIssues();
  const latest = issues[0];

  if (!latest) {
    return (
      <Layout>
        <section className="mx-auto max-w-2xl px-6 py-24 text-center">
          <p className="kicker">Coming soon</p>
          <h1 className="font-display mt-3 text-4xl font-bold">The first issue is on its way</h1>
          <p className="font-body mt-4 text-[var(--ink-soft)]">
            Subscribe below and we'll email you when the board publishes it.
          </p>
          <p className="mt-6">
            <Link href="/about" className="font-meta text-sm underline underline-offset-2">
              About this newsletter
            </Link>
          </p>
        </section>
      </Layout>
    );
  }

  const slug = latest._sys.breadcrumbs.join('/');
  const [data, comments] = await Promise.all([
    client.queries.newsletter({ relativePath: latest._sys.relativePath }),
    getApprovedComments(slug),
  ]);

  return (
    <Layout rawPageData={data}>
      <IssueClientPage {...data} comments={comments} isLatest />
    </Layout>
  );
}

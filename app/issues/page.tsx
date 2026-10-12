import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import client from '@/tina/__generated__/client';
import Layout from '@/components/layout/layout';
import { NEWSPAPER_NAME } from '@/lib/newsletter';
import SubscribeForm from '@/components/newsletter/subscribe-form';

export const revalidate = 300;

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

  const connection = await client.queries.newsletterConnection();
  const issues = (connection.data.newsletterConnection.edges ?? [])
    .map((edge) => edge?.node)
    .filter((node) => node?.published)
    .sort((a, b) => new Date(b!.issueDate!).getTime() - new Date(a!.issueDate!).getTime());

  return (
    <Layout rawPageData={connection.data}>
      <section className="newspaper mx-auto max-w-3xl px-6 pb-16 pt-8">
        <h1 className="border-b-4 border-double border-stone-800 pb-3 text-center font-serif text-4xl font-bold text-stone-900">
          {NEWSPAPER_NAME}
        </h1>
        {notice && <p className="no-print mt-4 text-center font-serif italic text-stone-800">{notice}</p>}
        <ul className="mt-8 divide-y divide-stone-300">
          {issues.map((issue) => {
            const date = new Date(issue!.issueDate!);
            return (
              <li key={issue!._sys.relativePath} className="py-5">
                <p className="font-serif text-xs uppercase tracking-wide text-stone-600">
                  {!isNaN(date.getTime()) ? format(date, 'MMMM d, yyyy') : ''}
                </p>
                <Link
                  href={`/issues/${issue!._sys.breadcrumbs.join('/')}`}
                  className="mt-1 block font-serif text-2xl font-bold text-stone-900 hover:underline"
                >
                  {issue!.title}
                </Link>
                {issue!.summary && (
                  <p className="mt-2 font-serif text-stone-700">{issue!.summary}</p>
                )}
              </li>
            );
          })}
        </ul>
        {issues.length === 0 && (
          <p className="mt-8 text-center font-serif italic text-stone-600">No issues have been published yet.</p>
        )}
        <SubscribeForm />
      </section>
    </Layout>
  );
}

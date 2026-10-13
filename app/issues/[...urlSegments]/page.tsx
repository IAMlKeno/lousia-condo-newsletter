import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import client from '@/tina/__generated__/client';
import Layout from '@/components/layout/layout';
import { getApprovedComments, getPublishedIssues } from '@/lib/issues';
import IssueClientPage from './client-page';

export const revalidate = 300;

type Params = { params: Promise<{ urlSegments: string[] }> };

async function loadIssue(urlSegments: string[]) {
  const relativePath = `${urlSegments.join('/')}.mdx`;
  try {
    return await client.queries.newsletter({ relativePath });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { urlSegments } = await params;
  const data = await loadIssue(urlSegments);
  const issue = data?.data.newsletter;
  if (!issue?.published) return {};
  return { title: issue.title, description: issue.summary ?? undefined };
}

export default async function IssuePage({ params }: Params) {
  const { urlSegments } = await params;
  const data = await loadIssue(urlSegments);

  // Unpublished issues are not shown on the public site.
  if (!data || !data.data.newsletter.published) {
    notFound();
  }

  const slug = urlSegments.join('/');
  const [comments, issues] = await Promise.all([getApprovedComments(slug), getPublishedIssues()]);
  const isLatest = issues[0]?._sys.breadcrumbs.join('/') === slug;

  return (
    <Layout rawPageData={data}>
      <IssueClientPage {...data} comments={comments} isLatest={isLatest} />
    </Layout>
  );
}

export async function generateStaticParams() {
  const issues = await getPublishedIssues();
  return issues.map((issue) => ({ urlSegments: issue._sys.breadcrumbs }));
}

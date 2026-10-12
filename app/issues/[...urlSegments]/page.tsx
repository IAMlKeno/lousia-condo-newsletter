import React from 'react';
import { notFound } from 'next/navigation';
import client from '@/tina/__generated__/client';
import Layout from '@/components/layout/layout';
import IssueClientPage from './client-page';

export const revalidate = 300;

export default async function IssuePage({
  params,
}: {
  params: Promise<{ urlSegments: string[] }>;
}) {
  const resolvedParams = await params;
  const relativePath = `${resolvedParams.urlSegments.join('/')}.mdx`;
  const data = await client.queries.newsletter({ relativePath });

  // Unpublished issues are not shown on the public site.
  if (!data.data.newsletter.published) {
    notFound();
  }

  return (
    <Layout rawPageData={data}>
      <IssueClientPage {...data} />
    </Layout>
  );
}

export async function generateStaticParams() {
  const connection = await client.queries.newsletterConnection();
  const edges = connection.data.newsletterConnection.edges ?? [];

  return edges
    .filter((edge) => edge?.node?.published)
    .map((edge) => ({ urlSegments: edge!.node!._sys.breadcrumbs }));
}

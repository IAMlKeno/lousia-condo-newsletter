'use client';
import React from 'react';
import { useTina } from 'tinacms/dist/react';
import IssueSheet, { type ApprovedComment } from '@/components/newsletter/issue-sheet';

type Props = {
  data: any;
  variables: { relativePath: string };
  query: string;
  comments: ApprovedComment[];
  isLatest?: boolean;
};

export default function IssueClientPage({ comments, isLatest, ...props }: Props) {
  // useTina makes the page live-editable inside the Tina admin.
  const { data } = useTina({ ...props });
  const slug = props.variables.relativePath.replace(/\.mdx$/, '');
  return <IssueSheet issue={data.newsletter} slug={slug} comments={comments} isLatest={isLatest} />;
}

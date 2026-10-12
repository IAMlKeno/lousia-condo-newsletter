'use client';
import React from 'react';
import { format } from 'date-fns';
import { tinaField, useTina } from 'tinacms/dist/react';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import CommentForm from '@/components/newsletter/comment-form';
import { NEWSPAPER_NAME } from '@/lib/newsletter';

type Props = {
  data: any;
  variables: { relativePath: string };
  query: string;
};

export default function IssueClientPage(props: Props) {
  const { data } = useTina({ ...props });
  const issue = data.newsletter;
  const slug = props.variables.relativePath.replace(/\.mdx$/, '');

  const issueDate = issue.issueDate ? new Date(issue.issueDate) : null;
  const dateLabel = issueDate && !isNaN(issueDate.getTime()) ? format(issueDate, 'MMMM d, yyyy') : '';

  return (
    <article className="newspaper mx-auto max-w-5xl px-6 pb-16 pt-8">
      <div className="no-print mb-6 flex justify-end">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-sm border border-stone-800 px-4 py-2 text-sm font-medium text-stone-900 hover:bg-stone-900 hover:text-stone-50"
        >
          Print this issue
        </button>
      </div>

      <div className="newspaper-sheet">
        <header className="border-b-4 border-double border-stone-800 pb-3 text-center">
          <p className="font-serif text-xs uppercase tracking-[0.35em] text-stone-700">Owners' Update</p>
          <h1 className="font-serif text-4xl font-bold tracking-tight text-stone-900 md:text-6xl">
            {NEWSPAPER_NAME}
          </h1>
          <div className="mt-2 flex justify-between border-t border-stone-700 pt-1 font-serif text-xs uppercase tracking-wide text-stone-700">
            <span>{dateLabel}</span>
          </div>
        </header>

        <h2
          data-tina-field={tinaField(issue, 'title')}
          className="mt-6 text-center font-serif text-3xl font-bold leading-tight text-stone-900 md:text-4xl"
        >
          {issue.title}
        </h2>

        {issue.summary && (
          <p
            data-tina-field={tinaField(issue, 'summary')}
            className="mx-auto mt-4 max-w-3xl border-y border-stone-400 py-3 text-center font-serif text-lg italic leading-relaxed text-stone-800"
          >
            {issue.summary}
          </p>
        )}

        <div className="mt-8 columns-1 gap-10 md:columns-2">
          {issue.updates?.map((update: any, index: number) => (
            <section key={`update-${index}`} className="mb-6 break-inside-avoid">
              <h3 className="font-serif text-xl font-bold text-stone-900">{update.headline}</h3>
              <div className="newspaper-body mt-1 font-serif text-[15px] leading-relaxed text-stone-800">
                <TinaMarkdown content={update.body} />
              </div>
            </section>
          ))}

          {issue.decisions?.map((decision: any, index: number) => {
            const deadline = decision.deadline ? new Date(decision.deadline) : null;
            const deadlineLabel =
              deadline && !isNaN(deadline.getTime()) ? format(deadline, 'MMMM d, yyyy') : '';
            return (
              <section
                key={`decision-${index}`}
                className="mb-6 break-inside-avoid border-2 border-stone-800 bg-stone-50 p-5"
              >
                <p className="font-serif text-xs uppercase tracking-[0.25em] text-stone-700">
                  Decision needed
                </p>
                <h3 className="mt-1 font-serif text-xl font-bold text-stone-900">{decision.title}</h3>
                {deadlineLabel && (
                  <p className="mt-1 font-serif text-sm italic text-stone-700">Feedback by {deadlineLabel}</p>
                )}
                <div className="newspaper-body mt-2 font-serif text-[15px] leading-relaxed text-stone-800">
                  <TinaMarkdown content={decision.body} />
                </div>
                {decision.commentsEnabled && (
                  <CommentForm issueSlug={slug} decisionTitle={decision.title} />
                )}
              </section>
            );
          })}
        </div>

        {issue._body && (
          <div className="newspaper-body mt-6 border-t border-stone-400 pt-4 font-serif text-[15px] leading-relaxed text-stone-800">
            <TinaMarkdown content={issue._body} />
          </div>
        )}
      </div>
    </article>
  );
}

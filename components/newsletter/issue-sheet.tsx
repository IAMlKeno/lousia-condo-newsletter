'use client';
import React from 'react';
import Link from 'next/link';
import { tinaField } from 'tinacms/dist/react';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import CommentForm from './comment-form';
import PrintButton from './print-button';
import { useLayout } from '@/components/layout/layout-context';
import {
  NEWSPAPER_NAME,
  formatLongDate,
  formatShortDate,
  isPastDeadline,
  wordLimitFor,
} from '@/lib/newsletter';

export type ApprovedComment = {
  id: string;
  decisionTitle: string;
  name?: string | null;
  unit?: string | null;
  comment?: string | null;
  submittedAt?: string | null;
  boardReply?: string | null;
};

type Props = {
  issue: any;
  slug: string;
  comments: ApprovedComment[];
  isLatest?: boolean;
};

function hasRichText(value: any): boolean {
  return Boolean(value?.children?.some((child: any) => child?.children?.some((c: any) => c?.text?.trim?.() || c?.type)));
}

export default function IssueSheet({ issue, slug, comments, isLatest }: Props) {
  const { globalSettings } = useLayout();
  const paperName = globalSettings?.header?.name || NEWSPAPER_NAME;
  const tagline = (globalSettings?.header as any)?.tagline || 'News from the Board of Directors';
  const contactEmail = (globalSettings?.footer as any)?.contactEmail as string | undefined;

  const issueDate = formatLongDate(issue.issueDate);
  const meetingDate = formatLongDate(issue.meetingDate);
  const updates = (issue.updates ?? []).filter(Boolean);
  const decisions = (issue.decisions ?? []).filter(Boolean);
  const dates = (issue.dates ?? []).filter((d: any) => d?.label);
  const issuePath = `/issues/${slug}`;
  const host = useSiteHost();

  return (
    <article className="newspaper mx-auto max-w-6xl px-3 pb-8 pt-6 sm:px-6 sm:pt-10">
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="font-meta text-xs uppercase tracking-[0.14em] text-[var(--ink-muted)]">
          {isLatest ? 'Latest issue' : 'From the archive'} ·{' '}
          <Link href="/issues" className="underline underline-offset-2 hover:text-[var(--ink)]">
            All issues
          </Link>
        </p>
        <PrintButton />
      </div>

      <div className="newspaper-sheet">
        <header className="masthead">
          <div className="masthead-top">
            <span>{issue.edition || ' '}</span>
            <span className="hidden sm:inline">For the owners of Louisa Condominium</span>
            <span>{issueDate}</span>
          </div>
          <h1 className="masthead-title">{paperName}</h1>
          <p className="masthead-tagline">{tagline}</p>
          <div className="dateline">
            <span>{meetingDate ? `Board meeting of ${meetingDate}` : 'Board of Directors'}</span>
            {decisions.length > 0 && (
              <span className="text-[var(--accent)]">
                {decisions.length} {decisions.length === 1 ? 'item needs' : 'items need'} your input
              </span>
            )}
          </div>
        </header>

        <h2 data-tina-field={tinaField(issue, 'title')} className="lead-headline">
          {issue.title}
        </h2>
        {issue.summary && (
          <p data-tina-field={tinaField(issue, 'summary')} className="lead-deck">
            {issue.summary}
          </p>
        )}

        {issue.image && (
          <figure className="lead-figure" data-tina-field={tinaField(issue, 'image')}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={issue.image} alt={issue.imageCaption || ''} />
            {issue.imageCaption && <figcaption>{issue.imageCaption}</figcaption>}
          </figure>
        )}

        <div className="issue-grid">
          <div className="issue-stories">
            {updates.map((update: any, index: number) => (
              <section key={`update-${index}`} className="story" data-tina-field={tinaField(update)}>
                {update.category && <p className="kicker">{update.category}</p>}
                <h3 className="story-headline">{update.headline}</h3>
                {update.body && (
                  <div className="prose-news">
                    <TinaMarkdown content={update.body} />
                  </div>
                )}
              </section>
            ))}
            {updates.length === 0 && (
              <p className="font-body italic text-[var(--ink-muted)]">No board updates in this issue.</p>
            )}
          </div>

          <aside className="issue-sidebar">
            {decisions.map((decision: any, index: number) => {
              const closed = isPastDeadline(decision.deadline);
              const deadline = formatLongDate(decision.deadline);
              const approved = comments.filter((c) => c.decisionTitle === decision.title);
              return (
                <section key={`decision-${index}`} className="decision" data-tina-field={tinaField(decision)}>
                  <p className="kicker">Your input needed</p>
                  <h3 className="decision-title">{decision.title}</h3>
                  {deadline && (
                    <p className="decision-deadline">
                      {closed ? `Feedback closed ${deadline}` : `Feedback by ${deadline}`}
                    </p>
                  )}
                  {hasRichText(decision.body) && (
                    <div className="prose-news">
                      <TinaMarkdown content={decision.body} />
                    </div>
                  )}

                  {decision.commentsEnabled && (
                    <p className="print-only font-meta mt-2 text-[8pt] text-[var(--ink-soft)]">
                      Comment online{deadline && !closed ? ` by ${deadline}` : ''}: {host}
                      {issuePath}
                    </p>
                  )}

                  {approved.length > 0 && (
                    <details className="no-print mt-4 border-t border-[var(--rule)] pt-3" open={approved.length <= 3}>
                      <summary className="font-meta cursor-pointer text-xs font-medium uppercase tracking-[0.1em] text-[var(--ink-soft)]">
                        Owner comments ({approved.length})
                      </summary>
                      {approved.map((c) => (
                        <blockquote key={c.id} className="owner-comment">
                          <p>{c.comment}</p>
                          <cite>
                            — {c.name}
                            {c.unit ? `, unit ${c.unit}` : ''}
                            {c.submittedAt ? ` · ${formatShortDate(c.submittedAt)}` : ''}
                          </cite>
                          {c.boardReply && <p className="board-reply">Board reply: {c.boardReply}</p>}
                        </blockquote>
                      ))}
                    </details>
                  )}

                  {decision.commentsEnabled && !closed && (
                    <CommentForm issueSlug={slug} decisionTitle={decision.title} wordLimit={wordLimitFor(decision)} />
                  )}
                  {decision.commentsEnabled && closed && (
                    <p className="no-print font-meta mt-3 text-xs italic text-[var(--ink-muted)]">
                      Comments are closed for this item.
                    </p>
                  )}
                </section>
              );
            })}

            {dates.length > 0 && (
              <section className="dates-box" data-tina-field={tinaField(issue, 'dates')}>
                <h3>Upcoming dates</h3>
                <ul>
                  {dates.map((d: any, index: number) => (
                    <li key={`date-${index}`}>
                      <time>{formatShortDate(d.date) || 'TBD'}</time>
                      <span>{d.label}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
        </div>

        {hasRichText(issue._body) && (
          <div className="closing-notes prose-news" data-tina-field={tinaField(issue, '_body')}>
            <TinaMarkdown content={issue._body} />
          </div>
        )}

        <footer className="sheet-footer">
          <span>Prepared by the Board of Directors</span>
          {contactEmail && <span>Questions: {contactEmail}</span>}
          <span>
            {host}
            {issuePath}
          </span>
        </footer>
      </div>
    </article>
  );
}

// The site's host name, read after hydration so server and client HTML match.
function useSiteHost(): string {
  const [host, setHost] = React.useState('');
  React.useEffect(() => setHost(window.location.host), []);
  return host;
}

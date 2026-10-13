'use client';
import React, { useId, useState } from 'react';
import { countWords } from '@/lib/newsletter';

type Props = {
  issueSlug: string;
  decisionTitle: string;
  wordLimit: number;
};

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function CommentForm({ issueSlug, decisionTitle, wordLimit }: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [website, setWebsite] = useState(''); // honeypot, hidden from people
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const words = countWords(comment);
  const overLimit = words > wordLimit;
  const canSubmit = words > 0 && !overLimit && name.trim() && unit.trim() && status !== 'sending';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setStatus('sending');
    setMessage('');
    try {
      const response = await fetch('/.netlify/functions/submit-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueSlug, decisionTitle, name, unit, comment, website }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || 'Your comment could not be sent. Please try again.');
      }
      setStatus('sent');
      setComment('');
      setMessage(result.message || 'Thank you. Your comment was received.');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Your comment could not be sent. Please try again.');
    }
  }

  if (status === 'sent') {
    return (
      <p className="no-print font-body mt-4 border-t border-[var(--rule)] pt-3 text-sm italic text-[var(--ink-soft)]" role="status">
        {message}
      </p>
    );
  }

  if (!open) {
    return (
      <div className="no-print mt-4">
        <button type="button" onClick={() => setOpen(true)} className="btn-outline">
          Share your feedback
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="no-print mt-4 space-y-3 border-t border-[var(--rule)] pt-4">
      <div>
        <label className="font-meta block text-xs font-medium uppercase tracking-[0.1em] text-[var(--ink-soft)]" htmlFor={`${id}-comment`}>
          Your comment
        </label>
        <textarea
          id={`${id}-comment`}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={5}
          className="field mt-1 resize-y"
          aria-describedby={`${id}-count`}
          required
        />
        <p id={`${id}-count`} className={`font-meta mt-1 text-xs ${overLimit ? 'text-red-700' : 'text-[var(--ink-muted)]'}`}>
          {words} / {wordLimit} words{overLimit ? ' — please shorten your comment' : ''}
        </p>
      </div>

      <div className="grid grid-cols-[1fr_6.5rem] gap-2">
        <div>
          <label className="sr-only" htmlFor={`${id}-name`}>Name</label>
          <input
            id={`${id}-name`}
            type="text"
            placeholder="Your name"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="field"
          />
        </div>
        <div>
          <label className="sr-only" htmlFor={`${id}-unit`}>Unit number</label>
          <input
            id={`${id}-unit`}
            type="text"
            placeholder="Unit #"
            required
            value={unit}
            onChange={(event) => setUnit(event.target.value)}
            className="field"
          />
        </div>
      </div>
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={website}
        onChange={(event) => setWebsite(event.target.value)}
        className="hidden"
      />

      <p className="font-meta text-xs text-[var(--ink-muted)]">
        Comments are reviewed by the board before they appear here. Your name and unit number are shown with your comment.
      </p>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={!canSubmit} className="btn-ink">
          {status === 'sending' ? 'Sending…' : 'Submit comment'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="font-meta text-xs text-[var(--ink-muted)] underline underline-offset-2">
          Cancel
        </button>
      </div>
      {status === 'error' && (
        <p className="text-sm text-red-700" role="alert">
          {message}
        </p>
      )}
    </form>
  );
}

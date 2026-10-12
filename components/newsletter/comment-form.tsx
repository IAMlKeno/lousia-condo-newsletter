'use client';
import React, { useState } from 'react';
import { COMMENT_WORD_LIMIT, countWords } from '@/lib/newsletter';

type Props = {
  issueSlug: string;
  decisionTitle: string;
};

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function CommentForm({ issueSlug, decisionTitle }: Props) {
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const words = countWords(comment);
  const overLimit = words > COMMENT_WORD_LIMIT;
  const canSubmit = words > 0 && !overLimit && status !== 'sending';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setStatus('sending');
    setMessage('');
    try {
      const response = await fetch('/.netlify/functions/submit-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueSlug, decisionTitle, name, unit, comment }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || 'Your comment could not be sent.');
      }
      setStatus('sent');
      setComment('');
      setMessage('Thank you. Your comment has been received.');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Your comment could not be sent.');
    }
  }

  if (status === 'sent') {
    return <p className="mt-4 text-sm italic text-stone-700">{message}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="no-print mt-4 border-t border-stone-400 pt-4">
      <p className="mb-2 font-serif text-sm font-semibold uppercase tracking-wide text-stone-800">
        Owner feedback
      </p>
      <label className="block text-sm text-stone-700" htmlFor={`comment-${issueSlug}-${decisionTitle}`}>
        Your comment
      </label>
      <textarea
        id={`comment-${issueSlug}-${decisionTitle}`}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        rows={4}
        className="mt-1 w-full rounded-sm border border-stone-400 bg-white p-2 text-sm focus:border-stone-800 focus:outline-none"
        required
      />
      <div className="mt-1 flex justify-between text-xs">
        <span className={overLimit ? 'text-red-700' : 'text-stone-600'}>
          {words} / {COMMENT_WORD_LIMIT} words
        </span>
        {overLimit && <span className="text-red-700">Please shorten your comment.</span>}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Name (optional)"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="rounded-sm border border-stone-400 bg-white p-2 text-sm"
        />
        <input
          type="text"
          placeholder="Unit (optional)"
          value={unit}
          onChange={(event) => setUnit(event.target.value)}
          className="rounded-sm border border-stone-400 bg-white p-2 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-3 rounded-sm bg-stone-900 px-4 py-2 text-sm font-medium text-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {status === 'sending' ? 'Sending…' : 'Submit comment'}
      </button>
      {status === 'error' && <p className="mt-2 text-sm text-red-700">{message}</p>}
    </form>
  );
}

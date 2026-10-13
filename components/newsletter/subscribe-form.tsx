'use client';
import React, { useState } from 'react';

type Status = 'idle' | 'sending' | 'done' | 'error';

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // honeypot, hidden from people
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');
    setMessage('');
    try {
      const response = await fetch('/.netlify/functions/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Something went wrong. Please try again.');
      setStatus('done');
      setMessage(result.message);
      setEmail('');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    }
  }

  return (
    <section id="subscribe" className="no-print scroll-mt-20 px-4 py-12 text-center sm:px-6">
      <p className="kicker">Stay informed</p>
      <h2 className="font-display mt-2 text-3xl font-bold text-[var(--ink)]">Get each new issue by email</h2>
      <p className="font-body mx-auto mt-2 max-w-md text-[var(--ink-soft)]">
        We send one email when the board publishes a new issue. We'll ask you to confirm your address first, and
        every email has an unsubscribe link.
      </p>
      {status === 'done' ? (
        <p className="font-body mt-5 italic text-[var(--ink)]" role="status">
          {message}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mx-auto mt-5 flex max-w-md flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor="subscribe-email">
            Email address
          </label>
          <input
            id="subscribe-email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="field flex-1"
          />
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
          <button type="submit" disabled={status === 'sending'} className="btn-ink justify-center">
            {status === 'sending' ? 'Sending…' : 'Subscribe'}
          </button>
        </form>
      )}
      {status === 'error' && (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {message}
        </p>
      )}
    </section>
  );
}

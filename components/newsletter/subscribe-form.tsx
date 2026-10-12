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
    <section className="no-print mt-12 border-t-4 border-double border-stone-800 pt-6 text-center">
      <h2 className="font-serif text-2xl font-bold text-stone-900">Receive new issues by email</h2>
      <p className="mt-1 font-serif text-stone-700">
        Get each new issue in your inbox. We will ask you to confirm your address first.
      </p>
      {status === 'done' ? (
        <p className="mt-4 font-serif italic text-stone-800">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="mx-auto mt-4 flex max-w-md flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor="subscribe-email">
            Email address
          </label>
          <input
            id="subscribe-email"
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="flex-1 rounded-sm border border-stone-400 bg-white p-2 text-sm"
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
          <button
            type="submit"
            disabled={status === 'sending'}
            className="rounded-sm bg-stone-900 px-4 py-2 text-sm font-medium text-stone-50 disabled:opacity-50"
          >
            {status === 'sending' ? 'Sending…' : 'Subscribe'}
          </button>
        </form>
      )}
      {status === 'error' && <p className="mt-2 text-sm text-red-700">{message}</p>}
    </section>
  );
}

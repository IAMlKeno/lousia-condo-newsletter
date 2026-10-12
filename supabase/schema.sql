-- Louisa Condominium Newsletter: subscriber storage.
-- Run once in the Supabase SQL editor for project cgizzohujumfqqzgcxxm.
--
-- Access model:
--   * The browser never talks to these tables directly.
--   * Netlify functions use the service role key (kept in Netlify env vars),
--     which bypasses RLS.
--   * RLS is enabled with NO policies, so the anon and authenticated roles
--     cannot read, insert, update or delete anything.

create extension if not exists pgcrypto;

create table if not exists public.subscribers (
  id                uuid primary key default gen_random_uuid(),
  email             text not null unique
                    check (email = lower(email)
                           and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  confirm_token     uuid not null default gen_random_uuid(),
  unsubscribe_token uuid not null default gen_random_uuid(),
  confirmed_at      timestamptz,
  created_at        timestamptz not null default now()
);

-- One row per issue that has been emailed. Prevents resending on rebuilds.
create table if not exists public.newsletter_sends (
  issue_slug      text primary key,
  sent_at         timestamptz not null default now(),
  recipient_count integer not null default 0
);

alter table public.subscribers     enable row level security;
alter table public.newsletter_sends enable row level security;

-- Keep API roles from reaching these tables even if grants are added later.
revoke all on public.subscribers     from anon, authenticated;
revoke all on public.newsletter_sends from anon, authenticated;

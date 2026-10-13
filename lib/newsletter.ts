// Shared settings for newsletter issues. Used by the UI, the comment-submission
// function and the email script, so rules are enforced the same way everywhere.

export const NEWSPAPER_NAME = 'Louisa Condominium Newsletter';

export const DEFAULT_COMMENT_WORD_LIMIT = 300;
// Hard ceiling, whatever an admin enters, to keep comments readable.
export const MAX_COMMENT_WORD_LIMIT = 1000;
/** @deprecated use wordLimitFor() */
export const COMMENT_WORD_LIMIT = DEFAULT_COMMENT_WORD_LIMIT;

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function wordLimitFor(decision?: { wordLimit?: number | null } | null): number {
  const limit = Number(decision?.wordLimit);
  if (!Number.isFinite(limit) || limit <= 0) return DEFAULT_COMMENT_WORD_LIMIT;
  return Math.min(Math.floor(limit), MAX_COMMENT_WORD_LIMIT);
}

// A deadline date means "open until the end of that day" (Atlantic time).
export function isPastDeadline(deadline?: string | Date | null, now = new Date()): boolean {
  if (!deadline) return false;
  const date = deadline instanceof Date ? new Date(deadline) : new Date(deadline);
  if (isNaN(date.getTime())) return false;
  // Tina stores a date as midnight at the start of the day, so allow a full day.
  return now.getTime() >= date.getTime() + 24 * 60 * 60 * 1000;
}

export function formatLongDate(value?: string | Date | null): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Halifax',
  });
}

export function formatShortDate(value?: string | Date | null): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', timeZone: 'America/Halifax' });
}

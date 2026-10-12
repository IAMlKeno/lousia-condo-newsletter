// Shared settings for newsletter issues. Used by both the UI and the
// comment-submission function, so the limit is enforced in both places.

export const NEWSPAPER_NAME = 'Louisa Condominium Newsletter';

export const COMMENT_WORD_LIMIT = 300;

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function isWithinCommentLimit(text: string): boolean {
  const words = countWords(text);
  return words > 0 && words <= COMMENT_WORD_LIMIT;
}

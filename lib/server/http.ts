// Small helpers shared by the Netlify functions. Kept dependency-free.

export type HttpEvent = {
  httpMethod: string;
  body: string | null;
  queryStringParameters?: Record<string, string | undefined> | null;
};

export type HttpResponse = {
  statusCode: number;
  headers?: Record<string, string>;
  body?: string;
};

export function json(statusCode: number, payload: unknown): HttpResponse {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  };
}

export function redirect(location: string): HttpResponse {
  return { statusCode: 302, headers: { Location: location }, body: '' };
}

export function parseJsonBody(body: string | null): Record<string, unknown> | null {
  if (!body) return null;
  try {
    const value = JSON.parse(body);
    return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

// Returns a trimmed string capped at max characters, or '' for non-strings.
export function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string): boolean {
  return value.length <= 254 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
}

export function isUuid(value: string | undefined): value is string {
  return !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

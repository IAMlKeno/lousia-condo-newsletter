export function siteUrl(): string {
  const url = process.env.SITE_URL;
  if (!url) throw new Error('SITE_URL must be set (for example https://your-site.netlify.app).');
  return url.replace(/\/$/, '');
}

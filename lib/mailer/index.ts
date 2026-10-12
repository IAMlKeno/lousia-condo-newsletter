import { EmailJSMailer } from './emailjs';
import { ResendMailer } from './resend';
import type { Mailer } from './types';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} must be set.`);
  return value;
}

// Chooses the provider from MAIL_PROVIDER ("resend" by default, or "emailjs").
export function getMailer(): Mailer {
  const provider = (process.env.MAIL_PROVIDER ?? 'resend').toLowerCase();

  if (provider === 'resend') {
    return new ResendMailer(required('RESEND_API_KEY'), required('MAIL_FROM'));
  }

  if (provider === 'emailjs') {
    return new EmailJSMailer({
      serviceId: required('EMAILJS_SERVICE_ID'),
      templateId: required('EMAILJS_TEMPLATE_ID'),
      publicKey: required('EMAILJS_PUBLIC_KEY'),
      privateKey: required('EMAILJS_PRIVATE_KEY'),
    });
  }

  throw new Error(`Unknown MAIL_PROVIDER "${provider}". Use "resend" or "emailjs".`);
}

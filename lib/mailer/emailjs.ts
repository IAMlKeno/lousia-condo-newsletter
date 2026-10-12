import type { Mailer, OutgoingEmail } from './types';

type EmailJSConfig = {
  serviceId: string;
  templateId: string;
  publicKey: string;
  privateKey: string;
};

// The EmailJS template must use {{{html_message}}} (triple braces) so the
// HTML is not escaped, and {{to_email}} / {{subject}} for the recipient.
export class EmailJSMailer implements Mailer {
  readonly name = 'emailjs';

  constructor(private readonly config: EmailJSConfig) {}

  async send(email: OutgoingEmail): Promise<void> {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: this.config.serviceId,
        template_id: this.config.templateId,
        user_id: this.config.publicKey,
        accessToken: this.config.privateKey,
        template_params: {
          to_email: email.to,
          subject: email.subject,
          html_message: email.html,
          text_message: email.text,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`EmailJS returned ${response.status}: ${await response.text()}`);
    }
  }
}

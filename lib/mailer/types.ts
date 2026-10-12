// The connector interface. Each email provider implements this, so the rest
// of the app never depends on a specific provider.

export type OutgoingEmail = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export interface Mailer {
  readonly name: string;
  send(email: OutgoingEmail): Promise<void>;
}

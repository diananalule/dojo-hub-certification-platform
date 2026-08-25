import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { EmailBlock, renderEmail, renderText } from './email.template';

export interface SendEmailParams {
  to: string;
  subject: string;
  block: EmailBlock;
}

/**
 * Thin wrapper over Resend.
 *
 * Sending never throws into the caller: an email failing must not roll back the
 * action that triggered it — a student's submission is saved whether or not the
 * confirmation email goes out. Failures are logged and reported via the return value.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly client: Resend | null;
  private readonly from: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('email.apiKey');
    this.from = this.configService.get<string>('email.from') ?? 'Dojo Hub Learning Platform <noreply@dojohubug.com>';
    // No key configured (local dev) — run in log-only mode rather than crashing.
    this.client = apiKey ? new Resend(apiKey) : null;
  }

  get isConfigured(): boolean {
    return this.client !== null;
  }

  async send({ to, subject, block }: SendEmailParams): Promise<{ sent: boolean; id?: string; error?: string }> {
    if (!this.client) {
      this.logger.log(`[email disabled] would send "${subject}" to ${to}`);
      return { sent: false, error: 'RESEND_API_KEY not configured' };
    }

    try {
      const { data, error } = await this.client.emails.send({
        from: this.from,
        to,
        subject,
        html: renderEmail(block),
        text: renderText(block),
      });

      if (error) {
        this.logger.error(`Email to ${to} rejected: ${error.message}`);
        return { sent: false, error: error.message };
      }

      this.logger.log(`Email "${subject}" sent to ${to} (${data?.id})`);
      return { sent: true, id: data?.id };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'unknown error';
      this.logger.error(`Email to ${to} failed: ${message}`);
      return { sent: false, error: message };
    }
  }
}

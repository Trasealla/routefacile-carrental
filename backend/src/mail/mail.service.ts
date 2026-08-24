import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MailResponse } from 'src/entities/mail.response.entity';
import { Repository } from 'typeorm';
import * as hbs from 'handlebars'
import { promises as fs } from 'fs';
import { join } from 'path';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private hrTransporter: nodemailer.Transporter | null = null;
  private hrFrom: string | null = null;

  /**
   * Addresses copied on every outgoing mail, on top of whatever the caller
   * passes. The business wants its own archive of customer correspondence in a
   * mailbox separate from the sending account, so a copy goes there whether or
   * not the calling code remembered to ask for one.
   *
   * Comma-separated in MAIL_CC. Set MAIL_CC to an empty string to disable.
   */
  private readonly standingCc: string[] = (
    process.env.MAIL_CC ?? 'routefacilerental@gmail.com'
  )
    .split(',')
    .map((a) => a.trim())
    .filter(Boolean);

  /**
   * Merge the standing CC list into a per-call one, dropping duplicates and
   * anyone already on the To line — being both a recipient and a CC gets a
   * message flagged by some providers, and reads as a mistake to the customer.
   */
  private withStandingCc(cc: string[] = [], to = ''): string[] {
    const toList = String(to)
      .split(',')
      .map((a) => a.trim().toLowerCase())
      .filter(Boolean);
    const seen = new Set(toList);
    const merged: string[] = [];
    for (const addr of [...(cc || []), ...this.standingCc]) {
      const key = String(addr).trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      merged.push(String(addr).trim());
    }
    return merged;
  }

  constructor(
    private mailerService: MailerService,
    @InjectRepository(MailResponse) private mailResponseRepository: Repository<MailResponse>
  ) {
    hbs.registerHelper('formatDate', (date: string) => {
      const dt = new Date(date);
      return dt.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: 'Africa/Casablanca',
      }) + ' (Morocco)';
    });
    hbs.registerHelper('ifEquals', function(arg1, arg2, options) {
      return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
  });
  }

  /**
   * Boot-time SMTP diagnostics: prints (masked) connection config and verifies
   * the transport so failures are surfaced in the container logs immediately
   * instead of only when the first email is attempted.
   */
  async onModuleInit() {
    const host = process.env.MAIL_HOST;
    const port = process.env.MAIL_PORT;
    const user = process.env.MAIL_USERNAME;
    const from = process.env.MAIL_FROM || process.env.MAIL_FROM_ADDRESS;
    const pass = process.env.MAIL_PASSWORD;

    this.logger.log(`SMTP config -> host=${host || '(missing)'} port=${port || '(missing)'} user=${user || '(missing)'} from=${from || '(missing)'} password=${pass ? '***set***' : '(missing)'}`);

    if (!host || !port || !user || !pass) {
      this.logger.error('SMTP is NOT configured — emails will fail. Set MAIL_HOST/MAIL_PORT/MAIL_USERNAME/MAIL_PASSWORD/MAIL_FROM_ADDRESS in .env');
      return;
    }

    try {
      const transporter: any = (this.mailerService as any).transporter;
      if (transporter && typeof transporter.verify === 'function') {
        await transporter.verify();
        this.logger.log('SMTP transport verified OK');
      }
    } catch (err) {
      this.logger.error(`SMTP transport verification FAILED: ${(err as any)?.message || err}`);
    }

    // -------- Dedicated HR transport (M365 by default) ----------
    const hrHost = process.env.HR_MAIL_HOST || 'smtp.office365.com';
    const hrPort = parseInt(process.env.HR_MAIL_PORT || '587', 10);
    const hrUser = process.env.HR_MAIL_USERNAME;
    const hrPass = process.env.HR_MAIL_PASSWORD;
    const hrFromAddr = process.env.HR_MAIL_FROM || hrUser;
    const hrFromName = process.env.HR_MAIL_FROM_NAME || 'Route Facile Car Rental - Morocco';

    if (hrUser && hrPass && hrFromAddr) {
      this.hrTransporter = nodemailer.createTransport({
        host: hrHost,
        port: hrPort,
        secure: hrPort === 465,
        requireTLS: hrPort !== 465,
        auth: { user: hrUser, pass: hrPass },
        tls: { ciphers: 'TLSv1.2', rejectUnauthorized: false },
        pool: true,
        maxConnections: 2,
        maxMessages: 50,
        connectionTimeout: 15_000,
        greetingTimeout: 10_000,
        socketTimeout: 30_000,
      });
      this.hrFrom = `${hrFromName} <${hrFromAddr}>`;
      this.logger.log(`HR SMTP config -> host=${hrHost} port=${hrPort} user=${hrUser} from=${this.hrFrom}`);
      try {
        await this.hrTransporter.verify();
        this.logger.log('HR SMTP transport verified OK');
      } catch (err) {
        this.logger.error(`HR SMTP verification FAILED: ${(err as any)?.message || err}`);
      }
    } else {
      this.logger.warn('HR SMTP not configured (HR_MAIL_USERNAME/HR_MAIL_PASSWORD missing) — HR emails will fall back to default transport.');
    }
  }

  /** True if the dedicated HR (M365) transport was initialised at boot. */
  isHrConfigured(): boolean {
    return !!this.hrTransporter;
  }

  /**
   * Send an email through the dedicated HR (M365) transport.
   * Falls back to the default transport if HR SMTP is not configured.
   * Persists the same `mail_responses` audit row as send().
   */
  async sendHr(
    to: string,
    subject: string,
    template: string,
    context: object,
    cc: string[] = [],
    reference_number: number | null = null,
    attachments: any[] = [],
  ) {
    if (!this.hrTransporter) {
      // send() applies the standing CC itself — don't add it twice.
      return this.send(to, subject, template, context, cc, reference_number, attachments);
    }
    cc = this.withStandingCc(cc, to);
    const templatePath = join(__dirname, 'templates', `${template}.hbs`);
    let renderedTemplate = '';
    try {
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      renderedTemplate = hbs.compile(templateContent)(context);
    } catch (err) {
      this.logger.error(`Failed to render HR template ${template}: ${(err as any)?.message || err}`);
      throw err;
    }

    try {
      const response = await this.hrTransporter.sendMail({
        from: this.hrFrom!,
        to,
        cc,
        subject,
        html: renderedTemplate,
        attachments,
      });

      await this.mailResponseRepository.save(this.mailResponseRepository.create({
        to, subject, template: renderedTemplate, cc,
        reference_number,
        response: response.response || JSON.stringify(response),
        status: 1,
      }));
      return response;
    } catch (error) {
      this.logger.error(`HR email send failed for ${to}: ${(error as any)?.message || error}`);
      try {
        await this.mailResponseRepository.save(this.mailResponseRepository.create({
          to, subject,
          template: typeof error === 'string' ? error : JSON.stringify(error),
          cc, reference_number,
          response: typeof error === 'string' ? error : JSON.stringify(error),
          status: 0,
        }));
      } catch (dbError) {
        this.logger.error(`Failed to persist HR email error: ${(dbError as any)?.message || dbError}`);
      }
      throw error;
    }
  }

  async send(
    to: string,
    subject: string,
    template: string,
    context: object,
    cc: string[],
    reference_number = null,
    attachments = [],
    options: { throwOnError?: boolean } = {},
  ) {
    cc = this.withStandingCc(cc, to);
    try {
      // Helper that retries once on transient SMTP failures (4xx codes such as
      // "451 Temporary local problem" from SiteGround). Permanent (5xx) errors
      // are not retried because they will never succeed.
      const sendOnce = () => this.mailerService.sendMail({
        to: to,
        subject: subject,
        template: template,
        context: context,
        cc: cc,
        attachments: attachments
      });

      const isTransient = (err: any) => {
        const code = Number(err?.responseCode);
        return code >= 400 && code < 500;
      };

      let response: any;
      try {
        response = await sendOnce();
      } catch (err) {
        if (isTransient(err)) {
          console.warn(`Transient SMTP error (${err?.responseCode}), retrying once in 3s...`);
          await new Promise(res => setTimeout(res, 3000));
          response = await sendOnce();
        } else {
          throw err;
        }
      }

      // Construct the path to the template file
      const templatePath = join(__dirname, 'templates', `${template}.hbs`,);
      const templateContent = await fs.readFile(templatePath, 'utf-8');

      // Compile the template with the provided context
      const compiledTemplate = hbs.compile(templateContent);
      const renderedTemplate = compiledTemplate(context);

      const mailResponse = this.mailResponseRepository.create({
        to: to,
        subject: subject,
        template: renderedTemplate,
        cc: cc,
        reference_number: reference_number,
        response: response.response,
        status: 1,
      });

      await this.mailResponseRepository.save(mailResponse);

    } catch (error) {
      console.error('Error sending email:', error);

      try {
        const mailResponse = this.mailResponseRepository.create({
          to: to,
          subject: subject,
          template: typeof error === 'string' ? error : JSON.stringify(error),
          cc: cc,
          reference_number: reference_number,
          response: typeof error === 'string' ? error : JSON.stringify(error),
          status: 0,
        });

        await this.mailResponseRepository.save(mailResponse);
      } catch (dbError) {
        console.error('Error saving failed email record:', dbError);
      }

      // Don't throw by default - let the caller decide how to handle failures.
      // Errors are already logged and saved to database. Pass {throwOnError:true}
      // from diagnostic endpoints (e.g. /mail/test) to bubble the error up.
      if (options.throwOnError) throw error;
    }
  }
}

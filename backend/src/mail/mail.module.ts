import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { join } from 'path';
import { MailController } from './mail.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailResponse } from 'src/entities/mail.response.entity';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: parseInt(process.env.MAIL_PORT) || 587,
        // Port 465 = implicit TLS, anything else = STARTTLS upgrade.
        secure: parseInt(process.env.MAIL_PORT) === 465,
        requireTLS: parseInt(process.env.MAIL_PORT) !== 465,
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
        },
        tls: {
          // SiteGround / shared hosts sometimes have hostname mismatches on
          // shared TLS certs; do not fail validation but still encrypt.
          rejectUnauthorized: false,
        },
        // Use a connection pool so consecutive emails (e.g. HR notification +
        // applicant confirmation) reuse the same authenticated session instead
        // of opening a brand new connection each time. SiteGround throttles
        // rapid auth attempts and returns "451 Temporary local problem".
        pool: true,
        maxConnections: 3,
        maxMessages: 50,
        // Cap outgoing rate so we never exceed shared-hosting policy
        // (SiteGround typically allows ~30 msgs/min).
        rateDelta: 60_000,
        rateLimit: 20,
        // Network timeouts so a stuck SMTP socket can't hang forever.
        connectionTimeout: 15_000,
        greetingTimeout: 10_000,
        socketTimeout: 30_000,
        // debug: true,
        // logger: true,
      },
      defaults: {
        // Support both MAIL_FROM and Laravel-style MAIL_FROM_ADDRESS.
        from: `${process.env.MAIL_FROM_NAME || 'Route Facile Car Rental - Morocco'} <${process.env.MAIL_FROM || process.env.MAIL_FROM_ADDRESS}>`,
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    TypeOrmModule.forFeature([MailResponse])
  ],
  providers: [MailService],
  exports: [MailService],
  controllers: [MailController],
})
export class MailModule { }
import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

/**
 * Verifies the `X-Webhook-Signature` header on inbound content-engine requests.
 *
 * The header looks like `sha256=<hex>` and is an HMAC-SHA256 of the raw request
 * body keyed with the shared secret. This is the ONLY thing standing between the
 * open internet and an endpoint that writes to the blogs table, so it is
 * deliberately strict:
 *
 *   • Verified against `req.rawBody` — the exact bytes received. Re-serialising
 *     the parsed JSON would not reproduce them (key order, whitespace and
 *     unicode escaping all differ), so a correct signature would be rejected.
 *
 *   • Compared with `crypto.timingSafeEqual`. A plain `===` on a hex string
 *     leaks, through timing, how many leading characters were right, which is
 *     enough to recover a signature byte by byte.
 *
 *   • If the secret is not configured, every request is rejected. Failing open
 *     here would leave the endpoint writable by anyone who found the URL.
 */
@Injectable()
export class WebhookSignatureGuard implements CanActivate {
  private readonly logger = new Logger(WebhookSignatureGuard.name);

  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const secret = this.configService.get<string>('CONTENT_WEBHOOK_SECRET');

    if (!secret) {
      this.logger.error('CONTENT_WEBHOOK_SECRET is not set — rejecting webhook');
      throw new UnauthorizedException('Webhook is not configured');
    }

    const header = String(request.headers['x-webhook-signature'] || '');
    if (!header) {
      throw new UnauthorizedException('Missing X-Webhook-Signature header');
    }

    const rawBody: Buffer | undefined = request.rawBody;
    if (!rawBody || !rawBody.length) {
      // Means the raw-body parser in main.ts did not run for this path.
      this.logger.error('rawBody missing — check the body parser scope in main.ts');
      throw new UnauthorizedException('Cannot verify signature');
    }

    // Accept both "sha256=<hex>" and a bare hex digest.
    const provided = header.startsWith('sha256=') ? header.slice(7).trim() : header.trim();
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    const a = Buffer.from(provided, 'hex');
    const b = Buffer.from(expected, 'hex');

    // timingSafeEqual throws on a length mismatch, so check length first — and
    // treat a wrong length as simply invalid rather than a 500.
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      this.logger.warn('Webhook signature mismatch — request rejected');
      throw new UnauthorizedException('Invalid signature');
    }

    return true;
  }
}

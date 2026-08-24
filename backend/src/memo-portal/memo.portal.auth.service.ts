import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { MemoPortalUserService } from './memo.portal.user.service';
import { MemoPortalOtpService, MEMO_PORTAL_OTP_LIMITS } from './memo.portal.otp.service';

@Injectable()
export class MemoPortalAuthService {
  private readonly logger = new Logger(MemoPortalAuthService.name);

  constructor(
    private readonly userService: MemoPortalUserService,
    private readonly otpService: MemoPortalOtpService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private allowedDomains(): string[] {
    const raw =
      this.configService.get<string>('MEMO_PORTAL_ALLOWED_DOMAINS') ||
      'routefacilecarrental.com';
    return raw.split(',').map((d) => d.trim().toLowerCase()).filter(Boolean);
  }

  private validateEmailOrThrow(email: string): string {
    if (!email || typeof email !== 'string') {
      throw new BadRequestException('Email is required');
    }
    const lower = email.trim().toLowerCase();
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(lower)) throw new BadRequestException('Invalid email address');
    const domain = lower.split('@')[1];
    if (!this.allowedDomains().includes(domain)) {
      throw new BadRequestException('Email domain is not allowed for this portal');
    }
    return lower;
  }

  async requestPin(emailRaw: string, ip?: string): Promise<{ message: string; expires_in_minutes: number }> {
    // Always respond with success regardless of DB / mail / user state.
    // We deliberately do NOT reveal whether the email exists, whether the
    // memo_portal_users / memo_portal_otp tables are reachable, or whether
    // the SMTP send succeeded. Any failure is logged and swallowed.
    let email: string;
    try {
      email = this.validateEmailOrThrow(emailRaw);
    } catch (err) {
      // Even invalid emails get a generic success response, per request.
      this.logger.warn(`requestPin: ignored invalid email "${emailRaw}": ${err?.message || err}`);
      return {
        message: 'A PIN has been sent to your email address.',
        expires_in_minutes: MEMO_PORTAL_OTP_LIMITS.PIN_TTL_MINUTES,
      };
    }

    try {
      const user = await this.userService.findByEmail(email).catch(() => null);
      if (user && user.status === 0) {
        this.logger.warn(`requestPin: blocked account ${email} - returning generic success`);
        return {
          message: 'A PIN has been sent to your email address.',
          expires_in_minutes: MEMO_PORTAL_OTP_LIMITS.PIN_TTL_MINUTES,
        };
      }

      const recent = await this.otpService.countRecentRequests(email).catch(() => 0);
      if (recent >= MEMO_PORTAL_OTP_LIMITS.MAX_REQUESTS_PER_WINDOW) {
        this.logger.warn(`requestPin: rate limit hit for ${email} - returning generic success`);
        return {
          message: 'A PIN has been sent to your email address.',
          expires_in_minutes: MEMO_PORTAL_OTP_LIMITS.PIN_TTL_MINUTES,
        };
      }

      const issued = await this.otpService.issuePin(email, ip).catch((err) => {
        this.logger.error(`requestPin: issuePin failed for ${email}: ${err?.message || err}`);
        return null as null | { pin: string; expires_at: Date };
      });

      if (issued) {
        try {
          await this.mailService.send(
            email,
            'Your Route Facile Memo Portal sign-in PIN',
            'memo_portal_pin',
            {
              pin: issued.pin,
              expires_in_minutes: MEMO_PORTAL_OTP_LIMITS.PIN_TTL_MINUTES,
              expires_at: issued.expires_at.toISOString(),
              file_server: process.env.FILE_SERVER,
            },
            [],
          );
        } catch (err) {
          this.logger.error(`Failed to send PIN email to ${email}: ${err?.message || err}`);
        }
      }
    } catch (err) {
      this.logger.error(`requestPin: unexpected error for ${email}: ${err?.message || err}`);
    }

    return {
      message: 'A PIN has been sent to your email address.',
      expires_in_minutes: MEMO_PORTAL_OTP_LIMITS.PIN_TTL_MINUTES,
    };
  }

  async verifyPin(emailRaw: string, pin: string) {
    const email = this.validateEmailOrThrow(emailRaw);
    if (!pin || typeof pin !== 'string') {
      throw new BadRequestException('PIN is required');
    }
    const trimmed = pin.trim();
    if (!/^\d{4,8}$/.test(trimmed)) {
      throw new BadRequestException('Invalid PIN format');
    }

    const result = await this.otpService.verifyPin(email, trimmed);
    if (!result.ok) {
      const reasonMap: Record<string, string> = {
        expired: 'PIN has expired. Please request a new one.',
        invalid: 'Invalid PIN. Please try again.',
        locked: 'Too many incorrect attempts. Please request a new PIN.',
        not_found: 'No active PIN for this email. Please request one.',
      };
      throw new UnauthorizedException(reasonMap[result.reason] || 'PIN verification failed');
    }

    const user = await this.userService.upsertOnLogin(email);
    if (user.status === 0) {
      throw new UnauthorizedException('This account is blocked');
    }

    const payload = { sub: user.id, email: user.email, scope: 'portal' as const };
    const access_token = this.jwtService.sign(payload, {
      secret:
        this.configService.get<string>('PORTAL_JWT_SECRET') ||
        this.configService.get<string>('ADMIN_JWT_SECRET'),
      expiresIn: this.configService.get<string>('PORTAL_JWT_EXPIRY') || '12h',
    });

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        first_login_at: user.first_login_at,
        last_login_at: user.last_login_at,
      },
    };
  }
}

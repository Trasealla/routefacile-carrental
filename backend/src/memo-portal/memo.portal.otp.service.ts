import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { MemoPortalOtp } from 'src/entities/memo.portal.otp.entity';

const PIN_LENGTH = 6;
const PIN_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const REQUEST_WINDOW_MINUTES = 15;
const MAX_REQUESTS_PER_WINDOW = 3;

@Injectable()
export class MemoPortalOtpService {
  constructor(@InjectRepository(MemoPortalOtp) private readonly repo: Repository<MemoPortalOtp>) {}

  private generatePin(): string {
    const max = Math.pow(10, PIN_LENGTH);
    const n = Math.floor(Math.random() * max);
    return n.toString().padStart(PIN_LENGTH, '0');
  }

  async countRecentRequests(email: string): Promise<number> {
    const since = new Date(Date.now() - REQUEST_WINDOW_MINUTES * 60_000);
    return this.repo.count({ where: { email: email.toLowerCase(), created_at: MoreThan(since) } as any });
  }

  /**
   * Generate a new PIN for the email, invalidating any active prior PINs.
   * Returns the plaintext PIN (caller emails it).
   */
  async issuePin(email: string, ip?: string): Promise<{ pin: string; expires_at: Date }> {
    const lower = email.toLowerCase();
    // Invalidate previous active PINs for this email.
    await this.repo.update({ email: lower, used: 0 } as any, { used: 1 } as any);

    const pin = this.generatePin();
    const pin_hash = await bcrypt.hash(pin, 10);
    const expires_at = new Date(Date.now() + PIN_TTL_MINUTES * 60_000);
    await this.repo.insert({
      email: lower,
      pin_hash,
      expires_at,
      attempts: 0,
      used: 0,
      ip: ip || null,
    } as any);
    return { pin, expires_at };
  }

  /**
   * Verify the PIN for the email. Returns true on success and marks the OTP
   * record as used. On failure increments attempts; once attempts >= MAX_ATTEMPTS
   * the record is invalidated.
   */
  async verifyPin(email: string, pin: string): Promise<{ ok: boolean; reason?: 'expired' | 'invalid' | 'locked' | 'not_found' }> {
    const lower = email.toLowerCase();
    const otp = await this.repo.findOne({
      where: { email: lower, used: 0 } as any,
      order: { created_at: 'DESC' } as any,
    });
    if (!otp) return { ok: false, reason: 'not_found' };
    if (otp.expires_at && otp.expires_at.getTime() < Date.now()) {
      await this.repo.update({ id: otp.id }, { used: 1 } as any);
      return { ok: false, reason: 'expired' };
    }
    if (otp.attempts >= MAX_ATTEMPTS) {
      await this.repo.update({ id: otp.id }, { used: 1 } as any);
      return { ok: false, reason: 'locked' };
    }
    const match = await bcrypt.compare(pin, otp.pin_hash);
    if (!match) {
      await this.repo.update({ id: otp.id }, { attempts: otp.attempts + 1 } as any);
      if (otp.attempts + 1 >= MAX_ATTEMPTS) {
        await this.repo.update({ id: otp.id }, { used: 1 } as any);
        return { ok: false, reason: 'locked' };
      }
      return { ok: false, reason: 'invalid' };
    }
    await this.repo.update({ id: otp.id }, { used: 1 } as any);
    return { ok: true };
  }

  /** Periodic cleanup helper (can be wired to a cron later). */
  async purgeExpired(): Promise<void> {
    await this.repo.delete({ expires_at: LessThan(new Date(Date.now() - 24 * 60 * 60_000)) } as any);
  }
}

export const MEMO_PORTAL_OTP_LIMITS = {
  PIN_LENGTH,
  PIN_TTL_MINUTES,
  MAX_ATTEMPTS,
  REQUEST_WINDOW_MINUTES,
  MAX_REQUESTS_PER_WINDOW,
};

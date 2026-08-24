import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CancellationAudit } from 'src/entities/cancellation.audit.entity';

/** Maximum cancellations allowed per user per UAE calendar day */
const DAILY_CANCEL_LIMIT = 1;

/** UTC offset for Asia/Dubai (no DST) */
const UAE_UTC_OFFSET_HOURS = 4;

@Injectable()
export class CancellationPolicyService {
  constructor(
    @InjectRepository(CancellationAudit)
    private readonly auditRepo: Repository<CancellationAudit>,
  ) {}

  /**
   * Returns the current UAE date string 'YYYY-MM-DD'.
   */
  getUaeBusinessDate(): string {
    const now = new Date();
    const uaeTime = new Date(now.getTime() + UAE_UTC_OFFSET_HOURS * 60 * 60 * 1000);
    return uaeTime.toISOString().slice(0, 10);
  }

  /**
   * Count how many successful cancellations a user has made today (UAE time).
   */
  async getTodayCancellationCount(userId: number): Promise<number> {
    const uaeDate = this.getUaeBusinessDate();
    return this.auditRepo.count({
      where: {
        user_id: userId,
        uae_business_date: uaeDate,
      },
    });
  }

  /**
   * Check whether the user is eligible to cancel today.
   * Returns an object with eligibility status and metadata.
   */
  async checkEligibility(userId: number): Promise<{
    canCancel: boolean;
    cancellationsToday: number;
    dailyLimit: number;
    uaeBusinessDate: string;
    allowedActions: string[];
  }> {
    const uaeDate = this.getUaeBusinessDate();
    const count = await this.getTodayCancellationCount(userId);
    const canCancel = count < DAILY_CANCEL_LIMIT;

    return {
      canCancel,
      cancellationsToday: count,
      dailyLimit: DAILY_CANCEL_LIMIT,
      uaeBusinessDate: uaeDate,
      allowedActions: canCancel ? [] : ['modify_booking', 'pay_now'],
    };
  }

  /**
   * Enforce the daily cancellation limit.
   * Throws BadRequestException with structured body when limit is reached.
   */
  async enforceLimit(userId: number): Promise<void> {
    const eligibility = await this.checkEligibility(userId);
    if (!eligibility.canCancel) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'CANCEL_DAILY_LIMIT_REACHED',
        message:
          'You have reached the daily cancellation limit. You may modify your booking or proceed to pay now.',
        cancellationsToday: eligibility.cancellationsToday,
        dailyLimit: eligibility.dailyLimit,
        uaeBusinessDate: eligibility.uaeBusinessDate,
        allowedActions: eligibility.allowedActions,
      });
    }
  }

  /**
   * Record a successful cancellation in the audit table.
   */
  async recordCancellation(
    userId: number,
    bookingId: number,
    cancellationReason?: string,
  ): Promise<CancellationAudit> {
    const audit = this.auditRepo.create({
      user_id: userId,
      booking_id: bookingId,
      uae_business_date: this.getUaeBusinessDate(),
      cancellation_reason: cancellationReason,
    });
    return this.auditRepo.save(audit);
  }
}

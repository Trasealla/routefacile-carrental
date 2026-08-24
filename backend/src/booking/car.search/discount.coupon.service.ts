import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DiscountCoupon } from 'src/entities/discount.coupon.entity';
import { Booking } from 'src/entities/booking.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';
import { DiscountCouponDto } from '../dtos/discount.coupon.dto';
import { getCurrentDate } from 'src/admin/utils/date.util';
import { EDC_PROMO_CONFIG, TEST_EDC_MEMBERS } from 'src/user.form/edc.verification/edc.verification.service';
import { CouponTypes } from 'src/entities/enums/coupon.type';

@Injectable()
export class DiscountCouponService extends BaseService<DiscountCoupon> {
    
    static ACTIVE = 1;

    /**
     * Coupon codes that are restricted to a single successful use per
     * customer. Once any of these codes appears on a confirmed booking
     * for a given user, the same user cannot reuse it on future bookings.
     * Codes are matched case-insensitively.
     */
    static SINGLE_USE_PER_USER_CODES: string[] = ['NEWAPP'];

    constructor(
        @InjectRepository(DiscountCoupon) repo: Repository<DiscountCoupon>,
    ) {
        super(repo)
    }

    /**
     * Enforce one-time use of certain promo codes per customer. If the
     * provided coupon code is in SINGLE_USE_PER_USER_CODES and the user
     * already has a prior booking with that code, throw 400.
     */
    async assertSingleUsePerUser(code: string | null | undefined, userId: number | null | undefined) {
        if (!code || !userId) {
            return;
        }

        const normalized = code.trim().toUpperCase();
        const restricted = DiscountCouponService.SINGLE_USE_PER_USER_CODES
            .map(c => c.toUpperCase());
        if (!restricted.includes(normalized)) {
            return;
        }

        const existing = await this.repository.manager
            .getRepository(Booking)
            .createQueryBuilder('b')
            .where('b.user_id = :userId', { userId })
            .andWhere('UPPER(b.coupon_code) = :code', { code: normalized })
            .limit(1)
            .getCount();

        if (existing > 0) {
            throw new BadRequestException(
                `Promo code ${normalized} can only be used once per customer`,
            );
        }
    }

    /**
     * Check if the coupon is the special EDC promo code
     * EDC promo codes are handled separately from regular discount coupons
     */
    private isEdcPromoCode(code: string): boolean {
        return code?.toUpperCase() === EDC_PROMO_CONFIG.code.toUpperCase();
    }

    /**
     * Validate EDC promo code
     * Returns true if valid, throws BadRequestException if invalid
     */
    private validateEdcPromoCode(pickupDate: string): boolean {
        const today = getCurrentDate();
        
        // Check if promo is expired
        if (EDC_PROMO_CONFIG.valid_until < today) {
            throw new BadRequestException('EDC promo code has expired');
        }
        
        // Check if promo has started
        if (EDC_PROMO_CONFIG.valid_from > today) {
            throw new BadRequestException('EDC promo code is not yet active');
        }
        
        // Check pickup date is within valid range
        if (EDC_PROMO_CONFIG.valid_until < pickupDate) {
            throw new BadRequestException('EDC promo code is not valid for the selected pickup date');
        }
        
        return true;
    }

    async validateDiscountCoupon(body: DiscountCouponDto) {
        if (body.discount_coupon) {
            
            // Check if it's the EDC promo code - handle separately
            if (this.isEdcPromoCode(body.discount_coupon)) {
                this.validateEdcPromoCode(body.pickup_date);
                return; // EDC promo code is valid
            }
            
            // Regular coupon validation
            const coupon_where = { code: body.discount_coupon, type: body.booking_type }
            const discount_coupon = await this.getOne(coupon_where);

            if (!discount_coupon) {
                throw new BadRequestException('Discount coupon does not exist');
            }
            const today = getCurrentDate()

            if (discount_coupon.end_date < today) {
                throw new BadRequestException('Discount coupon is expired');
            }

            if (discount_coupon.end_date < body.pickup_date) {
                throw new BadRequestException('Incorrect date range for discount coupon');
            }

            if (discount_coupon.start_date > body.pickup_date) {
                throw new BadRequestException('Incorrect date range for discount coupon');
            }

            // Single-use / limited-use coupon enforcement
            if (
                discount_coupon.usage_limit !== null &&
                discount_coupon.usage_limit !== undefined &&
                discount_coupon.usage_count >= discount_coupon.usage_limit
            ) {
                throw new BadRequestException('Discount coupon has already been used and is no longer valid');
            }
        }
    }

    /**
     * Atomically increment a coupon's usage_count after a successful booking.
     * For single-use / limited-use coupons (usage_limit IS NOT NULL) the
     * UPDATE is guarded so we never exceed the limit even under concurrent
     * confirmations. Safe to call with a null/undefined coupon.
     */
    async consumeCoupon(coupon: DiscountCoupon | null | undefined): Promise<boolean> {
        if (!coupon || !coupon.id) {
            return false;
        }

        const result = await this.repository
            .createQueryBuilder()
            .update()
            .set({ usage_count: () => 'usage_count + 1' } as any)
            .where('id = :id', { id: coupon.id })
            .andWhere('(usage_limit IS NULL OR usage_count < usage_limit)')
            .execute();

        return result.affected > 0;
    }

    /**
     * Admin listing helper that supports filtering by single-use vs unlimited
     * coupons (in addition to the standard `type` filter).
     *
     *  is_single_use === 1 → only coupons with usage_limit IS NOT NULL
     *  is_single_use === 0 → only coupons with usage_limit IS NULL
     *  undefined           → no extra filter
     */
    async listForAdmin(filters: { type?: string; is_single_use?: number; page?: number; page_size?: number }) {
        const qb = this.repository.createQueryBuilder('entity');

        // Join the creator so the admin list can show a name instead of a bare id.
        qb.leftJoinAndSelect('entity.created_by_admin', 'created_by_admin');

        if (filters.type) {
            qb.andWhere('entity.type = :type', { type: filters.type });
        } else {
            qb.andWhere('entity.type = :type', { type: CouponTypes.DAILY });
        }

        if (filters.is_single_use === 1) {
            qb.andWhere('entity.usage_limit IS NOT NULL');
        } else if (filters.is_single_use === 0) {
            qb.andWhere('entity.usage_limit IS NULL');
        }

        const total_records = await qb.clone().getCount();

        qb.orderBy('entity.id', 'DESC');

        // Honour the caller's paging. Without this the admin list fetched every
        // coupon on every request while still rendering pagination controls.
        const page = Number(filters.page) > 0 ? Number(filters.page) : 1;
        const page_size = Number(filters.page_size) > 0 ? Number(filters.page_size) : 25;
        qb.skip((page - 1) * page_size).take(page_size);

        const data = await qb.getMany();

        return { data, total_records };
    }

    /**
     * Bulk-create discount coupons sharing the same template (rates, dates,
     * scope, etc.) but each with its own unique `code`.
     *
     * Returns a per-code result so the admin UI can show which codes were
     * persisted and which (if any) were skipped because the code already
     * existed.
     */
    async bulkCreate(
        codes: string[],
        template: Omit<DiscountCouponDto, 'discount_coupon'> & Partial<DiscountCoupon>,
    ): Promise<{ created: string[]; skipped: { code: string; reason: string }[] }> {
        const created: string[] = [];
        const skipped: { code: string; reason: string }[] = [];

        // De-duplicate input codes (case-sensitive match, trimmed)
        const unique_codes = Array.from(
            new Set(codes.map(c => (c || '').trim()).filter(Boolean)),
        );

        // Uniqueness is per (code, type), so we must scope the duplicate
        // check to the template's type — same code in daily vs monthly is OK.
        const template_type = (template as any).type;

        for (const code of unique_codes) {
            const existing = await this.repository.findOne({
                where: { code, type: template_type } as any,
            });
            if (existing) {
                skipped.push({ code, reason: `Code already exists for type ${template_type}` });
                continue;
            }
            try {
                await this.repository.insert({ ...(template as any), code });
                created.push(code);
            } catch (error) {
                skipped.push({ code, reason: error.message || 'Insert failed' });
            }
        }

        return { created, skipped };
    }
}
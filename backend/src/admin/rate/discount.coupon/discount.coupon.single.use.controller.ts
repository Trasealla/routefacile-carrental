import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Inject,
    NotFoundException,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
    Request,
    UseGuards,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';
import { CouponTypes } from 'src/entities/enums/coupon.type';
import { DiscountCouponService } from 'src/booking/car.search/discount.coupon.service';
import { DiscountCouponDto } from './discount.coupon.dto';
import { DiscountCouponBulkDto } from './discount.coupon.bulk.dto';
import { DiscountCouponSingleUseListingDto } from './discount.coupon.single.use.listing.dto';
import { CouponBulkCharsets } from 'src/entities/enums/coupon.bulk.charset';

/**
 * Single-use / limited-use discount coupons.
 *
 * This controller is fully separate from the legacy regular-coupon
 * controller (`/admin/discount/coupon`). It manages ONLY coupons whose
 * `usage_limit IS NOT NULL` (>= 1). Listing always filters those rows;
 * create/update force a positive `usage_limit` (default 1); detail/edit/
 * delete return 404 for any row that belongs to the regular coupons section.
 */
@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/discount/coupon/single-use')
export class DiscountCouponSingleUseController {

    constructor(
        @Inject(DiscountCouponService) private discountCouponService: DiscountCouponService,
    ) {}

    @Get()
    async listing(@Query() params: DiscountCouponSingleUseListingDto) {
        return await this.discountCouponService.listForAdmin({
            type: params.type || CouponTypes.DAILY,
            is_single_use: 1,
            page: params.page,
            page_size: params.page_size,
        });
    }

    @Get(':id')
    async detail(@Param('id', ParseIntPipe) id: number) {
        const response = await this.discountCouponService.getOne({ id });
        if (!response || response.usage_limit === null) {
            throw new NotFoundException();
        }
        return response;
    }

    @Post()
    async store(@Body() body: DiscountCouponDto, @Request() req) {
        body.created_by = req.user.id;
        // Force a single-use / limited-use coupon. Default to 1 if not given.
        if (body.usage_limit === undefined || body.usage_limit === null) {
            body.usage_limit = 1;
        }
        if (body.usage_limit < 1) {
            throw new BadRequestException('usage_limit must be a positive integer');
        }
        return await this.discountCouponService.insert(body);
    }

    /**
     * Bulk-create single-use / limited-use coupons that share the same rates
     * and scope but each get their own unique code. Always single-use here:
     * `usage_limit` defaults to 1 and must be >= 1.
     *
     * Either `codes` (explicit list) OR `count` (auto-generate) must be
     * supplied. When auto-generating, codes use `prefix` (optional) followed
     * by random alphanumeric chars to reach `code_length` (default 10).
     */
    @Post('bulk')
    async bulkStore(@Body() body: DiscountCouponBulkDto, @Request() req) {
        body.created_by = req.user.id;
        if (body.usage_limit === undefined || body.usage_limit === null) {
            body.usage_limit = 1;
        }
        if (body.usage_limit < 1) {
            throw new BadRequestException('usage_limit must be a positive integer');
        }

        const codes = body.codes && body.codes.length > 0
            ? body.codes
            : await this.generateCodes(
                body.count,
                body.prefix || '',
                body.code_length || 10,
                body.charset || CouponBulkCharsets.ALPHANUMERIC,
                body.type,
              );

        const {
            codes: _omit_codes,
            count: _omit_count,
            prefix: _omit_prefix,
            code_length: _omit_len,
            charset: _omit_charset,
            ...template
        } = body as any;

        return await this.discountCouponService.bulkCreate(codes, template);
    }

    @Put(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() body: DiscountCouponDto, @Request() req) {
        const coupon = await this.discountCouponService.getOne({ id });
        if (!coupon || coupon.usage_limit === null) {
            throw new NotFoundException();
        }

        body.updated_by = req.user.id;
        if (body.usage_limit === undefined || body.usage_limit === null) {
            body.usage_limit = coupon.usage_limit;
        }
        if (body.usage_limit < 1) {
            throw new BadRequestException('usage_limit must be a positive integer');
        }
        // Don't let admins shrink the limit below what was already redeemed
        // (would silently mark the coupon used-up forever).
        if (body.usage_limit < coupon.usage_count) {
            throw new BadRequestException(
                `usage_limit (${body.usage_limit}) cannot be less than the current usage_count (${coupon.usage_count})`,
            );
        }

        return await this.discountCouponService.update({ id }, body);
    }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        const response = await this.discountCouponService.getOne({ id });
        if (!response || response.usage_limit === null) {
            throw new NotFoundException();
        }
        return await this.discountCouponService.softDelete({ id });
    }

    /**
     * Generate `count` unique random codes using the chosen alphabet.
     * Suffix length = code_length - prefix.length (min 4). Uniqueness is
     * checked against (a) the in-memory batch and (b) existing rows in
     * `discount_coupons.code`. Aborts with 400 if we cannot produce enough
     * unique codes within the retry budget (e.g. tiny numeric keyspace).
     */
    private async generateCodes(
        count: number,
        prefix: string,
        code_length: number,
        charset: CouponBulkCharsets,
        type: string,
    ): Promise<string[]> {
        const alphabets: Record<CouponBulkCharsets, string> = {
            [CouponBulkCharsets.ALPHANUMERIC]: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
            [CouponBulkCharsets.ALPHA]:        'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            [CouponBulkCharsets.NUMERIC]:      '0123456789',
        };
        const alphabet = alphabets[charset] || alphabets[CouponBulkCharsets.ALPHANUMERIC];

        const suffix_len = Math.max(4, code_length - prefix.length);
        const codes = new Set<string>();
        const max_attempts_per_code = 25;
        const max_total_attempts = count * max_attempts_per_code;
        let attempts = 0;

        while (codes.size < count && attempts < max_total_attempts) {
            attempts++;
            const bytes = randomBytes(suffix_len);
            let suffix = '';
            for (let i = 0; i < suffix_len; i++) {
                suffix += alphabet[bytes[i] % alphabet.length];
            }
            const candidate = `${prefix}${suffix}`.toUpperCase();

            if (codes.has(candidate)) continue;

            // Final guard: ensure not already in DB for the same type. The
            // composite unique index (code, type) is the ultimate race-safe
            // backstop; same code in a different type is allowed.
            const exists = await this.discountCouponService.getOne({ code: candidate, type } as any);
            if (exists) continue;

            codes.add(candidate);
        }

        if (codes.size < count) {
            throw new BadRequestException(
                'Unable to generate enough unique codes for the selected charset/code_length. Increase code_length, change charset, or reduce count.',
            );
        }

        return Array.from(codes);
    }
}

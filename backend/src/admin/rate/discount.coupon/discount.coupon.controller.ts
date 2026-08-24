import { Body, Controller, Delete, Get, Inject, NotFoundException, Param, ParseIntPipe, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { DiscountCouponService } from 'src/booking/car.search/discount.coupon.service';
import { DiscountCouponDto } from './discount.coupon.dto';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { DiscountCouponListingDto } from './discount.coupon.listing.dto';
import { CouponTypes } from 'src/entities/enums/coupon.type';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';

/**
 * Legacy / regular discount coupons (UNLIMITED redemptions).
 *
 * This controller intentionally manages ONLY coupons with
 * `usage_limit IS NULL`. Single-use / limited-use coupons are managed by
 * `DiscountCouponSingleUseController` at `/admin/discount/coupon/single-use`.
 *
 * - listing  : always returns regular coupons only (NULL usage_limit)
 * - detail   : 404 if the coupon belongs to single-use
 * - store    : forces `usage_limit = null` (ignores any client-supplied value)
 * - update   : same protection — single-use coupons cannot be edited here
 * - delete   : same protection — single-use coupons cannot be deleted here
 */
@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/discount/coupon')
export class DiscountCouponController {


    constructor(
        @Inject(DiscountCouponService) private discountCouponService: DiscountCouponService
    ) {

    }

    @Get()
    async listing(@Query() params: DiscountCouponListingDto) {
        return await this.discountCouponService.listForAdmin({
            type: params.type || CouponTypes.DAILY,
            is_single_use: 0, // legacy controller only ever shows unlimited coupons
            page: params.page,
            page_size: params.page_size,
        });
    }

    @Get(':id')
    async detail(@Param('id', ParseIntPipe) id: number) {
        const response = await this.discountCouponService.getOne({ id });
        if (!response || response.usage_limit !== null) {
            throw new NotFoundException();
        }

        return response;
    }

    @Post()
    async store(@Body() body: DiscountCouponDto, @Request() req) {

        body.created_by = req.user.id;
        // Regular-coupon endpoint never produces single-use coupons,
        // regardless of what the client sends.
        body.usage_limit = null;

        return await this.discountCouponService.insert(body);
    }

    @Put(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() body: DiscountCouponDto, @Request() req) {

        const coupon = await this.discountCouponService.getOne({ id });

        if (!coupon || coupon.usage_limit !== null) {
            throw new NotFoundException();
        }
        body.updated_by = req.user.id;
        body.usage_limit = null;

        return await this.discountCouponService.update({ id }, body);
    }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        const response = await this.discountCouponService.getOne({ id });
        if (!response || response.usage_limit !== null) {
            throw new NotFoundException();
        }

        return await this.discountCouponService.softDelete({ id });
    }
}

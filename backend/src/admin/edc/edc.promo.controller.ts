import { Body, Controller, Get, Inject, Put, Query, Request, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';
import { EdcPromoService } from './edc.promo.service';
import { UpdateEdcPromoDto, PromoStatsQueryDto } from './edc.promo.dto';
import { DiscountType } from 'src/entities/edc.promo.config.entity';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/edc/promo')
export class EdcPromoController {
    constructor(
        @Inject(EdcPromoService) private edcPromoService: EdcPromoService
    ) {}

    /**
     * GET /api/admin/edc/promo
     * Get current promo configuration
     */
    @Get()
    async getPromoConfig() {
        const config = await this.edcPromoService.getPromoConfig();
        
        if (!config) {
            // Return default config if none exists
            return {
                success: true,
                data: {
                    id: null,
                    promo_code: 'EDCVIP2025',
                    discount_percentage: 15,
                    discount_type: DiscountType.PERCENTAGE,
                    fixed_discount_amount: 0,
                    is_active: true,
                    valid_from: '2025-01-01T00:00:00Z',
                    valid_until: '2025-12-31T23:59:59Z',
                    max_uses: 0,
                    max_uses_per_user: 0,
                    current_uses: 0,
                    min_rental_days: 1,
                    applicable_vehicles: ['all'],
                    description_en: 'Exclusive discount for EDC members',
                    description_ar: 'خصم حصري لأعضاء مؤسسة الإمارات للتعليم',
                    created_at: null,
                    updated_at: null
                }
            };
        }

        return {
            success: true,
            data: config
        };
    }

    /**
     * PUT /api/admin/edc/promo
     * Update promo configuration
     */
    @Put()
    async updatePromoConfig(
        @Body() body: UpdateEdcPromoDto,
        @Request() req
    ) {
        body.updated_by = req.user.id;

        // Validate discount type
        if (body.discount_type === DiscountType.PERCENTAGE && body.discount_percentage === undefined) {
            return {
                success: false,
                error: 'Validation error',
                details: { discount_percentage: 'Required when discount_type is percentage' }
            };
        }

        if (body.discount_type === DiscountType.FIXED_AMOUNT && !body.fixed_discount_amount) {
            return {
                success: false,
                error: 'Validation error',
                details: { fixed_discount_amount: 'Required when discount_type is fixed_amount' }
            };
        }

        // Validate dates
        if (new Date(body.valid_until) <= new Date(body.valid_from)) {
            return {
                success: false,
                error: 'Validation error',
                details: { valid_until: 'Must be after valid_from' }
            };
        }

        const config = await this.edcPromoService.upsertPromoConfig(body as any);

        return {
            success: true,
            message: 'Promo configuration updated successfully',
            data: {
                id: config.id,
                promo_code: config.promo_code,
                discount_percentage: config.discount_percentage,
                discount_type: config.discount_type,
                is_active: config.is_active,
                updated_at: config.updated_at
            }
        };
    }

    /**
     * GET /api/admin/edc/promo/stats
     * Get promo usage statistics
     */
    @Get('stats')
    async getPromoStats(@Query() query: PromoStatsQueryDto) {
        const stats = await this.edcPromoService.getUsageStats(query.from, query.to);

        return {
            success: true,
            data: stats
        };
    }
}








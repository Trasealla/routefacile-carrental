import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsOptional, IsEnum, IsDateString, IsArray, Min, Max } from "class-validator";
import { DiscountType } from "src/entities/edc.promo.config.entity";

export class UpdateEdcPromoDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Promo code', example: 'EDCVIP2025' })
    promo_code: string;

    @IsEnum(DiscountType)
    @IsNotEmpty()
    @ApiProperty({ enum: DiscountType, default: DiscountType.PERCENTAGE })
    discount_type: DiscountType;

    @IsNumber()
    @Min(0)
    @Max(100)
    @Type(() => Number)
    @ApiProperty({ description: 'Discount percentage (0-100)', example: 15 })
    discount_percentage: number;

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    @IsOptional()
    @ApiProperty({ description: 'Fixed discount amount', example: 0 })
    fixed_discount_amount?: number;

    @IsBoolean()
    @IsOptional()
    @ApiProperty({ description: 'Whether promo is active', default: true })
    is_active?: boolean;

    @IsDateString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Valid from date', example: '2025-01-01T00:00:00Z' })
    valid_from: string;

    @IsDateString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Valid until date', example: '2025-12-31T23:59:59Z' })
    valid_until: string;

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    @IsOptional()
    @ApiProperty({ description: 'Maximum uses (0 = unlimited)', example: 1000 })
    max_uses?: number;

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    @IsOptional()
    @ApiProperty({ description: 'Maximum uses per user (0 = unlimited)', example: 5 })
    max_uses_per_user?: number;

    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @IsOptional()
    @ApiProperty({ description: 'Minimum rental days', example: 1 })
    min_rental_days?: number;

    @IsArray()
    @IsOptional()
    @ApiProperty({ description: 'Applicable vehicle IDs or "all"', example: ['all'] })
    applicable_vehicles?: string[];

    @IsString()
    @IsOptional()
    @ApiProperty({ description: 'Description in English' })
    description_en?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ description: 'Description in Arabic' })
    description_ar?: string;

    updated_by?: number;
}

export class PromoStatsQueryDto {
    @IsDateString()
    @IsOptional()
    @ApiProperty({ description: 'Start date for stats', required: false })
    from?: string;

    @IsDateString()
    @IsOptional()
    @ApiProperty({ description: 'End date for stats', required: false })
    to?: string;
}








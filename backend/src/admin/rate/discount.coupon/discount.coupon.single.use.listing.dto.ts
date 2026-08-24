import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { CouponTypes } from "src/entities/enums/coupon.type";

/**
 * Listing filters for the single-use / limited-use admin pages.
 * The `usage_limit IS NOT NULL` filter is applied unconditionally by the
 * controller; this DTO only exposes the page-level toggles.
 */
export class DiscountCouponSingleUseListingDto {

    @ApiProperty({
        title: 'type',
        required: false,
        default: CouponTypes.DAILY,
        enum: CouponTypes,
    })
    @IsString()
    @IsOptional()
    @IsEnum(CouponTypes)
    type: string;

    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @IsOptional()
    page: number;

    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @IsOptional()
    page_size: number;
}

import { Type } from 'class-transformer';
import {
    ArrayMaxSize,
    ArrayMinSize,
    IsArray,
    IsDateString,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsNotEmptyObject,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
    Length,
    Matches,
    Max,
    Min,
    ValidateIf,
} from 'class-validator';
import { CouponDiscountTypes } from 'src/entities/enums/coupon.discount.type';
import { CouponTypes } from 'src/entities/enums/coupon.type';
import { CouponBulkCharsets } from 'src/entities/enums/coupon.bulk.charset';

/**
 * Bulk-create discount coupons.
 *
 * Two ways to provide the codes:
 *  1. `codes: string[]` – an explicit list of codes to create.
 *  2. `count` (+ optional `prefix` and `code_length`) – auto-generate that
 *     many random alphanumeric codes prefixed with `prefix`.
 *
 * All other fields are the rate / scope template applied to every code.
 */
export class DiscountCouponBulkDto {

    // ---------- Code source ----------

    @IsOptional()
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(5000)
    @IsString({ each: true })
    @Length(2, 64, { each: true })
    codes: string[];

    @ValidateIf(o => !o.codes || o.codes.length === 0)
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(5000)
    count: number;

    @IsOptional()
    @IsString()
    @Matches(/^[A-Za-z0-9_-]{0,32}$/, {
        message: 'prefix may only contain letters, digits, underscore or dash (max 32 chars)',
    })
    prefix: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(4)
    @Max(32)
    code_length: number;

    /**
     * Suffix character set for auto-generated codes. Ignored when `codes`
     * is provided. Defaults to `alphanumeric`.
     *   alphanumeric → A-Z + 0-9
     *   alpha        → A-Z
     *   numeric      → 0-9
     */
    @IsOptional()
    @IsString()
    @IsEnum(CouponBulkCharsets, {
        message: 'charset must be alphanumeric|alpha|numeric',
    })
    charset: CouponBulkCharsets;

    // ---------- Shared template (mirrors DiscountCouponDto) ----------

    @IsString()
    @IsNotEmpty()
    @IsEnum(CouponTypes)
    type: string;

    @IsString()
    @IsNotEmpty()
    @IsEnum(CouponDiscountTypes)
    discount_type: string;

    @IsNotEmpty()
    @IsDateString({ strict: true }, { message: 'start_date must be in the format YYYY-MM-DD' })
    start_date: string;

    @IsNotEmpty()
    @IsDateString({ strict: true }, { message: 'end_date must be in the format YYYY-MM-DD' })
    end_date: string;

    @Type(() => Number) @IsNumber() @IsNotEmpty() rate: number;
    @Type(() => Number) @IsNumber() @IsNotEmpty() cdw: number;
    @Type(() => Number) @IsNumber() @IsNotEmpty() scdw: number;
    @Type(() => Number) @IsNumber() @IsNotEmpty() pai: number;
    @Type(() => Number) @IsNumber() @IsNotEmpty() gps: number;
    @Type(() => Number) @IsNumber() @IsNotEmpty() driver: number;
    @Type(() => Number) @IsNumber() @IsNotEmpty() baby_seat: number;
    @Type(() => Number) @IsNumber() @IsNotEmpty() status: number;

    @IsString()
    @IsOptional()
    note: string;

    /**
     * Booking sources this coupon applies to (e.g. ['web','mobile']).
     * Optional — when omitted the coupon applies to all sources.
     */
    @IsOptional()
    applicable_for: string[];

    /**
     * Maximum number of redemptions per generated code.
     * Defaults to 1 (single-use) if omitted, since the bulk endpoint is
     * primarily intended for single-use coupon batches.
     */
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    usage_limit: number;

    @IsObject() @IsNotEmpty() car_ids: object;
    @IsObject() @IsNotEmptyObject() city_ids: object;
    @IsObject() @IsNotEmptyObject() group_ids: object;
    @IsObject() @IsNotEmptyObject() location_ids: object;

    created_by: number;
}

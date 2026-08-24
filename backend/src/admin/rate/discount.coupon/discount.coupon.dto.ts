import { Type } from "class-transformer";
import { IsNotEmpty, IsString, IsDateString, IsNumber, IsObject, IsNotEmptyObject, IsEnum, IsOptional } from "class-validator";
import { CouponDiscountTypes } from "src/entities/enums/coupon.discount.type";
import { CouponTypes } from "src/entities/enums/coupon.type";



export class DiscountCouponDto {


    @IsString()
    @IsNotEmpty()
    @IsEnum(CouponTypes)
    type: string

    @IsString()
    @IsNotEmpty()
    @IsEnum(CouponDiscountTypes)
    discount_type: string

    @IsString()
    @IsNotEmpty()
    code: string

    @IsNotEmpty()
    @IsDateString({ strict: true }, { message: 'start_date must be in the format YYYY-MM-DD' })
    start_date: string;

    @IsNotEmpty()
    @IsDateString({ strict: true }, { message: 'end_date must be in the format YYYY-MM-DD' })
    end_date: string;

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    rate: number

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    cdw: number

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    scdw: number

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    pai: number

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    gps: number

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    driver: number

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    baby_seat: number

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    status: number

    @IsString()
    @IsOptional()
    note: string

    /**
     * Booking sources this coupon applies to (e.g. ['web','mobile']).
     * Optional — when omitted the coupon applies to all sources.
     */
    @IsOptional()
    applicable_for: string[]

    /**
     * Maximum number of redemptions allowed.
     * Omit / null = unlimited.
     * 1 = single-use (becomes invalid after first booking).
     */
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    usage_limit: number

    @IsObject()
    @IsNotEmpty()
    car_ids: object

    @IsNotEmptyObject()
    @IsObject()
    city_ids: object

    @IsObject()
    @IsNotEmptyObject()
    group_ids: object

    @IsObject()
    @IsNotEmptyObject()
    location_ids: object

    created_by: number
    updated_by: number
}


import { Type } from "class-transformer";
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsIn, Min, Max } from "class-validator";

// The six extras a range discount can apply to. These must match the keys used by
// getDiscountRangeOfExtras() in daily.extras.query.ts — an unrecognised type is
// silently ignored at pricing time, so reject it at the door instead.
export const DISCOUNT_RANGE_TYPES = ['cdw', 'scdw', 'pai', 'gps', 'baby_seat', 'driver'];

export class DiscountRangeDto {

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    id: number

    @IsString()
    @IsNotEmpty()
    @IsIn(DISCOUNT_RANGE_TYPES, { message: `type must be one of: ${DISCOUNT_RANGE_TYPES.join(', ')}` })
    type: string

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    @Min(0, { message: 'from must be 0 or more days' })
    from: number

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    @Min(0, { message: 'to must be 0 or more days' })
    to: number

    // Applied as `1 - (discount / 100)`, so anything above 100 flips the multiplier
    // negative and would make the extra subtract from the booking total.
    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    @Min(0, { message: 'discount must be between 0 and 100' })
    @Max(100, { message: 'discount must be between 0 and 100' })
    discount: number

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    status: number

    created_by: number
    updated_by: number
}

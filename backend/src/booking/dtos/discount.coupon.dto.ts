import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsEnum, ValidateIf, IsNumber, IsDate, IsDateString, Matches, IsOptional, Validate } from "class-validator";
import { DiscountCoupon } from "src/entities/discount.coupon.entity";
import { BookingTypes } from "src/entities/enums/booking.type";

import { IsExists } from "src/validators/exists.validator";

export class DiscountCouponDto {

    @IsString()
    @IsOptional()
    @Validate(IsExists, [DiscountCoupon, 'code'])
    @ApiProperty({ example: 'Discount Coupon code' })
    discount_coupon: string

    @IsNotEmpty()
    @IsDateString({ strict: true }, { message: 'pickup_date must be in the format YYYY-MM-DD' })
    @ApiProperty({example: 'YYYY-MM-DD'})
    pickup_date: string;

    @IsString()
    @IsNotEmpty()
    @IsEnum(BookingTypes)
    @ApiProperty({example: 'daily or monthly'})
    booking_type: string
}
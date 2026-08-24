import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsString, IsEnum, ValidateIf, IsNumber, IsDateString, Validate, IsOptional, Min, Max, Matches, IsArray, ArrayNotEmpty, ArrayMaxSize } from "class-validator";
import { DiscountCoupon } from "src/entities/discount.coupon.entity";
import { City } from "src/entities/city.entity";
import { BookingSources } from "src/entities/enums/booking.source";
import { BookingTypes } from "src/entities/enums/booking.type";
import { DropoffTypes } from "src/entities/enums/dropoff.type";
import { PickupTypes } from "src/entities/enums/pickup.type";
import { Location } from "src/entities/location.entity";
import { DiscountCouponValid } from "src/validators/discount.coupon.validator";
import { IsExists } from "src/validators/exists.validator";

export class CarSearchDto {

    @ApiProperty({ example: 'daily or monthly' })
    @IsString()
    @IsEnum(BookingTypes)
    @IsNotEmpty()
    booking_type: string

    @ApiProperty({ example: 'web or mobile or api' })
    @IsString()
    @IsEnum(BookingSources)
    @IsNotEmpty()
    booking_source: string

    @ApiProperty({ example: 'web or mobile or api' })
    @IsNumber()
    @IsOptional()
    form_submit: number

    @ApiProperty({ example: 'self or delivery' })
    @IsString()
    @IsEnum(PickupTypes)
    @IsNotEmpty()
    pickup_type: string

    @ApiProperty({ example: 'YYYY-MM-DD' })
    @IsDateString({ strict: true }, { message: 'pickup_date must be in the format YYYY-MM-DD' })
    @IsNotEmpty()
    pickup_date: string;

    @ApiProperty({ example: 'HH-MM' })
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'pickup_time must be in the format HH:MM' })
    @IsNotEmpty()
    pickup_time: string;

    @ApiProperty({ example: 'required for pickup_type self' })
    @ValidateIf(o => (o.pickup_type === PickupTypes.SELF))
    @Validate(IsExists, [Location, 'id'])
    @IsNotEmpty()
    pickup_location_id: number

    @ApiProperty({ example: 'required for pickup_type delivery' })
    @ValidateIf(o => (o.pickup_type === PickupTypes.DELIVERY))
    @Validate(IsExists, [City, 'id'])
    @IsNotEmpty()
    pickup_city_id: number

    @ApiProperty({ example: 'Custom location required for delivery' })
    @ValidateIf(o => o.pickup_type === PickupTypes.DELIVERY)
    @ArrayNotEmpty()
    @ArrayMaxSize(2)
    @IsArray()
    @IsNotEmpty()
    pickup_coordinates: string[];

    @ApiProperty({ example: 'Address required for delivery' })
    //@IsNotEmpty()
    // @ValidateIf(o => o.pickup_type === PickupTypes.DELIVERY)
    // @IsString()
    pickup_address: string;

    @ApiProperty({ example: 'self or collection' })
    @IsString()
    @IsEnum(DropoffTypes)
    @IsNotEmpty()
    dropoff_type: string

    @ApiProperty({ example: 'YYYY-MM-DD' })
    @IsDateString({ strict: true }, { message: 'dropoff_date must be in the format YYYY-MM-DD' })
    @IsNotEmpty()
    dropoff_date: string;

    @ApiProperty({ example: 'HH::MM' })
    @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/, { message: 'dropoff_time must be in the format HH:MM' })
    @IsNotEmpty()
    dropoff_time: string;

    @ApiProperty({ example: 'dropoff location id' })
    @ValidateIf(o => (o.dropoff_type === DropoffTypes.SELF))
    @IsNotEmpty()
    dropoff_location_id: number

    @ApiProperty({ example: 'dropoff city id' })
    @ValidateIf(o => o.dropoff_type === DropoffTypes.COLLECTION)
    @IsNotEmpty()
    dropoff_city_id: number

    @ApiProperty({ example: 'required for booking_type monthly' })
    @ValidateIf(o => o.booking_type === BookingTypes.MONTHLY)
    @Min(1)
    @Max(12)
    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    booking_months: number

    @ApiProperty({ example: 'Custom location required for collection' })
    @ValidateIf(o => o.dropoff_type === DropoffTypes.COLLECTION)
    @ArrayNotEmpty()
    @ArrayMaxSize(2)
    @IsArray()
    @IsNotEmpty()
    dropoff_coordinates: string[];

    @ApiProperty({ example: 'Address required for collection' })
    //@IsNotEmpty()
    // @ValidateIf(o => o.pickup_type === DropoffTypes.COLLECTION)
    // @IsString()
    dropoff_address: string;

    @ApiProperty({ example: 'Coupon code' })
    @IsString()
    @IsOptional()
    @Validate(IsExists, [DiscountCoupon, 'code'])
    @Validate(DiscountCouponValid)
    discount_coupon: string

}
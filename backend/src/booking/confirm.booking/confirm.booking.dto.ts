import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsString, IsEnum, ValidateIf, IsNumber, IsDateString, Validate, IsOptional, Min, Max, Matches, IsObject, IsArray, ValidateNested, IsInt, ArrayNotEmpty, ArrayMaxSize } from "class-validator";
import { Car } from "src/entities/car.entity";
import { DiscountCoupon } from "src/entities/discount.coupon.entity";
import { City } from "src/entities/city.entity";
import { BookingSources } from "src/entities/enums/booking.source";
import { BookingTypes } from "src/entities/enums/booking.type";
import { CarExtraTypes } from "src/entities/enums/car.extra.type";
import { DropoffTypes } from "src/entities/enums/dropoff.type";
import { ExtraKms } from "src/entities/enums/extra.kms";
import { MonthlyMileage } from "src/entities/enums/monthly.mileage";
import { PaymentTypes } from "src/entities/enums/payment.type";
import { PickupTypes } from "src/entities/enums/pickup.type";
import { Location } from "src/entities/location.entity";
import { DiscountCouponValid } from "src/validators/discount.coupon.validator";
import { IsExists } from "src/validators/exists.validator";

class CarExtra {

    @IsEnum(CarExtraTypes)
    @IsString()
    @IsNotEmpty()
    type: number;

    @Min(1)
    @IsOptional()
    @IsInt()
    quantity: number;
}

export class ConfirmBookingDto {

    @ApiProperty({ example: 'daily or monthly' })
    @IsEnum(BookingTypes)
    @IsString()
    @IsNotEmpty()
    booking_type: string

    @ApiProperty({ example: 'web or mobile or api' })
    @IsString()
    @IsEnum(BookingSources)
    @IsNotEmpty()
    booking_source: string

    @ApiProperty({ example: 'Car id' })
    @Validate(IsExists, [Car, 'id'])
    @IsNotEmpty()
    car_id: number

    @ApiProperty({ example: 'self or delivery' })
    @IsEnum(PickupTypes)
    @IsString()
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

    @ApiProperty({ example: 'Custom location required for delivery' })
    @ValidateIf(o => o.pickup_type === PickupTypes.DELIVERY)
    @ArrayNotEmpty()
    @ArrayMaxSize(2)
    @IsArray()
    @IsNotEmpty()
    pickup_coordinates: string[];

    @ApiProperty({ example: 'Address required for delivery' })
    @ValidateIf(o => o.pickup_type === PickupTypes.DELIVERY)
    @IsNotEmpty()
    @IsString()
    pickup_address: string;

    @ApiProperty({ example: 'required for pickup_type delivery' })
    @ValidateIf(o => (o.pickup_type === PickupTypes.DELIVERY))
    @Validate(IsExists, [City, 'id'])
    @IsNotEmpty()
    pickup_city_id: number

    @ApiProperty({ example: 'self or collection' })
    @IsEnum(DropoffTypes)
    @IsString()
    @IsNotEmpty()
    dropoff_type: string

    @ApiProperty({ example: 'YYYY-MM-DD' })
    @IsDateString({ strict: true }, { message: 'dropoff_date must be in the format YYYY-MM-DD' })
    @IsNotEmpty()
    dropoff_date: string;

    @ApiProperty({ example: 'HH:MM' })
    @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/, { message: 'dropoff_time must be in the format HH:MM' })
    @IsNotEmpty()
    dropoff_time: string;

    @ApiProperty()
    @ValidateIf(o => (o.dropoff_type === DropoffTypes.SELF && o.booking_type === BookingTypes.DAILY))
    @IsNotEmpty()
    dropoff_location_id: number

    @ApiProperty()
    @ValidateIf(o => o.dropoff_type === DropoffTypes.COLLECTION)
    @IsNotEmpty()
    dropoff_city_id: number

    @ApiProperty({ example: 'Custom location required for collection' })
    @ValidateIf(o => o.dropoff_type === DropoffTypes.COLLECTION)
    @ArrayNotEmpty()
    @ArrayMaxSize(2)
    @IsArray()
    @IsNotEmpty()
    dropoff_coordinates: string[];

    @ApiProperty({ example: 'Address required for collection' })
    @ValidateIf(o => o.pickup_type === DropoffTypes.COLLECTION)
    @IsNotEmpty()
    @IsString()
    dropoff_address: string;

    @ApiProperty({ example: 'required for booking_type monthly' })
    @ValidateIf(o => o.booking_type === BookingTypes.MONTHLY)
    @Min(1)
    @Max(12)
    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    booking_months: number

    @ApiProperty({ example: 'monthly mileage' })
    @ValidateIf(o => o.booking_type === BookingTypes.MONTHLY)
    @IsNotEmpty()
    @IsEnum(MonthlyMileage)
    monthly_mileage: number

    @ApiProperty({ example: 'extra kms' })
    @ValidateIf(o => o.booking_type === BookingTypes.MONTHLY)
    @IsOptional()
    @IsEnum(ExtraKms)
    extra_kms: number

    @ApiProperty({ example: 'pay_now or pay_later' })
    @IsString()
    @IsEnum(PaymentTypes)
    @IsNotEmpty()
    payment_type: string

    @ApiProperty({ example: 'Coupon code' })
    @IsString()
    @IsOptional()
    @Validate(IsExists, [DiscountCoupon, 'code'])
    @Validate(DiscountCouponValid)
    discount_coupon: string

    @IsOptional()
    @IsArray()
    @ValidateNested()
    @Type(() => CarExtra)
    car_extras: CarExtra[]

    @ApiProperty({ example: 'Additional commnets' })
    @IsOptional()
    comments: string

    @ApiProperty({ example: 'Adjust device ID from mobile app for attribution tracking', required: false })
    @IsOptional()
    @IsString()
    adjust_device_id?: string

    booking_days: number

    one_day_rate: number

    rate_from_range: number

    rate_from_daily: number

    inter_cities_charges: number

    pickup_parking_charges: number

    dropoff_parking_charges: number

    delivery_charges: number

    collection_charges: number

    discount: number

    surge: number

    vmd_charges: number
}
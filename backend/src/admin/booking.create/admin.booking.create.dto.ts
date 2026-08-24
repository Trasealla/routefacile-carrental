import { Type } from "class-transformer";
import { IsBoolean, IsDateString, IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Max, Min, ValidateIf, ValidateNested } from "class-validator";
import { BookingTypes } from "src/entities/enums/booking.type";
import { PickupTypes } from "src/entities/enums/pickup.type";
import { DropoffTypes } from "src/entities/enums/dropoff.type";
import { MonthlyMileage } from "src/entities/enums/monthly.mileage";

export class AdminAvailabilityDto {
    @IsString() @IsEnum(BookingTypes) @IsNotEmpty() booking_type: string;

    @IsString() @IsEnum(PickupTypes) @IsNotEmpty() pickup_type: string;
    @IsDateString({ strict: true }, { message: 'pickup_date must be in the format YYYY-MM-DD' }) @IsNotEmpty() pickup_date: string;
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'pickup_time must be in the format HH:MM' }) @IsNotEmpty() pickup_time: string;
    @ValidateIf(o => o.pickup_type === PickupTypes.SELF) @Type(() => Number) @IsInt() @IsNotEmpty() pickup_location_id: number;
    @ValidateIf(o => o.pickup_type === PickupTypes.DELIVERY) @Type(() => Number) @IsInt() @IsNotEmpty() pickup_city_id: number;

    @IsString() @IsEnum(DropoffTypes) @IsNotEmpty() dropoff_type: string;
    @IsDateString({ strict: true }, { message: 'dropoff_date must be in the format YYYY-MM-DD' }) @IsNotEmpty() dropoff_date: string;
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'dropoff_time must be in the format HH:MM' }) @IsNotEmpty() dropoff_time: string;
    @ValidateIf(o => o.dropoff_type === DropoffTypes.SELF) @Type(() => Number) @IsInt() @IsNotEmpty() dropoff_location_id: number;
    @ValidateIf(o => o.dropoff_type === DropoffTypes.COLLECTION) @Type(() => Number) @IsInt() @IsNotEmpty() dropoff_city_id: number;

    @ValidateIf(o => o.booking_type === BookingTypes.MONTHLY)
    @Type(() => Number) @IsInt() @Min(1) @Max(12) @IsNotEmpty() booking_months: number;

    @IsOptional() @Type(() => Number) @IsInt() monthly_mileage?: number;
}

export class AdminCustomerSearchDto {
    @IsOptional() @IsString() search?: string;
    @IsOptional() @Type(() => Number) @IsInt() page?: number;
    @IsOptional() @Type(() => Number) @IsInt() page_size?: number;
}

class AdminBookingCustomerDto {
    // When picking an existing customer only user_id is needed; for a walk-in the
    // remaining fields describe the account to match-by-email or create.
    @IsOptional() @Type(() => Number) @IsInt() user_id?: number;

    @ValidateIf(o => !o.user_id) @IsString() @IsNotEmpty() first_name: string;
    @ValidateIf(o => !o.user_id) @IsString() @IsNotEmpty() last_name: string;
    @ValidateIf(o => !o.user_id) @IsEmail() @IsNotEmpty() email: string;
    @ValidateIf(o => !o.user_id) @IsString() @IsNotEmpty() phone_code: string;
    @ValidateIf(o => !o.user_id) @IsString() @IsNotEmpty() phone_number: string;

    @IsOptional() @Type(() => Number) @IsInt() country_id?: number;
}

export class AdminCreateBookingDto {
    @ValidateNested() @Type(() => AdminBookingCustomerDto) @IsNotEmpty() customer: AdminBookingCustomerDto;

    @IsString() @IsEnum(BookingTypes) @IsNotEmpty() booking_type: string;

    @Type(() => Number) @IsInt() @IsNotEmpty() car_id: number;

    @IsString() @IsEnum(PickupTypes) @IsNotEmpty() pickup_type: string;
    @IsDateString({ strict: true }, { message: 'pickup_date must be in the format YYYY-MM-DD' }) @IsNotEmpty() pickup_date: string;
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'pickup_time must be in the format HH:MM' }) @IsNotEmpty() pickup_time: string;
    @ValidateIf(o => o.pickup_type === PickupTypes.SELF) @Type(() => Number) @IsInt() @IsNotEmpty() pickup_location_id: number;
    @ValidateIf(o => o.pickup_type === PickupTypes.DELIVERY) @Type(() => Number) @IsInt() @IsNotEmpty() pickup_city_id: number;
    @IsOptional() @IsString() pickup_address?: string;

    @IsString() @IsEnum(DropoffTypes) @IsNotEmpty() dropoff_type: string;
    @IsDateString({ strict: true }, { message: 'dropoff_date must be in the format YYYY-MM-DD' }) @IsNotEmpty() dropoff_date: string;
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'dropoff_time must be in the format HH:MM' }) @IsNotEmpty() dropoff_time: string;
    @ValidateIf(o => o.dropoff_type === DropoffTypes.SELF) @Type(() => Number) @IsInt() @IsNotEmpty() dropoff_location_id: number;
    @ValidateIf(o => o.dropoff_type === DropoffTypes.COLLECTION) @Type(() => Number) @IsInt() @IsNotEmpty() dropoff_city_id: number;
    @IsOptional() @IsString() dropoff_address?: string;

    @ValidateIf(o => o.booking_type === BookingTypes.MONTHLY)
    @Type(() => Number) @IsInt() @Min(1) @Max(12) @IsNotEmpty() booking_months: number;

    @ValidateIf(o => o.booking_type === BookingTypes.MONTHLY)
    @Type(() => Number) @IsEnum(MonthlyMileage) @IsNotEmpty() monthly_mileage: number;

    // Admin bookings are always created as pay-later; this flag records that the
    // customer already settled up at the counter so reports show it as paid.
    @IsOptional() @IsBoolean() mark_as_paid?: boolean;

    @IsOptional() @IsString() comments?: string;
}

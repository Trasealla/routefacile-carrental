import { Type } from "class-transformer";
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, ValidateIf, ValidateNested } from "class-validator";
import { BookingTypes } from "src/entities/enums/booking.type";
import { PaymentTypes } from "src/entities/enums/payment.type";
import { PickupTypes } from "src/entities/enums/pickup.type";
import { DropoffTypes } from "src/entities/enums/dropoff.type";

class BrokerEditPickupDto {
    @IsString() @IsEnum(PickupTypes) @IsNotEmpty() type: string;
    @ValidateIf(o => o.type === PickupTypes.SELF) @IsInt() @Type(() => Number) @IsNotEmpty() location_id: number;
    @ValidateIf(o => o.type === PickupTypes.DELIVERY) @IsInt() @Type(() => Number) @IsNotEmpty() city_id: number;
    @IsOptional() @IsString() address?: string;
}

class BrokerEditDropoffDto {
    @IsString() @IsEnum(DropoffTypes) @IsNotEmpty() type: string;
    @ValidateIf(o => o.type === DropoffTypes.SELF) @IsInt() @Type(() => Number) @IsNotEmpty() location_id: number;
    @ValidateIf(o => o.type === DropoffTypes.COLLECTION) @IsInt() @Type(() => Number) @IsNotEmpty() city_id: number;
    @IsOptional() @IsString() address?: string;
}

// Editing a booking re-quotes and re-books it end-to-end (mirrors BrokerCreateBookingDto),
// matching how the underlying EditBookingService already works for retail bookings.
export class BrokerEditBookingDto {
    @IsString() @IsNotEmpty() username: string;
    @IsString() @IsNotEmpty() password: string;

    @IsInt() @Type(() => Number) @IsNotEmpty() booking_id: number;

    @IsInt() @Type(() => Number) @IsNotEmpty() car_id: number;
    @IsString() @IsEnum(BookingTypes) @IsNotEmpty() booking_type: string;

    @ValidateNested() @Type(() => BrokerEditPickupDto) @IsNotEmpty() pickup: BrokerEditPickupDto;
    @ValidateNested() @Type(() => BrokerEditDropoffDto) @IsNotEmpty() dropoff: BrokerEditDropoffDto;

    @IsDateString() @IsNotEmpty() pickup_date_time: string;
    @IsDateString() @IsNotEmpty() dropoff_date_time: string;

    @ValidateIf(o => o.booking_type === BookingTypes.MONTHLY)
    @IsInt() @Type(() => Number) @IsNotEmpty() booking_months: number;

    @IsString() @IsEnum(PaymentTypes) @IsNotEmpty() payment_type: string;
}

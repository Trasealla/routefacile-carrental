import { Type } from "class-transformer";
import { IsDateString, IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, ValidateIf, ValidateNested } from "class-validator";
import { BookingTypes } from "src/entities/enums/booking.type";
import { PaymentTypes } from "src/entities/enums/payment.type";
import { PickupTypes } from "src/entities/enums/pickup.type";
import { DropoffTypes } from "src/entities/enums/dropoff.type";

class BrokerBookingPickupDto {
    @IsString() @IsEnum(PickupTypes) @IsNotEmpty() type: string;
    @ValidateIf(o => o.type === PickupTypes.SELF) @IsInt() @Type(() => Number) @IsNotEmpty() location_id: number;
    @ValidateIf(o => o.type === PickupTypes.DELIVERY) @IsInt() @Type(() => Number) @IsNotEmpty() city_id: number;
    @IsOptional() @IsString() address?: string;
}

class BrokerBookingDropoffDto {
    @IsString() @IsEnum(DropoffTypes) @IsNotEmpty() type: string;
    @ValidateIf(o => o.type === DropoffTypes.SELF) @IsInt() @Type(() => Number) @IsNotEmpty() location_id: number;
    @ValidateIf(o => o.type === DropoffTypes.COLLECTION) @IsInt() @Type(() => Number) @IsNotEmpty() city_id: number;
    @IsOptional() @IsString() address?: string;
}

class BrokerCustomerDto {
    @IsString() @IsNotEmpty() first_name: string;
    @IsString() @IsNotEmpty() last_name: string;
    @IsEmail() @IsNotEmpty() email: string;
    @IsString() @IsNotEmpty() phone_code: string;
    @IsString() @IsNotEmpty() phone_number: string;
    @IsOptional() @IsInt() @Type(() => Number) country_id?: number;
}

export class BrokerCreateBookingDto {
    @IsString() @IsNotEmpty() username: string;
    @IsString() @IsNotEmpty() password: string;

    @IsInt() @Type(() => Number) @IsNotEmpty() car_id: number;
    @IsString() @IsEnum(BookingTypes) @IsNotEmpty() booking_type: string;

    @ValidateNested() @Type(() => BrokerBookingPickupDto) @IsNotEmpty() pickup: BrokerBookingPickupDto;
    @ValidateNested() @Type(() => BrokerBookingDropoffDto) @IsNotEmpty() dropoff: BrokerBookingDropoffDto;

    @IsDateString() @IsNotEmpty() pickup_date_time: string;
    @IsDateString() @IsNotEmpty() dropoff_date_time: string;

    @ValidateIf(o => o.booking_type === BookingTypes.MONTHLY)
    @IsInt() @Type(() => Number) @IsNotEmpty() booking_months: number;

    @IsOptional() @IsString() broker_reference?: string;

    @ValidateNested() @Type(() => BrokerCustomerDto) @IsNotEmpty() customer: BrokerCustomerDto;

    @IsString() @IsEnum(PaymentTypes) @IsNotEmpty() payment_type: string;
}

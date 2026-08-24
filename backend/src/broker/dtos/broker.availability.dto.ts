import { Type } from "class-transformer";
import { IsDateString, IsEnum, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateIf, ValidateNested } from "class-validator";
import { BookingTypes } from "src/entities/enums/booking.type";
import { PickupTypes } from "src/entities/enums/pickup.type";
import { DropoffTypes } from "src/entities/enums/dropoff.type";

class BrokerPickupDto {
    @IsString() @IsEnum(PickupTypes) @IsNotEmpty() type: string;
    @ValidateIf(o => o.type === PickupTypes.SELF) @IsInt() @Type(() => Number) @IsNotEmpty() location_id: number;
    @ValidateIf(o => o.type === PickupTypes.DELIVERY) @IsInt() @Type(() => Number) @IsNotEmpty() city_id: number;
}

class BrokerDropoffDto {
    @IsString() @IsEnum(DropoffTypes) @IsNotEmpty() type: string;
    @ValidateIf(o => o.type === DropoffTypes.SELF) @IsInt() @Type(() => Number) @IsNotEmpty() location_id: number;
    @ValidateIf(o => o.type === DropoffTypes.COLLECTION) @IsInt() @Type(() => Number) @IsNotEmpty() city_id: number;
}

export class BrokerAvailabilityDto {
    @IsString() @IsNotEmpty() username: string;
    @IsString() @IsNotEmpty() password: string;

    @IsString() @IsEnum(BookingTypes) @IsNotEmpty() booking_type: string;

    @ValidateNested() @Type(() => BrokerPickupDto) @IsNotEmpty() pickup: BrokerPickupDto;
    @ValidateNested() @Type(() => BrokerDropoffDto) @IsNotEmpty() dropoff: BrokerDropoffDto;

    @IsDateString() @IsNotEmpty() pickup_date_time: string;
    @IsDateString() @IsNotEmpty() dropoff_date_time: string;

    @ValidateIf(o => o.booking_type === BookingTypes.MONTHLY)
    @IsInt() @Type(() => Number) @IsNotEmpty() booking_months: number;
}

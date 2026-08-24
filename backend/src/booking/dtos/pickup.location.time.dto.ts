import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsString, IsEnum, ValidateIf, IsNumber, IsDate, IsDateString, Matches, Validate, Min, Max, IsArray, ArrayNotEmpty, ArrayMaxSize } from "class-validator";
import { City } from "src/entities/city.entity";
import { BookingTypes } from "src/entities/enums/booking.type";
import { PickupTypes } from "src/entities/enums/pickup.type";
import { Location } from "src/entities/location.entity";
import { IsExists } from "src/validators/exists.validator";

export class PickupLocationTimeDto {

    @ApiProperty({ example: 'daily or monthly' })
    @IsEnum(BookingTypes)
    @IsString()
    @IsNotEmpty()
    booking_type: string

    @ApiProperty({ example: 'self or delivery' })
    @IsEnum(PickupTypes)
    @IsString()
    @IsNotEmpty()
    pickup_type: string

    @ApiProperty({ example: 'required for pickup_type self' })
    @ValidateIf(o => o.pickup_type === PickupTypes.SELF)
    @Validate(IsExists, [Location, 'id'])
    @IsNotEmpty()
    pickup_location_id: number

    @ApiProperty({ example: 'required for pickup_type delivery' })
    @ValidateIf(o => o.pickup_type === PickupTypes.DELIVERY)
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

    @ApiProperty({ example: 'required for booking_type monthly' })
    @ValidateIf(o => o.booking_type === BookingTypes.MONTHLY)
    @Min(1)
    @Max(12)
    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    booking_months: number

    @ApiProperty({ example: 'YYYY-MM-DD' })
    @IsDateString({ strict: true }, { message: 'pickup_date must be in the format YYYY-MM-DD' })
    @IsNotEmpty()
    pickup_date: string;

    @ApiProperty({ example: 'HH-MM' })
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'pickup_time must be in the format HH:MM' })
    @IsNotEmpty()
    pickup_time: string;
}
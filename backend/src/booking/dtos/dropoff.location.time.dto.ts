import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsEnum, ValidateIf, IsDateString, Matches, IsArray, ArrayNotEmpty, ArrayMaxSize } from "class-validator";
import { BookingTypes } from "src/entities/enums/booking.type";
import { DropoffTypes } from "src/entities/enums/dropoff.type";

export class DropoffLocationTimeDto {

    @ApiProperty({example: 'daily or monthly'})
    @IsEnum(BookingTypes)
    @IsString()
    @IsNotEmpty()
    booking_type: string

    @ApiProperty({example: 'self or collection'})
    @IsEnum(DropoffTypes)
    @IsString()
    @IsNotEmpty()
    dropoff_type: string

    @ApiProperty({example: 'dropoff location id'})
    @ValidateIf(o => o.dropoff_type === DropoffTypes.SELF)
    @IsNotEmpty()
    dropoff_location_id: number

    @ApiProperty({example: 'dropoff city id'})
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
    //@IsNotEmpty()
    // @ValidateIf(o => o.pickup_type === DropoffTypes.COLLECTION)
    // @IsString()
    dropoff_address: string;

    @ApiProperty()
    @IsDateString({ strict: true }, { message: 'dropoff_date must be in the format YYYY-MM-DD' })
    @IsNotEmpty()
    dropoff_date: string;

    @ApiProperty()
    @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/, { message: 'dropoff_time must be in the format HH:MM' })
    @IsNotEmpty()
    dropoff_time: string;

    @ApiProperty()
    @IsDateString({ strict: true }, { message: 'pickup_date must be in the format YYYY-MM-DD' })
    @IsNotEmpty()
    pickup_date: string;

    @ApiProperty()
    @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/, { message: 'pickup_time must be in the format HH:MM' })
    @IsNotEmpty()
    pickup_time: string;
}
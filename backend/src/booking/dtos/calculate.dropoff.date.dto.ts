import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsString, ValidateIf, IsNumber, IsDate, IsDateString, Matches, Validate, Min, Max, IsArray, ArrayNotEmpty, ArrayMaxSize, Equals, IsEnum } from "class-validator";
import { BookingTypes } from "src/entities/enums/booking.type";
import { DropoffTypes } from "src/entities/enums/dropoff.type";


export class CalculateDropoffDateDto {

    @ApiProperty({ example: 'daily or monthly' })
    @Equals(BookingTypes.MONTHLY)
    @IsString()
    @IsNotEmpty()
    booking_type: string

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
}
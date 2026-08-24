import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsNotEmpty, IsString, Matches, Validate } from "class-validator";
import { IsExists } from "src/validators/exists.validator";
import { Booking } from "src/entities/booking.entity";
import { ExtendActionTypes } from "src/entities/enums/extend.action.type";
import { BookingSources } from "src/entities/enums/booking.source";

export class ExtendBookingDto {

    @ApiProperty({ example: 'Booking number' })
    @IsNotEmpty()
    @Validate(IsExists, [Booking, 'booking_number'])
    booking_number: number

    @ApiProperty({ example: 'YYYY-MM-DD' })
    @IsNotEmpty()
    @IsDateString({ strict: true }, { message: 'dropoff_date must be in the format YYYY-MM-DD' })
    dropoff_date: string;

    @ApiProperty({ example: 'HH:MM' })
    @IsNotEmpty()
    @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/, { message: 'dropoff_time must be in the format HH:MM' })
    dropoff_time: string;

    @ApiProperty({ example: 'check or extend' })
    @IsNotEmpty()
    @IsEnum(ExtendActionTypes)
    action_type: string;

    @ApiProperty({ example: 'web or mobile or api' })
    @IsString()
    @IsEnum(BookingSources)
    @IsNotEmpty()
    booking_source: string

}
import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Matches } from "class-validator";
import { BookingSources } from "src/entities/enums/booking.source";

export class PublicExtendLookupDto {
    @ApiProperty({ example: 'ARC16827' })
    @IsNotEmpty()
    booking_number: string;

    @ApiProperty({ example: 'customer@example.com' })
    @IsNotEmpty()
    @IsEmail()
    email: string;
}

export class PublicExtendCheckDto {
    @ApiProperty({ example: 'ARC16827' })
    @IsNotEmpty()
    booking_number: string;

    @ApiProperty({ example: 'customer@example.com' })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'YYYY-MM-DD' })
    @IsNotEmpty()
    @IsDateString({ strict: true }, { message: 'dropoff_date must be in the format YYYY-MM-DD' })
    dropoff_date: string;

    @ApiProperty({ example: 'HH:MM' })
    @IsNotEmpty()
    @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/, { message: 'dropoff_time must be in the format HH:MM' })
    dropoff_time: string;
}

export class PublicExtendConfirmDto {
    @ApiProperty({ example: 'ARC16827' })
    @IsNotEmpty()
    booking_number: string;

    @ApiProperty({ example: 'customer@example.com' })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'YYYY-MM-DD' })
    @IsNotEmpty()
    @IsDateString({ strict: true }, { message: 'dropoff_date must be in the format YYYY-MM-DD' })
    dropoff_date: string;

    @ApiProperty({ example: 'HH:MM' })
    @IsNotEmpty()
    @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/, { message: 'dropoff_time must be in the format HH:MM' })
    dropoff_time: string;

    @ApiProperty({ example: 'web or mobile' })
    @IsString()
    @IsEnum(BookingSources)
    @IsNotEmpty()
    booking_source: string;
}


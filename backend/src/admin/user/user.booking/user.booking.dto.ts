import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min, Validate } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { PaginationDto } from "src/dtos/pagination.dto";
import { Genders } from "src/entities/enums/gender";
import { Type } from "class-transformer";

export class UserBookingDto extends PaginationDto {

    @ApiProperty({ example: 'male or female' })
    @IsString()
    @IsOptional()
    @IsEnum(Genders)
    gender: string

    @ApiProperty({
        title: 'user email',
        format: 'string',
        required: false,
        default: ''
    })
    @IsOptional()
    @IsString()
    user_email: string;

    @ApiProperty({
        title: 'sort by booking count',
        format: 'string',
        required: false,
        default: '',
        example: 'total_bookings_asc or total_bookings_desc'
    })
    @IsOptional()
    @IsString()
    sort_by: string;

    @ApiProperty({
        title: 'Minimum booking count filter',
        description: 'Filter users who have at least this many bookings',
        format: 'int32',
        required: false,
        minimum: 0,
        example: 10
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    min_booking_count: number;

    @ApiProperty({
        title: 'Unique users only',
        description: 'When true, returns unique users only (no duplicates)',
        format: 'boolean',
        required: false,
        example: true
    })
    @IsOptional()
    @Type(() => Boolean)
    user: boolean;

    @ApiProperty({
        title: 'Booked at from',
        description: 'Filter bookings from this date',
        format: 'date',
        required: false,
        example: '2024-01-01'
    })
    @IsOptional()
    @IsDateString()
    booked_at_from: string;

    @ApiProperty({
        title: 'Booked at to',
        description: 'Filter bookings until this date',
        format: 'date',
        required: false,
        example: '2024-12-31'
    })
    @IsOptional()
    @IsDateString()
    booked_at_to: string;

    @ApiProperty({
        title: 'Registered from',
        description: 'Filter users registered on or after this date',
        format: 'date',
        required: false,
        example: '2024-01-01'
    })
    @IsOptional()
    @IsDateString()
    registered_from: string;

    @ApiProperty({
        title: 'Registered to',
        description: 'Filter users registered on or before this date',
        format: 'date',
        required: false,
        example: '2024-12-31'
    })
    @IsOptional()
    @IsDateString()
    registered_to: string;
}
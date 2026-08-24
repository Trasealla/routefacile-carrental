import { IsDateString, IsOptional, Validate, IsNumber, Max, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { PaginationDto } from "src/dtos/pagination.dto";
import { ValidateIf } from "class-validator";
import { Type } from "class-transformer";

export class BookingDto extends PaginationDto {

    @ApiProperty({
        minimum: 1,
        maximum: 10000,
        title: 'Page',
        format: 'int32',
        default: 1,
        required: false
    })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    page: number = 1;

    @ApiProperty({
        minimum: 1,
        maximum: 1000,
        title: 'Page size',
        format: 'int32',
        default: 100,
        required: false,
        description: 'Number of records per page. Default: 100, Max: 1000'
    })
    @IsOptional()
    @IsNumber()
    @Max(1000, { message: 'Page size cannot exceed 1000' })
    @Min(1, { message: 'Page size must be at least 1' })
    @Type(() => Number)
    page_size: number = 100;

    @ApiProperty({
        title: 'From date',
        format: 'string',
        required: false,
        description: 'Start date for filtering bookings. Format: YYYY-MM-DD. Example: 2025-01-01'
    })
    @IsOptional()
    @IsDateString({ strict: true }, { message: 'date must be in the format YYYY-MM-DD' })
    from: string;

    @ApiProperty({
        title: 'To date',
        format: 'string',
        required: false,
        description: 'End date for filtering bookings. Format: YYYY-MM-DD. Example: 2025-01-31'
    })
    @IsOptional()
    @IsDateString({ strict: true }, { message: 'date must be in the format YYYY-MM-DD' })
    @ValidateIf((o) => o.from && o.to, {
        message: 'To date cannot be before from date'
    })
    to: string;


    @ApiProperty({
        title: 'Pickup From date',
        format: 'string',
        required: false,
        default: ''
    })
    @IsOptional()
    @IsDateString({ strict: true }, { message: 'date must be in the format YYYY-MM-DD' })
    pickup_from: string;

    @ApiProperty({
        title: 'Pickup To date',
        format: 'string',
        required: false,
        default: ''
    })
    @IsOptional()
    @IsDateString({ strict: true }, { message: 'date must be in the format YYYY-MM-DD' })
    pickup_to: string;

    @ApiProperty({
        title: 'booking number',
        format: 'string',
        required: false,
        default: ''
    })
    @IsOptional()
    booking_number: string;


    @ApiProperty({
        title: 'user email',
        format: 'string',
        required: false,
        default: ''
    })
    @IsOptional()
    user_email: string;

    @ApiProperty({
        title: 'Payment type',
        format: 'number',
        required: false,
        default: ''
    })
    @IsOptional()
    payment_type: number;

    @ApiProperty({
        title: 'Booking type',
        format: 'number',
        required: false,
        default: ''
    })
    @IsOptional()
    type: number;

    @ApiProperty({
        title: 'status',
        format: 'string',
        required: false,
        default: ''
    })
    @IsOptional()
    status: string;

    @ApiProperty({
        title: 'city_id',
        format: 'string',
        required: false,
        default: ''
    })
    @IsOptional()
    city_id: string;

    @ApiProperty({
        title: 'location_id',
        format: 'string',
        required: false,
        default: ''
    })
    @IsOptional()
    location_id: string;

    @ApiProperty({
        title: 'Pickup Type',
        format: 'string',
        required: false,
        default: ''
    })
    @IsOptional()
    pickup_type: string;

    @ApiProperty({
        title: 'Dropoff Type',
        format: 'string',
        required: false,
        default: ''
    })
    @IsOptional()
    dropoff_type: string;


    @ApiProperty({
    title: 'Booking Source',
    format: 'string',
    required: false,
    default: ''
    })
    @IsOptional()
    booking_source: number;

    @ApiProperty({
    title: 'Coupon Code',
    format: 'string',
    required: false,
    default: ''
    })
    @IsOptional()
    coupon_code: number;

    @ApiProperty({
        title: 'Broker id',
        format: 'number',
        required: false,
        default: ''
    })
    @IsOptional()
    broker_id: number;
}
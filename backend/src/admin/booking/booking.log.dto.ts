import { IsDateString, IsOptional, Validate } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { PaginationDto } from "src/dtos/pagination.dto";

export class BookingLogDto extends PaginationDto {

    @ApiProperty({
        title: 'booking_log_number',
        format: 'string',
        required: false,
        default: ''
    })
    @IsOptional()
    booking_log_number: string;

    @ApiProperty({
        title: 'booking_number',
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
}
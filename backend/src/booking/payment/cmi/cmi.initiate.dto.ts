import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional } from 'class-validator';

export class CmiInitiateDto {
    @ApiProperty({ example: 123, description: 'Booking id to pay for (must be PAY_NOW and unpaid)' })
    @IsInt()
    booking_id: number;

    @ApiProperty({ required: false, enum: ['fr', 'ar', 'en'], default: 'fr' })
    @IsOptional()
    @IsIn(['fr', 'ar', 'en'])
    lang?: string;
}

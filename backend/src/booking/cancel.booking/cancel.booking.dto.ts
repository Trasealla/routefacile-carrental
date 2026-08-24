import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, Validate } from "class-validator"
import { Booking } from "src/entities/booking.entity"
import { IsExists } from "src/validators/exists.validator"



export class CancelBookingDto {
    @ApiProperty({ example: 'Booking id' })
    @IsNotEmpty()
    @Validate(IsExists, [Booking, 'id'])
    booking_id: number

    @IsNotEmpty()
    cancellation_reason: string
}
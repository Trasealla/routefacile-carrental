import { ApiProperty } from "@nestjs/swagger";
import { ConfirmBookingDto } from "../confirm.booking/confirm.booking.dto";
import { IsNotEmpty, Validate } from "class-validator";
import { IsExists } from "src/validators/exists.validator";
import { Booking } from "src/entities/booking.entity";

export class EditBookingDto extends ConfirmBookingDto {
    @ApiProperty({ example: 'Booking number' })
    @IsNotEmpty()
    @Validate(IsExists, [Booking, 'booking_number'])
    booking_number: number
}
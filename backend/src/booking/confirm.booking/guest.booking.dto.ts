import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from "class-validator";
import { ConfirmBookingDto } from "./confirm.booking.dto";

export class GuestBookingDto extends ConfirmBookingDto {

    /**
     * Checkout started as a single "email or mobile" box, so `identifier` is
     * still accepted: bookings already in flight, and the broker/API callers,
     * send it. The three named fields below are what the web form posts now.
     */
    @ApiPropertyOptional({ example: '+212655585859 or someone@example.com' })
    @IsOptional()
    @IsString({ message: 'Please enter your email address or mobile number.' })
    // Every message here is customer-facing: class-validator surfaces whichever
    // rule fails, and "identifier must be shorter than or equal to 62
    // characters" is not something to show someone booking a car.
    @MaxLength(62, { message: 'Please enter a valid email address or mobile number.' })
    identifier?: string;

    @ApiPropertyOptional({ example: 'Youssef El Amrani' })
    @IsOptional()
    @IsString({ message: 'Please enter your full name.' })
    @MaxLength(80, { message: 'Please enter your full name.' })
    full_name?: string;

    @ApiPropertyOptional({ example: '212' })
    @IsOptional()
    @IsString()
    // Digits only, with or without the leading +. Anything else is a typo, and a
    // bad dialling code means the confirmation SMS silently goes nowhere.
    @Matches(/^\+?\d{1,4}$/, { message: 'Please select a valid country code.' })
    phone_code?: string;

    @ApiPropertyOptional({ example: '655585859' })
    @IsOptional()
    @IsString({ message: 'Please enter your mobile number.' })
    @Matches(/^\d[\d\s-]{5,17}$/, { message: 'Please enter a valid mobile number.' })
    phone_number?: string;

    @ApiPropertyOptional({ example: 'someone@example.com' })
    @IsOptional()
    @IsEmail({}, { message: 'Please enter a valid email address.' })
    @MaxLength(120, { message: 'Please enter a valid email address.' })
    email?: string;
}

import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsString, IsEnum, IsNumber, Min, IsEmail, Validate } from "class-validator";
import { Offer } from "src/entities/offer.entity";
import { IsExists } from "src/validators/exists.validator";


export class OfferEnquiryDto {

    @IsNotEmpty()
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    first_name: string

    @IsNotEmpty()
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    last_name: string

    @IsNotEmpty()
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    phone_code: string

    @IsNotEmpty()
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    phone_number: string

    @IsNotEmpty()
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    @ApiProperty()
    email: string

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @Validate(IsExists, [Offer, 'id'])
    @ApiProperty()
    offer_id: number

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    address: string

}

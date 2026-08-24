import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsString, IsNumber, Min, IsEmail, Validate, IsOptional } from "class-validator";
import { Car } from "src/entities/car.entity";
import { City } from "src/entities/city.entity";
import { IsExists } from "src/validators/exists.validator";


export class EdcEnquiryDto {

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'Full name of the EDC member' })
    name: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'Phone country code', example: '971' })
    phone_code: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'Phone number without country code', example: '501234567' })
    phone_number: string

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    @ApiProperty({ description: 'Email address' })
    email: string

    @IsOptional()
    @IsString()
    @ApiProperty({ description: 'EDC Student/Staff ID', required: false })
    edc_student_id: string

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @Validate(IsExists, [Car, 'id'])
    @ApiProperty({ description: 'Car ID to enquire about' })
    car_id: number

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ description: 'Duration in months (1, 3, 6, 9, or 12)', example: 3 })
    duration: number

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @Validate(IsExists, [City, 'id'])
    @ApiProperty({ description: 'City ID' })
    city_id: number

    @IsString()
    @IsOptional()
    @ApiProperty({ description: 'Additional details or notes', required: false })
    details: string

    @IsString()
    @IsOptional()
    @ApiProperty({ description: 'Promo code if any', required: false, example: 'EDCVIP2025' })
    promo_code: string
}






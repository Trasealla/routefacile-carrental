import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsString, IsEnum, IsNumber, Min, IsEmail, Validate, IsOptional } from "class-validator";
import { Car } from "src/entities/car.entity";
import { City } from "src/entities/city.entity";
import { EnquiryTypes } from "src/entities/enums/enquiry.type";
import { EnquiryDurations } from "src/entities/enums/enquiry.duration";
import { IsExists } from "src/validators/exists.validator";

export class EnquiryDto {

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

    @IsString()
    @IsNotEmpty()
    @IsEnum(EnquiryTypes)
    @ApiProperty({ example: 'individual or corporate' })
    type: string

    @IsString()
    @IsNotEmpty()
    @IsEnum(EnquiryDurations)
    @ApiProperty({ example: 'daily or weekly or monthly or yearly' })
    duration: string

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @Validate(IsExists, [Car, 'id'])
    @ApiProperty()
    car_id: number

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @Validate(IsExists, [City, 'id'])
    @ApiProperty()
    city_id: number

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    detail: string
}

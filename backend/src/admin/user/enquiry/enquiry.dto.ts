import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsString, IsEnum, IsNumber, Min, IsEmail, Validate, IsOptional } from "class-validator";
import { PaginationDto } from "src/dtos/pagination.dto";
import { City } from "src/entities/city.entity";
import { EnquiryTypes } from "src/entities/enums/enquiry.type";
import { EnquiryDurations } from "src/entities/enums/enquiry.duration";
import { IsExists } from "src/validators/exists.validator";
import { Car } from "src/entities/car.entity";

export class EnquiryDto extends PaginationDto{


    @IsString()
    @IsEmail()
    @ApiProperty()
    @IsOptional()
    email: string

    @IsString()
    @IsEnum(EnquiryTypes)
    @ApiProperty({ example: 'individual or corporate' })
    @IsOptional()
    type: string

    @IsString()
    @IsEnum(EnquiryDurations)
    @ApiProperty({ example: 'daily or weekly or monthy or yearly' })
    @IsOptional()
    duration: string


    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @Validate(IsExists, [City, 'id'])
    @IsOptional()
    @ApiProperty()
    city_id: number

    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @Validate(IsExists, [Car, 'id'])
    @IsOptional()
    @ApiProperty()
    car_id: number
}

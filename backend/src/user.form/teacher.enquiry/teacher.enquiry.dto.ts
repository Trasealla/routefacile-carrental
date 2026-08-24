import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsString, IsNumber, Min, IsEmail, Validate, IsOptional } from "class-validator";
import { Car } from "src/entities/car.entity";
import { City } from "src/entities/city.entity";
import { IsExists } from "src/validators/exists.validator";


export class TeacherEnquiryDto {

    @IsNotEmpty()
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    name: string

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
    @Validate(IsExists, [Car, 'id'])
    car_id: number

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ example: '1, 3, 6 or 9' })
    duration: number

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @Validate(IsExists, [City, 'id'])
    @ApiProperty()
    city_id: number

    @IsString()
    @IsOptional()
    @ApiProperty()
    details: string

}

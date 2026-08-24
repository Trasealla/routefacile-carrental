import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsString, IsNumber, Min, IsEmail, Validate } from "class-validator";
import { City } from "src/entities/city.entity";
import { IsExists } from "src/validators/exists.validator";


export class LostFoundRequestDto {

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @IsNotEmpty()
    first_name: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @IsNotEmpty()
    last_name: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @IsNotEmpty()
    phone_code: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @IsNotEmpty()
    phone_number: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email: string

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @Validate(IsExists, [City, 'id'])
    city_id: number

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    detail: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    reference_number: string
}

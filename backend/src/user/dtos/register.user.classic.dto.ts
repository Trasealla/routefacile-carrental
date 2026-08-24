import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, IsEnum, IsDateString, ValidateIf, Validate, MinLength } from "class-validator";
import { Country } from "src/entities/country.entity";
import { City } from "src/entities/city.entity";
import { Genders } from "src/entities/enums/gender";
import { IsExists } from "src/validators/exists.validator";
import { RegisterUserDto } from "./register.user.dto";

export class RegisterUserClassicDto extends RegisterUserDto {

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    password?: string

    @ApiProperty({example: 'male or female'})
    @IsString()
    @IsNotEmpty()
    @IsEnum(Genders)
    gender: string

    @ApiProperty()
    @ApiProperty({example: 'YYYY-MM-DD'})
    @IsNotEmpty()
    @IsDateString({ strict: true }, { message: 'Date of birth must be in the format YYYY-MM-DD' })
    dob: string;

    @ApiProperty()
    @IsNotEmpty()
    @Type(() => Number)
    @Validate(IsExists, [Country, 'id'])
    country_id: number

    @ApiProperty()
    @IsNotEmpty()
    @ValidateIf(o => o.country_id === 229) // uae
    @Validate(IsExists, [City, 'id'])
    city_id: number

    register_otp: number
}
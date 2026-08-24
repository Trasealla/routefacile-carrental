import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, Validate } from "class-validator";
import { Country } from "src/entities/country.entity";
import { User } from "src/entities/user.entity";
import { IsExists } from "src/validators/exists.validator";
import { IsUnique } from "src/validators/unique.validator";

export class RegisterUserDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    first_name: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    last_name: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => value?.replace('+', ''))
    @Validate(IsExists, [Country, 'phone_code'])
    phone_code: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    phone_number: string

    @ApiProperty()
    @IsString()
    @Validate(IsUnique, [User, 'email'])
    email: string

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    password?: string

    confirm_password: string

    status: number

    password_org: string

    // register_otp: number
}
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsEnum, IsDateString, ValidateIf, IsEmail, IsStrongPassword, Validate } from "class-validator";
import { User } from "src/entities/user.entity";
import { IsExists } from "src/validators/exists.validator";


export class ActiveUserDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    register_otp: number

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    @Validate(IsExists, [User, 'email'])
    email: string
}
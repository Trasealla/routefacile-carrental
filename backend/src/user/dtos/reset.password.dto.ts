import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsEnum, IsEmail, Validate, IsStrongPassword } from "class-validator";
import { User } from "src/entities/user.entity";
import { IsExists } from "src/validators/exists.validator";
import { Match } from "src/validators/match.validator";

export class ResetPasswordDto {
    
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    @Validate(IsExists, [User, 'email'])
    email: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    password: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @Validate(Match, ['password'])
    confirm_password: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    otp: string
}
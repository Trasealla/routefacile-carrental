import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsEnum, IsEmail, Validate, IsStrongPassword } from "class-validator";
import { Match } from "src/validators/match.validator";

export class ChangePasswordDto {

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    current_password: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @IsStrongPassword()
    password: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @Validate(Match, ['password'])
    confirm_password: string
}
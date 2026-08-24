import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsEmail, Validate } from "class-validator";
import { User } from "src/entities/user.entity";
import { IsExists } from "src/validators/exists.validator";

export class ForgotPasswordDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    @Validate(IsExists, [User, 'email'])
    email: string
}
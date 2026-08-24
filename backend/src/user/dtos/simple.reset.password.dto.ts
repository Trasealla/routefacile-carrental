import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsEmail, IsStrongPassword } from "class-validator";

export class SimpleResetPasswordDto {
    
    @ApiProperty({
        description: 'User email address',
        example: 'user@example.com'
    })
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email: string

    @ApiProperty({
        description: 'New password',
        example: 'NewPassword123!'
    })
    @IsNotEmpty()
    @IsString()
    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    })
    password: string
}









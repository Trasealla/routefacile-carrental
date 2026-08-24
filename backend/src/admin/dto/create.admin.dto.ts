import { IsNotEmpty, IsString, IsEmail } from "class-validator";

export class CreateAdminDto {

    @IsString()
    @IsNotEmpty()
    first_name: string

    @IsString()
    @IsNotEmpty()
    last_name: string

    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email: string

    @IsString()
    @IsNotEmpty()
    password: string

    @IsString()
    @IsNotEmpty()
    country_code: string

    @IsString()
    @IsNotEmpty()
    phone_number: string

    type: string

    status: number
}
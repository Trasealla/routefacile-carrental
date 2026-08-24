import { IsNotEmpty, IsString, IsEmail, IsOptional } from "class-validator";

export class CreateHrAdminDto {

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
    country_code: string

    @IsString()
    @IsNotEmpty()
    phone_number: string

    @IsString()
    @IsNotEmpty()
    type: string

    @IsOptional()
    password?: string

    status?: number
}

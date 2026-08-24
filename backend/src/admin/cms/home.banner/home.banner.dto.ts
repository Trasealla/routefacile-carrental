import { IsNotEmpty, IsString, IsEmail, IsOptional } from "class-validator";

export class HomeBannerDto {

    @IsString()
    @IsOptional()
    alt_text: string

    @IsString()
    @IsOptional()
    link: string

    order: number

    mobile: string

    desktop: string

    status: number

    created_by: number

    updated_by: number
}
import { IsNotEmpty, IsString, IsEmail, IsOptional, IsEnum } from "class-validator";
import { AwardCertificateTypes } from "src/entities/enums/award.certificate.type";

export class AwardCertificateDto {

    @IsNotEmpty()
    @IsString()
    @IsEnum(AwardCertificateTypes)
    type: string

    @IsNotEmpty()
    @IsString()
    title_en: string

    @IsNotEmpty()
    @IsString()
    title_ar: string

    @IsNotEmpty()
    @IsString()
    description_en: string

    @IsNotEmpty()
    @IsString()
    description_ar: string

    @IsNotEmpty()
    @IsString()
    link: string

    @IsNotEmpty()
    @IsString()
    alt_text: string

    mobile: string

    desktop: string

    status: number

    created_by: number

    updated_by: number
}
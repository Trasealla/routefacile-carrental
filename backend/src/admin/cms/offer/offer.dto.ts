import { Type } from "class-transformer";
import { IsNotEmpty, IsString, IsEmail, IsOptional, IsDateString, IsNumber, Validate, IsEnum } from "class-validator";
import { City } from "src/entities/city.entity";
import { BasicStatusTypes } from "src/entities/enums/basic.status.type";
import { IsExists } from "src/validators/exists.validator";

export class OfferDto {

    @IsString()
    @IsNotEmpty()
    title_en: string

    @IsString()
    @IsNotEmpty()
    title_ar: string

    @IsString()
    @IsNotEmpty()
    title_fr: string

    @IsString()
    @IsNotEmpty()
    description_en: string

    @IsString()
    @IsNotEmpty()
    description_ar: string

    @IsString()
    @IsNotEmpty()
    description_fr: string

    @IsNotEmpty()
    @IsDateString({ strict: true }, { message: 'start_date must be in the format YYYY-MM-DD' })
    start_date: string;

    @IsNotEmpty()
    @IsDateString({ strict: true }, { message: 'end_date must be in the format YYYY-MM-DD' })
    end_date: string;

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    @Validate(IsExists, [City, 'id'])
    city_id: number

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    @IsEnum(BasicStatusTypes)
    status: number

    @IsNotEmpty()
    @IsEnum(BasicStatusTypes)
    @IsNumber()
    @Type(() => Number)
    featured: number

    mobile: string

    desktop: string

    created_by: number

    updated_by: number

    @IsString()
    @IsOptional()
    seo_meta_tags_en: string

    @IsString()
    @IsOptional()
    seo_meta_tags_ar: string

    @IsString()
    @IsOptional()
    seo_meta_tags_fr: string

    @IsString()
    @IsOptional()
    seo_meta_description_en: number

    @IsString()
    @IsOptional()
    seo_meta_description_ar: string

    @IsString()
    @IsOptional()
    seo_meta_description_fr: string
}
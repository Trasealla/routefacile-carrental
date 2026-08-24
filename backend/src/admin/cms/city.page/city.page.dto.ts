import { IsNotEmpty, IsString, IsEmail, IsOptional, IsEnum, Validate, IsArray, ArrayNotEmpty, ArrayMinSize } from "class-validator";
import { City } from "src/entities/city.entity";

import { CityPageTypes } from "src/entities/enums/city.page.type";
import { IsExists } from "src/validators/exists.validator";

export class CityPageDto {

    @IsString()
    @IsNotEmpty()
    @IsEnum(CityPageTypes)
    type: string

    @IsString()
    @IsNotEmpty()
    title_en: string

    @IsString()
    @IsNotEmpty()
    title_ar: string

    @IsString()
    @IsNotEmpty()
    content_en: string

    @IsString()
    @IsNotEmpty()
    content_ar: string

    @IsString()
    @IsNotEmpty()
    status: number

    @IsString()
    @IsNotEmpty()
    @Validate(IsExists, [City, 'id'])
    city_id: number

    image: string
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
    seo_meta_description_en: number

    @IsString()
    @IsOptional()
    seo_meta_description_ar: string
}
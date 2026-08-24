import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Validate } from "class-validator";
import { City } from "src/entities/city.entity";
import { BasicStatusTypes } from "src/entities/enums/basic.status.type";

import { IsExists } from "src/validators/exists.validator";

export class PageDto {

    @IsString()
    @IsNotEmpty()
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

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    @IsEnum(BasicStatusTypes)
    status: number

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
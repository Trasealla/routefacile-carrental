import { Type } from "class-transformer";
import { IsNotEmpty, IsString, IsEmail, IsOptional, IsEnum, Validate, IsArray, ArrayNotEmpty, ArrayMinSize, IsNumber } from "class-validator";
import { BlogCategory } from "src/entities/blog.category.entity";
import { BlogTag } from "src/entities/blog.tag.entity";
import { BasicStatusTypes } from "src/entities/enums/basic.status.type";
import { BlogTypes } from "src/entities/enums/blog.type";
import { IsExists } from "src/validators/exists.validator";

export class BlogDto {

    @IsString()
    @IsEnum(BlogTypes)
    type: string

    @IsString()
    @IsNotEmpty()
    title_en: string

    @IsString()
    @IsNotEmpty()
    title_ar: string

    @IsString()
    @IsOptional()
    title_fr: string

    @IsString()
    @IsNotEmpty()
    description_en: string

    @IsString()
    @IsNotEmpty()
    description_ar: string

    @IsString()
    @IsOptional()
    description_fr: string

    @IsString()
    @IsOptional()
    excerpt_en: string

    @IsString()
    @IsOptional()
    excerpt_ar: string

    @IsString()
    @IsOptional()
    excerpt_fr: string

    @IsNotEmpty()
    @IsEnum(BasicStatusTypes)
    @IsNumber()
    @Type(() => Number)
    status: number

    @IsNotEmpty()
    @IsEnum(BasicStatusTypes)
    @IsNumber()
    @Type(() => Number)
    featured: number

    image: string
    created_by: number

    slug: string
    updated_by: number

    @IsString()
    @IsOptional()
    author: string

    @IsString()
    @IsOptional()
    publish_date: string

    @IsString()
    @IsOptional()
    image_alt: string

    @IsString()
    @IsOptional()
    image_caption: string

    @IsArray()
    @ArrayNotEmpty()
    @ArrayMinSize(1)
    @Validate(IsExists, [BlogTag, 'id'], { each: true })
    tag_ids: number[]

    @IsArray()
    @ArrayNotEmpty()
    @ArrayMinSize(1)
    @Validate(IsExists, [BlogCategory, 'id'], { each: true })
    category_ids: number[]

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
    seo_meta_description_en: string

    @IsString()
    @IsOptional()
    seo_meta_description_ar: string

    @IsString()
    @IsOptional()
    seo_meta_description_fr: string
}
import { Type } from "class-transformer";
import { IsNotEmpty, IsString, IsOptional, IsDateString, IsNumber, IsEnum } from "class-validator";
import { BasicStatusTypes } from "src/entities/enums/basic.status.type";

export class PromoTickerDto {

    @IsString()
    @IsNotEmpty()
    text_en: string

    @IsString()
    @IsNotEmpty()
    text_ar: string

    @IsString()
    @IsOptional()
    description_en: string

    @IsString()
    @IsOptional()
    description_ar: string

    @IsString()
    @IsOptional()
    link: string

    @IsNotEmpty()
    @IsDateString({ strict: true }, { message: 'start_date must be in the format YYYY-MM-DD' })
    start_date: string;

    @IsNotEmpty()
    @IsDateString({ strict: true }, { message: 'end_date must be in the format YYYY-MM-DD' })
    end_date: string;

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    @IsEnum(BasicStatusTypes)
    status: number

    @IsNumber()
    @Type(() => Number)
    @IsOptional()
    sort_order: number

    @IsNumber()
    @Type(() => Number)
    @IsOptional()
    scroll_speed: number

    created_by: number

    updated_by: number
}


import { Type } from "class-transformer";
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsString, Validate } from "class-validator";
import { BasicStatusTypes } from "src/entities/enums/basic.status.type";

export class CareerJobDto {

    @IsString()
    @IsNotEmpty()
    title_en: string

    @IsString()
    @IsNotEmpty()
    title_ar: string

    @IsString()
    @IsNotEmpty()
    description_en: string

    @IsString()
    @IsNotEmpty()
    description_ar: string

    @IsNotEmpty()
    @IsDateString({ strict: true }, { message: 'format must be in the format YYYY-MM-DD' })
    expiry_date: string

    @IsString()
    @IsNotEmpty()
    location_en: string

    @IsString()
    @IsNotEmpty()
    location_ar: string

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    experience_years: number

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    @IsEnum(BasicStatusTypes)
    status: number

    created_by: number
    updated_by: number
}
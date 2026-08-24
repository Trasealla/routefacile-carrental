import { Type } from "class-transformer"
import { IsEnum, IsNotEmpty, IsNumber } from "class-validator"
import { BasicStatusTypes } from "src/entities/enums/basic.status.type"

export class CarCategoryDto {
    @IsNotEmpty()
    name_en: string

    @IsNotEmpty()
    name_ar: string

    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    @IsEnum(BasicStatusTypes)
    status: number

    image: string
    created_by: number
    updated_by: number
}
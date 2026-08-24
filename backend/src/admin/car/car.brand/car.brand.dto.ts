import { IsEnum, IsNotEmpty } from "class-validator"
import { BasicStatusTypes } from "src/entities/enums/basic.status.type"

export class CarBrandDto {
    @IsNotEmpty()
    name_en: string

    @IsNotEmpty()
    name_ar: string

    image: string

    @IsNotEmpty()
    // @IsEnum(BasicStatusTypes)
    status: number

    created_by: number
    updated_by: number
}
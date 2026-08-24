import { IsEnum, IsNotEmpty } from "class-validator"
import { BasicStatusTypes } from "src/entities/enums/basic.status.type"

export class CarTagDto {
    @IsNotEmpty()
    name_en: string

    @IsNotEmpty()
    name_ar: string

    @IsNotEmpty()
    @IsEnum(BasicStatusTypes)
    status: string

    created_by: number
    updated_by: number
}
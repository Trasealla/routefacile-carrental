import { IsEnum, IsNotEmpty, IsNumber, Validate } from "class-validator"
import { BasicStatusTypes } from "src/entities/enums/basic.status.type"
import { FaqCategory } from "src/entities/faq.category.entity"
import { IsExists } from "src/validators/exists.validator"

export class FaqDto {
    @IsNotEmpty()
    question_en: string

    @IsNotEmpty()
    question_ar: string

    @IsNotEmpty()
    answer_en: string

    @IsNotEmpty()
    answer_ar: string

    @IsNotEmpty()
    @IsNumber()
    @Validate(IsExists, [FaqCategory, 'id'])
    category_id: number

    @IsNotEmpty()
    @IsNumber()
    @IsEnum(BasicStatusTypes)
    status: number

    created_by: number
    updated_by: number
}
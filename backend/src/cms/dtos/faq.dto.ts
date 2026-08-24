import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, Validate } from "class-validator";
import { PaginationDto } from "src/dtos/pagination.dto";
import { FaqCategory } from "src/entities/faq.category.entity";
import { IsExists } from "src/validators/exists.validator";

export class FaqDto extends PaginationDto {

    @ApiProperty({
        title: 'FAQ category id',
        format: 'int32',
        required: false
    })
    @Validate(IsExists, [FaqCategory, 'id'])
    @IsOptional()
    faq_category_id: number
}
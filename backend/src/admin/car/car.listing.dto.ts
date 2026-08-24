import { ApiProperty } from "@nestjs/swagger"
import { IsOptional, Validate } from "class-validator"
import { PaginationDto } from "src/dtos/pagination.dto"
import { CarCategory } from "src/entities/car.category.entity"
import { CarGroup } from "src/entities/car.group.entity"
import { IsExists } from "src/validators/exists.validator"


export class CarListingDto extends PaginationDto{
    @ApiProperty({
        minimum: 1,
        title: 'CarGroup',
        format: 'int32',
        required: false,
    })
    @IsOptional()
    @Validate(IsExists, [CarGroup, 'id'])
    group_id: number

    @ApiProperty({
        minimum: 1,
        title: 'CarCategory',
        format: 'int32',
        required: false,
    })
    @IsOptional()
    @Validate(IsExists, [CarCategory, 'id'])
    category_id: number

    @ApiProperty({
        minimum: 1,
        title: 'name',
        format: 'int32',
        required: false,
    })
    @IsOptional()
    name_en: string
}
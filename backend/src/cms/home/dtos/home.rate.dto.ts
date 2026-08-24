import { ApiProperty } from "@nestjs/swagger";
import { Validate } from "class-validator";
import { PaginationDto } from "src/dtos/pagination.dto";
import { CarCategory } from "src/entities/car.category.entity";
import { City } from "src/entities/city.entity";
import { IsExists } from "src/validators/exists.validator";

export class HomeRateDto extends PaginationDto {

    @ApiProperty({
        minimum: 1,
        maximum: 7,
        title: 'City id',
        exclusiveMaximum: true,
        exclusiveMinimum: true,
        format: 'int32',
        default: 1,
        required: false
    })
    @Validate(IsExists, [City, 'id'])
    city_id: number;

    @ApiProperty({
        minimum: 1,
        title: 'Category id',
        required: false
    })
    @Validate(IsExists, [CarCategory, 'id'])
    category_id: number;
}
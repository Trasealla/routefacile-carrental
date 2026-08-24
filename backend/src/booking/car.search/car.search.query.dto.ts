import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, Validate } from "class-validator";
import { PaginationDto } from "src/dtos/pagination.dto";
import { CarCategory } from "src/entities/car.category.entity";
import { Car } from "src/entities/car.entity";
import { SortTypes } from "src/entities/enums/sort.type";
import { IsExists } from "src/validators/exists.validator";


export class CarSearchQueryDto extends PaginationDto {

    @ApiProperty({
        default: SortTypes.ASC,
        required: false,
    })
    @IsOptional()
    @IsEnum(SortTypes)
    sort: string;

    @ApiProperty({
        required: false
    })
    @IsOptional()
    @Validate(IsExists, [CarCategory, 'id'])
    category_id: number;

    @ApiProperty({
        required: false
    })
    @IsOptional()
    @Validate(IsExists, [Car, 'id'])
    car_id: number;

    @ApiProperty({
        required: false
    })
    @IsOptional()
    monthly_mileage: number

}
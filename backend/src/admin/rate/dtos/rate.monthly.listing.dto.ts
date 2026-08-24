import { ApiProperty } from "@nestjs/swagger";
import { Validate } from "class-validator";
import { PaginationDto } from "src/dtos/pagination.dto";
import { Car } from "src/entities/car.entity";
import { CarGroup } from "src/entities/car.group.entity";
import { City } from "src/entities/city.entity";
import { IsExists } from "src/validators/exists.validator";

export class RateMonthlyListingDto extends PaginationDto{

    @ApiProperty({
        minimum: 1,
        title: 'Car id',
        format: 'int32',
        required: false
    })
    @Validate(IsExists, [Car, 'id'])
    car_id: number;

    @ApiProperty({
        minimum: 1,
        title: 'Group id',
        format: 'int32',
        required: false
    })
    @Validate(IsExists, [CarGroup, 'id'])
    group_id: number;

    @ApiProperty({
        minimum: 1,
        title: 'City id',
        format: 'int32',
        required: false
    })
    @Validate(IsExists, [City, 'id'])
    city_id: number;

    @ApiProperty({
        minimum: 1,
        title: 'Year',
        format: 'int32',
        required: false
    })
    year: number;

    @ApiProperty({
        minimum: 1,
        maximum: 12,
        title: 'Month',
        format: 'int32',
        required: false
    })
    month: number;

    @ApiProperty({
        minimum: 2000,
        maximum: 2100,
        title: 'Model Year (Vehicle Year)',
        format: 'int32',
        required: false
    })
    model_year: number;
}

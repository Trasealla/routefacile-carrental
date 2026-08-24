
import { ApiProperty } from "@nestjs/swagger";
import { Validate } from "class-validator";
import { PaginationDto } from "src/dtos/pagination.dto";
import { CarBrand } from "src/entities/car.brand.entity";
import { CarCategory } from "src/entities/car.category.entity";
import { CarFuelType } from "src/entities/car.fuel.type.entity";
import { CarGroup } from "src/entities/car.group.entity";
import { CarTag } from "src/entities/car.tag.entity";
import { CarTransmission } from "src/entities/car.transmission.entity";
import { City } from "src/entities/city.entity";
import { IsExists } from "src/validators/exists.validator";


export class CarListingDto extends PaginationDto{
    @ApiProperty({
        title: 'Category id',
        format: 'int32',
        required: false
    })
    @Validate(IsExists, [CarCategory, 'id'])
    category_id: number

    @ApiProperty({
        title: 'Transmission id',
        format: 'int32',
        required: false
    })
    @Validate(IsExists, [CarTransmission, 'id'])
    transmission_id: number

    @ApiProperty({
        title: 'Tag id',
        format: 'int32',
        required: false
    })
    @Validate(IsExists, [CarTag, 'id'])
    tag_id: number

    @ApiProperty({
        title: 'Group id',
        format: 'int32',
        required: false
    })
    @Validate(IsExists, [CarGroup, 'id'])
    group_id: number

    @ApiProperty({
        title: 'Brand id',
        format: 'int32',
        required: false
    })
    @Validate(IsExists, [CarBrand, 'id'])
    brand_id: number

    @ApiProperty({
        title: 'Fuel type id',
        format: 'int32',
        required: false
    })
    @Validate(IsExists, [CarFuelType, 'id'])
    fuel_type_id: number

    @ApiProperty({
        title: 'City id - Apply Special Rates image for this city',
        format: 'int32',
        required: false,
        description: 'When provided, cars with special_rates_cities configured for this city (or all) will have their main image replaced with the special_rates_image. Response includes has_special_rate: true for these cars.'
    })
    @Validate(IsExists, [City, 'id'])
    city_id: number
}